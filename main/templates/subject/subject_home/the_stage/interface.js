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
 * update the inventory of the player
 */
update_player_inventory()
{

    let period_id = app.session.session_periods_order[app.session.world_state.current_period-1];

    for(const i in app.session.session_players_order)
    {
        const player_id = app.session.session_players_order[i];
        pixi_avatars[player_id].avatar_container.getChildAt(4).text = app.session.world_state_avatars.session_players[player_id].inventory[period_id];
    }
},

/**
 * subject avatar click
 */
subject_avatar_click(target_player_id)
{
    if(target_player_id == app.session_player.id) return;

    // console.log("subject avatar click", target_player_id);

    app.send_message("tractor_beam", 
                     {"target_player_id" : target_player_id},
                     "group");
},

subject_field_click(field_id)
{
    console.log("subject field click", field_id);
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
        app.interaction_modal.toggle();
    }
},

/**
 * send interaction to server
 */
send_interaction()
{
    app.clear_main_form_errors();

    let errors = {};

    if(!app.interaction_form.direction || app.interaction_form.direction == "")
    {
        errors["direction"] = ["Choose a direction"];
    }

    if(!app.interaction_form.amount || app.interaction_form.amount < 1)
    {
        errors["amount"] = ["Invalid amount"];
    }

    if(Object.keys(errors).length > 0)
    {
        app.display_errors(errors);
        return;
    }

    app.working = true;

    app.send_message("interaction", 
                    {"interaction" : app.interaction_form},
                     "group"); 
},


/**
 * take update from server about interactions
 */
take_update_interaction(message_data)
{
    if(message_data.value == "fail")
    {
        if(message_data.source_player_id == app.session_player.id)
        {
            let errors = {};
            errors["direction"] = [message_data.error_message];
            app.display_errors(errors);
            app.working = false;            
        }
    }
    else
    {
        let currnent_period_id = app.session.session_periods_order[app.session.world_state.current_period-1];

        let source_player_id = message_data.source_player_id;
        let target_player_id = message_data.target_player_id;

        let source_player = app.session.world_state_avatars.session_players[source_player_id];
        let target_player = app.session.world_state_avatars.session_players[target_player_id];

        let period = message_data.period;

        //update status
        source_player.tractor_beam_target = null;

        source_player.frozen = false
        target_player.frozen = false
    
        source_player.interaction = 0;
        target_player.interaction = 0;

        source_player.cool_down = app.session.parameter_set.cool_down_length;
        target_player.cool_down = app.session.parameter_set.cool_down_length;

        //update inventory
        source_player.inventory[period] = message_data.source_player_inventory;
        target_player.inventory[period] = message_data.target_player_inventory;
        
        pixi_avatars[source_player_id].avatar_container.getChildAt(4).text = source_player.inventory[currnent_period_id];
        pixi_avatars[target_player_id].avatar_container.getChildAt(4).text = target_player.inventory[currnent_period_id];

         //add transfer beam
         if(message_data.direction == "give")
         {
             app.add_transfer_beam(source_player.current_location, 
                                  target_player.current_location,
                                  app.pixi_textures.sprite_sheet_2.textures["cherry_small.png"],
                                  message_data.source_player_change,
                                  message_data.target_player_change);
         }
         else
         {
             app.add_transfer_beam(target_player.current_location, 
                                   source_player.current_location,
                                   app.pixi_textures.sprite_sheet_2.textures["cherry_small.png"],
                                   message_data.target_player_change,
                                   message_data.source_player_change);
         }

        if(message_data.source_player_id == app.session_player.id)
        {
            app.working = false;
            app.interaction_modal.hide();
        }
    }
},

/** hide choice grid modal modal
*/
hide_interaction_modal(){
    
},

/**
 * cancel interaction in progress
 */
cancel_interaction()
{
    session_player = app.session.world_state_avatars.session_players[app.session_player.id];

    if(session_player.interaction == 0)
    {        
        app.interaction_modal.hide();
        return;
    }

    app.working = true;
    app.send_message("cancel_interaction", 
                    {},
                     "group"); 
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
        app.interaction_modal.hide();
    }
}, 
