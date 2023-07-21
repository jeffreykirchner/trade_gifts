'''
parameterset wall edit form
'''

from django import forms

from main.models import ParameterSetField
from main.models import ParameterSetPlayer
from main.models import ParameterSetFieldType

from main.globals import Goods

class ParameterSetFieldForm(forms.ModelForm):
    '''
    parameterset field type edit form
    '''
    
    parameter_set_player = forms.ModelChoiceField(label='Player',
                                             queryset=ParameterSetPlayer.objects.none(),
                                             widget=forms.Select(attrs={"v-model":"current_parameter_set_field.parameter_set_player",}))

    parameter_set_field_type = forms.ModelChoiceField(label='Field Type',
                                                 queryset=ParameterSetFieldType.objects.none(),
                                                 widget=forms.Select(attrs={"v-model":"current_parameter_set_field.parameter_set_field_type",}))
    
    x = forms.IntegerField(label='Location X',
                            min_value=0,
                            widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field.x",
                                                            "step":"1",
                                                            "min":"0"}))

    y = forms.IntegerField(label='location Y',
                            min_value=0,
                            widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field.y",
                                                            "step":"1",
                                                            "min":"0"}))

    class Meta:
        model=ParameterSetField
        fields =['parameter_set_player', 'parameter_set_field_type', 'x', 'y']
    
