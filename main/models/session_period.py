'''
session period model
'''

import logging
import math

from decimal import Decimal

from django.db import models
from django.db import transaction

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
    
    def do_consumption(self):
        '''
        convert health into cash earnings
        '''

        #clear avatar inventory
        for i in self.session.world_state["avatars"]:
            avatar = self.session.world_state["avatars"][i]

            for i in main.globals.Goods.choices:
                good = i[0]
                avatar[good] = 0

        #convert goods in homes to cash
        
        self.consumption_completed = True
        self.save()

        self.session.world_state["session_periods"][str(self.id)]["consumption_completed"]=True
        self.session.save()

        return self.session
    
    def do_production(self):
        '''
        do production for this period
        '''

        logger = logging.getLogger(__name__)
        # logger.info(f"do_production {self.id}")

        parameter_set = self.session.parameter_set.json()
        world_state = self.session.world_state
        current_period = world_state["current_period"]
        last_period_id = None

        if self.period_number > 1:
            last_period_id = self.session.session_periods.get(period_number=self.period_number-1).id

        for i in self.session.world_state["fields"]:
            
            obj = self.session.world_state["fields"][str(i)]
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
                            good_one_harvest_total += j[field_type["good_one"]]
                            good_two_harvest_total += j[field_type["good_two"]]

                        g1 -= good_one_harvest_total
                        g2 -= good_two_harvest_total

                        g1 /= Decimal(field_type["good_one_rho"])
                        g2 /= Decimal(field_type["good_two_rho"])

                if g1 < 0:
                    g1 = 0
                if g2 < 0:
                    g2 = 0

                obj[field_type["good_one"]] = math.floor(g1)
                obj[field_type["good_two"]] = math.floor(g2)
            else:
                obj[field_type["good_one"]] = 0
                obj[field_type["good_two"]] = 0

            
            # for j in main.globals.Goods.choices:
            #     session.world_state["fields"][obj][j[0]] = 1

        self.production_completed = True
        self.save()

        self.session.save()

        # logger.info(f"do_production {self.id}")
        
        return self.session

    def json(self):
        '''
        json object of model
        '''

        return{
            "id" : self.id,
            "period_number" : self.period_number,
            "production_completed" : self.production_completed,
            "consumption_completed" : self.consumption_completed,
        }
        