/**
 * setup field objects
 */
setup_pixi_fields()
{
    for(const i in app.session.parameter_set.parameter_set_fields_order)
    {
        pixi_fields[i] = {};

        const field_id = app.session.parameter_set.parameter_set_fields_order[i];
        const field = app.session.parameter_set.parameter_set_fields[field_id];
        
        let field_container = new PIXI.Container();
        field_container.eventMode = 'passive';
        field_container.zIndex = 0;
        
        field_container.position.set(field.x, field.y)

        //outline
        let field_sprite = PIXI.Sprite.from(app.pixi_textures.sprite_sheet_hf.textures["Field0000"]);
        field_sprite.anchor.set(0.5);
        field_sprite.eventMode = 'passive';
       
        //outline.endFill();
        field_container.addChild(field_sprite);

        pixi_fields[i].field_container = field_container;

        pixi_container_main.addChild(pixi_fields[i].field_container);
    }
},