{%if session.parameter_set.test_mode%}

/**
 * do random self test actions
 */
random_number: function random_number(min, max){
    //return a random number between min and max
    min = Math.ceil(min);
    max = Math.floor(max+1);
    return Math.floor(Math.random() * (max - min) + min);
},

random_string: function random_string(min_length, max_length){

    let s = "";
    let r = app.random_number(min_length, max_length);

    for(let i=0;i<r;i++)
    {
        let v = app.random_number(48, 122);
        s += String.fromCharCode(v);
    }

    return s;
},

do_test_mode: function do_test_mode(){
    {%if DEBUG%}
    console.log("Do Test Mode");
    {%endif%}

    if(app.end_game_modal_visible && app.test_mode)
    {
        if(app.session_player.name == "")
        {
            Vue.nextTick(() => {
                app.session_player.name = app.random_string(5, 20);
                app.session_player.student_id =  app.random_number(1000, 10000);

                app.send_name();
            })
        }

        return;
    }

    if(app.session.started &&
       app.test_mode
       )
    {
        
        switch (app.session.world_state.current_experiment_phase)
        {
            case "Instructions":
                app.do_test_mode_instructions();
                break;
            case "Run":
                app.do_test_mode_run();
                break;
            
        }        
       
    }

    setTimeout(app.do_test_mode, app.random_number(1000 , 1500));
},

/**
 * test during instruction phase
 */
do_test_mode_instructions: function do_test_mode_instructions()
 {
    if(app.session_player.instructions_finished) return;
    if(app.working) return;
    
    let session_player = app.session.world_state_avatars.session_players[app.session_player.id];
    let parameter_set_player = app.session.parameter_set.parameter_set_players[session_player.parameter_set_player_id]
   
    if(app.session_player.current_instruction == app.session_player.current_instruction_complete)
    {

        if(app.session_player.current_instruction == app.instructions.instruction_pages.length)
            document.getElementById("instructions_start_id").click();
        else
            document.getElementById("instructions_next_id").click();

    }else
    {
        //take action if needed to complete page
         //update view when instructions changes
    switch(app.session_player.current_instruction){
        case app.instructions.action_page_move:      
            app.test_mode_move();
            return;      
            break; 
        case app.instructions.action_page_harvest:
            if(app.patch_modal_open)
            {
                app.do_test_mode_patch();
            }
            else if( app.test_mode_check_near_patch())
            {
                //do nothing
            }
            else if(session_player.current_location.x == session_player.target_location.x && 
                    session_player.current_location.y == session_player.target_location.y)
            {
                session_player.target_location = app.test_mode_move_to_patch();
            } 
            return;      
            break;  
        case app.instructions.action_page_house:      
            if(app.house_modal_open)
            {
                app.do_test_mode_house();
            }
            else if( app.test_mode_check_near_house())
            {
                //do nothing
            }
            else if(session_player.current_location.x == session_player.target_location.x && 
                    session_player.current_location.y == session_player.target_location.y)
            {
                session_player.target_location = {x:parameter_set_player.house_x, y:parameter_set_player.house_y};
            }  
            return;
            break;
        case app.instructions.action_page_sleep:  
            if(app.house_modal_open)
            {
                app.send_sleep();
            }
            else if( app.test_mode_check_near_house())
            {
                //do nothing
            }
            else if(session_player.current_location.x == session_player.target_location.x && 
                    session_player.current_location.y == session_player.target_location.y)
            {
                session_player.target_location = {x:parameter_set_player.house_x, y:parameter_set_player.house_y};
            }          
            return;      
            break;
        case app.instructions.action_page_attacks:        
            if(app.avatar_modal_open)
            {
                app.send_attack_avatar();
            }
            else if( app.test_mode_check_near_avatar())
            {
                //do nothing
            }
            else if(session_player.current_location.x == session_player.target_location.x && 
                    session_player.current_location.y == session_player.target_location.y)
            {
                session_player.target_location = app.test_mode_move_to_avatar();
            }   
            return;      
            break;
    }   
    }

    
 },

/**
 * test during run phase
 */
do_test_mode_run: function do_test_mode_run()
{
    if(app.session.world_state.finished) return;
    if(app.session.world_state.avatars[app.session_player.id].sleeping) return;

    //do chat
    let go = true;

    if(go)
    {
        if(app.chat_text != "")
        {
            document.getElementById("send_chat_id").click();
            go=false;
        }
    }
   
    if(go)
    {
        if(app.avatar_modal_open)
        {
            app.do_test_mode_avatar();
            go=false;
        }
        else if(app.house_modal_open)
        {
            app.do_test_mode_house();
            go=false;
        }
        else if(app.patch_modal_open)
        {
            app.do_test_mode_patch();
            go=false;
        }
        else if(app.field_modal_open)
        {
            app.do_test_mode_field();
            go=false;
        }
        else if(app.avatar_attack_modal_open)
        {
            app.do_test_mode_avatar_attack();
            go=false;
        }
    }
        
    if(go)
    {
        switch (app.random_number(1, 6)){
            case 1:
                app.do_test_mode_chat();
                break;            
            case 2:                
                app.test_mode_move();
                break;
            case 3:
                app.test_mode_check_near_patch();
                break;
            case 4:
                app.test_mode_check_near_house();
                break;
            case 5:
                app.test_mode_check_near_avatar();
                break;
            case 6:
                app.do_test_mode_emoji();
                break;
        }
    }
},

/**
 * avatar modal is open 
 * */
do_test_mode_avatar: function do_test_mode_avatar()
{
    if(!app.selected_avatar.avatar) app.avatar_modal.hide();

    if(app.random_number(1, 2) == 1 && 
       app.session.parameter_set.allow_attacks=='True' &&
       app.selected_avatar.good_one_move == 0 && 
       app.selected_avatar.good_two_move == 0 && 
       app.selected_avatar.good_three_move == 0)
    {
        app.show_attack_avatar();
    }
    else if (app.selected_avatar.good_one_available>0 || app.selected_avatar.good_two_available>0 || app.selected_avatar.good_three_available>0)
    {
        if(app.selected_avatar.good_one_move == 0 && app.selected_avatar.good_two_move == 0 && app.selected_avatar.good_three_move == 0)
        {
            app.selected_avatar.good_one_move = app.random_number(0, app.selected_avatar.good_one_available);
            app.selected_avatar.good_two_move = app.random_number(0, app.selected_avatar.good_two_available);
            app.selected_avatar.good_three_move = app.random_number(0, app.selected_avatar.good_three_available);
        }
        else
        {
            app.send_move_fruit_to_avatar();
        }
    }
    else
    {
        app.avatar_modal.hide();
    }
},

/**
 * house modal is open
 */
do_test_mode_house: function do_test_mode_house()
{
    if(!app.selected_house.house) app.house_modal.hide();
    
    if(app.session.world_state.time_remaining <= app.session.parameter_set.night_length)
    {
        app.send_sleep();
        return;
    }

    if(app.selected_house.house.session_player = app.session_player.id)
    {
        //local player's house
        if(app.random_number(1, 2) == 1)
        {
            app.selected_house.direction = "avatar_to_house";
        }
        else
        {
            app.selected_house.direction = "house_to_avatar";
        }
    }
   
    if(app.selected_house.direction == "avatar_to_house")
    {
        if(app.selected_house.good_one_avatar_available > 0 || 
           app.selected_house.good_two_avatar_available > 0 || 
           app.selected_house.good_three_avatar_available)
        {
            app.selected_house.good_one_move = app.random_number(0, app.selected_house.good_one_avatar_available);
            app.selected_house.good_two_move = app.random_number(0, app.selected_house.good_two_avatar_available);
            app.selected_house.good_three_move = app.random_number(0, app.selected_house.good_three_avatar_available);

            app.send_move_fruit_house();
        }
        else
        {
            app.house_modal.hide();
        }
    }
    else
    {
        if(app.selected_house.good_one_house_available > 0 || 
           app.selected_house.good_two_house_available > 0 || 
           app.selected_house.good_three_house_available)
        {
            app.selected_house.good_one_move = app.random_number(0, app.selected_house.good_one_house_available);
            app.selected_house.good_two_move = app.random_number(0, app.selected_house.good_two_house_available);
            app.selected_house.good_three_move = app.random_number(0, app.selected_house.good_three_house_available);

            app.send_move_fruit_house();
        }
        else
        {
            app.house_modal.hide();
        }
    }
},

/**
 * patch modal is open
 */
do_test_mode_patch: function do_test_mode_patch()
{
    if(!app.selected_patch.patch) app.patch_modal.hide();

    if(app.selected_patch.harvest_amount == 0)
    {
        app.patch_modal.hide();        
    }
    else
    {
        app.send_patch_harvest();
    }

    
},

/**
 * field modal is open
 */
do_test_mode_field: function do_test_mode_field()
{
},

/**
 * avatar attack modal is open
 */
do_test_mode_avatar_attack: function do_test_mode_avatar_attack()
{
    if(app.random_number(1, 2) == 1 && 
       app.session.parameter_set.allow_attacks=='True' &&
       parseFloat(app.session.world_state.avatars[app.session_player.id].health)>=parseFloat(app.session.parameter_set.attack_cost) &&
       app.session.world_state_avatars.session_players[app.session_player.id].cool_down==0)
    {
        app.send_attack_avatar();
    }
    else
    {
        app.avatar_attack_modal.hide();
    }
},

/**
 * test mode chat
 */
do_test_mode_chat: function do_test_mode_chat()
{
    app.chat_text = app.random_string(5, 20);
},

/**
 * test mode emoji
 */
do_test_mode_emoji: function do_test_mode_emoji()
{
    let emote_number = app.random_number(1, 3);

    if(emote_number == 1)
    {
        app.send_emoji("happy");
    }
    else if(emote_number == 2)
    {
        app.send_emoji("sad");
    }
    else
    {
        app.send_emoji("angry");
    }
},

/**
 * test mode move to a location
 */
test_mode_move: function test_mode_move()
{

    if(app.session.world_state.finished) return;

    let obj = app.session.world_state_avatars.session_players[app.session_player.id];
    let current_period_id = app.session.session_periods_order[app.session.world_state.current_period-1];

    if(!current_period_id) return;
   
    if(!app.test_mode_location_target || 
        app.get_distance(app.test_mode_location_target,  obj.current_location) <= 25)
    {
        //if near target location, move to a new one
        
        if(app.random_number(1, 2) == 1)
        {
            app.test_mode_location_target = app.test_mode_move_to_house();
        }
        else
        {
            app.test_mode_location_target = app.test_mode_move_to_patch();
        }
        
    }
    else if(app.get_distance(app.test_mode_location_target,  obj.current_location)<1000)
    {
        //object is close move to it
        obj.target_location = app.test_mode_location_target;
    }
    else
    {
        //if far from target location, move to intermediate location
        obj.target_location = app.get_point_from_angle_distance(obj.current_location.x, 
                                                        obj.current_location.y,
                                                        app.test_mode_location_target.x,
                                                        app.test_mode_location_target.y,
                                                        app.random_number(300,1000))
    }

    app.target_location_update();
},

/**
 * move to random house test mode
 */
test_mode_move_to_house: function test_mode_move_to_house()
{
    let temp_local_group = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].parameter_set_group;
    let go = true;
    while(go)
    {
        let temp_id = app.random_number(0,app.session.parameter_set.parameter_set_players_order.length-1);
        let player_id = app.session.parameter_set.parameter_set_players_order[temp_id];
        let parameter_set_player = app.session.parameter_set.parameter_set_players[player_id];

        if(parameter_set_player.parameter_set_group == temp_local_group)
        {
            return {x:parameter_set_player.house_x + app.random_number(-100, 100),
                    y:parameter_set_player.house_y + app.random_number(-100, 100)};
        }
    }
},

/**
 * move to random player test mode
 */
test_mode_move_to_avatar: function test_mode_move_to_avatar()
{
    let temp_local_group = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].parameter_set_group;
    let go = true;
    while(go)
    {
        let temp_id = app.random_number(0,app.session.parameter_set.parameter_set_players_order.length-1);
        let player_id = app.session.parameter_set.parameter_set_players_order[temp_id];
        let parameter_set_player = app.session.parameter_set.parameter_set_players[player_id];

        if(parameter_set_player.parameter_set_group == temp_local_group)
        {
            return {x:parameter_set_player.start_x + app.random_number(-100, 100),
                    y:parameter_set_player.start_y + app.random_number(-100, 100)};
        }
    }
},

/**
 * move to random patch test mode
 */
test_mode_move_to_patch: function test_mode_move_to_patch()
{
    let temp_local_group = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].parameter_set_group;
    let go = true;
    while(go)
    {
        let temp_id = app.random_number(0,app.session.parameter_set.parameter_set_patches_order.length-1);
        let patch_id = app.session.parameter_set.parameter_set_patches_order[temp_id];
        let parameter_set_patch = app.session.parameter_set.parameter_set_patches[patch_id];

        if(parameter_set_patch.parameter_set_group == temp_local_group)
        {
            return {x:parameter_set_patch.x + app.random_number(-100, 100),
                    y:parameter_set_patch.y + app.random_number(-100, 100)};
        }
    }
},

/**
 * if near patch open harvest modal
 */
test_mode_check_near_patch: function test_mode_check_near_patch()
{
    let avatar = app.session.world_state.avatars[app.session_player.id];

    if(avatar.period_patch_harvests>=app.session.parameter_set.max_patch_harvests)
    {
        app.patch_modal.hide();
        return false;
    }

    for(let i=0;i<app.session.parameter_set.parameter_set_patches_order.length;i++)
    {
        let patch_id = app.session.parameter_set.parameter_set_patches_order[i];
        let patch = app.session.parameter_set.parameter_set_patches[patch_id];

        if(app.get_distance(patch, app.session.world_state_avatars.session_players[app.session_player.id].current_location) < app.session.parameter_set.interaction_range)
        {
            app.subject_pointer_up_action(2, patch)

            return true;
        }
    }

    return false
},

/**
 * if near house open house modal
 */
test_mode_check_near_house: function test_mode_check_near_house()
{
    for(let i=0;i<app.session.parameter_set.parameter_set_players_order.length;i++)
    {
        let player_id = app.session.parameter_set.parameter_set_players_order[i];
        let house = app.session.parameter_set.parameter_set_players[player_id];
        let house_location = {x:house.house_x, y:house.house_y};

        if(app.get_distance(house_location, app.session.world_state_avatars.session_players[app.session_player.id].current_location) < app.session.parameter_set.interaction_range)
        {
            app.subject_pointer_up_action(2, house_location)
            break;
        }
    }
},

/**
 * if near avatar open avatar modal
 */
test_mode_check_near_avatar: function test_mode_check_near_avatar()
{

    for(i in app.session.world_state_avatars.session_players) 
    {
        let avatar = app.session.world_state_avatars.session_players[i];
        if(parseInt(i) == app.session_player.id) continue;

        if(app.get_distance(avatar.current_location, app.session.world_state_avatars.session_players[app.session_player.id].current_location) <= app.session.parameter_set.interaction_range)
        {
            app.subject_pointer_up_action(2, avatar.current_location)
            break;
        }
    }
        
},
{%endif%}