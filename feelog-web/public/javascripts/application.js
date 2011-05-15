var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
    var norm = $('body').data('norm');
    if(!norm) norm = 0;
    $("#how").val("why?");
    $("#mood_val").val('');
    $(".smiley-selected").toggleClass("smiley-selected");
    var ts = new Date(report_time);
    var mood = {
        "val":mood_val,
        "desc":desc,
        "date":ts.toString()
    };
    var moodStr = '<b>'+getMoodStr(mood.val)+'</b>';
    var status = name +' is '+moodStr+' : ';
    $("#usr-status").html(status);
    $("#usr-report").text(mood.desc);
    var series = chart.series[0];
    //shift on more then 10 elements in the graph
    var shift = series.data.length >= 10;
    var d = new Date(report_time).getTime();
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
    chart.redraw();
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
                    var status = name +' is '+moodStr+' : ';
                    $("#usr-status").text(status);
                    $("#usr-report").text(mood.desc);
                }
                moods_arr.push(mood);
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
            set_init_data("#moods-graph")
        }
    });
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
                <img src='"+picLink+"' title='"+name+" : "+post+"' onclick='overFriendPic("+id+")'/>\
     </div>";
    return [happy,html];
}
function overFriendPic(id){
    $("#"+id+"modal").modal();
}
function renderCloud(){
    var word_list = [
    {
        text: "Jonathan",
        weight: 9
    },

    {
        text: "Hot",
        weight: 2
    },

    {
        text: "Meeting",
        weight: 9
    },

    {
        text: "Friends",
        weight: 8
    },

    {
        text: "Delicious",
        weight: 5
    },

    {
        text: "Love",
        weight: 3
    },

    {
        text: "Funny",
        weight: 11
    },

    {
        text: "Great",
        weight: 6
    }
    ];
    $("#tag-cloud").jQCloud(word_list);
}
