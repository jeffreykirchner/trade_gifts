/**show edit parameter set field_type
 */
show_edit_parameter_set_field_type(index){
    
    if(app.session.started) return;
    if(app.working) return;

    app.clear_main_form_errors();
    app.current_parameter_set_field_type = Object.assign({}, app.parameter_set.parameter_set_field_types[index]);
    
    app.edit_parameterset_field_type_modal.toggle();
},

/** update parameterset field_type
*/
send_update_parameter_set_field_type(){
    
    app.working = true;

    app.send_message("update_parameter_set_field_type", {"session_id" : app.session.id,
                                                     "parameterset_field_type_id" : app.current_parameter_set_field_type.id,
                                                     "form_data" : app.current_parameter_set_field_type});
},

/** remove the selected parameterset field_type
*/
send_remove_parameter_set_field_type(){

    app.working = true;
    app.send_message("remove_parameterset_field_type", {"session_id" : app.session.id,
                                                    "parameterset_field_type_id" : app.current_parameter_set_field_type.id,});
                                                   
},

/** add a new parameterset field_type
*/
send_add_parameter_set_field_type(field_type_id){
    app.working = true;
    app.send_message("add_parameterset_field_type", {"session_id" : app.session.id});
                                                   
},