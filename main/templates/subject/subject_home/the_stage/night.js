/**
 * setup night
 */
setup_pixi_night: function setup_pixi_night()
{
    pixi_night.container = new PIXI.Container();
    pixi_night.container.eventMode = 'none';

    //night background
    let pixi_night_bg = new PIXI.Graphics();
    
    pixi_night_bg.width =  pixi_app.screen.width;
    pixi_night_bg.height =  pixi_app.screen.height;
    pixi_night_bg.lineStyle(1, 0x000000);
    pixi_night_bg.beginFill('black');
    pixi_night_bg.drawRect(0, 0, pixi_app.screen.width, pixi_app.screen.height);
    pixi_night_bg.endFill();

    //night label
    // let label = new PIXI.Text("",{fontFamily : 'Arial',
    //     fontWeight:'bold',
    //     fontSize: 40,   
    //     fill: 'white',                             
    //     align : 'center'});

    // label.pivot.set(label.width/2, label.height/2);
    // label.x =  pixi_app.screen.width/2;
    // label.y = pixi_app.screen.height - 100;

    // pixi_night.label = label;

    pixi_night.container.addChild(pixi_night_bg);
    //pixi_night.container.addChild(pixi_night.label);

    pixi_night.container.alpha = 0.5;
    pixi_app.stage.addChild(pixi_night.container);
},

/**
 * update night overlay
 */
update_pixi_night: function update_pixi_night()
{
    if(!pixi_night.container) return;
    
    //add notice
    if(app.session.world_state.time_remaining == app.session.parameter_set.night_length + 10)
    {
        app.add_notice(pixi_night.text_night_coming, 
                       app.session.world_state.current_period, 
                       app.session.parameter_set.night_length)
    }
    else if(app.session.world_state.time_remaining == app.session.parameter_set.night_length)
    {
        app.add_notice(pixi_night.text_night, app.session.world_state.current_period, 0)
    }

    //update night overlay
    if (app.session.world_state.time_remaining <= app.session.parameter_set.night_length)
    {
        pixi_night.container.visible = true;      
    }
    else if(app.session.world_state.time_remaining <= app.session.parameter_set.night_length + 5)
    {
        let alpha_offset = (app.session.parameter_set.night_length + 5) - app.session.world_state.time_remaining;

        pixi_night.container.alpha = alpha_offset * 0.1;
        pixi_night.container.visible = true;
    }
    else
    {
        pixi_night.container.visible = false;
    }
},