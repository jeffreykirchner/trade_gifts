{% load static %}

/**
 * update the pixi players with new info
 */
setup_pixi(){    
    app.reset_pixi_app();

    PIXI.Assets.add('sprite_sheet', '{% static "gear_3_animated.json" %}');
    PIXI.Assets.add('sprite_sheet_2', '{% static "sprite_sheet.json" %}');
    PIXI.Assets.add('sprite_sheet_hf', '{% static "sprite_sheet_hf.json" %}');
    PIXI.Assets.add('grass_tex', '{% static "background_tile_low.jpg"%}');
    PIXI.Assets.add('wall_tex', '{% static "wall.png"%}');
    PIXI.Assets.add('barrier_tex', '{% static "barrier.png"%}');
    PIXI.Assets.add('water_tex', '{% static "water_tile.jpg"%}');
    PIXI.Assets.add('bridge_tex', '{% static "bridge.jpg"%}');
    PIXI.Assets.add('Blueberry_tex', '{% static "blueberry.png"%}');
    PIXI.Assets.add('Pineapple_tex', '{% static "pineapple.png"%}');
    PIXI.Assets.add('Cherry_tex', '{% static "cherry.png"%}');
    PIXI.Assets.add('field_tex', '{% static "field.png"%}');
    PIXI.Assets.add('house_tex', '{% static "house.png"%}');
    PIXI.Assets.add('health_tex', '{% static "health_2.png"%}');
    PIXI.Assets.add('fist_left_tex', '{% static "fist_left.png"%}');
    PIXI.Assets.add('fist_right_tex', '{% static "fist_right.png"%}');
    PIXI.Assets.add('face_sleep_tex', '{% static "face_sleep_1.png"%}');
    PIXI.Assets.add('happy_emoji_tex', '{% static "happy_emoji.png"%}');
    PIXI.Assets.add('sad_emoji_tex', '{% static "sad_emoji.png"%}');
    PIXI.Assets.add('angry_emoji_tex', '{% static "angry_emoji.png"%}');

    let asset_names = ['sprite_sheet', 'sprite_sheet_hf', 'grass_tex', 'wall_tex', 'barrier_tex', 'water_tex',
                       'bridge_tex', 'sprite_sheet_2', 'Blueberry_tex', 'Pineapple_tex',
                       'Cherry_tex', 'field_tex', 'house_tex', 'health_tex', 'fist_left_tex', 'fist_right_tex',
                       'face_sleep_tex', 'happy_emoji_tex', 'sad_emoji_tex', 'angry_emoji_tex'];

    for(i in app.session.parameter_set.parameter_set_hats)
    {
        let texture_name = app.session.parameter_set.parameter_set_hats[i].texture;
        PIXI.Assets.add(texture_name, '/static/' + texture_name + '.png');
        asset_names.push(texture_name);
    }

    const textures_promise = PIXI.Assets.load(asset_names);

    textures_promise.then((textures) => {
        app.setup_pixi_sheets(textures);
        app.setup_pixi_ground();
        app.setup_pixi_fields();
        app.setup_pixi_patches();
        app.setup_pixi_houses();
        app.setup_pixi_subjects();       
        app.setup_pixi_wall();       
        app.setup_pixi_barrier();
       
        if(app.pixi_mode!="subject")
        {
            app.update_zoom();
            app.fit_to_screen();
        }
        else
        {
            app.setup_pixi_night();
            app.setup_pixi_minimap();
            app.setup_subject_status_overlay();
            app.update_pixi_night();
            // app.add_notice("Test Notice", 30,0);
            // app.add_notice("Test Notice2", 30,0);
        }
    });

    pixi_text_emitter = {};
    pixi_text_emitter_key = 0;
    app.pixi_tick_tock = {value:"tick", time:Date.now()};
    pixi_transfer_beams = {};
    pixi_transfer_beams_key = 0;
},

reset_pixi_app(){    

    app.stage_width = app.session.parameter_set.world_width;
    app.stage_height = app.session.parameter_set.world_height;

    let canvas = document.getElementById('sd_graph_id');

    pixi_app = new PIXI.Application({resizeTo : canvas,
                                        backgroundColor : 0xFFFFFF,
                                        autoResize: true,
                                        antialias: true,
                                        resolution: 1,
                                        view: canvas });

    // The stage will handle the move events
    pixi_app.stage.eventMode = 'static';
    pixi_app.stage.hitArea = pixi_app.screen;

    app.canvas_width = canvas.width;
    app.canvas_height = canvas.height;

    app.last_collision_check = Date.now();
},

/** load pixi sprite sheets
*/
setup_pixi_sheets(textures){

    app.pixi_textures = textures;
    app.background_tile_tex = textures.bg_tex;

    pixi_container_main = new PIXI.Container();
    pixi_container_main.sortableChildren = true;
    pixi_container_main.eventMode = 'passive';

    pixi_app.stage.addChild(pixi_container_main);
   
    let tiling_sprite = new PIXI.TilingSprite(
        app.pixi_textures["water_tex"],
        app.stage_width,
        app.stage_height,
    );
    tiling_sprite.position.set(0,0);
    pixi_container_main.addChild(tiling_sprite);

    //subject controls
    if(app.pixi_mode=="subject")
    {
        tiling_sprite.eventMode ='static';
        tiling_sprite.on("pointerup", app.subject_pointer_up);        
               
        pixi_target = new PIXI.Graphics();
        pixi_target.lineStyle(3, 0x000000);
        pixi_target.alpha = 0.33;
        pixi_target.drawCircle(0, 0, 10);
        pixi_target.eventMode='static';
        pixi_target.zIndex = 100;

        //pixi_target.scale.set(app.pixi_scale, app.pixi_scale);
        pixi_container_main.addChild(pixi_target)
    }
    else
    {
       
    }

    // staff controls
    if(app.pixi_mode=="staff"){

        app.scroll_button_up = app.add_scroll_button({w:50, h:30, x:pixi_app.screen.width/2, y:30}, 
                                                     {scroll_direction:{x:0,y:-app.scroll_speed}}, 
                                                   "↑↑↑");
        app.scroll_button_down = app.add_scroll_button({w:50, h:30, x:pixi_app.screen.width/2, y:pixi_app.screen.height - 30}, 
                                                     {scroll_direction:{x:0,y:app.scroll_speed}}, 
                                                     "↓↓↓");

        app.scroll_button_left = app.add_scroll_button({w:30, h:50, x:30, y:pixi_app.screen.height/2}, 
                                                     {scroll_direction:{x:-app.scroll_speed,y:0}}, 
                                                     "←\n←\n←");

        app.scroll_button_right = app.add_scroll_button({w:30, h:50, x:pixi_app.screen.width - 30, y:pixi_app.screen.height/2}, 
                                                      {scroll_direction:{x:app.scroll_speed,y:0}}, 
                                                      "→\n→\n→");
        
    }

    {%if DEBUG%}
    //fps counter
    let text_style = {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 'black',
        align: 'left',
    };
    let fps_label = new PIXI.Text("0 fps", text_style);
    fps_label.eventMode = 'none';

    pixi_fps_label = fps_label;
    pixi_fps_label.position.set(10, app.canvas_height-25);
    pixi_app.stage.addChild(pixi_fps_label);   
    {%endif%}

    //start game loop
    pixi_app.ticker.add(app.game_loop);
},

/**
 * game loop for pixi
 */
game_loop(delta)
{
    app.move_player(delta);
    app.move_text_emitters(delta);
    app.animate_transfer_beams(delta);

    if(app.pixi_mode=="subject" && app.session.started)
    {   
        app.update_offsets_player(delta);
        app.update_mini_map(delta);
        // app.check_for_collisions();
    }
    
    if(app.pixi_mode=="staff")
    {
        app.update_offsets_staff(delta);
        app.scroll_staff(delta);
    }  
    
    {%if DEBUG%}
    pixi_fps_label.text = Math.round(pixi_app.ticker.FPS) + " FPS";
    {%endif%}

    //tick tock
    if(Date.now() - app.pixi_tick_tock.time >= 200)
    {
        app.pixi_tick_tock.time = Date.now();
        if(app.pixi_tick_tock.value == "tick") 
            app.pixi_tick_tock.value = "tock";
        else
            app.pixi_tick_tock.value = "tick";
    }
},

/**
 * check for collisions between local player and other objects
 */
check_for_collisions(delta)
{
    // if(Date.now() - app.last_collision_check < 100) return;
    // app.last_collision_check = Date.now();

    // const obj = app.session.world_state_avatars.session_players[app.session_player.id];
    // let collision_found = false;

},

/**
 * update tractor beam between two players
 */
setup_tractor_beam(source_id, target_id)
{
    let source_player = app.session.world_state_avatars.session_players[source_id];
    let target_player = app.session.world_state_avatars.session_players[target_id];

    let parameter_set_player = app.session.parameter_set.parameter_set_players[source_player.parameter_set_player_id];

    let dY = source_player.current_location.y - target_player.current_location.y;
    let dX = source_player.current_location.x - target_player.current_location.x;

    let myX = source_player.current_location.x;
    let myY = source_player.current_location.y;
    let targetX = target_player.current_location.x;
    let targetY = target_player.current_location.y;
    
    let tempAngle = Math.atan2(dY, dX);
    let tempSlope = (myY - targetY) / (myX - targetX);

    if (myX - targetX == 0) tempSlope = 0.999999999999;

    let tempYIntercept = myY - tempSlope * myX;

    // Rectangle rectTractor;
    let tractorCircles = pixi_avatars[source_id].tractor_beam.length;
    let tempScale = 1 / tractorCircles;

    let xIncrement = Math.sqrt(Math.pow(myX - targetX, 2) + Math.pow(myY - targetY, 2)) / tractorCircles;

    for (let i=0; i<tractorCircles; i++)
    {
        let temp_x = (myX - Math.cos(tempAngle) * xIncrement * i);
        let temp_y = (myY - Math.sin(tempAngle) * xIncrement * i);

        tb_sprite = pixi_avatars[source_id].tractor_beam[i];
        tb_sprite.position.set(temp_x, temp_y)
        tb_sprite.scale.set(tempScale * i );
        tb_sprite.visible = true;
        
        if (app.pixi_tick_tock.value == 'tick')
        {
            if (i%2 == 0)
            {
                tb_sprite.tint = parameter_set_player.hex_color;
            }
            else
            {
                tb_sprite.tint = 0xFFFFFF;
            }
        }
        else
        {
            if (i%2 == 0)
            {
               tb_sprite.tint = 0xFFFFFF;
            }
            else
            {
                tb_sprite.tint = parameter_set_player.hex_color;
            }
        }

    }
},

