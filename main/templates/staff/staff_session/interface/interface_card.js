/**
 * take update from client for new location target
 */
take_target_location_update(message_data)
{
    if(message_data.value == "success")
    {
        app.session.world_state_avatars.session_players[message_data.session_player_id].target_location = message_data.target_location;        
        // app.send_world_state_update();         
    } 
    else
    {
        
    }
},

/**
 * send an update to the server to store the current world state
 */
send_world_state_update()
{
    if(app.last_world_state_update == null) 
    {
        app.last_world_state_update = Date.now();
        return;
    }

    if(Date.now() - app.last_world_state_update < 1000) return;

    let temp_world_state = {"session_players":{}}

    for(i in app.session.world_state_avatars.session_players)
    {
        temp_world_state["session_players"][i] = {"current_location" : app.session.world_state_avatars.session_players[i].current_location};
    }

    app.last_world_state_update = Date.now();
    app.send_message("world_state_update", {"world_state" : temp_world_state});       
},

take_update_tractor_beam(message_data)
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
 * take update from server about move fruit between avatars
 */
take_update_move_fruit_to_avatar(message_data)
{
    
},

