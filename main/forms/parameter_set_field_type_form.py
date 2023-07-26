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
                           widget=forms.TextInput(attrs={"v-model":"current_parameter_set_field_type.info",}))
    
    display_text = forms.CharField(label='Display Text',
                                   widget=forms.TextInput(attrs={"v-model":"current_parameter_set_field_type.display_text",}))
    
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
    
    good_one_alpha = forms.DecimalField(label='Good One Production Alpha',
                                        max_digits=6,
                                        decimal_places=5,
                                        widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field_type.good_one_alpha",
                                                                        "step":"0.01",
                                                                            }))
    
    good_one_omega = forms.DecimalField(label='Good One Production Omega',
                                        max_digits=6,
                                        decimal_places=5,
                                        widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field_type.good_one_omega",
                                                                        "step":"0.01",
                                                                          }))
    
    good_one_rho = forms.DecimalField(label='Good One Production Rho',
                                      max_digits=6,
                                      decimal_places=5,
                                      widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field_type.good_one_rho",
                                                                      "step":"0.01",
                                                                        }))
    
    good_two_alpha = forms.DecimalField(label='Good Two Production Alpha',
                                        max_digits=6,
                                        decimal_places=5,
                                        widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field_type.good_two_alpha",
                                                                        "step":"0.01",
                                                                            }))
    
    good_two_omega = forms.DecimalField(label='Good Two Production Omega',
                                        max_digits=6,
                                        decimal_places=5,
                                        widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field_type.good_two_omega",
                                                                        "step":"0.01",
                                                                          }))
    
    good_two_rho = forms.DecimalField(label='Good Two Production Rho',
                                      max_digits=6,
                                      decimal_places=5,
                                      widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field_type.good_two_rho",
                                                                      "step":"0.01",
                                                                        }))

    class Meta:
        model=ParameterSetFieldType
        fields =['info', 'display_text', 'good_one', 'good_two', 'start_on_period', 'reset_every_n_periods',
                 'good_one_alpha', 'good_one_omega', 'good_one_rho', 'good_two_alpha', 'good_two_omega', 'good_two_rho']
    
