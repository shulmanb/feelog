google.load('visualization', '1', {'packages':['annotatedtimeline']});


function drawChart(moods) {
  var data = new google.visualization.DataTable();
  data.addColumn('date', 'Date');
  data.addColumn('number', 'Mood Level');
  data.addColumn('string', 'mood title');
  data.addColumn('string', 'mood-text');
  
  data.addRows(moods.length);
  for(var i=0;i<moods.length;i++){
      data.setValue(i, 0, new Date(moods[i].time));
      data.setValue(i, 1, moods[i].val);
//      data.setValue(i, 2, moods[i].val);
//      data.setValue(i, 3, moods[i].desc);
  }

  
  var annotatedtimeline = new google.visualization.AnnotatedTimeLine(
      document.getElementById('moods-graph'));
  annotatedtimeline.draw(data, {width:500,height:250,'displayAnnotations': true});
}