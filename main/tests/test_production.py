'''
build test
'''

import logging
import sys

from django.test import TestCase

from main.models import Session
from main.models import ParameterSetFieldType

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
    field_1_field_type = None
    field_1_good_one = None
    field_1_good_two = None

    field_2 = None
    field_2_field_type = None
    field_2_good_one = None
    field_2_good_two = None

    def setUp(self):
        sys._called_from_test = True
        logger = logging.getLogger(__name__)

        logger.info('setup tests')

        self.session = Session.objects.get(title="test 2")    

        self.parameter_set = self.session.parameter_set.json()

    def update_field_variables(self):
        if len(self.session.world_state["fields"]) == 0:
            return
        
        self.field_1 = self.session.world_state["fields"][str(self.parameter_set["parameter_set_fields_order"][0])]
        self.field_1_field_type = self.parameter_set["parameter_set_field_types"][str(self.field_1["parameter_set_field_type"])]
        self.field_1_good_one = self.field_1_field_type["good_one"]
        self.field_1_good_two = self.field_1_field_type["good_two"]

        self.field_2 = self.session.world_state["fields"][str(self.parameter_set["parameter_set_fields_order"][1])]
        self.field_2_field_type = self.parameter_set["parameter_set_field_types"][str(self.field_2["parameter_set_field_type"])]
        self.field_2_good_one = self.field_2_field_type["good_one"]
        self.field_2_good_two = self.field_2_field_type["good_two"]
    
    def test_period_1(self):
        '''
        test period 1 production
        '''

        if len(self.session.world_state["fields"]) == 0:
            return

        logger = logging.getLogger(__name__)
        logger.info('test period 1 production')  

        self.session.start_experiment()     

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

        if len(self.session.world_state["fields"]) == 0:
            return

        logger = logging.getLogger(__name__)
        logger.info('test period 2 production')

        self.session.start_experiment()

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

        if len(self.session.world_state["fields"]) == 0:
            return

        logger = logging.getLogger(__name__)
        logger.info('test period 3 production')

        self.session.start_experiment()

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

        if len(self.session.world_state["fields"]) == 0:
            return
        
        logger = logging.getLogger(__name__)
        logger.info('test period 2 production with period 1 harvest')

        self.session.start_experiment()

        self.session.world_state["current_period"] = 2
        current_session_period = self.session.get_current_session_period()
        previous_session_period = self.session.session_periods.get(period_number=1)

        self.update_field_variables()

        self.field_2["harvest_history"][str(previous_session_period.id)].append({self.field_2_good_one: 1, self.field_2_good_two: 1})
        self.session.save()

        current_session_period.do_production()
        self.update_field_variables()

        self.assertEqual(1, self.field_1[self.field_1_good_one])
        self.assertEqual(1, self.field_1[self.field_1_good_two])

        self.assertEqual(1, self.field_2[self.field_2_good_one])
        self.assertEqual(1, self.field_2[self.field_2_good_two])
        
    def test_period_2_with_variables(self):
        '''
        test period 2 after changing production variables
        '''
        if len(self.session.world_state["fields"]) == 0:
            return
        
        self.update_field_variables()

        field_type = ParameterSetFieldType.objects.get(id=self.field_1_field_type["id"])
        field_type.good_one_alpha = 2
        field_type.good_one_omega = 3
        field_type.good_one_rho = 0.1

        field_type.good_two_alpha = 2.5
        field_type.good_two_omega = 3.5
        field_type.good_two_rho = 0.15

        field_type.save()

        field_type = ParameterSetFieldType.objects.get(id=self.field_2_field_type["id"])
        field_type.good_one_alpha = 4
        field_type.good_one_omega = 5
        field_type.good_one_rho = 0.4

        field_type.good_two_alpha = 4.5
        field_type.good_two_omega = 5.5
        field_type.good_two_rho = 0.45
        
        field_type.save()

        self.parameter_set = self.session.parameter_set.json(update_required=True)

        self.session.start_experiment()

        self.session.world_state["current_period"] = 2
        current_session_period = self.session.get_current_session_period()
        # logger.info(self.session.world_state["fields"])
        #logger.info(f'test_period_2: period {current_session_period.period_number}')
        current_session_period.do_production()
        self.update_field_variables()

        self.assertEqual(25, self.field_1[self.field_1_good_one])
        self.assertEqual(104, self.field_1[self.field_1_good_two])

        self.assertEqual(12500, self.field_2[self.field_2_good_one])
        self.assertEqual(31444, self.field_2[self.field_2_good_two])

    def test_period_2_effort(self):
        '''
        change effort
        '''

        if len(self.session.world_state["fields"]) == 0:
            return
        
        logger = logging.getLogger(__name__)
        logger.info('test period 2 effort')

        self.session.start_experiment()

        self.update_field_variables()
        
        self.session.world_state["current_period"] = 2
        current_session_period = self.session.get_current_session_period()
       
        self.field_1["good_one_effort"] = 1
        self.field_1["good_two_effort"] = 9
        
        self.field_2["good_one_effort"] = 8
        self.field_2["good_two_effort"] = 2

        self.session.save()

        current_session_period.do_production()
        self.update_field_variables()

        self.assertEqual(0, self.field_1[self.field_1_good_one])
        self.assertEqual(2, self.field_1[self.field_1_good_two])

        self.assertEqual(8, self.field_2[self.field_2_good_one])
        self.assertEqual(2, self.field_2[self.field_2_good_two])





        


   
