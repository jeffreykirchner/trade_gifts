'''
parameterset player 
'''

from django.db import models
from django.core.serializers.json import DjangoJSONEncoder

from main.models import ParameterSet

import main

class ParameterSetWall(models.Model):
    '''
    parameter set wall
    '''

    parameter_set = models.ForeignKey(ParameterSet, on_delete=models.CASCADE, related_name="parameter_set_walls")

    start_x = models.IntegerField(verbose_name='Start Location X', default=50)            #starting location x and y
    start_y = models.IntegerField(verbose_name='Start Location Y', default=50)
    
    end_x = models.IntegerField(verbose_name='End Location X', default=50)                #ending location x and y
    end_y = models.IntegerField(verbose_name='End Location Y', default=50)

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)

    class Meta:
        verbose_name = 'Parameter Set Wall'
        verbose_name_plural = 'Parameter Set Walls'

    def from_dict(self, new_ps):
        '''
        copy source values into this period
        source : dict object of parameterset player
        '''

       
        self.start_x = new_ps.get("start_x")
        self.start_y = new_ps.get("start_y")

        self.end_x = new_ps.get("end_x")
        self.end_y = new_ps.get("end_y")


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
        self.parameter_set.json_for_session["parameter_set_walls"][self.id] = self.json()

        self.parameter_set.save()

        self.save()

    def json(self):
        '''
        return json object of model
        '''
        
        return{

            "id" : self.id,
            "start_x" : self.start_x,
            "start_y" : self.start_y,
            "end_x" : self.start_x,
            "end_y" : self.start_y,
        }
    
    def get_json_for_subject(self, update_required=False):
        '''
        return json object for subject screen, return cached version if unchanged
        '''

        v = self.parameter_set.json_for_session["parameter_set_players"][str(self.id)]

        # edit v as needed

        return v


