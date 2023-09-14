'''
instruction set
'''

#import logging

from django.db import models

import main

class InstructionSet(models.Model):
    '''
    instruction set model
    '''

    label = models.CharField(max_length = 100, default="Name Here", verbose_name="Label")                 #label text

    action_page_move = models.IntegerField(verbose_name='Required Action: Production', default=1)
    action_page_harvest = models.IntegerField(verbose_name='Required Action: Production', default=3)
    action_page_house = models.IntegerField(verbose_name='Required Action: Production', default=4)
    action_page_sleep = models.IntegerField(verbose_name='Required Action: Production', default=5)
    action_page_attacks = models.IntegerField(verbose_name='Required Action: Production', default=6)
        
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.label}"

    class Meta:
        
        verbose_name = 'Instruction Set'
        verbose_name_plural = 'Instruction Sets'
        ordering = ['label']
        constraints = [
            models.UniqueConstraint(fields=['label', ], name='unique_instruction_set'),
        ]

    def copy_pages(self, i_set):
        '''
        copy instruction pages
        '''
        
        #session player periods
        instructions = []

        for i in i_set.all():
            instructions.append(main.models.Instruction(instruction_set=self, text_html=i.text_html, page_number=i.page_number))
        
        main.models.Instruction.objects.bulk_create(instructions)
        
    #return json object of class
    def json(self):
        '''
        json object of model
        '''

        return{
            "id" : self.id,         

            "label" : self.label,
            "action_page_move" : self.action_page_move,
            "action_page_harvest" : self.action_page_harvest,
            "action_page_house" : self.action_page_house,
            "action_page_sleep" : self.action_page_sleep,
            "action_page_attacks" : self.action_page_attacks,
            
            "instructions" : [i.json() for i in self.instructions.all()],
        }
    
    #return json object of class
    def json_min(self):
        '''
        json object of model
        '''

        return{
            "id" : self.id,         

            "label" : self.label,
        }
        