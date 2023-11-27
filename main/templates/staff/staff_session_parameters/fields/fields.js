/**show edit parameter set field
 */
show_edit_parameter_set_field: function show_edit_parameter_set_field(index){
    
    if(app.session.started) return;
    if(app.working) return;

    app.clear_main_form_errors();
    app.current_parameter_set_field = Object.assign({}, app.parameter_set.parameter_set_fields[index]);
    
    app.edit_parameterset_field_modal.toggle();
},

/** update parameterset field
*/
send_update_parameter_set_field: function send_update_parameter_set_field(){
    
    app.working = true;

    app.send_message("update_parameter_set_field", {"session_id" : app.session.id,
                                                     "parameterset_field_id" : app.current_parameter_set_field.id,
                                                     "form_data" : app.current_parameter_set_field});
},

/** remove the selected parameterset field
*/
send_remove_parameter_set_field: function send_remove_parameter_set_field(){

    app.working = true;
    app.send_message("remove_parameterset_field", {"session_id" : app.session.id,
                                                    "parameterset_field_id" : app.current_parameter_set_field.id,});                                                   
},

/** add a new parameterset field
*/
send_add_parameter_set_field: function send_add_parameter_set_field(field_id){
    app.working = true;
    app.send_message("add_parameterset_field", {"session_id" : app.session.id});
                                                   
},