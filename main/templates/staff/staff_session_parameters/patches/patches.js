/**show edit parameter set patch
 */
show_edit_parameter_set_patch(index){
    
    if(app.session.started) return;
    if(app.working) return;

    app.clear_main_form_errors();
    app.current_parameter_set_patch = Object.assign({}, app.parameter_set.parameter_set_patches[index]);
    app.current_parameter_set_patch.levels_input = "";
    app.current_parameter_set_patch.shock_levels_input = "";

    //starting levels
    for(i in app.current_parameter_set_patch.levels)
    {
        app.current_parameter_set_patch.levels_input += app.current_parameter_set_patch.levels[i].value + ",";
    }

    //remove last comma
    app.current_parameter_set_patch.levels_input = app.current_parameter_set_patch.levels_input.slice(0, -1);

    //shock levels
    for(i in app.current_parameter_set_patch.shock_levels)
    {
        app.current_parameter_set_patch.shock_levels_input += app.current_parameter_set_patch.shock_levels[i].value + ",";
    }

    //remove last comma
    app.current_parameter_set_patch.shock_levels_input = app.current_parameter_set_patch.shock_levels_input.slice(0, -1);
    
    app.edit_parameterset_patch_modal.toggle();
},

/** update parameterset patch
*/
send_update_parameter_set_patch(){
    
    app.working = true;

    app.send_message("update_parameter_set_patch", {"session_id" : app.session.id,
                                                     "parameterset_patch_id" : app.current_parameter_set_patch.id,
                                                     "form_data" : app.current_parameter_set_patch});
},

/** remove the selected parameterset patch
*/
send_remove_parameter_set_patch(){

    app.working = true;
    app.send_message("remove_parameterset_patch", {"session_id" : app.session.id,
                                                    "parameterset_patch_id" : app.current_parameter_set_patch.id,});
                                                   
},

/** add a new parameterset patch
*/
send_add_parameter_set_patch(patch_id){
    app.working = true;
    app.send_message("add_parameterset_patch", {"session_id" : app.session.id});
                                                   
},