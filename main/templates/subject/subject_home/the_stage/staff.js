/**
 * add scroll buttons to staff screen
 */
add_scroll_button(button_size, name, text)
{
    let g = new PIXI.Graphics();
    g.lineStyle(1, 0x000000);
    g.beginFill(0xffffff);
    g.drawRect(0, 0, button_size.w, button_size.h);
    g.pivot.set(button_size.w/2, button_size.h/2);
    g.endFill();
    g.lineStyle(1, 0x000000);
    g.x=button_size.x;
    g.y=button_size.y;
    g.eventMode='static';
    g.alpha = 0.5;
    g.name = name;

    g.on("pointerover", app.staff_screen_scroll_button_over);
    g.on("pointerout", app.staff_screen_scroll_button_out);

    let label = new PIXI.Text(text,{fontFamily : 'Arial',
                                    fontWeight:'bold',
                                    fontSize: 28,       
                                    lineHeight : 14,                             
                                    align : 'center'});
    label.pivot.set(label.width/2, label.height/2);
    label.x = button_size.w/2;
    label.y = button_size.h/2-3;
    g.addChild(label);

    pixi_app.stage.addChild(g);

    return g
},

/**
 * update zoom level on staff screen
 */
update_zoom()
{
    if(app.pixi_mode == "subject") return;
    if(app.pixi_scale == app.pixi_scale_range_control) return;
    
   
    let zoom_direction = 1;
    if(app.pixi_scale_range_control > app.pixi_scale)
    {
        zoom_direction = -1;
    }

    app.pixi_scale = app.pixi_scale_range_control;
    pixi_container_main.scale.set(app.pixi_scale);
},

/**
 * fit staff display to screen
 */
fit_to_screen()
{
    if(app.pixi_mode == "subject") return;
    
    app.current_location.x = app.stage_width/2;
    app.current_location.y = app.stage_height/2;

    let zoom_factor = Math.min(app.canvas_width / app.stage_width, app.canvas_height / app.stage_height);

    app.pixi_scale_range_control = zoom_factor;
    app.pixi_scale = app.pixi_scale_range_control;
    pixi_container_main.scale.set(app.pixi_scale);
},

/**
 * manaully scroll staff screen
 */
scroll_staff(delta)
{
    app.current_location.x += app.scroll_direction.x;
    app.current_location.y += app.scroll_direction.y;
},

/**
 * staff screen offset from origin
 */
get_offset_staff()
{
    if(app.follow_subject != -1 && app.session.started)
    {
        obj = app.session.world_state_avatars.session_players[app.follow_subject];
        app.current_location = Object.assign({}, obj.current_location);
    }

    return {x:app.current_location.x * app.pixi_scale - pixi_app.screen.width/2,
            y:app.current_location.y * app.pixi_scale - pixi_app.screen.height/2};
},

/**
 *scroll control for staff
 */
 staff_screen_scroll_button_over(event)
 {
     event.currentTarget.alpha = 1;  
     app.scroll_direction = event.currentTarget.name.scroll_direction;
 },
 
 /**
  *scroll control for staff
  */
 staff_screen_scroll_button_out(event)
 {
     event.currentTarget.alpha = 0.5;
     app.scroll_direction = {x:0, y:0};
 },

/**
 * update the amount of shift needed for the staff view
 */
update_offsets_staff(delta)
{
    let offset = app.get_offset_staff();

    pixi_container_main.x = -offset.x;
    pixi_container_main.y = -offset.y;   
},