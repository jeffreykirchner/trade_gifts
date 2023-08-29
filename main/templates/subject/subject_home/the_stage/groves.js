/**
 * setup grove objects
 */
setup_pixi_groves()
{
    let grove_size = 300;

    for(const i in app.session.parameter_set.parameter_set_groves_order)
    {

        const grove_id = app.session.parameter_set.parameter_set_groves_order[i];
        const grove = app.session.parameter_set.parameter_set_groves[grove_id];

        pixi_groves[grove_id] = {};

        let grove_container = new PIXI.Container();
        grove_container.eventMode = 'passive';
        grove_container.zIndex = 80;
        
        grove_container.position.set(grove.x, grove.y);
        grove_container.zIndex = 80;
        pixi_groves[grove_id].grove_container = grove_container;

        //draw grove as a circle
        let temp_size = grove_size;
        let ring_size = grove_size/(Object.keys(grove.levels).length*1.5);

        for(j in grove.levels)
        {
            let grove_level = grove.levels[j];
            let grove_circle = new PIXI.Graphics();
            grove_circle.beginFill(grove.hex_color);
            //add line style
            grove_circle.lineStyle(2, 0x000000);
            grove_circle.drawCircle(0, 0, temp_size/2);
            grove_circle.endFill();
            grove_circle.alpha = 1/Object.keys(grove.levels).length;
            grove_circle.eventMode = 'passive';
            
            pixi_groves[grove_id]["grove_circles_"+j] = grove_circle;
            grove_container.addChild(grove_circle);

            temp_size -= ring_size;
        }

        pixi_container_main.addChild(pixi_groves[grove_id].grove_container);
    }

    app.update_grove_inventory();
},

/**
 * update grove inventory
 */
update_grove_inventory()
{
    if(!app.session.world_state["started"]) return;
    
    for(const i in app.session.parameter_set.parameter_set_groves_order)
    {
        
    }
},

/**
 * handle grove click
 */
subject_grove_click(grove_id)
{
    let grove = app.session.world_state.groves[grove_id];

    let source_parameter_set_player = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id];
    let target_parameter_set_player = app.session.parameter_set.parameter_set_players[grove.parameter_set_player];
    let local_player = app.session.world_state_avatars.session_players[app.session_player.id];
    
    if(app.session.parameter_set.allow_stealing == "False" && 
       source_parameter_set_player.parameter_set_group != target_parameter_set_player.parameter_set_group)
    {
        app.add_text_emitters("You cannot interact with other group's groves.", 
                                local_player.current_location.x, 
                                local_player.current_location.y,
                                local_player.current_location.x,
                                local_player.current_location.y-100,
                                0xFFFFFF,
                                28,
                                null);
        return;
    }

    // console.log("subject grove click", grove_id);
    app.selected_grove.grove = grove;
    app.selected_grove.grove_type = app.session.parameter_set.parameter_set_grove_types[app.selected_grove.grove.parameter_set_grove_type];
    app.selected_grove.good_one_harvest = 0;
    app.selected_grove.good_two_harvest = 0;

    app.selected_grove.good_one_available = app.selected_grove.grove[app.selected_grove.grove_type.good_one_ft];
    app.selected_grove.good_two_available = app.selected_grove.grove[app.selected_grove.grove_type.good_two_ft];

    app.clear_main_form_errors();
    app.grove_modal.toggle();

    let total_effort = app.session.parameter_set.production_effort;

    if(app.selected_grove.grove.good_one_effort > total_effort/2)
    {
        app.selected_grove.effort_slider = -(app.selected_grove.grove.good_one_effort - total_effort/2);
    }
    else if(app.selected_grove.grove.good_two_effort > total_effort/2)
    {
        app.selected_grove.effort_slider = app.selected_grove.grove.good_two_effort - total_effort/2;
    }
    else
    {
        app.selected_grove.effort_slider = 0;
    }
    
    app.update_effort_slider();
},

/**
 * handle grove modal hide
 */
hide_grove_modal()
{
    app.selected_grove.grove = null;
    app.selected_grove.grove_type = null;
},

/**
 * handle update to effort slider
 */
update_effort_slider()
{
    let total_effort = app.session.parameter_set.production_effort;
    let effort_slider = parseInt(app.selected_grove.effort_slider);

    if(effort_slider < 0){

        app.selected_grove.good_one_production_effort = Math.abs(effort_slider) + total_effort/2;
        app.selected_grove.good_two_production_effort = total_effort - app.selected_grove.good_one_production_effort;

    }else if(effort_slider > 0){

        app.selected_grove.good_two_production_effort = effort_slider + total_effort/2;
        app.selected_grove.good_one_production_effort = total_effort - app.selected_grove.good_two_production_effort;
    }else{
        effort_slider = 0;
        app.selected_grove.good_one_production_effort = total_effort/2;
        app.selected_grove.good_two_production_effort = total_effort/2;
    }
},

/**
 * send harvest grove requst
 */
send_grove_harvest()
{
    if(!app.session.world_state["started"]) return;
    if(!app.selected_grove.grove) return;

    app.clear_main_form_errors();

    let grove = app.session.world_state.groves[app.selected_grove.grove.id];
    let grove_type = app.session.parameter_set.parameter_set_grove_types[grove.parameter_set_grove_type];

    let failed = false;
    if(app.selected_grove.good_one_harvest <= 0 && app.selected_grove.good_two_harvest <= 0)
    {
        app.display_errors({good_one_harvest: ["Invalid Amount"], good_two_harvest: ["Invalid Amount"]});
        return;
    }

    if(app.selected_grove.good_one_harvest > grove[grove_type.good_one_ft] || app.selected_grove.good_one_harvest < 0)
    {
        app.display_errors({good_one_harvest: ["Invalid Amount"]});
        app.selected_grove.good_one_available = grove[grove_type.good_one_ft];        
        failed = true;
    }

    if(app.selected_grove.good_two_harvest > grove[grove_type.good_two_ft] || app.selected_grove.good_two_harvest < 0)
    {
        app.display_errors({good_two_harvest: ["Invalid Amount"]});
        app.selected_grove.good_two_available = grove[grove_type.good_two_ft];
        failed = true;
    }

    if(failed) return;

    app.send_message("grove_harvest", 
                     {"grove_id" : app.selected_grove.grove.id,
                      "good_one_harvest" : app.selected_grove.good_one_harvest,
                      "good_two_harvest" : app.selected_grove.good_two_harvest},
                      "group");
},

/**
 * take grove harvest response
*/

take_grove_harvest(message_data)
{

    if(message_data.status == "success")
    {
        avatar = app.session.world_state.avatars[message_data.avatar.id];
        grove = app.session.world_state.groves[message_data.grove.id];

        good_one_harvest = message_data.good_one_harvest;
        good_two_harvest = message_data.good_two_harvest;

        grove_type = app.session.parameter_set.parameter_set_grove_types[grove.parameter_set_grove_type];

        grove[grove_type.good_one_ft] = message_data.grove[grove_type.good_one_ft];
        grove[grove_type.good_two_ft] = message_data.grove[grove_type.good_two_ft];

        avatar[grove_type.good_one_ft] = message_data.avatar[grove_type.good_one_ft];
        avatar[grove_type.good_two_ft] = message_data.avatar[grove_type.good_two_ft];

        app.update_grove_inventory();
        app.update_avatar_inventory();

        elements = [];
        if(good_one_harvest > 0)
        {
            element = {source_change:"-" + good_one_harvest,
                       target_change:"+" + good_one_harvest, 
                       texture:app.pixi_textures[grove_type.good_one_ft+"_tex"]  }
            elements.push(element);
        }

        if(good_two_harvest > 0)
        {
            element = {source_change:"-" + good_two_harvest,
                       target_change:"+" + good_two_harvest,
                       texture:app.pixi_textures[grove_type.good_two_ft+"_tex"]  }
            elements.push(element);
        }

        app.add_transfer_beam(grove, 
            app.session.world_state_avatars.session_players[message_data.avatar.id].current_location,
            elements);
        
        if(app.is_subject && message_data.avatar.id == app.session_player.id)
        {
            app.grove_modal.hide();
        }
    }
    else
    {

    }
},

/**
 * select all fruit for harvest
 */
select_all_fruit()
{
    grove_type = app.session.parameter_set.parameter_set_grove_types[app.selected_grove.grove.parameter_set_grove_type];

    app.selected_grove.good_one_harvest = app.selected_grove.grove[grove_type.good_one_ft];
    app.selected_grove.good_two_harvest = app.selected_grove.grove[grove_type.good_two_ft];
},

/**
 * send grove effort update
 */
send_grove_effort()
{

    app.send_message("grove_effort", 
                     {"grove_id" : app.selected_grove.grove.id,
                      "good_one_effort" : app.selected_grove.good_one_production_effort,
                      "good_two_effort" : app.selected_grove.good_two_production_effort},
                      "group");
},

/**
 * take grove effort update
 */
take_grove_effort(message_data)
{
    grove = app.session.world_state.groves[message_data.grove.id];

    grove.good_one_effort = message_data.good_one_effort;
    grove.good_two_effort = message_data.good_two_effort;

    app.update_grove_inventory();

    if(message_data.avatar.id == app.session_player.id)
    {
        app.grove_modal.hide();
    }

},




