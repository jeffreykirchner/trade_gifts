send_chat(){

    if(app.working) return;
    if(app.chat_text.trim() == "") return;
    if(app.chat_text.trim().length > 200) return;
    if(app.session.world_state.avatars[app.session_player.id].sleeping) return;
    
    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.send_chat_instructions();
    }
    else
    {
        app.working = true;
        app.send_message("chat", 
                        {"text" : app.chat_text.trim()},
                        "group");
    }
    
    app.chat_text = "";                  
},

/**
 * send chat instructions
 */
send_chat_instructions()
{

    // {
    //     "value": "success",
    //     "text": "asdfasdf",
    //     "text_limited": "BSDtBSDt",
    //     "sender_id": 273,
    //     "nearby_players": [
    //         "274"
    //     ]
    // }

    let message_data = {
        "value": "success",
        "text": app.chat_text.trim(),
        "text_limited": app.chat_text.trim(),
        "sender_id": app.session_player.id,
        "nearby_players": [],
    };

    app.take_chat(message_data);
},

/** take result of moving goods
*/
take_chat(message_data){
    //app.cancel_modal=false;
    //app.clear_main_form_errors();

    if(message_data.value == "success")
    {
        app.take_update_chat(message_data);                        
    } 
    else
    {
        
    }
},

/** take updated data from goods being moved by another player
*    @param message_data {json} session day in json format
*/
take_update_chat(message_data){
    
    let text = message_data.text;

    if(app.session.parameter_set.chat_mode == "Limited")
    {
        let parameter_set_group_sender = app.session.session_players[message_data.sender_id].parameter_set_player.parameter_set_group;
        let parameter_set_group = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].parameter_set_group;

        if(parameter_set_group != parameter_set_group_sender)
        {
            text =  message_data.text_limited;
        }
    }

    app.session.world_state_avatars.session_players[message_data.sender_id].show_chat = true;    
    app.session.world_state_avatars.session_players[message_data.sender_id].chat_time = Date.now();
    pixi_avatars[message_data.sender_id].chat_container.getChildAt(1).text = text;

},

