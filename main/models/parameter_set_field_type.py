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

    info = models.TextField(verbose_name='Info', default="Description of Field Type")
    display_text = models.TextField(verbose_name='Info', blank=True, null=True, default="Display Text")

    good_one_ft = models.CharField(verbose_name='Good One', max_length=100, choices=Goods.choices, default=Goods.CHERRY)
    good_two_ft = models.CharField(verbose_name='Good Two', max_length=100, choices=Goods.choices, default=Goods.BLUEBERRY)

    start_on_period = models.IntegerField(verbose_name='Start on Period', default=1)                   #ending location x and y
    reset_every_n_periods = models.IntegerField(verbose_name='Reset Every N Periods', default=2)       #ending location x and y

    good_one_alpha = models.DecimalField(verbose_name='Good One Production Alpha', decimal_places=5, max_digits=7, default=1)          
    good_one_omega = models.DecimalField(verbose_name='Good One Production Omega', decimal_places=5, max_digits=7, default=1)           
    good_one_rho = models.DecimalField(verbose_name='Good One Production Rho', decimal_places=5, max_digits=7, default=1)  

    good_two_alpha = models.DecimalField(verbose_name='Good Two Production Alpha', decimal_places=5, max_digits=7, default=1)          
    good_two_omega = models.DecimalField(verbose_name='Good Two Production Omega', decimal_places=5, max_digits=7, default=1)           
    good_two_rho = models.DecimalField(verbose_name='Good Two Production Rho', decimal_places=5, max_digits=7, default=1)

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.info)

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
        
        self.good_one_ft = new_ps.get("good_one_ft")
        self.good_two_ft = new_ps.get("good_two_ft")

        self.start_on_period = new_ps.get("start_on_period")
        self.reset_every_n_periods = new_ps.get("reset_every_n_periods")

        self.good_one_alpha = new_ps.get("good_one_alpha", 1)
        self.good_one_omega = new_ps.get("good_one_omega", 1)
        self.good_one_rho = new_ps.get("good_one_rho", 1)

        self.good_two_alpha = new_ps.get("good_two_alpha", 1)
        self.good_two_omega = new_ps.get("good_two_omega", 1)
        self.good_two_rho = new_ps.get("good_two_rho", 1)


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
            "good_one_ft" : self.good_one_ft,
            "good_two_ft" : self.good_two_ft,
            "start_on_period" : self.start_on_period,
            "reset_every_n_periods" : self.reset_every_n_periods,
            "good_one_alpha" : self.good_one_alpha,
            "good_one_omega" : self.good_one_omega,
            "good_one_rho" : self.good_one_rho,
            "good_two_alpha" : self.good_two_alpha,
            "good_two_omega" : self.good_two_omega,
            "good_two_rho" : self.good_two_rho,
        }
    
    def get_json_for_subject(self, update_required=False):
        '''
        return json object for subject screen, return cached version if unchanged
        '''

        return self.json()


