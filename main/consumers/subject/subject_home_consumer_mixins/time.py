from copy import deepcopy

class TimeMixin():
    '''
    time mixin for subject home consumer
    '''

    async def update_time(self, event):
        '''
        update running, phase and time status
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_subjects=None, message_to_staff=None, 
                                message_type=event['type'], send_to_client=True, send_to_group=False)

