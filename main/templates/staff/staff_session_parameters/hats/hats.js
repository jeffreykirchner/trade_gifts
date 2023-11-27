/**show edit parameter set hat
 */
show_edit_parameter_set_hat: function show_edit_parameter_set_hat(index){
    
    if(app.session.started) return;
    if(app.working) return;

    app.clear_main_form_errors();
    app.current_parameter_set_hat = Object.assign({}, app.parameter_set.parameter_set_hats[index]);
    
    app.edit_parameterset_hat_modal.toggle();
},

/** update parameterset hat
*/
send_update_parameter_set_hat: function send_update_parameter_set_hat(){
    
    app.working = true;

    app.send_message("update_parameter_set_hat", {"session_id" : app.session.id,
                                                     "parameterset_hat_id" : app.current_parameter_set_hat.id,
                                                     "form_data" : app.current_parameter_set_hat});
},

/** remove the selected parameterset hat
*/
send_remove_parameter_set_hat: function send_remove_parameter_set_hat(){

    app.working = true;
    app.send_message("remove_parameterset_hat", {"session_id" : app.session.id,
                                                    "parameterset_hat_id" : app.current_parameter_set_hat.id,});
                                                   
},

/** add a new parameterset hat
*/
send_add_parameter_set_hat: function send_add_parameter_set_hat(hat_id){
    app.working = true;
    app.send_message("add_parameterset_hat", {"session_id" : app.session.id});
                                                   
},