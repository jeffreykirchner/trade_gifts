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

    x = forms.IntegerField(label='Starting Location X',
                            min_value=0,
                            widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_patch.x",
                                                            "step":"1",
                                                            "min":"0"}))

    y = forms.IntegerField(label='Starting Location Y',
                            min_value=0,
                            widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_patch.y",
                                                            "step":"1",
                                                            "min":"0"}))
    
    good = forms.ChoiceField(label='Good',
                                choices=Goods.choices,
                                widget=forms.Select(attrs={"v-model":"current_parameter_set_patch.good",}))
    
    drought_on_period = forms.IntegerField(label='Drought On Period',
                                            min_value=2,
                                            widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_patch.drought_on_period",
                                                                            "step":"1",
                                                                            "min":"2"}))
    
    drought_level = forms.IntegerField(label='Drought Level',
                                        min_value=1,
                                        widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_patch.drought_level",
                                                                        "step":"1",
                                                                        "min":"1"}))
    
    hex_color = forms.CharField(label='Hex Color',
                                widget=forms.TextInput(attrs={"v-model":"current_parameter_set_patch.hex_color",}))
    
    class Meta:
        model=ParameterSetPatch
        fields =['info', 'parameter_set_group','hex_color', 'x', 'y', 'good', 'drought_on_period', 'drought_level']
    
    def clean_drought_level(self):
        
        try:
           drought_level = self.data.get('drought_level')

           parameter_set_patch = ParameterSetPatch.objects.get(pk=self.instance.id)

           if drought_level>len(parameter_set_patch.levels):
                raise forms.ValidationError('Drought level higher than total levels')
           
        except ValueError:
            raise forms.ValidationError('Invalid Entry')

        return drought_level