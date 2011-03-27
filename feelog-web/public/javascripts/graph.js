
function drawChart(moods) {
    var moodLabels = ["","angry", "very sad", "sad", "ok", "happy","twinky", "very happy"];
    var options = {
      chart: {
         renderTo: 'moods-graph',
         defaultSeriesType: 'spline'
      },
      title: {
         text: 'My Happiness'
      },
      xAxis: {
         categories: []
      },
      yAxis: {
         title: {
            text: 'Mood'
         },
         max: 8,
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
                return this.point.name;
         }
      },
      plotOptions: {
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
      var p = {name:moods[i].desc,y:moods[i].val};
      options.series[0].data.push(p);
      options.xAxis.categories.push(moods[i].time);
    }
    chart = new Highcharts.Chart(options);
   }