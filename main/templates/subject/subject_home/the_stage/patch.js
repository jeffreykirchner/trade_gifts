/**
 * setup patch objects
 */
setup_pixi_patches()
{
    let patch_size = 150;
    let ring_size = 50;

    //destory old patches
    for(i in pixi_patches)
    {
        if("patch_container" in pixi_patches[i])
        {
            pixi_patches[i].patch_container.destroy();
        }
    }

    //find max patch size
    let max_patch_size = 0;
    for(const i in app.session.parameter_set.parameter_set_patches_order)
    {
        const patch_id = app.session.parameter_set.parameter_set_patches_order[i];
        const patch = app.session.parameter_set.parameter_set_patches[patch_id];

        let temp_size = 0;
        for(j in patch.levels)
        {
            temp_size ++;
        }

        if(temp_size > max_patch_size)
        {
            max_patch_size = temp_size;
        }
    }
    
    for(const i in app.session.world_state.patches)
    {

        const parameter_set_patch = app.session.parameter_set.parameter_set_patches[i];
        const patch = app.session.world_state.patches[i];

        pixi_patches[i] = {};

        let patch_container = new PIXI.Container();
        patch_container.eventMode = 'passive';
        patch_container.zIndex = 80;
        
        patch_container.position.set(parameter_set_patch.x, parameter_set_patch.y);
        patch_container.zIndex = 80;
        pixi_patches[i].patch_container = patch_container;

        //draw patch as a circle
        let temp_size = patch_size;
        let patch_level_count = 0;

        for(let j = 1; j <= patch.max_levels; j++)
        {
            let patch_level = patch.levels[j];

            //value of level
            let good_label = new PIXI.Text(patch_level.value, {
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
            let patch_circle = new PIXI.Graphics();
            patch_circle.beginFill(patch.hex_color);
            patch_circle.lineStyle(2, "black");
            patch_circle.drawCircle(0, 0, temp_size/2);
            patch_circle.endFill();
            patch_circle.alpha = 1/max_patch_size;
            patch_circle.eventMode = 'passive';

            //level after harvest
            let patch_circle_outline = new PIXI.Graphics();
            patch_circle_outline.beginFill("white");
            patch_circle_outline.lineStyle(2, "black");
            patch_circle_outline.drawCircle(0, 0, temp_size/2);
            patch_circle_outline.endFill();
            patch_circle_outline.eventMode = 'passive';
            patch_circle_outline.alpha = 1/max_patch_size;
            patch_circle_outline.visible = false;
            
            pixi_patches[i]["patch_circles_"+j] = patch_circle;
            pixi_patches[i]["patch_circles_outline"+j] = patch_circle_outline;

            patch_container.addChildAt(good_label, 0);
            patch_container.addChildAt(patch_circle, 0);
            patch_container.addChildAt(patch_circle_outline, 0);

            temp_size += ring_size;
        }

        patch.radius = (temp_size-ring_size)/2;

        //add base circle
        temp_size -= ring_size;
        let patch_base = new PIXI.Graphics();
        patch_base.beginFill("lightgrey");
        //add line style
        patch_base.drawCircle(0, 0, temp_size/2);
        patch_base.endFill();
        patch_base.eventMode = 'passive';

        patch_container.addChildAt(patch_base, 0);

        //good        
        let good_sprite = PIXI.Sprite.from(app.pixi_textures[patch.good +"_tex"]);
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

        pixi_patches[i].good_label = good_label;

        //add good to container
        patch_container.addChild(good_sprite);
        patch_container.addChild(good_label);

        pixi_container_main.addChild(pixi_patches[i].patch_container);
    }

    app.update_patch_inventory();
},

/**
 * update patch inventory
 */
update_patch_inventory()
{
    if(!app.session.world_state["started"]) return;
    
    for(const i in app.session.world_state.patches)
    {
        const patch = app.session.world_state.patches[i];

        let temp_value = 0;

        //find next harvestable level
        for(let j = 1; j <= patch.max_levels; j++)
        {
            if(patch.levels[j].harvested) break;
            temp_value = patch.levels[j].value;
        }

        //hide level if harvests
        for(let j = 1; j <= patch.max_levels; j++)
        {
            if(patch.levels[j].harvested)
            {
                pixi_patches[i]["patch_circles_"+j].visible = false;
                pixi_patches[i]["patch_circles_outline"+j].visible = true;
            }
            else
            {
                pixi_patches[i]["patch_circles_"+j].visible = true;
                pixi_patches[i]["patch_circles_outline"+j].visible = false;
            }
        }

        pixi_patches[i].good_label.text = temp_value;
    }
},

/**
 * handle patch click
 */
subject_patch_click(patch_id)
{
    let patch = app.session.world_state.patches[patch_id];

    app.selected_patch.harvest_amount=0;
    for(i=1;i<=patch.max_levels;i++)
    {
        if(patch.levels[i].harvested) break;
        app.selected_patch.harvest_amount = patch.levels[i].value;
    }

    app.selected_patch.patch = patch;
    
    app.patch_modal.show();
    app.patch_modal_open = true;
},

/**
 * handle patch modal hide
 */
hide_patch_modal()
{
    app.selected_patch.patch = null;
    app.selected_patch.patch_type = null;
    app.patch_modal_open = false;
},

/**
 * send harvest patch requst
 */
send_patch_harvest()
{
    if(!app.session.world_state["started"]) return;
    if(!app.selected_patch.patch) return;

    app.clear_main_form_errors();

    let patch = app.session.world_state.patches[app.selected_patch.patch.id];
    
    let failed = true;
    for(let i=1;i<=patch.max_levels;i++)
    {
        if(!patch.levels[i].harvested) failed = false;
    }

    if(failed)
    {
        app.display_errors({patch_harvest: ["The patch is empty."]});
        return;
    };

    app.send_message("patch_harvest", 
                     {"patch_id" : app.selected_patch.patch.id},
                      "group");
},

/**
 * take patch harvest response
*/

take_patch_harvest(message_data)
{

    if(message_data.status == "success")
    {
        let patch_id = message_data.patch_id;
        let player_id = message_data.player_id;
        let harvest_amount = message_data.harvest_amount;
        app.session.world_state.patches[patch_id].levels = message_data.patch.levels;
        let patch = app.session.world_state.patches[patch_id];

        avatar = app.session.world_state.avatars[player_id];
        avatar[patch.good] = message_data.avatar[patch.good];
        avatar.period_patch_harvests = message_data.avatar.period_patch_harvests;

        app.update_avatar_inventory();
        app.update_patch_inventory();

        elements = [];
        if(harvest_amount > 0)
        {
            element = {source_change:"-" + harvest_amount,
                       target_change:"+" + harvest_amount, 
                       texture:app.pixi_textures[patch.good +"_tex"]  }
            elements.push(element);
        }

        app.add_transfer_beam(patch, 
            app.session.world_state_avatars.session_players[player_id].current_location,
            elements);
        
        if(app.is_subject && player_id == app.session_player.id)
        {
            app.patch_modal.hide();
        }
    }
    else
    {

    }
},



