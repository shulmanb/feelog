var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var full_month = ['January','February','March','April','May','June','July','August','September','October','November','December'];

var week = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

//changed to ajax
function submitMood(){
        var val = $("#mood_val").val();
        var how = $("#how").val();
        var location = $('body').data('coords');
        var fbshare = $("#fbshare").val();
        var twshare = $("#twshare").val();
        var payload;
        if(location != null){
           payload = {"mood[lat]":location.latitude,"mood[lon]":location.longitude,"mood[desc]":how,"mood[mood]":val,"fbshare":fbshare,"twshare":twshare};
        }else{
           payload = {"mood[desc]":how,"mood[mood]":val,"fbshare":fbshare,"twshare":twshare};
        }
        if (val != ''){
            var userid = $('body').data('userid');
            $("#feel-submit").hide();
            $("#ajax-busy").show();
            $.ajax({
              url: "/users/"+userid+"/moods.json",
              type:"POST",
              data:payload,
              success: function(data){
                returnFromCreateMood(data.report_time,data.val,data.desc);
              }
            });
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
                    happy.push([id,rendered[1],rendered[2]]);
                }else{
                    gloomy.push([id,rendered[1],rendered[2]]);
                }
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
        $("body").data('happy-friends',happy);
        $('body').data('happy-page',0);
        if(happy.length > 10){
            $("#happy-friends-control").toggleClass('hidden');
        }
        $('body').data('happy-page-max',Math.floor(happy.length/10));
    }else{
        set_no_data("#happy-friends");
    }
    if(gloomy.length > 0){
        $("body").data('gloomy-friends',gloomy);
        $('body').data('gloomy-page',0);
        if(gloomy.length > 10){
            $("#gloomy-friends-control").toggleClass('hidden');
        }
        $('body').data('gloomy-page-max',Math.floor(gloomy.length/10));
    }else{
        set_no_data("#gloomy-friends");
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
    var mood = mood_json.m;
    var post = mood_json.p;
    var time = mood_json.t;
    var name = mood_json.n;
    var post_id = mood_json.i;
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
                    "+getMoodPopup(name,mood,post,prityTime,picLink,post_id,id)+"\
                </div> \
                <img src='"+picLink+"' title='"+name+" : "+post+"' onclick='overFriendPic("+id+","+post_id+")'/>\
     </div>";
    return [happy,html,post_id];
}

function renderFbDetail(text,display,id){
    return "<li id='"+display.toLowerCase()+"_"+id+"_detail' class='fb-detail'>" +
               "<div class='fb-inner'>" +
                    "<div class='fb-as-link' onclick=\"display"+display+"("+id+")\">" +
                        "<label id='"+display.toLowerCase()+"_"+id+"_lbl' class='fb-label'>"+text+"</label>" +
                    "</div>" +
               "</div>"+
           "</li>"+
           "<li id='"+display.toLowerCase()+"_"+id+"_view' class='fb-detail hidden fb-view-"+display.toLowerCase()+"'></li>";

}

function renderFbCommentBox(id){
    return "<li id='"+id+"_comment_detail' class='fb-detail'>" +
                   "<div class='fb-inner'>" +
                      "<div class='fb-comment-wrap'>"+
                        "<textarea id='"+id+"_comment' class='fb-text-area fb-text-passive' title='Write a comment' class='fb-comment-box' onclick='focusCommentBox(this,"+id+")'  onblur='blurCommentBox(this,"+id+")' onkeydown='if (event.keyCode == 13) { submitComment(this,"+id+"); return false; }'>Write a comment...</textarea> " +
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
    });
}

function like(postId,uid){
    FB.api(uid+'_'+postId+'/likes','post',function(response) {
        updateLikesLabel(postId);
        }
    );
}

function displayComments(postId){
    FB.api({
            method: 'fql.query',
            query: "SELECT text FROM comment WHERE object_id='"+postId+"'"
        },
        function(data) {
            alert('View '+data.length)
        });
}

function displayLikes(postId){
    if($("#likes_"+postId+"_view").is(":visible")){
        $("#likes_"+postId+"_view").toggleClass('hidden');
        $("#likes_"+postId+"_view").empty();
    }else{
        FB.api({
                method: 'fql.query',
                query: "SELECT user_id FROM like WHERE object_id='"+postId+"'"
            },
            function(data) {
                if(data.length>8){
                    $("#likes_"+postId+"_view").append("<img style=\"float:right\" src=\"/images/IconRight.gif\"/>");
                    $("#likes_"+postId+"_view").append("<img style=\"float:left\" src=\"/images/IconLeft.gif\"/>");

                }
                var i = 0;
                $.each(data, function(item,val) {
                    if(i<8){
                        FB.api({method: 'fql.query',query: "SELECT name,pic_square FROM user WHERE uid = '"+val.user_id+"'"},
                                function(data){
                                    $("#likes_"+postId+"_view").append("<img class='fb-like-image' src=\""+data[0].pic_square+"\" title=\""+data[0].name+"\">");
                                });
                    }else{
                        $("#likes_"+postId+"_view").append("<div class='hidden'>"+val.user_id+"</div>");
                    }
                    i++;
                });
                if(data.length > 0){
                    $("#likes_"+postId+"_view").toggleClass('hidden');
                }
            });
    }
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
                    $('#likes_'+postId+'_lbl').text(data.length+" people likes it");
                }else{
                    $('#'+postId).prepend(renderFbDetail(data.length+" people likes it",'Likes',postId));
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
                    $('#'+postId+"_comment_detail").before(renderFbDetail("View all "+data.length+" comments",'Comments',postId));
                }
            }else{
                $('#comments_'+postId).remove();
            }
        }
    );

}


function retrievePost(postId){

    if($("#"+postId+"_comment_detail").length <=0){
        $('#'+postId).append(renderFbCommentBox(postId));
        $('#'+postId+"_comment").elastic();
    }

    FB.api({
            method: 'fql.query',
            query: "SELECT text FROM comment WHERE object_id='"+postId+"'"
        },
        function(data) {
            if(data.length > 0){
                $('#'+postId+"_comment_detail").before(renderFbDetail("View all "+data.length+" comments",'Comments',postId));
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

function getMoodPopup(name,mood,post,time,picLink,id,uid){
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
             <div>\
                   <span class='feel-popup-date'>"+time+' '+"</span>\
                   <span class='fb-actions'>\
                       <a class='fb-as-link' title='Like this item'><span class='fb-message' onclick='like("+id+","+uid+")'>Like </span></a>\
                       <span class='fb-message'> - </span>\
                       <a class='fb-as-link' title='Leave a comment'><span class='fb-message' onclick='focusOnCommentBox("+id+")'> Comment</span></a>\
                   </span>\
             </div>\
         </div>\
         <ul class='fb-staff' id='"+id+"'>\
         </ul>\
    </div>";
    return html;
}

function overFriendPic(id,post_id){
    $("#"+id+"modal").modal({
        focus:false,
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