'''
parameterset player 
'''

from django.db import models
from django.core.serializers.json import DjangoJSONEncoder

from main.models import ParameterSet

from main.globals import Goods

import main

class ParameterSetPlayer(models.Model):
    '''
    parameter set player parameters 
    '''

    parameter_set = models.ForeignKey(ParameterSet, on_delete=models.CASCADE, related_name="parameter_set_players")

    id_label = models.CharField(verbose_name='ID Label', max_length=2, default="1")      #id label shown on screen to subjects
    player_number = models.IntegerField(verbose_name='Player number', default=0)         #player number, from 1 to N 

    start_x = models.IntegerField(verbose_name='Start Location X', default=50)                #starting location x and y
    start_y = models.IntegerField(verbose_name='Start Location Y', default=50)

    house_x = models.IntegerField(verbose_name='House Location X', default=50)                #starting location x and y
    house_y = models.IntegerField(verbose_name='House Location Y', default=50)

    good_one = models.CharField(verbose_name='Good One', max_length=100, choices=Goods.choices, default=Goods.CHERRY, blank=True, null=True )
    good_two = models.CharField(verbose_name='Good Two', max_length=100, choices=Goods.choices, default=Goods.BLUEBERRY, blank=True, null=True)
    good_three = models.CharField(verbose_name='Good Three', max_length=100, choices=Goods.choices, default=Goods.PINEAPPLE, blank=True, null=True)

    hex_color = models.CharField(verbose_name='Hex Color', max_length = 8, default="0x000000") #color of player

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id_label)

    class Meta:
        verbose_name = 'Parameter Set Player'
        verbose_name_plural = 'Parameter Set Players'
        ordering=['player_number']

    def from_dict(self, new_ps):
        '''
        copy source values into this period
        source : dict object of parameterset player
        '''

        self.id_label = new_ps.get("id_label")
        self.player_number = new_ps.get("player_number")

        self.start_x = new_ps.get("start_x")
        self.start_y = new_ps.get("start_y")

        self.house_x = new_ps.get("house_x")
        self.house_y = new_ps.get("house_y")

        self.good_one = new_ps.get("good_one")
        self.good_two = new_ps.get("good_two")
        self.good_three = new_ps.get("good_three")

        self.hex_color = new_ps.get("hex_color")

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
        self.parameter_set.json_for_session["parameter_set_players"][self.id] = self.json()

        self.parameter_set.save()

        self.save()

    def json(self):
        '''
        return json object of model
        '''
        
        return{

            "id" : self.id,
            "player_number" : self.player_number,
            "id_label" : self.id_label,
            "start_x" : self.start_x,
            "start_y" : self.start_y,
            "house_x" : self.house_x,
            "house_y" : self.house_y,
            "good_one" : self.good_one,
            "good_two" : self.good_two,
            "good_three" : self.good_three,
            "hex_color" : self.hex_color,
        }
    
    def get_json_for_subject(self, update_required=False):
        '''
        return json object for subject screen, return cached version if unchanged
        '''
        try:
            v = self.parameter_set.json_for_session["parameter_set_players"][str(self.id)]
        except KeyError:
            v= {}

        # edit v as needed

        return v


