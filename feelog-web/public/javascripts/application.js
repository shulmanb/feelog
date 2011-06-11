var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var full_month = ['January','February','March','April','May','June','July','August','September','October','November','December'];

var week = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function submitMood(){
    var val = $("#mood_val").val();
    if (val != ''){
        $('#new_mood').submit();
    }
}
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
            return 'amused';
        case 7:
            return 'very happy';
    }

}
function getMoodColor(mood){
    switch(mood){
        case 1:
            return '#FF0000';
        case 2:
            return '#10253F';
        case 3:
            return '#174580';
        case 4:
            return '#8064A2';
        case 5:
            return '#FFFD00';
        case 6:
            return '#FF9A00';
        case 7:
            return '#FF3E00';
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
//this function called by the server rendered js, redirect_fb.js.erbs.erb
function returnFromCreateMood(report_time,mood_val,desc){
    $('#ajax-busy').hide();
    $("#how").val("why?");
    $("#mood_val").val('');
    $(".smiley-selected").toggleClass("smiley-selected");
    var moodStr = '<b>'+getMoodStr(mood_val)+'</b>';
    var status = name +' is '+moodStr+' : ';
    $("#usr-status").html(status);
    $("#usr-report").text(desc);
    var mood = {
        "val":mood_val,
        "desc":desc,
        "date":report_time
    };

    add_points_to_graph([mood]);
}
function create_mood_object(value){
    var mood = {
        "val":value.mood.mood,
        "desc":value.mood.desc,
        "date":value.mood.report_time
    };
    return mood;
}
function renderMoods(path){
    var moods_arr = [];
    var initializing = false;
    var first_init = true;
    $.ajax(path+"/limit/10.json").success(function(data){
        var i = 0;
        if(data.length == 0){
        //set empty data notification
        }
        $('body').data('page',0);
        $.each(data, function(key, value) {
            if (key == 'retry'){
                setTimeout(function(){renderMoods(path)},value);
                initializing = true;
            }else if(key == 'retry_cnt'){
                if(value > 1){
                    first_init = false;
                }
            }else{
                var mood = create_mood_object(value);
                moods_arr.push(mood);
                if(i==0){
                    //latest mood
                    var moodStr = '<b>'+getMoodStr(mood.val)+'</b>';
                    var status = name +' is '+moodStr+' : ';
                    $("#usr-status").html(status);
                    $("#usr-report").text(mood.desc);
                }
                i++;
            }
        });
        if(initializing != true){
            $("#moods-graph").empty();
            var norm = $('body').data('norm');
            if(!norm) norm = 0;
            drawChart(moods_arr.reverse(),norm);
        }else if(first_init == true){
            $("#moods-graph").empty();
            set_init_data("#moods-graph");
        }
    });
}
function traversal_feelings(isOlder){
    var moods_arr = [];
    var page = $('body').data('page');
    if(isOlder){
        page++;
    }else{
        if(page == 0) return;
        page--;
    }
    chart.showLoading();
    var user_id = $('body').data('userid');
    var path = '/users/'+user_id+'/moods_page/'+10+'/'+page+'.json';
    $.ajax(path).success(function(data){
        var i = 0;
        if(data.length == 0){
            //disable previous button
        }else{
            $('body').data('page',page);
            $.each(data, function(key, value) {
                    var mood = create_mood_object(value);
                    moods_arr.push(mood);
            });
        }
        moods_arr.reverse();
        set_points_on_graph(moods_arr);
        chart.hideLoading();
    });

}
function olderFeelings(){
    traversal_feelings(true);
}
function newerFeelings(){
    traversal_feelings(false);
}
function zoomIn(){

}
function zoomOut(){

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
        if(render_needed == true){
            redraw_friends_widgets(happy, gloomy);
        }
    });
}
function redraw_friends_widgets(happy, gloomy){
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
    var picLink = 'https://graph.facebook.com/'+id+'/picture';
    var mood = mood_json.m;
    var post = mood_json.p;
    var time = mood_json.t;
    var name = mood_json.n;
    //redirect_fb the html for the icon
    var happy = 0; //0 for unhappy, 1 for happy
    if(mood > 3){
        happy = 1;
    }else{
        happy = 0;
    }
    var fb_date_pattern = /([0-9][0-9][0-9][0-9])\-([0-9][0-9])\-([0-9][0-9])T([0-9][0-9])\:([0-9][0-9])\:([0-9][0-9])\+0000/;
    var date_array = fb_date_pattern.exec(time);
    var prityTime = full_month[date_array[2]-1]+" "+ date_array[3]+" at "+ date_array[4]+":"+date_array[5];
    var html =
    "<div id='"+id+"' class='friend-icon' > \
                <div id='"+id+"modal' class='modal-content'> \
                    "+getMoodPopup(name,mood,post,prityTime,picLink)+"\
                </div> \
                <img src='"+picLink+"' title='"+name+" : "+post+"' onclick='overFriendPic("+id+")'/>\
     </div>";
    return [happy,html];
}
function getMoodPopup(name,mood,post,time,picLink){
    var html = "<div class='feel-popup'>\
        <div class='feel-popup-top'>\
             <img style=\"float:left\" src='"+picLink+"'/>\
             <span class='feel-popup-title'>"+name+" feels</span>\
             <span>"+getMoodImageLink(mood)+"</span>\
             <span class='feel-popup-title'>"+getMoodStr(mood)+"</span>\
         </div>\
         <div class='mood-color-line' style=\"background-color:"+getMoodColor(mood)+"\"></div>\
         <div class='feel-popup-body'>\
             <div class='feel-popup-text'>"+post+"</div>\
             <div class='feel-popup-date'>"+time+"</div>\
         </div>\
    </div>";
    return html;

}
function overFriendPic(id){
    $("#"+id+"modal").modal();
}

function renderGloomyCloud(){
    var id = $('body').data('userid');
    $.ajax("/users/"+id+"/gloomy_words.json").success(function(data){
        var word_list = []
        $.each(data, function(item,val) {
            word_list.push(
            {
                text: val[0],
                weight:val[1]
            }
            );
        });
        $("#gloomy-tag-cloud").jQCloud(word_list);
        $('body').data('gloomy-cloud',1);
    });
}

function changeCloud(){
    var currCloud = $('body').data('cloud');
    var gloomyStatus = $('body').data('gloomy-cloud');

    if(currCloud == 0 ){
        //happy
        $('.cloud').toggleClass('hidden');
        if(gloomyStatus == 0){
           renderGloomyCloud();
        }
        $('body').data('cloud',1);
    }else{
        //current gloomy
        $('.cloud').toggleClass('hidden');
        $('body').data('cloud',0);
    }
}


function renderHappyCloud(id){
    var id = $('body').data('userid');
    $.ajax("/users/"+id+"/happy_words.json").success(function(data){
        var word_list = []
        $.each(data, function(item,val) {
            word_list.push(
            {
                text: val[0],
                weight:val[1]
            }
            );
        });
        $("#happy-tag-cloud").jQCloud(word_list);
    });
}
