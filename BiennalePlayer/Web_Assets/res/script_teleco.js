
var fadeTime = 500;

var idleTimeList = 15;
var idleTimeFilm = 45;
var idleTimePause = 300;
var idleTime = idleTimeList;

$('.player').hide();

var loadedFilm = 'none';
var playOrPause = 'pause';
var isPlaying = false;

// DEBUG
///////////////////////////////////////////////////////////
// $('#waitScreen').hide();
// $('body, .player, .controls, #waitScreen').css( "maxWidth", "1024px");
// $('body').css( "margin", "auto");
// $('body').css( "marginTop", "-20px");
// $('html').css( "backgroundColor", "lightgrey");


// APP COMMUNICATION
///////////////////////////////////////////////////////////
function sendMessage(message){
  try {
    window.webkit.messageHandlers.teleco.postMessage(message)
  }
  catch(error) {
    //console.log(error)
  }
}
function onMessage(message){
    message = message.split(" ")
    if (message[0] == "progress") {
        if (isPlaying) $('#scrollbar').css('width', parseInt(message[1])+'%');
    }
    else if (message[0] == "end") endOfFilm()
}

// FIX IOS SCROLLING
///////////////////////////////////////////////////////////
$('.player, #waitScreen').on("touchmove", function(e) { e.preventDefault(); });


// FIX IOS IMAGE GRAB
///////////////////////////////////////////////////////////


// SHOW
///////////////////////////////////////////////////////////
$('.film').on('click',function(){

  var movie = $(this);

  loadedFilm = movie.find('.filmTitle').text().trim();
  console.log(loadedFilm)

  $('#filmFiche').empty()
  $('#filmFiche').append(movie.html())
  sendMessage('info '+$('#filmFiche')[0].outerHTML.replace(/(\r\n\t|\n|\r\t)/gm,"") );
  $('.player').fadeIn(fadeTime, function(){ /*$('.filmList').hide();*/ });

  // Player CTRLS
  $('#play').children('img').attr('src', "res/images/play.png");
  // $('#scrollbar').css('margin-left','0%');
  $('#scrollbar').css('width','0%');
  resetTimer(idleTimeFilm);
});


// PLAY PAUSE
///////////////////////////////////////////////////////////
$('#play').on('click',function(){
    if(isPlaying==false){
      var fileName = $('#filmFiche').find('.filmFile').text().trim()
      console.log("play", fileName)
      sendMessage('play '+fileName);
      isPlaying = true;
      $('#play').children('img').attr('src', "res/images/pause.png");
      stopTimer();
    }
    else if(isPlaying==true){
      isPlaying = false;
      $('#play').children('img').attr('src', "res/images/play.png");
      sendMessage('pause');
      resetTimer(idleTimePause);
    }
});

//SCROLLBAR
///////////////////////////////////////////////////////////
$('#scrollbarContainer').on('click',function(e){
    var offset = $(this).offset();
    var relX = e.pageX - offset.left;
    var percent = ( relX / $(this).width() )*100;
    //$('#scrollbar').css('margin-left', percent+'%'); // A ENLEVER
    sendMessage('skip '+percent);
});


// CLOSE FILM
///////////////////////////////////////////////////////////
$('#closer').on('click',function(){
    closeFilm();
});

function closeFilm(){
    sendMessage('black');
    isPlaying = false;
    $('.player').fadeOut(fadeTime, function(){
                         sendMessage('loop _standby.mp4');
    });
    loadedFilm = 'none';
    resetTimer(idleTimeList);
}


// END OF FILM
///////////////////////////////////////////////////////////
function endOfFilm(){
    isPlaying = false;
    $('#play').children('img').attr('src', "res/images/play.png");
    //closeFilm();
    resetTimer(idleTimeFilm);
}


// IDLE
///////////////////////////////////////////////////////////

var timeoutHandle;
var timeoutHandle2;

$(document).on('click touchstart', function(){ resetTimer() });

//resetTimer();

// Exit wait screen
$('#waitScreen').on('click touchend',function (e) {
    clearTimeout(timeoutHandle2);
    $('#waitScreen').fadeOut(fadeTime);
    $('body').scrollTop(0);
});

// Show wait screen
function showWaitScreen() {
    $('#waitScreen').fadeIn(fadeTime);
    if(loadedFilm!='none') sendMessage('black');
    // close film once wait screen hide the scene
    timeoutHandle2 = setTimeout(function(){ if(loadedFilm!='none') closeFilm();
                                            else sendMessage('loop _standby.mp4');
    }, fadeTime)
}

// Timer
function resetTimer(idleT){
    stopTimer()
    if (idleT !== undefined) idleTime = idleT
    timeoutHandle = setTimeout(function(){
      if (isPlaying==false) showWaitScreen()   // Go to wait screen
    }, idleTime*1000);
}

function stopTimer() {
    clearTimeout(timeoutHandle)
}
