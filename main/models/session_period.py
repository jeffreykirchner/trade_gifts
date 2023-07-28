'''
session period model
'''

#import logging

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
        result = {}

        objs = self.session.session_players.all()
        
        for i in objs:
            sid = str(i.id)
            speriod_id = str(self.id)

            # i.earnings += world_state_local["session_players"][sid]["inventory"][speriod_id]
            
            # result[sid] = {}
            # result[sid]["total_earnings"] = i.earnings
            # result[sid]["period_earnings"] = world_state_local["session_players"][sid]["inventory"][speriod_id]
        
        r = main.models.SessionPlayer.objects.abulk_update(objs, ['earnings'])

        self.consumption_completed = True
        self.asave()

        return self.session.world_state
    
    def do_production(self):
        '''
        do production for this period
        '''

        with transaction.atomic():
            session_period = main.models.SessionPeriod.objects.select_for_update().get(id=self.id)
            session = main.models.Session.objects.select_for_update().get(id=self.session.id)

            parameter_set = session.parameter_set.json()
            world_state = session.world_state
            current_period = world_state["current_period"]

            for i in session.world_state["fields"]:
                
                obj = session.world_state["fields"][i]
                field_type = parameter_set["parameter_set_field_types"][str(obj["parameter_set_field_type"])]

                if current_period >= field_type["start_on_period"]:
                    g1 = Decimal(field_type["good_one_rho"]) * (Decimal(field_type["good_one_alpha"]) * Decimal(obj["good_one_effort"]) ** Decimal(field_type["good_one_omega"]))
                    g2 = Decimal(field_type["good_two_rho"]) * (Decimal(field_type["good_two_alpha"]) * Decimal(obj["good_two_effort"]) ** Decimal(field_type["good_two_omega"]))
                    
                    # if (current_period - field_type["start_on_period"] + 1)  % int(field_type["reset_every_n_periods"]) != 1:
                    #     g1 -= Decimal(obj[field_type["good_one"]])
                    #     g2 -= Decimal(obj[field_type["good_two"]])

                    obj[field_type["good_one"]] = round_half_away_from_zero(g1, 0)
                    obj[field_type["good_two"]] = round_half_away_from_zero(g2, 0)
                else:
                    obj[field_type["good_one"]] = 0
                    obj[field_type["good_two"]] = 0

                
                # for j in main.globals.Goods.choices:
                #     session.world_state["fields"][obj][j[0]] = 1

            session_period.production_completed = True
            session_period.save()

            session.save()

        return session.world_state

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
        