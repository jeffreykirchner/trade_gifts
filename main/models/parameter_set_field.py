'''
parameterset field 
'''

from django.db import models
from django.core.serializers.json import DjangoJSONEncoder

from main.models import ParameterSet
from main.models import ParameterSetFieldType
from main.models import ParameterSetPlayer

import main

class ParameterSetField(models.Model):
    '''
    parameter set field
    '''

    parameter_set = models.ForeignKey(ParameterSet, on_delete=models.CASCADE, related_name="parameter_set_fields_a")
    parameter_set_field_type = models.ForeignKey(ParameterSetFieldType, on_delete=models.SET_NULL, related_name="parameter_set_fields_b", blank=True, null=True)
    parameter_set_player = models.ForeignKey(ParameterSetPlayer, on_delete=models.SET_NULL, related_name="parameter_set_fields_c", blank=True, null=True)

    x = models.IntegerField(verbose_name='Location X', default=50)            #location x and y
    y = models.IntegerField(verbose_name='Location Y', default=50)

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)

    class Meta:
        verbose_name = 'Parameter Set Field'
        verbose_name_plural = 'Parameter Set Fields'
        ordering = ['id']

    def from_dict(self, new_ps):
        '''
        copy source values into this period
        source : dict object of parameterset player
        '''       
        
        self.x = new_ps.get("x")
        self.y = new_ps.get("y")

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
        self.parameter_set.json_for_session["parameter_set_fields"][self.id] = self.json()

        self.parameter_set.save()

        self.save()

    def json(self):
        '''
        return json object of model
        '''
        
        return{

            "id" : self.id,
            "x" : self.x,
            "y" : self.y,
            "parameter_set_field_type" : self.parameter_set_field_type.id if self.parameter_set_field_type else None,
            "parameter_set_player" : self.parameter_set_player.id if self.parameter_set_player else None,

        }
    
    def get_json_for_subject(self, update_required=False):
        '''
        return json object for subject screen, return cached version if unchanged
        '''

        return self.json()


