function isCurrentWeekNumber(date){
    var onejan = new Date(date.getFullYear(),0,1);
    var wn  = Math.ceil((((date - onejan) / 86400000) + onejan.getDay()+1)/7);
    var curr = new Date();
    var currWn = Math.ceil((((curr - onejan) / 86400000) + onejan.getDay()+1)/7);
    return (wn == currWn);
}

function format_label(value){
    var ts = new Date(value);
    if(isCurrentWeekNumber(ts)){
        return week[ts.getDay()];
    }else{
        return month[ts.getMonth()]+" "+ts.getDate();
    }
}

function format_tooltip(point){

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

function onClick(point){
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
    $.modal(html);
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


function drawChart(moods,norm) {
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
//        var date_pattern = /([0-9][0-9][0-9][0-9])\-([0-9][0-9])\-([0-9][0-9])T([0-9][0-9])\:([0-9][0-9])\:([0-9][0-9])\Z/;
//        var date_array = date_pattern.exec(moods[i].date);
//        var d = new Date(date_array[1],date_array[2]-1,date_array[3],date_array[4],date_array[5]).getTime();
        var d = new Date(moods[i].date).getTime();

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
   return {
           "name":mood.desc,
           "y":mood.val,
           marker:{
               symbol: getGraphIconURL(mood.val)
           },
           "t":d
          };
}

function mood_to_point(mood, norm) {
    var d = new Date(mood.date).getTime();
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