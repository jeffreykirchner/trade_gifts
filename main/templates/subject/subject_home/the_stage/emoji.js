/**
 * send emote to server
 */
send_emoji: function send_emoji(emoji_type)
{
    if(!app.session.world_state["started"]) return;
    if(app.session.world_state.avatars[app.session_player.id].sleeping) return;

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.send_emoji_instructions(emoji_type);
    }
    else
    {
        app.working = true;
        app.send_message("emoji", 
                        {"emoji_type" : emoji_type,
                         "current_location" : app.session.world_state_avatars.session_players[app.session_player.id].current_location,
                         },
                         "group"); 
    }
},

/**
send emoji instructions
*/
send_emoji_instructions: function send_emoji_instructions(emoji_type)
{
    // {
    //     "status": "success",
    //     "error_message": {},
    //     "source_player_id": 273,
    //     "emoji_type": "sad"
    // }

    let message_data = {
        "status": "success",
        "error_message": {},
        "source_player_id": app.session_player.id,
        "emoji_type": emoji_type
    };

    app.take_emoji(message_data);
},

/**
 * take emote from server
 */
take_emoji: function take_emoji(message_data)
{

    source_player_id = message_data.source_player_id;
    emoji_type = message_data.emoji_type;

    let source_player = app.session.world_state_avatars.session_players[source_player_id];

    let sprite = null;

    if(emoji_type == "happy")
    {
        sprite = PIXI.Sprite.from(app.pixi_textures["happy_emoji_tex"]);
    }
    else if(emoji_type == "sad")
    {
        sprite = PIXI.Sprite.from(app.pixi_textures["sad_emoji_tex"]);
    }   
    else if(emoji_type == "angry")
    {
        sprite = PIXI.Sprite.from(app.pixi_textures["angry_emoji_tex"]);
    }
    else
    {
        return;
    }

    sprite.alpha = 0.85;

    app.add_text_emitters("", 
        source_player.current_location.x, 
        source_player.current_location.y,
        source_player.current_location.x,
        source_player.current_location.y - 100,
        0xFFFFFF,
        28,
        sprite);

    if(source_player_id == app.session_player.id)
    {
        app.working = false;
    }

},