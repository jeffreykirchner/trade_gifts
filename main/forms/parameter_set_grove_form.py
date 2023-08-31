'''
parameterset grove edit form
'''

from django import forms
from django.db.models.query import RawQuerySet

from main.models import ParameterSetGrove
from main.models import ParameterSetGroup

from main.globals import Goods

class ParameterSetGroveForm(forms.ModelForm):
    '''
    parameterset grove edit form
    '''

    x = forms.IntegerField(label='Starting Location X',
                            min_value=0,
                            widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_grove.x",
                                                            "step":"1",
                                                            "min":"0"}))

    y = forms.IntegerField(label='Starting Location Y',
                            min_value=0,
                            widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_grove.y",
                                                            "step":"1",
                                                            "min":"0"}))
    
    good = forms.ChoiceField(label='Good',
                                choices=Goods.choices,
                                widget=forms.Select(attrs={"v-model":"current_parameter_set_grove.good",}))
    
    drought_on_period = forms.IntegerField(label='Drought On Period',
                                            min_value=2,
                                            widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_grove.drought_on_period",
                                                                            "step":"1",
                                                                            "min":"2"}))
    
    drought_level = forms.IntegerField(label='Drought Level',
                                        min_value=1,
                                        widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_grove.drought_level",
                                                                        "step":"1",
                                                                        "min":"1"}))
    
    hex_color = forms.CharField(label='Hex Color',
                                widget=forms.TextInput(attrs={"v-model":"current_parameter_set_grove.hex_color",}))
    
    class Meta:
        model=ParameterSetGrove
        fields =[ 'x', 'y', 'good', 'drought_on_period', 'drought_level', 'hex_color']
    
