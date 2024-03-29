/**
 * process incoming message for the feed
 */
process_the_feed: function process_the_feed(message_type, message_data)
{
    if(message_data.status != "success") return;
    
    html_text = "";
    let sender_label = "";
    let receiver_label = "";
    let group_label = "";

    switch(message_type) {                
        
        case "update_chat":

            sender_label = app.get_parameter_set_player_from_player_id(message_data.sender_id).id_label;
            source_player_group_label = app.get_parameter_set_group_from_player_id(message_data.sender_id).name;
            receiver_label = "";

            for(i in message_data.nearby_players) {
                if(receiver_label != "") receiver_label += ", ";
                group_label = app.get_parameter_set_group_from_player_id(message_data.nearby_players[i]).name;
                receiver_label += "<b>" + app.get_parameter_set_player_from_player_id(message_data.nearby_players[i]).id_label + "</b>(" + group_label + ")";
            }

            html_text = "<b>" + sender_label + "</b>(" + source_player_group_label + ") @ " + receiver_label + ": " +  message_data.text;

            if(app.session.parameter_set.chat_mode == "Limited")
            {
                html_text += " (<i>" + message_data.text_limited + "</i>)";
            }

            break;
        case "update_field_harvest":
            
            break;
        case "update_move_fruit_to_avatar":
            source_player_label = app.get_parameter_set_player_from_player_id(message_data.source_player_id).id_label;
            target_player_label = app.get_parameter_set_player_from_player_id(message_data.target_player_id).id_label;

            html_text = "<b>" + source_player_label + "</b> moved ";

            if(message_data.good_one_move > 0) {
                html_text += message_data.good_one_move + " <img src='/static/"+  message_data.goods.good_one.toLowerCase() +".png' width='20'> ";
            }

            if(message_data.good_two_move > 0) {
                html_text += message_data.good_two_move + " <img src='/static/"+  message_data.goods.good_two.toLowerCase() +".png' width='20'> ";
            }

            if(message_data.good_three_move > 0) {   
                html_text += message_data.good_three_move + " <img src='/static/"+  message_data.goods.good_three.toLowerCase() +".png' width='20'> ";
            }

            html_text += " to <b>" + target_player_label + "</b>";

            break;
        case "update_move_fruit_house":
            source_player_label = app.get_parameter_set_player_from_player_id(message_data.source_player_id).id_label;
            target_player = app.get_session_player_from_world_state_house(message_data.target_house_id);
            target_player_label = app.get_parameter_set_player_from_player_id(target_player.id).id_label;

            html_text = "<b>" + source_player_label + "</b> moved ";

            if(message_data.good_one_move > 0) {
                html_text += message_data.good_one_move + " <img src='/static/"+  message_data.goods.good_one.toLowerCase() +".png' width='20'> ";
            }

            if(message_data.good_two_move > 0) {
                html_text += message_data.good_two_move + " <img src='/static/"+  message_data.goods.good_two.toLowerCase() +".png' width='20'> ";
            }

            if(message_data.good_three_move > 0) {   
                html_text += message_data.good_three_move + " <img src='/static/"+  message_data.goods.good_three.toLowerCase() +".png' width='20'> ";
            }

            if(message_data.direction == "avatar_to_house") {
                html_text += " to ";
            } 
            else 
            {
                html_text += " from ";
            }

            html_text += " <b>" + target_player_label + "</b>'s house";

            break;
        case "update_attack_avatar":
            source_player_label = app.get_parameter_set_player_from_player_id(message_data.source_player_id).id_label;
            source_player_group_label = app.get_parameter_set_group_from_player_id(message_data.source_player_id).name;

            target_player_label = app.get_parameter_set_player_from_player_id(message_data.target_player_id).id_label;
            target_player_group_label = app.get_parameter_set_group_from_player_id(message_data.target_player_id).name;

            html_text = "<b>" + source_player_label + "</b> (" + source_player_group_label + ") " + "<img src='/static/fist_right.png' width='20'>" + " <b>" + target_player_label + "</b> (" + target_player_group_label + ")";

            break;
        case "update_sleep":
            sender_label = app.get_parameter_set_player_from_player_id(message_data.source_player_id).id_label;
            html_text = "<b>" + sender_label + "</b> is sleeping zzz...";
            break;
        case "update_emoji":
            receiver_label = "";

            for(i in message_data.nearby_players) {
                if(receiver_label != "") receiver_label += ", ";

                group_label = app.get_parameter_set_group_from_player_id(message_data.nearby_players[i]).name;
                receiver_label += "<b>" + app.get_parameter_set_player_from_player_id(message_data.nearby_players[i]).id_label + "</b>(" + group_label + ")";
            }

            sender_label = app.get_parameter_set_player_from_player_id(message_data.source_player_id).id_label;
            source_player_group_label = app.get_parameter_set_group_from_player_id(message_data.source_player_id).name;

            html_text = "<b>" + sender_label + "</b>(" + source_player_group_label + ") @ " + receiver_label + ": <img src='/static/"+  message_data.emoji_type +"_emoji.png' width='20'>";
            break;
        case "update_patch_harvest":
            sender_label = app.get_parameter_set_player_from_player_id(message_data.player_id).id_label;
            group_label = app.get_parameter_set_group_from_player_id(message_data.player_id).name;
            html_text = "<b>" + sender_label + "</b> (" + group_label + ") harvested " + message_data.harvest_amount + " <img src='/static/"+  message_data.patch.good.toLowerCase() +".png' width='20'>" + " from patch " + message_data.patch.info;
            break;
        case "update_hat_avatar":

            source_player_label = app.get_parameter_set_player_from_player_id(message_data.source_player_id).id_label;
            source_player_group = app.get_parameter_set_group_from_player_id(message_data.source_player_id);
            source_player_group_label = source_player_group.name;

            target_player_label = app.get_parameter_set_player_from_player_id(message_data.target_player_id).id_label;
            target_player_group_label = app.get_parameter_set_group_from_player_id(message_data.target_player_id).name;

            source_avatar_texture = app.session.parameter_set.parameter_set_hats[source_player_group.parameter_set_hat].texture;

            if(message_data.type=="open")
            {
            
                html_text = "<b>" + source_player_label + "</b> (" + source_player_group_label + ") proposes truce to <b>" + target_player_label + "</b> (" + target_player_group_label + "): " +
                            "<img src='/static/"+  source_avatar_texture +".png' width='20'>";
                
            }
            else if(message_data.type=="proposal_received")
            {
                html_text = "<b>" + target_player_label + "</b> (" + source_player_group_label + ") accepts truce from <b>" + source_player_label + "</b> (" + target_player_group_label + "): " +
                            "<img src='/static/"+  source_avatar_texture +".png' width='20'>";
            }
            break;
        case "update_hat_avatar_cancel":
            source_player_label = app.get_parameter_set_player_from_player_id(message_data.source_player_id).id_label;
            source_player_group = app.get_parameter_set_group_from_player_id(message_data.source_player_id);
            source_player_group_label = source_player_group.name;

            target_player_label = app.get_parameter_set_player_from_player_id(message_data.target_player_id).id_label;
            target_player_group_label = app.get_parameter_set_group_from_player_id(message_data.target_player_id).name;

            source_avatar_texture = app.session.parameter_set.parameter_set_hats[source_player_group.parameter_set_hat].texture;

            html_text = "<b>" + target_player_label + "</b> (" + source_player_group_label + ") rejects truce with <b>" + source_player_label + "</b> (" + target_player_group_label + "): " +
                        "<img src='/static/"+  source_avatar_texture +".png' width='20'>";

    }

    if(html_text != "") {
        if(app.the_feed.length > 100) app.the_feed.pop();
        app.the_feed.unshift(html_text);
    }

},