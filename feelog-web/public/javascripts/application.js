var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function submitMood(){
    var val = $("#mood_val").val();
//    var how = $("#how").val();
//    var fb = $("#fbshare").is(':checked');
//    var tw = $("#twshare").is(':checked');
    if (val != ''){
       $('#new_mood').submit();
//       the clearingpart willbedoneby response js
//       $(".smiley-selected").toggleClass("smiley-selected");
//      $("#mood_val").val('');
       //$("#how").val("why?");
    }
}



function toggle(moodid){
    $(".smiley-selected").toggleClass("smiley-selected");
    $("#mood_val").val(moodid);
    $('#'+'s'+moodid).toggleClass("smiley-selected");
    $("#how").val("");
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
            return '<img src="/images/mood-twink.png">';
        case 6:
            return '<img src="/images/mood-happy.png">';
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
            return 'twinky';
        case 6:
            return 'happy';
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
//    $('#new_mood').submit(function() {
//      alert('Mood Submitted to server');
//      return false;
//    });
}
