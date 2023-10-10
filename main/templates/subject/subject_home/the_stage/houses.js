/**
 * setup house objects
 */
setup_pixi_houses: function setup_pixi_houses()
{
    for(const i in app.session.parameter_set.parameter_set_players)
    {
        pixi_houses[i] = {};
      
        let parameter_set_player = app.session.parameter_set.parameter_set_players[i];

        let house_container = new PIXI.Container();
        house_container.eventMode = 'passive';
        house_container.zIndex = 80;
        
        house_container.position.set(parameter_set_player.house_x, parameter_set_player.house_y)

        //house background
        let house_sprite = PIXI.Sprite.from(app.pixi_textures["house_tex"]);
        house_sprite.anchor.set(0.5);
        house_sprite.eventMode = 'passive';
        house_sprite.tint = parameter_set_player.hex_color //'BlanchedAlmond';

        //owner label
        let owner_label = new PIXI.Text(parameter_set_player.id_label, {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 'black',
        });
        owner_label.eventMode = 'passive'; 
        owner_label.anchor.set(.5, 1);

        //health label
        let health_label = new PIXI.Text("Health: +000", {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 'black',
        });
        health_label.eventMode = 'passive'; 
        health_label.anchor.set(.5, 1);

        //good one        
        let good_one_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_player.good_one+"_tex"]);
        good_one_sprite.anchor.set(1, 0.5);
        good_one_sprite.eventMode = 'passive';

        let good_one_label = new PIXI.Text("000", {
            fontFamily: 'Arial',
            fontSize: 60,
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2,
        });
        good_one_label.eventMode = 'passive'; 
        good_one_label.anchor.set(0, 0.5);

        //good two        
        let good_two_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_player.good_two+"_tex"]);
        good_two_sprite.anchor.set(1, 0.5);
        good_two_sprite.eventMode = 'passive';

        let good_two_label = new PIXI.Text("000", {
            fontFamily: 'Arial',
            fontSize: 60,
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2,
        });
        good_two_label.eventMode = 'passive'; 
        good_two_label.anchor.set(0, 0.5);

        //good three       
        if(app.session.parameter_set.good_mode == "Three")
        { 
            var good_three_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_player.good_three+"_tex"]);
            good_three_sprite.anchor.set(1, 0.5);
            good_three_sprite.eventMode = 'passive';

            var good_three_label = new PIXI.Text("000", {
                fontFamily: 'Arial',
                fontSize: 60,
                fill: 'white',
                stroke: 'black',
                strokeThickness: 2,
            });
            good_three_label.eventMode = 'passive'; 
            good_three_label.anchor.set(0, 0.5);
        }

        house_container.addChild(house_sprite);
        house_container.addChild(owner_label);
        house_container.addChild(health_label);

        house_container.addChild(good_one_sprite);
        house_container.addChild(good_one_label);

        house_container.addChild(good_two_sprite);
        house_container.addChild(good_two_label);

        if(app.session.parameter_set.good_mode == "Three")
        {
            house_container.addChild(good_three_sprite);
            house_container.addChild(good_three_label);
        }
        
        owner_label.position.set(0, -house_sprite.height/4);
        health_label.position.set(0, house_sprite.height/2 - 5);

        if(app.session.parameter_set.good_mode == "Three")
        {
            let good_spacer = house_sprite.height/5+2;
            good_one_sprite.position.set(-10, house_sprite.height/2 - good_spacer*3);
            good_one_label.position.set(0, house_sprite.height/2 - good_spacer*3);

            good_two_sprite.position.set(-10, house_sprite.height/2 - good_spacer*2);
            good_two_label.position.set(0, house_sprite.height/2 - good_spacer*2);

            good_three_sprite.position.set(-10, house_sprite.height/2 - good_spacer);
            good_three_label.position.set(0, house_sprite.height/2 - good_spacer);
        }
        else
        {
            let good_spacer = house_sprite.height/4+2;
            good_one_sprite.position.set(-10, house_sprite.height/2 - good_spacer*2);
            good_one_label.position.set(0, house_sprite.height/2 - good_spacer*2);

            good_two_sprite.position.set(-10, house_sprite.height/2 - good_spacer);
            good_two_label.position.set(0, house_sprite.height/2 - good_spacer);
        }

        pixi_houses[i].house_container = house_container;
        pixi_houses[i].owner_label = owner_label;
        pixi_houses[i].health_label = health_label;
        pixi_houses[i][parameter_set_player.good_one] = good_one_label;
        pixi_houses[i][parameter_set_player.good_two] = good_two_label;
        if(app.session.parameter_set.good_mode == "Three") pixi_houses[i][parameter_set_player.good_three] = good_three_label;

        pixi_houses[i].house_container.width = app.session.parameter_set.house_width;
        pixi_houses[i].house_container.height = app.session.parameter_set.house_height;

        pixi_container_main.addChild(pixi_houses[i].house_container);
    }

    app.update_house_inventory();
},

/**
 * update house inventory
 */
update_house_inventory: function update_house_inventory()
{
    if(!app.session.world_state["started"]) return;
    
    for(const i in app.session.world_state.houses)
    {
        const house = app.session.world_state.houses[i];
        const parameter_set_player = app.session.parameter_set.parameter_set_players[i];

        pixi_houses[i][parameter_set_player.good_one].text = house[parameter_set_player.good_one];
        pixi_houses[i][parameter_set_player.good_two].text = house[parameter_set_player.good_two];
        if(app.session.parameter_set.good_mode == "Three") pixi_houses[i][parameter_set_player.good_three].text = house[parameter_set_player.good_three];

        pixi_houses[i].health_label.text = "Health: +" + house.health_value;
    }
},

/**
 * subject house click
 */
subject_house_click: function subject_house_click(target_house_id)
{
    //if(target_house_id == app.session_player.id) return;

    // console.log("subject avatar click", target_house_id);
    let session_player = app.session.world_state_avatars.session_players[app.session_player.id];
    let parameter_set_player_id = session_player.parameter_set_player_id;

    let session_player_house = app.session.world_state.avatars[app.session.world_state.houses[target_house_id].session_player];
    let parameter_set_player_house = app.session.parameter_set.parameter_set_players[session_player_house.parameter_set_player_id];

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        if( app.session.world_state.houses[target_house_id].session_player != app.session_player.id)
        {
            app.add_text_emitters("During the instructions, please interact with your house.", 
                                    parameter_set_player_house.house_x, 
                                    parameter_set_player_house.house_y,
                                    parameter_set_player_house.house_x,
                                    parameter_set_player_house.house_y-100,
                                    0xFFFFFF,
                                    28,
                                    null);

            return;
        }
    }

    app.selected_house.house = app.session.world_state.houses[target_house_id];
    app.selected_house.target_house_id = target_house_id;

    app.selected_house.parameter_set_player = parameter_set_player_house;

    app.selected_house.good_one_move = 0;
    app.selected_house.good_two_move = 0;
    app.selected_house.good_three_move = 0;
    app.selected_house.direction = "avatar_to_house";

    app.selected_house.good_one = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_one;
    app.selected_house.good_two = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_two;
    app.selected_house.good_three = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_three;

    app.selected_house.good_one_avatar_available = app.session.world_state.avatars[app.session_player.id][app.selected_house.good_one];
    app.selected_house.good_two_avatar_available = app.session.world_state.avatars[app.session_player.id][app.selected_house.good_two];
    app.selected_house.good_three_avatar_available = app.session.world_state.avatars[app.session_player.id][app.selected_house.good_three];

    app.selected_house.good_one_house_available = app.session.world_state.houses[target_house_id][app.selected_house.good_one];
    app.selected_house.good_two_house_available = app.session.world_state.houses[target_house_id][app.selected_house.good_two];
    app.selected_house.good_three_house_available = app.session.world_state.houses[target_house_id][app.selected_house.good_three];

    app.clear_main_form_errors();
    app.house_modal.show();
    app.house_modal_open = true;
    app.working = false;
    app.house_error = null;
},

/**
 * hide house modal
 */
hide_house_modal: function hide_house_modal()
{
    app.selected_house.house = null;
    app.house_modal_open = false;
    app.working = false;
    app.house_error = null;
},

/**
 * send move fruit house
 */
send_move_fruit_house: function send_move_fruit_house()
{
    if(!app.session.world_state["started"]) return;
    if(!app.selected_house.house) return;

    app.clear_main_form_errors();

    let avatar = app.session.world_state.avatars[app.session_player.id];
    let house = app.session.world_state.houses[app.selected_house.target_house_id];

    if(app.selected_house.good_one_move <= 0 && 
       app.selected_house.good_two_move <= 0 && 
       app.selected_house.good_three_move <= 0)
    {
        app.display_errors({good_one_move_house: ["Invalid Amount"], 
                            good_two_move_house: ["Invalid Amount"], 
                            good_three_move_house: ["Invalid Amount"]});
        return;
    }

    let g1_max = 0;
    let g2_max = 0;
    let g3_max = 0;
    if(app.selected_house.direction == "avatar_to_house")
    {
        g1_max = avatar[app.selected_house.good_one];
        g2_max = avatar[app.selected_house.good_two];
        g3_max = avatar[app.selected_house.good_three];

        app.selected_house.good_one_avatar_available = g1_max
        app.selected_house.good_two_avatar_available = g2_max
        app.selected_house.good_three_avatar_available = g3_max
    }
    else
    {
        g1_max = house[app.selected_house.good_one];
        g2_max = house[app.selected_house.good_two];
        g3_max = house[app.selected_house.good_three];

        app.selected_house.good_one_house_available = g1_max
        app.selected_house.good_two_house_available = g2_max
        app.selected_house.good_three_house_available = g3_max
    }

    if(app.selected_house.good_one_move > g1_max)
    {
        app.display_errors({good_one_move_house: ["Invalid Amount"]});
        return;
    }

    if(app.selected_house.good_two_move > g2_max)
    {
        app.display_errors({good_two_move_house: ["Invalid Amount"]});
        return;
    }

    if(app.selected_house.good_three_move > g3_max)
    {
        app.display_errors({good_three_move_house: ["Invalid Amount"]});
        return;
    }

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.send_move_fruit_house_instructions();
    }
    else
    {
        app.working = true;
        
        app.send_message("move_fruit_to_house", 
                        {"good_one_move" : app.selected_house.good_one_move,
                        "good_two_move" : app.selected_house.good_two_move,
                        "good_three_move" : app.selected_house.good_three_move,
                        "direction" : app.selected_house.direction,
                        "target_house_id" : app.selected_house.target_house_id},
                        "group"); 
    }
},

/**
 * send fruit to/from house instructions
 */
send_move_fruit_house_instructions: function send_move_fruit_house_instructions()
{

    if(app.session_player.current_instruction != app.instructions.action_page_house) return;

    app.session_player.current_instruction_complete = app.instructions.action_page_house;

    // {
    //     "status": "success",
    //     "error_message": [],
    //     "source_player_id": 273,
    //     "target_house_id": "181",
    //     "source_player": {
    //         "Cherry": 0,
    //         "health": 75,
    //         "earnings": "0",
    //         "sleeping": false,
    //         "Blueberry": 0,
    //         "Pineapple": 0,
    //         "period_patch_harvests": 1,
    //         "parameter_set_player_id": 181
    //     },
    //     "target_house": {
    //         "id": 181,
    //         "Cherry": 8,
    //         "Blueberry": 0,
    //         "Pineapple": 0,
    //         "health_value": "4.6",
    //         "session_player": 273
    //     },
    //     "good_one_move": 7,
    //     "good_two_move": 0,
    //     "good_three_move": 0,
    //     "direction": "avatar_to_house",
    //     "goods": {
    //         "good_one": "Cherry",
    //         "good_two": "Blueberry"
    //     }
    // }

    let good_one = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_one;
    let good_two = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_two;
    let good_three = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].good_three;

    message_data = {status:"success",
                    source_player_id:app.session_player.id,
                    target_house_id:app.selected_house.target_house_id,
                    source_player:app.session.world_state.avatars[app.session_player.id],
                    target_house:app.session.world_state.houses[app.selected_house.target_house_id],
                    good_one_move:app.selected_house.good_one_move,
                    good_two_move:app.selected_house.good_two_move,
                    good_three_move:app.selected_house.good_three_move,
                    direction:app.selected_house.direction,
                    goods:{good_one:good_one, good_two:good_two, good_three:good_three}};

    if(app.selected_house.direction == "avatar_to_house")
    {
        message_data.source_player[good_one] -= app.selected_house.good_one_move;
        message_data.source_player[good_two] -= app.selected_house.good_two_move;
        message_data.source_player[good_three] -= app.selected_house.good_three_move;

        message_data.target_house[good_one] += app.selected_house.good_one_move;
        message_data.target_house[good_two] += app.selected_house.good_two_move;
        message_data.target_house[good_three] += app.selected_house.good_three_move;
    }
    else
    {
        message_data.source_player[good_one] += app.selected_house.good_one_move;
        message_data.source_player[good_two] += app.selected_house.good_two_move;
        message_data.source_player[good_three] += app.selected_house.good_three_move;

        message_data.target_house[good_one] -= app.selected_house.good_one_move;
        message_data.target_house[good_two] -= app.selected_house.good_two_move;
        message_data.target_house[good_three] -= app.selected_house.good_three_move;
    }   

    message_data.target_house.health_value = app.calc_health_value(message_data.target_house[good_one],
                                                                   message_data.target_house[good_two],
                                                                   0);

    app.take_update_move_fruit_to_house(message_data);
},

calc_health_value: function calc_health_value(good_one, good_two, good_three)
{
    alpha = parseFloat(app.session.parameter_set["consumption_alpha"])
    beta = parseFloat(app.session.parameter_set["consumption_beta"])
    // good_one_amount = Decimal(good_one_amount)
    // good_two_amount = Decimal(good_two_amount)
    // # good_three_amount = good_three_amount

    // multipliers = parameter_set["consumption_multiplier"].split("\n")

    // if good_three_amount >= len(multipliers):
    //     multiplier = Decimal(multipliers[-1])
    // elif good_three_amount == 0:
    //     multiplier = 1
    // else:
    //     multiplier = Decimal(multipliers[good_three_amount-1])
    

    let health = (beta * parseFloat(good_one) ** (1/alpha) + beta * parseFloat(good_two) ** (1/alpha))**alpha
    // health *= Decimal(multiplier)

    return health.toFixed(1);
},

/**
 * take update from server about moving fruit to or from house
 */
take_update_move_fruit_to_house: function take_update_move_fruit_to_house(message_data)
{
    let source_player_id = message_data.source_player_id;

    if(message_data.status == "success")
    {
        let source_player_id = message_data.source_player_id;
        let target_house_id = message_data.target_house_id;

        app.session.world_state.avatars[source_player_id] = message_data.source_player;
        app.session.world_state.houses[target_house_id] = message_data.target_house;

        good_one_move = message_data.good_one_move;
        good_two_move = message_data.good_two_move;
        good_three_move = message_data.good_three_move;

        good_one = app.session.parameter_set.parameter_set_players[message_data.source_player.parameter_set_player_id].good_one;
        good_two = app.session.parameter_set.parameter_set_players[message_data.source_player.parameter_set_player_id].good_two;
        good_three = app.session.parameter_set.parameter_set_players[message_data.source_player.parameter_set_player_id].good_three;
        
        direction = message_data.direction;

        app.update_avatar_inventory();
        app.update_house_inventory();

        elements = [];
        house_location = {x:app.session.parameter_set.parameter_set_players[target_house_id].house_x,
                          y:app.session.parameter_set.parameter_set_players[target_house_id].house_y}

        if(direction == "avatar_to_house")
        {
       
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
                                  house_location,
                                  elements);
        }
        else
        {
            if(good_one_move > 0)
            {
                element = {source_change:"+" + good_one_move,
                           target_change:"-" + good_one_move, 
                           texture:app.pixi_textures[good_one+"_tex"]  }
                elements.push(element);
            }

            if(good_two_move > 0)
            {
                element = {source_change:"+" + good_two_move,
                           target_change:"-" + good_two_move,
                           texture:app.pixi_textures[good_two+"_tex"]  }
                elements.push(element);
            }

            if(good_three_move > 0)
            {
                element = {source_change:"+" + good_three_move,
                           target_change:"-" + good_three_move,
                           texture:app.pixi_textures[good_three+"_tex"]  }
                elements.push(element);
            }

            app.add_transfer_beam(house_location, 
                                  app.session.world_state_avatars.session_players[source_player_id].current_location,
                                  elements);

        }
        
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.house_modal.toggle();
            app.working = false;
        }
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.house_error = message_data.error_message[0].message;
            // app.working = false;
        }
    }
},

/**
* select all fruit for house movement   
*/
select_all_fruit_house: function select_all_fruit_house()
{
    let session_player = app.session.world_state.avatars[app.session_player.id];
    let house = app.session.world_state.houses[app.selected_house.target_house_id];

    if(app.selected_house.direction == "avatar_to_house")
    {
        app.selected_house.good_one_move = session_player[app.selected_house.good_one];
        app.selected_house.good_two_move = session_player[app.selected_house.good_two];
        app.selected_house.good_three_move = session_player[app.selected_house.good_three];
    }
    else
    {
        app.selected_house.good_one_move = house[app.selected_house.good_one];
        app.selected_house.good_two_move = house[app.selected_house.good_two];
        app.selected_house.good_three_move = house[app.selected_house.good_three];
    }
},

/**
 * send sleep to server
 */
send_sleep: function send_sleep()
{
    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.send_sleep_instructions();
    }
    else
    {
        app.working = true;
        app.send_message("sleep", {}, "group");
    }
   
},

/**
 * send sleep instructions
 */
send_sleep_instructions: function send_sleep_instructions()
{
    if(app.session_player.current_instruction != app.instructions.action_page_sleep) return;

    app.session_player.current_instruction_complete = app.instructions.action_page_sleep;

    // {
    //     "status": "success",
    //     "error_message": [],
    //     "source_player_id": 273,
    //     "source_player": {
    //         "Cherry": 0,
    //         "health": "68.00",
    //         "earnings": "85.1768000",
    //         "sleeping": true,
    //         "Blueberry": 0,
    //         "Pineapple": 0,
    //         "period_patch_harvests": 0,
    //         "parameter_set_player_id": 181
    //     }
    // }

    message_data = {status:"success",
                    source_player_id:app.session_player.id,
                    source_player:app.session.world_state.avatars[app.session_player.id]};

    message_data.source_player.sleeping = true;

    app.take_update_sleep(message_data);
},

/**
 * take update from server about sleeping
 */
take_update_sleep: function take_update_sleep(message_data)
{
    let source_player_id = message_data.source_player_id;

    app.session.world_state.avatars[source_player_id].sleeping = true;

    if(app.is_subject && source_player_id == app.session_player.id)
    {
        app.house_modal.hide();
        app.working = false;
    }
},

/**
 * show health emitters
 */
do_house_health_emitters: function do_house_health_emitters()
{
    for(let i in app.session.world_state.houses)
    {
        let house = app.session.world_state.houses[i]
        let session_player = app.session.world_state_avatars.session_players[house.session_player];
        let parameter_set_player = app.session.parameter_set.parameter_set_players[session_player.parameter_set_player_id];
        
        let health_sprite = PIXI.Sprite.from(app.pixi_textures["health_tex"]);
        health_sprite.scale.set(0.4);

        app.add_text_emitters("+" + house.health_consumed + " health from house.", 
            session_player.current_location.x, 
            session_player.current_location.y,
            session_player.current_location.x,
            session_player.current_location.y - 100,
            0xFFFFFF,
            28,
            health_sprite);
    }
},
