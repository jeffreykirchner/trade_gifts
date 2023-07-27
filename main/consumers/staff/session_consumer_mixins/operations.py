import logging
import asyncio
import math

from datetime import datetime

from asgiref.sync import sync_to_async

from django.db import transaction

from main.models import Session
from main.models import SessionEvent

class OperationsMixin():
    '''
    automated experiment operations
    '''

    async def do_field_production(self):
        '''
        do field production for current period
        '''
        session = await Session.objects.aget(id=self.session_id)
        await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)
        current_session_period = await session.session_periods.aget(period_number=self.world_state_local["current_period"])
        self.world_state_local = await sync_to_async(current_session_period.do_production)()