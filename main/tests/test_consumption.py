'''
build test
'''

import logging
import sys
import math

from django.test import TestCase

from main.models import Session
from main.globals import convert_goods_to_health

import main

class TestConsumption(TestCase):
    fixtures = ['auth_user.json', 'main.json']

    user = None
    session = None
    parameter_set = None
    session_player_1 = None
    communicator_subject = None
    communicator_staff = None

    def setUp(self):
        sys._called_from_test = True
        logger = logging.getLogger(__name__)

        logger.info('setup tests')

        self.session = Session.objects.get(title="Test 1")    

        self.parameter_set = self.session.parameter_set.json()

    def test_house_one_good(self):
        '''
        test house with one good
        '''

        v = convert_goods_to_health(1, 0, 0, self.parameter_set)
        self.assertEqual(v, '0.0')

        v = convert_goods_to_health(0, 1, 0, self.parameter_set)
        self.assertEqual(v, '0.0')

        v = convert_goods_to_health(24, 0, 0, self.parameter_set)
        self.assertEqual(v, '0.1')

        v = convert_goods_to_health(0, 24, 0, self.parameter_set)
        self.assertEqual(v, '0.1')
    
    def test_house_two_good(self):
        '''
        test house with two goods
        '''

        v = convert_goods_to_health(1, 1, 0, self.parameter_set)
        self.assertEqual(v, '3.3')

        v = convert_goods_to_health(8, 8, 0, self.parameter_set)
        self.assertEqual(v, '26.7')
    
    def test_house_three_good(self):
        '''
        test house with three goods
        '''

        v = convert_goods_to_health(0, 0, 1, self.parameter_set)
        self.assertEqual(v, '0.0')

        v = convert_goods_to_health(8, 8, 8, self.parameter_set)
        self.assertEqual(v, '51.2')





        

    





        


   
