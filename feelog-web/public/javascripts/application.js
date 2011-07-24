function getInternetExplorerVersion()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
}



var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var full_month = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var week = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var full_week = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function isCurrentWeekNumber(date){
    var onejan = new Date(date.getFullYear(),0,1);
    var wn  = Math.ceil((((date - onejan) / 86400000) + onejan.getDay()+1)/7);
    var curr = new Date();
    var currWn = Math.ceil((((curr - onejan) / 86400000) + onejan.getDay()+1)/7);
    return (wn == currWn);
}

function dayOfYear(date){
    var onejan = new Date(date.getFullYear(),0,1);
    var days = Math.ceil((date.getTime() - onejan.getTime()) / 86400000);
    dOff = date.getTimezoneOffset()/60;
    jOff = onejan.getTimezoneOffset()/60;
    if(dOff != jOff){
        //add day to the calculations, as 00:52 considered as prev day
        if(date.getHours() == 0){
            days++;
        }
    }
    return days;
}

//changed to ajax
function submitMood(){
        var val = $("#mood_val").val();
        $("#how").blur();
        var how = $("#how").val();
        var location = $('body').data('coords');
        var fbshare = $("#fbshare").is(':checked');
        var twshare = $("#twshare").is(':checked');
        var payload;
        if(location != null){
           payload = {"mood[lat]":location.latitude,"mood[lon]":location.longitude,"mood[desc]":how,"mood[mood]":val};
        }else{
           payload = {"mood[desc]":how,"mood[mood]":val};
        }
        if (val != ''){
            var userid = $('body').data('userid');
            $("#feel-submit").hide();
            $("#ajax-busy").show();
            if(fbshare){
                FB.api('/me/feed', 'post', { message: how }, function(response) {
                    var id = response.id;
                    payload['fb_id'] = id;
                    $.ajax({
                      url: "/users/"+userid+"/moods.json",
                      type:"POST",
                      data:payload,
                      success: function(data){
                        returnFromCreateMood(data.report_time,data.val,data.desc,id);
                      }
                    });

                });
            }else{
                $.ajax({
                  url: "/users/"+userid+"/moods.json",
                  type:"POST",
                  data:payload,
                  success: function(data){
                    returnFromCreateMood(data.report_time,data.val,data.desc,null);
                  }
                });
            }
        }
}

function onReportFocus(how){
    if(how.value=="why?"){
        how.value = "";
    }
    $(how).toggleClass("report-text-passive",false);
}

function onReportBlur(how){
    if(how.value==""){
        how.value = "why?";
    }
    $(how).toggleClass("report-text-passive",true);
}

function toggle(moodid){
    $(".smiley-selected").toggleClass("smiley-angry-selected smiley-sad-selected smiley-verysad-selected smiley-ok-selected smiley-happy-selected smiley-cheerful-selected smiley-veryhappy-selected smiley-selected",false);
    $("#mood_val").val(moodid);
    $('#'+'s'+moodid).toggleClass("smiley-selected",true);
    $('#'+'s'+moodid).toggleClass(function(){
        switch(moodid){
            case 7:
                return "smiley-angry-selected";
            case 6:
                return "smiley-verysad-selected";
            case 5:
                return "smiley-sad-selected";
            case 4:
                return "smiley-ok-selected";
            case 3:
                return "smiley-happy-selected";
            case 2:
                return "smiley-cheerful-selected";
            case 1:
                return "smiley-veryhappy-selected";
        }
    },true);
    if(isChecked(moodid)){
        $("#fbshare").attr('checked','checked');
    }else{
        $("#fbshare").removeAttr('checked');
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

function getMoodSmallImageLink(moodid){
    switch(moodid){
        case 1:
            return '<img src="/images/graph_icon_angry.gif">';
        case 2:
            return '<img src="/images/graph_icon_very_sad.gif">';
        case 3:
            return '<img src="/images/graph_icon_sad.gif">';
        case 4:
            return '<img src="/images/graph_icon_ok.gif">';
        case 5:
            return '<img src="/images/graph_icon_happy.gif">';
        case 6:
            return '<img src="/images/graph_icon_twink.gif">';
        case 7:
            return '<img src="/images/graph_icon_very_happy.gif">';
    }
}

function getMoodImageClass(moodid){
    switch(moodid){
        case 1:
            return 'angry-logo';
        case 2:
            return 'very-sad-logo';
        case 3:
            return 'sad-logo';
        case 4:
            return 'ok-logo';
        case 5:
            return 'happy-logo';
        case 6:
            return 'cheerful-logo';
        case 7:
            return 'very-happy-logo';
    }
}


function getMoodStr(mood){
    switch(mood){
        case 1:
            return 'Angry';
        case 2:
            return 'Very sad';
        case 3:
            return 'Sad';
        case 4:
            return 'OK';
        case 5:
            return 'Happy';
        case 6:
            return 'Cheerful';
        case 7:
            return 'Very happy';
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
    $("#how").elastic();
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
function returnFromCreateMood(report_time,mood_val,desc,fb_id){
    $('#ajax-busy').hide();
    $("#how").val("why?");
    $("#mood_val").val('');
    $(".smiley-selected").toggleClass("smiley-angry-selected smiley-sad-selected smiley-verysad-selected smiley-ok-selected smiley-happy-selected smiley-cheerful-selected smiley-veryhappy-selected smiley-selected",false);
    var moodStr = '<b>'+getMoodStr(mood_val)+'</b>';
    var status = name +' is '+moodStr+' : ';
    $("#usr-status").html(status);
    $("#usr-report").text(desc);
    var mood = {
        "val":mood_val,
        "desc":desc,
        "date":report_time,
        "fb_id":fb_id
    };
    var currZoom = $('body').data('zoom');
    if(currZoom != 0){
        zoom(0);
    }
    addPointToDiary(mood);
    add_points_to_graph([mood]);

    $("#feel-submit").show();

}
function create_mood_object(value,zoom){
    switch(zoom){
        case 0:
            var mood = {
                "val":value.mood.mood,
                "desc":value.mood.desc,
                "date":value.mood.report_time,
                "zoom":0,
                "fb_id":value.mood.fb_id
            };
            break;
        case 1:
        case 2:
        case 3:
            var mood = {
                "val":value.avg,
                "desc":value.count,
                "period":value.per,
                "zoom":zoom,
                "s":value.s,
                "e":value.e
            };
            break;
    }
    return mood;
}
function renderMoods(path){
    var moods_arr = [];
    var initializing = false;
    var first_init = true;
    $("#moods-graph").empty();
    var ie = getInternetExplorerVersion();
    if(ie == -1 || ie >8){
        drawEmptyChart("Loading...");
    }
    $.ajax(path+"/limit/7.json").success(function(data){
        var i = 0;
        if(data.length == 0){
        //set empty data notification
        }
        $('body').data('page',0);
        $('body').data('zoom',0);
        var sum = 0;
        var cnt = 0;
        $.each(data, function(key, value) {
            if (key == 'retry'){
                setTimeout(function(){renderMoods(path)},value);
                initializing = true;
            }else if(key == 'retry_cnt'){
                if(value > 1){
                    first_init = false;
                }
            }else{
                var mood = create_mood_object(value,0);
                moods_arr.push(mood);
                cnt++;
                sum+=mood.val;
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
        if(cnt == 0){
          $('#usr-avg').toggleClass('hidden',true);
        }else{
            $('#usr-avg').toggleClass('hidden',false);
            var avgMood = sum/cnt;
            var moodTxt = getMoodStr(Math.round(avgMood));
            var moodImg = getMoodSmallImageLink(Math.round(avgMood));
            $("#usr-avg-img").append(moodImg);
            $("#usr-avg-txt").text(moodTxt);
        }


        if(initializing != true){
            var norm = $('body').data('norm');
            if(!norm) norm = 0;
            drawChart(moods_arr.reverse(),norm,zoom0_onClick,zoom0_format_label,zoom0_format_tooltip,0);
        }else if(first_init == true){
            set_init_data();
        }
    });
}


function set_no_data(tag){
    $(tag).hide();
}

function set_init_data(){
    chart.hideLoading();
    chart.showLoading("Loading User Data...")
}

function renderFriends(path){
    var happy = new Array();
    var gloomy = new Array();
    var render_needed = true;
    $.ajax(path).success(function(data){
        if(data.length == 0){}
        $.each(data, function(id, val) {
            if (id == 'retry'){
                setTimeout(function(){renderFriends(path)},val);
            }else if (id == 'retry_cnt'){
                if (val >1){
                    render_needed = false;
                }
            }else{
                $.each(val, function(indx,mood_json) {
                    var u_id = mood_json.u_id
                    var rendered = renderFriendIcon(u_id,mood_json);
                    if(rendered[0]){
                        happy.push([u_id,rendered[1],rendered[2]]);
                    }else{
                        gloomy.push([u_id,rendered[1],rendered[2]]);
                    }
                })
            }
        });
        if(render_needed == true){
            redraw_friends_widgets(happy, gloomy);
        }
    });
}

function  apply_page_class(index,name,elemId){
    var remainder = index % 10;
    var page_id = ( index - remainder ) / 10;

    $('#'+elemId).toggleClass(name+page_id);
    if(page_id > 0){
        $('#'+elemId).toggleClass('hidden');
    }
}


function applyFriendsWysdgetStyle(widgetid,arr){
    if(arr.length >5){
        $(widgetid).toggleClass('friends-action-small',false)
        $(widgetid).toggleClass('friends-action',true)
    }else{
        $(widgetid).toggleClass('friends-action',false)
        $(widgetid).toggleClass('friends-action-small',true)
    }
    if(arr.length > 10){
        $(widgetid+"-control").toggleClass('hidden');
    }

    $(widgetid).show();
}
function redraw_friends_widgets(happy, gloomy){
    $("#happy-friends").empty();
    $("#gloomy-friends").empty();

    if(happy.length > 0){
        applyFriendsWysdgetStyle("#happy-friends",happy);
        $('body').data('happy-page',0);
        $('body').data('happy-page-max',Math.floor(happy.length/10));
    }else{
        set_no_data("#happy-friends-widget");
    }
    if(gloomy.length > 0){
        applyFriendsWysdgetStyle("#gloomy-friends",gloomy);
        $("#gloomy-friends").show();
        $('body').data('gloomy-page',0);
        $('body').data('gloomy-page-max',Math.floor(gloomy.length/10));
    }else{
        set_no_data("#gloomy-friends-widget");
    }
    var i = 0;
    for (i = 0;;i++){
        var empty = -2;
        if(happy.length >i){
            $("#happy-friends").append(happy[i][1]);
            apply_page_class(i,'happy',happy[i][0]);
        }else{
            empty++;
        }
        if(gloomy.length >i){
            $("#gloomy-friends").append(gloomy[i][1]);
            apply_page_class(i,'gloomy',gloomy[i][0]);
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
    var mood = mood_json.m
    var post = mood_json.p
    var time = mood_json.t
    var name = mood_json.n
    var post_id = mood_json.i
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
                    "+getMoodPopup(name,mood,post,prityTime,picLink,post_id,id,true)+"\
                </div> \
                <img src='"+picLink+"' title='"+name+" : "+post+"' onclick='overFriendPic("+id+",\""+post_id+"\")'/>\
     </div>";
    return [happy,html,post_id];
}

function renderFbDetail(text,display,id){
    var txt = display.toLowerCase();
    return "<li id='"+txt+"_"+id+"_detail' class='fb-detail'>" +
               "<div class='fb-inner'>" +
                    "<div class='fb-as-link' onclick=\"display"+display+"('"+id+"')\">" +
                        "<img src='/images/icon-fb-"+txt+".png'/>"+
                        "<label id='"+txt+"_"+id+"_lbl' class='fb-label'>"+text+"</label>" +
                    "</div>" +
               "</div>"+
           "</li>";
}

function renderFbCommentBox(id){
    return "<li id='"+id+"_comment_detail' class='fb-detail'>" +
                   "<div class='fb-inner'>" +
                      "<div class='fb-comment-wrap'>"+
                        "<textarea id='"+id+"_comment' class='fb-text-area fb-text-passive fb-comment-box' title='Write a comment' onclick='focusCommentBox(this,"+id+")'  onblur='blurCommentBox(this,"+id+")' onkeydown='if (event.keyCode == 13) { submitComment(this,"+id+"); return false; }'>Write a comment...</textarea> " +
                      "</div>"+
                   "</div>"+
                "</li>";
}


function focusOnCommentBox(id){
    $("#"+id+"_comment").click();
    $("#"+id+"_comment").focus();
}

function focusCommentBox(textarea,id){
    if(!textarea._has_control){
        textarea._has_control = true;
        textarea.value='';
        $("#"+id+"_comment").removeClass('fb-text-passive');
    }
}

function blurCommentBox(textarea,id){
    if(textarea._has_control){
        if(textarea.value == ''){
            textarea._has_control = false;
            $("#"+id+"_comment").addClass('fb-text-passive');
            textarea.value = 'Write a comment...';
        }
    }
}

function submitComment(textarea,postId){
    FB.api(postId+"/comments",'post',{message:textarea.value},function(response) {
        textarea.value = '';
        textarea.blur();
        updateCommentsLabel(postId);
        if($("#comments_"+postId+"_view").is(":visible")){
            FB.api({
                    method: 'fql.query',
                    query: "SELECT text,fromid, time FROM comment WHERE object_id ='"+postId+"' AND id='"+response.id+"' "
                },
                function(val) {
                    var user = getUser(val[0].fromid);
                    user.wait(function(res){
                        renderComment(res[0].pic_square,res[0].name,val[0].text,val[0].time,postId);
                        $("#"+postId+"_popup").scrollTop($("#"+postId+"_popup")[0].scrollHeight);
                    });
                });

        }
    });
}

function like(postId,uid){
    FB.api(uid+'_'+postId+'/likes','post',function(response) {
        updateLikesLabel(postId);
        }
    );
}

function displayComments(postId){
    if($('body').data(postId+'comments-click-on')==null){
       $('body').data(postId+'comments-click-on','on');
        if($("#comments_"+postId+"_view").is(":visible")){
            $('body').removeData(postId+'comments-on');
            $("#comments_"+postId+"_view").toggleClass('hidden');
            $("#comments_"+postId+"_view").empty();
            $('body').removeData(postId+'comments-click-on');
        }else{
            FB.api({
                    method: 'fql.query',
                    query: "SELECT id,text,fromid,time FROM comment WHERE object_id='"+postId+"'"
                },
                function(data) {
                    var sortfunct = function(a,b){
                        return (a - b);
                    };
                    data.sort(sortfunct);
                    var qArr = new Array();
                    for(var i = 0;i < data.length;i++){
                        qArr[i] = getUser(data[i].fromid);
                    }
                    FB.Data.waitOn(qArr, function(args) {
                        for(var i = 0;i < data.length;i++){
                            renderComment(args[i][0].pic_square,args[i][0].name,data[i].text,data[i].time,postId);
                        }
                        $("#comments_"+postId+"_view").toggleClass('hidden');
                        $("#"+postId+"_popup").scrollTop($("#"+postId+"_popup")[0].scrollHeight);
                    });
                    $('body').removeData(postId+'comments-click-on');
                });
        }

    }
}
function renderComment(pic_square,name,text,time,postId){
        var html = "<li class='fb-detail'>" +
                        "<div class='fb-comment'>"+
                             "<img class='fb-comment-pic' src=\""+pic_square+"\">" +
                             "<div class='fb-comment-body'>"+
                                "<div class='fb-comment-content'>"+
                                     "<span class='fb-comment-name'>"+name+"</span>"+
                                     renderText(text)+
                                 "</div>"+
                                  "<div class='fb-comment-time'>"+timestampToCommentTime(time)+"</div>"+
                            "</div>"+
                         "</div>"+
                   "</li>";
        $("#comments_"+postId+"_view").append(html);
        $.modal.setPosition();
}

function getUser(userid){
    var queryTemplate = "SELECT name,pic_square FROM user WHERE uid = {0}";
    var u = FB.Data.query(queryTemplate, userid);
    return u;
}
function renderText(text){
    return  "<span class='fb-comment-text'>"+text+"</span>";
}
function timestampToCommentTime(time){
    var ts = new Date(1000*time);
    var str = '';
    if(isCurrentWeekNumber(ts)){
        str+=full_week[ts.getDay()];
    }else{
        str+= full_month[ts.getMonth()]+" "+ts.getDate();
    }
    str+=" at ";
    var min = "";
    if(ts.getMinutes()<10){
        min = "0";
    }
    min = min+ts.getMinutes();
    str+=ts.getHours();
    str+=":"
    str+=min;
    return str;
}

function displayLikes(postId){
    if($('body').data(postId+'likes-click-on')==null){
       $('body').data(postId+'likes-click-on','on');
        if($("#likes_"+postId+"_view").is(":visible")){
            $("#likes_"+postId+"_view").toggleClass('hidden');
            $("#likes_"+postId+"_view").toggleClass('fb-detail');
            $("#likes_"+postId+"_view").empty();
            $('body').removeData(postId+'likes-click-on');
         }else{
            FB.api({
                    method: 'fql.query',
                    query: "SELECT user_id FROM like WHERE object_id='"+postId+"'"
                },
                function(data) {
                    var i = 0;
                    var scroll = (data.length > 8);
                    var hidden = [];
                    var template = "SELECT name,pic_square FROM user WHERE uid={0}";
                    var waitOn = [];
                    $.each(data, function(item,val) {
                            if((scroll && i<7)||(!scroll && i < 8)){
                                waitOn[i] = FB.Data.query(template,val.user_id);
                            }else{
                                hidden.push(val.user_id);
                            }
                            i++;
                    });

                    FB.Data.waitOn(waitOn,function(data){
                        for(var i = 0;i <data.length;i++){
                                $("#likes_"+postId+"_view").append("<img class='fb-like-image' id='"+"lk_"+i+"'src=\""+data[i][0].pic_square+"\" title=\""+data[i][0].name+"\">");
                        }
                        for(var i = 0;i <hidden.length;i++){
                            var indx = i+7;
                            $("#likes_"+postId+"_view").append("<div class='hidden' id='"+"lk_"+indx+"'>"+hidden[i]+"</div>");
                        }
                    });

                    if(scroll){
                        $("#likes_"+postId+"_view").append("<span onclick='nextLikes()' class=\"arrow-right\"/>");
                        $("#likes_"+postId+"_view").append("<span onclick='prevLikes()' class=\"arrow-left\"/>");
                        $('body').data('likes-start',0);
                        $('body').data('likes-last',hidden.length+6);
                        $('body').data('likes-open',6);
                    }

                    if(data.length > 0){
                        $("#likes_"+postId+"_view").toggleClass('fb-detail');
                        $("#likes_"+postId+"_view").toggleClass('hidden');
                        $.modal.setPosition();
                    }
                    $('body').removeData(postId+'likes-click-on');
                });
        }

    }
}

function nextLikes(){
    var start = $('body').data('likes-start');
    var last = $('body').data('likes-last');
    if(start+7>=last){
        return;
    }
    var opnCnt  = (start+7+4 <=last)?4:last-start-6;
    hideLikes(start,opnCnt);
    openLikes(start+7,opnCnt);
    $('body').data('likes-start',start+opnCnt);

}

function prevLikes(){
    var start = $('body').data('likes-start');
    if(start == 0){
        return;
    }
    var opnCnt  = (start-4 > 0)?4:start;
    openLikes(start-opnCnt,opnCnt);
    hideLikes(start+7-opnCnt,opnCnt);
    $('body').data('likes-start',start-opnCnt);
}

function hideLikes(startIndx, cnt){
    for(var i=0;i<cnt;i++){
        $('#lk_'+(startIndx+i)).toggleClass('hidden',true);
    }
}

function openLikes(startIndx, cnt){
    var retrieved = $('body').data('likes-open');
    var ids = []
    for(var i=0;i<cnt;i++){
        if(startIndx+i<=retrieved){
            $('#lk_'+(startIndx+i)).toggleClass('hidden',false);
        }else{
            ids.push($('#lk_'+(startIndx+i)).text());
        }
    }
    var template = "SELECT name,pic_square FROM user WHERE uid={0}";
    var waitOn = [];
    for(var i = 0;i<ids.length;i++){
        waitOn[i] = FB.Data.query(template,ids[i]);
    }
    FB.Data.waitOn(waitOn,function(data){
        for(var i = 0;i <data.length;i++){
            var indx = retrieved+i+1;
            $("#lk_"+indx).replaceWith("<img class='fb-like-image' id='"+"lk_"+indx+"'src=\""+data[i][0].pic_square+"\" title=\""+data[i][0].name+"\">");
        }
        $('body').data('likes-open',retrieved+data.length);
    });
}


function updateLikesLabel(postId){
    FB.api({
            method: 'fql.query',
            query: "SELECT user_id FROM like WHERE object_id='"+postId+"'"
        },
        function(data) {
            if(data.length > 0){
                var likes = $('#likes_'+postId+'_lbl').length;
                if (likes > 0 ) {
                    $('#likes_'+postId+'_lbl').text(data.length+" people like it");
                }else{
                    $('#likes_'+postId+'_view').before(renderFbDetail(data.length+" people likes it",'Likes',postId));
                }
            }else{
                $('#likes_'+postId).remove();
            }
        });
}

function updateCommentsLabel(postId){
    FB.api({
            method: 'fql.query',
            query: "SELECT text FROM comment WHERE object_id='"+postId+"'"
        },
        function(data) {
            if(data.length > 0){
                var comments = $('#comments_'+postId+'_lbl').length;
                if (comments > 0 ) {
                    $('#comments_'+postId+'_lbl').text("View all "+data.length+" comments");
                }else{
                    $('#comments_'+postId+"_view").before(renderFbDetail("View all "+data.length+" comments",'Comments',postId));
                }
            }else{
                $('#comments_'+postId).remove();
            }
        }
    );

}


function retrievePost(postId){
    $('body').removeData(postId+'comments-on')
    $('body').removeData(postId+'likes-on');

    FB.api({
            method: 'fql.query',
            query: "SELECT text FROM comment WHERE object_id='"+postId+"'"
        },
        function(data) {
            if(data.length > 0){
                $('#comments_'+postId+"_view").before(renderFbDetail("View all "+data.length+" comments",'Comments',postId));
            }
        }
    );

    FB.api({
            method: 'fql.query',
            query: "SELECT user_id FROM like WHERE object_id='"+postId+"'"
        },
        function(data) {
            if(data.length > 0){
                $('#'+postId).prepend(renderFbDetail(data.length+" people likes it",'Likes',postId));
            }
        });
}

function getMoodPopup(name,mood,post,time,picLink,id,uid,fb){
    var html = "<div class='feel-popup'>\
        <div class='feel-popup-top'>\
             <img style=\"float:left\" src='"+picLink+"'/>\             <span class='feel-popup-title'>"+name+" feels</span>\
             <span>"+getMoodImageLink(mood)+"</span>\
             <span class='feel-popup-title'>"+getMoodStr(mood)+"</span>\
         </div>\
         <div class='mood-color-line' style=\"background-color:"+getMoodColor(mood)+"\"></div>\
         <div class='feel-popup-body' "+insertIdIfNotNull(id,"_popup")+">\
             <div class='feel-popup-text'>"+post+"</div>\
             <div>\
                   <span class='feel-popup-date'>"+time+' '+"</span>"+
                    getFbActions(fb,id,uid)+
             "</div>"+
             getFbStaff(fb,id)+
         "</div>\
    </div>";
    return html;
}

function insertIdIfNotNull(id,txt){
    if (id == null) return "";
    return "id='"+id+txt+"'";
}
function getFbStaff(fb,id){
    if(!fb){
        return "";
    }
    return  "<ul class='fb-staff' id='"+id+"'>"+
                "<li id='likes_"+id+"_view' class='hidden fb-view-likes'></li>"+
                "<li id='comments_"+id+"_view' class='hidden fb-view-comments'></li>"+
                renderFbCommentBox(id)+
            "</ul>";


}

function getFbActions(fb,id,uid){
    if(!fb){
        return "";
    }
    return    "<span class='fb-actions'>\
        <a class='fb-as-link' title='Like this item'><span class='fb-message-top' onclick='like("+id+","+uid+")'>Like </span></a>\
        <span class='feel-popup-date'>&#x00B7;</span>\
        <a class='fb-as-link' title='Leave a comment'><span class='fb-message-top' onclick='focusOnCommentBox("+id+")'> Comment</span></a>\
    </span>";
}
function overFriendPic(id,post_id){
    $("#"+id+"modal").modal({
        focus:false,
        autoPosition: true,
        autoResize:true,
        containerCss: {
            'maxHeight' : '700px',
            'minHeight' :'300px',
            'width':'500px'
        },
        onShow: function(dlg) {$(dlg.container).css('height','auto');$(".fb-comment-box").elastic()},
        position: ['10%', '25%'],
        onOpen: retrievePost(post_id)
     });
}

function prevFriends(name){
    var page = $('body').data(name+'-page');
    if(page == 0){
        return;
    }
    $("."+name+page).toggleClass('hidden');
    $("."+name+(page-1)).toggleClass('hidden');
    $('body').data(name+'-page',page-1);
}

function nextFriends(name){
    var max = $('body').data(name+'-page-max');
    var page = $('body').data(name+'-page');
    if(page == max){
        return;
    }
    $("."+name+page).toggleClass('hidden');
    $("."+name+(page+1)).toggleClass('hidden');
    $('body').data(name+'-page',page+1);
}

function renderGloomyCloud(){
    var id = $('body').data('userid');
    $.ajax("/users/"+id+"/gloomy_words.json").success(function(data){
        var word_list = []
        if(data == null || data.length == 0){
            $("#empty-cloud").removeClass("happy");
            $("#empty-cloud").toggleClass("gloomy",true);
            $("#empty-cloud").removeClass("hidden");
        }else{
            $("#empty-cloud").toggleClass("hidden",true);
            $.each(data, function(item,val) {
                word_list.push(
                {
                    text: val[0],
                    weight:val[1]
                }
                );
            });
            $("#gloomy-tag-cloud").jQCloud(word_list);
        }
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

function renderHappyCloud(){
    var id = $('body').data('userid');
    $.ajax("/users/"+id+"/happy_words.json").success(function(data){
        if(data == null || data.length == 0){
            $("#empty-cloud").removeClass("hidden");
            $("#empty-cloud").addClass("happy");
            $("#empty-cloud").removeClass("gloomy");
        }else{
            $("#empty-cloud").toggleClass("hidden",true);
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
        }
    });
}

function retrieveDiaryPosts(){
    $('#diary-loading').toggleClass('hidden',false);
    var page = $('body').data('diary-page');
    page++;
    var user_id = $('body').data('userid');
    var path = '/users/'+user_id+'/moods_page/'+10+'/'+page+'/'+0+'.json';
    $.ajax(path).success(function(data){
        var i = 0;
        var moods_arr = [];
        if(data.length == 0){
        //set empty data notification
        }
        var moods_arr;
        $.each(data, function(key, value) {
                var mood = create_mood_object(value,0);
                moods_arr.push(mood);
        });
        renderDiaryPosts(page,moods_arr);
        $('body').data('diary-page',page);
        $('#diary-loading').toggleClass('hidden',true);
    });

}

function initDiaryWidget(){
    $('body').data('diary-page',-1);
    $('body').data('diary-last-day',0);
    $('body').data('diary-disp-days',0);

    retrieveDiaryPosts();


    $(window).scroll(function() {
        if  ($(window).scrollTop() == $(document).height() - $(window).height()){
            if(!$(".diary").hasClass("hidden")){
                retrieveDiaryPosts();
            }
        }
    });
}
function addPointToDiary(mood){
    //TODO implements
}
function renderDiaryPosts(page,moods){
     var initialIdx = page*10;
     var lastDay = $('body').data('diary-last-day');
     var dispDays = $('body').data('diary-disp-days');
     for(var i = 0;i<moods.length;i++){
         var id = initialIdx+i;
           var date = new Date(moods[i].date.replace(/-/g,'/').replace('T',' ').replace('Z',' GMT'));
           var doy = dayOfYear(date);
           if((doy > lastDay) && (lastDay != 0)){
               break;
               //TODO find more elegant solution for this bug
           }
           if(doy != lastDay){
               var dateStr = full_week[date.getDay()]+","+full_month[date.getMonth()]+" "+date.getDate()+" ,"+date.getFullYear();
               dispDays++;
               var clz =  (dispDays%2!=0)?'diary-odd-day':'diary-even-day';
               $('.diary-content').append(renderDiaryDay(clz,doy,dateStr));
               lastDay = doy;
               $('body').data('diary-disp-days',dispDays);
           }
           var minutes = date.getMinutes();
           if(minutes < 10){
               var strMinutes = '0'+minutes;
           } else{
               var strMinutes = minutes;
           }

         var min = "";
         if(date.getMinutes()<10){
             min = "0";
         }
         min = min+date.getMinutes();
         var prityTime = full_month[date.getMonth()]+" "+date.getDate()+" at "+date.getHours()+":"+min;
         var post_id = null;
         var uid = null;
         if(moods[i].fb_id != null){
             var tmp = moods[i].fb_id.split("_");
             post_id = tmp[1];
             uid = tmp[0];
         }
         var popupHtml = getMoodPopup(name,moods[i].val,moods[i].desc,prityTime,$('body').data('picture'),post_id,uid,post_id != null);
         var time = date.getHours()+":"+strMinutes;
         $('#diary-day-'+doy).append(renderDiaryEntry(moods[i].val,moods[i].desc,time,post_id,popupHtml,id));
     }
/*    if(page == 0){
        $('.diary').diaryScroll();
    }else{
        $('.diary').diaryUpdate();
    }
*/
     $('body').data('diary-last-day',lastDay);
}

function renderDiaryDay(dayClass,id,date){
     return "<div class=\""+dayClass+"\">"+
        "<div class=diary-day>"+
            "<div class='diary-date'>"+date+"</div>"+
            "<div id='diary-day-"+id+"' class='diary-day-posts'></div>"+
        "</div>"+
        "<div class='diary-shadow'></div>"
     "</div>";
}
function renderDiaryEntry(moodid,text,hour,post_id,popup,id){
    return "<div class='diary-post' onclick='openMoodPopup("+post_id+","+id+")'>"+
               "<div class='diary-mood-img'>"+getMoodImageLink(moodid)+"</div>"+
               "<div class='diary-post-content'>"+
                   "<span class='diary-mood-desc'>"+getMoodStr(moodid)+" </span>"+
                   "<span class='diary-post-hour'> @ "+hour+"</span>"+
                   "<div class='diary-post-text'>"+text+"</div>"+
               "</div>"+
           "</div>"+
           "<div id="+id+"-modal-diary class='modal-content'>"+
               popup+
            "</div>";
}

function openMoodPopup(post_id,id){
    var modalId = id+"-modal-diary";
    if(post_id == null){
        $("#"+modalId).modal({
            containerCss: {
                'maxHeight' : '700px',
                'minHeight' :'300px',
                'width':'500px'
            }
         });

    }else{
         $("#"+modalId).modal({
            focus:false,
            autoPosition: true,
            autoResize:true,
            containerCss: {
                'maxHeight' : '700px',
                'minHeight' :'300px',
                'width':'500px'
            },
            onShow: function(dlg) {$(dlg.container).css('height','auto');$(".fb-comment-box").elastic()},
            position: ['10%', '25%'],
            onOpen: retrievePost(post_id)
         });
    }
}


function fb_complete_login(token){
    $.post('/auth_token',{'token':token},function(data){
        window.location='/home';
    });
}

function fb_login(){
  FB.getLoginStatus(function(response) {
      if (response.session) {
        fb_complete_login(response.session.access_token);
      } else {
        FB.login(function(response) {
            if (response.session) {
                fb_complete_login(response.session.access_token);
            } else {
                // user cancelled login
            }
        },{perms:'publish_stream,email,offline_access,read_stream,friends_status'});
      }
  });
}

function switchView(newView){
    //views: 0-home, 1-diary, 2-settings 3-Dr. feelgood
    var currView=$('body').data('view');
    if(currView == newView){
        return;
    }
    $(".on").toggleClass('on',false);
    if(newView == 2){
        $("#btn-home").toggleClass('hidden',false);
        $("#main-view").hide();//toggleClass('hidden',true);
        showSettings();
        $("#settings-widget").toggleClass('hidden',false);
        $("#menu-2").toggleClass('on',true);
    }else if(newView == 1 ){
        $("#btn-home").toggleClass('hidden',false);
        $("#menu-1").toggleClass('on',true);
        $("#settings-widget").toggleClass('hidden',true);
        $("#settings-widget").toggleClass('hidden',true);
        $("#main-view").show();//toggleClass('hidden',false);
         $("#diduknow").toggleClass('hidden',true);
         $("#graph").toggleClass('hidden',true);
         $("#report").toggleClass('hidden',true);
         $("#diary").toggleClass('hidden',false);
         if(!$('body').data('diary-init')==1){
             initDiaryWidget();
             $('body').data('diary-init',1);
         }
    }else if(newView == 0 ){
        $("#btn-home").toggleClass('hidden',true);
        $("#menu-0").toggleClass('on',true);
        $("#settings-widget").toggleClass('hidden',true);
        $("#diduknow").toggleClass('hidden',false);
        $("#graph").toggleClass('hidden',false);
        $("#report").toggleClass('hidden',false);
        $("#diary").toggleClass('hidden',true);
        $("#main-view").show();//toggleClass('hidden',false);
    }
    $('body').data('view',newView);
}


function storeSettings(){
    var val = 0;
    if($('#1-fb-share').is(':checked')){
        val = val | 1;
    }
    if($('#2-fb-share').is(':checked')){
        val = val | 2;
    }
    if($('#3-fb-share').is(':checked')){
        val = val | 4;
    }
    if($('#4-fb-share').is(':checked')){
        val = val | 8;
    }
    if($('#5-fb-share').is(':checked')){
        val = val | 16;
    }
    if($('#6-fb-share').is(':checked')){
        val = val | 32;
    }
    if($('#7-fb-share').is(':checked')){
        val = val | 64;
    }
    var share_defaults = $('body').data('fb-share-defaults');
   if(val != share_defaults){
       var payload = {"settings":val};
       $("#settings-submit").toggleClass('invisible',true);
       $("#settings-ajax").toggleClass('invisible',false);
       $.ajax({
         url: "/users/"+$('body').data('userid')+"/settings.json",
         type:"POST",
         data:payload,
         success: function(data){
             $("#settings-submit").toggleClass('invisible',false);
             $("#settings-ajax").toggleClass('invisible',true);
             $('body').data('fb-share-defaults',val);
         },
         failure:function(){
             $("#settings-submit").toggleClass('invisible',false);
             $("#settings-ajax").toggleClass('invisible',true);
             showSettings()
         }
       });
   }
}

function showSettings(){
    var val = $('body').data('fb-share-defaults');
    if(val & 1){
      $('#1-fb-share').attr('checked', 'checked');
    }
    if(val & 2){
      $('#2-fb-share').attr('checked', 'checked');
    }
    if(val & 4){
      $('#3-fb-share').attr('checked', 'checked');
    }
    if(val & 8){
      $('#4-fb-share').attr('checked', 'checked');
    }
    if(val & 16){
      $('#5-fb-share').attr('checked', 'checked');
    }
    if(val & 32){
        $('#6-fb-share').attr('checked', 'checked');
    }
    if(val & 64){
       $('#7-fb-share').attr('checked', 'checked');
    }
}

function isChecked(mood){
    var defaults = $('body').data('fb-share-defaults');
    var mask = 0;
    switch(mood){
        case 1:
            mask = 1;
            break;
        case 2:
            mask = 2;
            break;
        case 3:
            mask = 4;
            break;
        case 4:
            mask = 8;
            break;
        case 5:
            mask = 16;
            break;
        case 6:
            mask = 32;
            break;
        case 7:
            mask = 64;
            break;
    }
    if((mask&defaults)!=0) return true;
    return false;
}


function openFeedbackForm(){
    var src = "https://spreadsheets.google.com/spreadsheet/viewform?formkey=dEhlVHhZeXZLemU4QVlRNGwxYnNwVlE6MQ";
    $.modal('<iframe src="' + src + '" height="580" width="620" style="border:0">', {
        containerCss: {
            height: 590,
            padding: 0,
            width: 625,
            backgroundColor:"#E8EEF7"
        },
        overflow:'hidden',
        autoResize:true,
        onOpen: function (dialog) {
            dialog.overlay.fadeIn('fast', function () {
                dialog.container.slideDown('fast', function () {
                    dialog.data.fadeIn('fast');
                });
            });
        },
        onClose: function (dialog) {
            dialog.data.fadeOut('fast', function () {
                dialog.container.slideUp('fast', function () {
                    dialog.overlay.fadeOut('fast', function () {
                        $.modal.close(); // must call this!
                    });
                });
            });
        }
    });
}