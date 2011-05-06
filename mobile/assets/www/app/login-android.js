
function fblogin() {
    getLocation();
    //var appId = 187063221337398; // local
    var appId = 136471399753143; // remote
    window.plugins.facebook.authorize(appId, function(res) {
        if (res.token !== undefined) {
            doLogin(res.token);
        } else {
            // we have to call authorize
            window.plugins.facebook.getAccess(function(res) {
                if (res.token !== undefined) {
                    doLogin(res.token);
                }
            });
        }
    });
}

function doLogin(token){
    $("#login-modal-content").modal({'containerId':'loading-modal-container','overlayId':'loading-modal-overlay'});
    //call server to validate the token with user account
    $.ajax({
      url: my_url+"/login_mobile",
      type:"POST",
      data:{'token':token},
      success: function(data){
          process_login_data(data);
          //hide the login div and show the report div and bottom div
          $("#login-wrapper").hide();
          $("#wrapper").show();
          $("#report-widget").show();
          $.modal.close();
      }
    });
}
