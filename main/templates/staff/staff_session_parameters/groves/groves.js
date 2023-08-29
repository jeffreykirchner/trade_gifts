/**show edit parameter set grove
 */
show_edit_parameter_set_grove(index){
    
    if(app.session.started) return;
    if(app.working) return;

    app.clear_main_form_errors();
    app.current_parameter_set_grove = Object.assign({}, app.parameter_set.parameter_set_groves[index]);
    app.current_parameter_set_grove.levels_input = "";

    for(i in app.current_parameter_set_grove.levels)
    {
        app.current_parameter_set_grove.levels_input += app.current_parameter_set_grove.levels[i].value + ",";
    }

    //remove last comma
    app.current_parameter_set_grove.levels_input = app.current_parameter_set_grove.levels_input.slice(0, -1);
    
    app.edit_parameterset_grove_modal.toggle();
},

/** update parameterset grove
*/
send_update_parameter_set_grove(){
    
    app.working = true;

    app.send_message("update_parameter_set_grove", {"session_id" : app.session.id,
                                                     "parameterset_grove_id" : app.current_parameter_set_grove.id,
                                                     "form_data" : app.current_parameter_set_grove});
},

/** remove the selected parameterset grove
*/
send_remove_parameter_set_grove(){

    app.working = true;
    app.send_message("remove_parameterset_grove", {"session_id" : app.session.id,
                                                    "parameterset_grove_id" : app.current_parameter_set_grove.id,});
                                                   
},

/** add a new parameterset grove
*/
send_add_parameter_set_grove(grove_id){
    app.working = true;
    app.send_message("add_parameterset_grove", {"session_id" : app.session.id});
                                                   
},