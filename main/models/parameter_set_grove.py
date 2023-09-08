'''
parameterset grove 
'''

from django.db import models
from django.core.serializers.json import DjangoJSONEncoder

from main.models import ParameterSet
from main.models import ParameterSetGroup

from main.globals import Goods

import main

class ParameterSetGrove(models.Model):
    '''
    parameter set groves 
    '''

    parameter_set = models.ForeignKey(ParameterSet, on_delete=models.CASCADE, related_name="parameter_set_groves_a")
    parameter_set_group = models.ForeignKey(ParameterSetGroup, on_delete=models.SET_NULL, related_name="parameter_set_groves_b", blank=True, null=True)

    info = models.CharField(verbose_name='Info', blank=True, null=True, max_length=100, default="Info Here")

    x = models.IntegerField(verbose_name='Start Location X', default=50)                #starting location x and y
    y = models.IntegerField(verbose_name='Start Location Y', default=50)

    good = models.CharField(verbose_name='Good One', max_length=100, choices=Goods.choices, default=Goods.CHERRY, blank=True, null=True )     #good type
    levels = models.JSONField(verbose_name='Levels', encoder=DjangoJSONEncoder, blank=True, null=True)          #levels of good
    drought_on_period = models.IntegerField(verbose_name='Drought On Period', default=14)          #period when drought occurs
    drought_level = models.IntegerField(verbose_name='Drought Level', default=1)          #level of drought

    hex_color = models.CharField(verbose_name='Hex Color', max_length = 8, default="0x000000")                   #color of grove

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)

    class Meta:
        verbose_name = 'Parameter Set Grove'
        verbose_name_plural = 'Parameter Set Grove'
        ordering=['id']

    def from_dict(self, new_ps):
        '''
        copy source values into this period
        source : dict object of parameterset grove
        '''
        self.info = new_ps.get("info")
        self.x = new_ps.get("x")
        self.y = new_ps.get("y")

        self.good = new_ps.get("good")
        self.levels = new_ps.get("levels")
        self.drought_on_period = new_ps.get("drought_on_period")
        self.drought_level = new_ps.get("drought_level")

        self.hex_color = new_ps.get("hex_color")

        self.save()
        
        message = "Parameters loaded successfully."

        return message
    
    def setup(self):
        '''
        default setup
        '''    
        value = 2
        self.levels = {}

        for i in range(1, 5):
            self.levels[str(i)] = {"value" : value}
            value *= 2

        self.save()
    
    def update_json_local(self):
        '''
        update parameter set json
        '''
        self.parameter_set.json_for_session["parameter_set_groves"][self.id] = self.json()

        self.parameter_set.save()

        self.save()

    def json(self):
        '''
        return json object of model
        '''
        
        return{

            "id" : self.id,
            "info" : self.info,
            "x" : self.x,
            "y" : self.y,
            "good" : self.good,
            "levels" : self.levels,
            "drought_on_period" : self.drought_on_period,
            "drought_level" : self.drought_level,
            "hex_color" : self.hex_color,
            "parameter_set_group" : self.parameter_set_group.id if self.parameter_set_group else None,
        }
    
    def get_json_for_subject(self, update_required=False):
        '''
        return json object for subject screen, return cached version if unchanged
        '''
        try:
            v = self.parameter_set.json_for_session["parameter_set_groves"][str(self.id)]
        except KeyError:
            v= {}

        # edit v as needed

        return v


