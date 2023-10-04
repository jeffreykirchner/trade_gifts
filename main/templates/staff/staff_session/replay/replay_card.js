/**
 * send request to load session events
 */
send_load_session_events: function send_load_session_events()
{
    app.working = true;
    app.send_message("load_session_events", {});       
    app.send_load_world_state(1, app.session.parameter_set.period_length);
},

/**
 * take load session events
 */
take_load_session_events: function take_load_session_events(message_data)
{
    if(message_data.value == "fail")
    {
        
    }
    else
    {
        app.session_events = message_data.session_events;
        
        // app.session.world_state = message_data.world_state_initial;
    }
},

send_load_world_state: function send_load_world_state(period_number, time_remaining)
{
    app.working = true;
    app.send_message("load_world_state", {period_number : period_number, time_remaining:time_remaining}); 
},

take_load_world_state: function take_loadd_current_world_state(message_data)
{
    if(message_data.value == "fail")
    {
          
    }
    else
    {
        app.session.world_state = message_data.world_state;
        app.session.world_state_avatars = message_data.world_state_avatars;
        
        Vue.nextTick(() => {
            app.destory_setup_pixi_subjects();
            app.do_reload();             
            app.session.world_state["current_experiment_phase"] = "Done";       
        });
    }
},

/**
 * update the replay mode
 */
update_replay_mode: function update_replay_mode(new_replay_mode)
{
    app.replay_mode = new_replay_mode;

    if(app.replay_mode == "playing")
    {
        app.replay_mode_play();
    }
},

/**
 * replay mode play
 */
replay_mode_play: function replay_mode_play()
{
    if(app.replay_mode == "paused") return;

    app.process_replay_events();

    if(app.session.world_state.time_remaining > 0)
    {
        app.session.world_state.time_remaining--;
    }
    else if(app.session.world_state.current_period == app.session.parameter_set.period_count)
    {
        //end of the session
        return;
    }
    else
    {
        app.session.world_state.current_period++;

        app.session.world_state.time_remaining = app.session.parameter_set.period_length;

        if(app.session.current_period % app.session.parameter_set.break_frequency == 0)
        {
            app.session.world_state.time_remaining += app.session.parameter_set.break_length;
        }
    }

    app.replay_timeout = setTimeout(app.replay_mode_play,1000);
},

/**
 * reset replay mode
 */
reset_replay: function reset_replay()
{
    app.replay_mode = "paused";
    if (app.replay_timeout) clearTimeout(app.replay_timeout);
    app.send_load_world_state(1, app.session.parameter_set.period_length);
},

/**
 * process replay events
 */
process_replay_events: function process_replay_events()
{
    let current_period = app.session.world_state.current_period;
    let time_remaining = app.session.world_state.time_remaining;

    for(i in app.session_events[current_period][time_remaining])
    {
        switch(i.type)
        {
            case "attack_avatar":
                break;
            case "chat":
                break;
            case "emote":
                break;        
            case "hat_avatar":
                break;
            case "hat_avatar_cancel":
                break;    
            case "move_fruit_house":
                break;
            case "move_fruit_to_avatar":
                break;
            case "patch_harvest":
                break;
            case "sleep":
                break;
            case "target_locations":
                break;           
        }
    }
},