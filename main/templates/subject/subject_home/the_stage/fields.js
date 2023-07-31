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

        let good_one_seconds_label = new PIXI.Text("00 Effort Pts", {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 'black',
        });
        good_one_seconds_label.eventMode = 'passive'; 
        good_one_seconds_label.anchor.set(0.5, 1);

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

        let good_two_seconds_label = new PIXI.Text("00 Effort Pts", {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 'black',
        });
        good_two_seconds_label.eventMode = 'passive'; 
        good_two_seconds_label.anchor.set(0.5, 0);

        //add to container
        field_container.addChild(field_sprite);
        field_container.addChild(owner_label);
        field_container.addChild(info_label);

        field_container.addChild(good_one_sprite);
        field_container.addChild(good_one_label);
        field_container.addChild(good_one_seconds_label);

        field_container.addChild(good_two_sprite);
        field_container.addChild(good_two_label);
        field_container.addChild(good_two_seconds_label);

        //positions
        owner_label.position.set(0,  -field_sprite.height/2 + 10);
        info_label.position.set(0, field_sprite.height/2 - 10);

        good_one_sprite.position.set(-20, -field_sprite.height/4);
        good_one_label.position.set(0, -field_sprite.height/4);
        good_one_seconds_label.position.set(0, -5);

        good_two_sprite.position.set(-20, +field_sprite.height/4);
        good_two_label.position.set(0, +field_sprite.height/4);
        good_two_seconds_label.position.set(0, +5);

        //add to pixi_fields
        pixi_fields[field_id].field_container = field_container;
        pixi_fields[field_id].owner_label = owner_label;
        pixi_fields[field_id][parameter_set_field_type.good_one] = good_one_label;
        pixi_fields[field_id][parameter_set_field_type.good_two] = good_two_label;
        pixi_fields[field_id].good_one_seconds_label = good_one_seconds_label;
        pixi_fields[field_id].good_two_seconds_label = good_two_seconds_label;

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
        const field = app.session.parameter_set.parameter_set_fields[field_id];

        parameter_set_field_type = app.session.parameter_set.parameter_set_field_types[field.parameter_set_field_type];

        pixi_fields[field_id][parameter_set_field_type.good_one].text = app.session.world_state["fields"][field_id][parameter_set_field_type.good_one];
        pixi_fields[field_id][parameter_set_field_type.good_two].text = app.session.world_state["fields"][field_id][parameter_set_field_type.good_two];
    }
},

/**
 * send harvest field requst
 */
send_field_harvest()
{
    if(!app.session.world_state["started"]) return;
    if(!app.selected_field.field) return;

    app.send_message("field_harvest", 
                     {"selected_field" : app.selected_field},
                     "group");
},

/**
 * take field harvest response
*/

take_field_harvest(message_data)
{

},



