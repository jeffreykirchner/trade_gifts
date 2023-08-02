/**
 * setup field objects
 */
setup_pixi_fields()
{
    for(const i in app.session.parameter_set.parameter_set_fields_order)
    {

        const field_id = app.session.parameter_set.parameter_set_fields_order[i];
        const field = app.session.parameter_set.parameter_set_fields[field_id];

        pixi_fields[field_id] = {};
        
        let parameter_set_field_type = app.session.parameter_set.parameter_set_field_types[field.parameter_set_field_type];
        let parameter_set_player = app.session.parameter_set.parameter_set_players[field.parameter_set_player];

        let field_container = new PIXI.Container();
        field_container.eventMode = 'passive';
        // field_container.zIndex = 0;
        
        field_container.position.set(field.x, field.y)

        //field background
        let field_sprite = PIXI.Sprite.from(app.pixi_textures["field_tex"]);
        field_sprite.anchor.set(0.5);
        field_sprite.eventMode = 'passive';
        field_sprite.tint = app.field_color;

        //owner label
        let owner_label = new PIXI.Text("Owner: " + parameter_set_player.id_label, {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 'black',
        });
        owner_label.eventMode = 'passive'; 
        owner_label.anchor.set(0.5, 0);

        //info label       
        let info_label = new PIXI.Text(parameter_set_field_type.display_text, {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 'black',
        });
        info_label.eventMode = 'passive'; 
        info_label.anchor.set(.5, 1);

        //good one        
        let good_one_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_field_type.good_one+"_tex"]);
        good_one_sprite.anchor.set(1, 0.5);
        good_one_sprite.eventMode = 'passive';

        let good_one_label = new PIXI.Text("000", {
            fontFamily: 'Arial',
            fontSize: 60,
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2,
        });
        good_one_label.eventMode = 'passive'; 
        good_one_label.anchor.set(0, 0.5);

        let good_one_effort_label = new PIXI.Text("00 Effort Pts", {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 'black',
        });
        good_one_effort_label.eventMode = 'passive'; 
        good_one_effort_label.anchor.set(0.5, 1);

        //good two        
        let good_two_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_field_type.good_two+"_tex"]);
        good_two_sprite.anchor.set(1, 0.5);
        good_two_sprite.eventMode = 'passive';

        let good_two_label = new PIXI.Text("000", {
            fontFamily: 'Arial',
            fontSize: 60,
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2,
        });
        good_two_label.eventMode = 'passive'; 
        good_two_label.anchor.set(0, 0.5);

        let good_two_effort_label = new PIXI.Text("00 Effort Pts", {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 'black',
        });
        good_two_effort_label.eventMode = 'passive'; 
        good_two_effort_label.anchor.set(0.5, 0);

        //add to container
        field_container.addChild(field_sprite);
        field_container.addChild(owner_label);
        field_container.addChild(info_label);

        field_container.addChild(good_one_sprite);
        field_container.addChild(good_one_label);
        field_container.addChild(good_one_effort_label);

        field_container.addChild(good_two_sprite);
        field_container.addChild(good_two_label);
        field_container.addChild(good_two_effort_label);

        //positions
        owner_label.position.set(0,  -field_sprite.height/2 + 10);
        info_label.position.set(0, field_sprite.height/2 - 10);

        good_one_sprite.position.set(-20, -field_sprite.height/4);
        good_one_label.position.set(0, -field_sprite.height/4);
        good_one_effort_label.position.set(0, -5);

        good_two_sprite.position.set(-20, +field_sprite.height/4);
        good_two_label.position.set(0, +field_sprite.height/4);
        good_two_effort_label.position.set(0, +5);

        //add to pixi_fields
        pixi_fields[field_id].field_container = field_container;
        pixi_fields[field_id].owner_label = owner_label;
        pixi_fields[field_id][parameter_set_field_type.good_one] = good_one_label;
        pixi_fields[field_id][parameter_set_field_type.good_two] = good_two_label;
        pixi_fields[field_id].good_one_effort_label = good_one_effort_label;
        pixi_fields[field_id].good_two_effort_label = good_two_effort_label;

        pixi_fields[field_id].field_container.width = app.session.parameter_set.field_width;
        pixi_fields[field_id].field_container.height = app.session.parameter_set.field_height;

        pixi_container_main.addChild(pixi_fields[field_id].field_container);
    }

    app.update_field_inventory();
},

/**
 * update field inventory
 */
update_field_inventory()
{
    if(!app.session.world_state["started"]) return;
    
    for(const i in app.session.parameter_set.parameter_set_fields_order)
    {
        const field_id = app.session.parameter_set.parameter_set_fields_order[i];
        const parameter_set_field = app.session.parameter_set.parameter_set_fields[field_id];
        const parameter_set_field_type = app.session.parameter_set.parameter_set_field_types[parameter_set_field.parameter_set_field_type];
        const field = app.session.world_state["fields"][field_id];

        pixi_fields[field_id][parameter_set_field_type.good_one].text = field[parameter_set_field_type.good_one];
        pixi_fields[field_id][parameter_set_field_type.good_two].text = field[parameter_set_field_type.good_two];

        pixi_fields[field_id].good_one_effort_label.text = field.good_one_effort + " Effort Pts";
        pixi_fields[field_id].good_two_effort_label.text = field.good_two_effort + " Effort Pts";
    }
},

/**
 * handle field click
 */
subject_field_click(field_id)
{
    // console.log("subject field click", field_id);
    app.selected_field.field = app.session.world_state.fields[field_id];
    app.selected_field.field_type = app.session.parameter_set.parameter_set_field_types[app.selected_field.field.parameter_set_field_type];
    app.selected_field.good_one_harvest = 0;
    app.selected_field.good_two_harvest = 0;

    app.clear_main_form_errors();
    app.field_modal.toggle();

    let total_effort = app.session.parameter_set.production_effort;

    if(app.selected_field.field.good_one_effort > total_effort/2)
    {
        app.selected_field.effort_slider = -(app.selected_field.field.good_one_effort - total_effort/2);
    }
    else if(app.selected_field.field.good_two_effort > total_effort/2)
    {
        app.selected_field.effort_slider = app.selected_field.field.good_two_effort - total_effort/2;
    }
    else
    {
        app.selected_field.effort_slider = 0;
    }
    
    app.update_effort_slider();
},

/**
 * handle update to effort slider
 */
update_effort_slider()
{
    let total_effort = app.session.parameter_set.production_effort;
    let effort_slider = parseInt(app.selected_field.effort_slider);

    if(effort_slider < 0){

        app.selected_field.good_one_production_effort = Math.abs(effort_slider) + total_effort/2;
        app.selected_field.good_two_production_effort = total_effort - app.selected_field.good_one_production_effort;

    }else if(effort_slider > 0){

        app.selected_field.good_two_production_effort = effort_slider + total_effort/2;
        app.selected_field.good_one_production_effort = total_effort - app.selected_field.good_two_production_effort;
    }else{
        effort_slider = 0;
        app.selected_field.good_one_production_effort = total_effort/2;
        app.selected_field.good_two_production_effort = total_effort/2;
    }
},

/**
 * send harvest field requst
 */
send_field_harvest()
{
    if(!app.session.world_state["started"]) return;
    if(!app.selected_field.field) return;

    app.clear_main_form_errors();

    let field = app.session.world_state.fields[app.selected_field.field.id];
    let field_type = app.session.parameter_set.parameter_set_field_types[field.parameter_set_field_type];

    if(app.selected_field.good_one_harvest <= 0 && app.selected_field.good_two_harvest <= 0)
    {
        app.display_errors({good_one_harvest: ["Invalid Amount"], good_two_harvest: ["Invalid Amount"]});
        return;
    }

    if(app.selected_field.good_one_harvest > field[field_type.good_one] || app.selected_field.good_one_harvest < 0)
    {
        app.display_errors({good_one_harvest: ["Invalid Amount"]});
        return;
    }

    if(app.selected_field.good_two_harvest > field[field_type.good_two] || app.selected_field.good_two_harvest < 0)
    {
        app.display_errors({good_two_harvest: ["Invalid Amount"]})
        return;
    }

    app.send_message("field_harvest", 
                     {"field_id" : app.selected_field.field.id,
                      "good_one_harvest" : app.selected_field.good_one_harvest,
                      "good_two_harvest" : app.selected_field.good_two_harvest},
                      "group");
},

/**
 * take field harvest response
*/

take_field_harvest(message_data)
{

    if(message_data.status == "success")
    {
        avatar = app.session.world_state.avatars[message_data.avatar.id];
        field = app.session.world_state.fields[message_data.field.id];

        good_one_harvest = message_data.good_one_harvest;
        good_two_harvest = message_data.good_two_harvest;

        field_type = app.session.parameter_set.parameter_set_field_types[field.parameter_set_field_type];

        field[field_type.good_one] = message_data.field[field_type.good_one];
        field[field_type.good_two] = message_data.field[field_type.good_two];

        avatar[field_type.good_one] = message_data.avatar[field_type.good_one];
        avatar[field_type.good_two] = message_data.avatar[field_type.good_two];

        app.update_field_inventory();
        app.update_avatar_inventory();

        elements = [];
        if(good_one_harvest > 0)
        {
            element = {source_change:"-" + good_one_harvest,
                       target_change:"+" + good_one_harvest, 
                       texture:app.pixi_textures[field_type.good_one+"_tex"]  }
            elements.push(element);
        }

        if(good_two_harvest > 0)
        {
            element = {source_change:"-" + good_two_harvest,
                       target_change:"+" + good_two_harvest,
                       texture:app.pixi_textures[field_type.good_two+"_tex"]  }
            elements.push(element);
        }

        app.add_transfer_beam(field, 
            app.session.world_state_avatars.session_players[message_data.avatar.id].current_location,
            elements);
        
        if(message_data.avatar.id == app.session_player.id)
        {
            app.field_modal.toggle();
        }
    }
    else
    {

    }
},

/**
 * send field effort update
 */
send_field_effort()
{

    app.send_message("field_effort", 
                     {"field_id" : app.selected_field.field.id,
                      "good_one_effort" : app.selected_field.good_one_production_effort,
                      "good_two_effort" : app.selected_field.good_two_production_effort},
                      "group");
},

/**
 * take field effort update
 */
take_field_effort(message_data)
{
    field = app.session.world_state.fields[message_data.field.id];

    field.good_one_effort = message_data.good_one_effort;
    field.good_two_effort = message_data.good_two_effort;

    app.update_field_inventory();
},




