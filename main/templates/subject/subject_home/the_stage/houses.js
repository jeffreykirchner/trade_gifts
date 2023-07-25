/**
 * setup house objects
 */
setup_pixi_houses()
{
    for(const i in app.session.parameter_set.parameter_set_players_order)
    {
        pixi_houses[i] = {};

        let parameter_set_player_id = app.session.parameter_set.parameter_set_players_order[i];        
        let parameter_set_player = app.session.parameter_set.parameter_set_players[parameter_set_player_id];

        let house_container = new PIXI.Container();
        house_container.eventMode = 'passive';
        // house_container.zIndex = 0;
        
        house_container.position.set(parameter_set_player.house_x, parameter_set_player.house_y)

        //house background
        let house_sprite = PIXI.Sprite.from(app.pixi_textures["house_tex"]);
        house_sprite.anchor.set(0.5);
        house_sprite.eventMode = 'passive';
        house_sprite.tint = 'BlanchedAlmond';

        //owner label
        let owner_label = new PIXI.Text("Owner: " + parameter_set_player.id_label, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 'black',
        });
        owner_label.eventMode = 'passive'; 
        owner_label.anchor.set(.5, 1);

        house_container.addChild(house_sprite);
        house_container.addChild(owner_label);


        owner_label.position.set(0, house_sprite.height/2-2);

        pixi_houses[i].house_container = house_container;
        pixi_houses[i].owner_label = owner_label;

        pixi_houses[i].house_container.width = app.session.parameter_set.house_width;
        pixi_houses[i].house_container.height = app.session.parameter_set.house_height;

        pixi_container_main.addChild(pixi_houses[i].house_container);
    }
},