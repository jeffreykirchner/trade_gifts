import logging

from asgiref.sync import sync_to_async

from django.core.exceptions import ObjectDoesNotExist

from main.models import Session
from main.models import ParameterSetPatch

from main.forms import ParameterSetPatchForm

from ..session_parameters_consumer_mixins.get_parameter_set import take_get_parameter_set

class ParameterSetPatchesMixin():
    '''
    parameter set patches mixin
    '''

    async def update_parameter_set_patch(self, event):
        '''
        update a parameterset patch
        '''

        message_data = {}
        message_data["status"] = await take_update_parameter_set_patch(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

    async def remove_parameterset_patch(self, event):
        '''
        remove a parameterset patch
        '''

        message_data = {}
        message_data["status"] = await take_remove_parameterset_patch(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)
    
    async def add_parameterset_patch(self, event):
        '''
        add a parameterset patch
        '''

        message_data = {}
        message_data["status"] = await take_add_parameterset_patch(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

@sync_to_async
def take_update_parameter_set_patch(data):
    '''
    update parameterset patch
    '''   
    logger = logging.getLogger(__name__) 
    logger.info(f"Update parameterset patch: {data}")

    session_id = data["session_id"]
    parameterset_patch_id = data["parameterset_patch_id"]
    form_data = data["form_data"]

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_patch = ParameterSetPatch.objects.get(id=parameterset_patch_id)       
    except ObjectDoesNotExist:
        logger.warning(f"take_update_parameter_set_patch parameterset_patch, not found ID: {parameterset_patch_id}")
        return
    
    try:
        levels_input = form_data.get("levels_input").split(",")

        while("" in levels_input):
            levels_input.remove("")

    except ObjectDoesNotExist:
        logger.warning(f"take_update_parameter_set_patch levels_input, not found ID: {parameterset_patch_id}")
        {"value":"fail", "errors" : {f"levels_input":["Invalid input."]}} 
    
    if len(levels_input) == 0:
        logger.warning(f"take_update_parameter_set_patch levels_input, not found ID: {parameterset_patch_id}")
        return {"value":"fail", "errors" : {f"levels_input":["Invalid input."]}} 
        
    form_data_dict = form_data    

    logger.info(f'form_data_dict : {form_data_dict}')

    form = ParameterSetPatchForm(form_data_dict, instance=parameter_set_patch)
    form.fields["parameter_set_group"].queryset = session.parameter_set.parameter_set_groups.all()

    if form.is_valid():         
        form.save()           

        parameter_set_patch.levels = {}   

        for i in range(len(levels_input)):
            v = levels_input[i].strip()
            if v.isdigit():
                parameter_set_patch.levels[str(i+1)] = {"value" : int(v), "harvested" : False}

        parameter_set_patch.save()

        parameter_set_patch.parameter_set.update_json_fk(update_patches=True)

        return {"value" : "success"}                      
                                
    logger.info("Invalid parameterset patch form")
    return {"value" : "fail", "errors" : dict(form.errors.items())}

@sync_to_async
def take_remove_parameterset_patch(data):
    '''
    remove the specifed parmeterset patch
    '''
    logger = logging.getLogger(__name__) 
    logger.info(f"Remove parameterset patch: {data}")

    session_id = data["session_id"]
    parameterset_patch_id = data["parameterset_patch_id"]

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_patch = ParameterSetPatch.objects.get(id=parameterset_patch_id)
        
    except ObjectDoesNotExist:
        logger.warning(f"take_remove_parameterset_patch, not found ID: {parameterset_patch_id}")
        return
    
    parameter_set_patch.delete()
    session.parameter_set.update_json_fk(update_patches=True)
    
    return {"value" : "success"}

@sync_to_async
def take_add_parameterset_patch(data):
    '''
    add a new parameter patch to the parameter set
    '''
    logger = logging.getLogger(__name__) 
    logger.info(f"Add parameterset patch: {data}")

    session_id = data["session_id"]

    try:        
        session = Session.objects.get(id=session_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_add_parameterset_patch session, not found ID: {session_id}")
        return {"value" : "fail"}

    parameter_set_patch_last = ParameterSetPatch.objects.last()

    parameter_set_patch = ParameterSetPatch.objects.create(parameter_set=session.parameter_set)
    parameter_set_patch.setup()
    if parameter_set_patch_last:
        parameter_set_patch.from_dict(parameter_set_patch_last.json())
        parameter_set_patch.parameter_set_group = parameter_set_patch_last.parameter_set_group
    parameter_set_patch.save()
    session.parameter_set.update_json_fk(update_patches=True)

    return {"value" : "success"}
    
