/**
 * setup the pixi components for each subject
 */
setup_pixi_subjects: function setup_pixi_subjects()
{

    if(!app.session) return;
    if(!app.session.started) return;
    
    let current_z_index = 1000;
    
    for(const i in app.session.world_state_avatars.session_players)
    {      
        let subject = app.session.world_state_avatars.session_players[i];
        let avatar = app.session.world_state.avatars[i];
        let parameter_set_player = app.session.parameter_set.parameter_set_players[subject.parameter_set_player_id];
        pixi_avatars[i] = {};

        //avatar
        let avatar_container = new PIXI.Container();
        avatar_container.position.set(subject.current_location.x, subject.current_location.y);
        avatar_container.height = 250;
        avatar_container.width = 250;
        avatar_container.eventMode = 'passive';
        avatar_container.name = {player_id : i};
        avatar_container.zIndex=200;
        // avatar_container.on("pointerup", app.subject_avatar_click);

        //gear
        let gear_sprite = new PIXI.AnimatedSprite(app.pixi_textures.sprite_sheet.animations['walk']);
        gear_sprite.animationSpeed = app.animation_speed;
        gear_sprite.anchor.set(0.5)
        gear_sprite.tint = parameter_set_player.hex_color;
        gear_sprite.eventMode = 'passive';    

        //face neutral
        let face_sprite = PIXI.Sprite.from(app.pixi_textures.sprite_sheet_2.textures["face_1.png"]);
        face_sprite.anchor.set(0.5);
        face_sprite.eventMode = 'passive';

        //face sleep
        let face_sleep_sprite = PIXI.Sprite.from(app.pixi_textures["face_sleep_tex"]);
        face_sleep_sprite.anchor.set(0.5);
        face_sleep_sprite.eventMode = 'passive';
        face_sleep_sprite.visible = false;

        let text_style = {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 'black',
            // align: 'left',
            // stroke: 'black',
            strokeThickness: 1,
        };

        let text_style_2 = {
            fontFamily: 'Arial',
            fontSize: 40,
            fill: 'white',
            // align: 'left',
            stroke: 'black',
            strokeThickness: 3,
        };

        //id label
        let id_label = new PIXI.Text(parameter_set_player.id_label, text_style);
        id_label.eventMode = 'passive';
        id_label.anchor.set(0.5);

        //status label
        let status_label = new PIXI.Text("Working ... 10", text_style);
        status_label.eventMode = 'passive';
        status_label.anchor.set(0.5);
        status_label.visible = false;

        //hat
        
        let hat_sprite = null;
        if(avatar.parameter_set_hat_id)
        {
            let hat_texture = app.session.parameter_set.parameter_set_hats[avatar.parameter_set_hat_id].texture;
            hat_sprite = PIXI.Sprite.from(app.pixi_textures[hat_texture]);
            hat_sprite.anchor.set(0.5);
            hat_sprite.eventMode = 'passive';
        }

        //good one
        let good_one_container = new PIXI.Container();
        good_one_container.eventMode = 'passive';
        good_one_container.alpha = 0.75;
        let good_one_label = new PIXI.Text("000", text_style_2);
        good_one_label.eventMode = 'passive';
        good_one_label.anchor.set(0, 0.5);

        let good_one_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_player.good_one+"_tex"]);
        good_one_sprite.anchor.set(1, 0.5);
        good_one_sprite.eventMode = 'passive';

        good_one_container.addChild(good_one_label);
        good_one_container.addChild(good_one_sprite);
        good_one_label.position.set(+5,0);
        good_one_sprite.position.set(-5,0);

        //good two
        let good_two_container = new PIXI.Container();
        good_two_container.eventMode = 'passive';
        good_two_container.alpha = 0.75;
        let good_two_label = new PIXI.Text("000", text_style_2);
        good_two_label.eventMode = 'passive';
        good_two_label.anchor.set(0, 0.5);

        let good_two_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_player.good_two+"_tex"]);
        good_two_sprite.anchor.set(1, 0.5);
        good_two_sprite.eventMode = 'passive';

        good_two_container.addChild(good_two_label);
        good_two_container.addChild(good_two_sprite);
        good_two_label.position.set(+5,0);
        good_two_sprite.position.set(-5,0);

        //good three
        if(app.session.parameter_set.good_mode == "Three")
        {
            var good_three_container = new PIXI.Container();
            good_three_container.eventMode = 'passive';
            good_three_container.alpha = 0.75;
            var good_three_label = new PIXI.Text("000", text_style_2);
            good_three_label.eventMode = 'passive';
            good_three_label.anchor.set(0, 0.5);

            var good_three_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_player.good_three+"_tex"]);
            good_three_sprite.anchor.set(1, 0.5);
            good_three_sprite.eventMode = 'passive';

            good_three_container.addChild(good_three_label);
            good_three_container.addChild(good_three_sprite);
            good_three_label.position.set(+5,0);
            good_three_sprite.position.set(-5,0);
            good_three_sprite.pivot.set(0.5,0.5);
        }

        //health
        let health_container = new PIXI.Container();
        health_container.eventMode = 'passive';
        health_container.alpha = 0.75;
        let health_label = new PIXI.Text("000", text_style_2);
        health_label.eventMode = 'passive';
        health_label.anchor.set(0, 0.5);

        let health_sprite = PIXI.Sprite.from(app.pixi_textures["health_tex"]);
        health_sprite.anchor.set(1, 0.5);
        health_sprite.eventMode = 'passive';

        health_container.addChild(health_label);
        health_container.addChild(health_sprite);

        health_label.position.set(-3,0);
        health_sprite.position.set(3,0);

        //add to container
        avatar_container.addChild(gear_sprite);
        avatar_container.addChild(face_sprite);
        avatar_container.addChild(face_sleep_sprite);
        avatar_container.addChild(id_label);
        avatar_container.addChild(status_label);
        if(hat_sprite) avatar_container.addChild(hat_sprite);

        avatar_container.addChild(good_one_container);
        avatar_container.addChild(good_two_container);

        if(app.session.parameter_set.good_mode == "Three") avatar_container.addChild(good_three_container);

        avatar_container.addChild(health_container);
        
        //position in container
        face_sprite.position.set(0, -gear_sprite.height * 0.03);
        id_label.position.set(0, gear_sprite.height * 0.15);
        status_label.position.set(0, +gear_sprite.height/2-30);
        if(hat_sprite) hat_sprite.position.set(0, -gear_sprite.height *.27);

        if(app.session.parameter_set.good_mode == "Three")
        {
            good_one_container.position.set(-gear_sprite.width/2-5+25, -gear_sprite.height/2 - 30);
            good_two_container.position.set(0+25, -gear_sprite.height/2 - 15);
            good_three_container.position.set(gear_sprite.width/2+5+25, -gear_sprite.height/2 - 30);
        }
        else
        {
            good_one_container.position.set(-50, -gear_sprite.height/2 - 30);
            good_two_container.position.set(+110, -gear_sprite.height/2 - 30);
        }

        health_container.position.set(10, -gear_sprite.height/2 - 125);

        pixi_avatars[i].status_label = status_label;
        pixi_avatars[i].gear_sprite = gear_sprite;
        pixi_avatars[i][parameter_set_player.good_one] = good_one_label;
        pixi_avatars[i][parameter_set_player.good_two] = good_two_label;
        if(app.session.parameter_set.good_mode == "Three") pixi_avatars[i][parameter_set_player.good_three] = good_three_label;
        pixi_avatars[i].health_label = health_label;
        pixi_avatars[i].face_sprite = face_sprite;
        pixi_avatars[i].face_sleep_sprite = face_sleep_sprite;
        if(hat_sprite) pixi_avatars[i].hat_sprite = hat_sprite;


        avatar_container.scale.set(app.session.parameter_set.avatar_scale);

        //bounding box with avatar scaller        
        let bounding_box = new PIXI.Graphics();
    
        bounding_box.lineStyle(2, "orchid");
        //bounding_box.beginFill(0xBDB76B);
        bounding_box.drawRect(0, 0, avatar_container.width * app.session.parameter_set.avatar_bound_box_percent * app.session.parameter_set.avatar_scale, 
                                    avatar_container.height * app.session.parameter_set.avatar_bound_box_percent * app.session.parameter_set.avatar_scale);
        bounding_box.endFill();
        bounding_box.pivot.set(bounding_box.width/2, bounding_box.height/2);
        bounding_box.position.set(0, 0);
        bounding_box.visible = false;

        avatar_container.addChild(bounding_box);
        pixi_avatars[i].bounding_box = bounding_box;

        //bound box view
        let bounding_box_view = new PIXI.Graphics();
    
        bounding_box_view.lineStyle(2, "orchid");
        //bounding_box.beginFill(0xBDB76B);
        bounding_box_view.drawRect(0, 0, avatar_container.width * app.session.parameter_set.avatar_bound_box_percent, 
                                    avatar_container.height * app.session.parameter_set.avatar_bound_box_percent);
        bounding_box_view.endFill();
        bounding_box_view.pivot.set(bounding_box_view.width/2, bounding_box_view.height/2);
        bounding_box_view.position.set(0, 0);

        avatar_container.addChild(bounding_box_view);
        
        if(!app.draw_bounding_boxes)
        {
            bounding_box_view.visible = false;
        }

        pixi_avatars[i].avatar_container = avatar_container;
        pixi_container_main.addChild(pixi_avatars[i].avatar_container);

        //chat
        let chat_container = new PIXI.Container();
        chat_container.position.set(subject.current_location.x, subject.current_location.y);
        //chat_container.visible = true;
        
        let chat_bubble_sprite = PIXI.Sprite.from(app.pixi_textures.sprite_sheet_2.textures["chat_bubble.png"]);
        chat_bubble_sprite.anchor.set(0.5);
        chat_bubble_sprite.eventMode = 'none';

        let chat_bubble_text = new PIXI.Text('', {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x000000,
                align: 'left',
            });
        chat_bubble_text.eventMode = 'passive';    

        chat_container.addChild(chat_bubble_sprite);
        chat_container.addChild(chat_bubble_text);

        chat_bubble_text.position.set(-14 * app.session.parameter_set.avatar_scale, -chat_container.height*.09)
        chat_bubble_text.anchor.set(0.5);

        pixi_avatars[i].chat_container = chat_container;
        pixi_avatars[i].chat_container.zIndex = current_z_index++;

        subject.show_chat = false;
        subject.chat_time = null;

        pixi_container_main.addChild(pixi_avatars[i].chat_container);

        //tractor beam
        pixi_avatars[i].tractor_beam = [];
        subject.tractor_beam_target = null;

        for(let j=0; j<15; j++)
        {
            let tractor_beam_sprite = PIXI.Sprite.from(app.pixi_textures.sprite_sheet_2.textures["particle2.png"]);
            tractor_beam_sprite.anchor.set(0.5);
            tractor_beam_sprite.eventMode = 'passive';
            tractor_beam_sprite.visible = false;
            tractor_beam_sprite.zIndex = 1500;
            pixi_avatars[i].tractor_beam.push(tractor_beam_sprite);
            pixi_container_main.addChild(tractor_beam_sprite);
        }

        //interaction range
        let interaction_container = new PIXI.Container();
        interaction_container.position.set(subject.current_location.x, subject.current_location.y);

        let interaction_range = new PIXI.Graphics();
        let interaction_range_radius = app.session.parameter_set.interaction_range;

        interaction_range.lineStyle({width:1, color:"dimgrey", alignment:0}); //parameter_set_player.hex_color
        interaction_range.beginFill(0xFFFFFF,0);
        interaction_range.drawCircle(0, 0, interaction_range_radius);
        interaction_range.endFill();    
        interaction_range.zIndex = 100;

        interaction_container.addChild(interaction_range);
        pixi_avatars[i].interaction_container = interaction_container;
        pixi_container_main.addChild(pixi_avatars[i].interaction_container);

        if(app.pixi_mode != "subject")
        {
            //view range for server
            let view_container = new PIXI.Container();
            view_container.position.set(subject.current_location.x, subject.current_location.y);

            let view_range = new PIXI.Graphics();
            // view_range.lineStyle({width:2, color:parameter_set_player.hex_color, alignment:0});
            view_range.beginFill(parameter_set_player.hex_color,0.1);
            view_range.drawRect(0, 0, 1850, 800);
            view_range.endFill();    
            view_range.zIndex = 75;
            view_range.pivot.set(1850/2, 800/2);
            view_range.position.set(0, 0);

            view_container.addChild(view_range);
            pixi_avatars[i].view_container = view_container;
            pixi_container_main.addChild(pixi_avatars[i].view_container);
        }
    }

    //make local subject the top layer
    if(app.pixi_mode=="subject")
    {  
        pixi_avatars[app.session_player.id].avatar_container.zIndex = 999;
        pixi_avatars[app.session_player.id].chat_container.zIndex = current_z_index;
    }

    app.update_avatar_inventory();
},

/**
 * move players if target does not equal current location
 */
move_player: function move_player(delta)
{
    if(!app.session.world_state.started) return;

    //move players
    for(let i in app.session.world_state_avatars.session_players){

        let obj = app.session.world_state_avatars.session_players[i];
        let avatar = app.session.world_state.avatars[i];
        let avatar_container = pixi_avatars[i].avatar_container;
        let gear_sprite = pixi_avatars[i].gear_sprite;
        let status_label = pixi_avatars[i].status_label;

        if(obj.target_location.x !=  obj.current_location.x ||
            obj.target_location.y !=  obj.current_location.y )
        {           
            //move player towards target
            if(!obj.frozen)
            {
                app.move_avatar(delta,i);
            }

            //update the sprite locations
            gear_sprite.play();
            avatar_container.position.set(obj.current_location.x, obj.current_location.y);
            if (obj.current_location.x < obj.target_location.x )
            {
                gear_sprite.animationSpeed = app.animation_speed;
            }
            else
            {
                gear_sprite.animationSpeed = -app.animation_speed;
            }

            //hide chat if longer than 10 seconds and moving
            if(obj.chat_time)
            {
                if(Date.now() - obj.chat_time >= 10000)
                {
                    obj.show_chat = false;
                }
            }
        }
        else
        {
            gear_sprite.stop();
        }

        //update status
        if(obj.interaction > 0)
        {
            status_label.text = "Interaction ... " + obj.interaction;
            status_label.visible = true;
        }
        else if(avatar.sleeping)
        {
            status_label.text = "ZZZ ... ";
            status_label.visible = true;
        }
        else if(obj.cool_down > 0)
        {
            status_label.text = "Cooling ... " + obj.cool_down;
            status_label.visible = true;
        }
        else
        {
            status_label.visible = false;
        }

        //update face
        if(avatar.sleeping)
        {
            pixi_avatars[i].face_sprite.visible = false;
            pixi_avatars[i].face_sleep_sprite.visible = true;
            obj.show_chat = false;
        }
        else
        {
            pixi_avatars[i].face_sprite.visible = true;
            pixi_avatars[i].face_sleep_sprite.visible = false;
        }
    }

    //find nearest players
    for(let i in app.session.world_state_avatars.session_players)
    {
        let obj1 = app.session.world_state_avatars.session_players[i];
        obj1.nearest_player = null;
        obj1.nearest_player_distance = null;

        for(let j in app.session.world_state_avatars.session_players)
        {
            let obj2 = app.session.world_state_avatars.session_players[j];

            if(i != j)
            {
                temp_distance = app.get_distance(obj1.current_location, obj2.current_location);

                if(!obj1.nearest_player)
                {
                    obj1.nearest_player = j;
                    obj1.nearest_player_distance = temp_distance;
                }
                else
                {
                   if(temp_distance < obj1.nearest_player_distance)
                   {
                        obj1.nearest_player = j;
                        obj1.nearest_player_distance = temp_distance;
                   }
                }
            }
        }
    }

    //update chat boxes
    for(let i in app.session.world_state_avatars.session_players)
    {
        let obj = app.session.world_state_avatars.session_players[i];
        let chat_container = pixi_avatars[i].chat_container;
        // let avatar_container = obj.pixi.chat_container;
        let offset = {x:chat_container.width*.5, y:chat_container.height*.45};

        if(obj.nearest_player && 
           app.session.world_state_avatars.session_players[obj.nearest_player].current_location.x < obj.current_location.x)
        {
            chat_container.position.set(obj.current_location.x + offset.x,
                                        obj.current_location.y - offset.y);
            
            chat_container.getChildAt(0).scale.x = 1;
        }
        else
        {
            chat_container.position.set(obj.current_location.x - offset.x,
                                        obj.current_location.y - offset.y);

            chat_container.getChildAt(0).scale.x = -1;
        }

        chat_container.visible = obj.show_chat;
    }   

    //update tractor beams and status
    for(let i in app.session.world_state_avatars.session_players)
    {
        let player = app.session.world_state_avatars.session_players[i];

        if(player.tractor_beam_target)
        {
            app.setup_tractor_beam(i, player.tractor_beam_target);
        }
        else
        {
            for (let j=0; j< pixi_avatars[i].tractor_beam.length; j++)
            {
                tb_sprite = pixi_avatars[i].tractor_beam[j];
                tb_sprite.visible = false;
            }
        }
    }

    for(let i in app.session.world_state_avatars.session_players)
    {
        let obj = app.session.world_state_avatars.session_players[i];

        //update interaction ranges
        let interaction_container = pixi_avatars[i].interaction_container;
        interaction_container.position.set(obj.current_location.x, obj.current_location.y);

        //update view ranges on staff screen
        if(app.pixi_mode != "subject")
        {
            let view_container = pixi_avatars[i].view_container;
            view_container.position.set(obj.current_location.x, obj.current_location.y);
        }
    }
    
},

/**
 * destory pixi subject objects in world state
 */
destory_setup_pixi_subjects: function destory_setup_pixi_subjects()
{
    if(!app.session) return;

    for(const i in app.session.world_state_avatars.session_players){

        let pixi_objects = pixi_avatars[i];

        if(pixi_objects)
        {
            pixi_objects.avatar_container.destroy();
            pixi_objects.chat_container.destroy();
            pixi_objects.interaction_container.destroy();

            if(app.pixi_mode != "subject")
            {
                pixi_objects.view_container.destroy();
            }
        }
    }
},

/**
 * update avatar inventory
 */
update_avatar_inventory : function update_avatar_inventory()
{
    if(!app.session.world_state["started"]) return;
    
    //update goods
    for(const i in app.session.world_state.avatars)
    {
        const avatar = app.session.world_state.avatars[i];
        const parameter_set_player = app.session.parameter_set.parameter_set_players[avatar.parameter_set_player_id];

        pixi_avatars[i][parameter_set_player.good_one].text = avatar[parameter_set_player.good_one];
        pixi_avatars[i][parameter_set_player.good_two].text = avatar[parameter_set_player.good_two];

        if(app.session.parameter_set.good_mode == "Three") pixi_avatars[i][parameter_set_player.good_three].text = avatar[parameter_set_player.good_three];

        pixi_avatars[i].health_label.text = Number(avatar.health).toFixed(1);

        //update hats
        
        if(avatar.parameter_set_hat_id && app.session.parameter_set.enable_hats=="True")
        {
            let hat_texture = app.session.parameter_set.parameter_set_hats[avatar.parameter_set_hat_id].texture;
            pixi_avatars[i].hat_sprite.texture = app.pixi_textures[hat_texture];
        }
    }


},

/**
 * subject avatar click
 */
subject_avatar_click: function subject_avatar_click(target_player_id)
{
    if(target_player_id == app.session_player.id) return;

    // console.log("subject avatar click", target_player_id);

    app.selected_avatar.avatar = app.session.world_state.avatars[target_player_id];
    app.selected_avatar.target_player_id = target_player_id;
    app.selected_avatar.parameter_set_player = app.session.parameter_set.parameter_set_players[app.selected_avatar.avatar.parameter_set_player_id];

    app.selected_avatar.good_one_move = 0;
    app.selected_avatar.good_two_move = 0;
    app.selected_avatar.good_three_move = 0;

    app.selected_avatar.good_one = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_one;
    app.selected_avatar.good_two = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_two;
    app.selected_avatar.good_three = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_three;

    app.selected_avatar.good_one_available = app.session.world_state.avatars[app.session_player.id][app.selected_avatar.good_one];
    app.selected_avatar.good_two_available = app.session.world_state.avatars[app.session_player.id][app.selected_avatar.good_two];
    app.selected_avatar.good_three_available = app.session.world_state.avatars[app.session_player.id][app.selected_avatar.good_three];

    app.clear_main_form_errors();
    app.avatar_modal.show();
    app.avatar_modal_open = true;
},

/**
 * avatar modal is hidden
 */
hide_avatar_modal: function hide_avatar_modal()
{
    app.avatar_modal_open = false;
},

/**
 * send interaction to server
 */
send_move_fruit_to_avatar: function send_move_fruit_to_avatar()
{
    if(!app.session.world_state["started"]) return;
    if(!app.selected_avatar.avatar) return;

    app.clear_main_form_errors();

    let avatar = app.session.world_state.avatars[app.session_player.id];

    if(app.selected_avatar.good_one_move <= 0 && 
       app.selected_avatar.good_two_move <= 0 && 
       app.selected_avatar.good_three_move <= 0)
    {
        app.display_errors({good_one_move: ["Invalid Amount"], good_two_move: ["Invalid Amount"], good_three_move: ["Invalid Amount"]});
        return;
    }

    if(app.selected_avatar.good_one_move > avatar[app.selected_avatar.good_one])
    {
        app.display_errors({good_one_move: ["Invalid Amount"]});
        app.selected_avatar.good_one_available = avatar[app.selected_avatar.good_one];
        return;
    }

    if(app.selected_avatar.good_two_move > avatar[app.selected_avatar.good_two])
    {
        app.display_errors({good_two_move: ["Invalid Amount"]});
        app.selected_avatar.good_two_available = avatar[app.selected_avatar.good_two];
        return;
    }

    if(app.selected_avatar.good_three_move > avatar[app.selected_avatar.good_three])
    {
        app.display_errors({good_three_move: ["Invalid Amount"]});
        app.selected_avatar.good_three_available = avatar[app.selected_avatar.good_three];
        return;
    }

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.send_move_fruit_to_avatar_instructions();
    }
    else
    {
        app.working = true;
        app.send_message("move_fruit_to_avatar", 
                        {"good_one_move" : app.selected_avatar.good_one_move,
                        "good_two_move" : app.selected_avatar.good_two_move,
                        "good_three_move" : app.selected_avatar.good_three_move,
                        "target_player_id" : app.selected_avatar.target_player_id},
                        "group"); 
    }
},

/**
 * send fruit to avatar instructions
 */
send_move_fruit_to_avatar_instructions: function send_move_fruit_to_avatar_instructions()
{
    if(app.session_player.current_instruction != app.instructions.action_page_hats) return;

    // {
    //     "status": "success",
    //     "error_message": [],
    //     "source_player_id": 273,
    //     "target_player_id": "274",
    //     "source_player": {
    //         "Cherry": 0,
    //         "health": "76.50",
    //         "earnings": "102.6715000",
    //         "sleeping": false,
    //         "Blueberry": 0,
    //         "Pineapple": 0,
    //         "period_patch_harvests": 1,
    //         "parameter_set_player_id": 181
    //     },
    //     "target_player": {
    //         "Cherry": 8,
    //         "health": "66.60",
    //         "earnings": "101.2129000",
    //         "sleeping": false,
    //         "Blueberry": 0,
    //         "Pineapple": 0,
    //         "period_patch_harvests": 0,
    //         "parameter_set_player_id": 182
    //     },
    //     "good_one_move": 8,
    //     "good_two_move": 0,
    //     "good_three_move": 0,
    //     "goods": {
    //         "good_one": "Cherry",
    //         "good_two": "Blueberry"
    //     }
    // }

    let good_one = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_one;
    let good_two = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_two;
    let good_three = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_three;

    let message_data = {
        "status": "success",
        "error_message": [],
        "source_player_id": app.session_player.id,
        "target_player_id": app.selected_avatar.target_player_id,
        "source_player": app.session.world_state.avatars[app.session_player.id],
        "target_player": app.session.world_state.avatars[app.selected_avatar.target_player_id],
        "good_one_move": app.selected_avatar.good_one_move,
        "good_two_move": app.selected_avatar.good_two_move,
        "good_three_move": app.selected_avatar.good_three_move,
        "goods": {
            "good_one": good_one,
            "good_two": good_two,
            "good_three": good_three,
        }
    }

    message_data.source_player[good_one] -= app.selected_avatar.good_one_move;
    message_data.source_player[good_two] -= app.selected_avatar.good_two_move;
    message_data.source_player[good_three] -= app.selected_avatar.good_three_move;

    message_data.target_player[good_one] += app.selected_avatar.good_one_move;
    message_data.target_player[good_two] += app.selected_avatar.good_two_move;
    message_data.target_player[good_three] += app.selected_avatar.good_three_move;

    app.take_update_move_fruit_to_avatar(message_data);
},


/**
 * take update from server about moving fruit to avatar
 */
take_update_move_fruit_to_avatar: function take_update_move_fruit_to_avatar(message_data)
{
    if(message_data.status == "success")
    {
        source_player_id = message_data.source_player_id;
        target_player_id = message_data.target_player_id;

        app.session.world_state.avatars[source_player_id] = message_data.source_player;
        app.session.world_state.avatars[target_player_id] = message_data.target_player;

        good_one_move = message_data.good_one_move;
        good_two_move = message_data.good_two_move;
        good_three_move = message_data.good_three_move;

        good_one = app.session.parameter_set.parameter_set_players[message_data.source_player.parameter_set_player_id].good_one;
        good_two = app.session.parameter_set.parameter_set_players[message_data.source_player.parameter_set_player_id].good_two;
        good_three = app.session.parameter_set.parameter_set_players[message_data.source_player.parameter_set_player_id].good_three;

        app.update_avatar_inventory();

        let elements = [];
        if(good_one_move > 0)
        {
            element = {source_change:"-" + good_one_move,
                       target_change:"+" + good_one_move, 
                       texture:app.pixi_textures[good_one+"_tex"]  }
            elements.push(element);
        }

        if(good_two_move > 0)
        {
            element = {source_change:"-" + good_two_move,
                       target_change:"+" + good_two_move,
                       texture:app.pixi_textures[good_two+"_tex"]  }
            elements.push(element);
        }

        if(good_three_move > 0)
        {
            element = {source_change:"-" + good_three_move,
                       target_change:"+" + good_three_move,
                       texture:app.pixi_textures[good_three+"_tex"]  }
            elements.push(element);
        }

        app.add_transfer_beam(app.session.world_state_avatars.session_players[source_player_id].current_location, 
                              app.session.world_state_avatars.session_players[target_player_id].current_location,
            elements);
        
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.avatar_modal.hide();      
            app.selected_avatar.avatar = null;     
        }
    }
    else
    {

    }
},

/**
 * select all fruit to move to avatar
 */
select_all_fruit_avatar: function select_all_fruit_avatar()
{
    let avatar = app.session.world_state.avatars[app.session_player.id];

    app.selected_avatar.good_one_move = avatar[app.selected_avatar.good_one];
    app.selected_avatar.good_two_move = avatar[app.selected_avatar.good_two];
    app.selected_avatar.good_three_move = avatar[app.selected_avatar.good_three];

},

/**
 * show the attack avatar modal
*/
show_attack_avatar: function show_attack_avatar()
{
    app.clear_main_form_errors();
    app.avatar_modal.hide();
    app.avatar_attack_modal.show();
    app.avatar_attack_modal_open = true;
},

/**
 * avatar attack modal is hidden
 */
hide_avatar_attack_modal: function hide_avatar_attack_modal()
{
    app.avatar_attack_modal_open = false;
},

/**
 * send attack avatar to server
 */
send_attack_avatar: function send_attack_avatar()
{
    
    let target_avatar = app.session.world_state.avatars[app.selected_avatar.target_player_id];
    let source_player = app.session.world_state.avatars[app.session_player.id];

    if(Number(target_avatar.health) == 0)
    {
        app.display_errors({attack_avatar_button: ["Target player already has zero health."]});
        return;
    }

    if(Number(source_player.health) < app.session.parameter_set.attack_cost)
    {
        app.display_errors({attack_avatar_button: ["You do not have enough health to attack."]});
        return;
    }

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.send_attack_avatar_instructions();
    }
    else
    {
        app.working = true;
        
        app.send_message("attack_avatar", 
                        {"target_player_id" : app.selected_avatar.target_player_id},
                        "group"); 
    }
},

/**
 * send avatar attack instructions
 */
send_attack_avatar_instructions : function send_attack_avatar_instructions()
{
    if(app.session_player.current_instruction != app.instructions.action_page_attacks) return;
    app.session_player.current_instruction_complete = app.instructions.action_page_attacks;

    // {
    //     "status": "success",
    //     "error_message": [],
    //     "source_player_id": 273,
    //     "target_player_id": "274",
    //     "source_player": {
    //         "Cherry": 0,
    //         "health": "71.40",
    //         "earnings": "102.6715000",
    //         "sleeping": false,
    //         "Blueberry": 0,
    //         "Pineapple": 0,
    //         "period_patch_harvests": 1,
    //         "parameter_set_player_id": 181
    //     },
    //     "target_player": {
    //         "Cherry": 8,
    //         "health": "59.50",
    //         "earnings": "101.2129000",
    //         "sleeping": false,
    //         "Blueberry": 0,
    //         "Pineapple": 0,
    //         "period_patch_harvests": 0,
    //         "parameter_set_player_id": 182
    //     }
    // }

    let message_data = {
        "status": "success",
        "error_message": [],
        "source_player_id": app.session_player.id,
        "target_player_id": app.selected_avatar.target_player_id,
        "source_player": app.session.world_state.avatars[app.session_player.id],
        "target_player": app.session.world_state.avatars[app.selected_avatar.target_player_id],
    }

    message_data.source_player.health = parseFloat(message_data.source_player.health) - app.session.parameter_set.attack_cost;
    message_data.target_player.health = parseFloat(message_data.target_player.health) - app.session.parameter_set.attack_damage;

    app.take_update_attack_avatar(message_data);

},

/**
 * take update from server about attack avatar
*/
take_update_attack_avatar: function take_update_attack_avatar(message_data)
{
    if(message_data.status == "success")
    {
        source_player_id = message_data.source_player_id;
        target_player_id = message_data.target_player_id;

        app.session.world_state.avatars[source_player_id] = message_data.source_player;
        app.session.world_state.avatars[target_player_id] = message_data.target_player;

        app.session.world_state_avatars.session_players[source_player_id].cool_down = app.session.parameter_set.cool_down_length;
        app.session.world_state_avatars.session_players[target_player_id].cool_down = app.session.parameter_set.cool_down_length;

        app.update_avatar_inventory();

        if(app.is_subject)
        {
            if( source_player_id == app.session_player.id)
            {
                app.avatar_modal.hide();
                app.avatar_attack_modal.hide();
                app.selected_avatar.avatar = null;
            }

            //transfer beam
            let elements = [];

            let fist_texture = app.pixi_textures["fist_left_tex"];

            if(app.session.world_state_avatars.session_players[source_player_id].current_location.x < 
               app.session.world_state_avatars.session_players[target_player_id].current_location.x)
            {
                fist_texture = app.pixi_textures["fist_right_tex"];
            }
  
            let element = {source_change:"",
                           target_change:"", 
                           texture: fist_texture}

            elements.push(element);

            element = {source_change:"-" + app.session.parameter_set.attack_cost,
                           target_change:"-" + app.session.parameter_set.attack_damage, 
                           texture:app.pixi_textures["health_tex"]  }

            elements.push(element);
            
            app.add_transfer_beam(app.session.world_state_avatars.session_players[source_player_id].current_location, 
                                  app.session.world_state_avatars.session_players[target_player_id].current_location,
            elements);
        }

    }
    
},

/**
 * show the hat avatar modal
*/
show_hat_avatar: function show_hat_avatar()
{
    app.clear_main_form_errors();
    app.avatar_modal.hide();
    app.avatar_hat_modal.show();
    app.avatar_hat_modal_open = true;
},

/**
 * avatar hat modal is hidden
 */
hide_avatar_hat_modal: function hide_avatar_hat_modal()
{
    app.avatar_hat_modal_open = false;
    app.selected_avatar.avatar = null;
},

/**
 * send hat avatar to server
 */
send_hat_avatar: function send_hat_avatar()
{
    
    let target_avatar = app.session.world_state.avatars[app.selected_avatar.target_player_id];
    let source_player = app.session.world_state.avatars[app.session_player.id];


    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.send_hat_avatar_instructions();
    }
    else
    {
        app.working = true;
        // app.hat_trade_status = "proposal";
        
        app.send_message("hat_avatar", 
                        {"target_player_id" : app.selected_avatar.target_player_id,
                         "type":app.hat_trade_status,},
                        "group"); 
    }
},

/**
 * send avatar hat instructions
 */
send_hat_avatar_instructions: function send_hat_avatar_instructions()
{
    if(app.session_player.current_instruction != app.instructions.action_page_hats) return;
    app.session_player.current_instruction_complete = app.instructions.action_page_hats;

    app.take_update_hat_avatar(message_data);
},

/**
 * take update from server about hat avatar
*/
take_update_hat_avatar: function take_update_hat_avatar(message_data)
{
    if(message_data.status == "success")
    {
        type = message_data.type;

        source_player_id = parseInt(message_data.source_player_id);
        target_player_id = parseInt(message_data.target_player_id);
       

        if(type == "open")
        {
            if(app.is_subject)
            {
                if(target_player_id == app.session_player.id)
                {
                    app.selected_avatar.avatar = app.session.world_state.avatars[source_player_id];
                    app.selected_avatar.target_player_id = source_player_id;
                    app.selected_avatar.parameter_set_player = app.session.parameter_set.parameter_set_players[app.selected_avatar.avatar.parameter_set_player_id];
                    
                    app.selected_avatar.good_one = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_one;
                    app.selected_avatar.good_two = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_two;
                    app.selected_avatar.good_three = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_three;

                    app.hat_trade_status = "proposal_received";
                    app.avatar_hat_modal.show();
                    app.avatar_hat_modal_open = true;
                }
                else if(source_player_id == app.session_player.id)
                {
                    app.hat_trade_status = "proposal";
                    app.avatar_hat_modal_open = true;
                }
            }
        }
        else if(type == "cancel")
        {
            if(app.is_subject)
            {
                if(target_player_id == app.session_player.id)
                {
                    app.avatar_hat_modal.hide();
                }
            }
        }
        else if(type == "proposal_received")
        {
            if(app.is_subject)
            {
                if(target_player_id == app.session_player.id || source_player_id == app.session_player.id)
                {
                    app.avatar_hat_modal.hide();
                    app.hat_trade_status = "open";
                }
            }

            app.session.world_state.avatars[source_player_id.toString()].parameter_set_hat_id = message_data.source_player.parameter_set_hat_id;
            app.session.world_state.avatars[target_player_id.toString()].parameter_set_hat_id = message_data.target_player.parameter_set_hat_id;

            let target_player = app.session.world_state_avatars.session_players[target_player_id];
            let source_player = app.session.world_state_avatars.session_players[source_player_id];

            target_player.cool_down = app.session.parameter_set.cool_down_length;

            source_player.interaction = 0
            target_player.interaction = 0

            source_player.frozen = false
            target_player.frozen = false

            target_player.tractor_beam_target = null;
                
            app.update_avatar_inventory();

            let source_hat_texture = app.session.parameter_set.parameter_set_hats[message_data.source_player.parameter_set_hat_id].texture;
            let target_hat_texture = app.session.parameter_set.parameter_set_hats[message_data.target_player.parameter_set_hat_id].texture;

            //target -> source
            let elements = [];
            element = {source_change:"",
                       target_change:"", 
                       texture:app.pixi_textures[source_hat_texture]}

            elements.push(element);
            
            app.add_transfer_beam(target_player.current_location, 
                                  source_player.current_location,
                                  elements,
                                  show_source_emitter=false,
                                  show_target_emitter=true);
            
            //source -> target
            elements = [];
            element = {source_change:"",
                       target_change:"", 
                       texture:app.pixi_textures[target_hat_texture]}

            elements.push(element);
            
            app.add_transfer_beam(source_player.current_location, 
                                  target_player.current_location,
                                  elements,
                                  show_source_emitter=false,
                                  show_target_emitter=true);
        }

    }
},

send_hat_avatar_cancel: function send_hat_avatar_cancel()
{
    if(app.hat_trade_status=='open')
    {
        app.avatar_hat_modal.hide();
        return;
    }

    app.working = true;    
    app.send_message("hat_avatar_cancel", 
                        {"target_player_id" : app.selected_avatar.target_player_id,
                         "type":app.hat_trade_status,},
                        "group"); 
},

/**
 * take update from server about hat avatar
*/
take_update_hat_avatar_cancel: function take_update_hat_avatar_cancel(message_data)
{
    if(message_data.status == "success")
    {
        type = message_data.type;

        let source_player_id = parseInt(message_data.source_player_id);
        let target_player_id = parseInt(message_data.target_player_id);

        if(app.is_subject)
        {
            if(target_player_id == app.session_player.id || source_player_id == app.session_player.id)
            {
                if(app.avatar_hat_modal_open)
                {
                    let local_player = app.session.world_state_avatars.session_players[app.session_player.id];

                    app.avatar_hat_modal.hide();
                    app.hat_trade_status = "open";

                    app.add_text_emitters("Trade Rejected.", 
                        local_player.current_location.x, 
                        local_player.current_location.y,
                        local_player.current_location.x,
                        local_player.current_location.y-100,
                        0xFFFFFF,
                        28,
                        null);
                }
            }
        }

        let target_player = app.session.world_state_avatars.session_players[target_player_id];
        let source_player = app.session.world_state_avatars.session_players[source_player_id];

        
        source_player.cool_down = app.session.parameter_set.cool_down_length

        source_player.interaction = 0
        target_player.interaction = 0

        source_player.frozen = false
        target_player.frozen = false

        source_player.tractor_beam_target = null;

        // if(message_data.type == "proposal")
        // {
        //     app.session.world_state_avatars.session_players[source_player_id].cool_down = app.session.parameter_set.cool_down_length;
        // }   
        // else
        // {
            
        // }

        app.update_avatar_inventory();
        
    }

},

/**
 * avatar sleep emitters
 */
do_avatar_sleep_emitters: function do_avatar_sleep_emitters()
{
    for(let i in app.session.world_state.avatars)
    {
        let avatar = app.session.world_state.avatars[i];
        let session_player = app.session.world_state_avatars.session_players[i];

        if(avatar.sleeping && app.session.world_state.time_remaining <= app.session.parameter_set.night_length)
        {
            let health_sprite = PIXI.Sprite.from(app.pixi_textures["health_tex"]);
            health_sprite.scale.set(0.4);

            app.add_text_emitters("+" + parseFloat(app.session.parameter_set.heath_gain_per_sleep_second).toFixed(1) + " health from sleep.",
                                    session_player.current_location.x, 
                                    session_player.current_location.y,
                                    session_player.current_location.x,
                                    session_player.current_location.y - 100,
                                    0xFFFFFF,
                                    28,
                                    health_sprite);
        }
    }
},
