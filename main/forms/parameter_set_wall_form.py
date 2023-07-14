'''
parameterset wall edit form
'''

from django import forms
from django.db.models.query import RawQuerySet

from main.models import ParameterSetWall

class ParameterSetWallForm(forms.ModelForm):
    '''
    parameterset wall edit form
    '''

    id_label = forms.CharField(label='Info',
                               widget=forms.TextInput(attrs={"v-model":"current_parameter_set_wall.info",}))
    
    start_x = forms.IntegerField(label='Starting Location X',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_wall.start_x",
                                                                 "step":"1",
                                                                 "min":"0"}))

    start_y = forms.IntegerField(label='Starting Location Y',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_wall.start_y",
                                                                 "step":"1",
                                                                 "min":"0"}))
    
    end_x = forms.IntegerField(label='Ending Location X',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_wall.start_x",
                                                                 "step":"1",
                                                                 "min":"0"}))

    end_y = forms.IntegerField(label='Ending Location Y',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_wall.start_y",
                                                                 "step":"1",
                                                                 "min":"0"}))

    class Meta:
        model=ParameterSetWall
        fields =['info', 'start_x', 'start_y', 'end_x', 'end_y']
    
