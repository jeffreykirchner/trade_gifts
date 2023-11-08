'''
gloabal functions related to parameter sets
'''

from django.db import models
from django.utils.translation import gettext_lazy as _

class ExperimentPhase(models.TextChoices):
    '''
    experiment phases
    '''
    INSTRUCTIONS = 'Instructions', _('Instructions')
    RUN = 'Run', _('Run')
    NAMES = 'Names', _('Names')
    DONE = 'Done', _('Done')

class Goods(models.TextChoices):
    '''
    experiment phases
    '''
    CHERRY = 'Cherry', _('Cherry')
    BLUEBERRY = 'Blueberry', _('Blueberry')
    PINEAPPLE = 'Pineapple', _('Pineapple')
    
class ChatModes(models.TextChoices):
    '''
    experiment chat modes
    '''
    FULL = 'Full', _('Full')
    LIMITED = 'Limited', _('Limited')

class GoodModes(models.TextChoices):
    '''
    two or three good mode
    '''
    TWO = 'Two', _('Two')
    THREE = 'Three', _('Three')

class HarvestModes(models.TextChoices):
    '''
    harvest modes
    '''
    ANY = 'Any', _('Any')
    ONCE_PER_GROUP = 'Once per Group', _('Once per Group')

