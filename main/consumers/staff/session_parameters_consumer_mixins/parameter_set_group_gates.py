import logging

from asgiref.sync import sync_to_async

from django.core.exceptions import ObjectDoesNotExist

from main.models import Session
from main.models import ParameterSetGroupGate

from main.forms import ParameterSetGroupGateForm

from ..session_parameters_consumer_mixins.get_parameter_set import take_get_parameter_set

class ParameterSetGroupGatesMixin():
    '''
    parameter set plaeyer mixin
    '''

    async def update_parameter_set_group_gate(self, event):
        '''
        update a parameterset group_gate
        '''

        message_data = {}
        message_data["status"] = await take_update_parameter_set_group_gate(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

    async def remove_parameterset_group_gate(self, event):
        '''
        remove a parameterset group_gate
        '''

        message_data = {}
        message_data["status"] = await take_remove_parameterset_group_gate(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)
    
    async def add_parameterset_group_gate(self, event):
        '''
        add a parameterset group_gate
        '''

        message_data = {}
        message_data["status"] = await take_add_parameterset_group_gate(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

@sync_to_async
def take_update_parameter_set_group_gate(data):
    '''
    update parameterset group_gate
    '''   
    logger = logging.getLogger(__name__) 
    logger.info(f"Update parameterset group_gate: {data}")

    session_id = data["session_id"]
    parameterset_group_gate_id = data["parameterset_group_gate_id"]
    form_data = data["form_data"]

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_group_gate = ParameterSetGroupGate.objects.get(id=parameterset_group_gate_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_update_parameter_set_group_gate parameterset_group_gate, not found ID: {parameterset_group_gate_id}")
        return
    
    form_data_dict = form_data

    logger.info(f'form_data_dict : {form_data_dict}')

    form = ParameterSetGroupGateForm(form_data_dict, instance=parameter_set_group_gate)
    form.fields["parameter_set_allowed_groups"].queryset = session.parameter_set.parameter_set_groups.all()

    if form.is_valid():         
        form.save()              
        parameter_set_group_gate.parameter_set.update_json_fk(update_group_gates=True)

        return {"value" : "success"}                      
                                
    logger.info("Invalid parameterset group_gate form")
    return {"value" : "fail", "errors" : dict(form.errors.items())}

@sync_to_async
def take_remove_parameterset_group_gate(data):
    '''
    remove the specifed parmeterset group_gate
    '''
    logger = logging.getLogger(__name__) 
    logger.info(f"Remove parameterset group_gate: {data}")

    session_id = data["session_id"]
    parameterset_group_gate_id = data["parameterset_group_gate_id"]

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_group_gate = ParameterSetGroupGate.objects.get(id=parameterset_group_gate_id)
        
    except ObjectDoesNotExist:
        logger.warning(f"take_remove_parameterset_group_gate, not found ID: {parameterset_group_gate_id}")
        return
    
    parameter_set_group_gate.delete()
    session.parameter_set.update_json_fk(update_group_gates=True)
    
    return {"value" : "success"}

@sync_to_async
def take_add_parameterset_group_gate(data):
    '''
    add a new parameter group_gate to the parameter set
    '''
    logger = logging.getLogger(__name__) 
    logger.info(f"Add parameterset group_gate: {data}")

    session_id = data["session_id"]

    try:        
        session = Session.objects.get(id=session_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_add_parameterset_group_gate session, not found ID: {session_id}")
        return {"value" : "fail"}

    parameter_set_group_gate = ParameterSetGroupGate.objects.create(parameter_set=session.parameter_set)
    session.parameter_set.update_json_fk(update_group_gates=True)

    return {"value" : "success"}
    
