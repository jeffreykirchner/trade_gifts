'''
parameter set
'''
import logging
import json

from decimal import Decimal

from django.db import models
from django.db.utils import IntegrityError
from django.core.serializers.json import DjangoJSONEncoder
from django.core.exceptions import ObjectDoesNotExist

from main import globals

from main.models import InstructionSet

import main

class ParameterSet(models.Model):
    '''
    parameter set
    '''    
    instruction_set = models.ForeignKey(InstructionSet, on_delete=models.CASCADE, related_name="parameter_sets")

    period_count = models.IntegerField(verbose_name='Number of periods', default=20)                          #number of periods in the experiment
    period_length = models.IntegerField(verbose_name='Period Length, Production', default=60           )      #period length in seconds
    
    private_chat = models.BooleanField(default=True, verbose_name='Private Chat')                             #if true subjects can privately chat one on one
    show_instructions = models.BooleanField(default=True, verbose_name='Show Instructions')                   #if true show instructions

    survey_required = models.BooleanField(default=False, verbose_name="Survey Required")                      #if true show the survey below
    survey_link = models.CharField(max_length = 1000, default = '', verbose_name = 'Survey Link', blank=True, null=True)

    prolific_mode = models.BooleanField(default=False, verbose_name="Prolific Mode")                          #put study into prolific mode
    prolific_completion_link = models.CharField(max_length = 1000, default = '', verbose_name = 'Forward to Prolific after sesison', blank=True, null=True) #at the completion of the study forward subjects to link

    world_width = models.IntegerField(verbose_name='Width of world in pixels', default=10000)                 #world width in pixels
    world_height = models.IntegerField(verbose_name='Height of world in pixels', default=10000)               #world height in pixels

    field_width = models.IntegerField(verbose_name='Width of field in pixels', default=300)                  #field width in pixels
    field_height = models.IntegerField(verbose_name='Height of field in pixels', default=500)                #field height in pixels

    house_width = models.IntegerField(verbose_name='Width of house in pixels', default=350)                  #house width in pixels
    house_height = models.IntegerField(verbose_name='Height of house in pixels', default=500)                #house height in pixels

    avatar_scale = models.DecimalField(verbose_name='Avatar Scale', decimal_places=2, max_digits=3, default=1) #avatar scale
    
    production_effort = models.IntegerField(verbose_name='Production Effort', default=10)                     # the amount of effort a subject can put into production

    interaction_length = models.IntegerField(verbose_name='Interaction Length', default=10)                   #interaction length in seconds
    cool_down_length = models.IntegerField(verbose_name='Cool Down Length', default=10)                       #cool down length in seconds
    interaction_range = models.IntegerField(verbose_name='Interaction Range', default=300)                    #interaction range in pixels

    reconnection_limit = models.IntegerField(verbose_name='Age Warning', default=25)       #age cut that issues a warning for invalid age range

    test_mode = models.BooleanField(default=False, verbose_name='Test Mode')                                #if true subject screens will do random auto testing

    json_for_session = models.JSONField(encoder=DjangoJSONEncoder, null=True, blank=True)                   #json model of parameter set 

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)

    class Meta:
        verbose_name = 'Parameter Set'
        verbose_name_plural = 'Parameter Sets'
    
    def from_dict(self, new_ps):
        '''
        load values from dict
        '''
        logger = logging.getLogger(__name__) 

        message = "Parameters loaded successfully."
        status = "success"

        try:
            self.period_count = new_ps.get("period_count")
            self.period_length = new_ps.get("period_length")

            self.private_chat = False

            self.show_instructions = True if new_ps.get("show_instructions") == "True" else False

            self.survey_required = True if new_ps.get("survey_required") == "True" else False
            self.survey_link = new_ps.get("survey_link")

            self.prolific_mode = True if new_ps.get("prolific_mode", False) == "True" else False
            self.prolific_completion_link = new_ps.get("prolific_completion_link", None)

            self.world_width = new_ps.get("world_width", 1000)
            self.world_height = new_ps.get("world_height", 1000)

            self.field_width = new_ps.get("field_width", 300)
            self.field_height = new_ps.get("field_height", 500)

            self.house_width = new_ps.get("house_width", 350)
            self.house_height = new_ps.get("house_height", 500)

            self.avatar_scale = new_ps.get("avatar_scale", 1)

            self.production_effort = new_ps.get("production_effort", 10)

            self.interaction_length = new_ps.get("interaction_length", 10)
            self.cool_down_length = new_ps.get("cool_down_length", 10)
            self.interaction_range = new_ps.get("interaction_range", 300)

            self.reconnection_limit = new_ps.get("reconnection_limit", None)

            self.instruction_set = InstructionSet.objects.get(label=new_ps.get("instruction_set")["label"])

            self.save()

            #parameter set players
            self.parameter_set_players.all().delete()

            new_parameter_set_players = new_ps.get("parameter_set_players")
            new_parameter_set_players_map = {}

            for i in new_parameter_set_players:
                p = main.models.ParameterSetPlayer.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_players[i])
                new_parameter_set_players_map[i] = p.id

            self.update_player_count()

            #parameter set walls
            self.parameter_set_walls.all().delete()
            new_parameter_set_walls = new_ps.get("parameter_set_walls")

            for i in new_parameter_set_walls:
                p = main.models.ParameterSetWall.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_walls[i])

            #parameter set grounds
            self.parameter_set_grounds.all().delete()
            new_parameter_set_grounds = new_ps.get("parameter_set_grounds")

            for i in new_parameter_set_grounds:
                p = main.models.ParameterSetGround.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_grounds[i])

            #parameter set field types
            self.parameter_set_field_types.all().delete()
            new_parameter_set_field_types = new_ps.get("parameter_set_field_types")
            new_parameter_set_field_types_map = {}

            for i in new_parameter_set_field_types:
                p = main.models.ParameterSetFieldType.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_field_types[i])
                new_parameter_set_field_types_map[i] = p.id

            #parameter set fields
            self.parameter_set_fields_a.all().delete()
            new_parameter_set_fields = new_ps.get("parameter_set_fields")

            for i in new_parameter_set_fields:
                p = main.models.ParameterSetField.objects.create(parameter_set=self)
                v = new_parameter_set_fields[i]
                p.from_dict(v)

                if v["parameter_set_field_type"] != None:
                    p.parameter_set_field_type_id=new_parameter_set_field_types_map[str(v["parameter_set_field_type"])]
                
                if v["parameter_set_player"]:
                    p.parameter_set_player_id=new_parameter_set_players_map[str(v["parameter_set_player"])]

                p.save()

            self.json_for_session = None
            self.save()
            
        except IntegrityError as exp:
            message = f"Failed to load parameter set: {exp}"
            status = "fail"
            logger.warning(message)

        return {"status" : status, "message" :  message}

    def setup(self):
        '''
        default setup
        '''    
        self.json_for_session = None

        self.save()

        for i in self.parameter_set_players.all():
            i.setup()

    def add_player(self):
        '''
        add a parameterset player
        '''

        player = main.models.ParameterSetPlayer()
        player.parameter_set = self
        player.player_number = self.parameter_set_players.count() + 1
        player.id_label = player.player_number
        player.save()

        self.update_json_fk(update_players=True)
    
    def remove_player(self, parameterset_player_id):
        '''
        remove specified parameterset player
        '''
        
        try:
            player = self.parameter_set_players.get(id=parameterset_player_id)
            player.delete()

        except ObjectDoesNotExist:
            logger = logging.getLogger(__name__) 
            logger.warning(f"parameter set remove_player, not found ID: {parameterset_player_id}")

        self.update_player_count()
        self.update_json_fk(update_players=True, update_fields=True)
    
    def update_player_count(self):
        '''
        update the number of parameterset players
        '''
        for count, i in enumerate(self.parameter_set_players.all()):
            i.player_number = count + 1
            i.update_json_local()
            i.save()
    
    def update_json_local(self):
        '''
        update json model
        '''
        self.json_for_session["id"] = self.id
                
        self.json_for_session["period_count"] = self.period_count

        self.json_for_session["period_length"] = self.period_length

        self.json_for_session["private_chat"] = "False"
        self.json_for_session["show_instructions"] = "True" if self.show_instructions else "False"
        self.json_for_session["instruction_set"] = self.instruction_set.json_min()

        self.json_for_session["survey_required"] = "True" if self.survey_required else "False"
        self.json_for_session["survey_link"] = self.survey_link

        self.json_for_session["prolific_mode"] = "True" if self.prolific_mode else "False"
        self.json_for_session["prolific_completion_link"] = self.prolific_completion_link

        self.json_for_session["world_width"] = self.world_width
        self.json_for_session["world_height"] = self.world_height

        self.json_for_session["field_width"] = self.field_width
        self.json_for_session["field_height"] = self.field_height

        self.json_for_session["house_width"] = self.house_width
        self.json_for_session["house_height"] = self.house_height

        self.json_for_session["avatar_scale"] = self.avatar_scale

        self.json_for_session["production_effort"] = self.production_effort

        self.json_for_session["interaction_length"] = self.interaction_length
        self.json_for_session["cool_down_length"] = self.cool_down_length
        self.json_for_session["interaction_range"] = self.interaction_range

        self.json_for_session["reconnection_limit"] = self.reconnection_limit

        self.json_for_session["test_mode"] = "True" if self.test_mode else "False"

        self.save()
    
    def update_json_fk(self, update_players=False, 
                             update_walls=False, 
                             update_grounds=False, 
                             update_field_types=False,
                             update_fields=False):
        '''
        update json model
        '''
        if update_players:
            self.json_for_session["parameter_set_players_order"] = list(self.parameter_set_players.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_players"] = {p.id : p.json() for p in self.parameter_set_players.all()}

        if update_walls:
            self.json_for_session["parameter_set_walls_order"] = list(self.parameter_set_walls.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_walls"] = {p.id : p.json() for p in self.parameter_set_walls.all()}

        if update_grounds:
            self.json_for_session["parameter_set_grounds_order"] = list(self.parameter_set_grounds.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_grounds"] = {p.id : p.json() for p in self.parameter_set_grounds.all()}

        if update_field_types:
            self.json_for_session["parameter_set_field_types_order"] = list(self.parameter_set_field_types.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_field_types"] = {p.id : p.json() for p in self.parameter_set_field_types.all()}

        if update_fields:
            self.json_for_session["parameter_set_fields_order"] = list(self.parameter_set_fields_a.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_fields"] = {p.id : p.json() for p in self.parameter_set_fields_a.all()}

        self.save()

    def json(self, update_required=False):
        '''
        return json object of model, return cached version if unchanged
        '''
        if not self.json_for_session or \
           update_required:
            self.json_for_session = {}
            self.update_json_local()
            self.update_json_fk(update_players=True, 
                                update_walls=True, 
                                update_grounds=True, 
                                update_field_types=True, 
                                update_fields=True)

        return self.json_for_session
    
    def get_json_for_subject(self):
        '''
        return json object for subject, return cached version if unchanged
        '''
        
        if not self.json_for_session:
            return None

        v = self.json_for_session

        # v.pop("parameter_set_players")
        # v.pop("parameter_set_players_order")
        
        return v
        

