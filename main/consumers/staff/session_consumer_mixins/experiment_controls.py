import logging

from asgiref.sync import sync_to_async

from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from main.models import Session
from main.models import SessionEvent
from main.models import ParameterSet

from main.globals import ExperimentPhase

from ..session_consumer_mixins.get_session import take_get_session
from ..session_consumer_mixins.operations import OperationsMixin

class ExperimentControlsMixin(OperationsMixin):
    '''
    This mixin is used to start an the experiment.
    '''

    async def start_experiment(self, event):
        '''
        start experiment
        '''
        logger = logging.getLogger(__name__)
        result = await sync_to_async(take_start_experiment)(self.session_id, event["message_text"])

        #Send message to staff page
        if result["value"] == "fail":
            await self.send_message(message_to_self=result, message_to_group=None,
                                    message_type=event['type'], send_to_client=True, send_to_group=False)
        else:
            self.world_state_local = result["world_state"]

            await self.do_field_production()

            await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)

            result["world_state"] = self.world_state_local

            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False, send_to_group=True)
    
    async def update_start_experiment(self, event):
        '''
        start experiment on staff
        '''
        logger = logging.getLogger(__name__)
        # logger.info(f"update_start_experiment {event}")

        self.world_state_local = event['group_data']['world_state']
        self.world_state_avatars_local = event['group_data']['world_state_avatars']

         #store first tick
        if self.controlling_channel == self.channel_name:
            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                                type="world_state",
                                                period_number=self.world_state_local["current_period"],
                                                time_remaining=self.world_state_local["time_remaining"],
                                                data={"world_state_local" : self.world_state_local,
                                                      "world_state_avatars_local" : self.world_state_avatars_local,})

        result = await sync_to_async(take_get_session, thread_sensitive=self.thread_sensitive)(self.connection_uuid)

        await self.send_message(message_to_self=result, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def reset_experiment(self, event):
        '''
        reset experiment
        '''
        result = await sync_to_async(take_reset_experiment)(self.session_id, event["message_text"])

        #Send message to staff page
        if result["value"] == "fail":
            await self.send_message(message_to_self=result, message_to_group=None,
                                    message_type=event['type'], send_to_client=True, send_to_group=False)
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False, send_to_group=True)
    
    async def update_reset_experiment(self, event):
        '''
        reset experiment on staff
        '''

        result = await sync_to_async(take_get_session, thread_sensitive=self.thread_sensitive)(self.connection_uuid)

        await self.send_message(message_to_self=result, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
            
    async def reset_connections(self, event):
        '''
        reset connections
        '''
        result = await sync_to_async(take_reset_connections)(self.session_id, event["message_text"])

        #Send message to staff page
        if result["value"] == "fail":
            await self.send_message(message_to_self=result, message_to_group=None,
                                    message_type=event['type'], send_to_client=True, send_to_group=False)
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False, send_to_group=True)
    
    async def update_reset_connections(self, event):
        '''
        update reset connections
        '''
        result = await sync_to_async(take_get_session, thread_sensitive=self.thread_sensitive)(self.connection_uuid)

        await self.send_message(message_to_self=result, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
            
    async def next_phase(self, event):
        '''
        next phase
        '''
        result = await sync_to_async(take_next_phase)(self.session_id, event["message_text"])

        result["world_state_avatars"] = self.world_state_avatars_local

        #Send message to staff page
        if result["value"] == "fail":
            await self.send_message(message_to_self=result, message_to_group=None,
                                    message_type=event['type'], send_to_client=True, send_to_group=False)
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False, send_to_group=True)
    
    async def update_next_phase(self, event):
        '''
        update session phase
        '''

        event_data = event["group_data"]

        self.world_state_local["finished"] = event_data["finished"]
        self.world_state_local["current_experiment_phase"] = event_data["current_experiment_phase"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def end_early(self, event):
        '''
        end experiment early
        '''

        self.parameter_set_local["period_count"] = self.world_state_local["current_period"]
        
        await ParameterSet.objects.filter(id=self.parameter_set_local["id"]).aupdate(period_count=self.parameter_set_local["period_count"], 
                                                                                     json_for_session=self.parameter_set_local)
        
        result = {"value" : "success", "result" : self.parameter_set_local["period_count"]}

        await self.send_message(message_to_self=result, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def refresh_screens(self, event):
        '''
        refresh client and server screens
        '''

        result = await sync_to_async(take_refresh_screens, thread_sensitive=self.thread_sensitive)(self.session_id,  event["message_text"])

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)
    
    async def update_refresh_screens(self, event):
        '''
        refresh staff screen
        '''

        result = {}
        result["session"] = await sync_to_async(take_get_session, thread_sensitive=self.thread_sensitive)(self.connection_uuid)

        await self.send_message(message_to_self=result, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

def take_start_experiment(session_id, data):
    '''
    start experiment
    '''   

    logger = logging.getLogger(__name__) 
    logger.info(f"Start Experiment: session {session_id}, data {data}")

    #session_id = data["session_id"]
    with transaction.atomic():
        session = Session.objects.get(id=session_id)

        if not session.started:
            session.start_experiment()

        value = "success"
        
        return {"value" : value, 
                "world_state" : session.world_state,
                "world_state_avatars" : session.world_state_avatars}

def take_reset_experiment(session_id, data):
    '''
    reset experiment remove bids and asks
    '''   

    logger = logging.getLogger(__name__) 
    logger.info(f"Reset Experiment: {data}")

    #session_id = data["session_id"]
    session = Session.objects.get(id=session_id)

    if session.started:
        session.reset_experiment()  
        session = Session.objects.get(id=session_id)

    value = "success"
    
    return {"value" : value, "started" : session.started}

def take_reset_connections(session_id, data):
    '''
    reset connection counts for experiment
    '''   

    logger = logging.getLogger(__name__) 
    logger.info(f"Reset connection counts: {data}")

    #session_id = data["session_id"]
    session = Session.objects.get(id=session_id)

    if not session.started:
        session.reset_connection_counts()  

    value = "success"
    
    return {"value" : value, "started" : session.started}

def take_next_phase(session_id, data):
    '''
    advance to next phase in the experiment
    '''   

    logger = logging.getLogger(__name__) 
    logger.info(f"Advance to Next Phase: {data}")

    #session_id = data["session_id"]
    session = Session.objects.get(id=session_id)

    if session.world_state["current_experiment_phase"] == ExperimentPhase.INSTRUCTIONS:
        session.world_state["current_experiment_phase"] = ExperimentPhase.RUN

    elif session.world_state["current_experiment_phase"] == ExperimentPhase.RUN:
        session.world_state["current_experiment_phase"] = ExperimentPhase.NAMES

    elif session.world_state["current_experiment_phase"] == ExperimentPhase.NAMES:
        session.world_state["current_experiment_phase"]  = ExperimentPhase.DONE
        session.world_state["finished"] = True

    # session.world_state["current_experiment_phase"] = session.world_state.current_experiment_phase
    #session.world_state["finished"] = session.finished
    
    session.save()

    status = "success"
    
    return {"value" : status,
            "world_state" : session.world_state,
            "current_experiment_phase" : session.world_state["current_experiment_phase"],
            "finished" : session.world_state["finished"],
            }

# def take_end_early(session_id):
#     '''
#     make the current period the last period
#     '''

#     session = Session.objects.get(id=session_id)

#     session.parameter_set.period_count = session.world_state["current_period"]
#     session.parameter_set.update_json_local()
#     session.parameter_set.save()

#     return {"value" : "success", "result" : session.parameter_set.period_count}

def take_refresh_screens(session_id, data):
    '''
    refresh screen
    '''
    logger = logging.getLogger(__name__)
    logger.info(f'refresh screen: {session_id} {data}')

    try:        
        session = Session.objects.get(id=session_id)
        session.parameter_set.json(update_required=True)

        session.replay_data = None
        session.save()

    except ObjectDoesNotExist:
        logger.warning(f"take_refresh_screens session not found: {session_id}")
        return {"status":"fail", 
                "message":"Session not found",
                "result":{}}

    return None