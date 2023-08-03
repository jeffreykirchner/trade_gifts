import logging
import asyncio
import math

from datetime import datetime

from asgiref.sync import sync_to_async

from django.db import transaction

from main.models import Session
from main.models import SessionEvent

from main.globals import ExperimentPhase

import main

class TimerMixin():
    '''
    timer mixin for staff session consumer
    '''

    async def start_timer(self, event):
        '''
        start or stop timer 
        '''
        logger = logging.getLogger(__name__)
        logger.info(f"start_timer {event}")

        if self.controlling_channel != self.channel_name:
            logger.warning(f"start_timer: not controlling channel")
            return

        v = await sync_to_async(sync_start_timer)(event, self.session_id)

        if v["world_state"]:
            self.world_state_local = v["world_state"]

            result = {"timer_running" : self.world_state_local["timer_running"]}
            await self.send_message(message_to_self=result, message_to_group=None,
                                    message_type=event['type'], send_to_client=True, send_to_group=False)
        else:
            return
        
        # logger.info(f"start_timer complete {event}")

    async def continue_timer(self, event):
        '''
        continue to next second of the experiment
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)
        #logger.info(f"continue_timer: start")

        if not self.world_state_local["timer_running"]:
            logger.info(f"continue_timer timer off")
            await self.send_message(message_to_self=True, message_to_group=None,
                                    message_type="stop_timer_pulse", send_to_client=True, send_to_group=False)
            return

        #check if full second has past
        ts = datetime.now() - datetime.strptime(self.world_state_local["timer_history"][-1]["time"],"%Y-%m-%dT%H:%M:%S.%f")

        if self.world_state_local["timer_history"][-1]["count"] == math.floor(ts.seconds):
            return

        v = await sync_to_async(sync_continue_timer)(event, self.session_id)

        if v["world_state"]:
            self.world_state_local = v["world_state"]
            result = {}

            #session status
            result["value"] = "success"
            result["time_remaining"] = self.world_state_local["time_remaining"]
            result["current_period"] = self.world_state_local["current_period"]
            result["timer_running"] = self.world_state_local["timer_running"]
            result["started"] = self.world_state_local["started"]
            result["finished"] = self.world_state_local["finished"]
            result["current_experiment_phase"] = self.world_state_local["current_experiment_phase"]
            result["earnings"] = v["earnings"]
            result["period_is_over"] = v["period_is_over"]

            if v["period_is_over"]:
                #avatar inventorys
                result["avatars"] = self.world_state_local["avatars"]

                result["fields"] = {}
                for i in self.world_state_local["fields"]:
                    result["fields"][i] = {}
                    for j in main.globals.Goods.choices:
                        good = j[0]
                        result["fields"][i][good] = self.world_state_local["fields"][i][good]

            #current locations
            result["current_locations"] = {}
            for i in self.world_state_local["session_players"]:
                result["current_locations"][i] = self.world_state_local["session_players"][i]["current_location"]

            session_player_status = {}

            #decrement waiting and interaction time
            # for p in self.world_state_local["session_players"]:
            #     session_player = self.world_state_local["session_players"][p]

            #     if session_player["cool_down"] > 0:
            #         session_player["cool_down"] -= 1

            #     if session_player["interaction"] > 0:
            #         session_player["interaction"] -= 1

            #         if session_player["interaction"] == 0:
            #             session_player["cool_down"] = self.parameter_set_local["cool_down_length"]
                
            #     if session_player["interaction"] == 0:
            #         session_player["frozen"] = False
            #         session_player["tractor_beam_target"] = None

            #     session_player_status[p] = {"interaction": session_player["interaction"], 
            #                                 "frozen": session_player["frozen"], 
            #                                 "cool_down": session_player["cool_down"],
            #                                 "tractor_beam_target" : session_player["tractor_beam_target"]}                
            
            result["session_player_status"] = session_player_status

            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                               type="timer_tick",
                                               period_number=self.world_state_local["current_period"],
                                               time_remaining=self.world_state_local["time_remaining"],
                                               data=self.world_state_local)
            
            await self.send_message(message_to_self=False, message_to_group=result,
                                    message_type="time", send_to_client=False, send_to_group=True)
        
        # logger.info(f"continue_timer end")

    async def update_time(self, event):
        '''
        update time phase
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    

def sync_start_timer(event, session_id):
    '''
    start timer action
    '''
    status = "success"
    error_message = []
    world_state = None

    with transaction.atomic():
        session = Session.objects.select_for_update().get(id=session_id)

        if event["message_text"]["action"] == "start":            
            session.world_state["timer_running"] = True
        else:
            session.world_state["timer_running"] = False

        session.world_state["timer_history"].append({"time": datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f"),
                                                     "count": 0})

        session.save()
        world_state = session.world_state
    
    return {"status" : status, "error_message" : error_message, "world_state" : world_state}

def sync_continue_timer(event, session_id):
    '''
    timer pulse action
    '''

    status = "success"
    error_message = []
    world_state = None
    earnings = {}
    period_is_over = False

    with transaction.atomic():
        session = Session.objects.select_for_update().get(id=session_id)
        parameter_set = session.parameter_set.json()

        #check session over
        if session.world_state["current_period"] >= parameter_set["period_count"] and \
            session.world_state["time_remaining"] <= 1:

            session.world_state["current_period"] = parameter_set["period_count"]
            session.world_state["time_remaining"] = 0
            session.world_state["timer_running"] = False

            session.save()
            
            session = session.get_current_session_period().do_consumption()
            session.world_state["current_experiment_phase"] = ExperimentPhase.NAMES
            period_is_over = True

            session.save()
            
        if session.world_state["current_experiment_phase"] != ExperimentPhase.NAMES:

            ts = datetime.now() - datetime.strptime(session.world_state["timer_history"][-1]["time"],"%Y-%m-%dT%H:%M:%S.%f")

            #check if a full second has passed
            # if session.world_state["timer_history"][-1]["count"] == math.floor(ts.seconds):
            #     send_update = False

            # if send_update:
            session.world_state["timer_history"][-1]["count"] = math.floor(ts.seconds)

            total_time = 0
            for i in session.world_state["timer_history"]:
                total_time += i["count"]

            current_period = math.floor(total_time / parameter_set["period_length"]) + 1
            time_remaining = parameter_set["period_length"] - (total_time % parameter_set["period_length"])

            session.world_state["time_remaining"] = time_remaining
            session.world_state["current_period"] = current_period
            session.save()

            period_is_over = False
            if current_period > 1:
                last_period_id = session.world_state["session_periods_order"][current_period - 2]
                last_period = session.world_state["session_periods"][str(last_period_id)]

                period_is_over = not last_period["consumption_completed"]

            #check if period over
            if period_is_over:
                
                session = session.session_periods.get(id=last_period_id).do_consumption()
                session = session.session_periods.get(id=last_period_id).do_production()

                for i in session.world_state["session_players"]:
                    # session.world_state["session_players"][i]["earnings"] += session.world_state["session_players"][i]["inventory"][current_period_id]

                    earnings[i] = {}
                    earnings[i]["total_earnings"] = 0
                    earnings[i]["period_earnings"] = 0
                
        
        world_state = session.world_state

    return {"status" : status, "error_message" : error_message, "world_state" : world_state, "earnings" : earnings, "period_is_over" : period_is_over}