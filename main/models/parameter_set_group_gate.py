'''
parameterset group gate 
'''

from django.db import models
from django.core.serializers.json import DjangoJSONEncoder

from main.models import ParameterSet
from main.models import ParameterSetGroup
from main.models import ParameterSetPlayer
from main.models import ParameterSetGround

import main

class ParameterSetGroupGate(models.Model):
    '''
    parameter set grouop gate
    '''

    parameter_set = models.ForeignKey(ParameterSet, on_delete=models.CASCADE, related_name="parameter_set_group_gates_a")
    parameter_set_allowed_groups = models.ManyToManyField(ParameterSetGroup, related_name="parameter_set_group_gates_b")
    parameter_set_ground = models.ForeignKey(ParameterSetGround, on_delete=models.CASCADE, related_name="parameter_set_group_gates_c", blank=True, null=True)
    
    info = models.CharField(verbose_name='Info', blank=True, null=True, max_length=100, default="Info Here")

    start_x = models.IntegerField(verbose_name='Location X', default=50)            #location x and y
    start_y = models.IntegerField(verbose_name='Location Y', default=50)
    
    width = models.IntegerField(verbose_name='Width', default=50)                    #width and height
    height = models.IntegerField(verbose_name='Height', default=50)

    text = models.CharField(verbose_name='Text', default="Closed until period N", max_length=100)       #text shown on barrier
    rotation = models.IntegerField(verbose_name='Rotation', default=0)                  #rotation of text

    period_on = models.IntegerField(verbose_name='Period On', default=1)                #period when barrier is on
    period_off = models.IntegerField(verbose_name='Period Off', default=14)             #period when barrier is off

    max_players_per_group = models.IntegerField(verbose_name='Max Players Per Group', default=1) #max players per group

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.info)

    class Meta:
        verbose_name = 'Parameter Set Group Gate'
        verbose_name_plural = 'Parameter Set Group Gates'
        ordering = ['id']

    def from_dict(self, new_ps):
        '''
        copy source values into this period
        source : dict object of parameterset player
        '''
        self.info = new_ps.get("info")
        
        self.start_x = new_ps.get("start_x", 50)
        self.start_y = new_ps.get("start_y", 50)

        self.width = new_ps.get("width", 100)
        self.height = new_ps.get("height", 100)

        self.text = new_ps.get("text", "Closed until period N")
        self.rotation = new_ps.get("rotation", 0)

        self.period_on = new_ps.get("period_on", 1)
        self.period_off = new_ps.get("period_off", 14)

        self.max_players_per_group = new_ps.get("max_players_per_group", 1)

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
        self.parameter_set.json_for_session["parameter_set_group_gates"][self.id] = self.json()

        self.parameter_set.save()

        self.save()

    def json(self):
        '''
        return json object of model
        '''
        
        return{

            "id" : self.id,
            "info" : self.info,
            "start_x" : self.start_x,
            "start_y" : self.start_y,
            "width" : self.width,
            "height" : self.height,
            "text" : self.text,
            "rotation" : self.rotation,
            "parameter_set_allowed_groups" : [group.id for group in self.parameter_set_allowed_groups.all()],
            "parameter_set_ground" : self.parameter_set_ground.id if self.parameter_set_ground else None,
            "period_on" : self.period_on,
            "period_off" : self.period_off,
            "max_players_per_group" : self.max_players_per_group,
        }
    
    def get_json_for_subject(self, update_required=False):
        '''
        return json object for subject screen, return cached version if unchanged
        '''

        return self.json()


