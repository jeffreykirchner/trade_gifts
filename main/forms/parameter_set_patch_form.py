'''
parameterset patch edit form
'''

from django import forms
from django.db.models.query import RawQuerySet

from main.models import ParameterSetPatch
from main.models import ParameterSetGroup

from main.globals import Goods

class ParameterSetPatchForm(forms.ModelForm):
    '''
    parameterset patch edit form
    '''

    parameter_set_group = forms.ModelChoiceField(label='Group',
                                                 queryset=ParameterSetGroup.objects.none(),
                                                 widget=forms.Select(attrs={"v-model":"current_parameter_set_patch.parameter_set_group",}))
    
    info = forms.CharField(label='Info',
                            widget=forms.TextInput(attrs={"v-model":"current_parameter_set_patch.info",}))

    x = forms.IntegerField(label='Location X',
                            min_value=0,
                            widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_patch.x",
                                                            "step":"1",
                                                            "min":"0"}))

    y = forms.IntegerField(label='Location Y',
                            min_value=0,
                            widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_patch.y",
                                                            "step":"1",
                                                            "min":"0"}))
    
    good = forms.ChoiceField(label='Good',
                                choices=Goods.choices,
                                widget=forms.Select(attrs={"v-model":"current_parameter_set_patch.good",}))
    
    shock_on_period = forms.IntegerField(label='Shock On Period',
                                            min_value=2,
                                            widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_patch.shock_on_period",
                                                                            "step":"1",
                                                                            "min":"2"}))
    
    # shock_levels = forms.IntegerField(label='Shock Level',
    #                                     min_value=1,
    #                                     widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_patch.shock_levels",
    #                                                                     "step":"1",
    #                                                                     "min":"1"}))
    
    hex_color = forms.CharField(label='Hex Color',
                                widget=forms.TextInput(attrs={"v-model":"current_parameter_set_patch.hex_color",}))
    
    class Meta:
        model=ParameterSetPatch
        fields =['info', 'parameter_set_group','hex_color', 'x', 'y', 'good', 'shock_on_period']
    
    # def clean_shock_levels(self):
        
    #     try:
    #        shock_levels = self.data.get('shock_levels')

    #        parameter_set_patch = ParameterSetPatch.objects.get(pk=self.instance.id)

    #        if shock_levels>len(parameter_set_patch.levels):
    #             raise forms.ValidationError('Shock level higher than total levels')
           
    #     except ValueError:
    #         raise forms.ValidationError('Invalid Entry')

    #     return shock_levels
