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
    var ts = new Date(report_time);
    var mood = {"val":mood_val,"desc":desc,"time":month[ts.getMonth()]+" "+ts.getDate(),"date":ts.toString()};
    var moodStr = '<b>'+getMoodStr(mood.val)+'</b>';
    var status = name +' is '+moodStr+' : '+mood.desc;
    $("#usr-status").html(status);
    var series = chart.series[0];
    //shift on more then 10 elements in the graph
    var shift = series.data.length > 11;
    var d = new Date(report_time).getTime();
    var p = {"name":mood.desc,"y":mood.val,"x":d};
    series.addPoint(p,false,shift);
//    var categories = chart.xAxis[0].categories;
//    alert(categories);
/*    if(shift){
      categories.shift();
    }
    alert(mood.time);
*/
//    categories.push(mood.time);
//    alert(categories);
    //chart.xAxis[0].setCategories(categories, false);
    chart.redraw();
}
