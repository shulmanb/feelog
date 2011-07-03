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
    $(".smiley-selected").toggleClass("smiley-angry-selected smiley-sad-selected smiley-verysad-selected smiley-ok-selected smiley-happy-selected smiley-ammused-selected smiley-veryhappy-selected smiley-selected",false);
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
                return "smiley-ammused-selected";
            case 1:
                return "smiley-veryhappy-selected";
        }
    },true);

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
    $(".smiley-selected").toggleClass("smiley-angry-selected smiley-sad-selected smiley-verysad-selected smiley-ok-selected smiley-happy-selected smiley-ammused-selected smiley-veryhappy-selected smiley-selected",false);
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
    drawEmptyChart("Loading...")
    $.ajax(path+"/limit/7.json").success(function(data){
        var i = 0;
        if(data.length == 0){
        //set empty data notification
        }
        $('body').data('page',0);
        $('body').data('zoom',0);
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
            var norm = $('body').data('norm');
            if(!norm) norm = 0;
            drawChart(moods_arr.reverse(),norm,zoom0_onClick,zoom0_format_label,zoom0_format_tooltip,0);
        }else if(first_init == true){
            set_init_data();
        }
    });
}
function traversal_feelings(isOlder, zoom,range){
    var moods_arr = [];
    var page = $('body').data('page');
    if(zoom != $('body').data('zoom')){
        //zooming
        page = 0;
    }else{
        //traversal
        if(isOlder){
            page++;
        }else{
            if(page == 0) return;
            page--;
        }
    }
    chart.showLoading();
    var user_id = $('body').data('userid');
    if(range != null){
        var path = '/users/'+user_id+'/moods_range/'+7+'/'+page+'/'+range.start+'/'+range.end+'.json';
    }else{
        var path = '/users/'+user_id+'/moods_page/'+7+'/'+page+'/'+zoom+'.json';
    }
    $.ajax(path).success(function(data){
        var i = 0;
        if(data == null || data.length == 0){
            //disable previous button
        }else{
            $('body').data('page',page);
            $.each(data, function(key, value) {
                    var mood = create_mood_object(value,zoom);
                    moods_arr.push(mood);
            });
            moods_arr.reverse();
            var norm = $('body').data('norm');
            var zoom_f = getZoomFunctions(zoom);
            chart.destroy();
            drawChart(moods_arr,norm,zoom_f.onClick,zoom_f.format_label,zoom_f.format_tooltip,zoom);
            if(zoom != $('body').data('zoom')){
                $('body').data('zoom',zoom);
            }
//            else{
//                set_points_on_graph(moods_arr);
//            }
        }
        chart.hideLoading();
    });
}

function getZoomFunctions(zoom){
    switch(zoom){
        case 0:
            return {onClick:zoom0_onClick,format_label:zoom0_format_label,format_tooltip:zoom0_format_tooltip};
        case 1:
            return {onClick:zoom1_onClick,format_label:zoom1_format_label,format_tooltip:zoom1_format_tooltip};
        case 2:
            return {onClick:zoom2_onClick,format_label:zoom2_format_label,format_tooltip:zoom2_format_tooltip};
        case 3:
            return {onClick:zoom3_onClick,format_label:zoom3_format_label,format_tooltip:zoom3_format_tooltip};
    }
}
function backToZoom(){
    $('body').removeData('zoom-range');
    var zoom = $('body').data('zoom-back');
    $('body').removeData('zoom-back');
    traversal_feelings(false,zoom,null);

}

function olderFeelings(){
    var zoom = $('body').data('zoom');
    var range = $('body').data('zoom-range');
    traversal_feelings(true,zoom,range);
}
function newerFeelings(){
    var zoom = $('body').data('zoom');
    var range = $('body').data('zoom-range');
    traversal_feelings(false,zoom,range);
}
function zoomIn(){
    if($('body').data('zoom-back')!=null){
        return;
    }
    var zoom = $('body').data('zoom');
    if (zoom == 0){
        return;
    }
    traversal_feelings(false,zoom-1,null);
}

function zoomOut(){
    if($('body').data('zoom-back')!=null){
        backToZoom();
        return;
    }
    var zoom = $('body').data('zoom');
    if( zoom == 3){
        return;
    }
    traversal_feelings(false,zoom+1,null);
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

function redraw_friends_widgets(happy, gloomy){
    $("#happy-friends").empty();
    $("#gloomy-friends").empty();

    if(happy.length > 0){
        $("#happy-friends").show();
        $("body").data('happy-friends',happy);
        $('body').data('happy-page',0);
        if(happy.length > 10){
            $("#happy-friends-control").toggleClass('hidden');
        }
        $('body').data('happy-page-max',Math.floor(happy.length/10));
    }else{
        set_no_data("#happy-friends-widget");
    }
    if(gloomy.length > 0){
        $("#happy-friends").show();
        $("body").data('gloomy-friends',gloomy);
        $('body').data('gloomy-page',0);
        if(gloomy.length > 10){
            $("#gloomy-friends-control").toggleClass('hidden');
        }
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
        $("#"+id+"_comment").toggleClass('fb-text-passive');
    }
}

function blurCommentBox(textarea,id){
    if(textarea._has_control){
        if(textarea.value == ''){
            textarea._has_control = false;
            $("#"+id+"_comment").toggleClass('fb-text-passive');
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
    if($("#comments_"+postId+"_view").is(":visible")){
        $("#comments_"+postId+"_view").toggleClass('hidden');
        $("#comments_"+postId+"_view").empty();
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
            });
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
    if($("#likes_"+postId+"_view").is(":visible")){
        $("#likes_"+postId+"_view").toggleClass('hidden');
        $("#likes_"+postId+"_view").toggleClass('fb-detail');
        $("#likes_"+postId+"_view").empty();
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
//                    for(var j = 0;j <10;j++){
                        if((scroll && i<7)||(!scroll && i < 8)){
                            waitOn[i] = FB.Data.query(template,val.user_id);
                        }else{
                            hidden.push(val.user_id);
                        }
                        i++;
//                    }
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
            });
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
             <img style=\"float:left\" src='"+picLink+"'/>\
             <span class='feel-popup-title'>"+name+" feels</span>\
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