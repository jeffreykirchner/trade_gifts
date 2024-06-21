
import logging

from main.models import Session
from main.models import SessionPlayer
from main.models import SessionEvent

class InterfaceMixin():
    '''
    messages from the staff screen interface
    '''
    
    async def world_state_update(self, event):
        '''
        take update for world_state
        '''
        pass
    
        # client_side_world_state = event["message_text"]["world_state"]
        
        # for i in client_side_world_state["session_players"]:            
        #     self.world_state_local["session_players"][i]["current_location"] = client_side_world_state["session_players"][i]["current_location"]
        
        # await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)
    
    async def load_session_events(self, event):
        '''
        load session for replay
        '''
        session = await Session.objects.only("replay_data").aget(id=self.session_id)
        session_events_local = {}

        if session.replay_data:
            session_events_local = session.replay_data
        else:
            async for i in session.session_periods.all():

                session_events_local[str(i.period_number)] = {}

                total_period_length = self.parameter_set_local["period_length"]

                if i.period_number % self.parameter_set_local["break_frequency"] == 0:
                    total_period_length += self.parameter_set_local["break_length"]

                for j in range(total_period_length+1):
                    session_events_local[str(i.period_number)][str(j)] = []

            async for i in session.session_events.exclude(type="help_doc"):
                v = {"type" : i.type, "data" : i.data}
                session_events_local[str(i.period_number)][str(i.time_remaining)].append(v)

            session.replay_data = session_events_local
            await session.asave()

        result = {"session_events": session_events_local}

        await self.send_message(message_to_self=result, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def load_world_state(self, event):
        '''
        load world state for replay
        '''

        event_data = event["message_text"]

        period_number = event_data["period_number"]
        time_remaining = event_data["time_remaining"]

        session = await Session.objects.aget(id=self.session_id)

        temp_period_number = period_number
        temp_time_remaining = time_remaining
        go = True
        status = "success"

        while go:
            v = session.session_events.filter(type="timer_tick", 
                                              period_number=temp_period_number, 
                                              time_remaining=temp_time_remaining)
            session_event = await v.afirst()

            if temp_period_number >= self.parameter_set_local["period_count"] and temp_time_remaining <= 0:
                go = False
                status = "fail"

            if go and not session_event:
                temp_time_remaining -= 1
                
                if temp_time_remaining < 0:
                    temp_period_number -= 1
                    temp_time_remaining = self.parameter_set_local["period_length"]

                    if temp_period_number % self.parameter_set_local["break_frequency"] == 0:
                        temp_time_remaining = self.parameter_set_local["break_length"]
            else:
                go = False

        result = {"world_state": session_event.data["world_state_local"], 
                  "world_state_avatars": session_event.data["world_state_avatars_local"],
                  "status" : status
                  }

        await self.send_message(message_to_self=result, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)



