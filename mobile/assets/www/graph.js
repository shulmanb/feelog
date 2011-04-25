function format_label(value){
    var ts = new Date(value)
    var min = "";
    if(ts.getMinutes()<10){
        min = "0";
    }
    min = min+ts.getMinutes();
    //ts.getHours()+":"+min+"<br> "+ - was removed
    var dstr = month[ts.getMonth()]+" "+ts.getDate();
    return dstr;
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
    var tooltip = point.name+"<br>"+ts.getHours()+":"+min+" "+month[ts.getMonth()]+" "+ts.getDate();
    return tooltip;
}

function onClick(){
   $.modal("Test");
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
            text: 'My Happiness'
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
                text: 'Mood'
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
            formatter: function() {
                return format_tooltip(this.point);
            }
        },
        plotOptions: {
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
        credits:{
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
            text: 'My Happiness'
        },
        xAxis: {
            type: "datetime",
            maxZoom: 3600 * 1000,
            labels: {
                formatter: function() {
                    return format_label(this.value);
                }
            }
        },
        yAxis: {
            title: {
                text: 'Mood'
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
            formatter: function() {
                return format_tooltip(this.point);
            }
        },
        plotOptions: {
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
        credits:{
            enabled: false
        },
        legend:{
            enabled: false
        }
    };
    for(var i=0;i<moods.length;i++){
        var date_pattern = /([0-9][0-9][0-9][0-9])\-([0-9][0-9])\-([0-9][0-9])T([0-9][0-9])\:([0-9][0-9])\:([0-9][0-9])\Z/;
        var date_array = date_pattern.exec(moods[i].date);
        var d = new Date(date_array[1],date_array[2],date_array[3],date_array[4],date_array[5]).getTime();
        var p;
        if(norm == 1){
            p = {
                name:moods[i].desc,
                y:moods[i].val,
                x:d
            };
            normalized_options.series[0].data.push(p);
        }else{
            p = {
                name:moods[i].desc,
                y:moods[i].val,
                t:d
            };
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