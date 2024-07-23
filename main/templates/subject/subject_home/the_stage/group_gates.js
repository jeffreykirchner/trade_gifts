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

        let labels_container = new PIXI.Container();
        
        outline.rect(0, 0, group_gate.width, group_gate.height);
        outline.fill({texture: app.pixi_textures['barrier_tex'], matrix:matrix});
       
        //groups labels
        let label = new PIXI.HTMLText({text:app.colorize_text(group_gate.text.replace('\\n', '<br>')), 
                                   style:{
                                        fontFamily: 'Arial',
                                        fontSize: 20,
                                        fill: 'white',
                                        align: 'center',
                                        stroke: "black",                                        
                                    }});
           
        label.anchor.set(0.5);   
        label.position.set(group_gate.width/2, group_gate.height/2-10);
        labels_container.addChild(label);
        // label.rotation = rotation;

        //player labels
        let label2_text = "Allowed: ---";

        let label2 = new PIXI.HTMLText({text:app.colorize_text(label2_text), 
                                        style:{
                                            fontFamily: 'Arial',
                                            fontSize: 28,
                                            fill: 'white',
                                            align: 'center',
                                            stroke: "black",                                        
                                        }});

        label2.anchor.set(0.5);   
        label2.position.set(group_gate.width/2, group_gate.height/2+35);
        labels_container.addChild(label2);

        group_gate_container.addChild(outline);
        group_gate_container.addChild(labels_container);
        // group_gate_container.addChild(label2);
        // 
        labels_container.position.set(outline.width/2, outline.height/2);
        labels_container.pivot.set(outline.width/2, outline.height/2);
        labels_container.rotation = rotation;
        
        
        //point marker
        // let pivot_point = new PIXI.Graphics();
    
        // pivot_point.rect(0, 0, 10, 10);
        // pivot_point.stroke({color:"purple", width:2});
        // pivot_point.position.set(labels_container.pivot.x, labels_container.pivot.y);
        // group_gate_container.addChild(pivot_point);

        pixi_group_gates[i].group_gate_container = group_gate_container;
        pixi_group_gates[i].label2 = label2;

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
    let parameter_set_player = app.session.parameter_set.parameter_set_players[obj.parameter_set_player_id];
    let container = pixi_avatars[player_id].bounding_box

    let rect1={x:obj.current_location.x - container.width/2 - 100,
               y:obj.current_location.y - container.height/2 - 100,
               width:container.width + 200,
               height:container.height + 200};


    for(let i in app.session.parameter_set.parameter_set_group_gates)
    {
        if(app.check_group_gate_intersection(rect1, parameter_set_player.parameter_set_group, player_id, i))
        {
            app.send_message("group_gate_access_request", 
                             {"player_id" : player_id,
                              "group_gate_id" : i,},
                             "group");
            break;
        }
    }
},

/**
 * take group gate access request
 */
// take_group_gate_access_request: function take_group_gate_access_request(message_data)
// {
//     if(message_data.status == "success")
//     {
//         app.session.world_state.group_gates[message_data.group_gate_id] = message_data.group_gate;

//         if(message_data.player_id == app.session_player.id)
//         {
//             let target_player = app.session.world_state_avatars.session_players[app.session_player.id];

//             app.add_text_emitters("Access Granted", 
//                                 target_player.current_location.x, 
//                                 target_player.current_location.y,
//                                 target_player.current_location.x,
//                                 target_player.current_location.y-100,
//                                 0xFFFFFF,
//                                 28,
//                                 null);
//         }

//         app.update_group_gates();
//     }
// },

/**
 * send group gate access revoke
*/
send_group_gate_access_revoke : function send_group_gate_access_revoke()
{
    //check if player is in home region
    let player_in_home_region = false;

    let session_player = app.session.world_state_avatars.session_players[app.session_player.id];
    let parameter_set_player = app.session.parameter_set.parameter_set_players[session_player.parameter_set_player_id];
    
    for(let i in app.session.parameter_set.parameter_set_grounds)
    {
        let parameter_set_ground = app.session.parameter_set.parameter_set_grounds[i];
        if(parameter_set_ground.parameter_set_group == parameter_set_player.parameter_set_group)
        {
            let rect = {x:parameter_set_ground.x, 
                        y:parameter_set_ground.y, 
                        width:parameter_set_ground.width, 
                        height:parameter_set_ground.height};
                
            if(app.check_point_in_rectagle(session_player.current_location, rect))
            {
                player_in_home_region = true;
                break;
            }
        }
    }

    if(!player_in_home_region) return;

    //check if player as access to group gate
    let player_in_group_gate = false;
    for(let i in app.session.world_state.group_gates)
    {
        let group_gate = app.session.world_state.group_gates[i];
        if(group_gate.allowed_players.includes(app.session_player.id))
        {
            player_in_group_gate = true;
            break;
        }
    }

    if(!player_in_group_gate) return;

    app.send_message("group_gate_access_revoke", 
                     {"player_id" : app.session_player.id,},
                      "group");
},

/**
 * take group gate access request
 */
// take_group_gate_access_revoke: function take_group_gate_access_revoke(message_data)
// {
//     if(message_data.status == "success")
//     {
//         let player_id = message_data.player_id;
//         for(i in app.session.world_state.group_gates)
//         {
//             let group_gate = app.session.world_state.group_gates[i];
//             const index = group_gate.allowed_players.indexOf(player_id);

//             if(index > -1) group_gate.allowed_players.splice(index, 1);
//         }
//         app.update_group_gates();
//     }
// },

/**
 * update group_gates
 */
update_group_gates: function update_group_gates()
{
    for(let i in app.session.world_state.group_gates)
    {
        let parameter_set_group_gate = app.session.parameter_set.parameter_set_group_gates[i];
        let group_gate = app.session.world_state.group_gates[i];
        let group_gate_container = pixi_group_gates[i].group_gate_container;

        if((app.session.world_state.current_period >= parameter_set_group_gate.period_on &&
            app.session.world_state.current_period < parameter_set_group_gate.period_off))
        {
            group_gate_container.visible = true;
        }
        else
        {
            group_gate_container.visible = false;
        }

        //update player labels
        let label2_text = "Allowed: ";

        if (group_gate.allowed_players.length == 0)
        {
            label2_text += "---";
        }
        else
        {
            for(let j=0;j<group_gate.allowed_players.length;j++)
            {
                let player_id = group_gate.allowed_players[j];
                let player = app.session.world_state_avatars.session_players[player_id];
                let parameter_set_player = app.session.parameter_set.parameter_set_players[player.parameter_set_player_id];

                if(j>0)
                    {
                    if(j == group_gate.allowed_players.length-1)
                    {
                        label2_text += " and ";
                    }
                    else
                    {
                        label2_text += ", ";
                    }
                }
                label2_text += parameter_set_player.id_label;
            }
        }

        pixi_group_gates[i].label2.text = app.colorize_text(label2_text);
    }
},