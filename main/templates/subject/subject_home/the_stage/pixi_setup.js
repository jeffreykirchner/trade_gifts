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
    PIXI.Assets.add('field_tex', '{% static "field.png"%}');
    PIXI.Assets.add('house_tex', '{% static "house.png"%}');
    PIXI.Assets.add('health_tex', '{% static "health_2.png"%}');
    PIXI.Assets.add('fist_left_tex', '{% static "fist_left.png"%}');
    PIXI.Assets.add('fist_right_tex', '{% static "fist_right.png"%}');
    PIXI.Assets.add('face_sleep_tex', '{% static "face_sleep_1.png"%}');

    const textures_promise = PIXI.Assets.load(['sprite_sheet', 'sprite_sheet_hf', 'grass_tex', 'wall_tex', 'water_tex',
                                               'bridge_tex', 'sprite_sheet_2', 'Blueberry_tex', 'Pineapple_tex',
                                               'Cherry_tex', 'field_tex', 'house_tex', 'health_tex', 'fist_left_tex', 'fist_right_tex',
                                               'face_sleep_tex'])

    textures_promise.then((textures) => {
        app.setup_pixi_sheets(textures);
        app.setup_pixi_ground();
        app.setup_pixi_fields();
        app.setup_pixi_houses();
        app.setup_pixi_subjects();       
        app.setup_pixi_wall();       
       
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
        app.update_pixi_night();
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

    let parameter_set_player = app.session.parameter_set_player[source_player.parameter_set_player_id];

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

/**
 * move the object towards its target location
 */
move_object(delta, obj, move_speed, wall_limited=false, container=null, scale=1)
{
    let temp_move_speed = (move_speed * delta);

    let temp_current_location = Object.assign({}, obj.current_location);

    let target_location_local = Object.assign({}, obj.target_location);
    if("nav_point" in obj && obj.nav_point) 
    target_location_local = Object.assign({}, obj.nav_point);

    let temp_angle = Math.atan2(target_location_local.y - obj.current_location.y,
                                target_location_local.x - obj.current_location.x)

    //y
    if(Math.abs(target_location_local.y - obj.current_location.y) < temp_move_speed)
        obj.current_location.y = target_location_local.y;
    else
        obj.current_location.y += temp_move_speed * Math.sin(temp_angle);
 
    //x
    if(Math.abs(target_location_local.x - obj.current_location.x) < temp_move_speed)
        obj.current_location.x = target_location_local.x;
    else
        obj.current_location.x += temp_move_speed * Math.cos(temp_angle);  

    //if nav point reached remove it.
    if("nav_point" in obj && obj.nav_point && obj.current_location.x == obj.nav_point.x && obj.current_location.y == obj.nav_point.y)
        obj.nav_point = null;

    //if wall limited prevent object from moving through
    if(wall_limited && !obj.nav_point)
    {
        let wall_limit_hit = false;

        let rect1={x:obj.current_location.x - container.width/2,
                   y:obj.current_location.y - container.height/2,
                   width:container.width,
                   height:container.height};  
        
        if(app.check_walls_intersection(rect1))
        {
            obj.current_location =  Object.assign({}, temp_current_location);  
            wall_limit_hit = true;
        }

        if(wall_limit_hit)
        {
            //reset rect
            rect1={x:obj.current_location.x - container.width/2,
                        y:obj.current_location.y - container.height/2,
                        width:container.width,
                        height:container.height};

            let v = app.search_for_path_around_walls(rect1, obj.current_location, obj.target_location);       

            if(v)
            {
                obj.nav_point = v;
            }

        }

    }
},

/**
 * check wall intersection
 */

check_walls_intersection(rect1)
{
    for(let i in app.session.parameter_set.parameter_set_walls)
    {
        let temp_wall = app.session.parameter_set.parameter_set_walls[i];
        let rect2={x:temp_wall.start_x,
                y:temp_wall.start_y,
                width:temp_wall.width,
                height:temp_wall.height};

        if(app.check_for_rect_intersection(rect1, rect2))
        {  
            return true;
        }
    }

    return false;
},

/**
 * seach for path around walls
 */
search_for_path_around_walls(starting_rect, current_location, target_location)
{
    // if(wall_search.counter>0) return;

    if(wall_search.current_location.x == current_location.x && wall_search.current_location.y == current_location.y &&
        wall_search.target_location.x == target_location.x && wall_search.target_location.y == target_location.y)
        return null;

    let contact_found = null;
    wall_search.counter = 0;
    wall_search.search_grid = {};
    wall_search.current_location = Object.assign({}, current_location);
    wall_search.target_location = Object.assign({}, target_location);

    let v = {rect:{x:Math.floor(starting_rect.x), y:Math.floor(starting_rect.y), width: Math.floor(starting_rect.width), height:Math.floor(starting_rect.height)}, 
             searched:false, shortest_path:0, parent:null, contact:false};
    wall_search.search_grid["x_" + Math.floor(starting_rect.x) + "_y_" + Math.floor(starting_rect.y)] = v;

    for(a=0;a<15;a++)
    {
        let new_search_grid = {};
        wall_search.counter += 1;
        //expand grid
        for(let i in wall_search.search_grid)
        {
            let search_grid = wall_search.search_grid[i];
            let temp_x = search_grid.rect.x-Math.floor(starting_rect.width);
            let temp_y = search_grid.rect.y-Math.floor(starting_rect.height);

            for(let j=0;j<3;j++)
            {
                for(let k=0;k<3;k++)
                {
                    if(j == 0 && k==1 || j==1 && k==0 || j==1 && k==2 || j==2 && k==1)
                    {
                        let v = "x_" + temp_x + "_y_" + temp_y;
                        let rect1 = {x:temp_x, y:temp_y, width:Math.floor(starting_rect.width), height:Math.floor(starting_rect.height)};

                        if(v in wall_search.search_grid)
                        {
                            if(wall_search.search_grid[v].shortest_path > search_grid.shortest_path+1)
                            {
                                wall_search.search_grid[v].shortest_path = search_grid.shortest_path+1;
                                wall_search.search_grid[v].parent = i;
                            }
                            else if(wall_search.search_grid[v].shortest_path+1 < search_grid.shortest_path)
                            {
                                search_grid.shortest_path = wall_search.search_grid[v].shortest_path+1;
                                search_grid.parent = v;
                            }
                        }
                        else if(!app.check_walls_intersection(rect1)) 
                        {
                            new_search_grid[v] = {rect:rect1, 
                                                  searched:false, 
                                                  shortest_path:search_grid.shortest_path+1, 
                                                  parent:i, 
                                                  contact:false};
                        }

                    }

                    temp_x += Math.floor(starting_rect.width);
                }

                temp_x = search_grid.rect.x-Math.floor(starting_rect.width);
                temp_y += Math.floor(starting_rect.height);
            }
        }

        //add new grid to existing grid
        
        for(i in new_search_grid)
        {
            wall_search.search_grid[i] = new_search_grid[i];

            if(app.check_point_in_rectagle(target_location, wall_search.search_grid[i].rect))
            {
                wall_search.search_grid[i].contact = true;
                contact_found = i;
                break;
            }
        }

        if(contact_found) 
            break;
    }

    // pt = app.search_for_path_around_walls_2(starting_rect,current_location, target_location);

    // if(pt) return pt;

    let draw_grid = true;
    //draw grid
    if(draw_grid)
        for(i=0;i<wall_search_objects.length;i++)
        {
            wall_search_objects[i].destroy();
        }

        wall_search_objects = [];

        for(i in wall_search.search_grid)
        {
            //outline
            let search_grid = wall_search.search_grid[i];
            let box = new PIXI.Graphics();
            let rect = search_grid.rect;
        
            box.lineStyle(1, "black");
            //bounding_box.beginFill(0xBDB76B);
            box.drawRect(rect.x, rect.y, rect.width, rect.height);
            // box.endFill();
            
            wall_search_objects.push(box);
            pixi_container_main.addChild(box);

            //line to parent
            if(search_grid.parent)
            {
                let line_to_parent = new PIXI.Graphics();
                let search_grid_parent = wall_search.search_grid[search_grid.parent];
                line_to_parent.lineStyle(1, "gray");

                line_to_parent.moveTo(rect.x + rect.width/2, rect.y + rect.height/2);
                line_to_parent.lineTo(search_grid_parent.rect.x + search_grid_parent.rect.width/2, search_grid_parent.rect.y + search_grid_parent.rect.height/2);
                
                wall_search_objects.push(line_to_parent);
                pixi_container_main.addChild(line_to_parent);
            }

        }

    //find path to startart
    if(contact_found)
    {
        let go = true;
        while(go)
        {
            let search_grid = wall_search.search_grid[contact_found];

            if(search_grid.parent)
            {
                let search_grid_parent = wall_search.search_grid[search_grid.parent];

                let pt1 = {x:search_grid.rect.x + search_grid.rect.width/2, y:search_grid.rect.y + search_grid.rect.height/2};
                let pt2 = {x:search_grid_parent.rect.x + search_grid_parent.rect.width/2, y:search_grid_parent.rect.y + search_grid_parent.rect.height/2};

                if(draw_grid)
                {
                    let line_to_parent = new PIXI.Graphics();
                    line_to_parent.lineStyle(2, "purple");                

                    line_to_parent.moveTo(pt1.x, pt1.y);
                    line_to_parent.lineTo(pt2.x, pt2.y);

                    wall_search_objects.push(line_to_parent);
                    pixi_container_main.addChild(line_to_parent);
                }

                if(search_grid_parent.parent)
                {
                    contact_found = search_grid.parent;
                }
                else
                {
                    return pt1;
                }
            }
            else
            {
                go = false;
            }
        }
    }

    return null;
},

