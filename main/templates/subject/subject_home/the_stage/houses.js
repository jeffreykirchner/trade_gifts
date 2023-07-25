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

        //good one        
        let good_one_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_player.good_one+"_tex"]);
        good_one_sprite.anchor.set(1, 0.5);
        good_one_sprite.eventMode = 'passive';

        let good_one_label = new PIXI.Text("000", {
            fontFamily: 'Arial',
            fontSize: 60,
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2,
        });
        good_one_label.eventMode = 'passive'; 
        good_one_label.anchor.set(0, 0.5);

        //good two        
        let good_two_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_player.good_two+"_tex"]);
        good_two_sprite.anchor.set(1, 0.5);
        good_two_sprite.eventMode = 'passive';

        let good_two_label = new PIXI.Text("000", {
            fontFamily: 'Arial',
            fontSize: 60,
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2,
        });
        good_two_label.eventMode = 'passive'; 
        good_two_label.anchor.set(0, 0.5);

        //good three        
        let good_three_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_player.good_three+"_tex"]);
        good_three_sprite.anchor.set(1, 0.5);
        good_three_sprite.eventMode = 'passive';

        let good_three_label = new PIXI.Text("000", {
            fontFamily: 'Arial',
            fontSize: 60,
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2,
        });
        good_three_label.eventMode = 'passive'; 
        good_three_label.anchor.set(0, 0.5);

        house_container.addChild(house_sprite);
        house_container.addChild(owner_label);

        house_container.addChild(good_one_sprite);
        house_container.addChild(good_one_label);

        house_container.addChild(good_two_sprite);
        house_container.addChild(good_two_label);

        house_container.addChild(good_three_sprite);
        house_container.addChild(good_three_label);
        
        owner_label.position.set(0, house_sprite.height/2-2);

        good_one_sprite.position.set(0, -house_sprite.height/4);
        good_one_label.position.set(0, -house_sprite.height/4);

        good_two_sprite.position.set(0, 0);
        good_two_label.position.set(0, 0);

        good_three_sprite.position.set(0, house_sprite.height/4);
        good_three_label.position.set(0, house_sprite.height/4);

        pixi_houses[i].house_container = house_container;
        pixi_houses[i].owner_label = owner_label;
        pixi_houses[i].good_one_label = good_one_label;
        pixi_houses[i].good_two_label = good_two_label;
        pixi_houses[i].good_three_label = good_three_label;

        pixi_houses[i].house_container.width = app.session.parameter_set.house_width;
        pixi_houses[i].house_container.height = app.session.parameter_set.house_height;

        pixi_container_main.addChild(pixi_houses[i].house_container);
    }
},