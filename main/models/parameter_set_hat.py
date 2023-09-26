'''
parameterset player 
'''

from django.db import models
from django.core.serializers.json import DjangoJSONEncoder

from main.models import ParameterSet

import main

class ParameterSetHat(models.Model):
    '''
    parameter set wall
    '''

    parameter_set = models.ForeignKey(ParameterSet, on_delete=models.CASCADE, related_name="parameter_set_hats")

    info = models.CharField(verbose_name='Info', blank=True, null=True, max_length=100, default="Info Here")
    
    texture = models.CharField(verbose_name='Texture Name', default="Name Here")                  #name of texture
    scale = models.DecimalField(decimal_places=2, max_digits=3, default=1)                        #scale of texture

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.info)

    class Meta:
        verbose_name = 'Parameter Set Hat'
        verbose_name_plural = 'Parameter Set Hats'
        ordering = ['id']

    def from_dict(self, new_ps):
        '''
        copy source values into this period
        source : dict object of parameterset player
        '''
        self.info = new_ps.get("info")

        self.texture = new_ps.get("texture")
        self.scale = new_ps.get("scale")

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
        self.parameter_set.json_for_session["parameter_set_grounds"][self.id] = self.json()

        self.parameter_set.save()

        self.save()

    def json(self):
        '''
        return json object of model
        '''
        
        return{

            "id" : self.id,
            "info" : self.info,
            "texture" : self.texture,
            "scale" : self.scale,
        }
    
    def get_json_for_subject(self, update_required=False):
        '''
        return json object for subject screen, return cached version if unchanged
        '''

        return self.json()


