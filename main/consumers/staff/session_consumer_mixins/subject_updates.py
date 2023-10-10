
import logging
import re
import math

from asgiref.sync import sync_to_async
from decimal import Decimal
from textwrap import TextWrapper

from django.db import transaction
from django.db.models.fields.json import KT

from main.models import SessionPlayer
from main.models import Session
from main.models import SessionEvent
from django.utils.decorators import method_decorator

from datetime import datetime, timedelta

from main.globals import ExperimentPhase
from main.globals import convert_goods_to_health

import main

class SubjectUpdatesMixin():
    '''
    subject updates mixin for staff session consumer
    '''

    async def chat(self, event):
        '''
        take chat from client
        '''    
        if self.controlling_channel != self.channel_name:
            return    
       
        logger = logging.getLogger(__name__) 
        # logger.info(f"take chat: Session {self.session_id}, Player {self.session_player_id}, Data {data}")
        
        if not self.world_state_local["started"] or \
           self.world_state_local["finished"] or \
           self.world_state_local["current_experiment_phase"] != ExperimentPhase.RUN:
            logger.info(f"take chat: failed, session not started, finished, or not in run phase {self.world_state_local}")
            return
        
        result = {"value" : "success"}

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]
            event_data = event["message_text"]
            current_location = event_data["current_location"]
        except:
            logger.info(f"chat: invalid data, {event['message_text']}")
            return

        #update location 
        session_player = self.world_state_avatars_local["session_players"][str(player_id)]
        session_player["current_location"] = current_location
        
        result["text"] = event_data["text"]
        result["text_limited"] = await self.do_limited_chat(event_data["text"])
        result["sender_id"] = player_id
        result["nearby_players"] = []

        #format text for chat bubbles
        wrapper = TextWrapper(width=13, max_lines=6)
        result['text'] = wrapper.fill(text=result['text'])
        result['text_limited'] = wrapper.fill(text=result['text_limited'])

        #find nearby players
        session_players = self.world_state_avatars_local["session_players"]
        for i in session_players:
            if i != str(result["sender_id"]):
                source_pt = [session_players[str(result["sender_id"])]["current_location"]["x"], session_players[str(result["sender_id"])]["current_location"]["y"]]
                target_pt = [session_players[i]["current_location"]["x"], session_players[i]["current_location"]["y"]]
                
                if math.dist(source_pt, target_pt) <= 1000:
                    result["nearby_players"].append(i)

        await SessionEvent.objects.acreate(session_id=self.session_id, 
                                           session_player_id=result["sender_id"],
                                           type="chat",
                                           period_number=self.world_state_local["current_period"],
                                           time_remaining=self.world_state_local["time_remaining"],
                                           data=result)

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)
    
    async def do_limited_chat(self, text):

        output = "limited chat"
        word_list = self.parameter_set_local["chat_rules_word_list"].split("\n")
        letter_list = self.parameter_set_local["chat_rules_letters"]["letters"]

        word_list_re = "|".join(word_list)

        regex = re.compile(r'(?=(.))(?:' + word_list_re + ')', flags=re.IGNORECASE)
        output =re.sub(r'\b\w+\b', 
                       lambda w: w.group() if w.group().lower() in word_list else self.do_limited_chat_2(w.group(), letter_list), 
                       text)

        return output
    
    def do_limited_chat_2(self, text, letter_list):
        output = ""
        
        for i in text:
            if i.isdigit():
                output += i
            else:
                output += letter_list.get(i,"*")

        return output
        
    async def update_chat(self, event):
        '''
        send chat to clients, if clients can view it
        '''
        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_connection_status(self, event):
        '''
        handle connection status update from group member
        '''
        logger = logging.getLogger(__name__) 
        event_data = event["data"]

        #update not from a client
        if event_data["value"] == "fail":
            if not self.session_id:
                self.session_id = event["session_id"]

            logger.info(f"update_connection_status: event data {event}, channel name {self.channel_name}, group name {self.room_group_name}")

            if "session" in self.room_group_name:
                #connection from staff screen
                if event["connect_or_disconnect"] == "connect":
                    # session = await Session.objects.aget(id=self.session_id)
                    self.controlling_channel = event["sender_channel_name"]

                    if self.channel_name == self.controlling_channel:
                        logger.info(f"update_connection_status: controller {self.channel_name}, session id {self.session_id}")
                        await Session.objects.filter(id=self.session_id).aupdate(controlling_channel=self.controlling_channel) 
                        await self.send_message(message_to_self=None, message_to_group={"controlling_channel" : self.controlling_channel},
                                                message_type="set_controlling_channel", send_to_client=False, send_to_group=True)
                else:
                    #disconnect from staff screen
                    pass                   
            return
        
        subject_id = event_data["result"]["id"]

        session_player = await SessionPlayer.objects.aget(id=subject_id)
        event_data["result"]["name"] = session_player.name
        event_data["result"]["student_id"] = session_player.student_id
        event_data["result"]["current_instruction"] = session_player.current_instruction
        event_data["result"]["survey_complete"] = session_player.survey_complete
        event_data["result"]["instructions_finished"] = session_player.instructions_finished

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_set_controlling_channel(self, event):
        '''
        only for subject screens
        '''
        pass

    async def update_name(self, event):
        '''
        send update name notice to staff screens
        '''

        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_next_instruction(self, event):
        '''
        send instruction status to staff
        '''

        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def update_finish_instructions(self, event):
        '''
        send instruction status to staff
        '''

        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def update_survey_complete(self, event):
        '''
        send survey complete update
        '''
        event_data = event["data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def target_location_update(self, event):
        '''
        update target location from subject screen
        '''
        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__) 
        # logger.info(f"target_location_update: world state controller {self.controlling_channel} channel name {self.channel_name}")
                
        event_data =  event["message_text"]

        try:
            target_location = event_data["target_location"]    
            current_location = event_data["current_location"]
        except KeyError:
            logger.info(f"target_location_update: invalid location, {event['message_text']}")
            return
            # result = {"value" : "fail", "result" : {"message" : "Invalid location."}}
        
        player_id = self.session_players_local[event["player_key"]]["id"]
        session_player = self.world_state_avatars_local["session_players"][str(player_id)]

        if session_player["frozen"] or session_player["tractor_beam_target"]:
            return

        session_player["target_location"] = target_location
        session_player["current_location"] = current_location

        last_update = datetime.strptime(self.world_state_avatars_local["last_update"], "%Y-%m-%d %H:%M:%S.%f")
        dt_now = datetime.now()

        if dt_now - last_update > timedelta(seconds=1):
            # logger.info("updating world state")
            self.world_state_avatars_local["last_update"] = str(dt_now)
            await Session.objects.filter(id=self.session_id).aupdate(world_state_avatars=self.world_state_avatars_local)

            target_locations = {}
            current_locations = {}
            for i in self.world_state_avatars_local["session_players"]:
                target_locations[i] = self.world_state_avatars_local["session_players"][i]["target_location"]
                current_locations[i] = self.world_state_avatars_local["session_players"][i]["current_location"]
            
            data = {"target_locations" : target_locations, "current_locations" : current_locations}

            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                               session_player_id=player_id,
                                               type="target_locations",
                                               period_number=self.world_state_local["current_period"],
                                               time_remaining=self.world_state_local["time_remaining"],
                                               data=data)
        
        result = {"value" : "success", 
                  "target_location" : target_location, 
                  "current_location" : current_location,
                  "session_player_id" : player_id}
        
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_target_location_update(self, event):
        '''
        update target location from subject screen
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def tractor_beam(self, event):
        '''
        subject activates tractor beam
        '''
        if self.controlling_channel != self.channel_name:
            return

        status = "success"
        error_message = ""

        player_id = self.session_players_local[event["player_key"]]["id"]
        target_player_id = event["message_text"]["target_player_id"]

        source_player = self.world_state_avatars_local['session_players'][str(player_id)]
        target_player = self.world_state_avatars_local['session_players'][str(target_player_id)]

        # check if players are frozen
        if source_player['frozen'] or target_player['frozen']:
            status = "fail"
            error_message = "Invalid target."

        #check if either player has tractor beam enabled
        if source_player['tractor_beam_target'] or target_player['tractor_beam_target']:
            status = "fail"
            error_message = "Invalid target."
        
        #check if player is already interacting or cooling down.
        if source_player['interaction'] > 0 or source_player['cool_down'] > 0:
            status = "fail"
            error_message = "You are cooling down."

        result = {"status":status, "error_message":error_message, "player_id" : player_id, "target_player_id" : target_player_id}
        
        if status == "success":
            source_player['frozen'] = True
            target_player['frozen'] = True

            source_player['tractor_beam_target'] = target_player_id
            source_player['interaction'] = self.parameter_set_local['interaction_length']

            target_player['interaction'] = self.parameter_set_local['interaction_length']

            # await Session.objects.filter(id=self.session_id).aupdate(world_state_avatars=self.world_state_avatars_local)

            # await SessionEvent.objects.acreate(session_id=self.session_id, 
            #                                 session_player_id=player_id,
            #                                 type="tractor_beam",
            #                                 period_number=self.world_state_local["current_period"],
            #                                 time_remaining=self.world_state_local["time_remaining"],
            #                                 data={"player_id" : player_id, "target_player_id" : target_player_id,})

            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type="tractor_beam", send_to_client=False, send_to_group=True)
        
        return result

    async def update_tractor_beam(self, event):
        '''
        subject activates tractor beam update
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    async def interaction(self, event):
        '''
        subject sends an interaction
        '''
        if self.controlling_channel != self.channel_name:
            return
        
        player_id = self.session_players_local[event["player_key"]]["id"]

        source_player = self.world_state_local['session_players'][str(player_id)]

        result = {"source_player_id": player_id, "value" : "success"}

        if source_player['interaction'] == 0:
            result["value"] = "fail"
            result["error_message"] = "No interaction in progress."
        
        if result["value"] != "fail":

            target_player_id = source_player['tractor_beam_target']
            target_player = self.world_state_local['session_players'][str(target_player_id)]

            interaction = event["message_text"]["interaction"]

            result = await sync_to_async(sync_interaction)(self.session_id, player_id, target_player_id, interaction["direction"], interaction["amount"])

            if result["value"] != "fail":

                #clear status
                source_player['interaction'] = 0
                target_player['interaction'] = 0

                source_player['frozen'] = False
                target_player['frozen'] = False

                source_player["cool_down"] = self.parameter_set_local["cool_down_length"]
                target_player["cool_down"] = self.parameter_set_local["cool_down_length"]

                source_player['tractor_beam_target'] = None

                source_player["inventory"][result["period"]] = result["source_player_inventory"]
                target_player["inventory"][result["period"]] = result["target_player_inventory"]

                await Session.objects.filter(id=self.session_id).aupdate(world_state_avatars=self.world_state_avatars_local)

            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                               session_player_id=player_id,
                                               type="interaction",
                                               period_number=self.world_state_local["current_period"],
                                               time_remaining=self.world_state_local["time_remaining"],
                                               data={"interaction" : interaction, "result":result})
        
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_interaction(self, event):
        '''
        subject send an interaction update
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def cancel_interaction(self, event):
        '''
        subject cancels interaction
        '''
        if self.controlling_channel != self.channel_name:
            return
        
        player_id = self.session_players_local[event["player_key"]]["id"]

        source_player = self.world_state_avatars_local['session_players'][str(player_id)]

        if source_player['interaction'] == 0:
            return
        
        target_player_id = source_player['tractor_beam_target']
        target_player = self.world_state_avatars_local['session_players'][str(target_player_id)]

        source_player['interaction'] = 0
        target_player['interaction'] = 0

        source_player['frozen'] = False
        target_player['frozen'] = False

        source_player['tractor_beam_target'] = None

        await Session.objects.filter(id=self.session_id).aupdate(world_state_avatars=self.world_state_avatars_local)

        # await SessionEvent.objects.acreate(session_id=self.session_id, 
        #                                    session_player_id=player_id,
        #                                    type="cancel_interaction",
        #                                    period_number=self.world_state_local["current_period"],
        #                                    time_remaining=self.world_state_local["time_remaining"],
        #                                    data={"player_id" : player_id, "target_player_id":target_player_id})

        result = {"source_player_id" : player_id, "target_player_id" : target_player_id, "value" : "success"}
        
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type="cancel_interaction", send_to_client=False, send_to_group=True)

    async def update_cancel_interaction(self, event):
        '''
        subject cancel interaction update
        '''
        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def field_harvest(self, event):
        '''
        subject harvests field
       '''
        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)
        # logger.info(f"field_harvest: {event}")
        
        try:
            player_id = self.session_players_local[event["player_key"]]["id"]        
            field_id = event["message_text"]["field_id"]
            good_one_harvest = int(event["message_text"]["good_one_harvest"])
            good_two_harvest = int(event["message_text"]["good_two_harvest"])
        except:
            logger.info(f"field_harvest: invalid data, {event['message_text']}")
            return
        
        if good_one_harvest < 0 or good_two_harvest < 0:
            logger.info(f"field_harvest: invalid amounts, {event['message_text']}")
            return
        
        if self.world_state_local["current_period"] % self.parameter_set_local["break_frequency"] == 0 and \
           self.world_state_local["time_remaining"] > self.parameter_set_local["period_length"]:

            logger.info(f"field_harvest: on break, {event['message_text']}")
            return

        v = await sync_to_async(sync_field_harvest)(self.session_id, player_id, field_id, good_one_harvest, good_two_harvest, self.parameter_set_local)
        
        result = {"status" : v["status"], "error_message" : v["error_message"]}

        if v["world_state"] and v["status"]=="success":
            self.world_state_local = v["world_state"]
            result["field"] = {"id" : field_id}
            result["avatar"] = {"id" : player_id}
            result["good_one_harvest"] = good_one_harvest
            result["good_two_harvest"] = good_two_harvest

            for i in main.globals.Goods.choices:
                good = i[0]
                result["field"][good] = self.world_state_local["fields"][str(field_id)][good]
                result["avatar"][good] = self.world_state_local["avatars"][str(player_id)][good]

            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                           session_player_id=player_id,
                                           type="field_harvest",
                                           period_number=self.world_state_local["current_period"],
                                           time_remaining=self.world_state_local["time_remaining"],
                                           data=result)
        else:
            logger.warning(f"field_harvest: invalid amounts from sync, {event['message_text']} player id {player_id}")
            return
        
        

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)
        
    async def update_field_harvest(self, event):
        '''
        subject updates field harvest
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def field_effort(self, event):
        '''
        update field's effort settings
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)
        # logger.info(f"field_harvest: {event}")
        
        try:
            player_id = self.session_players_local[event["player_key"]]["id"]        
            field_id = event["message_text"]["field_id"]
            good_one_effort = int(event["message_text"]["good_one_effort"])
            good_two_effort = int(event["message_text"]["good_two_effort"])
        except:
            logger.info(f"field_effort: invalid data, {event['message_text']}")
            return
        
        if good_one_effort < 0 or good_two_effort < 0:
            logger.info(f"field_harvest: invalid amounts, less than zero, {event['message_text']}")
            return
        
        if good_one_effort + good_two_effort != self.parameter_set_local["production_effort"]:
            logger.info(f"field_harvest: invalid amounts, does not total effort, {event['message_text']}")
            return

        v = await sync_to_async(sync_field_effort)(self.session_id, player_id, field_id, good_one_effort, good_two_effort)

        result = {"status" : v["status"], "error_message" : v["error_message"]}

        if v["world_state"]:
            self.world_state_local = v["world_state"]
            result["field"] = {"id" : field_id}
            result["avatar"] = {"id" : player_id}
            result["good_one_effort"] = good_one_effort
            result["good_two_effort"] = good_two_effort

            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                           session_player_id=player_id,
                                           type="field_effort",
                                           period_number=self.world_state_local["current_period"],
                                           time_remaining=self.world_state_local["time_remaining"],
                                           data=result)
        else:
            logger.warning(f"field_effort: invalid amounts from sync, {event['message_text']}")
            return
        
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_field_effort(self, event):
        '''
        update field's effort settings
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def move_fruit_to_avatar(self, event):
        '''
        move fruit from one avatar to another
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]        
            target_player_id = event["message_text"]["target_player_id"]
            good_one_move = int(event["message_text"]["good_one_move"])
            good_two_move = int(event["message_text"]["good_two_move"])

            if self.parameter_set_local["good_mode"] == "Three":
                good_three_move = int(event["message_text"]["good_three_move"])
            else:
                good_three_move = 0
           
        except:
            logger.info(f"move_fruit_to_avatar: invalid data, {event['message_text']}")
            return
        
        if self.world_state_local["current_period"] % self.parameter_set_local["break_frequency"] == 0 and \
           self.world_state_local["time_remaining"] > self.parameter_set_local["period_length"]:

            logger.info(f"move_fruit_to_avatar: on break, {event['message_text']}")
            return
        
        v = await sync_to_async(sync_move_fruit_to_avatar)(self.session_id, player_id, target_player_id, good_one_move, good_two_move, good_three_move)

        result = {"status" : v["status"], "error_message" : v["error_message"]}

        if v["world_state"]:
            self.world_state_local = v["world_state"]

            result["source_player_id"] = player_id
            result["target_player_id"] = target_player_id
            result["source_player"] = self.world_state_local["avatars"][str(player_id)]
            result["target_player"] = self.world_state_local["avatars"][str(target_player_id)]
            result["good_one_move"] = good_one_move
            result["good_two_move"] = good_two_move
            result["good_three_move"] = good_three_move
            result["goods"] = v["goods"]

            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                           session_player_id=player_id,
                                           type="move_fruit_to_avatar",
                                           period_number=self.world_state_local["current_period"],
                                           time_remaining=self.world_state_local["time_remaining"],
                                           data=result)
            
        else:
            logger.warning(f"move_fruit_to_avatar: invalid amounts from sync, {event['message_text']}")
            return

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_move_fruit_to_avatar(self, event):
        '''
        update move fruit to avatar
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    async def move_fruit_to_house(self, event):
        '''
        move fruit from one avatar to or from a house
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]        
            target_house_id = event["message_text"]["target_house_id"]
            good_one_move = int(event["message_text"]["good_one_move"])
            good_two_move = int(event["message_text"]["good_two_move"])

            if self.parameter_set_local["good_mode"] == "Three":
                good_three_move = int(event["message_text"]["good_three_move"])
            else:
                good_three_move = 0
            direction = event["message_text"]["direction"]
        except:
            logger.info(f"move_fruit_to_house: invalid data, {event['message_text']}")
            return
        
        if self.world_state_local["current_period"] % self.parameter_set_local["break_frequency"] == 0 and \
           self.world_state_local["time_remaining"] > self.parameter_set_local["period_length"]:

            logger.info(f"move_fruit_to_house: on break, {event['message_text']}")
            return
        
        v = await sync_to_async(sync_move_fruit_to_house)(self.session_id, 
                                                          player_id, 
                                                          target_house_id, 
                                                          good_one_move, 
                                                          good_two_move, 
                                                          good_three_move, 
                                                          direction,
                                                          self.parameter_set_local)

        result = {"status" : v["status"], "error_message" : v["error_message"]}

        if v["world_state"]:
            self.world_state_local = v["world_state"]

            result["source_player_id"] = player_id
            result["target_house_id"] = target_house_id
            result["source_player"] = self.world_state_local["avatars"][str(player_id)]
            result["target_house"] = self.world_state_local["houses"][str(target_house_id)]
            result["good_one_move"] = good_one_move
            result["good_two_move"] = good_two_move
            result["good_three_move"] = good_three_move
            result["direction"] = direction
            result["goods"] = v["goods"]

            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                           session_player_id=player_id,
                                           type="move_fruit_house",
                                           period_number=self.world_state_local["current_period"],
                                           time_remaining=self.world_state_local["time_remaining"],
                                           data=result)
            
        else:
            logger.warning(f"move_fruit_to_house: invalid amounts from sync, {event['message_text']}")
            return

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_move_fruit_to_house(self, event):
        '''
        update field's effort settings
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    async def attack_avatar(self, event):
        '''
        attack another avatar
        '''
        
        if self.controlling_channel != self.channel_name:
            return

        if self.parameter_set_local["allow_attacks"] == 'False':
            return

        logger = logging.getLogger(__name__)

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]        
            target_player_id = event["message_text"]["target_player_id"]
        except:
            logger.info(f"attack_avatar: invalid data, {event['message_text']}")
            return
        
        #check not on break
        if self.world_state_local["current_period"] % self.parameter_set_local["break_frequency"] == 0 and \
           self.world_state_local["time_remaining"] > self.parameter_set_local["period_length"]:

            logger.info(f"attack_avatar: on break, {event['message_text']}")
            return

        # check cooling status
        if self.world_state_avatars_local["session_players"][str(player_id)]["cool_down"] != 0:

            logger.info(f"attack_avatar: cooling, {event['message_text']}")
            return
        
        v = await sync_to_async(sync_attack_avatar)(self.session_id, player_id, target_player_id, self.parameter_set_local)

        result = {"status" : v["status"], "error_message" : v["error_message"]}

        if v["world_state"]:
            self.world_state_local = v["world_state"]

            self.world_state_avatars_local["session_players"][str(player_id)]["cool_down"] = self.parameter_set_local["cool_down_length"]
            self.world_state_avatars_local["session_players"][str(target_player_id)]["cool_down"] = self.parameter_set_local["cool_down_length"]

            result["source_player_id"] = player_id
            result["target_player_id"] = target_player_id

            result["source_player"] = self.world_state_local["avatars"][str(player_id)]
            result["target_player"] = self.world_state_local["avatars"][str(target_player_id)]

            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                           session_player_id=player_id,
                                           type="attack_avatar",
                                           period_number=self.world_state_local["current_period"],
                                           time_remaining=self.world_state_local["time_remaining"],
                                           data=result)
                       
        else:
            logger.warning(f"attack_avatar: invalid amounts from sync, {event['message_text']}")
            return
        
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)
    
    async def update_attack_avatar(self, event):
        '''
        update attack avatar
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def sleep(self, event):
        '''
        avtar sleeps
        '''
        
        if self.controlling_channel != self.channel_name:
            return

        logger = logging.getLogger(__name__)

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]       
            
        except:
            logger.info(f"sleep: invalid data, {event['message_text']}")
            return
        
        v = await sync_to_async(sync_sleep)(self.session_id, player_id, self.parameter_set_local)

        result = {"status" : v["status"], "error_message" : v["error_message"]}

        if v["world_state"]:
            self.world_state_local = v["world_state"]

            result["source_player_id"] = player_id
            result["source_player"] = self.world_state_local["avatars"][str(player_id)]

            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                           session_player_id=player_id,
                                           type="sleep",
                                           period_number=self.world_state_local["current_period"],
                                           time_remaining=self.world_state_local["time_remaining"],
                                           data=result)
                       
        else:
            logger.warning(f"sleep: invalid amounts from sync, {event['message_text']}")
            return
        
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)
    
    async def update_sleep(self, event):
        '''
        update avatar sleep
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def emoji(self, event):
        '''
        avtar emotes
        '''
        
        if self.controlling_channel != self.channel_name:
            return

        logger = logging.getLogger(__name__)

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]       
            emoji_type = event["message_text"]["emoji_type"]
            current_location = event["message_text"]["current_location"]
        except:
            logger.info(f"emoji: invalid data, {event['message_text']}")
            return
        
        #update current location
        session_player = self.world_state_avatars_local["session_players"][str(player_id)]
        session_player["current_location"] = current_location

        result = {"status" : "success", "error_message" : {}}
        result["source_player_id"] = player_id
        result["emoji_type"] = emoji_type
        result["nearby_players"] = []

        #find nearby players
        session_players = self.world_state_avatars_local["session_players"]
        for i in session_players:
            if i != str(result["source_player_id"]):
                source_pt = [session_players[str(result["source_player_id"])]["current_location"]["x"], session_players[str(result["source_player_id"])]["current_location"]["y"]]
                target_pt = [session_players[i]["current_location"]["x"], session_players[i]["current_location"]["y"]]
                
                if math.dist(source_pt, target_pt) <= 1000:
                    result["nearby_players"].append(i)
        
        await SessionEvent.objects.acreate(session_id=self.session_id, 
                                           session_player_id=player_id,
                                           type="emoji",
                                           period_number=self.world_state_local["current_period"],
                                           time_remaining=self.world_state_local["time_remaining"],
                                           data=result)

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)
    
    async def update_emoji(self, event):
        '''
        update avatar emote
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def patch_harvest(self, event):
        '''
        subject harvests from patch
       '''
        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)
        # logger.info(f"patch_harvest: {event}")
        
        try:
            player_id = self.session_players_local[event["player_key"]]["id"]        
            patch_id = event["message_text"]["patch_id"]
        except:
            logger.info(f"patch_harvest: invalid data, {event['message_text']}")
            return

        v = await sync_to_async(sync_patch_harvest)(self.session_id, player_id, patch_id, self.parameter_set_local)
        
        result = {"status" : v["status"], "error_message" : v["error_message"]}

        if v["world_state"] and v["status"]=="success":
            self.world_state_local = v["world_state"]
            result["patch"] = self.world_state_local["patches"][str(patch_id)]
            result["player_id"] = player_id
            result["patch_id"] = patch_id
            result["harvest_amount"] = v["harvest_amount"]
            result["avatar"] = self.world_state_local["avatars"][str(player_id)]       

            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                            session_player_id=player_id,
                                            type="patch_harvest",
                                            period_number=self.world_state_local["current_period"],
                                            time_remaining=self.world_state_local["time_remaining"],
                                            data=result)         

        else:
            logger.warning(f"patch_harvest: invalid amounts from sync, {event['message_text']} player id {player_id}")
            return
        
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)
        
    async def update_patch_harvest(self, event):
        '''
        subject harvests from patch update
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def hat_avatar(self, event):
        '''
        propose trading hats
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)

        status = "success"
        error_mesage = ""

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]        
            target_player_id = event["message_text"]["target_player_id"]
            type = event["message_text"]["type"]
        except:
            logger.info(f"hat_avatar: invalid data, {event['message_text']}")
            status = "fail"
            error_mesage = "Invalid trade."

        result = {"status" : status, "error_message" : error_mesage}

        if status == "success":
            
            result["type"] = type
  
            if type == "proposal_received":
                result["source_player_id"] = target_player_id
                result["target_player_id"] = player_id

                source_player = self.world_state_avatars_local['session_players'][str(target_player_id)]
                target_player = self.world_state_avatars_local['session_players'][str(player_id)]

                source_avatar = self.world_state_local['avatars'][str(target_player_id)]
                target_avatar = self.world_state_local['avatars'][str(player_id)]

                result["source_player_hat_id"] = source_avatar["parameter_set_hat_id"]
                result["target_player_hat_id"] = target_avatar["parameter_set_hat_id"]

                v = await sync_to_async(sync_hat_avatar)(self.session_id, player_id, target_player_id)

                if v["world_state"] and v["status"]=="success":
                    self.world_state_local = v["world_state"]

                    source_player["cool_down"] = self.parameter_set_local["cool_down_length"]
                    target_player["cool_down"] = self.parameter_set_local["cool_down_length"]
                    
                source_player['interaction'] = 0
                target_player['interaction'] = 0

                source_player['frozen'] = False
                target_player['frozen'] = False

                target_player['tractor_beam_target'] = None

                result["source_player"] = self.world_state_local["avatars"][str(target_player_id)] 
                result["target_player"] = self.world_state_local["avatars"][str(player_id)]

            else:
                result["source_player_id"] = player_id
                result["target_player_id"] = target_player_id
            
                source_player = self.world_state_avatars_local['session_players'][str(player_id)]
                target_player = self.world_state_avatars_local['session_players'][str(target_player_id)]

                source_avatar = self.world_state_local['avatars'][str(player_id)]
                target_avatar = self.world_state_local['avatars'][str(target_player_id)]

                result["source_player_hat_id"] = source_avatar["parameter_set_hat_id"]
                result["target_player_hat_id"] = target_avatar["parameter_set_hat_id"]
                
                v = await self.tractor_beam(event)

                result["status"] = v["status"]
                result["error_message"] = v["error_message"]

            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                               session_player_id=player_id,
                                               type="hat_avatar",
                                               period_number=self.world_state_local["current_period"],
                                               time_remaining=self.world_state_local["time_remaining"],
                                               data=result)
                    
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_hat_avatar(self, event):
        '''
        subject update hat proposal
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def hat_avatar_cancel(self, event):
        '''
        propose trading hats cancel
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)
        # logger.info(event)

        status = "success"
        error_mesage = ""

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]        
            target_player_id = event["message_text"]["target_player_id"]
            type = event["message_text"]["type"]
        except:
            logger.info(f"hat_avatar_cancel: invalid data, {event['message_text']}")
            status = "fail"
            error_mesage = "Invalid trade."

        if type == "proposal":
            source_player = self.world_state_avatars_local['session_players'][str(player_id)]
            target_player = self.world_state_avatars_local['session_players'][str(target_player_id)]

            source_avatar = self.world_state_local['avatars'][str(player_id)]
            target_avatar = self.world_state_local['avatars'][str(target_player_id)]

            # self.world_state_avatars_local["session_players"][str(player_id)]["cool_down"] = self.parameter_set_local["cool_down_length"]
        else:
            source_player = self.world_state_avatars_local['session_players'][str(target_player_id)]
            target_player = self.world_state_avatars_local['session_players'][str(player_id)]

            source_avatar = self.world_state_local['avatars'][str(target_player_id)]
            target_avatar = self.world_state_local['avatars'][str(player_id)]

            # self.world_state_avatars_local["session_players"][str(target_player_id)]["cool_down"] = self.parameter_set_local["cool_down_length"]

        source_player['cool_down'] = self.parameter_set_local["cool_down_length"]

        source_player['interaction'] = 0
        target_player['interaction'] = 0

        source_player['frozen'] = False
        target_player['frozen'] = False

        source_player['tractor_beam_target'] = None

        result = {"status" : status, "error_message" : error_mesage}
        result["source_player_id"] = player_id
        result["target_player_id"] = target_player_id

        result["source_player_hat_id"] = source_avatar["parameter_set_hat_id"]
        result["target_player_hat_id"] = target_avatar["parameter_set_hat_id"]

        result["type"] = type
       
        await SessionEvent.objects.acreate(session_id=self.session_id, 
                                           session_player_id=player_id,
                                           type="hat_avatar_cancel",
                                           period_number=self.world_state_local["current_period"],
                                           time_remaining=self.world_state_local["time_remaining"],
                                           data=result)

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_hat_avatar_cancel(self, event):
        '''
        subject update hat proposal cancel
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

def sync_field_harvest(session_id, player_id, field_id, good_one_harvest, good_two_harvest, parameter_set):
    '''
    harvest from field
    '''

    status = "success"
    error_message = []
    world_state = None

    with transaction.atomic():
        session = Session.objects.select_for_update().get(id=session_id)
        session_period = session.get_current_session_period()
        # parameter_set = session.parameter_set.json()

        field = session.world_state['fields'][str(field_id)]
        field_type = parameter_set['parameter_set_field_types'][str(field['parameter_set_field_type'])]
        player = session.world_state['avatars'][str(player_id)]

        source_parameter_set_player = parameter_set["parameter_set_players"][str(player["parameter_set_player_id"])]
        target_parameter_set_player = parameter_set["parameter_set_players"][str(field["parameter_set_player"])]

        #check for stealing
        if(parameter_set["allow_stealing"] == "False" and 
           source_parameter_set_player["parameter_set_group"] != target_parameter_set_player["parameter_set_group"]):
            status = "fail"
            error_message.append({"id":"good_one_harvest", "message": "You cannot interact with other group's fields."})

        good_one = field_type['good_one_ft']
        good_two = field_type['good_two_ft']

        if field[good_one] < good_one_harvest and status == "success":
            status = "fail"
            error_message.append({"id":"good_two_harvest", "message": "Invalid harvest amount."})

        if field[good_two] < good_two_harvest:
            status = "fail"
            error_message.append({"id":"good_two_harvest", "message": "Invalid harvest amount."})

        if status == "success":
            field[good_one] -= good_one_harvest
            field[good_two] -= good_two_harvest

            player[good_one] += good_one_harvest
            player[good_two] += good_two_harvest

            field["harvest_history"][str(session_period.id)].append({good_one:good_one_harvest, 
                                                                     good_two:good_two_harvest, 
                                                                     "session_player":player_id,
                                                                     "time_remaining":session.world_state["time_remaining"]})

            session.save()
        
        world_state = session.world_state
        
    return {"status" : status, "error_message" : error_message, "world_state" : world_state}

def sync_field_effort(session_id, player_id, field_id, good_one_effort, good_two_effort):
    '''
    update field effort
    '''

    status = "success"
    error_message = []
    world_state = None

    with transaction.atomic():
        session = Session.objects.select_for_update().get(id=session_id)
        player = session.world_state['avatars'][str(player_id)]

        if session.world_state['fields'][str(field_id)]['session_player'] == player_id:
            session.world_state['fields'][str(field_id)]['good_one_effort'] = good_one_effort
            session.world_state['fields'][str(field_id)]['good_two_effort'] = good_two_effort
        else:
            status = "fail"
            error_message.append({"id":"good_one_effort", "message": "You do not own this field."})

        session.save()
        world_state = session.world_state
    
    return {"status" : status, "error_message" : error_message, "world_state" : world_state}

def sync_move_fruit_to_avatar(session_id, player_id, target_player_id, good_one_move, good_two_move, good_three_move):
    '''
    move fruit from one avatar to another
    '''
    status = "success"
    error_message = []
    world_state = None

    with transaction.atomic():
        session = Session.objects.select_for_update().get(id=session_id)
        current_period = session.get_current_session_period()
        
        parameter_set = session.parameter_set.json()
        parameter_set_player_id = str(session.world_state['avatars'][str(player_id)]['parameter_set_player_id'])

        summary_data = current_period.summary_data[str(player_id)]

        good_one = parameter_set['parameter_set_players'][parameter_set_player_id]['good_one']
        good_two = parameter_set['parameter_set_players'][parameter_set_player_id]['good_two']

        if parameter_set["good_mode"] == "Three":
            good_three = parameter_set['parameter_set_players'][parameter_set_player_id]['good_three']

        if session.world_state['avatars'][str(player_id)][good_one] < good_one_move:
            status = "fail"
            error_message.append({"id":"good_one_move", "message": "Invalid amount."})

        if session.world_state['avatars'][str(player_id)][good_two] < good_two_move:
            status = "fail"
            error_message.append({"id":"good_two_move", "message": "Invalid amount."})

        if parameter_set["good_mode"] == "Three":
            if session.world_state['avatars'][str(player_id)][good_three] < good_three_move:
                status = "fail"
                error_message.append({"id":"good_three_move", "message": "Invalid amount."})

        if status == "success":
            session.world_state['avatars'][str(player_id)][good_one] -= good_one_move
            session.world_state['avatars'][str(player_id)][good_two] -= good_two_move

            if parameter_set["good_mode"] == "Three":
                session.world_state['avatars'][str(player_id)][good_three] -= good_three_move

            session.world_state['avatars'][str(target_player_id)][good_one] += good_one_move
            session.world_state['avatars'][str(target_player_id)][good_two] += good_two_move

            if parameter_set["good_mode"] == "Three":
                session.world_state['avatars'][str(target_player_id)][good_three] += good_three_move

            #data
            summary_data["send_avatar_to_avatar_" + target_player_id + "_good_" + good_one] += good_one_move
            summary_data["send_avatar_to_avatar_" + target_player_id + "_good_" + good_two] += good_two_move

            if parameter_set["good_mode"] == "Three":
                summary_data["send_avatar_to_avatar_" + target_player_id + "_good_" + good_three] += good_three_move

            session.save()
            current_period.save()

            world_state = session.world_state

        if parameter_set["good_mode"] == "Three":
            goods = {"good_one" : good_one, "good_two" : good_two, "good_three" : good_three}
        else:
            goods = {"good_one" : good_one, "good_two" : good_two}

    return {"status" : status, 
            "error_message" : error_message, 
            "world_state" : world_state, 
            "goods" : goods}

def sync_move_fruit_to_house(session_id, player_id, target_house_id, good_one_move, good_two_move, good_three_move, direction, parameter_set):
    '''
    move fruit from between avatar and house
    '''
    status = "success"
    error_message = []
    world_state = None

    with transaction.atomic():
        session = Session.objects.select_for_update().get(id=session_id)
        current_period = session.get_current_session_period()
        world_state = session.world_state
        summary_data = current_period.summary_data[str(player_id)]

        # parameter_set = session.parameter_set.json()
        parameter_set_player_id = str(world_state['avatars'][str(player_id)]['parameter_set_player_id'])

        avatar =  world_state['avatars'][str(player_id)]

        house = world_state['houses'][str(target_house_id)]
        parameter_set_player_id_house = str(world_state['avatars'][str(house['session_player'])]['parameter_set_player_id'])
        
        source_group = parameter_set["parameter_set_players"][parameter_set_player_id]["parameter_set_group"]
        target_group = parameter_set["parameter_set_players"][parameter_set_player_id_house]["parameter_set_group"]
        
        good_one = parameter_set['parameter_set_players'][parameter_set_player_id]['good_one']
        good_two = parameter_set['parameter_set_players'][parameter_set_player_id]['good_two']

        if parameter_set["good_mode"] == "Three":
            good_three = parameter_set['parameter_set_players'][parameter_set_player_id]['good_three']
        else:
            good_three = 0

        # house must be in same group as avatar
        if source_group != target_group:
            status = "fail"
            error_message.append({"id":"good_one_move", "message": "You cannot interact with other group's houses."})

        if status == "success":
            if direction == "avatar_to_house":
                if avatar[good_one] < good_one_move:
                    status = "fail"
                    error_message.append({"id":"good_one_move", "message": "Invalid amount."})

                if avatar[good_two] < good_two_move:
                    status = "fail"
                    error_message.append({"id":"good_two_move", "message": "Invalid amount."})

                if parameter_set["good_mode"] == "Three":
                    if avatar[good_three] < good_three_move:
                        status = "fail"
                        error_message.append({"id":"good_three_move", "message": "Invalid amount."})
            elif player_id == house['session_player']:
                #player owns house
                if house[good_one] < good_one_move:
                    status = "fail"
                    error_message.append({"id":"good_one_move", "message": "Invalid amount."})

                if house[good_two] < good_two_move:
                    status = "fail"
                    error_message.append({"id":"good_two_move", "message": "Invalid amount."})

                if parameter_set["good_mode"] == "Three":
                    if house[good_three] < good_three_move:
                        status = "fail"
                        error_message.append({"id":"good_three_move", "message": "Invalid amount."})
            else:
                status = "fail"
                error_message.append({"id":"good_one_move", "message": "You cannot move goods out of other player's houses."})

        if status == "success":
            if direction == "avatar_to_house":
                avatar[good_one] -= good_one_move
                avatar[good_two] -= good_two_move

                if parameter_set["good_mode"] == "Three":
                    avatar[good_three] -= good_three_move

                house[good_one] += good_one_move
                house[good_two] += good_two_move

                if parameter_set["good_mode"] == "Three":
                    house[good_three] += good_three_move

                 #data
                summary_data["send_avatar_to_house_" + target_house_id + "_good_" + good_one] += good_one_move
                summary_data["send_avatar_to_house_" + target_house_id + "_good_" + good_two] += good_two_move

                if parameter_set["good_mode"] == "Three":
                    summary_data["send_avatar_to_house_" + target_house_id + "_good_" + good_three] += good_three_move
            else:
                avatar[good_one] += good_one_move
                avatar[good_two] += good_two_move

                if parameter_set["good_mode"] == "Three":
                    avatar[good_three] += good_three_move

                house[good_one] -= good_one_move
                house[good_two] -= good_two_move

                if parameter_set["good_mode"] == "Three":
                    house[good_three] -= good_three_move

            house["health_value"] = convert_goods_to_health(house[good_one],
                                                            house[good_two],
                                                            house[good_three] if parameter_set["good_mode"] == "Three" else 0,
                                                            parameter_set)

            session.save()
            current_period.save()

            world_state = session.world_state

        if parameter_set["good_mode"] == "Three":
            goods = {"good_one" : good_one, "good_two" : good_two, "good_three" : good_three}
        else:
            goods = {"good_one" : good_one, "good_two" : good_two}


    return {"status" : status, 
            "error_message" : error_message, 
            "world_state" : world_state,
            "goods" : goods}

def sync_attack_avatar(session_id, player_id, target_house_id, parameter_set):
    '''
    sync attack avatar
    '''

    status = "success"
    error_message = []
    world_state = None

    with transaction.atomic():
        session = Session.objects.select_for_update().get(id=session_id)
        current_period = session.get_current_session_period()
        # parameter_set = session.parameter_set.json()

        player_id_s = str(player_id)
        target_house_id_s = str(target_house_id)

        source_player = session.world_state['avatars'][player_id_s]
        target_player = session.world_state['avatars'][target_house_id_s]

        if Decimal(source_player["health"]) < Decimal(parameter_set["attack_cost"]):
            status = "fail"
            error_message.append({"id":"attack_avatar_button", "message": "You do not have enough health."})

        if Decimal(target_player["health"]) == 0:
            status = "fail"
            error_message.append({"id":"attack_avatar_button", "message": "Target player already has zero health."})

        if status == "success":
            #data for summary

            summary_data_source = current_period.summary_data[player_id_s]
            summary_data_target = current_period.summary_data[target_house_id_s]

            attack_cost = Decimal(parameter_set["attack_cost"])
            attack_damage = Decimal(parameter_set["attack_damage"])
            
            source_player["health"] = Decimal(source_player["health"]) - attack_cost
            target_player["health"] = Decimal(target_player["health"]) - attack_damage

            #data for summary
            summary_data_source["attacks_cost_at_" + target_house_id_s] = str(Decimal(summary_data_source["attacks_cost_at_" + target_house_id_s]) + attack_cost)
            summary_data_target["attacks_damage_from_" + player_id_s] = str(Decimal(summary_data_target["attacks_damage_from_" + player_id_s]) + attack_damage)

            summary_data_source["attacks_at_" + target_house_id_s] += 1
            summary_data_target["attacks_from_" + player_id_s] += 1

            if Decimal(source_player["health"]) < 0:
                #handle underage
                summary_data_source["attacks_cost_at_" + target_house_id_s] = str(Decimal(summary_data_source["attacks_cost_at_" + target_house_id_s]) + Decimal(source_player["health"]))
                source_player["health"] = 0

            if Decimal(target_player["health"]) < 0:
                #handle underage
                summary_data_target["attacks_damage_from_" + player_id_s] = str(Decimal(summary_data_target["attacks_damage_from_" + player_id_s]) + Decimal(target_player["health"]))
                target_player["health"] = 0

            source_player["health"] = str(source_player["health"])
            target_player["health"] = str(target_player["health"])
            
            session.save()
            current_period.save()

            world_state = session.world_state
        session.save()

        world_state = session.world_state

    return {"status" : status, "error_message" : error_message, "world_state" : world_state}

def sync_sleep(session_id, player_id, parameter_set):
    '''
    sync sleep
    '''

    status = "success"
    error_message = []
    world_state = None

    with transaction.atomic():
        session = Session.objects.select_for_update().get(id=session_id)
        # parameter_set = session.parameter_set.json()

        source_player = session.world_state['avatars'][str(player_id)]

        if session.world_state['time_remaining'] > parameter_set["night_length"]+5:
            status = "fail"
        
        if status == "success":
            source_player["sleeping"] = True
  
            session.save()

            world_state = session.world_state
        session.save()

        world_state = session.world_state

    return {"status" : status, "error_message" : error_message, "world_state" : world_state}

def sync_patch_harvest(session_id, player_id, patch_id, parameter_set):
    '''
    harvest from patch
    '''

    status = "success"
    harvest_amount = 0
    error_message = []
    world_state = None

    with transaction.atomic():
        session = Session.objects.select_for_update().get(id=session_id)
        current_period = session.get_current_session_period()
        # parameter_set = session.parameter_set.json()

        player_id_s = str(player_id)
        patch_id_s = str(patch_id)

        player = session.world_state['avatars'][player_id_s]
        patch = session.world_state['patches'][patch_id_s]
       
        status = "fail"     

        #loop backwards through levels
        for i in range(patch["max_levels"], 0, -1):
            level = patch["levels"][str(i)]

            if not level["harvested"]:
                status = "success"               
                level["harvested"] = True
                harvest_amount = level["value"]
                break
        
        if status == "fail":
            error_message.append({"id":"patch_harvest", "message": "The patch is empty."})

        #check player has enough harvests remaining
        if status == "success" and player["period_patch_harvests"] >= parameter_set["max_patch_harvests"]:
            status = "fail"
            error_message.append({"id":"patch_harvest", "message": "No harvests remaining this period."})

        if status == "success":
            summary_data = current_period.summary_data[player_id_s]

            player[patch["good"]] += harvest_amount
            player["period_patch_harvests"] += 1

            summary_data["patch_harvests_count_" + patch_id_s] += 1
            summary_data["patch_harvests_total_" + patch_id_s] += harvest_amount
            summary_data["harvest_total_" + patch["good"]] += harvest_amount

            session.save()
            current_period.save()
        
        world_state = session.world_state
        
    return {"status" : status, 
            "error_message" : error_message, 
            "world_state" : world_state, 
            "harvest_amount" : harvest_amount}

def sync_hat_avatar(session_id, player_id, target_player_id):
    '''
    harvest from patch
    '''

    status = "success"
    harvest_amount = 0
    error_message = []
    world_state = None

    with transaction.atomic():
        session = Session.objects.select_for_update().get(id=session_id)

        source_player_id_s = str(player_id)
        target_player_id_s = str(target_player_id)

        source_player = session.world_state['avatars'][source_player_id_s]
        target_player = session.world_state['avatars'][target_player_id_s]

        #swap values
        source_player["parameter_set_hat_id"], target_player["parameter_set_hat_id"] = target_player["parameter_set_hat_id"], source_player["parameter_set_hat_id"]

        session.save()

    world_state = session.world_state
        
    return {"status" : status, 
            "error_message" : error_message, 
            "world_state" : world_state, 
            "harvest_amount" : harvest_amount}



                                
        

