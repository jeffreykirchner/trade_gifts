'''
parameter set
'''
import logging
import json

from random import randint
from decimal import Decimal

from django.db import models
from django.db.utils import IntegrityError
from django.core.serializers.json import DjangoJSONEncoder
from django.core.exceptions import ObjectDoesNotExist

from main.globals import ChatModes
from main.globals import GoodModes

from main.models import InstructionSet

import main

class ParameterSet(models.Model):
    '''
    parameter set
    '''    
    instruction_set = models.ForeignKey(InstructionSet, on_delete=models.SET_NULL, related_name="parameter_sets", blank=True, null=True)

    period_count = models.IntegerField(verbose_name='Number of periods', default=20)                          #number of periods in the experiment
    period_length = models.IntegerField(verbose_name='Period Length, Production', default=60)                 #period length in seconds
    night_length = models.IntegerField(verbose_name='Night Length', default=10)                               #night length in seconds
    break_frequency = models.IntegerField(verbose_name='Break Frequency', default=7)                          #frequency of breaks
    break_length = models.IntegerField(verbose_name='Break Length', default=100)                              #length of breaks in seconds

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
    avatar_bound_box_percent = models.DecimalField(verbose_name='Avatar Bound Box Percent', decimal_places=2, max_digits=3, default=0.75) #avatar bound box percent for interaction

    production_effort = models.IntegerField(verbose_name='Production Effort', default=10)                     # the amount of effort a subject can put into production
    max_patch_harvests = models.IntegerField(verbose_name='Max Patch Harvests', default=1)                    #the maximum number of times a subject can harvest from a patch

    interaction_length = models.IntegerField(verbose_name='Interaction Length', default=10)                   #interaction length in seconds
    cool_down_length = models.IntegerField(verbose_name='Cool Down Length', default=10)                       #cool down length in seconds
    interaction_range = models.IntegerField(verbose_name='Interaction Range', default=300)                    #interaction range in pixels

    starting_health = models.IntegerField(verbose_name='Starting Health', default=75)                                                            #starting health
    health_loss_per_second = models.DecimalField(verbose_name='Health Loss per Second', decimal_places=2, max_digits=3, default=1.00)            #health loss per second
    heath_gain_per_sleep_second = models.DecimalField(verbose_name='Health Gain per Sleep Second', decimal_places=2, max_digits=4, default=5.00) #health gain per sleep second

    consumption_alpha = models.DecimalField(verbose_name='Consumption Alpha', decimal_places=5, max_digits=7, default=1.0)    #consumption alpha
    consumption_beta = models.DecimalField(verbose_name='Consumption Beta', decimal_places=5, max_digits=7, default=1.0)      #consumption beta
    consumption_multiplier = models.TextField(verbose_name='Consumption 3rd Good', default="", blank=True)                    #3rd good multiplier

    cents_per_second = models.DecimalField(verbose_name='Cents per Second', decimal_places=5, max_digits=7, default=0.016) #cents per second

    attack_cost = models.DecimalField(verbose_name='Attack Cost to Health', decimal_places=1, max_digits=3, default=5.0)     #attack cost
    attack_damage = models.DecimalField(verbose_name='Attack Damage to Health', decimal_places=1, max_digits=3, default=7.0) #attack damage
    allow_attacks = models.BooleanField(default=False, verbose_name="Allow Attacks")                                         #if true allow attacks

    allow_stealing = models.BooleanField(default=False, verbose_name="Allow Stealing")                      #if true all subjects to steal from other tribes
    enable_hats = models.BooleanField(default=False, verbose_name="Enable Hats")                            #if true subjects can exchange hats

    chat_mode = models.CharField(verbose_name="Chat Mode", max_length=100, choices=ChatModes.choices, default=ChatModes.FULL)         #chat mode
    chat_rules_letters = models.JSONField(verbose_name="Chat Letter Mapping", encoder=DjangoJSONEncoder, null=True, blank=True)       #chat rules for limited mode
    chat_rules_word_list = models.TextField(verbose_name='Chat Words Allowed List', default="", blank=True)             #chat rules for limited mode

    good_mode = models.CharField(verbose_name="Good Mode", max_length=100, choices=GoodModes.choices, default=GoodModes.THREE)         #two or three good mode

    reconnection_limit = models.IntegerField(verbose_name='Age Warning', default=25)                        #stop trying to reconnect after this many failed attempts

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
            self.night_length = new_ps.get("night_length")

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
            self.avatar_bound_box_percent = new_ps.get("avatar_bound_box_percent", 0.75)

            self.production_effort = new_ps.get("production_effort", 10)
            self.max_patch_harvests = new_ps.get("max_patch_harvests", 1)

            self.interaction_length = new_ps.get("interaction_length", 10)
            self.cool_down_length = new_ps.get("cool_down_length", 10)
            self.interaction_range = new_ps.get("interaction_range", 300)

            self.starting_health = new_ps.get("starting_health", 75)
            self.health_loss_per_second = new_ps.get("health_loss_per_second", 1.00)
            self.heath_gain_per_sleep_second = new_ps.get("heath_gain_per_sleep_second", 5.00)

            self.consumption_alpha = new_ps.get("consumption_alpha", 1.0)
            self.consumption_beta = new_ps.get("consumption_beta", 1.0)
            self.consumption_multiplier = new_ps.get("consumption_multiplier", "")

            self.cents_per_second = new_ps.get("cents_per_second", 0.016)

            self.attack_cost = new_ps.get("attack_cost", 5.0)
            self.attack_damage = new_ps.get("attack_damage", 7.0)
            self.allow_attacks = True if new_ps.get("allow_attacks") == "True" else False

            self.allow_stealing = True if new_ps.get("allow_stealing") == "True" else False
            self.enable_hats = True if new_ps.get("enable_hats") == "True" else False

            self.break_frequency = new_ps.get("break_frequency", 7)
            self.break_length = new_ps.get("break_length", 100)

            self.chat_mode = new_ps.get("chat_mode", ChatModes.FULL)
            self.chat_rules_letters = new_ps.get("chat_rules", {"letters": None})
            self.chat_rules_word_list = new_ps.get("chat_rules_word_list", "")

            self.good_mode = new_ps.get("good_mode", GoodModes.THREE)
            
            self.reconnection_limit = new_ps.get("reconnection_limit", None)

            self.instruction_set = InstructionSet.objects.get(label=new_ps.get("instruction_set")["label"])

            self.save()

            if self.chat_rules_letters["letters"] == None:
                self.setup_letter_map()

            #parameter set groups
            self.parameter_set_groups.all().delete()
            new_parameter_set_groups = new_ps.get("parameter_set_groups")
            new_parameter_set_groups_map = {}

            for i in new_parameter_set_groups:
                p = main.models.ParameterSetGroup.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_groups[i])
                new_parameter_set_groups_map[i] = p.id

            #parameter set hats
            self.parameter_set_hats.all().delete()
            new_parameter_set_hats = new_ps.get("parameter_set_hats")
            new_parameter_set_hats_map = {}

            for i in new_parameter_set_hats:
                p = main.models.ParameterSetHat.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_hats[i])
                new_parameter_set_hats_map[i] = p.id

            #parameter set players
            self.parameter_set_players.all().delete()

            new_parameter_set_players = new_ps.get("parameter_set_players")
            new_parameter_set_players_map = {}

            for i in new_parameter_set_players:
                p = main.models.ParameterSetPlayer.objects.create(parameter_set=self)
                v = new_parameter_set_players[i]
                p.from_dict(v)

                new_parameter_set_players_map[i] = p.id

                if v.get("parameter_set_group", None) != None:
                    p.parameter_set_group_id=new_parameter_set_groups_map[str(v["parameter_set_group"])]
                
                if v.get("parameter_set_hat", None) != None:
                    p.parameter_set_hat_id=new_parameter_set_hats_map[str(v["parameter_set_hat"])]

                p.save()

            self.update_player_count()

            #parameter set patches
            self.parameter_set_patches_a.all().delete()
            new_parameter_set_patches = new_ps.get("parameter_set_patches")

            for i in new_parameter_set_patches:
                p = main.models.ParameterSetPatch.objects.create(parameter_set=self)
                v = new_parameter_set_patches[i]
                p.from_dict(new_parameter_set_patches[i])

                if v.get("parameter_set_group", None) != None:
                    p.parameter_set_group_id=new_parameter_set_groups_map[str(v["parameter_set_group"])]
                p.save()

            #parameter set barriers
            self.parameter_set_barriers_a.all().delete()
            new_parameter_set_barriers = new_ps.get("parameter_set_barriers")

            for i in new_parameter_set_barriers:
                p = main.models.ParameterSetBarrier.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_barriers[i])

                groups = []
                for g in new_parameter_set_barriers[i]["parameter_set_groups"]:
                    groups.append(new_parameter_set_groups_map[str(g)])

                p.parameter_set_groups.set(groups)

            #parameter set walls
            self.parameter_set_walls.all().delete()
            new_parameter_set_walls = new_ps.get("parameter_set_walls")

            for i in new_parameter_set_walls:
                p = main.models.ParameterSetWall.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_walls[i])

            #parameter set notices
            self.parameter_set_notices.all().delete()
            new_parameter_set_notices = new_ps.get("parameter_set_notices")

            for i in new_parameter_set_notices:
                p = main.models.ParameterSetNotice.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_notices[i])

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
        
        self.chat_rules_letters = {"letters": None}
        self.setup_letter_map()
    
    def setup_letter_map(self):
        '''
        setup letter map for chat
        '''
        letters = {}

        for i in range(65, 91):
            letters[chr(i)] = None

        for i in range(97, 123):
            letters[chr(i)] = None

        for i in letters:
            if letters[i] == None:
                
                #find random letter
                while True:
                    r = chr(randint(33, 122))
                    if r.isalpha() and r != i and letters.get(r, "not found") != "not found" and letters[r] == None:
                        letters[i] = r
                        letters[r] = i
                        break
                        
        self.chat_rules_letters["letters"] = letters
        self.save() 


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
        self.json_for_session["night_length"] = self.night_length

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
        self.json_for_session["avatar_bound_box_percent"] = self.avatar_bound_box_percent

        self.json_for_session["production_effort"] = self.production_effort
        self.json_for_session["max_patch_harvests"] = self.max_patch_harvests

        self.json_for_session["interaction_length"] = self.interaction_length
        self.json_for_session["cool_down_length"] = self.cool_down_length
        self.json_for_session["interaction_range"] = self.interaction_range

        self.json_for_session["starting_health"] = self.starting_health
        self.json_for_session["health_loss_per_second"] = self.health_loss_per_second
        self.json_for_session["heath_gain_per_sleep_second"] = self.heath_gain_per_sleep_second

        self.json_for_session["consumption_alpha"] = self.consumption_alpha
        self.json_for_session["consumption_beta"] = self.consumption_beta
        self.json_for_session["consumption_multiplier"] = self.consumption_multiplier

        self.json_for_session["cents_per_second"] = self.cents_per_second

        self.json_for_session["attack_cost"] = self.attack_cost
        self.json_for_session["attack_damage"] = self.attack_damage
        self.json_for_session["allow_attacks"] = "True" if self.allow_attacks else "False"

        self.json_for_session["allow_stealing"] = "True" if self.allow_stealing else "False"
        self.json_for_session["enable_hats"] = "True" if self.enable_hats else "False"
        
        self.json_for_session["break_frequency"] = self.break_frequency
        self.json_for_session["break_length"] = self.break_length

        self.json_for_session["chat_mode"] = self.chat_mode
        self.json_for_session["chat_rules_letters"] = self.chat_rules_letters
        self.json_for_session["chat_rules_word_list"] = self.chat_rules_word_list

        self.json_for_session["good_mode"] = self.good_mode

        self.json_for_session["reconnection_limit"] = self.reconnection_limit

        self.json_for_session["test_mode"] = "True" if self.test_mode else "False"

        self.save()
    
    def update_json_fk(self, update_players=False, 
                             update_walls=False, 
                             update_grounds=False, 
                             update_field_types=False,
                             update_fields=False,
                             update_groups=False,
                             update_notices=False,
                             update_barriers=False,
                             update_patches=False,
                             update_hats=False):
        '''
        update json model
        '''
        if update_players:
            self.json_for_session["parameter_set_players_order"] = list(self.parameter_set_players.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_players"] = {str(p.id) : p.json() for p in self.parameter_set_players.all()}

        if update_walls:
            self.json_for_session["parameter_set_walls_order"] = list(self.parameter_set_walls.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_walls"] = {str(p.id) : p.json() for p in self.parameter_set_walls.all()}

        if update_grounds:
            self.json_for_session["parameter_set_grounds_order"] = list(self.parameter_set_grounds.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_grounds"] = {str(p.id) : p.json() for p in self.parameter_set_grounds.all()}

        if update_field_types:
            self.json_for_session["parameter_set_field_types_order"] = list(self.parameter_set_field_types.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_field_types"] = {str(p.id) : p.json() for p in self.parameter_set_field_types.all()}

        if update_fields:
            self.json_for_session["parameter_set_fields_order"] = list(self.parameter_set_fields_a.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_fields"] = {str(p.id) : p.json() for p in self.parameter_set_fields_a.all()}

        if update_groups:
            self.json_for_session["parameter_set_groups_order"] = list(self.parameter_set_groups.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_groups"] = {str(p.id) : p.json() for p in self.parameter_set_groups.all()}

        if update_notices:
            self.json_for_session["parameter_set_notices_order"] = list(self.parameter_set_notices.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_notices"] = {str(p.id) : p.json() for p in self.parameter_set_notices.all()}

        if update_barriers:
            self.json_for_session["parameter_set_barriers_order"] = list(self.parameter_set_barriers_a.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_barriers"] = {str(p.id) : p.json() for p in self.parameter_set_barriers_a.all()}

        if update_patches:
            self.json_for_session["parameter_set_patches_order"] = list(self.parameter_set_patches_a.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_patches"] = {str(p.id) : p.json() for p in self.parameter_set_patches_a.all()}

        if update_hats:
            self.json_for_session["parameter_set_hats_order"] = list(self.parameter_set_hats.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_hats"] = {str(p.id) : p.json() for p in self.parameter_set_hats.all()}

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
                                update_fields=True,
                                update_groups=True,
                                update_notices=True,
                                update_barriers=True,
                                update_patches=True,
                                update_hats=True)

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
        

