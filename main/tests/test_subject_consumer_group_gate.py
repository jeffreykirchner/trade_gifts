'''
build test
'''

import logging
import sys
import pytest

from channels.testing import WebsocketCommunicator
from channels.routing import URLRouter

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
           
        # #advance past instructions
        message = {'message_type' : 'next_phase',
                   'message_text' : {},
                   'message_target' : 'self',}

        await communicator_staff.send_json_to(message)
       
        for i in communicator_subject:
            response = await i.receive_json_from()
            self.assertEqual(response['message']['message_type'],'update_next_phase')
            message_data = response['message']['message_data']
            self.assertEqual(message_data['value'],'success')
           
        response = await communicator_staff.receive_json_from()

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

       






