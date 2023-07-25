/**
 * setup mini map on subject screen 
 * */
setup_pixi_minimap()
{
    if(!app.session) return;
    if(!app.session.started) return;
    if(app.pixi_mode!="subject") return;

    if(mini_map.container) mini_map.container.destroy();

    app.mini_map_scale = Math.min((pixi_app.screen.width * 0.2)/app.stage_width,  (pixi_app.screen.height * 0.3)/app.stage_height);

    let scale = app.mini_map_scale;
    let obj = app.session.world_state.session_players[app.session_player.id]

    mini_map.container = new PIXI.Container();
    mini_map.container.eventMode = 'none';
    mini_map.container.zIndex = 9998;

    //mini map background
    let mini_map_bg = new PIXI.Graphics();
    
    mini_map_bg.width = app.stage_width * scale;
    mini_map_bg.height =  app.stage_height * scale;
    mini_map_bg.lineStyle(1, 0x000000);
    mini_map_bg.beginFill('00BFFF');
    mini_map_bg.drawRect(0, 0, app.stage_width * scale, app.stage_height * scale);
    mini_map_bg.endFill();
    
    mini_map.container.addChild(mini_map_bg);

    //grounds
    for(const i in app.session.parameter_set.parameter_set_grounds){
        const ground = app.session.parameter_set.parameter_set_grounds[i];

        let temp_ground = new PIXI.Graphics();
        temp_ground.beginFill(ground.tint);
        temp_ground.drawRect(ground.x * scale, ground.y * scale, ground.width * scale, ground.height * scale);

        mini_map.container.addChild(temp_ground);
    }

    //fields
    for(const i in app.session.parameter_set.parameter_set_fields){
        const field = app.session.parameter_set.parameter_set_fields[i];

        let temp_field = new PIXI.Graphics();
        if(field.parameter_set_player == app.session_player.parameter_set_player.id){
            temp_field.beginFill('yellow');
        }
        else
        {
            temp_field.beginFill(app.field_color);
        }
        temp_field.drawRect(field.x * scale, 
                            field.y * scale, 
                            app.session.parameter_set.field_width * scale, 
                            app.session.parameter_set.field_height * scale);
                            
        temp_field.pivot.set(temp_field.width/2, temp_field.height/2);

        mini_map.container.addChild(temp_field);
    }

    //houses
    for(const i in app.session.parameter_set.parameter_set_players){
        const parameter_set_player = app.session.parameter_set.parameter_set_players[i];

        let temp_house = new PIXI.Graphics();
        if(parameter_set_player.id == app.session_player.parameter_set_player.id){
            temp_house.beginFill('yellow');
        }
        else
        {
            temp_house.beginFill(app.field_color);
        }

        temp_house.moveTo(parameter_set_player.house_x * scale, parameter_set_player.house_y * scale);
        temp_house.lineTo((parameter_set_player.house_x + app.session.parameter_set.house_width/2) * scale, 
                          (parameter_set_player.house_y + app.session.parameter_set.house_height) * scale);
        temp_house.lineTo((parameter_set_player.house_x - app.session.parameter_set.house_width/2) * scale,
                          (parameter_set_player.house_y + app.session.parameter_set.house_height) * scale);
        temp_house.lineTo(parameter_set_player.house_x * scale, parameter_set_player.house_y * scale);

        // temp_house.drawRect(parameter_set_player.house_x * scale,
        //                     parameter_set_player.house_y * scale,
        //                     app.session.parameter_set.house_width * scale,
        //                     app.session.parameter_set.house_height * scale);

        temp_house.endFill();

        temp_house.pivot.set(temp_house.width/2, temp_house.height/2);

        mini_map.container.addChild(temp_house);
    }

    //walls
    for(const i in app.session.parameter_set.parameter_set_walls){ 

        const wall = app.session.parameter_set.parameter_set_walls[i];

        let temp_wall = new PIXI.Graphics();
        temp_wall.beginFill('DEB887');
        temp_wall.drawRect(wall.start_x * scale, wall.start_y * scale, wall.width * scale, wall.height * scale);

        mini_map.container.addChild(temp_wall);
    }

    //mini map view port
    let mini_map_vp = new PIXI.Graphics();
    mini_map_vp.width = pixi_app.screen.width * scale;
    mini_map_vp.height = pixi_app.screen.height * scale;
    mini_map_vp.lineStyle({width:2,color:0x000000,alignment:0});
    mini_map_vp.beginFill(0xFFFFFF,0);
    mini_map_vp.drawRect(0, 0, pixi_app.screen.width * scale, pixi_app.screen.height * scale);
    mini_map_vp.endFill();    
    mini_map_vp.pivot.set(mini_map_vp.width/2, mini_map_vp.height/2);
    mini_map_vp.position.set(obj.current_location.x * scale, obj.current_location.y * scale);

    mini_map.view_port = mini_map_vp;

    mini_map.container.addChild(mini_map.view_port);

    //add to stage
    mini_map.container.position.set(20, 20);
    mini_map.container.alpha = 0.9;
    pixi_app.stage.addChild(mini_map.container);
},

/**
 * update the mini map
 */
update_mini_map(delta)
{
    let obj = app.session.world_state.session_players[app.session_player.id]
    mini_map.view_port.position.set(obj.current_location.x * app.mini_map_scale, 
                             obj.current_location.y * app.mini_map_scale);
},