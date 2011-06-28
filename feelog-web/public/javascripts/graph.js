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
    return full_month[value];
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
    var tooltip = "<span style=\"color:white\">"+point.name+"</span><br><span style=\"color:#CCCCCC\">"+month[ts.getMonth()] +" "+ts.getDate()+" @ "+ts.getHours()+":"+min+"</span>";
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
    var tooltip = "<span style=\"color:white\">"+point.name+" updates posted on</span><br><span style=\"color:#CCCCCC\">"+month[ts.getMonth()] +" "+ts.getDate()+"</span>";
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
    var tooltip = "<span style=\"color:white\">"+point.name+" updates posted during</span><br><span style=\"color:#CCCCCC\">"+full_month[m]+"</span>";
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
    var html = getMoodPopup(name,point.y,point.name,prityTime,$('body').data('picture'));
    $.modal(html,{
        containerCss: {
            'maxHeight' : '700px',
            'minHeight' :'300px',
            'width':'500px'
        }
     });
}

//zoom on click should display on graph all the points from zoomed period
function zoom1_onClick(point){
    var range = {start:point.s,end:point.e}
    $('body').data('zoom-range',range);
    $('.zoom').toggleClass('hidden');
    $('.back-to-zoom').toggleClass('hidden');
    var zoom = $('body').data('zoom');
    $('body').data('zoom-back',zoom);
    traversal_feelings(false,0,range);
}

function zoom2_onClick(point){
    var range = {start:point.s,end:point.e}
    $('body').data('zoom-range',range);
    $('.zoom').toggleClass('hidden');
    $('.back-to-zoom').toggleClass('hidden');
    var zoom = $('body').data('zoom');
    $('body').data('zoom-back',zoom);
    traversal_feelings(false,0,range);
}
function zoom3_onClick(point){
    var range = {start:point.s,end:point.e}
    $('body').data('zoom-range',range);
    $('.zoom').toggleClass('hidden');
    $('.back-to-zoom').toggleClass('hidden');
    var zoom = $('body').data('zoom');
    $('body').data('zoom-back',zoom);
    traversal_feelings(false,0,range);
}

function getGraphIconURL(moodid){
    switch(moodid){
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

function drawChart(moods,norm, onClick,format_label, format_tooltip,zoom) {
    if(!norm){
        var norm = 0;
    }
    var moodLabels = ["","", "", "", "", "","", ""];
    var unnormalized_options = {
        chart: {
            renderTo: 'moods-graph',
            defaultSeriesType: 'spline'
        },
        title: {
            text: null
        },
        xAxis: {
            type: "linear",
            categories:[],
            labels: {
                formatter: function() {
                    return format_label(this.value);
                },
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
            crosshairs: true,
            shared: false,
            backgroundColor: "#56436D",
            style:{padding:10},
            borderRadius: 0,
            borderWidth: 0,
            shadow: false,
            formatter: function() {
                return format_tooltip(this.point);
            }
        },
        plotOptions: {
            area:{
              fillColor: '#DDD9C3'
            },
            series:{
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            onClick(this);
                        }
                    }
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
        },
        loading:{
            labelStyle:{
                fontWeight: 'bold',
                position: 'relative',
                top: '1em',
            },
            style: {
                position: 'absolute',
                backgroundColor: 'white',
                opacity: 0.5,
                textAlign: 'center'
            }
        }
    };
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
                },
                formatter: function() {
                    return format_label(this.value);
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
            crosshairs: true,
            shared: false,
            backgroundColor: "#56436D",
            borderRadius: 0,
            borderWidth: 0,
            formatter: function() {
                return format_tooltip(this.point);
            }
        },
        plotOptions: {
            area:{
              fillColor: '#DDD9C3'
            },
            series:{
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            onClick();
                        }
                    }
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
    for(var i=0;i<moods.length;i++){
        if(zoom == 0){
            var d = new Date(moods[i].date).getTime();
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
        options = unnormalized_options;
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
            "x":d
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
               "e":mood.e
              };

    }else{
        return {
               "name":mood.desc,
               "y":mood.val,
               marker:{
                   symbol: getGraphIconURL(mood.val)
               },
               "t":d
              };
    }
}

function mood_to_point(mood, norm) {
    if(mood.zoom == 0){
        var d = new Date(mood.date).getTime();
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

/*
sets new points for the graph
 */
function set_points_on_graph(moods){
    var norm = $('body').data('norm');
    if(!norm) norm = 0;
    var series = chart.series[0];
    var data = [];
    var categories = [];
    for(var i = 0;i < moods.length;i++) {
        var __ret = mood_to_point(moods[i], norm);
        var d = __ret.d;
        var p = __ret.p;
        data.push(p);
        if (norm == 0) {
            categories.push(d);
        }
    }
    series.setData(data,false);
    if(norm == 0){
        chart.xAxis[0].setCategories(categories, false);
    }
    chart.redraw();
}