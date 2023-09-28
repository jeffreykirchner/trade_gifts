'''
instruction form admin screen
'''
from django import forms
from main.models import InstructionSet
from tinymce.widgets import TinyMCE

class InstructionSetFormAdmin(forms.ModelForm):
    '''
    instruction set form admin screen
    '''

    label = forms.CharField(label='Instruction Set Name',
                            widget=forms.TextInput(attrs={"width":"300px"}))
    
    action_page_move = forms.IntegerField(label='Required Action: Move', initial=1)
    action_page_harvest = forms.IntegerField(label='Required Action: Harvest', initial=3)
    action_page_house = forms.IntegerField(label='Required Action: House', initial=4)
    action_page_sleep = forms.IntegerField(label='Required Action: Sleep', initial=5)
    action_page_attacks = forms.IntegerField(label='Required Action: Attack', initial=6)
    

    class Meta:
        model=InstructionSet
        fields = ('label',)