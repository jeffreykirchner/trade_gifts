/**
 * setup house objects
 */
setup_pixi_houses()
{
    for(const i in app.session.parameter_set.parameter_set_players_order)
    {
        pixi_houses[i] = {};
        
        let parameter_set_player = app.session.parameter_set.parameter_set_players[i];

        let house_container = new PIXI.Container();
        house_container.eventMode = 'passive';
        // house_container.zIndex = 0;
        
        house_container.position.set(parameter_set_player.x, parameter_set_player.y)

        //house background
        let house_sprite = PIXI.Sprite.from(app.pixi_textures.sprite_sheet_hf.textures["Field0000"]);
        house_sprite.anchor.set(0.5);
        house_sprite.eventMode = 'passive';
        house_sprite.tint = 'BlanchedAlmond';

        //owner label
        let owner_label = new PIXI.Text("Owner: " + parameter_set_player.id_label, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 'black',
            // stroke: 'black',
            // strokeThickness: 2,
        });
        owner_label.eventMode = 'passive'; 
        owner_label.anchor.set(.5, 1);

        //info label       
        let info_label = new PIXI.Text(parameter_set_house_type.display_text, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 'black',
            // stroke: 'black',
            // strokeThickness: 2,
        });
        info_label.eventMode = 'passive'; 
        info_label.anchor.set(0.5, 0);

        //good one        
        let good_one_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_house_type.good_one+"_tex"]);
        good_one_sprite.anchor.set(1, 0.5);
        good_one_sprite.eventMode = 'passive';

        let good_one_label = new PIXI.Text("00", {
            fontFamily: 'Arial',
            fontSize: 90,
            fill: 'white',
            stroke: 'black',
            strokeThickness: 3,
        });
        good_one_label.eventMode = 'passive'; 
        good_one_label.anchor.set(0, 0.5);

        //good two        
        let good_two_sprite = PIXI.Sprite.from(app.pixi_textures[parameter_set_house_type.good_two+"_tex"]);
        good_two_sprite.anchor.set(1, 0.5);
        good_two_sprite.eventMode = 'passive';

        let good_two_label = new PIXI.Text("00", {
            fontFamily: 'Arial',
            fontSize: 90,
            fill: 'white',
            stroke: 'black',
            strokeThickness: 3,
        });
        good_two_label.eventMode = 'passive'; 
        good_two_label.anchor.set(0, 0.5);

        house_container.addChild(house_sprite);
        house_container.addChild(owner_label);
        house_container.addChild(info_label);
        house_container.addChild(good_one_sprite);
        house_container.addChild(good_one_label);
        house_container.addChild(good_two_sprite);
        house_container.addChild(good_two_label);

        owner_label.position.set(0, house_sprite.height/2-2);
        info_label.position.set(0, -house_sprite.height/2 + 2);
        good_one_sprite.position.set(0, -house_sprite.height/4);
        good_one_label.position.set(0, -house_sprite.height/4);
        good_two_sprite.position.set(0, +house_sprite.height/4);
        good_two_label.position.set(0, +house_sprite.height/4);

        pixi_houses[i].house_container = house_container;
        pixi_houses[i].owner_label = owner_label;
        pixi_houses[i].good_one_label = good_one_label;

        pixi_container_main.addChild(pixi_houses[i].house_container);
    }
},