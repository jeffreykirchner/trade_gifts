'''
parameterset ground edit form
'''

from django import forms

from main.models import ParameterSetGround
from main.models import ParameterSetGroup

class ParameterSetGroundForm(forms.ModelForm):
    '''
    parameterset ground edit form
    '''

    info = forms.CharField(label='Info',
                           required=False,
                           widget=forms.TextInput(attrs={"v-model":"current_parameter_set_ground.info",}))

    parameter_set_group = forms.ModelChoiceField(label='Group',
                                                 required=False,
                                                 queryset=ParameterSetGroup.objects.none(),
                                                 widget=forms.Select(attrs={"v-model":"current_parameter_set_ground.parameter_set_group",}))
    
    x = forms.IntegerField(label='X Location',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_ground.x",
                                                                 "step":"1",
                                                                 "min":"0"}))

    y = forms.IntegerField(label='Y Location',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_ground.y",
                                                                 "step":"1",
                                                                 "min":"0"}))
    
    width = forms.IntegerField(label='Width',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_ground.width",
                                                                 "step":"1",
                                                                 "min":"0"}))

    height = forms.IntegerField(label='Height',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_ground.height",
                                                                 "step":"1",
                                                                 "min":"0"}))
    
    tint = forms.CharField(label='Tint (Hex Color)',
                           widget=forms.TextInput(attrs={"v-model":"current_parameter_set_ground.tint",}))
    
    texture = forms.CharField(label='Texture Name',
                              widget=forms.TextInput(attrs={"v-model":"current_parameter_set_ground.texture",}))
    
    rotation = forms.DecimalField(label='Rotation',
                                    min_value=0,
                                    max_value=2,
                                    widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_ground.rotation",
                                                                    "step":"0.01",
                                                                    "min":"0",
                                                                    "max":"2"}))
    
    scale = forms.DecimalField(label='Scale',
                               min_value=0,
                               max_value=1,
                               widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_ground.scale",
                                                               "step":"0.01",
                                                               "min":"0",
                                                               "max":"1"}))
    
    
    

    class Meta:
        model=ParameterSetGround
        fields =['info', 'parameter_set_group', 'x', 'y', 'width', 'height', 'tint', 'texture', 'rotation', 'scale']
    
