    function toggle(moodid){
	$(".mood-icon-choice-selected").toggleClass("mood-icon-choice-selected");
        $("#mood_mood").val(moodid);
        $('#'+'mood'+moodid).toggleClass("mood-icon-choice-selected");
    }

    function getMoodImageLink(moodid){
      switch(moodid){
        case 1:
          return '<img src="/images/mood-angry.jpg">';
        case 2:
          return '<img src="/images/mood-very_sad.jpg">';
        case 3:
          return '<img src="/images/mood-sad.jpg">';
        case 4:
          return '<img src="/images/mood-ok.jpg">';
        case 5:
          return '<img src="/images/mood-twink.jpg">';
        case 6:
          return '<img src="/images/mood-happy.jpg">';
        case 7:
          return '<img src="/images/mood-very_happy.jpg">';
      }

    }

    function prepareMoodIcons(){
      $("#mood1").click(function() {
        toggle(1);
      });
      $("#mood2").click(function() {
        toggle(2);
      });
      $("#mood3").click(function() {
        toggle(3);
      });
      $("#mood4").click(function() {
        toggle(4);
      });
      $("#mood5").click(function() {
        toggle(5);
      });
      $("#mood6").click(function() {
        toggle(6);
      });
      $("#mood7").click(function() {
        toggle(7);
      });
    }
