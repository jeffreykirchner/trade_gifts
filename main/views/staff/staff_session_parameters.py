'''
staff view
'''
import logging
import json
import uuid

from django.views import View
from django.shortcuts import render
from django.views.generic.detail import SingleObjectMixin
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.core.serializers.json import DjangoJSONEncoder

from main.decorators import user_is_owner

from main.models import Session

from main.forms import ImportParametersForm
from main.forms import ParameterSetForm
from main.forms import ParameterSetPlayerForm
from main.forms import ParameterSetWallForm
from main.forms import ParameterSetGroundForm
from main.forms import ParameterSetFieldTypeForm
from main.forms import ParameterSetFieldForm
from main.forms import ParameterSetGroupForm
from main.forms import ParameterSetNoticeForm
from main.forms import ParameterSetBarrierForm
from main.forms import ParameterSetPatchForm
from main.forms import ParameterSetHatForm

class StaffSessionParametersView(SingleObjectMixin, View):
    '''
    class based staff view
    '''
    template_name = "staff/staff_session_parameters.html"
    websocket_path = "staff-session-parameters"
    model = Session
    
    @method_decorator(user_is_owner)
    @method_decorator(login_required)
    def get(self, request, *args, **kwargs):
        '''
        handle get requests
        '''
        session = self.get_object()

        parameter_set_form = ParameterSetForm()
        parameter_set_player_form = ParameterSetPlayerForm()
        parameter_set_wall_form = ParameterSetWallForm()
        parameter_set_ground_form = ParameterSetGroundForm()
        parameter_set_field_type_form = ParameterSetFieldTypeForm()
        parameter_set_field_form = ParameterSetFieldForm()
        parameter_set_group_form = ParameterSetGroupForm()
        parameter_set_notice_form = ParameterSetNoticeForm()
        parameter_set_barrier_form = ParameterSetBarrierForm()
        parameter_set_patch_form = ParameterSetPatchForm()
        parameter_set_hat_form = ParameterSetHatForm()

        parameter_set_field_form.fields["parameter_set_player"].queryset = session.parameter_set.parameter_set_players.all()
        parameter_set_field_form.fields["parameter_set_field_type"].queryset = session.parameter_set.parameter_set_field_types.all()
        parameter_set_player_form.fields["parameter_set_group"].queryset = session.parameter_set.parameter_set_groups.all()
        parameter_set_player_form.fields["parameter_set_hat"].queryset = session.parameter_set.parameter_set_hats.all()
        parameter_set_barrier_form.fields["parameter_set_groups"].queryset = session.parameter_set.parameter_set_groups.all()
        parameter_set_barrier_form.fields["parameter_set_players"].queryset = session.parameter_set.parameter_set_players.all()
        parameter_set_patch_form.fields["parameter_set_group"].queryset = session.parameter_set.parameter_set_groups.all()
        parameter_set_ground_form.fields["parameter_set_group"].queryset = session.parameter_set.parameter_set_groups.all()
        parameter_set_group_form.fields["parameter_set_hat"].queryset = session.parameter_set.parameter_set_hats.all()
        parameter_set_notice_form.fields["help_doc"].queryset = session.parameter_set.instruction_set.help_docs_subject.all()

        parameter_set_form_ids=[]
        for i in parameter_set_form:
            parameter_set_form_ids.append(i.html_name)

        parameter_set_player_form_ids=[]
        for i in parameter_set_player_form:
            parameter_set_player_form_ids.append(i.html_name)

        parameter_set_wall_form_ids=[]
        for i in parameter_set_wall_form:
            parameter_set_wall_form_ids.append(i.html_name)

        parameter_set_ground_form_ids=[]
        for i in parameter_set_ground_form:
            parameter_set_ground_form_ids.append(i.html_name)

        parameter_set_field_type_form_ids=[]
        for i in parameter_set_field_type_form:
            parameter_set_field_type_form_ids.append(i.html_name)

        parameter_set_field_form_ids=[]
        for i in parameter_set_field_form:
            parameter_set_field_form_ids.append(i.html_name)

        parameter_set_group_form_ids=[]
        for i in parameter_set_group_form:
            parameter_set_group_form_ids.append(i.html_name)

        parameter_set_notice_form_ids=[]
        for i in parameter_set_notice_form:
            parameter_set_notice_form_ids.append(i.html_name)

        parameter_set_barrier_form_ids=[]
        for i in parameter_set_barrier_form:
            parameter_set_barrier_form_ids.append(i.html_name)

        parameter_set_patch_form_ids=[]
        for i in parameter_set_patch_form:
            parameter_set_patch_form_ids.append(i.html_name)

        parameter_set_hat_form_ids=[]
        for i in parameter_set_hat_form:
            parameter_set_hat_form_ids.append(i.html_name)
            
        return render(request=request,
                      template_name=self.template_name,
                      context={"channel_key" : uuid.uuid4(),
                               "player_key" :  uuid.uuid4(),
                               "id" : session.id,
                               "parameter_set_form" : parameter_set_form,
                               "parameter_set_player_form" : parameter_set_player_form,
                               "parameter_set_wall_form" : parameter_set_wall_form,
                               "parameter_set_ground_form" : parameter_set_ground_form,
                               "parameter_set_field_type_form" : parameter_set_field_type_form, 
                               "parameter_set_field_form" : parameter_set_field_form,
                               "parameter_set_group_form" : parameter_set_group_form,
                               "parameter_set_notice_form" : parameter_set_notice_form,
                               "parameter_set_barrier_form" : parameter_set_barrier_form,
                               "parameter_set_patch_form" : parameter_set_patch_form,
                               "parameter_set_hat_form" : parameter_set_hat_form,
                               "parameter_set_form_ids" : parameter_set_form_ids,
                               "parameter_set_player_form_ids" : parameter_set_player_form_ids,
                               "parameter_set_wall_form_ids" : parameter_set_wall_form_ids,
                               "parameter_set_ground_form_ids" : parameter_set_ground_form_ids,
                               "parameter_set_field_type_form_ids" : parameter_set_field_type_form_ids,
                               "parameter_set_field_form_ids" : parameter_set_field_form_ids,
                               "parameter_set_group_form_ids" : parameter_set_group_form_ids,
                               "parameter_set_notice_form_ids" : parameter_set_notice_form_ids,
                               "parameter_set_barrier_form_ids" : parameter_set_barrier_form_ids,
                               "parameter_set_patch_form_ids" : parameter_set_patch_form_ids,
                               "parameter_set_hat_form_ids" : parameter_set_hat_form_ids,
                               "import_parameters_form" : ImportParametersForm(user=request.user, session_id=session.id),     
                               "websocket_path" : self.websocket_path,
                               "page_key" : f'{self.websocket_path}-{session.id}',
                               "number_of_player_types" : range(4),
                               "session_json" : json.dumps(session.json_for_parameter_set(), cls=DjangoJSONEncoder),
                               "parameter_set_json" : json.dumps(session.parameter_set.json(), cls=DjangoJSONEncoder),
                               "session" : session,
                               })
    
    @method_decorator(login_required)
    def post(self, request, *args, **kwargs):
        '''
        handle post requests
        '''

        logger = logging.getLogger(__name__) 
        session = self.get_object()

        #check for file upload
        try:
            f = request.FILES['file']
        except Exception  as e: 
            logger.info(f'Staff_Session no file upload: {e}')
            f = -1
        
         #check for file upload
        if f != -1:
            return takeFileUpload(f, session)
        else:
            data = json.loads(request.body.decode('utf-8'))
        

        return JsonResponse({"response" :  "fail"},safe=False)

#take parameter file upload
def takeFileUpload(f, session):
    logger = logging.getLogger(__name__) 
    logger.info("Upload file")

    #format incoming data
    v=""

    for chunk in f.chunks():
        v += str(chunk.decode("utf-8-sig"))

    message = ""

    try:
        if v[0]=="{":
            return upload_parameter_set(v, session)
        else:
            message = "Invalid file format."
    except Exception as e:
        message = f"Failed to load file: {e}"
        logger.info(message)       

    return JsonResponse({"session" : session.json(),
                         "message" : message,
                                },safe=False)

#take parameter set to upload
def upload_parameter_set(v, session):
    logger = logging.getLogger(__name__) 
    logger.info("Upload parameter set")
    

    ps = session.parameter_set

    logger.info(v)
    v = eval(v.replace("null", "None").replace("false", "False"))
    #logger.info(v)       

    message = ps.from_dict(v)

    session.update_player_count()
    session.setup_world_state()

    return JsonResponse({"session" : session.json(),
                         "message" : message,
                                },safe=False)
