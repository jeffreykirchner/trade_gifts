'''
parameterset wall edit form
'''

from django import forms
from django.db.models.query import RawQuerySet

from main.models import ParameterSetFieldType

from main.globals import Goods

class ParameterSetFieldTypeForm(forms.ModelForm):
    '''
    parameterset field type edit form
    '''

    info = forms.CharField(label='Info',
                           required=False,
                           widget=forms.TextInput(attrs={"v-model":"current_parameter_set_field_type.info",}))
    
    good_one = forms.ChoiceField(label='Good One',
                                choices=Goods.choices,
                                widget=forms.Select(attrs={"v-model":"current_parameter_set_field_type.good_one",}))

    good_two = forms.ChoiceField(label='Good Two',
                                choices=Goods.choices,
                                widget=forms.Select(attrs={"v-model":"current_parameter_set_field_type.good_two",}))
    
    start_on_period = forms.IntegerField(label='Start on Period',
                                         min_value=1,
                                         widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field_type.start_on_period",
                                                                         "step":"1",
                                                                         "min":"1"}))

    reset_every_n_periods = forms.IntegerField(label='Reset Every N Periods',
                                         min_value=1,
                                         widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field_type.reset_every_n_periods",
                                                                         "step":"1",
                                                                         "min":"1"}))

    class Meta:
        model=ParameterSetFieldType
        fields =['info', 'good_one', 'good_two', 'start_on_period', 'reset_every_n_periods']
    
