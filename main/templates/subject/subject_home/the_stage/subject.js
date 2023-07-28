/**
 *pointer up on subject screen
 */
 subject_pointer_up(event)
 {
     if(!app.session.world_state.hasOwnProperty('started')) return;
     let local_pos = event.data.getLocalPosition(event.currentTarget);
     let local_player = app.session.world_state_avatars.session_players[app.session_player.id];
 
     if(event.button == 0)
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
     else if(event.button == 2)
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
 
        if(local_player.cool_down > 0)
        {
            app.add_text_emitters("No actions cooling down.", 
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
            let obj = app.session.world_state_avatars.session_players[i];

            if(app.get_distance(obj.current_location, local_pos) < 100 &&
            app.get_distance(obj.current_location, local_player.current_location) <= app.session.parameter_set.interaction_range+125)
            {
                app.subject_avatar_click(i);              
                break;
            }
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
                    break;
                }
            }

        }

    }
 },

/**
 * subject screen offset from the origin
 */
get_offset()
{
    let obj = app.session.world_state_avatars.session_players[app.session_player.id];

    return {x:obj.current_location.x * app.pixi_scale - pixi_app.screen.width/2,
            y:obj.current_location.y * app.pixi_scale - pixi_app.screen.height/2};
},

/**
 * update the amount of shift needed to center the player
 */
update_offsets_player(delta)
{
    offset = app.get_offset();

    pixi_container_main.x = -offset.x;
    pixi_container_main.y = -offset.y;   
    
    obj = app.session.world_state_avatars.session_players[app.session_player.id];

    pixi_target.x = obj.target_location.x;
    pixi_target.y = obj.target_location.y;
},

/**
 * setup subject screen status overlay
 */
setup_subject_status_overlay()
{
    if(!app.session) return;
    if(app.pixi_mode!="subject") return;
    if(subject_status_overlay_container) subject_status_overlay_container.destroy();

    subject_status_overlay_container = new PIXI.Container();
    subject_status_overlay_container.eventMode = 'none';
    subject_status_overlay_container.zIndex = 9999

    temp_y = 0;

    let text_style = {
        fontFamily: 'Arial',
        fontSize: 28,
        fill: 'white',
        align: 'left',
        stroke: 'black',
        strokeThickness: 2,
    };

    //labels
    //current period
    let current_period_text = new PIXI.Text('Current Period:', text_style);
    current_period_text.eventMode = 'none';   

    subject_status_overlay_container.addChild(current_period_text);
    current_period_text.position.set(0, temp_y);

    temp_y += current_period_text.height+5;

    //time remaining
    let time_remaining_text = new PIXI.Text('Time Remaining:', text_style);
    time_remaining_text.eventMode = 'none';   

    subject_status_overlay_container.addChild(time_remaining_text);
    time_remaining_text.position.set(0, temp_y);

    temp_y += time_remaining_text.height+5;

    //profit
    let profit_text = new PIXI.Text('Total Profit (¢):', text_style);
    profit_text.eventMode = 'none';   

    subject_status_overlay_container.addChild(profit_text);
    profit_text.position.set(0, temp_y);

    //amounts
    temp_y = 0;
    //current period 
    let current_period_label = new PIXI.Text('NN', text_style);
    current_period_label.eventMode = 'none';   

    subject_status_overlay_container.addChild(current_period_label);
    current_period_label.position.set(time_remaining_text.width+10, temp_y);

    temp_y += current_period_text.height+5;

    //time remaining 
    let time_remaining_label = new PIXI.Text('00:00', text_style);
    time_remaining_label.eventMode = 'none';   

    subject_status_overlay_container.addChild(time_remaining_label);
    time_remaining_label.position.set(time_remaining_text.width+10, temp_y);

    temp_y += time_remaining_text.height+5;

    //profit
    let profit_label = new PIXI.Text('0000', text_style);
    profit_label.eventMode = 'none';   

    subject_status_overlay_container.addChild(profit_label);
    profit_label.position.set(time_remaining_text.width+10, temp_y);

    subject_status_overlay_container.position.set(pixi_app.screen.width - subject_status_overlay_container.width-20, 20);
    
    pixi_app.stage.addChild(subject_status_overlay_container);

    app.update_subject_status_overlay();
},

/**
 * update subject overlay
 */
update_subject_status_overlay()
{
    if(!app.session.world_state.hasOwnProperty('started')) return;

    if(!subject_status_overlay_container) return;
    // subject_status_overlay_container.position.set(pixi_app.screen.width - subject_status_overlay_container.width-20, 20);

    subject_status_overlay_container.getChildAt(3).text = app.session.world_state.current_period;
    subject_status_overlay_container.getChildAt(4).text = app.session.world_state.time_remaining;
    subject_status_overlay_container.getChildAt(5).text = app.session.world_state_avatars.session_players[app.session_player.id].earnings;
},