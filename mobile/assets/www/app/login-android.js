
function fblogin() {
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
    doWindowSizeCalc();
    jQT.goTo("#loading");
//    $(".loading").makeFloaty(
//                {spacing: 20,
//                time: '.3s'});
    //call server to validate the token with user account
    $.ajax({
      url: my_url+"/login_mobile",
      type:"POST",
      data:{'token':token},
      success: function(data){
          process_login_data(data);
      }
    });
}
