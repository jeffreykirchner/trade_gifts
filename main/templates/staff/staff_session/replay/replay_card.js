/**
 * send request to load session events
 */
send_load_session_events: function send_load_session_events()
{
    app.working = true;
    app.send_message("load_session_events", {});       
    app.send_load_world_state(1, app.session.parameter_set.period_length-1);
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
        // app.session.world_state["current_experiment_phase"] = "Done";
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
            app.do_reload();                    
        });
    }
},