import logging

from asgiref.sync import sync_to_async

from django.core.exceptions import ObjectDoesNotExist

from main.models import Session
from main.models import ParameterSetFieldType

from main.forms import ParameterSetFieldTypeForm

from ..session_parameters_consumer_mixins.get_parameter_set import take_get_parameter_set

class ParameterSetFieldTypesMixin():
    '''
    parameter set plaeyer mixin
    '''

    async def update_parameter_set_field_type(self, event):
        '''
        update a parameterset field_type
        '''

        message_data = {}
        message_data["status"] = await take_update_parameter_set_field_type(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

    async def remove_parameterset_field_type(self, event):
        '''
        remove a parameterset field_type
        '''

        message_data = {}
        message_data["status"] = await take_remove_parameterset_field_type(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)
    
    async def add_parameterset_field_type(self, event):
        '''
        add a parameterset field_type
        '''

        message_data = {}
        message_data["status"] = await take_add_parameterset_field_type(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

@sync_to_async
def take_update_parameter_set_field_type(data):
    '''
    update parameterset field_type
    '''   
    logger = logging.getLogger(__name__) 
    logger.info(f"Update parameterset field_type: {data}")

    session_id = data["session_id"]
    parameterset_field_type_id = data["parameterset_field_type_id"]
    form_data = data["form_data"]

    try:        
        parameter_set_field_type = ParameterSetFieldType.objects.get(id=parameterset_field_type_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_update_parameter_set_field_type, not found ID: {parameterset_field_type_id}")
        return
    
    form_data_dict = form_data

    logger.info(f'form_data_dict : {form_data_dict}')

    form = ParameterSetFieldTypeForm(form_data_dict, instance=parameter_set_field_type)

    if form.is_valid():         
        form.save()              
        parameter_set_field_type.parameter_set.update_json_fk(update_field_types=True)

        return {"value" : "success"}                      
                                
    logger.info("Invalid parameterset field_type form")
    return {"value" : "fail", "errors" : dict(form.errors.items())}

@sync_to_async
def take_remove_parameterset_field_type(data):
    '''
    remove the specifed parmeterset field_type
    '''
    logger = logging.getLogger(__name__) 
    logger.info(f"Remove parameterset field_type: {data}")

    session_id = data["session_id"]
    parameterset_field_type_id = data["parameterset_field_type_id"]

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_field_type = ParameterSetFieldType.objects.get(id=parameterset_field_type_id)
        
    except ObjectDoesNotExist:
        logger.warning(f"take_remove_parameterset_field_type, not found ID: {parameterset_field_type_id}")
        return
    
    parameter_set_field_type.delete()
    session.parameter_set.update_json_fk(update_field_types=True)
    
    return {"value" : "success"}

@sync_to_async
def take_add_parameterset_field_type(data):
    '''
    add a new parameter field_type to the parameter set
    '''
    logger = logging.getLogger(__name__) 
    logger.info(f"Add parameterset field_type: {data}")

    session_id = data["session_id"]

    try:        
        session = Session.objects.get(id=session_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_add_parameterset_field_type session, not found ID: {session_id}")
        return {"value" : "fail"}

    parameter_set_field_type = ParameterSetFieldType.objects.create(parameter_set=session.parameter_set)
    session.parameter_set.update_json_fk(update_field_types=True)

    return {"value" : "success"}
    
