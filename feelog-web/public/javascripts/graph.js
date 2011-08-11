var chart;
var moodLabels = ["","", "", "", "", "","", ""];
var normalized_options = {
    chart: {
        renderTo: 'moods-graph',
        defaultSeriesType: 'spline'
    },
    title: {
        text: null
    },
    xAxis: {
        type: "datetime",
        maxZoom: 3600 * 1000,
        labels: {
            style: {
                fontSize:'7pt'
            }
        }
    },
    yAxis: {
        title: {
            text: null
        },
        max: 8,
        min: 0,
        tickInterval: 1,
        labels: {
            formatter: function() {
                return moodLabels[this.value];
            }
        }
    },
    tooltip: {
        crosshairs: false,
        shared: false,
        backgroundColor: "#56436D",
        borderRadius: 0,
        borderWidth: 0
    },
    plotOptions: {
        area:{
          fillColor: '#DDD9C3'
        },
        series:{
            cursor: 'pointer'
        },
        spline: {
            marker: {
                radius: 4,
                lineColor: '#666666',
                lineWidth: 1
            }
        }
    },
    series: [{
        name: 'Happiness',
        marker: {
            symbol: 'circle'
        },
        data:[]
    }],
    credites:{
        enabled: false
    },
    legend:{
        enabled: false
    }
};
var unnormalized_options = {
    chart: {
        renderTo: 'moods-graph',
        defaultSeriesType: 'spline',
        spacingLeft: 0
    },
    title: {
        text: null
    },
    xAxis: {
        type: "linear",
        categories:[],
        labels: {
            style:{fontSize:10,fontFamily:"Arial"}
        }
    },
    yAxis: {
        title: {
            text:null
        },
        max: 8,
        min: 0,
        tickInterval: 1,
        labels: {enabled:false}
    },
    tooltip: {
        crosshairs: false,
        shared: false,
        backgroundColor: "#56436D",
        style:{padding:10},
        borderRadius: 0,
        borderWidth: 0,
        shadow: false
    },
    plotOptions: {
        area:{
          fillColor: '#DDD9C3'
        },
        series:{
            cursor: 'pointer',
            point:{
                events:{}
            }
        },
        spline: {
            marker: {
                radius: 4,
                lineColor: '#666666',
                lineWidth: 1
            }
        }
    },
    series: [{data:[]}],
    credits:{
        enabled: false
    },
    legend:{
        enabled: false
    },
    loading:{
        labelStyle:{
            fontWeight: 'bold',
            position: 'relative',
            top: '70px',
            color:'white'
        },
        style: {
            position: 'absolute',
            backgroundColor: "#56436D",
            opacity: 0.8,
            textAlign: 'center'
        }
    }
};

function zoom0_format_label(value){
    var ts = new Date(value);
    if(isCurrentWeekNumber(ts)){
        return week[ts.getDay()];
    }else{
        return month[ts.getMonth()]+" "+ts.getDate();
    }
}
//days aggregation
function zoom1_format_label(value){
    return zoom0_format_label(value*1000);
}
//weeks aggregation
function zoom2_format_label(value){
    return value;
}

//month aggregation
function zoom3_format_label(value){
    return full_month[value-1];
}

function zoom0_format_tooltip(point){
    var ts;

    if(point.t){
       ts = new Date(point.t);
    }else{
       ts = new Date(point.x);
    }
    var min = "";
    if(ts.getMinutes()<10){
        min = "0";
    }
    min = min+ts.getMinutes();
    var tooltip = "<span style=\"color:white\">"+point.name+"</span><br><span style=\"color:#CCCCCC\">"+full_month[ts.getMonth()] +" "+ts.getDate()+" @ "+ts.getHours()+":"+min+"</span>";
    return tooltip;
}
//tooltip for daily aggregated zoom, should show number of posts
function zoom1_format_tooltip(point){
    var ts;
    if(point.t){
       ts = new Date(point.t*1000);
    }else{
       ts = new Date(point.x*1000);
    }
    var tooltip = "<span style=\"color:white\">"+point.name+" updates posted on</span><br><span style=\"color:#CCCCCC\">"+full_month[ts.getMonth()] +" "+ts.getDate()+"</span>";
    return tooltip;
}

//tooltip for weekly aggregated zoom, should show number of posts
function zoom2_format_tooltip(point){
    var tooltip = "<span style=\"color:white\">"+point.name+" updates posted</span><br><span style=\"color:#CCCCCC\">during week "+point.t+"</span>";
    return tooltip;
}

//tooltip for monthly aggregated zoom, should show number of posts
function zoom3_format_tooltip(point){
    var m = point.t;
    var tooltip = "<span style=\"color:white\">"+point.name+" updates posted during</span><br><span style=\"color:#CCCCCC\">"+full_month[m-1]+"</span>";
    return tooltip;
}


function zoom0_onClick(point){
    var ts;
    if(point.t){
       ts = new Date(point.t);
    }else{
       ts = new Date(point.x);
    }
    var min = "";
    if(ts.getMinutes()<10){
        min = "0";
    }
    min = min+ts.getMinutes();
    var prityTime = full_month[ts.getMonth()]+" "+ts.getDate()+" at "+ts.getHours()+":"+min;
    var post_id = null;
    var uid = null;
    if(point.fb_id != null){
        var tmp = point.fb_id.split("_");
        post_id = tmp[1];
        uid = tmp[0];
    }
    var html = getMoodPopup(name,point.y,point.name,prityTime,$('body').data('picture'),post_id,uid,point.id);
    if(point.fb_id == null){
        $.modal(html,{
            containerCss: {
                'maxHeight' : '700px',
                'minHeight' :'300px',
                'width':'500px'
            }
         });

    }else{
         $.modal(html,{
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

//zoom on click should display on graph all the points from zoomed period
function zoom1_onClick(point){
    var range = {start:point.s,end:point.e}
    move_to_range(0,range);
}

function zoom2_onClick(point){
    var range = {start:point.s,end:point.e}
    var zoom = $('body').data('zoom');
    move_to_range(1,range);
}
function zoom3_onClick(point){
    var range = {start:point.s,end:point.e}
    move_to_range(2,range);
}

function getGraphIconURL(moodid){
    switch(Math.round(moodid)){
            case 1:
                return 'url(/images/graph_icon_angry.gif)';
            case 2:
                return 'url(/images/graph_icon_very_sad.gif)';
            case 3:
                return 'url(/images/graph_icon_sad.gif)';
            case 4:
                return 'url(/images/graph_icon_ok.gif)';
            case 5:
                return 'url(/images/graph_icon_happy.gif)';
            case 6:
                return 'url(/images/graph_icon_twink.gif)';
            case 7:
                return 'url(/images/graph_icon_very_happy.gif)';
        }


}

function drawEmptyChart(text){
    if(chart != null){
        chart.destroy();
    }
    unnormalized_options.series[0].data = [];
    unnormalized_options.xAxis.categories = [];
    chart = new Highcharts.Chart(unnormalized_options);
    if(text != null){
        chart.showLoading(text);
    }
}

function drawChart(moods,norm, onClick,format_label, format_tooltip,zoom) {
    if(!norm){
        var norm = 0;
    }
    unnormalized_options.series[0].data = [];
    unnormalized_options.xAxis.categories = [];
    for(var i=0;i<moods.length;i++){
        if(zoom == 0){
            var d = new Date(moods[i].date.replace(/-/g,'/').replace('T',' ').replace('Z',' GMT')).getTime();
        }else{
            var d = moods[i].period;
        }

        var p;
        if(norm == 1){
            p = create_norm_point(moods[i],d);
            normalized_options.series[0].data.push(p);
        }else{
            p = create_unnorm_point(moods[i],d);
            /*needed for unnormalized graph*/
            unnormalized_options.series[0].data.push(p);
            unnormalized_options.xAxis.categories.push(d);
            /*needed for unnormalized graph*/
        }
    }
    var options;
    if(norm == 1){
        options =  normalized_options;
    }else{
        unnormalized_options.xAxis.labels.formatter = function() {return format_label(this.value);}
        unnormalized_options.tooltip.formatter = function() {return format_tooltip(this.point);}
        unnormalized_options.plotOptions.series.point.events.click = function() {onClick(this);}
        options = unnormalized_options;
    }
    if(chart != null){
        chart.hideLoading();
        chart.destroy();
    }
    chart = new Highcharts.Chart(options);
}

function create_norm_point(mood,d){
   return {
            "name":mood.desc,
            "y":mood.val,
            marker:{
                symbol: getGraphIconURL(mood.val)
            },
            "x":d,
            "id":mood.id
          };
}

function create_unnorm_point(mood,d){
    if(mood.zoom > 0){
        return {
               "name":mood.desc,
               "y":mood.val,
               marker:{
                   symbol: getGraphIconURL(mood.val)
               },
               "t":d,
               "s":mood.s,
               "e":mood.e,
               "fb_id":mood.fb_id,
               "id":mood.id
              };

    }else{
        return {
               "name":mood.desc,
               "y":mood.val,
               marker:{
                   symbol: getGraphIconURL(mood.val)
               },
               "t":d,
               "fb_id":mood.fb_id,
                "id":mood.id
              };
    }
}

function mood_to_point(mood, norm) {
    if(mood.zoom == undefined || mood.zoom == 0){
        var d = new Date(mood.date.replace(/-/g,'/').replace('T',' ').replace('Z',' GMT')).getTime();
    }else{
        var d = mood.period;
    }
    var p;
    if (norm == 1) {
        p = create_norm_point(mood,d);
    } else {
        p = create_unnorm_point(mood,d);
    }
    return {d:d, p:p};
}
/*
adds point to the graph shifting by one every time
redraw the graph in at the and
 */
function add_points_to_graph(moods){
    var norm = $('body').data('norm');
    if(!norm) norm = 0;
    var series = chart.series[0];
    //shift on more then 10 elements in the graph
    for(var i = 0;i < moods.length;i++){
        var shift = series.data.length >= 10;
        var __ret = mood_to_point(moods[i], norm);
        var d = __ret.d;
        var p = __ret.p;
        series.addPoint(p,false,shift);
        if(norm == 0){
            var categories = chart.xAxis[0].categories;
            categories.push(d);
            chart.xAxis[0].setCategories(categories, false);
        }
    }
    chart.redraw();
}


function move_to_range(zoom,range){
    var user_id = $('body').data('userid');
    var path = '/users/'+user_id+'/moods_range/'+7+'/'+zoom+'/'+range.start+'/'+range.end+'.json';
    var moods_arr = [];
    select_zoom(zoom);
    $.ajax(path).success(function(data){
        var i = 0;
        if(data == null || data.moods == null || data.moods.length == 0){
            //disable previous button
        }else{
            $('body').data('page',data.page);
            $.each(data.moods, function(key, value) {
                    var mood = create_mood_object(value,zoom);
                    moods_arr.push(mood);
            });
            moods_arr.reverse();
            var norm = $('body').data('norm');
            var zoom_f = getZoomFunctions(zoom);
            chart.destroy();
            chart = null;
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

function select_zoom(zoom){
    $(".zoom-option").removeClass("selected-pointer");
    switch(zoom){
        case 0:
            $("#graph-zoom-post").addClass("selected-pointer");
            break;
        case 1:
            $("#graph-zoom-day").addClass("selected-pointer");
            break;
        case 2:
            $("#graph-zoom-week").addClass("selected-pointer");
            break;
        case 3:
            $("#graph-zoom-month").addClass("selected-pointer");
            break;
    }
}

function reloadGraph(zoom,page){
    var moods_arr = [];
    chart.showLoading();
    var user_id = $('body').data('userid');
    var path = '/users/'+user_id+'/moods_page/'+7+'/'+page+'/'+zoom+'.json';
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
            drawChart(moods_arr,norm,zoom_f.onClick,zoom_f.format_label,zoom_f.format_tooltip,zoom);
            if(zoom != $('body').data('zoom')){
                $('body').data('zoom',zoom);
            }
        }
        chart.hideLoading();
    });
}


function traversal_feelings(isOlder, zoom){
    var page = $('body').data('page');
    if(zoom != $('body').data('zoom')){
        //zooming
        page = 0;
        select_zoom(zoom);
    }else{
        //traversal
        if(isOlder){
            page++;
        }else{
            if(page == 0) return;
            page--;
        }
    }
    reloadGraph(zoom,page);
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
    traversal_feelings(true,zoom);
}
function newerFeelings(){
    var zoom = $('body').data('zoom');
    var range = $('body').data('zoom-range');
    traversal_feelings(false,zoom);
}
function zoomIn(){
    if($('body').data('zoom-back')!=null){
        return;
    }
    var zoom = $('body').data('zoom');
    if (zoom == 0){
        return;
    }
    traversal_feelings(false,zoom-1);
}

function zoom(zoom){
    traversal_feelings(false,zoom);
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
    traversal_feelings(false,zoom+1);
}
