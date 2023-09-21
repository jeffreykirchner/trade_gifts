import logging

from asgiref.sync import sync_to_async

from django.core.exceptions import ObjectDoesNotExist

from main.models import Session
from main.models import ParameterSetHat

from main.forms import ParameterSetHatForm

from ..session_parameters_consumer_mixins.get_parameter_set import take_get_parameter_set

class ParameterSetHatsMixin():
    '''
    parameter set hats mixin
    '''

    async def update_parameter_set_hat(self, event):
        '''
        update a parameterset hat
        '''

        message_data = {}
        message_data["status"] = await take_update_parameter_set_hat(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

    async def remove_parameterset_hat(self, event):
        '''
        remove a parameterset hat
        '''

        message_data = {}
        message_data["status"] = await take_remove_parameterset_hat(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)
    
    async def add_parameterset_hat(self, event):
        '''
        add a parameterset hat
        '''

        message_data = {}
        message_data["status"] = await take_add_parameterset_hat(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

@sync_to_async
def take_update_parameter_set_hat(data):
    '''
    update parameterset hat
    '''   
    logger = logging.getLogger(__name__) 
    logger.info(f"Update parameterset hat: {data}")

    session_id = data["session_id"]
    parameterset_hat_id = data["parameterset_hat_id"]
    form_data = data["form_data"]

    try:        
        parameter_set_hat = ParameterSetHat.objects.get(id=parameterset_hat_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_update_parameter_set_hat, not found ID: {parameterset_hat_id}")
        return
    
    form_data_dict = form_data

    logger.info(f'form_data_dict : {form_data_dict}')

    form = ParameterSetHatForm(form_data_dict, instance=parameter_set_hat)

    if form.is_valid():         
        form.save()              
        parameter_set_hat.parameter_set.update_json_fk(update_hats=True)

        return {"value" : "success"}                      
                                
    logger.info("Invalid parameterset hat form")
    return {"value" : "fail", "errors" : dict(form.errors.items())}

@sync_to_async
def take_remove_parameterset_hat(data):
    '''
    remove the specifed parmeterset hat
    '''
    logger = logging.getLogger(__name__) 
    logger.info(f"Remove parameterset hat: {data}")

    session_id = data["session_id"]
    parameterset_hat_id = data["parameterset_hat_id"]

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_hat = ParameterSetHat.objects.get(id=parameterset_hat_id)
        
    except ObjectDoesNotExist:
        logger.warning(f"take_remove_parameterset_hat, not found ID: {parameterset_hat_id}")
        return
    
    parameter_set_hat.delete()
    session.parameter_set.update_json_fk(update_hats=True)
    
    return {"value" : "success"}

@sync_to_async
def take_add_parameterset_hat(data):
    '''
    add a new parameter hat to the parameter set
    '''
    logger = logging.getLogger(__name__) 
    logger.info(f"Add parameterset hat: {data}")

    session_id = data["session_id"]

    try:        
        session = Session.objects.get(id=session_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_add_parameterset_hat session, not found ID: {session_id}")
        return {"value" : "fail"}

    parameter_set_hat = ParameterSetHat.objects.create(parameter_set=session.parameter_set)
    session.parameter_set.update_json_fk(update_hats=True)

    return {"value" : "success"}
    
