/**show edit parameter set group_gate
 */
show_edit_parameter_set_group_gate: function show_edit_parameter_set_group_gate(index){
    
    if(app.session.started) return;
    if(app.working) return;

    app.clear_main_form_errors();
    app.current_parameter_set_group_gate = Object.assign({}, app.parameter_set.parameter_set_group_gates[index]);
    
    app.edit_parameterset_group_gate_modal.toggle();
},

/** update parameterset group_gate
*/
send_update_parameter_set_group_gate: function send_update_parameter_set_group_gate(){
    
    app.working = true;

    app.send_message("update_parameter_set_group_gate", {"session_id" : app.session.id,
                                                     "parameterset_group_gate_id" : app.current_parameter_set_group_gate.id,
                                                     "form_data" : app.current_parameter_set_group_gate});
},

/** remove the selected parameterset group_gate
*/
send_remove_parameter_set_group_gate: function send_remove_parameter_set_group_gate(){

    app.working = true;
    app.send_message("remove_parameterset_group_gate", {"session_id" : app.session.id,
                                                    "parameterset_group_gate_id" : app.current_parameter_set_group_gate.id,});
                                                   
},

/** add a new parameterset group_gate
*/
send_add_parameter_set_group_gate: function send_add_parameter_set_group_gate(group_gate_id){
    app.working = true;
    app.send_message("add_parameterset_group_gate", {"session_id" : app.session.id});
                                                   
},