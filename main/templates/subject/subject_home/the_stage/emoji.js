/**
 * send emote to server
 */
send_emoji(emoji_type)
{
    if(!app.session.world_state["started"]) return;
    if(app.session.world_state.avatars[app.session_player.id].sleeping) return;

    app.working = true;
    
    app.send_message("emoji", 
                    {"emoji_type" : emoji_type,
                     },
                     "group"); 
},


/**
 * take emote from server
 */
take_emoji(message_data)
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

},