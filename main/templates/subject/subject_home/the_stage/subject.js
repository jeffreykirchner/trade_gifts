/**
 * subject screen offset from the origin
 */
get_offset: function get_offset()
{
    let obj = app.session.world_state_avatars.session_players[app.session_player.id];

    return {x:obj.current_location.x * app.pixi_scale - pixi_app.screen.width/2,
            y:obj.current_location.y * app.pixi_scale - pixi_app.screen.height/2};
},

/**
 * update the amount of shift needed to center the player
 */
update_offsets_player: function update_offsets_player(delta)
{
    offset = app.get_offset();

    pixi_container_main.x = -offset.x;
    pixi_container_main.y = -offset.y;   
    
    obj = app.session.world_state_avatars.session_players[app.session_player.id];

    pixi_target.x = obj.target_location.x;
    pixi_target.y = obj.target_location.y;
},

/**
 * setup subject screen status overlay
 */
setup_subject_status_overlay: function setup_subject_status_overlay()
{
    if(!app.session) return;
    if(app.pixi_mode!="subject") return;
    if(subject_status_overlay_container) subject_status_overlay_container.destroy();

    subject_status_overlay_container = new PIXI.Container();
    // subject_status_overlay_container.eventMode = 'none';
    subject_status_overlay_container.zIndex = 9999

    temp_y = 0;

    let text_style = {
        fontFamily: 'Arial',
        fontSize: 28,
        fill: 'white',
        align: 'left',
        stroke: {color:'black', width: 2},
    };

    //labels
    //current period
    let current_period_text = new PIXI.Text({text:'Current Period:', style:text_style});
    // current_period_text.eventMode = 'none';   

    subject_status_overlay_container.addChild(current_period_text);
    current_period_text.position.set(0, temp_y);

    temp_y += current_period_text.height+5;

    //time remaining
    let time_remaining_text = new PIXI.Text({text:'Time Remaining:', style:text_style});
    // time_remaining_text.eventMode = 'none';   

    subject_status_overlay_container.addChild(time_remaining_text);
    time_remaining_text.position.set(0, temp_y);

    temp_y += time_remaining_text.height+5;

    //profit
    let profit_text = new PIXI.Text({text:'Total Profit (¢):', style:text_style});
    // profit_text.eventMode = 'none';   

    subject_status_overlay_container.addChild(profit_text);
    profit_text.position.set(0, temp_y);

    temp_y += profit_text.height+30;

    //ring growth
    let ring_growth_text = new PIXI.Text({text:'Patch Growth\nper Period:', style:text_style});
    subject_status_overlay_container.addChild(ring_growth_text);
    ring_growth_text.position.set(0, temp_y);

    //amounts
    temp_y = 0;
    //current period 
    let current_period_label = new PIXI.Text({text:'NN', style:text_style});
    // current_period_label.eventMode = 'none';   

    subject_status_overlay_container.addChild(current_period_label);
    current_period_label.position.set(time_remaining_text.width+10, temp_y);

    temp_y += current_period_text.height+5;

    //time remaining 
    let time_remaining_label = new PIXI.Text({text:'00:00', style:text_style});
    // time_remaining_label.eventMode = 'none';   

    subject_status_overlay_container.addChild(time_remaining_label);
    time_remaining_label.position.set(time_remaining_text.width+10, temp_y);

    temp_y += time_remaining_text.height+5;

    //profit
    let profit_label = new PIXI.Text({text:'0000', style:text_style});
    // profit_label.eventMode = 'none';   

    subject_status_overlay_container.addChild(profit_label);
    profit_label.position.set(time_remaining_text.width+10, temp_y);

    temp_y += profit_label.height+30;

    //ring growth
    let patch_growth_example = app.session.parameter_set.patch_growth_example;
    let ring_growth_label = new PIXI.Text({text:patch_growth_example.replaceAll(',','\n') , style:text_style});
    // profit_label.eventMode = 'none';   

    subject_status_overlay_container.addChild(ring_growth_label);
    ring_growth_label.position.set(time_remaining_text.width+10, temp_y);


    subject_status_overlay_container.position.set(pixi_app.screen.width - subject_status_overlay_container.width-20, 20);
    
    pixi_app.stage.addChild(subject_status_overlay_container);

    app.update_subject_status_overlay();
},

/**
 * update subject overlay
 */
update_subject_status_overlay: function update_subject_status_overlay()
{
    if(!app.session) return;
    if(!app.session.world_state.hasOwnProperty('started')) return;
    if(!app.session.started) return;

    if(!subject_status_overlay_container) return;
    // subject_status_overlay_container.position.set(pixi_app.screen.width - subject_status_overlay_container.width-20, 20);

    subject_status_overlay_container.getChildAt(4).text = app.session.world_state.current_period;
    subject_status_overlay_container.getChildAt(5).text = app.session.world_state.time_remaining;
    subject_status_overlay_container.getChildAt(6).text = Number(app.session.world_state.avatars[app.session_player.id].earnings).toFixed(1);
},

/**
 * take rescue subject
 */
take_rescue_subject: function take_rescue_subject(message_data)
{
    let session_player = app.session.world_state_avatars.session_players[message_data.player_id];

    session_player.current_location = message_data.new_location; 
    session_player.target_location.x = message_data.new_location.x+1;
    session_player.target_location.y = message_data.new_location.y+1;

    if(message_data.player_id==app.session_player.id)
    {
       app.working = false;
    }
},