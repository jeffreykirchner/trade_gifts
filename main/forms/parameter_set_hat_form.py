'''
parameterset hat edit form
'''

from django import forms

from main.models import ParameterSetHat

class ParameterSetHatForm(forms.ModelForm):
    '''
    parameterset hat edit form
    '''

    info = forms.CharField(label='Info',
                           required=False,
                           widget=forms.TextInput(attrs={"v-model":"current_parameter_set_ground.info",}))
    
    texture = forms.CharField(label='Texture Name',
                              widget=forms.TextInput(attrs={"v-model":"current_parameter_set_ground.texture",}))
    
    scale = forms.DecimalField(label='Scale',
                               min_value=0,
                               max_value=1,
                               widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_ground.scale",
                                                               "step":"0.01",
                                                               "min":"0",
                                                               "max":"1"}))
    
    class Meta:
        model=ParameterSetHat
        fields =['info', 'texture', 'scale']
    
