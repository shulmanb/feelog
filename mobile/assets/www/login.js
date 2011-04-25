function doLogin(token){
    $.modal("Loading...");
    //call server to validate the token with user account
    $.ajax({
      url: "http://192.168.123.117:3000/login_mobile",
      type:"POST",
      data:{'token':token},
      success: function(data){
          var id = $.parseJSON(data).id;
          var pic = $.parseJSON(data).pic;
          var name = $.parseJSON(data).name;
          $('#user-pic').attr('src',pic);
          $('body').data('userid',id);
          $('#feel-submit-img').attr('onclick', '').click("$('#ajax-busy').show()");
          $('body').data('moods_path',"http://192.168.123.117:3000/users/"+id+"/moods");
          renderMoods("http://192.168.123.117:3000/users/"+id+"/moods",name);
          //renderFriends("http://192.168.123.117:3000/users/"+id+"/friends");
          $.modal.close();
          //hide the login div and show the report div and bottom div
          $("#login-wrapper").hide();
          $("#wrapper").show();
          $("#report-widget").show();
      }
    });
}

function fblogin() {
    var appId = 187063221337398; // this is your facebook app id

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