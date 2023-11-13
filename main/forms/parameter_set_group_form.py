'''
parameterset group edit form
'''

from django import forms

from main.models import ParameterSetGroup
from main.models import ParameterSetHat

class ParameterSetGroupForm(forms.ModelForm):
    '''
    parameterset field type edit form
    '''
    
    name = forms.CharField(label='Name',
                           widget=forms.TextInput(attrs={"v-model":"current_parameter_set_group.name",}))
    
    parameter_set_hat = forms.ModelChoiceField(label='Hat',
                                               required=False,
                                               queryset=ParameterSetHat.objects.none(),
                                               widget=forms.Select(attrs={"v-model":"current_parameter_set_group.parameter_set_hat",}))



    class Meta:
        model=ParameterSetGroup
        fields =['name',]
    
