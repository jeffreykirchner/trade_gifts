import logging

from asgiref.sync import sync_to_async

from django.core.exceptions import ObjectDoesNotExist

from main.models import Session
from main.models import ParameterSetField

from main.forms import ParameterSetFieldForm

from ..session_parameters_consumer_mixins.get_parameter_set import take_get_parameter_set

class ParameterSetFieldsMixin():
    '''
    parameter set group mixin
    '''

    async def update_parameter_set_field(self, event):
        '''
        update a parameterset field
        '''

        message_data = {}
        message_data["status"] = await take_update_parameter_set_field(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

    async def remove_parameterset_field(self, event):
        '''
        remove a parameterset field
        '''

        message_data = {}
        message_data["status"] = await take_remove_parameterset_field(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)
    
    async def add_parameterset_field(self, event):
        '''
        add a parameterset field
        '''

        message_data = {}
        message_data["status"] = await take_add_parameterset_field(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

@sync_to_async
def take_update_parameter_set_field(data):
    '''
    update parameterset field
    '''   
    logger = logging.getLogger(__name__) 
    logger.info(f"Update parameterset field: {data}")

    session_id = data["session_id"]
    parameterset_field_id = data["parameterset_field_id"]
    form_data = data["form_data"]

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_field = ParameterSetField.objects.get(id=parameterset_field_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_update_parameter_set_field, not found ID: {parameterset_field_id}")
        return
    
    form_data_dict = form_data

    logger.info(f'form_data_dict : {form_data_dict}')

    form = ParameterSetFieldForm(form_data_dict, instance=parameter_set_field)
    form.fields["parameter_set_player"].queryset = session.parameter_set.parameter_set_players.all()
    form.fields["parameter_set_field_type"].queryset = session.parameter_set.parameter_set_field_types.all()

    if form.is_valid():         
        form.save()              
        parameter_set_field.parameter_set.update_json_fk(update_fields=True)

        return {"value" : "success"}                      
                                
    logger.info("Invalid parameterset field form")
    return {"value" : "fail", "errors" : dict(form.errors.items())}

@sync_to_async
def take_remove_parameterset_field(data):
    '''
    remove the specifed parmeterset field
    '''
    logger = logging.getLogger(__name__) 
    logger.info(f"Remove parameterset field: {data}")

    session_id = data["session_id"]
    parameterset_field_id = data["parameterset_field_id"]

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_field = ParameterSetField.objects.get(id=parameterset_field_id)
        
    except ObjectDoesNotExist:
        logger.warning(f"take_remove_parameterset_field, not found ID: {parameterset_field_id}")
        return
    
    parameter_set_field.delete()
    session.parameter_set.update_json_fk(update_fields=True)
    
    return {"value" : "success"}

@sync_to_async
def take_add_parameterset_field(data):
    '''
    add a new parameter field to the parameter set
    '''
    logger = logging.getLogger(__name__) 
    logger.info(f"Add parameterset field: {data}")

    session_id = data["session_id"]

    try:        
        session = Session.objects.get(id=session_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_add_parameterset_field session, not found ID: {session_id}")
        return {"value" : "fail"}

    parameter_set_field = ParameterSetField.objects.create(parameter_set=session.parameter_set)
    session.parameter_set.update_json_fk(update_fields=True)

    return {"value" : "success"}
    
