{%if session.parameter_set.test_mode%}

/**
 * do random self test actions
 */
random_number(min, max){
    //return a random number between min and max
    min = Math.ceil(min);
    max = Math.floor(max+1);
    return Math.floor(Math.random() * (max - min) + min);
},

random_string(min_length, max_length){

    let s = "";
    let r = app.random_number(min_length, max_length);

    for(let i=0;i<r;i++)
    {
        let v = app.random_number(48, 122);
        s += String.fromCharCode(v);
    }

    return s;
},

do_test_mode(){
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
 do_test_mode_instructions()
 {
    if(app.session_player.instructions_finished) return;
    if(app.working) return;
    
   
    if(app.session_player.current_instruction == app.session_player.current_instruction_complete)
    {

        if(app.session_player.current_instruction == app.instruction_pages.length)
            document.getElementById("instructions_start_id").click();
        else
            document.getElementById("instructions_next_id").click();

    }else
    {
        //take action if needed to complete page
        switch (app.session_player.current_instruction)
        {
            case 1:
                break;
            case 2:
                
                break;
            case 3:
                
                break;
            case 4:
                
                break;
            case 5:
                break;
        }   
    }

    
 },

/**
 * test during run phase
 */
do_test_mode_run()
{
    //do chat
    let go = true;

    if(go)
        if(app.chat_text != "")
        {
            document.getElementById("send_chat_id").click();
            go=false;
        }
    
    if(app.session.world_state.finished) return;
        
    if(go)
        switch (app.random_number(1, 3)){
            case 1:
                app.do_test_mode_chat();
                break;
            
            case 2:                
                app.test_mode_move();
                break;
            case 3:
                
                break;
        }
},

/**
 * test mode chat
 */
do_test_mode_chat(){

    app.chat_text = app.random_string(5, 20);
},

/**
 * test mode move to a location
 */
test_mode_move(){

    if(app.session.world_state.finished) return;

    let obj = app.session.world_state_avatars.session_players[app.session_player.id];
    let current_period_id = app.session.session_periods_order[app.session.world_state.current_period-1];

    if(!current_period_id) return;
   
    if(!app.test_mode_location_target || 
        app.get_distance(app.test_mode_location_target,  obj.current_location) <= 25)
    {
        //if near target location, move to a new one
        let temp_local_group = app.session.parameter_set.parameter_set_players[app.session_player.parameter_set_player_id].parameter_set_group;
        if(app.random_number(1, 2) == 1)
        {
            //move to a random house in my group
            let go = true;
            while(go)
            {
                let temp_id = app.random_number(0,app.session.parameter_set.parameter_set_players_order.length-1);
                let player_id = app.session.parameter_set.parameter_set_players_order[temp_id];
                let parameter_set_player = app.session.parameter_set.parameter_set_players[player_id];

                if(parameter_set_player.parameter_set_group == temp_local_group)
                {
                    go = false;
                    app.test_mode_location_target = {x:parameter_set_player.house_x + app.random_number(-100, 100),
                                                     y:parameter_set_player.house_y + app.random_number(-100, 100)};
                }
            }
        }
        else
        {
            //move to a random grove in my group
            let go = true;
            while(go)
            {
                let temp_id = app.random_number(0,app.session.parameter_set.parameter_set_groves_order.length-1);
                let grove_id = app.session.parameter_set.parameter_set_groves_order[temp_id];
                let parameter_set_grove = app.session.parameter_set.parameter_set_groves[grove_id];

                if(parameter_set_grove.parameter_set_group == temp_local_group)
                {
                    go = false;
                    app.test_mode_location_target = {x:parameter_set_grove.x + app.random_number(-100, 100),
                                                     y:parameter_set_grove.y + app.random_number(-100, 100)};
                }
            }
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
{%endif%}