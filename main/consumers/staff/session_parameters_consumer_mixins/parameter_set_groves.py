import logging

from asgiref.sync import sync_to_async

from django.core.exceptions import ObjectDoesNotExist

from main.models import Session
from main.models import ParameterSetGrove

from main.forms import ParameterSetGroveForm

from ..session_parameters_consumer_mixins.get_parameter_set import take_get_parameter_set

class ParameterSetGrovesMixin():
    '''
    parameter set plaeyer mixin
    '''

    async def update_parameter_set_grove(self, event):
        '''
        update a parameterset grove
        '''

        message_data = {}
        message_data["status"] = await take_update_parameter_set_grove(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

    async def remove_parameterset_grove(self, event):
        '''
        remove a parameterset grove
        '''

        message_data = {}
        message_data["status"] = await take_remove_parameterset_grove(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)
    
    async def add_parameterset_grove(self, event):
        '''
        add a parameterset grove
        '''

        message_data = {}
        message_data["status"] = await take_add_parameterset_grove(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

@sync_to_async
def take_update_parameter_set_grove(data):
    '''
    update parameterset grove
    '''   
    logger = logging.getLogger(__name__) 
    logger.info(f"Update parameterset grove: {data}")

    session_id = data["session_id"]
    parameterset_grove_id = data["parameterset_grove_id"]
    form_data = data["form_data"]

    try:        
        parameter_set_grove = ParameterSetGrove.objects.get(id=parameterset_grove_id)       
    except ObjectDoesNotExist:
        logger.warning(f"take_update_parameter_set_grove parameterset_grove, not found ID: {parameterset_grove_id}")
        return
    
    try:
        levels_input = form_data.get("levels_input").split(",")

        while("" in levels_input):
            levels_input.remove("")

    except ObjectDoesNotExist:
        logger.warning(f"take_update_parameter_set_grove levels_input, not found ID: {parameterset_grove_id}")
        {"value":"fail", "errors" : {f"levels_input":["Invalid input."]}} 
    
    if len(levels_input) == 0:
        logger.warning(f"take_update_parameter_set_grove levels_input, not found ID: {parameterset_grove_id}")
        return {"value":"fail", "errors" : {f"levels_input":["Invalid input."]}} 
        
    form_data_dict = form_data    

    logger.info(f'form_data_dict : {form_data_dict}')

    form = ParameterSetGroveForm(form_data_dict, instance=parameter_set_grove)

    if form.is_valid():         
        form.save()           

        parameter_set_grove.levels = {}   

        for i in range(len(levels_input)):
            v = levels_input[i].strip()
            if v.isdigit():
                parameter_set_grove.levels[str(i+1)] = {"value" : int(v), "harvested" : False}

        parameter_set_grove.save()

        parameter_set_grove.parameter_set.update_json_fk(update_groves=True)

        return {"value" : "success"}                      
                                
    logger.info("Invalid parameterset grove form")
    return {"value" : "fail", "errors" : dict(form.errors.items())}

@sync_to_async
def take_remove_parameterset_grove(data):
    '''
    remove the specifed parmeterset grove
    '''
    logger = logging.getLogger(__name__) 
    logger.info(f"Remove parameterset grove: {data}")

    session_id = data["session_id"]
    parameterset_grove_id = data["parameterset_grove_id"]

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_grove = ParameterSetGrove.objects.get(id=parameterset_grove_id)
        
    except ObjectDoesNotExist:
        logger.warning(f"take_remove_parameterset_grove, not found ID: {parameterset_grove_id}")
        return
    
    parameter_set_grove.delete()
    session.parameter_set.update_json_fk(update_groves=True)
    
    return {"value" : "success"}

@sync_to_async
def take_add_parameterset_grove(data):
    '''
    add a new parameter grove to the parameter set
    '''
    logger = logging.getLogger(__name__) 
    logger.info(f"Add parameterset grove: {data}")

    session_id = data["session_id"]

    try:        
        session = Session.objects.get(id=session_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_add_parameterset_grove session, not found ID: {session_id}")
        return {"value" : "fail"}

    parameter_set_grove = ParameterSetGrove.objects.create(parameter_set=session.parameter_set)
    parameter_set_grove.setup()
    parameter_set_grove.from_dict(ParameterSetGrove.objects.last().json())
    session.parameter_set.update_json_fk(update_groves=True)

    return {"value" : "success"}
    
