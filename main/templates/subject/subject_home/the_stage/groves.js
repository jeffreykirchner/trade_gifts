/**
 * setup grove objects
 */
setup_pixi_groves()
{
    let grove_size = 150;
    let ring_size = 50;

    //destory old groves
    for(i in pixi_groves)
    {
        if(grove_container in pixi_groves[i])
        {
            pixi_groves[i].grove_container.destroy();
        }
    }

    //find max grove size
    let max_grove_size = 0;
    for(const i in app.session.parameter_set.parameter_set_groves_order)
    {
        const grove_id = app.session.parameter_set.parameter_set_groves_order[i];
        const grove = app.session.parameter_set.parameter_set_groves[grove_id];

        let temp_size = 0;
        for(j in grove.levels)
        {
            temp_size ++;
        }

        if(temp_size > max_grove_size)
        {
            max_grove_size = temp_size;
        }
    }
    
    for(const i in app.session.world_state.groves)
    {

        // const grove_id = app.session.parameter_set.parameter_set_groves_order[i];
        const grove = app.session.world_state.groves[i];

        pixi_groves[i] = {};

        let grove_container = new PIXI.Container();
        grove_container.eventMode = 'passive';
        grove_container.zIndex = 80;
        
        grove_container.position.set(grove.x, grove.y);
        grove_container.zIndex = 80;
        pixi_groves[i].grove_container = grove_container;

        //draw grove as a circle
        let temp_size = grove_size;
        let grove_level_count = 0;

        for(let j = 1; j <= grove.max_levels; j++)
        {
            let grove_level = grove.levels[j];
            let grove_circle = new PIXI.Graphics();
            grove_circle.beginFill(grove.hex_color);
            //add line style
            grove_circle.lineStyle(2, 0x000000);
            grove_circle.drawCircle(0, 0, temp_size/2);
            grove_circle.endFill();
            grove_circle.alpha = 1/max_grove_size;
            grove_circle.eventMode = 'passive';
            
            pixi_groves[i]["grove_circles_"+j] = grove_circle;
            grove_container.addChildAt(grove_circle, 0);

            let good_label = new PIXI.Text(grove_level.value, {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 'black',
                // stroke: 'black',
                // strokeThickness: 2,
            });
            good_label.eventMode = 'passive'; 
            good_label.anchor.set(1, 0.5);
            good_label_position = app.find_point_on_circle({x:0, y:0}, temp_size/2, 0);
            good_label.position.set(good_label_position.x-5, good_label_position.y);
            grove_container.addChildAt(good_label, 0);

            temp_size += ring_size;
        }

        grove.radius = (temp_size-ring_size)/2;

        //add base circle
        temp_size -= ring_size;
        let grove_base = new PIXI.Graphics();
        grove_base.beginFill("white");
        //add line style
        grove_base.drawCircle(0, 0, temp_size/2);
        grove_base.endFill();
        grove_base.eventMode = 'passive';

        grove_container.addChildAt(grove_base, 0);

        //good        
        let good_sprite = PIXI.Sprite.from(app.pixi_textures[grove.good +"_tex"]);
        good_sprite.anchor.set(0.5, 1);
        good_sprite.scale.set(0.6);
        good_sprite.eventMode = 'passive';

        //good label
        let good_label = new PIXI.Text("NN", {
            fontFamily: 'Arial',
            fontSize: 40,
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2,
        });
        good_label.eventMode = 'passive'; 
        good_label.anchor.set(0.5,0);

        pixi_groves[i].good_label = good_label;

        //add good to container
        grove_container.addChild(good_sprite);
        grove_container.addChild(good_label);

        pixi_container_main.addChild(pixi_groves[i].grove_container);
    }

    app.update_grove_inventory();
},

/**
 * update grove inventory
 */
update_grove_inventory()
{
    if(!app.session.world_state["started"]) return;
    
    for(const i in app.session.world_state.groves)
    {
        const grove = app.session.world_state.groves[i];

        let temp_value = 0;

        for(let j = 1; j <= grove.max_levels; j++)
        {
            if(grove.levels[j].harvested) break;

            temp_value = grove.levels[j].value;
        }

        pixi_groves[i].good_label.text = temp_value;
    }
},

/**
 * handle grove click
 */
subject_grove_click(grove_id)
{
    let grove = app.session.world_state.groves[grove_id];

    app.selected_grove.grove = grove;
    
    app.grove_modal.toggle();
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




