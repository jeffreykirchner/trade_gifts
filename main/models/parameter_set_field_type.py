'''
parameterset player 
'''

from django.db import models
from django.core.serializers.json import DjangoJSONEncoder

from main.models import ParameterSet

from main.globals import Goods

import main

class ParameterSetFieldType(models.Model):
    '''
    parameter set wall
    '''

    parameter_set = models.ForeignKey(ParameterSet, on_delete=models.CASCADE, related_name="parameter_set_field_types")

    info = models.TextField(verbose_name='Info', blank=True, null=True, default="Description of Field Type")
    display_text = models.TextField(verbose_name='Info', blank=True, null=True, default="Display Text")

    good_one = models.CharField(verbose_name='Good One', max_length=100, choices=Goods.choices, default=Goods.CHERRY)
    good_two = models.CharField(verbose_name='Good Two', max_length=100, choices=Goods.choices, default=Goods.BLUEBERRY)

    start_on_period = models.IntegerField(verbose_name='Start on Period', default=1)                   #ending location x and y
    reset_every_n_periods = models.IntegerField(verbose_name='Reset Every N Periods', default=2)       #ending location x and y

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)

    class Meta:
        verbose_name = 'Parameter Set Field Type'
        verbose_name_plural = 'Parameter Set Field Types'
        ordering = ['id']

    def from_dict(self, new_ps):
        '''
        copy source values into this period
        source : dict object of parameterset player
        '''
        self.info = new_ps.get("info")
        self.display_text = new_ps.get("display_text")
        
        self.good_one = new_ps.get("good_one")
        self.good_two = new_ps.get("good_two")

        self.start_on_period = new_ps.get("start_on_period")
        self.reset_every_n_periods = new_ps.get("reset_every_n_periods")

        self.save()
        
        message = "Parameters loaded successfully."

        return message
    
    def setup(self):
        '''
        default setup
        '''    
        self.save()
    
    def update_json_local(self):
        '''
        update parameter set json
        '''
        self.parameter_set.json_for_session["parameter_set_field_types"][self.id] = self.json()

        self.parameter_set.save()

        self.save()

    def json(self):
        '''
        return json object of model
        '''
        
        return{

            "id" : self.id,
            "info" : self.info,
            "display_text" : self.display_text,
            "good_one" : self.good_one,
            "good_two" : self.good_two,
            "start_on_period" : self.start_on_period,
            "reset_every_n_periods" : self.reset_every_n_periods,
        }
    
    def get_json_for_subject(self, update_required=False):
        '''
        return json object for subject screen, return cached version if unchanged
        '''

        return self.json()


