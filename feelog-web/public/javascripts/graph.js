
function drawChart(moods) {
    var moodLabels = ["","", "", "", "", "","", ""];
    var options = {
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
                    var ts = new Date(this.value)
                    var min = "";
                    if(ts.getMinutes()<10){
                        min = "0";
                    }
                    min = min+ts.getMinutes();
                    return ts.getHours()+":"+min+"<br> "+month[ts.getMonth()]+" "+ts.getDate();
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
                var ts = new Date(this.point.x);
                var min = "";
                if(ts.getMinutes()<10){
                    min = "0";
                }
                min = min+ts.getMinutes();
                var tooltip = this.point.name+"<br>"+ts.getHours()+":"+min+" "+month[ts.getMonth()]+" "+ts.getDate();
                return tooltip;
            }
        },
        plotOptions: {
            series:{
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            alert("Test");
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
        var d = new Date(moods[i].date).getTime();
        var p = {
            name:moods[i].desc,
            y:moods[i].val,
            x:d
        };
        options.series[0].data.push(p);
    //      options.xAxis.categories.push(moods[i].time);
    }
    chart = new Highcharts.Chart(options);
}