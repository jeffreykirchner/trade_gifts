/**
 * take update from client for new location target
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

