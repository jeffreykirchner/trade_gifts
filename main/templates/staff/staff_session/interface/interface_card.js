/**
 * take update from client for new location target
 */
take_target_location_update(message_data)
{
    if(message_data.value == "success")
    {
        app.session.world_state.session_players[message_data.session_player_id].target_location = message_data.target_location;        
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

    for(i in app.session.world_state.session_players)
    {
        temp_world_state["session_players"][i] = {"current_location" : app.session.world_state.session_players[i].current_location};
    }

    app.last_world_state_update = Date.now();
    app.send_message("world_state_update", {"world_state" : temp_world_state});       
},


take_update_collect_token(message_data)
{

    if(message_data.period_id != app.session.session_periods_order[app.session.world_state.current_period-1]) return;

    let token = app.session.world_state.tokens[message_data.period_id][message_data.token_id];

    try{
        pixi_tokens[message_data.period_id][message_data.token_id].token_container.getChildAt(0).stop();
        pixi_tokens[message_data.period_id][message_data.token_id].token_container.getChildAt(0).alpha = 0.25;
        // token.token_graphic.visible = false;
    } catch (error) {

    }

    token.status = message_data.player_id;

    let session_player = app.session.world_state.session_players[message_data.player_id];
    let current_location =  app.session.world_state.session_players[message_data.player_id].current_location;

    session_player.inventory[message_data.period_id] = message_data.inventory;
    pixi_avatars[message_data.player_id].avatar_container.getChildAt(4).text = message_data.inventory;

    let token_graphic = PIXI.Sprite.from(app.pixi_textures.sprite_sheet_2.textures["cherry_small.png"]);
    token_graphic.anchor.set(1, 0.5)
    token_graphic.eventMode = 'none';
    token_graphic.scale.set(0.4);
    token_graphic.alpha = 0.7;

    app.add_text_emitters("+1", 
                          current_location.x, 
                          current_location.y,
                          current_location.x,
                          current_location.y-100,
                          0xFFFFFF,
                          28,
                          token_graphic)
},

update_player_inventory()
{

    let period_id = app.session.session_periods_order[app.session.world_state.current_period-1];

    for(const i in app.session.session_players_order)
    {
        const player_id = app.session.session_players_order[i];
        pixi_avatars[player_id].avatar_container.getChildAt(4).text = app.session.world_state.session_players[player_id].inventory[period_id];
    }
},

take_update_tractor_beam(message_data)
{
    let player_id = message_data.player_id;
    let target_player_id = message_data.target_player_id;

    app.session.world_state.session_players[player_id].tractor_beam_target = target_player_id;

    app.session.world_state.session_players[player_id].frozen = true
    app.session.world_state.session_players[target_player_id].frozen = true

    app.session.world_state.session_players[player_id].interaction = app.session.parameter_set.interaction_length;
    app.session.world_state.session_players[target_player_id].interaction = app.session.parameter_set.interaction_length;
},

/**
 * take update from server about interactions
 */
take_update_interaction(message_data)
{
    if(message_data.value == "fail")
    {
        
    }
    else
    {
        let current_period_id = app.session.session_periods_order[app.session.world_state.current_period-1];

        let source_player_id = message_data.source_player_id;
        let target_player_id = message_data.target_player_id;

        let source_player = app.session.world_state.session_players[source_player_id];
        let target_player = app.session.world_state.session_players[target_player_id];

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
        
        pixi_avatars[source_player_id].avatar_container.getChildAt(4).text = source_player.inventory[current_period_id];
        pixi_avatars[target_player_id].avatar_container.getChildAt(4).text = target_player.inventory[current_period_id];

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

    }
},

take_update_cancel_interaction(message_data)
{
    let source_player_id = message_data.source_player_id;
    let target_player_id = message_data.target_player_id;

    app.session.world_state.session_players[source_player_id].tractor_beam_target = null;

    app.session.world_state.session_players[source_player_id].frozen = false
    app.session.world_state.session_players[target_player_id].frozen = false

    app.session.world_state.session_players[source_player_id].interaction = 0;
    app.session.world_state.session_players[target_player_id].interaction = 0;
}, 

