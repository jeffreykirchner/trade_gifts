'''
build test
'''

import logging
import sys
import pytest
import json

from channels.testing import WebsocketCommunicator
from channels.routing import URLRouter
from asgiref.sync import sync_to_async
from asgiref.sync import async_to_sync

from django.test import TestCase


from main.models import Session

from main.routing import websocket_urlpatterns

class TestSubjectConsumer(TestCase):
    fixtures = ['auth_user.json', 'main.json']

    user = None
    session = None
    parameter_set_json = None
    session_player_1 = None
    communicator_subject = []
    communicator_staff = None

    def setUp(self):
        sys._called_from_test = True
        logger = logging.getLogger(__name__)

        logger.info('setup tests')

        self.session = Session.objects.get(title="Test 1")
        self.parameter_set_json = self.session.parameter_set.json()

    async def set_up_communicators(self):
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
            self.communicator_subject.append(WebsocketCommunicator(application, connection_path_subject))

            connected_subject, subprotocol_subject = await self.communicator_subject[-1].connect()
            assert connected_subject

            message = {'message_type': 'get_session',
                       'message_text': {"player_key" :str(i.player_key)}}

            await self.communicator_subject[-1].send_json_to(message)
            response = await self.communicator_subject[-1].receive_json_from()
            # logger.info(response)
            
            self.assertEquals(response['message']['message_type'],'get_session')
            self.assertEquals(response['message']['message_data']['session_player']['id'], i.id)

        #staff
        self.communicator_staff = WebsocketCommunicator(application, connection_path_staff)
        connected_staff, subprotocol_staff = await self.communicator_staff.connect()
        assert connected_staff

        # #get staff session
        message = {'message_type': 'get_session',
                   'message_text': {"session_key" :str(self.session.session_key)}}

        await self.communicator_staff.send_json_to(message)
        response = await self.communicator_staff.receive_json_from()
        #logger.info(response)
        
        self.assertEquals(response['message']['message_type'],'get_session')
    
    @pytest.mark.asyncio
    async def start_session(self):
        '''
        start session and advance past instructions
        '''
        logger = logging.getLogger(__name__)

        # #start session
        message = {'message_type' : 'start_experiment',
                   'message_text' : {},
                   'message_target' : 'self', }

        await self.communicator_staff.send_json_to(message)

        for i in self.communicator_subject:
            response = await i.receive_json_from()
            self.assertEquals(response['message']['message_type'],'update_start_experiment')
            message_data = response['message']['message_data']
            self.assertEquals(message_data['value'],'success')
        
        response = await self.communicator_staff.receive_json_from()
           
        # #advance past instructions
        message = {'message_type' : 'next_phase',
                   'message_text' : {},
                   'message_target' : 'self',}

        await self.communicator_staff.send_json_to(message)
       
        for i in self.communicator_subject:
            response = await i.receive_json_from()
            self.assertEquals(response['message']['message_type'],'update_next_phase')
            message_data = response['message']['message_data']
            self.assertEquals(message_data['value'],'success')
           
        
        response = await self.communicator_staff.receive_json_from()
    
    @pytest.mark.asyncio
    async def close_communicators(self):
        '''
        close the socket communicators
        '''
        for i in self.communicator_subject:
            await i.disconnect()
        await self.communicator_staff.disconnect()  

    @pytest.mark.asyncio
    async def test_chat_group(self):
        '''
        test get session subject from consumer
        '''        
        logger = logging.getLogger(__name__)
        logger.info(f"called from test {sys._called_from_test}" )

        await self.set_up_communicators()

        #send chat
        message = {'message_type' : 'chat',
                   'message_text' : {'text': 'How do you do?',"current_location":{"x":0,"y":0}},
                   'message_target' : 'group', 
                  }
        
        await self.communicator_subject[0].send_json_to(message)

        for i in self.communicator_subject:
            response = await i.receive_json_from()
            #logger.info(response)
            message_data = response['message']['message_data']
            self.assertEquals(message_data['status'],'fail')
            self.assertEquals(message_data['error_message'],'Session not started.')
            self.assertEquals(response['message']['message_type'],'update_chat')
        
        #staff response
        response = await self.communicator_staff.receive_json_from()
        #logger.info(response)

        await self.start_session()

        # #re-try chat to all
        message = {'message_type' : 'chat',
                   'message_text' : {'text': 'Hello?',"current_location":{"x":0,"y":0}},
                   'message_target' : 'group', 
                  }
                                
        await self.communicator_subject[0].send_json_to(message)
        #subject response
        response = await self.communicator_subject[0].receive_json_from()
        message_data = response['message']['message_data']
        #logger.info(message_data)
        self.assertEquals(message_data['status'],'success')
        self.assertEquals(message_data['text'],'Hello?')

        # #staff response
        response = await self.communicator_staff.receive_json_from()
        #logger.info(response)
        message_data = response['message']['message_data']
        self.assertEquals(message_data['status'],'success')
        self.assertEquals(message_data['text'],'Hello?')

        await self.close_communicators()
    
    @pytest.mark.asyncio
    async def test_harvest_patch(self):
        '''
        test harvest patch
        '''

        logger = logging.getLogger(__name__)
        logger.info(f"called from test {sys._called_from_test}" )

        await self.set_up_communicators()
        await self.start_session()

        patch_1 = self.parameter_set_json["parameter_set_patches_order"][0]

        message = {'message_type' : 'patch_harvest',
                   'message_text' : {'patch_id': patch_1},
                   'message_target' : 'group', 
                  }
        
        #harvest first ring
        await self.communicator_subject[0].send_json_to(message)

        for i in self.communicator_subject:
            response = await i.receive_json_from()
            #logger.info(response)
            message_data = response['message']['message_data']
            self.assertEquals(message_data['status'],'success')           
            self.assertEquals(response['message']['message_type'],'update_patch_harvest')
            self.assertEquals(message_data['harvest_amount'], 8)
        
        #harvest again and fail
        await self.communicator_subject[0].send_json_to(message)

        for i in self.communicator_subject:
            response = await i.receive_json_from()
            #logger.info(response)
            message_data = response['message']['message_data']
            self.assertEquals(message_data['status'],'fail')   
            self.assertEquals(message_data['error_message'][0]['message'],'Wait until next period to harvest again.')        
           
        #harvest next ring
        await self.communicator_subject[1].send_json_to(message)

        for i in self.communicator_subject:
            response = await i.receive_json_from()
            #logger.info(response)
            message_data = response['message']['message_data']
            self.assertEquals(message_data['status'],'success')           
            self.assertEquals(response['message']['message_type'],'update_patch_harvest')
            self.assertEquals(message_data['harvest_amount'], 4)

        #harvest next ring
        await self.communicator_subject[2].send_json_to(message)

        for i in self.communicator_subject:
            response = await i.receive_json_from()
            #logger.info(response)
            message_data = response['message']['message_data']
            self.assertEquals(message_data['status'],'success')           
            self.assertEquals(response['message']['message_type'],'update_patch_harvest')
            self.assertEquals(message_data['harvest_amount'], 2)

        #harvest when empty fails
        await self.communicator_subject[3].send_json_to(message)

        for i in self.communicator_subject:
            response = await i.receive_json_from()
            logger.info(response)
            message_data = response['message']['message_data']
            self.assertEquals(message_data['status'],'fail')   
            self.assertEquals(message_data['error_message'][0]['message'],'The patch is empty.')

        await self.close_communicators()




