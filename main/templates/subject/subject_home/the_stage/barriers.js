/**
 * setup barrier objects
 */
setup_pixi_barrier()
{
    for(const i in app.session.parameter_set.parameter_set_barriers)
    {
        pixi_barriers[i] = {};

        const barrier = app.session.parameter_set.parameter_set_barriers[i];
        
        let barrier_container = new PIXI.Container();
        let rotation = app.degrees_to_radians(barrier.rotation);
        
        barrier_container.position.set(barrier.start_x,barrier.start_y)
        barrier_container.eventMode = 'none';

        //outline
        let outline = new PIXI.Graphics();
        //outline.lineStyle(1, 0x000000);
        scale = 100 / app.pixi_textures.barrier_tex.width;
        let matrix = new PIXI.Matrix(1,0,0,1,0,0);
        matrix.rotate(rotation);
        outline.beginTextureFill({texture: app.pixi_textures['barrier_tex'], matrix:matrix});  //, 
        outline.drawRect(0, 0, barrier.width, barrier.height);
       
        let label = new PIXI.Text(barrier.text.replace('\\n', '\n'), {
            fontFamily: 'Arial',
            fontSize: 40,
            fill: 'white',
            align: 'center',
            stroke: 'black',
            strokeThickness: 2,
        });
           
        label.anchor.set(0.5);   
        label.position.set(barrier.width/2, barrier.height/2);
        label.rotation = rotation;

        barrier_container.addChild(outline);
        barrier_container.addChild(label);

        pixi_barriers[i].barrier_container = barrier_container;

        pixi_container_main.addChild(pixi_barriers[i].barrier_container);
    }

    app.update_barriers();
},

/**
 * check barrier intersection
 */
check_barriers_intersection(rect1, parameter_set_group, parameter_set_player)
{
    for(let i in app.session.parameter_set.parameter_set_barriers)
    {        
        let temp_barrier = app.session.parameter_set.parameter_set_barriers[i];

        if((temp_barrier.parameter_set_groups.includes(parameter_set_group) ||
            temp_barrier.parameter_set_players.includes(parameter_set_player)) && 
           app.session.world_state.current_period >= temp_barrier.period_on &&
           app.session.world_state.current_period < temp_barrier.period_off)
        {
            let rect2={x:temp_barrier.start_x,
                       y:temp_barrier.start_y,
                       width:temp_barrier.width,
                       height:temp_barrier.height};

            if(app.check_for_rect_intersection(rect1, rect2))
            {  
                return true;
            }
        }
    }

    return false;
},

/**
 * update barriers
 */
update_barriers()
{
    for(let i in app.session.parameter_set.parameter_set_barriers)
    {
        let barrier = app.session.parameter_set.parameter_set_barriers[i];
        let barrier_container = pixi_barriers[i].barrier_container;

        if(app.session.world_state.current_period >= barrier.period_on &&
           app.session.world_state.current_period < barrier.period_off)
        {
            barrier_container.visible = true;
        }
        else
        {
            barrier_container.visible = false;
        }
    }
},