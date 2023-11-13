/**
 * get the parameter set player from the player id
 */
get_parameter_set_player_from_player_id: function get_parameter_set_player_from_player_id(player_id)
{
    let parameter_set_player_id = app.session.world_state.avatars[player_id].parameter_set_player_id;
    return app.session.parameter_set.parameter_set_players[parameter_set_player_id];
},

/**
 * get the parameter set group for a player id
 */
get_parameter_set_group_from_player_id: function get_parameter_set_group_from_player_id(player_id)
{
    if(!player_id) return null;

    let parameter_set_player_id = app.session.world_state.avatars[player_id].parameter_set_player_id;
    let parameter_set_player = app.session.parameter_set.parameter_set_players[parameter_set_player_id];
    return app.session.parameter_set.parameter_set_groups[parameter_set_player.parameter_set_group];
},

/**
 * get session player from world state house
 */
get_session_player_from_world_state_house: function get_session_player_from_world_state_house(house_id)
{
    let session_player_id = app.session.world_state.houses[house_id].session_player;
    return app.session.session_players[session_player_id];
},

/**
 * get ground element player is over
 */
get_ground_element_player_is_over: function get_ground_element_player_is_over(player_id)
{
    if(!player_id) return null;
    
    let player_location = app.session.world_state_avatars.session_players[player_id].current_location
    
    for(i in app.session.parameter_set.parameter_set_grounds)
    {
        let ground = app.session.parameter_set.parameter_set_grounds[i];
        let rect = {x:ground.x, y:ground.y, width:ground.width, height:ground.height};
        if(app.check_point_in_rectagle(player_location, rect)) return ground;
    }

    return null;
},

/**
 * return true if input is an integer greatere than or equal to zero
 */
is_positive_integer: function is_positive_integer(input) {
    return Number.isInteger(input) && input >= 0;
},
