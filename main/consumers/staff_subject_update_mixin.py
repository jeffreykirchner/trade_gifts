
import json
import logging

from asgiref.sync import sync_to_async

from django.core.serializers.json import DjangoJSONEncoder
from django.core.exceptions import ObjectDoesNotExist

from main.models import  HelpDocs

import main

class StaffSubjectUpdateMixin():
    '''
    shared functionallity across all consumers
    '''

    connection_type = None            #staff or subject
    connection_uuid = None            #uuid of connected object   
    session_id = None                 #id of session    
    
    async def help_doc(self, event):
        '''
        help doc request
        '''
        logger = logging.getLogger(__name__) 
        # result = await sync_to_async(take_help_doc)(event["message_text"])

        data = event["message_text"]
        result = {}

        try:
            help_doc = await HelpDocs.objects.aget(title=data["title"])

            result = {"value" : "success",
                      "result" : {"help_doc" : await help_doc.ajson()}}
        except ObjectDoesNotExist:
            logger.warning(f"take_help_doc not found : {data}")
            result = {"value" : "fail", 
                      "message" : "Document Not Found."}

        message_data = {}
        message_data["status"] = result

        message = {}
        message["message_type"] = event["type"]
        message["message_data"] = message_data

        # Send reply to sending channel
        await self.send(text_data=json.dumps({'message': message}, cls=DjangoJSONEncoder))


    
