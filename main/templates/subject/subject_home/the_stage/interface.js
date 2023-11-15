/**
 * send movement update to server
 */
target_location_update: function target_location_update()
{
    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        if(app.session_player.current_instruction == app.instructions.action_page_move)
        {
            app.session_player.current_instruction_complete=app.instructions.action_page_move;
        }

        return;
    }

    let session_player = app.session.world_state_avatars.session_players[app.session_player.id];

    app.send_message("target_location_update", 
                    {"target_location" : session_player.target_location, 
                     "current_location" : session_player.current_location},
                     "group");                   
},

/**
 * take update from server about new location target for a player
 */
take_target_location_update: function take_target_location_update(message_data)
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
 subject_pointer_up: function subject_pointer_up(event)
 {
    if(!app.session.world_state.hasOwnProperty('started')) return;
    let local_pos = event.data.getLocalPosition(event.currentTarget);
    
    app.subject_pointer_up_action(event.button, local_pos);
 },

 /**
  * stage pointer up actions
  */
 subject_pointer_up_action: function subject_pointer_up_action(button, local_pos)
 {
    let local_player = app.session.world_state_avatars.session_players[app.session_player.id];
    let avatar = app.session.world_state.avatars[app.session_player.id];
    let parameter_set_player_local = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id];

    //check that pointer is clicked in valid location
    let valid_click = false;

    for(i in pixi_grounds)
    {
        if(app.check_point_in_rectagle(local_pos,pixi_grounds[i].rect))
        {
            valid_click = true;
        }
    }

    if(!valid_click) return;
    
    //check if asleep
    if(avatar.sleeping)
    {
        app.add_text_emitters("No actions while sleeping.", 
                            local_player.current_location.x, 
                            local_player.current_location.y,
                            local_player.current_location.x,
                            local_player.current_location.y-100,
                            0xFFFFFF,
                            28,
                            null);
        return;
    }

    if(button == 0)
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
     else if(button == 2)
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
  
        //check if click on another player
        for(i in app.session.world_state_avatars.session_players)
        {
            if(i != app.session_player.id)
            {
                let session_player = app.session.world_state.avatars[i];
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
                        if(!session_player.sleeping)
                        {
                            app.subject_avatar_click(i, local_pos);
                        }
                        else
                        {
                            app.add_text_emitters("The avatar is asleep.", 
                                                    local_player.current_location.x, 
                                                    local_player.current_location.y,
                                                    local_player.current_location.x,
                                                    local_player.current_location.y-100,
                                                    0xFFFFFF,
                                                    28,
                                                    null);
                        }

                        return;
                    }
                }
            }
            
        }

         //check rest period
         if(app.session.world_state.time_remaining > app.session.parameter_set.period_length &&
            app.session.world_state.current_period % app.session.parameter_set.break_frequency == 0)
         {
             app.add_text_emitters("No iteractions while on break.", 
                                 local_pos.x, 
                                 local_pos.y,
                                 local_pos.x,
                                 local_pos.y-100,
                                 0xFFFFFF,
                                 28,
                                 null);
             return;
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
                    return;
                }
            }

        }

        //check if click on a house
        for(i in app.session.world_state.houses)
        {
            let obj = pixi_houses[i].house_container;
            let rect={x:obj.x-obj.width/2, y:obj.y-obj.height/2, width:obj.width, height:obj.height};
            let pt={x:local_pos.x, y:local_pos.y};    
            let house = app.session.world_state.houses[i];     
            let parameter_set_player = app.session.parameter_set.parameter_set_players[i];   
            
            if(app.check_point_in_rectagle(pt, rect))
            {
                //check subject close enough for interaction
                if(app.check_for_circle_rect_intersection({x:local_player.current_location.x, 
                                                           y:local_player.current_location.y, 
                                                        radius:app.session.parameter_set.interaction_range},
                                                    rect))
                {
                    if(parameter_set_player_local.parameter_set_group == parameter_set_player.parameter_set_group)
                    {
                        app.subject_house_click(i);              
                    }
                    else
                    {
                        app.add_text_emitters("This house is not in your group.", 
                                                parameter_set_player.house_x, 
                                                parameter_set_player.house_y,
                                                parameter_set_player.house_x,
                                                parameter_set_player.house_y-100,
                                                0xFFFFFF,
                                                28,
                                                null);
                    }
                    return;
                }
            }
        }

        //check if click on patch
        for(i in app.session.world_state.patches)
        {
            let patch = app.session.world_state.patches[i];
            let patch_center = {x:patch.x, y:patch.y};
            let pt={x:local_pos.x, y:local_pos.y};
            let local_player_center = {x:local_player.current_location.x, y:local_player.current_location.y};

            if(app.check_circle_intersection({center:patch_center,radius:patch.radius},
                                             {center:local_player_center,radius:app.session.parameter_set.interaction_range}))
            {

                if(app.check_point_in_circle(pt, {center:patch_center,radius:patch.radius}))
                {
                    if(avatar.period_patch_harvests>=app.session.parameter_set.max_patch_harvests)
                    {
                        app.add_text_emitters("You must wait until next period to harvest again.", 
                                                patch.x, 
                                                patch.y,
                                                patch.x,
                                                patch.y-100,
                                                0xFFFFFF,
                                                28,
                                                null);
                        return;
                    }
                    else if(app.session.parameter_set.patch_harvest_mode=="Once per Group")
                    {
                        for(j in avatar.period_patch_harvests_ids)
                        {
                            let temp_patch_id = avatar.period_patch_harvests_ids[j];
                            if(app.session.parameter_set.parameter_set_patches[temp_patch_id].parameter_set_group == 
                               app.session.parameter_set.parameter_set_patches[patch.id].parameter_set_group)
                            {
                                app.add_text_emitters("You have already harvested from this region this period.", 
                                                patch.x, 
                                                patch.y,
                                                patch.x,
                                                patch.y-100,
                                                0xFFFFFF,
                                                28,
                                                null);
                                return;
                            }
                        }
                    }
                    
                    app.subject_patch_click(i);
                    return;
                }
            }
        }

        app.add_text_emitters("No targets within range.", 
                                local_pos.x, 
                                local_pos.y,
                                local_pos.x,
                                local_pos.y-100,
                                0xFFFFFF,
                                28,
                                null);

    }
 },

/**
 * result of subject activating tractor beam
 */
take_update_tractor_beam: function take_update_tractor_beam(message_data)
{
    let player_id = message_data.player_id;
    let target_player_id = message_data.target_player_id;

    app.session.world_state_avatars.session_players[player_id].tractor_beam_target = target_player_id;

    app.session.world_state_avatars.session_players[player_id].frozen = true
    app.session.world_state_avatars.session_players[target_player_id].frozen = true

    app.session.world_state_avatars.session_players[player_id].interaction = app.session.parameter_set.interaction_length;
    app.session.world_state_avatars.session_players[target_player_id].interaction = app.session.parameter_set.interaction_length;
},

/**
 * cancel tractor beam
 */
take_update_cancel_interaction: function take_update_cancel_interaction(message_data)
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
