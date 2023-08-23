/**
 * setup barrier objects
 */
setup_pixi_barrier()
{
    for(const i in app.session.parameter_set.parameter_set_barriers_order)
    {
        pixi_barriers[i] = {};

        const barrier_id = app.session.parameter_set.parameter_set_barriers_order[i];
        const barrier = app.session.parameter_set.parameter_set_barriers[barrier_id];
        
        let barrier_container = new PIXI.Container();
        
        barrier_container.position.set(barrier.start_x,barrier.start_y)

        //outline
        let outline = new PIXI.Graphics();
        //outline.lineStyle(1, 0x000000);
        scale = 100 / app.pixi_textures.barrier_tex.width;
        outline.beginTextureFill({texture: app.pixi_textures['barrier_tex'], color:'yellow', matrix:new PIXI.Matrix(scale,0,0,scale,0,0)});
        outline.drawRect(0, 0, barrier.width, barrier.height);
       
        //outline.endFill();

        barrier_container.addChild(outline);

        pixi_barriers[i].barrier_container = barrier_container;

        pixi_container_main.addChild(pixi_barriers[i].barrier_container);
    }
},

/**
 * check barrier intersection
 */
check_barriers_intersection(rect1)
{
    for(let i in app.session.parameter_set.parameter_set_barriers)
    {
        let temp_barrier = app.session.parameter_set.parameter_set_barriers[i];
        let rect2={x:temp_barrier.start_x,
                y:temp_barrier.start_y,
                width:temp_barrier.width,
                height:temp_barrier.height};

        if(app.check_for_rect_intersection(rect1, rect2))
        {  
            return true;
        }
    }

    return false;
},