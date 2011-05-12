var my_url = 'http://184.73.183.35/'//'http://192.168.123.117:3000';
var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var chart = null;
var name = null;

function toggle(moodid){
    console.log("toggle touched");
    $(".smiley-selected").toggleClass("smiley-selected");
    $("#mood_val").val(moodid);
    $('#'+'s'+moodid).toggleClass("smiley-selected");
    if($("#how").val()=="why?"){
        $("#how").val("");
    }
    $("#how").focus();
}
function getMoodImageLink(moodid){
    switch(moodid){
        case 1:
            return '<img src="/images/mood-angry.png">';
        case 2:
            return '<img src="/images/mood-very_sad.png">';
        case 3:
            return '<img src="/images/mood-sad.png">';
        case 4:
            return '<img src="/images/mood-ok.png">';
        case 5:
            return '<img src="/images/mood-happy.png">';
        case 6:
            return '<img src="/images/mood-twink.png">';
        case 7:
            return '<img src="/images/mood-very_happy.png">';
    }

}
function getMoodStr(mood){
    switch(mood){
        case 1:
            return 'angry';
        case 2:
            return 'very sad';
        case 3:
            return 'sad';
        case 4:
            return 'ok';
        case 5:
            return 'happy';
        case 6:
            return 'twinky';
        case 7:
            return 'very happy';
    }

}
//this function called by the server rendered js, create.js.erb
function returnFromCreateMood(report_time,mood_val,desc){
    $("#how").val("why?");
    $("#mood_val").val('');
    $(".smiley-selected").toggleClass("smiley-selected");
    var moods_arr = $('body').data('moods');
    var mood = {
        "id":moods_arr.length,
        "val":mood_val,
        "desc":desc,
        "date":report_time //something that can be parsed as a string
    };
    var moodStr = '<b>'+getMoodStr(mood.val)+'</b>';
    var status = name +' is '+moodStr+' :<br>'+mood.desc;
    $(".usr-status").html(status);
    moods_arr.push(mood);
    if(moods_arr.length == 8){
        moods_arr.shift();
    }
    $('body').data('moods',moods_arr);

    if(chart != undefined && chart != null) {
        //alert('updating chart');
        var update_arr = $('body').data('update_moods');
        if (update_arr == null || update_arr == 'undefined') {
            update_arr = new Array();
        }
        update_arr.push(mood);
        $('body').data('update_moods', update_arr);
    }
    $("#ajax-busy").hide();
    $("#feel-submit").show();
    //alert('mood created');
}

function updateChart(mood_arr){
    if(mood_arr == null || mood_arr == undefined){
        return;
    }

    //alert('update called');
    var norm = $('body').data('norm');
    if(!norm) norm = 0;

    var series = chart.series[0];
    //shift on more then 7 elements in the graph
    var shift = series.data.length >= 7;
    for(i = 0;i < mood_arr.length;i++){
        var mood = mood_arr[i];
        var date_pattern = /([0-9][0-9][0-9][0-9])\-([0-9][0-9])\-([0-9][0-9])T([0-9][0-9])\:([0-9][0-9])\:([0-9][0-9])\Z/;
        var date_array = date_pattern.exec(mood.date);
        var d = new Date(date_array[1],date_array[2],date_array[3],date_array[4],date_array[5]).getTime();
        var p;
        if(norm == 1){
            p = {
                "name":mood.desc,
                "y":mood.val,
                "x":d
            };
        }else{
            p = {
                "name":mood.desc,
                "y":mood.val,
                "t":d
            };
        }
        series.addPoint(p,false,shift);
        if(norm == 0){
            var categories = chart.xAxis[0].categories;
            categories.push(d);
            chart.xAxis[0].setCategories(categories, false);
        }
    }
    //alert('update redraw called');
    chart.redraw();
    //alert('update redraw done');

}
function renderMoods(path,name){
    var moods_arr = [];
    var initializing = false;
    var first_init = true;
    $.ajax(path+"/limit/7.json").success(function(data){
        console.log("BACK FROM GET MOODS");
        var i = 0;
        if(data.length == 0){
        //set empty data notification
            console.log("BACK FROM GET MOODS--EMPTY");
        }
        $.each(data, function(key, value) {
            if (key == 'retry'){
                console.log("BACK FROM GET MOODS--RETRY");
                setTimeout(function(){renderMoods(path)},value);
                initializing = true;
            }else if(key == 'retry_cnt'){
                console.log("BACK FROM GET MOODS--RETRY_CNT "+value);
                if(value > 1){
                    first_init = false;
                }
            }else{
                var mood = {
                    "id":i,
                    "val":value.mood.mood,
                    "desc":value.mood.desc,
                    "date":value.mood.report_time
                };
                if(i==0){
                    //latest mood
                    console.log("BACK FROM GET MOODS--LATEST MOOD "+mood.desc);
                    var moodStr = '<b>'+getMoodStr(mood.val)+'</b>';
                    var status = name +' is '+moodStr+' : <br>'+mood.desc;
                    $(".usr-status").html(status);
                    console.log("BACK FROM GET MOODS--user status set");
                }
                moods_arr.push(mood);
                i++;
            }
        });
        $('body').data('moods',moods_arr);
        $('body').data('init',initializing);
        $('body').data('f_init',first_init);
        jQT.goTo("#home");
    });
}
/*
should be called after render moods return
 */
function initChart(){
    var moods_arr = $('body').data('moods');
    var update_arr = $('body').data('update_moods');
    if(update_arr != null && update_arr != 'undefind'){
        for(i = 0;i < update_arr.length;i++){
            moods_arr.push(update_arr[i]);
            if(moods_arr.length > 7){
                moods_arr.shift();
            }
        }
    }
    var initializing = $('body').data('init');
    var first_init = $('body').data('f_init');
    if(initializing != true){
        $("#moods-graph").empty();
        var norm = $('body').data('norm');
        if(!norm) norm = 0;
        drawChart(moods_arr.reverse(),norm);

    }else if(first_init == true){
        set_init_data("#moods-graph")
        //alert('first init setting t/o');
        setTimeout(function(){initChart()},5000);
    }
}

function set_no_data(tag){
    $(tag).append("<div class='no-data'>No Data Found</div>");
    $(tag).css('background-color','white');
}
function set_init_data(tag){
    $(tag).append("<div class='no-data'>Initializing..</div>");
    $(tag).append("<img src='/images/initializing.gif'/>");
    $(tag).css('background-color','white');
}
function renderFriends(path){
    var happy = new Array();
    var gloomy = new Array();
    var render_needed = true;
    $.ajax(path).success(function(data){
        console.log('BACK FROM GET FRIENDS');
        if(data.length == 0){}
        $.each(data, function(id, mood_json) {
            if (id == 'retry'){
                console.log('BACK FROM GET FRIENDS -- retry');
                setTimeout(function(){renderFriends(path)},mood_json);
            }else if (id == 'retry_cnt'){
                console.log('BACK FROM GET FRIENDS - retry cnt '+mood_json);
                if (mood_json >1){
                    render_needed = false;
                }
            }else{
                var rendered = renderFriendIcon(id,mood_json);
                if(rendered[0]){
                    happy.push(rendered[1]);
                }else{
                    gloomy.push(rendered[1]);
                }
                $('#jqt').append(rendered[2]);
            }
        });
        console.log('BACK FROM GET FRIENDS - set boxes '+happy.length+" "+gloomy.length);
        $('.happy-box-val').text(happy.length);
        $('.sad-box-val').text(gloomy.length);
        if(render_needed == true){
            redraw_friends_widgets(happy, gloomy);
        }
        $.modal.close();
    });
}
function redraw_friends_widgets(happy, gloomy){
    //alert('redraw friends widget called '+happy.length+' '+gloomy.length);
    $("#happy-friends").empty();
    $("#gloomy-friends").empty();

    if(happy.length > 0){
        $("body").data('happy-friends',happy);
    }else{
        set_no_data("#happy-friends");
    }
    if(gloomy.length > 0){
        $("body").data('gloomy-friends',gloomy);
    }else{
        set_no_data("#gloomy-friends");
    }
    var i = 0;
    for (i = 0;i < 10;i++){
        var empty = -2;
        if(happy.length >=i){
            $("#happy-friends").append(happy[i]);
        }else{
            empty++;
        }
        if(gloomy.length >=i){
            $("#gloomy-friends").append(gloomy[i]);
        }else{
            empty++;
        }
        if(empty == 0){
            break;
        }
    }
}
function renderFriendIcon(id,mood_json){
    //alert('render friend action');
    var picLink = 'https://graph.facebook.com/'+id+'/picture';
    var mood = mood_json.m;
    var post = mood_json.p;
    var time = mood_json.t;
    var name = mood_json.n;
    //create the html for the icon
    var happy = 0; //0 for unhappy, 1 for happy
    if(mood > 3){
        happy = 1;
    }else{
        happy = 0;
    }
    var fb_date_pattern = /([0-9][0-9][0-9][0-9])\-([0-9][0-9])\-([0-9][0-9])T([0-9][0-9])\:([0-9][0-9])\:([0-9][0-9])\+0000/;
    var date_array = fb_date_pattern.exec(time);
    var prityTime = month[date_array[2]-1] + " " +date_array[3]+" "+ date_array[1];
    var picHtml =
    "<div id='"+id+"' class='friend-icon' > \
                <img src='"+picLink+"' title='"+post+"' ontouchstart='overFriendPic("+id+")'/>";
    var contentH = $(window).height() - 160;
    var friendHtml =
        "<div id='"+id+"modal' class='modal-content'> \
            <div class='toolbar'>\
                <div class='logo'>\
                    <span class='mt'>Feelogg</span> <span class='st'>makes you happy</span>\
                </div>\
                <a href='#' class='back'>Back</a>\
                <a href='#' class='button' ontouchstart='showHome()'>Home</a>\
            </div>\
             <div  class='container'>\
                <div class='mys container'>\
                      <div class='fl2'>\
                          <img class='user-pic' src='images/pic.gif'>\
                      </div>\
                      <div class='usr-status'></div>\
                </div>\
                <div class='content' style='height:"+contentH+"px' >\
                        <img style=\"float:left; padding:5px\" src='"+picLink+"'/>\
                        <div style=\"float:left; padding-top:10px;padding-left:5px;padding-right:5px\">\
                            <b>"+name+"</b> is: <b>"+getMoodStr(mood)+"</b> <br>\
                            Posted on "+prityTime+" <br>\
                        </div>\
                        <div style=\"margin-top:5px;padding-left:5px;padding-right:5px\">\
                            post\
                        </div>\
                </div>\
                <div class='credit'>\
                    Feelogg &copy; 2011\
                </div>\
             </div>\
        </div>";

    return [happy,picHtml,friendHtml];
}
function overFriendPic(id){
    //$("#"+id+"modal").modal({'containerId':'friends-modal-container','overlayId':'friends-modal-overlay'});
    jQT.goTo("#"+id+"modal");
}

//new functions


//changed to ajax
function submitMood(){
    console.log("SUBMITTING MOOD");
    var val = $("#mood_val").val();
    var how = $("#how").val();
    var location = $('body').data('coords');
    var fbshare = $("#fbshare").val();
    var twshare = $("#twshare").val();
    var payload;
    if(location != null){
        console.log("SUBMITTING MOOD-LOCATION IS NOT NULL");
       payload = {"mood[lat]":location.latitude,"mood[lon]":location.longitude,"mood[desc]":how,"mood[mood]":val,"fbshare":fbshare,"twshare":twshare};
    }else{
       payload = {"mood[desc]":how,"mood[mood]":val,"fbshare":fbshare,"twshare":twshare};
    }
    if (val != ''){
        var userid = $('body').data('user_id');
        $("#feel-submit").hide();
        $("#ajax-busy").show();

        $.ajax({
          url: my_url+"/users/"+userid+"/moods.json",
          type:"POST",
          data:payload,
          success: function(data){
//            alert('resp received '+data);
            //var obj = $.parseJSON(data);
            //alert('resp parsed '+data.val+' '+data.desc+' '+data.report_time);
            returnFromCreateMood(data.report_time,data.val,data.desc);
          }
        });
    }
}

function showGraph(){
    jQT.goTo('#personal-page');
    if(chart == null){
        //initiate the graph for the firts time
        //('setting for initChart');
        setTimeout(function(){initChart()},100);
    }else{
        updateChart($('body').data('update_moods'));
        $('body').removeData('update_moods');
    }
}
function showReport(){
    jQT.goTo('#home');
}

function showHome(){
    jQT.goTo('#home');
}


function showHappyFriends(){
    jQT.goTo("#happy-friends-page");
}

function showGloomyFriends(){
    jQT.goTo("#sad-friends-page");
}

function getLocation() {
     // Error callback function telling the user that there was a problem retrieving GPS.
    console.log("START GET LOCATION");
    var fail = function(error){
         console.log("GET LOCATION ERROR "+error);
         if (navigator.notification.activityStop) navigator.notification.activityStop(); // only call this if the function exists as it is iPhone only.
     };
     if(navigator.geolocation) {
          //if (navigator.notification.activityStart) navigator.notification.activityStart(); // only call this if the function exists as it is iPhone only.
          // Success callback function that will grab coordinate information and display it in an alert.
          var suc = function(p) {
                //if (navigator.notification.activityStop) navigator.notification.activityStop(); // only call this if the function exists as it is iPhone only.
                console.log("GET LOCATION SUCCESS "+p.coords);
                $('body').data('coords',p.coords);
          };
          // Now make the PhoneGap JavaScript API call, passing in success and error callbacks as parameters, respectively.
          console.log("CALLING get current position");
          navigator.geolocation.getCurrentPosition(suc,fail,{ maximumAge: 3000,enableHighAccuracy: true});//updates 10 minutes pld are fine
         console.log("CALLING watch position");
          navigator.geolocation.watchPosition(suc,fail,{ frequency: 600000,enableHighAccuracy: true});
     } else {
          fail();
     }
    console.log("END GET LOCATION");

}

function process_login_data(data){
    var id = $.parseJSON(data).id;
    var pic = $.parseJSON(data).pic;
    name = $.parseJSON(data).name;
    $('user-pic').attr('src',pic);
    $('body').data('user_id',id);
    $('body').data('moods_path',my_url+"/users/"+id+"/moods");
    renderFriends(my_url+"/users/"+id+"/friends");
    renderMoods(my_url+"/users/"+id+"/moods",name);
    //alert('hide floaty');
    //$(".loading").hideFloaty();
}

function doWindowSizeCalc(){
    var h  = $(window).height();
    var w = $(window).width();
    var newH = h-100;
    var newW = w-50;
    var pdh = newH/2-50;
    var pdw=newW/2 -50;
    $(".bg").css({width: w + "px", height: h + "px", overflow:"hidden"});
    $("#bg").css({width: w + "px"});
    $(".content").height(h-200);
    $("#loading").css({height:newH+"px",width:newW+"px",margin:"25px",padding:pdh+"px "+pdw+"px"});
}

function bindTouchEvents(){
    $("#fb-login-img").live('touchstart',function(e){
        console.log("login tapped");
        fblogin();
    });

    $(".happy-box.touchable").live('touchstart', function(e){
         showHappyFriends();
    });

    $(".sad-box.touchable").live('touchstart', function(e){
         showGloomyFriends();
    });

    $(".graph-box").live('touchstart', function(e){
         showGraph();
    });

    $(".report-box").live('touchstart',function(e){
         showReport();
    });

    $('.home-button').live('touchstart',function(e){
         showHome();
    });

    $("#s1").live('touchstart',function() {
        toggle(1);
    });
    $("#s2").live('touchstart',function() {
        toggle(2);
    });
    $("#s3").live('touchstart',function() {
        toggle(3);
    });
    $("#s4").live('touchstart',function() {
        toggle(4);
    });
    $("#s5").live('touchstart',function() {
        toggle(5);
    });
    $("#s6").live('touchstart',function() {
        toggle(6);
    });
    $("#s7").live('touchstart',function() {
        toggle(7);
    });
    $("#feel-submit").live('touchstart',function(){
        submitMood();
    });

}


