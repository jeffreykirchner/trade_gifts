'''
session model
'''

from datetime import datetime
from tinymce.models import HTMLField
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from decimal import Decimal

import logging
import uuid
import csv
import io
import json
import random
import re

from django.conf import settings

from django.dispatch import receiver
from django.db import models
from django.db.models.signals import post_delete
from django.utils.timezone import now
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder

import main

from main.models import ParameterSet

from main.globals import ExperimentPhase

#experiment sessoin
class Session(models.Model):
    '''
    session model
    '''
    parameter_set = models.ForeignKey(ParameterSet, on_delete=models.CASCADE)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions_a")
    collaborators = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="sessions_b")

    title = models.CharField(max_length = 300, default="*** New Session ***")    #title of session
    start_date = models.DateField(default=now)                                   #date of session start

    channel_key = models.UUIDField(default=uuid.uuid4, editable=False, verbose_name = 'Channel Key')     #unique channel to communicate on
    session_key = models.UUIDField(default=uuid.uuid4, editable=False, verbose_name = 'Session Key')     #unique key for session to auto login subjects by id

    controlling_channel = models.CharField(max_length = 300, default="")         #channel controlling session

    started =  models.BooleanField(default=False)                                #starts session and filll in session

    shared = models.BooleanField(default=False)                                  #shared session parameter sets can be imported by other users
    locked = models.BooleanField(default=False)                                  #locked models cannot be deleted

    invitation_text = HTMLField(default="", verbose_name="Invitation Text")       #inviataion email subject and text
    invitation_subject = HTMLField(default="", verbose_name="Invitation Subject")

    world_state = models.JSONField(encoder=DjangoJSONEncoder, null=True, blank=True, verbose_name="Current Session State")       #world state at this point in session
    world_state_avatars = models.JSONField(encoder=DjangoJSONEncoder, null=True, blank=True, verbose_name="Current Avatar State")       #world state at this point in session

    # summary_data = models.JSONField(encoder=DjangoJSONEncoder, null=True, blank=True, verbose_name="Summary Data")       #summary data for session

    soft_delete =  models.BooleanField(default=False)                             #hide session if true

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def creator_string(self):
        return self.creator.email
    creator_string.short_description = 'Creator'

    class Meta:
        verbose_name = 'Session'
        verbose_name_plural = 'Sessions'
        ordering = ['-start_date']

    def get_start_date_string(self):
        '''
        get a formatted string of start date
        '''
        return  self.start_date.strftime("%#m/%#d/%Y")

    def get_group_channel_name(self):
        '''
        return channel name for group
        '''
        page_key = f"session-{self.id}"
        room_name = f"{self.channel_key}"
        return  f'{page_key}-{room_name}'
    
    def send_message_to_group(self, message_type, message_data):
        '''
        send socket message to group
        '''
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(self.get_group_channel_name(),
                                                {"type" : message_type,
                                                 "data" : message_data})

    def start_experiment(self):
        '''
        setup and start experiment
        '''

        self.started = True
        # self.current_period = 1
        self.start_date = datetime.now()
        #self.time_remaining = self.parameter_set.period_length
        
        session_periods = []

        for i in range(self.parameter_set.period_count):
            session_periods.append(main.models.SessionPeriod(session=self, period_number=i+1))
        
        main.models.SessionPeriod.objects.bulk_create(session_periods)

        self.save()

        for i in self.session_players.all():
            i.start()

        for i in self.session_periods.all():
            i.start()

        self.setup_world_state()
        self.setup_summary_data()

    
    def setup_summary_data(self):
        '''
        setup summary data
        '''
        
        parameter_set_patches = self.parameter_set.parameter_set_patches_a.values('id').all()
        session_players = self.session_players.values('id','parameter_set_player__id').all()
        parameter_set = self.parameter_set.json()
        world_state = self.world_state
        
        self.summary_data = {}

        # parameter_set_patches = self.parameter_set.parameter_set_patches_a.values('id').all()
        # session_players = self.session.session_players.values('id').all()

        # period_number = self.period_number

        id = self.id

        summary_data = {}

        for j in session_players:
            j_s = str(j["id"])
            summary_data[j_s] = {}
            v = summary_data[j_s]
           
            v["period_earnings"] = 0
            v["start_health"] = None
            v["end_health"] = None
            v["health_from_sleep"] = 0
            v["health_from_house"] = 0
            v["hat_at_end"] = None

            #total harvested / consumption
            for k in main.globals.Goods.choices:
                v["harvest_total_" + k[0]] = 0
                v["house_" + k[0]] = 0
                v["avatar_" + k[0]] = 0
            
            #patches
            for k in parameter_set_patches:
                k_s = str(k["id"])
                v["patch_harvests_count_" + k_s] = 0
                v["patch_harvests_total_" + k_s] = 0

            #interactions with others
            for k in session_players:
                k_s = str(k["id"])
                v["attacks_at_" + k_s] = 0
                v["attacks_from_" + k_s] = 0
                v["attacks_cost_at_" + k_s] = 0
                v["attacks_damage_from_" + k_s] = 0
 
                v["hat_accept_to_" + k_s] = 0
                v["hat_reject_to_" + k_s] = 0

                v["hat_accept_from_" + k_s] = 0
                v["hat_reject_from_" + k_s] = 0

                for l in main.globals.Goods.choices:
                    v["send_avatar_to_avatar_" + k_s + "_good_" + l[0]] = 0
                    v["send_avatar_to_house_" + str(k["parameter_set_player__id"]) + "_good_" + l[0]] = 0


        self.session_periods.all().update(summary_data=summary_data)

        session_period_1 = self.session_periods.get(period_number=1)

        #set startinging values
        for i in session_period_1.summary_data:
            session_period_1.summary_data[i]["start_health"] = parameter_set["starting_health"]
            session_period_1.summary_data[i]["hat_at_end"] = world_state["avatars"][i]["parameter_set_hat_id"]

        session_period_1.save()
        
    def setup_world_state(self):
        '''
        setup world state
        '''
        self.world_state = {
                            "fields":{},
                            "houses":{},
                            "avatars":{},
                            "patches":{},
                            "current_period":1,
                            "current_experiment_phase":ExperimentPhase.INSTRUCTIONS if self.parameter_set.show_instructions else ExperimentPhase.RUN,
                            "time_remaining":self.parameter_set.period_length,
                            "timer_running":False,
                            "timer_history":[],
                            "started":self.started,
                            "finished":False,
                            "session_periods":{str(i.id) : i.json() for i in self.session_periods.all()},
                            "session_periods_order" : list(self.session_periods.all().values_list('id', flat=True)),
                            }
        
        self.world_state_avatars={"last_update":str(datetime.now()),
                                  "session_players":{},
                                  }
        
        parameter_set = self.parameter_set.json()

        #fields
        for i in parameter_set["parameter_set_fields"]:
            v = {}
            v = parameter_set["parameter_set_fields"][i]

            session_player = main.models.SessionPlayer.objects.get(parameter_set_player_id=int(v["parameter_set_player"]))
            v["session_player"] = session_player.id

            for j in main.globals.Goods.choices:
                v[j[0]] = 0

            v["good_one_effort"] = parameter_set["production_effort"] / 2
            v["good_two_effort"] = parameter_set["production_effort"] / 2

            v["good_one_effort_in_use"] = v["good_one_effort"]
            v["good_two_effort_in_use"] = v["good_two_effort"]

            v["harvest_history"] = {str(i.id):[] for i in self.session_periods.all()}

            self.world_state["fields"][str(v["id"])] = v

        #patches
        for i in parameter_set["parameter_set_patches"]:
            v = {}
            v = parameter_set["parameter_set_patches"][i]
            v["max_levels"] = len(v["levels"])
            v["radius"] = 0

            for j in v["levels"]:
                v["levels"][j]["harvested"] = False

            self.world_state["patches"][str(v["id"])] = v
        
        #houses
        for i in parameter_set["parameter_set_players"]:
            v = {}
            v["id"] =  parameter_set["parameter_set_players"][i]["id"]

            session_player = main.models.SessionPlayer.objects.get(parameter_set_player_id= v["id"])
            v["session_player"] = session_player.id
            v["health_value"] = "0"
            
            for j in main.globals.Goods.choices:
                v[j[0]] = 0
            
            self.world_state["houses"][str(v["id"])] = v
        
        #session players
        for i in self.session_players.prefetch_related('parameter_set_player').all().values('id', 
                                                                                            'parameter_set_player__start_x',
                                                                                            'parameter_set_player__start_y',
                                                                                            'parameter_set_player__parameter_set_hat__id',
                                                                                            'parameter_set_player__id'):
            v = {}

            v['current_location'] = {'x':i['parameter_set_player__start_x'], 'y':i['parameter_set_player__start_y']}
            v['target_location'] = v['current_location']           
            v['nav_point'] = None
            v['tractor_beam_target'] = None
            v['frozen'] = False
            v['cool_down'] = 0
            v['interaction'] = 0     
            v['parameter_set_player_id'] = i['parameter_set_player__id']       

            self.world_state_avatars["session_players"][str(i["id"])] = v

            v2 = {}
            v2['earnings'] = "0"
            v2['health'] = parameter_set["starting_health"]
            v2['sleeping'] = False
            v2['period_patch_harvests'] = 0
            v2['period_patch_harvests_ids'] = []
            v2['parameter_set_player_id'] = i['parameter_set_player__id']
            v2['parameter_set_hat_id'] = i['parameter_set_player__parameter_set_hat__id']
            for j in main.globals.Goods.choices:
                v2[j[0]] = 0

            self.world_state["avatars"][str(i["id"])] = v2
            
        self.save()

    def reset_experiment(self):
        '''
        reset the experiment
        '''
        self.started = False

        #self.time_remaining = self.parameter_set.period_length
        #self.timer_running = False
        self.world_state ={}
        self.world_state_avatars ={}
        self.save()

        for p in self.session_players.all():
            p.reset()

        self.session_periods.all().delete()
        self.session_events.all().delete()

        self.setup_world_state()

        # self.parameter_set.setup()
    
    def reset_connection_counts(self):
        '''
        reset connection counts
        '''
        self.session_players.all().update(connecting=False, connected_count=0)
    
    def get_current_session_period(self):
        '''
        return the current session period
        '''
        if not self.started:
            return None

        return self.session_periods.get(period_number=self.world_state["current_period"])

    async def aget_current_session_period(self):
        '''
        return the current session period
        '''
        if not self.started:
            return None

        return await self.session_periods.aget(period_number=self.world_state["current_period"])
    
    def update_player_count(self):
        '''
        update the number of session players based on the number defined in the parameterset
        '''

        self.session_players.all().delete()
    
        for count, i in enumerate(self.parameter_set.parameter_set_players.all()):
            new_session_player = main.models.SessionPlayer()

            new_session_player.session = self
            new_session_player.parameter_set_player = i
            new_session_player.player_number = i.player_number

            new_session_player.save()

    def user_is_owner(self, user):
        '''
        return turn is user is owner or an admin
        '''

        if user.is_staff:
            return True

        if user==self.creator:
            return True
        
        return False

    def get_download_summary_csv(self):
        '''
        return data summary in csv format
        '''
        logger = logging.getLogger(__name__)
        
        with io.StringIO() as output:

            world_state = self.world_state
            parameter_set = self.parameter_set.json()
           
            parameter_set_players = {}
            for i in self.session_players.all().values('id','parameter_set_player__id_label'):
                parameter_set_players[str(i['id'])] = i

            writer = csv.writer(output, quoting=csv.QUOTE_NONNUMERIC)
            
            temp_header = ["Session ID", "Period", "Client #", "Label", "Period Earnings ¢", "Hat at End", "Start Health", "End Health", "Health From Sleep", "Health From House"]

            #good totals
            for k in main.globals.Goods.choices:
                temp_header.append("Harvest Total " + k[0])
            
            for k in main.globals.Goods.choices:
                temp_header.append("House Final " + k[0])
            
            for k in main.globals.Goods.choices:
                temp_header.append("Avatar Final " + k[0])
                
            #avatar interactions
            for player_number, player in enumerate(world_state["avatars"]):
                temp_header.append("Attacks At " + str(player_number+1))
                temp_header.append("Attacks From " + str(player_number+1))
                temp_header.append("Cost of Attacks At " + str(player_number+1))
                temp_header.append("Damage of Attacks From " + str(player_number+1))

                for k in main.globals.Goods.choices:
                    temp_header.append("Send " + k[0] + " to Avatar " + str(player_number+1))
                
                for k in main.globals.Goods.choices:
                    temp_header.append("Send " + k[0] + " to House " + str(player_number+1))

                temp_header.append("Hat To " + str(player_number+1) + ' Accept')
                temp_header.append("Hat To " + str(player_number+1) + ' Reject')
                temp_header.append("Hat From " + str(player_number+1) + ' Accept')
                temp_header.append("Hat From " + str(player_number+1) + ' Reject')
                
            #patch harvests
            for patch_number, patch in enumerate(world_state["patches"]):
                temp_header.append("Patch Harvests Count " + str(patch_number+1))
                temp_header.append("Patch Harvests Total " + str(patch_number+1))
            
            writer.writerow(temp_header)

            # logger.info(parameter_set_players)

            for period_number, period in enumerate(world_state["session_periods"]):
                summary_data = self.session_periods.get(id=period).summary_data

                for player_number, player in enumerate(world_state["avatars"]):
                    temp_p = summary_data[player]

                    temp_row = [self.id, 
                                    period_number+1, 
                                    player_number+1,
                                    parameter_set_players[str(player)]["parameter_set_player__id_label"], 
                                    temp_p["period_earnings"],
                                    parameter_set["parameter_set_hats"][str(temp_p["hat_at_end"])]["info"] if temp_p["hat_at_end"] else "",
                                    temp_p["start_health"],
                                    temp_p["end_health"],
                                    temp_p["health_from_sleep"],
                                    temp_p["health_from_house"],
                                    ]
                    
                    #good totals
                    for k in main.globals.Goods.choices:
                        temp_row.append(temp_p["harvest_total_" + k[0]])

                    for k in main.globals.Goods.choices:
                        temp_row.append(temp_p["house_" + k[0]])

                    for k in main.globals.Goods.choices:
                        temp_row.append(temp_p["avatar_" + k[0]])

                    #avatar interactions
                    for k in world_state["avatars"]:
                        parameter_set_player_id =  str(world_state["avatars"][k]["parameter_set_player_id"])

                        temp_row.append(temp_p["attacks_at_" + k])
                        temp_row.append(temp_p["attacks_from_" + k])
                        temp_row.append(temp_p["attacks_cost_at_" + k])
                        temp_row.append(temp_p["attacks_damage_from_" + k])

                        for l in main.globals.Goods.choices:
                            temp_row.append(temp_p["send_avatar_to_avatar_" + k + "_good_" + l[0]])
                        
                        for l in main.globals.Goods.choices:
                            temp_row.append(temp_p["send_avatar_to_house_" + parameter_set_player_id + "_good_" + l[0]])

                        temp_row.append(temp_p["hat_accept_to_" + k])
                        temp_row.append(temp_p["hat_reject_to_" + k])

                        temp_row.append(temp_p["hat_accept_from_" + k])
                        temp_row.append(temp_p["hat_reject_from_" + k])
                                            
                    #patch harvests
                    for patch_number, patch in enumerate(world_state["patches"]):
                        temp_row.append(temp_p["patch_harvests_count_" + patch])
                        temp_row.append(temp_p["patch_harvests_total_" + patch])

                    # temp_row.append(Decimal(temp_p["start_health"]) - Decimal(temp_p["end_health"]))

                    writer.writerow(temp_row)
                    
            v = output.getvalue()
            output.close()

        return v
    
    def get_download_action_csv(self):
        '''
        return data actions in csv format
        '''
        with io.StringIO() as output:

            writer = csv.writer(output, quoting=csv.QUOTE_NONNUMERIC)

            writer.writerow(["Session ID", "Period", "Time", "Client #", "Label", "Action","Info (Plain)", "Info (JSON)", "Timestamp"])

            # session_events =  main.models.SessionEvent.objects.filter(session__id=self.id).prefetch_related('period_number', 'time_remaining', 'type', 'data', 'timestamp')
            # session_events = session_events.select_related('session_player')

            world_state = self.world_state
            session_players = {}
            for i in self.session_players.all().values('id','player_number','parameter_set_player__id_label'):
                session_players[str(i['id'])] = i

            for p in self.session_events.exclude(type="time").exclude(type="world_state").exclude(type='target_locations'):

                writer.writerow([self.id,
                                p.period_number, 
                                p.time_remaining, 
                                session_players[str(p.session_player_id)]["player_number"], 
                                session_players[str(p.session_player_id)]["parameter_set_player__id_label"], 
                                p.type, 
                                self.action_data_parse(p.type, p.data, session_players),
                                p.data, 
                                p.timestamp])
            
            v = output.getvalue()
            output.close()

        return v

    def action_data_parse(self, type, data, session_players):
        '''
        return plain text version of action
        '''

        if type == "chat":
            nearby_text = ""
            for i in data["nearby_players"]:
                if nearby_text != "":
                    nearby_text += ", "
                nearby_text += f'{session_players[str(i)]["parameter_set_player__id_label"]}'

            temp_s = re.sub("\n", " ", data["text"])
            return f'{temp_s} @  {nearby_text}'
        elif type == "emoji":
            nearby_text = ""
            for i in data.get("nearby_players",[]):
                if nearby_text != "":
                    nearby_text += ", "
                nearby_text += f'{session_players[str(i)]["parameter_set_player__id_label"]}'

            return f'{data["emoji_type"]} @  {nearby_text}'
        elif type == "patch_harvest":
            return f'{data["harvest_amount"]} {data["patch"]["good"]} from {data["patch"]["info"]}' 
        elif type == "attack_avatar":
            return f'{session_players[str(data["source_player_id"])]["parameter_set_player__id_label"]} -> {session_players[str(data["target_player_id"])]["parameter_set_player__id_label"]}' 
        elif type == "move_fruit_to_avatar":
             return f'{data["good_one_move"]} {data["goods"]["good_one"]}, {data["good_two_move"]} {data["goods"]["good_two"]}, {data["good_three_move"]} {data["goods"].get("good_three","None")}'
        elif type == "move_fruit_house":
            return f'{data["direction"]}: {data["good_one_move"]} {data["goods"]["good_one"]}, {data["good_two_move"]} {data["goods"]["good_two"]}, {data["good_three_move"]} {data["goods"].get("good_three","None")}'
        elif type == "help_doc":
            return data
        elif type == "hat_avatar":

            source_label = session_players[str(data["source_player_id"])]["parameter_set_player__id_label"]
            target_label = session_players[str(data["target_player_id"])]["parameter_set_player__id_label"]

            source_hat = self.parameter_set.parameter_set_hats.get(id=data["source_player_hat_id"]).info
            target_hat = self.parameter_set.parameter_set_hats.get(id=data["target_player_hat_id"]).info

            if data["type"] == "open":               
                return f'{source_label} proposes hat trade to {target_label} : {source_hat} for {target_hat}'
            else:
                return f'{target_label} accepts hat trade with {source_label}: {target_hat} for {source_hat}'
        elif type =="hat_avatar_cancel":
            source_label = session_players[str(data["source_player_id"])]["parameter_set_player__id_label"]
            target_label = session_players[str(data["target_player_id"])]["parameter_set_player__id_label"]

            source_hat = self.parameter_set.parameter_set_hats.get(id=data["source_player_hat_id"]).info
            target_hat = self.parameter_set.parameter_set_hats.get(id=data["target_player_hat_id"]).info
            
            return f'{source_label} rejects hat trade with {target_label}: {source_hat} for {target_hat}'

        return ""
    
    def get_download_recruiter_csv(self):
        '''
        return data recruiter in csv format
        '''
        with io.StringIO() as output:

            writer = csv.writer(output)

            parameter_set_players = {}
            for i in self.session_players.all().values('id','student_id'):
                parameter_set_players[str(i['id'])] = i

            for p in self.world_state["avatars"]:
                writer.writerow([parameter_set_players[p]["student_id"],
                                 self.world_state["avatars"][p]["earnings"]])

            v = output.getvalue()
            output.close()

        return v
    
    def get_download_payment_csv(self):
        '''
        return data payments in csv format
        '''
        with io.StringIO() as output:

            writer = csv.writer(output)

            writer.writerow(['Session', 'Date', 'Player #', 'Label', 'Earnings'])

            # session_players = self.session_players.all()

            # for p in session_players:
            #     writer.writerow([self.id, self.get_start_date_string(), p.player_number,p.name, p.student_id, p.earnings/100])

            session_players = {}
            for i in self.session_players.all().values('id', 'player_number', 'parameter_set_player__id_label'):
                session_players[str(i['id'])] = i

            for p in self.world_state["avatars"]:
                writer.writerow([self.id,
                                 self.get_start_date_string(),
                                 session_players[p]["player_number"],
                                 session_players[p]["parameter_set_player__id_label"],
                                 self.world_state["avatars"][p]["earnings"]])

            v = output.getvalue()
            output.close()

        return v
    
    def json(self):
        '''
        return json object of model
        '''
                                                                      
        return{
            "id":self.id,
            "title":self.title,
            "locked":self.locked,
            "start_date":self.get_start_date_string(),
            "started":self.started,
            "parameter_set":self.parameter_set.json(),
            "session_periods":{i.id : i.json() for i in self.session_periods.all()},
            "session_periods_order" : list(self.session_periods.all().values_list('id', flat=True)),
            "session_players":{i.id : i.json(False) for i in self.session_players.all()},
            "session_players_order" : list(self.session_players.all().values_list('id', flat=True)),
            "invitation_text" : self.invitation_text,
            "invitation_subject" : self.invitation_subject,
            "world_state" : self.world_state,
            "world_state_avatars" : self.world_state_avatars,
        }
    
    def json_for_subject(self, session_player):
        '''
        json object for subject screen
        session_player : SessionPlayer() : session player requesting session object
        '''
        
        return{
            "started":self.started,
            "parameter_set":self.parameter_set.get_json_for_subject(),

            "session_players":{i.id : i.json_for_subject(session_player) for i in self.session_players.all()},
            "session_players_order" : list(self.session_players.all().values_list('id', flat=True)),

            "session_periods":{i.id : i.json() for i in self.session_periods.all()},
            "session_periods_order" : list(self.session_periods.all().values_list('id', flat=True)),

            "world_state" : self.world_state,
            "world_state_avatars" : self.world_state_avatars,
        }
    
    def json_for_timer(self):
        '''
        return json object for timer update
        '''

        session_players = []

        return{
            "started":self.started,
            "session_players":session_players,
            "session_player_earnings": [i.json_earning() for i in self.session_players.all()]
        }
    
    def json_for_parameter_set(self):
        '''
        return json for parameter set setup.
        '''
        message = {
            "id" : self.id,
            "started": self.started,
        }
    
        return message
        
@receiver(post_delete, sender=Session)
def post_delete_parameterset(sender, instance, *args, **kwargs):
    '''
    use signal to delete associated parameter set
    '''
    if instance.parameter_set:
        instance.parameter_set.delete()
