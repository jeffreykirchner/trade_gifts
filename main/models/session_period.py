'''
session period model
'''

import logging
import math

from decimal import Decimal

from django.db import models
from django.db import transaction

from django.core.serializers.json import DjangoJSONEncoder

from main.models import Session

from main.globals import round_half_away_from_zero

import main

class SessionPeriod(models.Model):
    '''
    session period model
    '''
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="session_periods")

    period_number = models.IntegerField()                       #period number from 1 to N

    production_completed = models.BooleanField(default=False)   #production completed for this period
    consumption_completed = models.BooleanField(default=False)  #consumption completed for this period
    growth_completed = models.BooleanField(default=False)       #patch growth completed for this period

    timer_actions = models.JSONField(encoder=DjangoJSONEncoder, null=True, blank=True)   #timer actions for this period

    summary_data = models.JSONField(encoder=DjangoJSONEncoder, null=True, blank=True, verbose_name="Summary Data")       #summary data for session period

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id}"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['session', 'period_number'], name='unique_SD')
        ]
        verbose_name = 'Session Period'
        verbose_name_plural = 'Session Periods'
        ordering = ['period_number']

    def start(self):
        '''
        do start actions
        '''
        self.timer_actions = {}

        for i in range(self.session.parameter_set.period_length):
            self.timer_actions[i+1] = {"metabolism" : False}

        self.save()

    def do_timer_actions(self, time_remaining, world_state, parameter_set):
        '''
        do timer actions
        '''
        # parameter_set = self.session.parameter_set.json()
        # world_state = self.session.world_state
        summary_data = self.summary_data

        cents_per_second = parameter_set["cents_per_second"]

        id = str(self.id)

        #metabolism
        health_loss_count = 0
        health_loss_per_second = Decimal(parameter_set["health_loss_per_second"])
        heath_gain_per_sleep_second = Decimal(parameter_set["heath_gain_per_sleep_second"])

        for i in self.timer_actions:
            if int(i) >= time_remaining and \
               not self.timer_actions[i]["metabolism"] and \
               int(i) <= parameter_set["period_length"]:
                
                self.timer_actions[i]["metabolism"] = True
                health_loss_count += 1
        
        if health_loss_count > 0:
            for i in world_state["avatars"]:

                #data
                temp_s =  summary_data[i]

                #earnings
                avatar = world_state["avatars"][i]
                
                earnings_per_second = Decimal(avatar["health"]) * Decimal(cents_per_second)
                earnings_per_second *= health_loss_count

                avatar["earnings"] = str(Decimal(avatar["earnings"]) + earnings_per_second)

                #summary data
                temp_s["period_earnings"] = str(Decimal(temp_s["period_earnings"]) + earnings_per_second)
                    
                current_health = Decimal(avatar["health"])
                
                if avatar["sleeping"] and world_state["time_remaining"] <= parameter_set["night_length"]:    
                    total_sleep_benefit = (heath_gain_per_sleep_second * health_loss_count)     

                    avatar["health"] = str(current_health + total_sleep_benefit)
                    temp_s["health_from_sleep"] = str(Decimal(temp_s["health_from_sleep"]) + total_sleep_benefit)

                    if Decimal(avatar["health"]) > 100:
                        sleep_health_overage = Decimal(avatar["health"]) - 100
                        avatar["health"] = "100"

                        temp_s["health_from_sleep"] = str(Decimal(temp_s["health_from_sleep"]) - sleep_health_overage)

                else:
                    avatar["health"] = str(current_health - (health_loss_count * health_loss_per_second))

                    if Decimal(avatar["health"]) < 0:
                        avatar["health"] = "0"

            self.save()
            # self.session.save()
        
        return world_state

    def do_consumption(self, world_state, parameter_set):
        '''
        convert health into cash earnings
        '''

        if self.consumption_completed:
            return world_state

        world_state = self.do_timer_actions(0, world_state, parameter_set)

        current_period_id = self.id
        summary_data = self.summary_data

        #clear avatar inventory
        for i in world_state["avatars"]:
            avatar = world_state["avatars"][i]

            for i in main.globals.Goods.choices:
                good = i[0]
                avatar[good] = 0

        #convert goods in homes to cash
        for i in world_state["houses"]:
            
            house = world_state["houses"][i]
            session_player_id = str(house["session_player"])
            avatar = world_state["avatars"][session_player_id]

            avatar["health"] = str(Decimal(avatar["health"]) + Decimal(house["health_value"]))

            summary_data[session_player_id]["health_from_house"] = house["health_value"]
            summary_data[session_player_id]["health_generated_by_house"] = house["health_value"]

            if Decimal(avatar["health"]) > 100:
                health_overage = Decimal(avatar["health"]) - 100
                summary_data[session_player_id]["health_from_house"] = str(Decimal(summary_data[session_player_id]["health_from_house"]) - health_overage)
                
                avatar["health"] = "100"
           
            avatar["sleeping"] = False

            house["health_consumed"] = house["health_value"]
            house["health_value"] = 0

            for j in main.globals.Goods.choices:
                good = j[0]
                house[good] = 0
        
        self.consumption_completed = True
        self.save()

        world_state["session_periods"][str(self.id)]["consumption_completed"]=True

        return world_state
    
    def do_production(self, world_state, parameter_set):
        '''
        do production for this period
        '''

        logger = logging.getLogger(__name__)
        # logger.info(f"do_production {self.id}")

        if self.production_completed:
            return world_state
        
        #if no fields, return
        if len(world_state["fields"]) == 0:
            self.production_completed = True
            self.save()
            return world_state

        # parameter_set = self.session.parameter_set.json()
        # world_state = self.session.world_state
        current_period = world_state["current_period"]
        last_period_id = None

        if self.period_number > 1:
            last_period_id = self.session.session_periods.get(period_number=self.period_number-1).id

        for i in world_state["fields"]:
            
            obj = world_state["fields"][str(i)]
            field_type = parameter_set["parameter_set_field_types"][str(obj["parameter_set_field_type"])]

            if current_period >= field_type["start_on_period"]:

                #update in-use effort
                if (current_period - field_type["start_on_period"] + 1)  % int(field_type["reset_every_n_periods"]) == 1:
                    obj["good_one_effort_in_use"] = obj["good_one_effort"]
                    obj["good_two_effort_in_use"] = obj["good_two_effort"]

                g1 = Decimal(field_type["good_one_rho"]) * (Decimal(field_type["good_one_alpha"]) * Decimal(obj["good_one_effort_in_use"]) ** Decimal(field_type["good_one_omega"]))
                g2 = Decimal(field_type["good_two_rho"]) * (Decimal(field_type["good_two_alpha"]) * Decimal(obj["good_two_effort_in_use"]) ** Decimal(field_type["good_two_omega"]))
                
                if last_period_id:                   
                    if (current_period - field_type["start_on_period"] + 1)  % int(field_type["reset_every_n_periods"]) != 1:

                        good_one_harvest_total = 0
                        good_two_harvest_total = 0

                        for j in obj["harvest_history"][str(last_period_id)]:
                            good_one_harvest_total += j[field_type["good_one_ft"]]
                            good_two_harvest_total += j[field_type["good_two_ft"]]

                        g1 -= good_one_harvest_total
                        g2 -= good_two_harvest_total

                        g1 /= Decimal(field_type["good_one_rho"])
                        g2 /= Decimal(field_type["good_two_rho"])

                if g1 < 0:
                    g1 = 0
                if g2 < 0:
                    g2 = 0

                obj[field_type["good_one_ft"]] = math.floor(g1)
                obj[field_type["good_two_ft"]] = math.floor(g2)
            else:
                obj[field_type["good_one_ft"]] = 0
                obj[field_type["good_two_ft"]] = 0

            
            # for j in main.globals.Goods.choices:
            #     session.world_state["fields"][obj][j[0]] = 1

        self.production_completed = True
        self.save()

        # self.session.save()

        # logger.info(f"do_production {self.id}")
        
        return world_state
    
    def do_patch_growth(self, world_state, parameter_set):
        '''
        do patch growth for this period
        '''
        logger = logging.getLogger(__name__)
        
        # world_state = self.session.world_state

        #check if growth completed
        if self.growth_completed:
            return world_state
        
        #if no patches, return
        if len(world_state["patches"]) == 0:
            self.growth_completed = True
            self.save()
            return world_state
        

        #update patches
        for i in world_state["patches"]:
            patch = world_state["patches"][str(i)]

            #check if shock
            if world_state["current_period"] == patch["shock_on_period"]:
                patch["levels"] = patch["shock_levels"]
                patch["max_levels"] = len(patch["levels"])

            for j in patch["levels"]:
                if int(j) > patch["max_levels"]:
                    break

                level = patch["levels"][str(j)]
                if level["harvested"]:
                    level["harvested"] = False
                    break
        
        #reset avatar patch harvests
        for i in world_state["avatars"]:
            avatar = world_state["avatars"][str(i)]
            avatar["period_patch_harvests"] = 0
            avatar["period_patch_harvests_ids"] = []

        return world_state

    def json(self):
        '''
        json object of model
        '''

        return{
            "id" : self.id,
            "period_number" : self.period_number,
            "production_completed" : self.production_completed,
            "consumption_completed" : self.consumption_completed,
            "timer_actions" : self.timer_actions,
        }
        