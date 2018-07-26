
var fadeTime = 500;

var idleTimeList = 15000;
var idleTimeFilm = 30000;
var idleTime = idleTimeList;

$('.filmCard, .player').hide();

var loadedFilm = 'none';
var playOrPause = 'pause';
var isPlaying = false;

// DEBUG
///////////////////////////////////////////////////////////
//$('#waitScreen').hide();


// APP COMMUNICATION
///////////////////////////////////////////////////////////
function sendMessage(message){
    window.webkit.messageHandlers.teleco.postMessage(message)
}
function onMessage(message){
    message = message.split(" ")
    if (message[0] == "progress") {
        if (isPlaying) $('#scrollbar').css('margin-left', parseInt(message[1])+'%');
    }
    else if (message[0] == "end") endOfFilm()
}

// FIX IOS SCROLLING
///////////////////////////////////////////////////////////
$('.player, #waitScreen').on("touchmove", function(e) { e.preventDefault(); });

// SHOW
///////////////////////////////////////////////////////////
$('.film').on('click',function(){
    var filmName = $(this).attr('id');
    showFilm(filmName);
});

function showFilm(filmName){
    loadedFilm = filmName;
    var filmCard = filmName+'-card';
    $('.filmCard').hide();
    $('#'+filmCard).show();
    sendMessage('info '+btoa( $('#'+filmCard).prop('outerHTML') ) );
    $('.player').fadeIn(fadeTime, function(){ /*$('.filmList').hide();*/ });
    // css
    $('#play').children('img').attr('src', "res/images/play.png");
    $('#scrollbar').css('margin-left','0%');
    idleTime = idleTimeFilm;
    resetTimer();
}

// PLAY PAUSE
///////////////////////////////////////////////////////////
$('#play').on('click',function(){
    if(isPlaying==false){
      var fileName = $('#'+loadedFilm+'-card').find('.filmFile').text()
      console.log("play", fileName)
      sendMessage('play '+fileName);
      isPlaying = true;
      $('#play').children('img').attr('src', "res/images/pause.png");
    }
    else if(isPlaying==true){
      isPlaying = false;
      $('#play').children('img').attr('src', "res/images/play.png");
      sendMessage('pause');
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
    idleTime = idleTimeList;
}


// END OF FILM
///////////////////////////////////////////////////////////
function endOfFilm(){
    isPlaying = false;
    $('#play').children('img').attr('src', "res/images/play.png");
    //closeFilm();
    //resetTimer();
}


// IDLE
///////////////////////////////////////////////////////////

var timeoutHandle;
var timeoutHandle2;

$(document).on('click touchstart', function(){ resetTimer(); });

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
function resetTimer(){
    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(function(){
      if (isPlaying==false) showWaitScreen()   // Go to wait screen
    }, idleTime);
}

