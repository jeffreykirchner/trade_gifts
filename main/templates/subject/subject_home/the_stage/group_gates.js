/**
 * setup group_gate objects
 */
setup_pixi_group_gates: function setup_pixi_group_gates()
{
    //destory old group_gates
    for(const i in pixi_group_gates)
    {
        if(pixi_group_gates[i].group_gate_container) pixi_group_gates[i].group_gate_container.destroy();
    }

    for(const i in app.session.parameter_set.parameter_set_group_gates)
    {
        pixi_group_gates[i] = {};

        const group_gate = app.session.parameter_set.parameter_set_group_gates[i];
        
        let group_gate_container = new PIXI.Container();
        let rotation = app.degrees_to_radians(group_gate.rotation);
        
        group_gate_container.position.set(group_gate.start_x,group_gate.start_y)
        // group_gate_container.eventMode = 'none';

        //outline
        let outline = new PIXI.Graphics();
        let matrix = new PIXI.Matrix(1,0,0,1,0,0);
        
        let scale_y = 1;
        if(rotation == 0)
        {
            scale_y = group_gate.height / app.pixi_textures.barrier_tex.height;
        }
        else
        {
            scale_y = group_gate.width / app.pixi_textures.barrier_tex.height;
        }
        matrix.scale(1,scale_y);

        matrix.rotate(rotation);
        
        
        outline.rect(0, 0, group_gate.width, group_gate.height);
        outline.fill({texture: app.pixi_textures['barrier_tex'], matrix:matrix});
       
        let label = new PIXI.Text({text:group_gate.text.replace('\\n', '\n'), 
                                   style:{
                                        fontFamily: 'Arial',
                                        fontSize: 40,
                                        fill: 'white',
                                        align: 'center',
                                        stroke: {color:'black', width: 2},
                                    }});
           
        label.anchor.set(0.5);   
        label.position.set(group_gate.width/2, group_gate.height/2);
        label.rotation = rotation;

        group_gate_container.addChild(outline);
        group_gate_container.addChild(label);

        pixi_group_gates[i].group_gate_container = group_gate_container;

        pixi_container_main.addChild(pixi_group_gates[i].group_gate_container);
    }

    app.update_group_gates();
},

/**
 * check group_gate intersection
 */
check_group_gates_intersection: function check_group_gates_intersection(rect1, parameter_set_group, player_id)
{
    for(let i in app.session.parameter_set.parameter_set_group_gates)
    {        
        if(app.check_group_gate_intersection(rect1, parameter_set_group, player_id, i))
        {
            return true;
        }
    }

    return false;
},

/**
 * check group_gate intersection
*/
check_group_gate_intersection: function check_group_gate_intersection(rect1, parameter_set_group, player_id, group_gate_id)
{            
    let parameter_set_group_gate = app.session.parameter_set.parameter_set_group_gates[group_gate_id];
    let group_gate = app.session.world_state.group_gates[group_gate_id];

    if(!group_gate.allowed_players.includes(parseInt(player_id)) && 
        app.session.world_state.current_period >= parameter_set_group_gate.period_on &&
        app.session.world_state.current_period < parameter_set_group_gate.period_off)
    {
        let rect2={x:parameter_set_group_gate.start_x,
                   y:parameter_set_group_gate.start_y,
                   width:parameter_set_group_gate.width,
                   height:parameter_set_group_gate.height};

        if(app.check_for_rect_intersection(rect1, rect2))
        {  
            return true;
        }
    }

    return false;
},

/**
 * send group gate intersection
 */
check_send_group_gate_access_request: function send_group_gate_intersection()
{
    let player_id = app.session_player.id;
    let obj = app.session.world_state_avatars.session_players[player_id];
    let container = pixi_avatars[player_id].bounding_box

    let rect1={x:obj.current_location.x - (container.width+10)/2,
               y:obj.current_location.y - (container.height+10)/2,
               width:container.width,
               height:container.height};


    for(let i in app.session.parameter_set.parameter_set_group_gates)
    {
        if(app.check_group_gate_intersection(rect1, obj.parameter_set_group, player_id, i))
        {
            break;
        }
    }
},

/**
 * update group_gates
 */
update_group_gates: function update_group_gates()
{
    for(let i in app.session.parameter_set.parameter_set_group_gates)
    {
        let group_gate = app.session.parameter_set.parameter_set_group_gates[i];
        let group_gate_container = pixi_group_gates[i].group_gate_container;

        if((app.session.world_state.current_period >= group_gate.period_on &&
           app.session.world_state.current_period < group_gate.period_off))
        {
            group_gate_container.visible = true;
        }
        else
        {
            group_gate_container.visible = false;
        }
    }
},