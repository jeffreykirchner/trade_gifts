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

import main

class TestProduction(TestCase):
    fixtures = ['auth_user.json', 'main.json']

    user = None
    session = None
    parameter_set = None
    session_player_1 = None
    communicator_subject = None
    communicator_staff = None

    field_1 = None
    filed_1_filed_type = None
    field_1_good_one = None
    field_1_good_two = None

    field_2 = None
    filed_2_filed_type = None
    field_2_good_one = None
    field_2_good_two = None

    def setUp(self):
        sys._called_from_test = True
        logger = logging.getLogger(__name__)

        logger.info('setup tests')

        self.session = Session.objects.all().first()

        self.session.start_experiment()        

        self.parameter_set = self.session.parameter_set.json()

       

    def update_field_variables(self):
        self.field_1 = self.session.world_state["fields"][str(self.parameter_set["parameter_set_fields_order"][0])]
        self.filed_1_filed_type = self.parameter_set["parameter_set_field_types"][str(self.field_1["parameter_set_field_type"])]
        self.field_1_good_one = self.filed_1_filed_type["good_one"]
        self.field_1_good_two = self.filed_1_filed_type["good_two"]

        self.field_2 = self.session.world_state["fields"][str(self.parameter_set["parameter_set_fields_order"][1])]
        self.filed_2_filed_type = self.parameter_set["parameter_set_field_types"][str(self.field_2["parameter_set_field_type"])]
        self.field_2_good_one = self.filed_2_filed_type["good_one"]
        self.field_2_good_two = self.filed_2_filed_type["good_two"]
    
    def test_period_1(self):
        '''
        test period 1 production
        '''

        logger = logging.getLogger(__name__)
        logger.info('test period 1 production')       

        current_session_period = self.session.get_current_session_period()
        current_session_period.do_production()
        self.update_field_variables()

        self.assertEqual(0, self.field_1[self.field_1_good_one])
        self.assertEqual(0, self.field_1[self.field_1_good_two])

        self.assertEqual(1, self.field_2[self.field_2_good_one])
        self.assertEqual(1, self.field_2[self.field_2_good_two])

    def test_period_2(self):
        '''
        test period 2 production
        '''

        logger = logging.getLogger(__name__)
        logger.info('test period 2 production')

        self.session.world_state["current_period"] = 2
        current_session_period = self.session.get_current_session_period()
        # logger.info(self.session.world_state["fields"])
        #logger.info(f'test_period_2: period {current_session_period.period_number}')
        current_session_period.do_production()
        self.update_field_variables()

        self.assertEqual(1, self.field_1[self.field_1_good_one])
        self.assertEqual(1, self.field_1[self.field_1_good_two])

        self.assertEqual(5, self.field_2[self.field_2_good_one])
        self.assertEqual(5, self.field_2[self.field_2_good_two])

    def test_period_3(self):
        '''
        test period 3 production
        '''

        logger = logging.getLogger(__name__)
        logger.info('test period 3 production')

        self.session.world_state["current_period"] = 3
        current_session_period = self.session.get_current_session_period()
        # logger.info(self.session.world_state["fields"])
        #logger.info(f'test_period_2: period {current_session_period.period_number}')
        current_session_period.do_production()
        self.update_field_variables()

        self.assertEqual(5, self.field_1[self.field_1_good_one])
        self.assertEqual(5, self.field_1[self.field_1_good_two])

        self.assertEqual(1, self.field_2[self.field_2_good_one])
        self.assertEqual(1, self.field_2[self.field_2_good_two])

    def test_period_2_with_period_1_harvest(self):
        '''
        test period 2 production with period 1 harvest
        '''
        
        logger = logging.getLogger(__name__)
        logger.info('test period 2 production with period 1 harvest')

        self.session.world_state["current_period"] = 2
        current_session_period = self.session.get_current_session_period()

        


   
