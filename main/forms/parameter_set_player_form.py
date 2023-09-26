'''
parameterset player edit form
'''

from django import forms
from django.db.models.query import RawQuerySet

from main.models import ParameterSetPlayer
from main.models import ParameterSetGroup
from main.models import ParameterSetHat

from main.globals import Goods

class ParameterSetPlayerForm(forms.ModelForm):
    '''
    parameterset player edit form
    '''

    id_label = forms.CharField(label='Label Used in Chat',
                               widget=forms.TextInput(attrs={"v-model":"current_parameter_set_player.id_label",}))
    
    parameter_set_group = forms.ModelChoiceField(label='Group',
                                                 queryset=ParameterSetGroup.objects.none(),
                                                 widget=forms.Select(attrs={"v-model":"current_parameter_set_player.parameter_set_group",}))
    
    parameter_set_hat = forms.ModelChoiceField(label='Hat',
                                               required=False,
                                               queryset=ParameterSetHat.objects.none(),
                                               widget=forms.Select(attrs={"v-model":"current_parameter_set_player.parameter_set_hat",}))

    start_x = forms.IntegerField(label='Starting Location X',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_player.start_x",
                                                                 "step":"1",
                                                                 "min":"0"}))

    start_y = forms.IntegerField(label='Starting Location Y',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_player.start_y",
                                                                 "step":"1",
                                                                 "min":"0"}))
    
    house_x = forms.IntegerField(label='House Location X',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_player.house_x",
                                                                 "step":"1",
                                                                 "min":"0"}))
    
    house_y = forms.IntegerField(label='House Location Y',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_player.house_y",
                                                                 "step":"1",
                                                                 "min":"0"}))
    
    good_one = forms.ChoiceField(label='Good One',
                                 choices=Goods.choices,
                                 widget=forms.Select(attrs={"v-model":"current_parameter_set_player.good_one",}))
    
    good_two = forms.ChoiceField(label='Good Two',
                                 choices=Goods.choices,
                                 widget=forms.Select(attrs={"v-model":"current_parameter_set_player.good_two",}))
    
    good_three = forms.ChoiceField(label='Good Three',
                                   required=False,
                                   choices=Goods.choices + [(None, None)],
                                   widget=forms.Select(attrs={"v-model":"current_parameter_set_player.good_three",}))
    
    hex_color = forms.CharField(label='Hex Color (e.g. 0x00AABB)',
                                widget=forms.TextInput(attrs={"v-model":"current_parameter_set_player.hex_color",}))

    class Meta:
        model=ParameterSetPlayer
        fields =['id_label', 'parameter_set_group', 'start_x', 'start_y', 'house_x', 'house_y', 'good_one', 'good_two', 'good_three', 'hex_color', 'parameter_set_hat']
    
