'''
Parameterset edit form
'''
import re

from django import forms

from main.models import ParameterSet

from main.globals import ChatModes
from main.globals import GoodModes
from main.globals import HarvestModes
from main.globals import HatModes

import  main

class ParameterSetForm(forms.ModelForm):
    '''
    Parameterset edit form
    '''
    period_count = forms.IntegerField(label='Number of Periods',
                                      min_value=1,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.period_count",
                                                                      "step":"1",
                                                                      "min":"1"}))

    period_length = forms.IntegerField(label='Period Length (seconds)',
                                       min_value=1,
                                       widget=forms.NumberInput(attrs={"v-model":"parameter_set.period_length",
                                                                       "step":"1",
                                                                       "min":"1"}))
    
    night_length = forms.IntegerField(label='Night Length (seconds)',
                                      min_value=1,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.night_length",
                                                                      "step":"1",
                                                                      "min":"1"}))
    
    break_frequency = forms.IntegerField(label='Break Frequency (periods)',
                                         min_value=1,
                                         widget=forms.NumberInput(attrs={"v-model":"parameter_set.break_frequency",
                                                                         "step":"1",
                                                                         "min":"1"}))
    
    break_length = forms.IntegerField(label='Break Length (seconds)',
                                      min_value=1,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.break_length",
                                                                      "step":"1",
                                                                      "min":"1"}))

    show_instructions = forms.ChoiceField(label='Show Instructions',
                                       choices=((True, 'Yes'), (False,'No' )),
                                       widget=forms.Select(attrs={"v-model":"parameter_set.show_instructions",}))
    
    instruction_set = forms.ModelChoiceField(label='Instruction Set',
                                            empty_label=None,
                                            queryset=main.models.InstructionSet.objects.all(),
                                            widget=forms.Select(attrs={"v-model":"parameter_set.instruction_set.id"}))

    survey_required = forms.ChoiceField(label='Show Survey',
                                       choices=((True, 'Yes'), (False,'No' )),
                                       widget=forms.Select(attrs={"v-model":"parameter_set.survey_required",}))

    survey_link =  forms.CharField(label='Survey Link',
                                   required=False,
                                   widget=forms.TextInput(attrs={"v-model":"parameter_set.survey_link",}))
    
    prolific_mode = forms.ChoiceField(label='Prolific Mode',
                                       choices=((True, 'Yes'), (False,'No' )),
                                       widget=forms.Select(attrs={"v-model":"parameter_set.prolific_mode",}))

    prolific_completion_link =  forms.CharField(label='After Session, Forward Subjects to URL',
                                   required=False,
                                   widget=forms.TextInput(attrs={"v-model":"parameter_set.prolific_completion_link",}))
    
    reconnection_limit = forms.IntegerField(label='Re-connection Limit',
                                    min_value=1,
                                    widget=forms.NumberInput(attrs={"v-model":"parameter_set.reconnection_limit",
                                                                    "step":"1",
                                                                    "min":"1"}))
    
    interaction_length = forms.IntegerField(label='Interaction Length (seconds)',
                                            min_value=1,
                                            widget=forms.NumberInput(attrs={"v-model":"parameter_set.interaction_length",
                                                                            "step":"1",
                                                                            "min":"1"}))
    
    interaction_range = forms.IntegerField(label='Interaction Range (Pixels)',
                                            min_value=100,
                                            max_value=800,
                                            widget=forms.NumberInput(attrs={"v-model":"parameter_set.interaction_range",
                                                                            "step":"1",
                                                                            "max":"800",
                                                                            "min":"100"}))
    
    cool_down_length = forms.IntegerField(label='Cool Down Length (seconds)',
                                          min_value=1,
                                          widget=forms.NumberInput(attrs={"v-model":"parameter_set.cool_down_length",
                                                                          "step":"1",
                                                                          "min":"1"}))
    
    starting_health = forms.IntegerField(label='Starting Health (0-100)',
                                            min_value=0,
                                            max_value=100,
                                            widget=forms.NumberInput(attrs={"v-model":"parameter_set.starting_health",
                                                                            "step":"1",
                                                                            "min":"0",
                                                                            "max":"100"}))

    health_loss_per_second = forms.DecimalField(label='Health Loss Per Second',
                                                max_digits=3,
                                                decimal_places=2,
                                                min_value=0.01,
                                                widget=forms.NumberInput(attrs={"v-model":"parameter_set.health_loss_per_second",
                                                                                "step":"0.01",
                                                                                "min":"0.01"}))
    
    heath_gain_per_sleep_second = forms.DecimalField(label='Health Gain Per Sleep Second',
                                                     max_digits=4,
                                                     decimal_places=2,
                                                     min_value=0.01,
                                                     widget=forms.NumberInput(attrs={"v-model":"parameter_set.heath_gain_per_sleep_second",
                                                                                     "step":"0.01",
                                                                                     "min":"0.01"}))
    
    consumption_alpha = forms.DecimalField(label='Consumption Alpha',
                                           max_digits=7,
                                           decimal_places=5,
                                           min_value=0.01,
                                           widget=forms.NumberInput(attrs={"v-model":"parameter_set.consumption_alpha",
                                                                           "step":"0.01",
                                                                           "min":"0.01"}))
    
    consumption_beta = forms.DecimalField(label='Consumption Beta',
                                          max_digits=7,
                                          decimal_places=5,
                                          min_value=0.01,
                                          widget=forms.NumberInput(attrs={"v-model":"parameter_set.consumption_beta",
                                                                          "step":"0.01",
                                                                          "min":"0.01"}))

    consumption_multiplier = forms.CharField(label='Consumption 3rd Good Multiplier',
                                             required=False,
                                             widget=forms.Textarea(attrs={"v-model":"parameter_set.consumption_multiplier",
                                                                          "rows":"5",}))
    
    cents_per_second = forms.DecimalField(label='Earnings Per Second($)',
                                          max_digits=7,
                                          decimal_places=5,
                                          min_value=0.01,
                                          widget=forms.NumberInput(attrs={"v-model":"parameter_set.cents_per_second",
                                                                          "step":"0.01",
                                                                          "min":"0.01"}))
    
    allow_attacks = forms.ChoiceField(label='Allow Attacks',
                                       choices=((True, 'Yes'), (False,'No' )),
                                       widget=forms.Select(attrs={"v-model":"parameter_set.allow_attacks",}))

    attack_cost = forms.DecimalField(label='Attack Cost (Health)',
                                     max_digits=3,
                                     decimal_places=1,
                                     min_value=0.1,
                                     widget=forms.NumberInput(attrs={"v-model":"parameter_set.attack_cost",
                                                                     "step":"0.1",
                                                                     "min":"0.1"}))
    
    attack_damage = forms.DecimalField(label='Attack Damage (Health)',
                                       max_digits=3,
                                       decimal_places=1,
                                       min_value=0.1,
                                       widget=forms.NumberInput(attrs={"v-model":"parameter_set.attack_damage",
                                                                       "step":"0.1",
                                                                       "min":"0.1"}))

    allow_stealing = forms.ChoiceField(label='Allow Stealing',
                                       choices=((True, 'Yes'), (False,'No' )),
                                       widget=forms.Select(attrs={"v-model":"parameter_set.allow_stealing",}))
    
    hat_mode = forms.ChoiceField(label='Hat Mode',
                                 choices=HatModes.choices,
                                 widget=forms.Select(attrs={"v-model":"parameter_set.hat_mode",}))

    world_width = forms.IntegerField(label='World Width (pixels)',
                                     min_value=1,
                                     widget=forms.NumberInput(attrs={"v-model":"parameter_set.world_width",
                                                                     "step":"1",
                                                                     "min":"1000"}))
    
    world_height = forms.IntegerField(label='World Height (pixels)',
                                     min_value=1,
                                     widget=forms.NumberInput(attrs={"v-model":"parameter_set.world_height",
                                                                     "step":"1",
                                                                     "min":"1000"}))
    
    field_width = forms.IntegerField(label='Field Width (pixels)',
                                     min_value=1,
                                     widget=forms.NumberInput(attrs={"v-model":"parameter_set.field_width",
                                                                     "step":"1",
                                                                     "min":"1000"}))
    
    field_height = forms.IntegerField(label='Field Height (pixels)',
                                      min_value=1,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.field_height",
                                                                      "step":"1",
                                                                      "min":"1000"}))
    
    house_width = forms.IntegerField(label='House Width (pixels)',
                                     min_value=1,
                                     widget=forms.NumberInput(attrs={"v-model":"parameter_set.house_width",
                                                                     "step":"1",
                                                                     "min":"1000"}))
    
    house_height = forms.IntegerField(label='House Height (pixels)',
                                      min_value=1,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.house_height",
                                                                      "step":"1",
                                                                      "min":"1000"})) 
    
    avatar_scale = forms.DecimalField(label='Avatar Scale',
                                      max_digits=3,
                                      decimal_places=2,
                                      min_value=0.01,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.avatar_scale",
                                                                      "step":"0.01",
                                                                      "min":"0.01"})) 
    
    avatar_bound_box_percent = forms.DecimalField(label='Avatar Bounding Box Percent',
                                                    max_digits=3,
                                                    decimal_places=2,
                                                    min_value=0.01,
                                                    widget=forms.NumberInput(attrs={"v-model":"parameter_set.avatar_bound_box_percent",
                                                                                    "step":"0.01",
                                                                                    "min":"0.01"}))
    
    avatar_move_speed = forms.DecimalField(label='Avatar Move Speed (pixels per second)',
                                             max_digits=3,
                                             decimal_places=2,
                                             min_value=0.01,
                                             widget=forms.NumberInput(attrs={"v-model":"parameter_set.avatar_move_speed",
                                                                            "step":"0.01",
                                                                            "min":"0.01"}))
    
    avatar_animation_speed = forms.DecimalField(label='Avatar Animation Speed',
                                                max_digits=3,
                                                decimal_places=2,
                                                min_value=0.01,
                                                widget=forms.NumberInput(attrs={"v-model":"parameter_set.avatar_animation_speed",
                                                                                "step":"0.01",
                                                                                "min":"0.01"}))

    production_effort = forms.IntegerField(label='Production Effort',
                                         min_value=1,
                                         widget=forms.NumberInput(attrs={"v-model":"parameter_set.production_effort",
                                                                          "step":"1",
                                                                          "min":"1"}))
    
    max_patch_harvests = forms.IntegerField(label='Max Patch Harvests per Period',
                                            min_value=1,
                                            widget=forms.NumberInput(attrs={"v-model":"parameter_set.max_patch_harvests",
                                                                            "step":"1",
                                                                            "min":"1"}))
    
    patch_harvest_mode = forms.ChoiceField(label='Patch Harvest Mode',
                                  choices=HarvestModes.choices,
                                  widget=forms.Select(attrs={"v-model":"parameter_set.patch_harvest_mode",}))
    
    chat_mode = forms.ChoiceField(label='Chat Mode',
                                  choices=ChatModes.choices,
                                  widget=forms.Select(attrs={"v-model":"parameter_set.chat_mode",}))
    
    enable_emoji = forms.ChoiceField(label='Enable Emojis',
                                     choices=((True, 'Yes'), (False,'No' )),
                                     widget=forms.Select(attrs={"v-model":"parameter_set.enable_emoji",}))
     
    chat_rules_word_list = forms.CharField(label='Limited Chat Word List (comma, space, tab and/or line separated)',
                                          required=False,
                                          widget=forms.Textarea(attrs={"v-model":"parameter_set.chat_rules_word_list",
                                                                       "rows":"5",}))
    
    good_mode = forms.ChoiceField(label='Good Mode',
                                  choices=GoodModes.choices,
                                  widget=forms.Select(attrs={"v-model":"parameter_set.good_mode",}))

                                                 
    test_mode = forms.ChoiceField(label='Test Mode',
                                       choices=((True, 'Yes'), (False,'No' )),
                                       widget=forms.Select(attrs={"v-model":"parameter_set.test_mode",}))

    class Meta:
        model=ParameterSet
        fields =['period_count', 'period_length', 'night_length', 'break_frequency', 'break_length', 'show_instructions', 'instruction_set', 
                 'survey_required', 'survey_link', 'prolific_mode', 'prolific_completion_link', 'reconnection_limit',
                 'interaction_length', 'interaction_range', 'cool_down_length', 'starting_health', 'health_loss_per_second', 'heath_gain_per_sleep_second',
                 'consumption_alpha', 'consumption_beta', 'consumption_multiplier', 'cents_per_second', 'allow_attacks', 'attack_damage', 'attack_cost', 'allow_stealing', 'hat_mode', 'world_width', 'world_height',
                 'field_width', 'field_height', 'house_width', 'house_height', 'avatar_scale', 'avatar_bound_box_percent', 'avatar_move_speed', 'avatar_animation_speed',
                 'production_effort', 'max_patch_harvests', 'patch_harvest_mode',
                 'chat_mode', 'enable_emoji', 'chat_rules_word_list', 'good_mode', 'test_mode']
                 
    def clean_survey_link(self):
        
        try:
           survey_link = self.data.get('survey_link')
           survey_required = self.data.get('survey_required')

           if survey_required == 'True' and not "http" in survey_link:
               raise forms.ValidationError('Invalid link')
            
        except ValueError:
            raise forms.ValidationError('Invalid Entry')

        return survey_link
    
    def clean_prolific_completion_link(self):
        
        try:
           prolific_completion_link = self.data.get('prolific_completion_link')
           prolific_mode = self.data.get('prolific_mode')

           if prolific_mode == 'True' and not "http" in prolific_completion_link:
               raise forms.ValidationError('Enter Prolific completion URL')
            
        except ValueError:
            raise forms.ValidationError('Invalid Entry')

        return prolific_completion_link

    def clean_chat_rules_word_list(self):
            
            chat_rules_word_list_start = self.data.get('chat_rules_word_list')
            chat_rules_word_list_end = []

            chat_rules_word_list_start = chat_rules_word_list_start.splitlines()

            for i in range(len(chat_rules_word_list_start)):
            
                v = re.split(r',|\t', chat_rules_word_list_start[i])

                for j in range(len(v)):
                    t = v[j].strip()

                    if t != '':
                        chat_rules_word_list_end.append(t)
            
            chat_rules_word_list_end.sort()

            output = ""
            for i in range(len(chat_rules_word_list_end)):
                output += chat_rules_word_list_end[i].lower()
                if i != len(chat_rules_word_list_end) - 1:
                    output += "\n"
                    
            return output

    def clean_consumption_multiplier(self):
            
            consumption_multiplier_start = self.data.get('consumption_multiplier')
            consumption_multiplier_end = []

            consumption_multiplier_start = consumption_multiplier_start.splitlines()

            for i in range(len(consumption_multiplier_start)):
            
                v = re.split(r',|\t', consumption_multiplier_start[i])

                for j in range(len(v)):
                    t = v[j].strip()

                    if t != '':
                        consumption_multiplier_end.append(t)
            
            consumption_multiplier_end.sort()

            output = ""
            for i in range(len(consumption_multiplier_end)):
                output += consumption_multiplier_end[i].lower()
                if i != len(consumption_multiplier_end) - 1:
                    output += "\n"
                    
            return output
