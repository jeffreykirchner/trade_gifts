'''
build test
'''

import logging
import sys
import pytest
import asyncio

from channels.testing import WebsocketCommunicator
from channels.routing import URLRouter

from asgiref.sync import sync_to_async

from django.test import TestCase

from main.models import Session

from main.routing import websocket_urlpatterns

class TestSubjectConsumerGroupGate(TestCase):
    fixtures = ['auth_user.json', 'main.json']

    user = None
    session = None
    parameter_set_json = None
    session_player_1 = None

    def setUp(self):
        sys._called_from_test = True
        logger = logging.getLogger(__name__)

        logger.info('setup tests')

        self.session = Session.objects.get(title="Test 1")
        self.parameter_set_json = self.session.parameter_set.json()

    async def set_up_communicators(self, communicator_subject, communicator_staff):
        '''
        setup the socket communicators
        '''
        logger = logging.getLogger(__name__)

        session_player = await self.session.session_players.afirst()

        connection_path_staff = f"/ws/staff-session/{self.session.channel_key}/session-{self.session.id}/{self.session.channel_key}"

        application = URLRouter(websocket_urlpatterns)
        
        #subjects
        async for i in self.session.session_players.all():
            connection_path_subject = f"/ws/subject-home/{self.session.channel_key}/session-{self.session.id}/{i.player_key}"
            communicator_subject.append(WebsocketCommunicator(application, connection_path_subject))

            connected_subject, subprotocol_subject = await communicator_subject[-1].connect()
            assert connected_subject

            message = {'message_type': 'get_session',
                       'message_text': {"player_key" :str(i.player_key)}}

            await communicator_subject[-1].send_json_to(message)
            response = await communicator_subject[-1].receive_json_from()
            # logger.info(response)
            
            self.assertEqual(response['message']['message_type'],'get_session')
            self.assertEqual(response['message']['message_data']['session_player']['id'], i.id)

        #staff
        communicator_staff = WebsocketCommunicator(application, connection_path_staff)
        connected_staff, subprotocol_staff = await communicator_staff.connect()
        assert connected_staff

        # #get staff session
        message = {'message_type': 'get_session',
                   'message_text': {"session_key" :str(self.session.session_key)}}

        await communicator_staff.send_json_to(message)
        response = await communicator_staff.receive_json_from()
        #logger.info(response)
        
        self.assertEqual(response['message']['message_type'],'get_session')

        return communicator_subject, communicator_staff
    
    async def start_session(self, communicator_subject, communicator_staff):
        '''
        start session and advance past instructions
        '''
        logger = logging.getLogger(__name__)

        # #start session
        message = {'message_type' : 'start_experiment',
                   'message_text' : {},
                   'message_target' : 'self', }

        await communicator_staff.send_json_to(message)

        for i in communicator_subject:
            response = await i.receive_json_from()
            self.assertEqual(response['message']['message_type'],'update_start_experiment')
            message_data = response['message']['message_data']
            self.assertEqual(message_data['value'],'success')
        
        response = await communicator_staff.receive_json_from()
           
        # # #advance past instructions
        # message = {'message_type' : 'next_phase',
        #            'message_text' : {},
        #            'message_target' : 'self',}

        # await communicator_staff.send_json_to(message)
       
        # for i in communicator_subject:
        #     response = await i.receive_json_from()
        #     self.assertEqual(response['message']['message_type'],'update_next_phase')
        #     message_data = response['message']['message_data']
        #     self.assertEqual(message_data['value'],'success')
           
        # response = await communicator_staff.receive_json_from()

        return communicator_subject, communicator_staff
    
    async def close_communicators(self, communicator_subject, communicator_staff):
        '''
        close the socket communicators
        '''
        for i in communicator_subject:
            await i.disconnect()

        await communicator_staff.disconnect()

    @pytest.mark.asyncio
    async def test_group_gate(self):
        '''
        test harvest patch
        '''

        communicator_subject = []
        communicator_staff = None

        logger = logging.getLogger(__name__)
        logger.info(f"called from test {sys._called_from_test}" )

        communicator_subject, communicator_staff = await self.set_up_communicators(communicator_subject, communicator_staff)
        communicator_subject, communicator_staff = await self.start_session(communicator_subject, communicator_staff)

        session_json = await sync_to_async(self.session.json)()
        p1_id = session_json["session_players_order"][0]
        group_gate_1_id = session_json["parameter_set"]["parameter_set_group_gates_order"][0]
        group_gate_4_id = session_json["parameter_set"]["parameter_set_group_gates_order"][3]

        #start timer
        message = {'message_type' : 'start_timer',
                   'message_text' :  {'action' : 'start'},
                   'message_target' : 'self',}
        
        await communicator_staff.send_json_to(message)
        response = await communicator_staff.receive_json_from()
        message_data = response['message']['message_data']
        self.assertEqual(response['message']['message_type'],'start_timer')
        self.assertEqual(message_data['timer_running'],True)        

        #player one requests access to group gate
        message = {'message_type' : 'group_gate_access_request',
                   'message_text' : {"player_id" : p1_id,
                                     "group_gate_id" : group_gate_1_id,},
                   'message_target' : 'group', 
                   }
        
        await communicator_subject[0].send_json_to(message)

        #check that the player has access to the group gate
        await asyncio.sleep(1)
        message = {'message_type' : 'continue_timer',
                   'message_text' : {},
                   'message_target' : 'self', 
                  }
        
        await communicator_staff.send_json_to(message)
        response = await communicator_staff.receive_json_from()
        message_data = response['message']['message_data']         
        self.assertEqual(response['message']['message_type'],'update_time')

        group_gate_1 = message_data['group_gates'][str(group_gate_1_id)]
        self.assertIn(p1_id, group_gate_1['allowed_players'])
        self.assertEqual(len(group_gate_1['allowed_players']), 1)

        #player one requests access to another group gate 4
        message = {'message_type' : 'group_gate_access_request',
                   'message_text' : {"player_id" : p1_id,
                                     "group_gate_id" : group_gate_4_id,},
                   'message_target' : 'group', 
                   }
        
        await communicator_subject[0].send_json_to(message)

        #check that the player does not have access to the group gate
        await asyncio.sleep(1)
        message = {'message_type' : 'continue_timer',
                   'message_text' : {},
                   'message_target' : 'self', 
                  }
        
        await communicator_staff.send_json_to(message)
        response = await communicator_staff.receive_json_from()
        message_data = response['message']['message_data']
        self.assertEqual(response['message']['message_type'],'update_time')

        group_gate_4 = message_data['group_gates'][str(group_gate_4_id)]
        self.assertNotIn(p1_id, group_gate_4['allowed_players'])
        self.assertEqual(len(group_gate_4['allowed_players']), 0)

        #check that player 2 can't access group gate 1
        p2_id = session_json["session_players_order"][1]
        message = {'message_type' : 'group_gate_access_request',
                   'message_text' : {"player_id" : p2_id,
                                     "group_gate_id" : group_gate_1_id,},
                   'message_target' : 'group', 
                   }
        
        await communicator_subject[1].send_json_to(message)

        #check that the player does not have access to the group gate
        await asyncio.sleep(1)
        message = {'message_type' : 'continue_timer',
                   'message_text' : {},
                   'message_target' : 'self', 
                  }
        
        await communicator_staff.send_json_to(message)
        response = await communicator_staff.receive_json_from()
        message_data = response['message']['message_data']
        self.assertEqual(response['message']['message_type'],'update_time')

        group_gate_1 = message_data['group_gates'][str(group_gate_1_id)]
        self.assertNotIn(p2_id, group_gate_1['allowed_players'])
        self.assertEqual(len(group_gate_1['allowed_players']), 1)

        #check that player 2 can access group gate 4
        message = {'message_type' : 'group_gate_access_request',
                   'message_text' : {"player_id" : p2_id,
                                     "group_gate_id" : group_gate_4_id,},
                   'message_target' : 'group', 
                   }
        
        await communicator_subject[1].send_json_to(message)

        #check that the player has access to the group gate
        await asyncio.sleep(1)
        message = {'message_type' : 'continue_timer',
                   'message_text' : {},
                   'message_target' : 'self', 
                  }
        
        await communicator_staff.send_json_to(message)
        response = await communicator_staff.receive_json_from()
        message_data = response['message']['message_data']
        self.assertEqual(response['message']['message_type'],'update_time')

        group_gate_4 = message_data['group_gates'][str(group_gate_4_id)]
        self.assertIn(p2_id, group_gate_4['allowed_players'])
        self.assertEqual(len(group_gate_4['allowed_players']), 1)

        #check that player 5 can access group gate 1
        p5_id = session_json["session_players_order"][4]
        message = {'message_type' : 'group_gate_access_request',
                   'message_text' : {"player_id" : p5_id,
                                     "group_gate_id" : group_gate_1_id,},
                   'message_target' : 'group', 
                   }
        
        await communicator_subject[4].send_json_to(message)

        #check that the player has access to the group gate
        await asyncio.sleep(1)
        message = {'message_type' : 'continue_timer',
                   'message_text' : {},
                   'message_target' : 'self', 
                  }
        
        await communicator_staff.send_json_to(message)

        response = await communicator_staff.receive_json_from()
        message_data = response['message']['message_data']
        self.assertEqual(response['message']['message_type'],'update_time')

        group_gate_1 = message_data['group_gates'][str(group_gate_1_id)]
        self.assertIn(p5_id, group_gate_1['allowed_players'])
        self.assertEqual(len(group_gate_1['allowed_players']), 2)


        


    





