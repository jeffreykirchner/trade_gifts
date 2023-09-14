/**
 * add on screen notice to subject screen
 */
add_notice(text, end_period, end_time)
{
    pixi_notices.notices[pixi_notices_key++] = {text: text, end_period: end_period, end_time: end_time};
    app.update_notices();
},

/**
 * update notices on screen
 */
update_notices()
{
    if(pixi_notices.container)
    {
        pixi_notices.container.destroy();
    }

    let container = new PIXI.Container();

    let y_offset = 0;
    let completed = [];
    for(i in pixi_notices.notices)
    {
        let notice = pixi_notices.notices[i];

        if(notice.end_period<app.session.world_state.current_period || 
          (notice.end_period == app.session.world_state.current_period && notice.end_time >= app.session.world_state.time_remaining))
        {
            completed.push(i);
        }
        else
        {
            let label = new PIXI.Text(notice.text, {
                fontFamily: 'Arial',
                fontSize: 40,
                fill: 'white',
                align: 'center',
                stroke: 'black',
                strokeThickness: 2,
            });
            label.eventMode = 'passive';    
            label.anchor.set(0.5);

            container.addChild(label);        
            label.position.set(0, y_offset);

            y_offset -= 45;
        }      
    }

    // remove completed notices
    for(i in completed)
    {
        delete pixi_notices.notices[completed[i]];
    }

    // container.pivot.set(container.width/2, container.height/2);
    container.position.set(pixi_app.screen.width/2, pixi_app.screen.height-30);

    pixi_notices.container = container;
    pixi_app.stage.addChild( pixi_notices.container);
},

/**
 * remove all notices
 */
remove_all_notices()
{
    pixi_notices.notices = [];
    app.update_notices();
},