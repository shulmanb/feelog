var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var chart = null;

function toggle(moodid){
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
function prepareMoodIcons(){
    $("#s1").click(function() {
        toggle(1);
    });
    $("#s2").click(function() {
        toggle(2);
    });
    $("#s3").click(function() {
        toggle(3);
    });
    $("#s4").click(function() {
        toggle(4);
    });
    $("#s5").click(function() {
        toggle(5);
    });
    $("#s6").click(function() {
        toggle(6);
    });
    $("#s7").click(function() {
        toggle(7);
    });
    $("#feel-submit").click(function(){
        submitMood();
    });
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
    var status = name +' is '+moodStr+' : '+mood.desc;
    $("#usr-status").html(status);
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
        var i = 0;
        if(data.length == 0){
        //set empty data notification
        }
        $.each(data, function(key, value) {
            if (key == 'retry'){
                setTimeout(function(){renderMoods(path)},value);
                initializing = true;
            }else if(key == 'retry_cnt'){
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
                    var moodStr = '<b>'+getMoodStr(mood.val)+'</b>';
                    var status = name +' is '+moodStr+' : <br>'+mood.desc;
                    $("#usr-status").html(status);
                }
                moods_arr.push(mood);
                i++;
            }
        });
        $('body').data('moods',moods_arr);
        $('body').data('init',initializing);
        $('body').data('f_init',first_init);
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
        if(data.length == 0){}
        $.each(data, function(id, mood_json) {
            if (id == 'retry'){
                setTimeout(function(){renderFriends(path)},mood_json);
            }else if (id == 'retry_cnt'){
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
            }
        });
        $('#happy-box-val').text(happy.length);
        $('#sad-box-val').text(gloomy.length);
        if(render_needed == true){
            redraw_friends_widgets(happy, gloomy);
        }
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
    var html =
    "<div id='"+id+"' class='friend-icon' > \
                <div id='"+id+"modal' class='modal-content'> \
                    <img style=\"float:left; padding:5px\" src='"+picLink+"'/>\
                    <div style=\"float:left; padding-top:5px\">\
                        <b>"+name+"</b> is: <b>"+getMoodStr(mood)+"</b> <br>\
                        Posted on "+prityTime+" <br>\
                        <b>"+post+"</b> <br>\
                    </div>\
                </div> \
                <img src='"+picLink+"' title='"+post+"' onclick='overFriendPic("+id+")'/>";
    return [happy,html];
}
function overFriendPic(id){
    $("#"+id+"modal").modal({'containerId':'friends-modal-container','overlayId':'friends-modal-overlay'});
}

//new functions


//changed to ajax
function submitMood(){
    var val = $("#mood_val").val();
    var how = $("#how").val();
    var fbshare = $("#fbshare").val();
    var twshare = $("#twshare").val();

    if (val != ''){
        var userid = $('body').data('user_id');
        $("#feel-submit").hide();
        $("#ajax-busy").show();

        $.ajax({
          url: my_url+"/users/"+userid+"/moods.json",
          type:"POST",
          data:{"mood[desc]":how,"mood[mood]":val,"fbshare":fbshare,"twshare":twshare},
          success: function(data){
//            alert('resp received '+data);
            //var obj = $.parseJSON(data);
            //alert('resp parsed '+data.val+' '+data.desc+' '+data.report_time);
            returnFromCreateMood(data.report_time,data.val,data.desc);
          }
        });
    }
}
function activeWidget(){
    var curr = $('body').data('current-view');
    if(curr == 0){
        return '#report-widget';
    }else if(curr == 1){
        return '#personal-widget';
    }else if(curr == 2){
        return '#happy-friends-widget';
    }else if(curr == 3){
        return '#sad-friends-widget';
    }
    return '';
}

function activeBox(){
    var curr = $('body').data('current-box');
    if(curr == 0){
        return '#b3';
    }else if(curr == 1){
        return '#b4';
    }else if(curr == 2){
        return '#b5';
    }
    return '';
}

function showGraph(){
    $(activeWidget()).hide();
    $("#personal-widget").show();
    $('body').data('current-view',1);
    $(activeBox()).addClass('box-hidden');
    $("#b4").removeClass('box-hidden');
    $('body').data('current-box',1);
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
    var curr = $('body').data('current-view');
    $(activeWidget()).hide();
    $("#report-widget").show();
    $(activeBox()).addClass('box-hidden');
    $("#b3").removeClass('box-hidden');
    $('body').data('current-view',0);
    $('body').data('current-box',0);
}

function showHappyFriends(){
    var happy_cnt = $('#happy-box-val').text();
    //alert('happy cnt '+happy_cnt);
    if(happy_cnt == 0 || activeWidget()=='#happy-friends-widget'){
        return;
    }
    var curr = $('body').data('current-view');
    $(activeWidget()).hide();
    $(activeBox()).addClass('box-hidden');
    if(curr == 0){
        //current view is report
        $("#b4").removeClass('box-hidden');
        $('body').data('current-box',1);
    }else if(curr == 1){
        //current view is graph
        $("#b5").removeClass('box-hidden');
        $('body').data('current-box',2);
    }
    $('body').data('current-view',2);
    $('#happy-friends-widget').show();
}

function showGloomyFriends(){
    var sad_cnt = $('#sad-box-val').text();
    //alert('sad cnt '+sad_cnt);
    if(sad_cnt == 0 ||activeWidget()=='#sad-friends-widget'){
        return;
    }
    var curr = $('body').data('current-view');
    if(curr == 0){
        //current view is report
        $("#report-widget").hide();
        $("#b3").addClass('box-hidden');
        $("#b4").removeClass('box-hidden');
    }else if(curr == 1){
        //current view is graph
        $("#personal-widget").hide();
        $("#b4").addClass('box-hidden');
        $("#b5").removeClass('box-hidden');
    }
    $('body').data('current-view',3);
}


