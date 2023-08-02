
import logging

from asgiref.sync import sync_to_async

from django.db import transaction
from django.db.models.fields.json import KT

from main.models import SessionPlayer
from main.models import Session
from main.models import SessionEvent
from django.utils.decorators import method_decorator

from datetime import datetime, timedelta

from main.globals import ExperimentPhase

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
        event_data = event["message_text"]
        
        result["text"] = event_data["text"]
        result["sender_id"] = self.session_players_local[event["player_key"]]["id"]

        await SessionEvent.objects.acreate(session_id=self.session_id, 
                                           session_player_id=result["sender_id"],
                                           type="chat",
                                           period_number=self.world_state_local["current_period"],
                                           time_remaining=self.world_state_local["time_remaining"],
                                           data=result)

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

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
        
        # logger = logging.getLogger(__name__) 
        # logger.info(f"target_location_update: world state controller {self.controlling_channel} channel name {self.channel_name}")
        
        logger = logging.getLogger(__name__)
        
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

        player_id = self.session_players_local[event["player_key"]]["id"]
        target_player_id = event["message_text"]["target_player_id"]

        source_player = self.world_state_local['session_players'][str(player_id)]
        target_player = self.world_state_local['session_players'][str(target_player_id)]

        # check if players are frozen
        if source_player['frozen'] or target_player['frozen']:
            return

        #check if either player has tractor beam enabled
        if source_player['tractor_beam_target'] or target_player['tractor_beam_target']:
            return
        
        #check if player is already interacting or cooling down.
        if source_player['interaction'] > 0 or source_player['cool_down'] > 0:
            return
        
        source_player['frozen'] = True
        target_player['frozen'] = True

        source_player['tractor_beam_target'] = target_player_id
        source_player['interaction'] = self.parameter_set_local['interaction_length']

        target_player['interaction'] = self.parameter_set_local['interaction_length']

        await Session.objects.filter(id=self.session_id).aupdate(world_state_avatars=self.world_state_avatars_local)

        await SessionEvent.objects.acreate(session_id=self.session_id, 
                                           session_player_id=player_id,
                                           type="tractor_beam",
                                           period_number=self.world_state_local["current_period"],
                                           time_remaining=self.world_state_local["time_remaining"],
                                           data={"player_id" : player_id, "target_player_id" : target_player_id,})

        result = {"player_id" : player_id, "target_player_id" : target_player_id}
        
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

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

        source_player = self.world_state_local['session_players'][str(player_id)]

        if source_player['interaction'] == 0:
            return
        
        target_player_id = source_player['tractor_beam_target']
        target_player = self.world_state_local['session_players'][str(target_player_id)]

        source_player['interaction'] = 0
        target_player['interaction'] = 0

        source_player['frozen'] = False
        target_player['frozen'] = False

        source_player['tractor_beam_target'] = None

        await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)

        await SessionEvent.objects.acreate(session_id=self.session_id, 
                                           session_player_id=player_id,
                                           type="cancel_interaction",
                                           period_number=self.world_state_local["current_period"],
                                           time_remaining=self.world_state_local["time_remaining"],
                                           data={"player_id" : player_id, "target_player_id":target_player_id})

        result = {"source_player_id" : player_id, "target_player_id" : target_player_id, "value" : "success"}
        
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_cancel_interaction(self, event):
        '''
        subject cancel interaction update
        '''
        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def field_harvest(self, event):
        '''
        subject activates tractor beam
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

        v = await sync_to_async(sync_field_harvest)(self.session_id, player_id, field_id, good_one_harvest, good_two_harvest)
        
        result = {"status" : v["status"], "error_message" : v["error_message"]}

        if v["world_state"]:
            self.world_state_local = v["world_state"]
            result["field"] = {"id" : field_id}
            result["avatar"] = {"id" : player_id}
            result["good_one_harvest"] = good_one_harvest
            result["good_two_harvest"] = good_two_harvest

            for i in main.globals.Goods.choices:
                good = i[0]
                result["field"][good] = self.world_state_local["fields"][str(field_id)][good]
                result["avatar"][good] = self.world_state_local["avatars"][str(player_id)][good]
        else:
            logger.info(f"field_harvest: invalid amounts from sync, {event['message_text']}")
            return

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)
        
    async def update_field_harvest(self, event):
        '''
        subject activates tractor beam update
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

        if v["world_state"]:
            self.world_state_local = v["world_state"]
        else:
            logger.info(f"field_effort: invalid amounts from sync, {event['message_text']}")
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
            
def sync_interaction(session_id, source_player_id, target_player_id, direction, amount):
    '''
    syncronous interaction transaction
    '''

    # world_state_filter=f"world_state__tokens__{period_id}__{token_id}__status"
    
    result = {"value" : "success"}
    result["source_player_id"] = source_player_id
    result["target_player_id"] = target_player_id

    with transaction.atomic():
    
        session = Session.objects.select_for_update().get(id=session_id)

        source_player = session.world_state['session_players'][str(source_player_id)]
        target_player = session.world_state['session_players'][str(target_player_id)]

        current_period_id = str(session.get_current_session_period().id)

        if direction == 'take':
            #take from target
            if target_player["inventory"][current_period_id] < amount:
                result["value"] = "fail"
                result["error_message"] = "They do not have enough tokens."
                return result
            else:
                target_player["inventory"][current_period_id] -= amount
                source_player["inventory"][current_period_id] += amount

                result["target_player_change"] = f"-{amount}"
                result["source_player_change"] = f"+{amount}"             
        else:
            #give to target
            if source_player["inventory"][current_period_id] < amount:
                result["value"] = "fail"
                result["error_message"] = "You do not have enough tokens."
                return result
            else:
                source_player["inventory"][current_period_id] -= amount
                target_player["inventory"][current_period_id] += amount

                result["source_player_change"] = f"-{amount}"
                result["target_player_change"] = f"+{amount}"
                
        session.save()

    result["source_player_inventory"] = source_player["inventory"][current_period_id]
    result["target_player_inventory"] = target_player["inventory"][current_period_id]

    result["period"] = current_period_id
    result["direction"] = direction

    return result

def sync_field_harvest(session_id, player_id, field_id, good_one_harvest, good_two_harvest):
    '''
    harvest from field
    '''

    status = "success"
    error_message = []
    world_state = None

    with transaction.atomic():
        session = Session.objects.select_for_update().get(id=session_id)
        parameter_set = session.parameter_set.json()

        field = session.world_state['fields'][str(field_id)]
        field_type = parameter_set['parameter_set_field_types'][str(field['parameter_set_field_type'])]
        player = session.world_state['avatars'][str(player_id)]

        good_one = field_type['good_one']
        good_two = field_type['good_two']

        if field[good_one] < good_one_harvest:
            status = "fail"
            error_message.append({"id":"good_two_harvest", "messge": "Invalid harvest amount."})

        if field[good_two] < good_two_harvest:
            status = "fail"
            error_message.append({"id":"good_two_harvest", "messge": "Invalid harvest amount."})

        if status == "success":
            field[good_one] -= good_one_harvest
            field[good_two] -= good_two_harvest

            player[good_one] += good_one_harvest
            player[good_two] += good_two_harvest

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

        session.world_state['fields'][str(field_id)]['good_one_effort'] = good_one_effort
        session.world_state['fields'][str(field_id)]['good_two_effort'] = good_two_effort

        session.save()
        world_state = session.world_state
    
    return {"status" : status, "error_message" : error_message, "world_state" : world_state}

                                      
    

                                
        

