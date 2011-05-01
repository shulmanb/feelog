var my_url = 'http://192.168.123.117:3000';

function doLogin(token){
    $("#login-modal-content").modal({'containerId':'loading-modal-container','overlayId':'loading-modal-overlay'});
    //call server to validate the token with user account
    $.ajax({
      url: my_url+"/login_mobile",
      type:"POST",
      data:{'token':token},
      success: function(data){
          var id = $.parseJSON(data).id;
          var pic = $.parseJSON(data).pic;
          var name = $.parseJSON(data).name;
          $('#user-pic').attr('src',pic);
          $('body').data('user_id',id);
          $('body').data('moods_path',my_url+"/users/"+id+"/moods");
          renderMoods(my_url+"/users/"+id+"/moods",name);
          renderFriends("http://192.168.123.117:3000/users/"+id+"/friends");
          //hide the login div and show the report div and bottom div
          $("#login-wrapper").hide();
          $("#wrapper").show();
          $("#report-widget").show();
          $.modal.close();
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