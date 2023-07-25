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
    PINEAPPLE = 'Pineapple', _('Pineapple')
    BLUEBERRY = 'Blueberry', _('Blueberry')
