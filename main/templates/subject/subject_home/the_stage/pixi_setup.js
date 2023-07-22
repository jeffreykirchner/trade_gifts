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
    PIXI.Assets.add('water_tex', '{% static "water_tile.jpg"%}');
    PIXI.Assets.add('bridge_tex', '{% static "bridge.jpg"%}');
    PIXI.Assets.add('Blueberry_tex', '{% static "blueberry.png"%}');
    PIXI.Assets.add('Pineapple_tex', '{% static "pineapple.png"%}');
    PIXI.Assets.add('Cherry_tex', '{% static "cherry.png"%}');
    PIXI.Assets.add('cherry_token', '{% static "cherry_1_animated.json"%}');

    const textures_promise = PIXI.Assets.load(['sprite_sheet', 'sprite_sheet_hf', 'grass_tex', 'wall_tex', 'water_tex',
                                               'bridge_tex', 'sprite_sheet_2', 'cherry_token', 'Blueberry_tex', 'Pineapple_tex',
                                               'Cherry_tex'])

    textures_promise.then((textures) => {
        app.setup_pixi_sheets(textures);
        app.setup_pixi_tokens_for_current_period();
        app.setup_pixi_ground();
        app.setup_pixi_fields();
        app.setup_pixi_subjects();       
        app.setup_pixi_wall();       
        
        if(app.pixi_mode!="subject")
        {
            app.update_zoom();
            app.fit_to_screen();
        }
        else
        {
            app.setup_pixi_minimap();
            app.setup_subject_status_overlay();
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
                                        antialias: false,
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
 * setup the pixi components for each token
 */
setup_pixi_tokens_for_current_period()
{
    if(!app.session) return;
    if(!app.session.started) return;

    app.destroy_pixi_tokens_for_all_periods();

    const current_period_id = app.session.session_periods_order[app.session.world_state.current_period-1];

    pixi_tokens[current_period_id] = {};

    for(const i in app.session.world_state.tokens[current_period_id]){

        let token =  app.session.world_state.tokens[current_period_id][i];
        let token_container = new PIXI.Container();

        token_container.zIndex = 100;

        let token_graphic = new PIXI.AnimatedSprite(app.pixi_textures.cherry_token.animations['walk']);
        token_graphic.animationSpeed = app.animation_speed;
        token_graphic.anchor.set(0.5)
        token_graphic.eventMode = 'passive';

        if(token.status=="available")
        {
            token_graphic.play();
        }
        else
        {
            token_graphic.alpha = 0.25;
        }

        token_container.addChild(token_graphic);
        // token_container.pivot.set(token_container.width/2, token_container.height/2);
        token_container.position.set(token.current_location.x, token.current_location.y);

        //bounding box outline
        if(app.draw_bounding_boxes)
        {
            let bounding_box = new PIXI.Graphics();

            bounding_box.width = token_container.width;
            bounding_box.height = token_container.height;
            bounding_box.lineStyle(1, 0x000000);
            bounding_box.drawRect(0, 0, token_container.width, token_container.height);
            bounding_box.endFill();
            bounding_box.pivot.set(bounding_box.width/2, bounding_box.height/2);
            bounding_box.position.set(0, 0);
            token_container.addChild(bounding_box);
        }

        let v = {"token_container":token_container};

        pixi_tokens[current_period_id][i] = v;
        pixi_container_main.addChild(pixi_tokens[current_period_id][i].token_container);
       
   }
},

/**
 * destory pixi tokens in world state
 */
destroy_pixi_tokens_for_all_periods()
{
    if(!app.session) return;

    for(const i in app.session.session_periods_order){

        let period_id = app.session.session_periods_order[i];

        for(const j in app.session.world_state.tokens[period_id]){

            if (period_id in pixi_tokens)
            {
                pixi_tokens[period_id][j].token_container.destroy();
            }
        }
    }
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
    subject_status_overlay_container.getChildAt(5).text = app.session.world_state.session_players[app.session_player.id].earnings;
},

/**
 * add scroll buttons to staff screen
 */
add_scroll_button(button_size, name, text)
{
    let g = new PIXI.Graphics();
    g.lineStyle(1, 0x000000);
    g.beginFill(0xffffff);
    g.drawRect(0, 0, button_size.w, button_size.h);
    g.pivot.set(button_size.w/2, button_size.h/2);
    g.endFill();
    g.lineStyle(1, 0x000000);
    g.x=button_size.x;
    g.y=button_size.y;
    g.eventMode='static';
    g.alpha = 0.5;
    g.name = name;

    g.on("pointerover", app.staff_screen_scroll_button_over);
    g.on("pointerout", app.staff_screen_scroll_button_out);

    let label = new PIXI.Text(text,{fontFamily : 'Arial',
                                    fontWeight:'bold',
                                    fontSize: 28,       
                                    lineHeight : 14,                             
                                    align : 'center'});
    label.pivot.set(label.width/2, label.height/2);
    label.x = button_size.w/2;
    label.y = button_size.h/2-3;
    g.addChild(label);

    pixi_app.stage.addChild(g);

    return g
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
        app.check_for_collisions();
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
 * update zoom level on staff screen
 */
update_zoom()
{
    if(app.pixi_mode == "subject") return;
    if(app.pixi_scale == app.pixi_scale_range_control) return;
    
   
    let zoom_direction = 1;
    if(app.pixi_scale_range_control > app.pixi_scale)
    {
        zoom_direction = -1;
    }

    app.pixi_scale = app.pixi_scale_range_control;
    pixi_container_main.scale.set(app.pixi_scale);
},

/**
 * fit staff display to screen
 */
fit_to_screen()
{
    if(app.pixi_mode == "subject") return;
    
    app.current_location.x = app.stage_width/2;
    app.current_location.y = app.stage_height/2;

    let zoom_factor = Math.min(app.canvas_width / app.stage_width, app.canvas_height / app.stage_height);

    app.pixi_scale_range_control = zoom_factor;
    app.pixi_scale = app.pixi_scale_range_control;
    pixi_container_main.scale.set(app.pixi_scale);
},

/**
 * get distance in pixels between two points
 */
get_distance(point1, point2) 
{
    // Get the difference between the x-coordinates of the two points.
    const dx = point2.x - point1.x;
  
    // Get the difference between the y-coordinates of the two points.
    const dy = point2.y - point1.y;
  
    // Calculate the square of the distance between the two points.
    const distanceSquared = dx * dx + dy * dy;
  
    // Take the square root of the distance between the two points.
    const distance = Math.sqrt(distanceSquared);
  
    // Return the distance between the two points.
    return distance;
},

/**
 * update the amount of shift needed to center the player
 */
update_offsets_player(delta)
{
    offset = app.get_offset();

    pixi_container_main.x = -offset.x;
    pixi_container_main.y = -offset.y;   
    
    obj = app.session.world_state.session_players[app.session_player.id];

    pixi_target.x = obj.target_location.x;
    pixi_target.y = obj.target_location.y;
},

/**
 * check for collisions between local player and other objects
 */
check_for_collisions(delta)
{
    if(Date.now() - app.last_collision_check < 100) return;
    app.last_collision_check = Date.now();

    const obj = app.session.world_state.session_players[app.session_player.id];
    let collision_found = false;

    //check for collisions with tokens
    const current_period_id = app.session.session_periods_order[app.session.world_state.current_period-1];
    for(const i in app.session.world_state.tokens[current_period_id]){       

        let token = app.session.world_state.tokens[current_period_id][i];
        let distance = app.get_distance(obj.current_location, token.current_location);

        if(distance <= pixi_avatars[app.session_player.id].avatar_container.width/2 &&
           token.status == "available" && 
           !collision_found)
        {
            // token.token_container.getChildAt(0).stop();
            // token.token_container.getChildAt(0).alpha = 0.25;
            token.status = "waiting";
            collision_found = true;

            app.send_message("collect_token", 
                             {"token_id" : i, "period_id" : current_period_id},
                             "group");
        }
        else if(distance>2000)
        {
            token.visible=false;
        }
        else
        {
            token.visible=true;
        }
        
    }

},

/**
 * update the amount of shift needed for the staff view
 */
update_offsets_staff(delta)
{
    let offset = app.get_offset_staff();

    pixi_container_main.x = -offset.x;
    pixi_container_main.y = -offset.y;   
},

/**
 * manaully scroll staff screen
 */
scroll_staff(delta)
{
    app.current_location.x += app.scroll_direction.x;
    app.current_location.y += app.scroll_direction.y;
},

/**
 * subject screen offset from the origin
 */
get_offset()
{
    let obj = app.session.world_state.session_players[app.session_player.id];

    return {x:obj.current_location.x * app.pixi_scale - pixi_app.screen.width/2,
            y:obj.current_location.y * app.pixi_scale - pixi_app.screen.height/2};
},

/**
 * staff screen offset from origin
 */
get_offset_staff()
{
    if(app.follow_subject != -1 && app.session.started)
    {
        obj = app.session.world_state.session_players[app.follow_subject];
        app.current_location = Object.assign({}, obj.current_location);
    }

    return {x:app.current_location.x * app.pixi_scale - pixi_app.screen.width/2,
            y:app.current_location.y * app.pixi_scale - pixi_app.screen.height/2};
},

/**
 *pointer up on subject screen
 */
subject_pointer_up(event)
{
    if(!app.session.world_state.hasOwnProperty('started')) return;
    let local_pos = event.data.getLocalPosition(event.currentTarget);
    let local_player = app.session.world_state.session_players[app.session_player.id];

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
        
        for(i in app.session.world_state.session_players)
        {
            let obj = app.session.world_state.session_players[i];

            if(app.get_distance(obj.current_location, local_pos) < 100 &&
               app.get_distance(obj.current_location, local_player.current_location) <= app.session.parameter_set.interaction_range+125)
            {
                app.subject_avatar_click(i);              
                break;
            }
        }
    }
},

/**
 *scroll control for staff
 */
staff_screen_scroll_button_over(event)
{
    event.currentTarget.alpha = 1;  
    app.scroll_direction = event.currentTarget.name.scroll_direction;
},

/**
 *scroll control for staff
 */
staff_screen_scroll_button_out(event)
{
    event.currentTarget.alpha = 0.5;
    app.scroll_direction = {x:0, y:0};
},

/**
 * update tractor beam between two players
 */
setup_tractor_beam(source_id, target_id)
{
    let source_player = app.session.world_state.session_players[source_id];
    let target_player = app.session.world_state.session_players[target_id];

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
        tb_sprite.scale.set(tempScale * i * 2);
        tb_sprite.visible = true;
        
        if (app.pixi_tick_tock.value == 'tick')
        {
            if (i%2 == 0)
            {
                tb_sprite.tint = app.session.session_players[source_id].parameter_set_player.hex_color;
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
                tb_sprite.tint = app.session.session_players[source_id].parameter_set_player.hex_color;
            }
        }

    }
},

/**
 * move the object towards its target location
 */
move_object(delta, obj, move_speed, wall_limited=false, container=null)
{
    let noX = false;
    let noY = false;
    let temp_move_speed = (move_speed * delta);

    let temp_current_location = Object.assign({}, obj.current_location);

    let temp_angle = Math.atan2(obj.target_location.y - obj.current_location.y,
                                obj.target_location.x - obj.current_location.x)

    if(!noY){
        if(Math.abs(obj.target_location.y - obj.current_location.y) < temp_move_speed)
            obj.current_location.y = obj.target_location.y;
        else
            obj.current_location.y += temp_move_speed * Math.sin(temp_angle);
    }

    if(!noX){
        if(Math.abs(obj.target_location.x - obj.current_location.x) < temp_move_speed)
            obj.current_location.x = obj.target_location.x;
        else
            obj.current_location.x += temp_move_speed * Math.cos(temp_angle);        
    }

    //if wall limited prevent object from moving through
    if(wall_limited)
    {
        wall_limit_hit = false;

        let rect1={x:obj.current_location.x - container.width/2,
                   y:obj.current_location.y - container.height/2,
                   width:container.width,
                   height:container.height};  
        
        for(let i in app.session.parameter_set.parameter_set_walls)
        {
            let temp_wall = app.session.parameter_set.parameter_set_walls[i];
            let rect2={x:temp_wall.start_x,
                    y:temp_wall.start_y,
                    width:temp_wall.width,
                    height:temp_wall.height};

            if(app.check_for_intersection(rect1, rect2))
            {
                obj.current_location =  Object.assign({}, temp_current_location);
                break;
            }
        }
    }
},

/**
 * check for rectangle intersection
 */
check_for_intersection(rect1, rect2)
{
   if(rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y)
   {
        return true;
   }

   return false;

},