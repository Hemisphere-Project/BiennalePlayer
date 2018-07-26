var fadeTimePause = 300;
var fadeTimeStop = 500;

var info = document.getElementById('infoplayer');
var pause_overlay = document.getElementById('pause_overlay');
var video = document.getElementById('videoplayer');

var currentMedia = ""
var loop = false

// APP COMMUNICATION
///////////////////////////////////////////////////////////

function sendMessage(message){
    window.webkit.messageHandlers.player.postMessage(message)
}

function onMessage(message){

    message = message.split(" ")
    console.log(message)
    
    // PLAY MOVIE
    if (message[0] == "play" || message[0] == "loop") {
        loop = (message[0] == "loop")
        if (message.length > 1 && message[1] != currentMedia) videoLoad(message[1])
        if (currentMedia!= "") videoPlay()
    }
    
    // PAUSE MOVIE
    else if (message[0] == "pause") videoPause()
        
    // STOP MOVIE
    else if (message[0] == "stop") videoStop(true)
        
    // SKIP
    else if (message[0] == "skip") {
        if (message.length > 1) video.currentTime = video.duration*parseInt(message[1])/100
    }
    
    // INFO
    else if (message[0] == "info") {
        message.shift()
        message = message.join(' ')
        $('#infoplayer').html(atob(message))
        videoStop(true)
    }
    
    // BLACK
    else if (message[0] == "black") {
        videoStop(false)
    }
}


// PLAYER EVENTS
///////////////////////////////////////////////////////////

function videoLoad(file) {
    $('#source_mp4').attr('src', "../videos/" + file);
    currentMedia = file
    video.load();
    video.style.display = "block";
    sendMessage("loaded "+file)
}

function videoPlay() {
    $('#infoplayer').hide()
    $('#videoplayer').fadeIn(fadeTimePause)
    $('#pause_overlay').fadeOut(fadeTimePause)
    video.play();
    sendMessage("playing "+currentMedia)
}

function videoPause() {
    $('#pause_overlay').fadeIn(fadeTimePause)
    video.pause();
    sendMessage("plaused "+currentMedia)
}

function videoStop(backToInfo) {
    $('#pause_overlay').hide()
    if (backToInfo) $('#infoplayer').fadeIn(fadeTimeStop)
    else $('#infoplayer').fadeOut(fadeTimePause)
    $('#videoplayer').fadeOut(fadeTimeStop)
    video.pause();
    currentMedia = ""
    sendMessage("stop")
}


// PLAYER EVENTS
///////////////////////////////////////////////////////////

video.onended = function() {
    if (loop) video.play();
    else {
        videoStop(true)
        sendMessage("end")
    }
};

video.ontimeupdate = function() {
    sendMessage("progress "+Math.floor(video.currentTime*100/video.duration))
};

video.onerror = function() {
    console.log("error ",video.error.message)
};
