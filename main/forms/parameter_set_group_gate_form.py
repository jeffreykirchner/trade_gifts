'''
parameterset group gate edit form
'''

from django import forms

from main.models import ParameterSetGroupGate
from main.models import ParameterSetGroup

class ParameterSetGroupGateForm(forms.ModelForm):
    '''
    parameterset group gate edit form
    '''

    info = forms.CharField(label='Info',
                           required=False,
                           widget=forms.TextInput(attrs={"v-model":"current_parameter_set_group_gate.info",}))
    
    start_x = forms.IntegerField(label='X Location',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_group_gate.start_x",
                                                                 "step":"1",
                                                                 "min":"0"}))

    start_y = forms.IntegerField(label='Y Location',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_group_gate.start_y",
                                                                 "step":"1",
                                                                 "min":"0"}))
    
    width = forms.IntegerField(label='Width',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_group_gate.width",
                                                                 "step":"1",
                                                                 "min":"0"}))

    height = forms.IntegerField(label='Height',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_group_gate.height",
                                                                 "step":"1",
                                                                 "min":"0"}))
    
    text = forms.CharField(label='Text',
                            required=False,
                            widget=forms.TextInput(attrs={"v-model":"current_parameter_set_group_gate.text",}))
    
    rotation = forms.IntegerField(label='Text Rotation (degrees)',
                                 min_value=0,
                                 max_value=360,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_group_gate.rotation",
                                                                    "step":"1",
                                                                    "min":"0",
                                                                    "max":"360"}))
    
    parameter_set_allowed_groups = forms.ModelMultipleChoiceField(label='Allowed Groups',
                                                                required=False,
                                                                queryset=ParameterSetGroup.objects.none(),
                                                                widget=forms.CheckboxSelectMultiple(attrs={"v-model":"current_parameter_set_group_gate.parameter_set_allowed_groups",
                                                                                                            "class":"selectpicker" }))
    period_on = forms.IntegerField(label='Period On',
                                   min_value=1,
                                   widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_group_gate.period_on",
                                                                   "step":"1",
                                                                   "min":"1"}))
    
    period_off = forms.IntegerField(label='Period Off',
                                    min_value=2,
                                    widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_group_gate.period_off",
                                                                    "step":"1",
                                                                    "min":"2"}))

    class Meta:
        model=ParameterSetGroupGate
        fields =['info', 'text', 'rotation', 'parameter_set_allowed_groups', 'start_x', 'start_y', 
                 'width', 'height', 'period_on', 'period_off']
    
