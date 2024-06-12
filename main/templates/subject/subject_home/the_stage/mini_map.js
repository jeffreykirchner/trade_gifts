/**
 * setup mini map on subject screen 
 * */
setup_pixi_minimap: function setup_pixi_minimap()
{
    if(!app.session) return;
    if(!app.session.started) return;
    if(app.pixi_mode!="subject") return;

    if(mini_map.container) mini_map.container.destroy();

    mini_map.black_outs = {};

    app.mini_map_scale = Math.min((pixi_app.screen.width * 0.2)/app.stage_width,  (pixi_app.screen.height * 0.3)/app.stage_height);

    let scale = app.mini_map_scale;
    let obj = app.session.world_state_avatars.session_players[app.session_player.id]

    mini_map.container = new PIXI.Container();
    // mini_map.container.eventMode = 'none';
    mini_map.container.zIndex = 9998;

    //mini map background
    let mini_map_bg = new PIXI.Graphics();
    
    mini_map_bg.width = app.stage_width * scale;
    mini_map_bg.height =  app.stage_height * scale;
   
    mini_map_bg.rect(0, 0, app.stage_width * scale, app.stage_height * scale);
    
    mini_map_bg.fill({color:'00BFFF'});
    mini_map_bg.stroke({width:1, color:0x000000});
    
    mini_map.container.addChild(mini_map_bg);

    //grounds
    for(const i in app.session.parameter_set.parameter_set_grounds){
        const ground = app.session.parameter_set.parameter_set_grounds[i];

        let temp_ground = new PIXI.Graphics();
        
        temp_ground.rect(ground.x * scale, ground.y * scale, ground.width * scale, ground.height * scale);
        temp_ground.fill(ground.tint);
        mini_map.container.addChild(temp_ground);
    }

    //fields
    for(const i in app.session.parameter_set.parameter_set_fields){
        const field = app.session.parameter_set.parameter_set_fields[i];

        let temp_field = new PIXI.Graphics();
       
        temp_field.rect(field.x * scale, 
                            field.y * scale, 
                            app.session.parameter_set.field_width * scale, 
                            app.session.parameter_set.field_height * scale);

        if(field.parameter_set_player == app.session_player.parameter_set_player_id){
            temp_field.fill('yellow');
        }
        else
        {
            temp_field.fill(app.field_color);
        }
                            
        temp_field.pivot.set(temp_field.width/2, temp_field.height/2);

        mini_map.container.addChild(temp_field);
    }

    //patches
    for(const i in app.session.world_state.patches)
    {
        const patch = app.session.world_state.patches[i];

        let temp_patch = new PIXI.Graphics();
       
        temp_patch.circle(patch.x * scale, patch.y * scale, patch.radius * scale);
        temp_patch.fill({color:app.field_color});

        mini_map.container.addChild(temp_patch);
    }

    //houses
    for(const i in app.session.parameter_set.parameter_set_players){
        const parameter_set_player = app.session.parameter_set.parameter_set_players[i];

        let temp_house = new PIXI.Graphics();
        
        let p1 = {x:(parameter_set_player.house_x) * scale,
                  y:(parameter_set_player.house_y - app.session.parameter_set.house_height/2) * scale};

        let p2 = {x:(parameter_set_player.house_x - app.session.parameter_set.house_width/2) * scale,
                  y:(parameter_set_player.house_y + app.session.parameter_set.house_height/2) * scale};

        let p3 = {x:(parameter_set_player.house_x + app.session.parameter_set.house_width/2) * scale,
                  y:(parameter_set_player.house_y + app.session.parameter_set.house_height/2) * scale};
        
        temp_house.moveTo(p1.x, p1.y);

        temp_house.lineTo(p2.x, p2.y);
        temp_house.lineTo(p3.x, p3.y);
        temp_house.lineTo(p1.x, p1.y);

        if(parameter_set_player.id == app.session_player.parameter_set_player_id){
            temp_house.fill('yellow');
        }
        else
        {
            temp_house.fill(app.field_color);
        }
        // temp_house.pivot.set(temp_house.width/2, temp_house.height/2);

        mini_map.container.addChild(temp_house);
    }

    //black outs
    for(const i in app.session.parameter_set.parameter_set_grounds){
        const ground = app.session.parameter_set.parameter_set_grounds[i];

        let temp_ground = new PIXI.Graphics();
       
        temp_ground.rect(ground.x * scale, ground.y * scale, ground.width * scale, ground.height * scale);
        temp_ground.fill("gray");

        mini_map.black_outs[i] = temp_ground;
        mini_map.container.addChild(mini_map.black_outs[i]);
    }

    //walls
    for(const i in app.session.parameter_set.parameter_set_walls)
    { 

        const wall = app.session.parameter_set.parameter_set_walls[i];

        let temp_wall = new PIXI.Graphics();
        
        temp_wall.rect(wall.start_x * scale, wall.start_y * scale, wall.width * scale, wall.height * scale);
        temp_wall.fill('DEB887');

        mini_map.container.addChild(temp_wall);
    }

    //mini map view port
    let mini_map_vp = new PIXI.Graphics();
    mini_map_vp.width = pixi_app.screen.width * scale;
    mini_map_vp.height = pixi_app.screen.height * scale;
    
    mini_map_vp.rect(0, 0, pixi_app.screen.width * scale, pixi_app.screen.height * scale);
    
    mini_map_vp.fill({color:0xFFFFFF, alpha:0});
    mini_map_vp.stroke({width:2,color:0x000000,alignment:0});

    mini_map_vp.pivot.set(mini_map_vp.width/2, mini_map_vp.height/2);
    mini_map_vp.position.set(obj.current_location.x * scale, obj.current_location.y * scale);

    mini_map.view_port = mini_map_vp;

    mini_map.container.addChild(mini_map.view_port);

    //add to stage
    mini_map.container.position.set(20, 20);
    // mini_map.container.alpha = 0.9;
    pixi_app.stage.addChild(mini_map.container);
},

/**
 * update the mini map
 */
update_mini_map: function update_mini_map(delta)
{
    if(!app.mini_map_scale) return;
    
    let obj = app.session.world_state_avatars.session_players[app.session_player.id]
    mini_map.view_port.position.set(obj.current_location.x * app.mini_map_scale, 
                                    obj.current_location.y * app.mini_map_scale);

    //update black outs
    for(const i in app.session.parameter_set.parameter_set_grounds){
        let container = mini_map.black_outs[i];

        if(container.visible){
           let ground = app.session.parameter_set.parameter_set_grounds[i];
           let rect = {x:ground.x , y:ground.y, width: ground.width , height: ground.height};
           let pt = app.session.world_state_avatars.session_players[app.session_player.id].current_location;

           if(app.check_point_in_rectagle(pt, rect)){
               container.visible = false;
           }
        }
    }
},