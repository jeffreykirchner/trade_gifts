
{% load static %}

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

//global variables
//var world_state = {};
var subject_status_overlay_container = null;
var pixi_app = null;                           //pixi app   
var pixi_container_main = null;                //main container for pixi
var pixi_target = null;                        //target sprite for your avatar
var pixi_text_emitter = {};                    //text emitter json
var pixi_text_emitter_key = 0;
var pixi_transfer_beams = {};                  //transfer beam json
var pixi_transfer_beams_key = 0;
var pixi_fps_label = null;                     //fps label
var mini_map = {container:null};               //mini map container
var pixi_avatars = {};                         //avatars
var pixi_walls = {};                           //walls
var pixi_grounds = {};                         //grounds
var pixi_fields = {};                          //fields
var pixi_houses = {};                          //houses

//prevent right click
document.addEventListener('contextmenu', event => event.preventDefault());

//vue app
var app = Vue.createApp({
    delimiters: ["[[", "]]"],

    data() {return {chat_socket : "",
                    reconnecting : true,
                    is_subject : true,
                    working : false,
                    reconnection_count : 0,
                    first_load_done : false,                       //true after software is loaded for the first time
                    player_key : "{{session_player.player_key}}",
                    field_color : 'BlanchedAlmond',
                    session_player : null, 
                    session : null,

                    form_ids: {{form_ids|safe}},

                    chat_text : "",
                    chat_button_label : "Chat",

                    selected_field : {field:null, 
                                      field_type:null,
                                      good_one_harvest:0,
                                      good_two_harvest:0,
                                      effort_slider:0,
                                      good_one_production_effort:0,
                                      good_two_production_effort:0},

                    selected_avatar : {avatar:null,
                                       parameter_set_player:null,
                                       good_one_move:0,
                                       good_two_move:0,
                                       good_three_move:0,
                                       good_one:null,
                                       good_two:null,
                                       good_three:null,
                                       },
                    
                    selected_house : {avatar:null,
                                      parameter_set_player:null,
                                      good_one_move:0,
                                      good_two_move:0,
                                      good_three_move:0,
                                      good_one:null,
                                      good_two:null,
                                      good_three:null,
                                     },

                    end_game_modal_visible : false,

                    instruction_pages : {{instruction_pages|safe}},
                    instruction_pages_show_scroll : false,

                    // modals
                    end_game_modal : null,
                    avatar_modal : null,
                    field_modal : null,
                    house_modal : null,
                    test_mode : {%if session.parameter_set.test_mode%}true{%else%}false{%endif%},

                    //pixi
                    canvas_width  : null,
                    canvas_height : null,
                    move_speed : 4,
                    animation_speed : 0.5,
                    scroll_speed : 10,
                    pixi_mode : "subject",
                    pixi_scale : 1,
                    stage_width : 10000,
                    stage_height : 10000,
                    scroll_direction : {x:0, y:0},
                    draw_bounding_boxes: false,

                    //forms
                    interaction_form : {direction:null, amount:null},

                    //test mode
                    test_mode_location_target : null,
                }},
    methods: {

        /** fire when websocket connects to server
        */
        handle_socket_connected(){            
            app.send_get_session();
        },

        /** fire trys to connect to server
         * return true if re-connect should be allowed else false
        */
        handle_socket_connection_try(){            
            if(!app.session) return true;

            app.reconnection_count+=1;

            if(app.reconnection_count > app.session.parameter_set.reconnection_limit)
            {
                app.reconnection_failed = true;
                app.check_in_error_message = "Refresh your browser."
                return false;
            }

            return true;
        },

        /** take websocket message from server
        *    @param data {json} incoming data from server, contains message and message type
        */
        take_message(data) {

            {%if DEBUG%}
            console.log(data);
            {%endif%}

            let message_type = data.message.message_type;
            let message_data = data.message.message_data;

            switch(message_type) {                
                case "get_session":
                    app.take_get_session(message_data);
                    break; 
                case "update_start_experiment":
                    app.take_update_start_experiment(message_data);
                    break;
                case "update_reset_experiment":
                    app.take_update_reset_experiment(message_data);
                    break;
                case "chat":
                    app.take_chat(message_data);
                    break;
                case "update_chat":
                    app.take_update_chat(message_data);
                    break;
                case "update_time":
                    app.take_update_time(message_data);
                    break;
                case "name":
                    app.take_name(message_data);
                    break;
                case "update_next_phase":
                    app.take_update_next_phase(message_data);
                    break;
                case "next_instruction":
                    app.take_next_instruction(message_data);
                    break;
                case "finish_instructions":
                    app.take_finish_instructions(message_data);
                    break;
                case "update_refresh_screens":
                    app.take_refresh_screens(message_data);
                    break;
                case "update_target_location_update":
                    app.take_target_location_update(message_data);
                    break;
                case "update_collect_token":
                    app.take_update_collect_token(message_data);
                    break;
                case "update_tractor_beam":
                    app.take_update_tractor_beam(message_data);
                    break;
                case "update_interaction":
                    app.take_update_interaction(message_data);
                    break;
                case "update_cancel_interaction":
                    app.take_update_cancel_interaction(message_data);
                    break;
                case "update_field_harvest":
                    app.take_field_harvest(message_data);
                    break;
                case "update_field_effort":
                    app.take_field_effort(message_data);
                    break;
                case "update_move_fruit_to_avatar":
                    app.take_update_move_fruit_to_avatar(message_data);
                    break;
                
            }

            app.first_load_done = true;

            app.working = false;
        },

        /** send websocket message to server
        *    @param message_type {string} type of message sent to server
        *    @param message_text {json} body of message being sent to server
        */
        send_message(message_type, message_text, message_target="self")
        {          
            app.chat_socket.send(JSON.stringify({
                    'message_type': message_type,
                    'message_text': message_text,
                    'message_target': message_target,
                }));
        },

        /**
         * do after session has loaded
        */
        do_first_load()
        {           
            app.end_game_modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('end_game_modal'), {keyboard: false})   
            app.avatar_modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('avatar_modal'), {keyboard: false})          
            app.field_modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('field_modal'), {keyboard: false})
            app.house_modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('house_modal'), {keyboard: false})

            document.getElementById('end_game_modal').addEventListener('hidden.bs.modal', app.hide_end_game_modal);
            document.getElementById('avatar_modal').addEventListener('hidden.bs.modal', app.hide_avatar_modal);

            {%if session.parameter_set.test_mode%} setTimeout(app.do_test_mode, app.random_number(1000 , 1500)); {%endif%}

            // if game is finished show modal
            if( app.session.world_state.current_experiment_phase == 'Names')
            {
                app.show_end_game_modal();
            }
            else if(app.session.world_state.current_experiment_phase == 'Done' && 
                    app.session.parameter_set.survey_required=='True' && 
                    !app.session_player.survey_complete)
            {
                window.location.replace(app.session_player.survey_link);
            }

            if(document.getElementById('instructions_frame_a'))
            {
                document.getElementById('instructions_frame_a').addEventListener('scroll',
                    function()
                    {
                        app.scroll_update();
                    },
                    false
                )

                app.scroll_update();
            }

            app.setup_pixi();

        },

        /**
         * after reconnection, load again
         */
        do_reload()
        {
            app.setup_pixi_subjects();
            app.setup_pixi_minimap();
            app.update_subject_status_overlay();
            app.update_field_inventory();
            app.update_avatar_inventory();
        },

        /** send winsock request to get session info
        */
        send_get_session(){
            app.send_message("get_session", {"player_key" : app.player_key});
        },
        
        /** take create new session
        *    @param message_data {json} session day in json format
        */
        take_get_session(message_data){
            app.destory_setup_pixi_subjects();
            
            app.session = message_data.session;
            app.session_player = message_data.session_player;

            if(app.session.started)
            {
               
            }
            else
            {
                
            }            
            
            if(app.session.world_state.current_experiment_phase != 'Done')
            {
                                
            }

            if(app.session.world_state.current_experiment_phase == 'Instructions')
            {
                Vue.nextTick(() => {
                    app.process_instruction_page();
                    app.instruction_display_scroll();
                });
            }

            if(!app.first_load_done)
            {
                Vue.nextTick(() => {
                    app.do_first_load();
                });
            }
            else
            {
                Vue.nextTick(() => {
                    app.do_reload();
                });
            }
        },

        /** update start status
        *    @param message_data {json} session day in json format
        */
        take_update_start_experiment(message_data){
            app.take_get_session(message_data);
        },

        /** update reset status
        *    @param message_data {json} session day in json format
        */
        take_update_reset_experiment(message_data){
            app.take_get_session(message_data);

            app.end_game_modal.hide();            
        },

        /**
        * update time and start status
        */
        take_update_time(message_data){
          
            let status = message_data.value;

            if(status == "fail") return;

            let period_change = false;
            let period_earnings = 0;

            
            if (app.session_player.id in message_data)
            {
                period_earnings = message_data.earnings[app.session_player.id].period_earnings;
                // app.session.world_state_avatars.session_players[app.session_player.id].earnings = message_data.earnings[app.session_player.id].total_earnings;
            }

            app.session.started = message_data.started;

            app.session.world_state.current_period = message_data.current_period;
            app.session.world_state.time_remaining = message_data.time_remaining;
            app.session.world_state.timer_running = message_data.timer_running;
            app.session.world_state.started = message_data.started;
            app.session.world_state.finished = message_data.finished;
            app.session.world_state.current_experiment_phase = message_data.current_experiment_phase;

            if(message_data.period_is_over)
            {
                app.session.world_state.avatars = message_data.avatars;                

                //update fields.
                for(let i in message_data.fields)
                {
                    field = app.session.world_state.fields[i]
                    field_type = app.session.parameter_set.parameter_set_field_types[field.parameter_set_field_type]
            
                    good_one = field_type.good_one;
                    good_two = field_type.good_two;
            
                    app.session.world_state.fields[i][good_one] = message_data.fields[i][good_one];
                    app.session.world_state.fields[i][good_two] = message_data.fields[i][good_two];
                }

                app.update_avatar_inventory();
                app.update_field_inventory();
            }

            // app.session.world_state.finished = message_data.finished;
        
            //collect names
            if(app.session.world_state.current_experiment_phase == 'Names')
            {
                app.show_end_game_modal();
            }            

            Vue.nextTick(() => {
                app.update_subject_status_overlay();
            });


            //period has changed display earnings
            // if(message_data.time_remaining == 1)
            // {
            //     Vue.nextTick(() => {
            //         let current_location = app.session.world_state_avatars.session_players[app.session_player.id].current_location;

            //         app.add_text_emitters("+" + period_earnings + "¢", 
            //                 current_location.x, 
            //                 current_location.y,
            //                 current_location.x,
            //                 current_location.y-100,
            //                 0xFFFFFF,
            //                 28,
            //                 null)                    
            //     });               
            // }

            // if(period_change)
            // {
            //     app.setup_pixi_minimap();
            // }

            //update player states
            for(p in message_data.session_player_status)
            {
                session_player = message_data.session_player_status[p];
                app.session.world_state_avatars.session_players[p].interaction = session_player.interaction;
                app.session.world_state_avatars.session_players[p].frozen = session_player.frozen;
                app.session.world_state_avatars.session_players[p].cool_down = session_player.cool_down;
                app.session.world_state_avatars.session_players[p].tractor_beam_target = session_player.tractor_beam_target;
            }

            //update player location
            for(p in message_data.current_locations)
            {
                if(p != app.session_player.id)
                {
                    let server_location = message_data.current_locations[p];

                    if(app.get_distance(server_location, app.session.world_state_avatars.session_players[p].current_location) > 1000)
                    {
                        app.session.world_state_avatars.session_players[p].current_location = server_location;
                    }
                }
            }

            //hide interaction modal if interaction is over
            // if(app.session.world_state_avatars.session_players[app.session_player.id].interaction == 0)
            // {
            //     app.avatar_modal.hide();
            //     app.field_modal.hide();
            // }
        },

        /**
         * show the end game modal
         */
        show_end_game_modal(){
            if(app.end_game_modal_visible) return;
   
            app.end_game_modal.toggle();

            app.end_game_modal_visible = true;
        },

        /** take refresh screen
         * @param messageData {json} result of update, either sucess or fail with errors
        */
        take_refresh_screens(message_data){
            if(message_data.value == "success")
            {           
                app.session = message_data.session;
                app.session_player = message_data.session_player;
            } 
            else
            {
            
            }
        },

      
        /** take next period response
         * @param message_data {json}
        */
        take_update_next_phase(message_data){
            app.end_game_modal.hide();

            app.session.world_state.current_experiment_phase = message_data.current_experiment_phase;
            app.session.world_state.finished = message_data.finished;

            if(app.session.world_state.current_experiment_phase == 'Names')
            {
                app.show_end_game_modal();
            }
            else
            {
                app.hide_end_game_modal();
            }
            
            if(app.session.world_state.current_experiment_phase == 'Done' && 
                    app.session.parameter_set.survey_required=='True' && 
                    !app.session_player.survey_complete)
            {
                window.location.replace(app.session_player.survey_link);
            }
        },

        /** hide choice grid modal modal
        */
        hide_end_game_modal(){
            app.end_game_modal_visible=false;
        },

        //do nothing on when enter pressed for post
        onSubmit(){
            //do nothing
        },
        
        {%include "subject/subject_home/chat/chat_card.js"%}
        {%include "subject/subject_home/summary/summary_card.js"%}
        {%include "subject/subject_home/test_mode/test_mode.js"%}
        {%include "subject/subject_home/instructions/instructions_card.js"%}
        {%include "subject/subject_home/the_stage/pixi_setup.js"%}
        {%include "subject/subject_home/the_stage/interface.js"%}
        {%include "subject/subject_home/the_stage/wall.js"%}
        {%include "subject/subject_home/the_stage/ground.js"%}
        {%include "subject/subject_home/the_stage/fields.js"%}
        {%include "subject/subject_home/the_stage/houses.js"%}
        {%include "subject/subject_home/the_stage/mini_map.js"%}
        {%include "subject/subject_home/the_stage/transfer_beam.js"%}
        {%include "subject/subject_home/the_stage/text_emitters.js"%}
        {%include "subject/subject_home/the_stage/avatars.js"%}
        {%include "subject/subject_home/the_stage/helpers.js"%}
        {%include "subject/subject_home/the_stage/subject.js"%}
    
        /** clear form error messages
        */
        clear_main_form_errors(){
            
            let s = app.form_ids;
            for(let i in s)
            {
                let e = document.getElementById("id_errors_" + s[i]);
                if(e) e.remove();
            }

            e = document.getElementById("id_errors_good_one_harvest");
            if(e) e.remove();
            e = document.getElementById("id_errors_good_two_harvest");
            if(e) e.remove();

            e = document.getElementById("id_errors_good_one_move");
            if(e) e.remove();
            e = document.getElementById("id_errors_good_two_move");
            if(e) e.remove();
            e = document.getElementById("id_errors_good_three_move");
            if(e) e.remove();
        },

        /** display form error messages
        */
        display_errors(errors){
            for(let e in errors)
                {
                    //e = document.getElementById("id_" + e).getAttribute("class", "form-control is-invalid")
                    let str='<span id=id_errors_'+ e +' class="text-danger">';
                    
                    for(let i in errors[e])
                    {
                        str +=errors[e][i] + '<br>';
                    }

                    str+='</span>';

                    document.getElementById("div_id_" + e).insertAdjacentHTML('beforeend', str);
                    document.getElementById("div_id_" + e).scrollIntoView(); 
                }
        }, 

        /**
         * return session player index that has specified id
         */
        find_session_player_index(id){

            let session_players = app.session.session_players;
            for(let i=0; i<session_players.length; i++)
            {
                if(session_players[i].id == id)
                {
                    return i;
                }
            }

            return null;
        },

        /**
         * handle window resize event
         */
        handleResize(){
            app.update_subject_status_overlay();
        },

    },

    mounted(){
        window.addEventListener('resize', this.handleResize);
    },

}).mount('#app');

{%include "js/web_sockets.js"%}

  