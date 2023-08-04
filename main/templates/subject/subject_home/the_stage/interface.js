/**
 * send movement update to server
 */
target_location_update()
{

    let session_player = app.session.world_state_avatars.session_players[app.session_player.id];

    app.send_message("target_location_update", 
                    {"target_location" : session_player.target_location, 
                     "current_location" : session_player.current_location},
                     "group");                   
},

/**
 * take update from server about new location target for a player
 */
take_target_location_update(message_data)
{
    if(message_data.value == "success")
    {
        app.session.world_state_avatars.session_players[message_data.session_player_id].target_location = message_data.target_location;                 
    } 
    else
    {
        
    }
},


/**
 *pointer up on subject screen
 */
 subject_pointer_up(event)
 {
     if(!app.session.world_state.hasOwnProperty('started')) return;
     let local_pos = event.data.getLocalPosition(event.currentTarget);
     let local_player = app.session.world_state_avatars.session_players[app.session_player.id];
 
     if(event.button == 0)
     {
 
         if(local_player.frozen)
         {
             app.add_text_emitters("No movement while interacting.", 
                             local_player.current_location.x, 
                             local_player.current_location.y,
                             local_player.current_location.x,
                             local_player.current_location.y-100,
                             0xFFFFFF,
                             28,
                             null);
             return;
         }
         
         local_player.target_location.x = local_pos.x;
         local_player.target_location.y = local_pos.y;
 
         app.target_location_update();
     }
     else if(event.button == 2)
     {
        if(local_player.frozen)
        {
            app.add_text_emitters("No actions while interacting.", 
                            local_player.current_location.x, 
                            local_player.current_location.y,
                            local_player.current_location.x,
                            local_player.current_location.y-100,
                            0xFFFFFF,
                            28,
                            null);
            return;
        }
 
        if(local_player.cool_down > 0)
        {
            app.add_text_emitters("No actions cooling down.", 
                            local_player.current_location.x, 
                            local_player.current_location.y,
                            local_player.current_location.x,
                            local_player.current_location.y-100,
                            0xFFFFFF,
                            28,
                            null);
            return;
        }
         
        //check if click on another player
        for(i in app.session.world_state_avatars.session_players)
        {
            if(i != app.session_player.id)
            {
                // let obj = app.session.world_state_avatars.session_players[i];
                let obj = pixi_avatars[i].avatar_container;
                let rect={x:obj.x-obj.width/2, y:obj.y-obj.height/2, width:obj.width, height:obj.height};
                let pt={x:local_pos.x, y:local_pos.y};

                if(app.check_point_in_rectagle(pt, rect))
                {
                    if(app.check_for_circle_rect_intersection({x:local_player.current_location.x, 
                                                            y:local_player.current_location.y, 
                                                            radius:app.session.parameter_set.interaction_range},
                                            rect))
                    {
                        app.subject_avatar_click(i);
                        break;
                    }
                }
            }
            

            // if(app.get_distance(obj.current_location, local_pos) < 100 &&
            // app.get_distance(obj.current_location, local_player.current_location) <= app.session.parameter_set.interaction_range+125)
            // {
            //     app.subject_avatar_click(i);              
            //     break;
            // }
        }

        //check if click on a field
        for(i in app.session.world_state.fields)
        {
            let obj = pixi_fields[i].field_container;
            let rect={x:obj.x-obj.width/2, y:obj.y-obj.height/2, width:obj.width, height:obj.height};
            let pt={x:local_pos.x, y:local_pos.y};

            
            if(app.check_point_in_rectagle(pt, rect))
            {
                //check subject close enough for interaction
                if(app.check_for_circle_rect_intersection({x:local_player.current_location.x, 
                                                           y:local_player.current_location.y, 
                                                           radius:app.session.parameter_set.interaction_range},
                                                      rect))
                {
                    app.subject_field_click(i);              
                    break;
                }
            }

        }

    }
 },

/**
 * result of subject activating tractor beam
 */
take_update_tractor_beam(message_data)
{
    let player_id = message_data.player_id;
    let target_player_id = message_data.target_player_id;

    app.session.world_state_avatars.session_players[player_id].tractor_beam_target = target_player_id;

    app.session.world_state_avatars.session_players[player_id].frozen = true
    app.session.world_state_avatars.session_players[target_player_id].frozen = true

    app.session.world_state_avatars.session_players[player_id].interaction = app.session.parameter_set.interaction_length;
    app.session.world_state_avatars.session_players[target_player_id].interaction = app.session.parameter_set.interaction_length;

    if(player_id == app.session_player.id)
    {
        app.clear_main_form_errors();
        app.interaction_form.direction = null;
        app.interaction_form.amount = null;
        app.avatar_modal.toggle();
    }
},

take_update_cancel_interaction(message_data)
{
    let source_player_id = message_data.source_player_id;
    let target_player_id = message_data.target_player_id;

    let source_player = app.session.world_state_avatars.session_players[source_player_id];
    let target_player = app.session.world_state_avatars.session_players[target_player_id];

    source_player.tractor_beam_target = null;

    source_player.frozen = false
    target_player.frozen = false

    source_player.interaction = 0;
    target_player.interaction = 0;

    if(source_player_id == app.session_player.id)
    {
        app.working = false;
        app.avatar_modal.hide();
    }
}, 
