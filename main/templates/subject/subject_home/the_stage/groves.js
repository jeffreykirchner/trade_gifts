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
        if("grove_container" in pixi_groves[i])
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

        const parameter_set_grove = app.session.parameter_set.parameter_set_groves[i];
        const grove = app.session.world_state.groves[i];

        pixi_groves[i] = {};

        let grove_container = new PIXI.Container();
        grove_container.eventMode = 'passive';
        grove_container.zIndex = 80;
        
        grove_container.position.set(parameter_set_grove.x, parameter_set_grove.y);
        grove_container.zIndex = 80;
        pixi_groves[i].grove_container = grove_container;

        //draw grove as a circle
        let temp_size = grove_size;
        let grove_level_count = 0;

        for(let j = 1; j <= grove.max_levels; j++)
        {
            let grove_level = grove.levels[j];

            //value of level
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

            //level before harvest           
            let grove_circle = new PIXI.Graphics();
            grove_circle.beginFill(grove.hex_color);
            grove_circle.lineStyle(2, "black");
            grove_circle.drawCircle(0, 0, temp_size/2);
            grove_circle.endFill();
            grove_circle.alpha = 1/max_grove_size;
            grove_circle.eventMode = 'passive';

            //level after harvest
            let grove_circle_outline = new PIXI.Graphics();
            grove_circle_outline.beginFill("white");
            grove_circle_outline.lineStyle(2, "black");
            grove_circle_outline.drawCircle(0, 0, temp_size/2);
            grove_circle_outline.endFill();
            grove_circle_outline.eventMode = 'passive';
            grove_circle_outline.alpha = 1/max_grove_size;
            grove_circle_outline.visible = false;
            
            pixi_groves[i]["grove_circles_"+j] = grove_circle;
            pixi_groves[i]["grove_circles_outline"+j] = grove_circle_outline;

            grove_container.addChildAt(good_label, 0);
            grove_container.addChildAt(grove_circle, 0);
            grove_container.addChildAt(grove_circle_outline, 0);

            temp_size += ring_size;
        }

        grove.radius = (temp_size-ring_size)/2;

        //add base circle
        temp_size -= ring_size;
        let grove_base = new PIXI.Graphics();
        grove_base.beginFill("lightgrey");
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

        //find next harvestable level
        for(let j = 1; j <= grove.max_levels; j++)
        {
            if(grove.levels[j].harvested) break;
            temp_value = grove.levels[j].value;
        }

        //hide level if harvests
        for(let j = 1; j <= grove.max_levels; j++)
        {
            if(grove.levels[j].harvested)
            {
                pixi_groves[i]["grove_circles_"+j].visible = false;
                pixi_groves[i]["grove_circles_outline"+j].visible = true;
            }
            else
            {
                pixi_groves[i]["grove_circles_"+j].visible = true;
                pixi_groves[i]["grove_circles_outline"+j].visible = false;
            }
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

    app.selected_grove.harvest_amount=0;
    for(i=1;i<=grove.max_levels;i++)
    {
        if(grove.levels[i].harvested) break;
        app.selected_grove.harvest_amount = grove.levels[i].value;
    }

    app.selected_grove.grove = grove;
    
    app.grove_modal.show();
    app.grove_modal_open = true;
},

/**
 * handle grove modal hide
 */
hide_grove_modal()
{
    app.selected_grove.grove = null;
    app.selected_grove.grove_type = null;
    app.grove_modal_open = false;
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
    
    let failed = true;
    for(let i=1;i<=grove.max_levels;i++)
    {
        if(!grove.levels[i].harvested) failed = false;
    }

    if(failed)
    {
        app.display_errors({grove_harvest: ["The grove is empty."]});
        return;
    };

    app.send_message("grove_harvest", 
                     {"grove_id" : app.selected_grove.grove.id},
                      "group");
},

/**
 * take grove harvest response
*/

take_grove_harvest(message_data)
{

    if(message_data.status == "success")
    {
        let grove_id = message_data.grove_id;
        let player_id = message_data.player_id;
        let harvest_amount = message_data.harvest_amount;
        app.session.world_state.groves[grove_id].levels = message_data.grove.levels;
        let grove = app.session.world_state.groves[grove_id];

        avatar = app.session.world_state.avatars[player_id];
        avatar[grove.good] = message_data.avatar[grove.good];
        avatar.period_grove_harvests = message_data.avatar.period_grove_harvests;

        app.update_avatar_inventory();
        app.update_grove_inventory();

        elements = [];
        if(harvest_amount > 0)
        {
            element = {source_change:"-" + harvest_amount,
                       target_change:"+" + harvest_amount, 
                       texture:app.pixi_textures[grove.good +"_tex"]  }
            elements.push(element);
        }

        app.add_transfer_beam(grove, 
            app.session.world_state_avatars.session_players[player_id].current_location,
            elements);
        
        if(app.is_subject && player_id == app.session_player.id)
        {
            app.grove_modal.hide();
        }
    }
    else
    {

    }
},



