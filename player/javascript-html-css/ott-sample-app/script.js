/**
 * @summary Sample OTT APP Javascript code.
 *
 * @link https://github.com/bitmovin/learning-labs/tree/feature/sample-ott-app-javascript
 * @author AF, Bitmovin.
 * @since 22.04.2020
 */
console.log("Your Instagram stories Video OTT platform!");

let sources = [
  {
    "dash": "https://<LINK_TO_MANIFEST>.mpd",
    "title": "Anzio, near Rome (Italy)",
    "videoId": "Anzio",
    "analytics": {
        "videoId": "Anzio",
        "title": "Anzio, near Rome (Italy)"
    }
  },
  {
    "dash": "https://<LINK_TO_MANIFEST>.mpd",
    "title": "Klagenfurt, in Corinthia (Austria)",
    "videoId": "Klagenfurt",
    "analytics": {
        "videoId": "Klagenfurt",
        "title": "Klagenfurt, in Corinthia (Austria)"
    }
  },
  {
    "dash": "https://<LINK_TO_MANIFEST>.mpd",
    "title": "Arezzo, in Tuscany (Italy)",
    "videoId": "Arezzo",
    "analytics": {
        "videoId": "Arezzo",
        "title": "Arezzo, in Tuscany (Italy)"
    }
  },
  {
    "dash": "https://<LINK_TO_MANIFEST>.mpd",
    "title": "Isabela, San Cristobal (Domenican Republic)",
    "videoId": "Isabela",
    "analytics": {
        "videoId": "Isabela",
        "title": "La Isabela, San Cristobal (Domenican Republic)"
    }
  },
];

let LICENSE_KEY = "<INSERT_PLAYER_LICENSE_KEY>";
// Initialize the index which will keep track of which video its playing in the list.
let currentVideo = 0;

console.log("Setting up Bitmovin config with license key: "+ LICENSE_KEY);

let conf = {
	"key": LICENSE_KEY,
  "events": {
    play: function () {
        let elem = document.getElementById('caption-item');
        elem.innerHTML = "...Another awesome place!";
        setTimeout(function(){ elem.innerHTML=""; }, 5000);
    },
    paused: function () {
      let elem = document.getElementById('status');
      elem.innerHTML = 
        "<img src='https://test-videos-samples.s3.amazonaws.com/test-content/stayathome_icon.png' width='34px' />&nbsp;&nbsp;Stay at home, stay safe !";
    },
    playing: function () {
      console.log("Playing video.");
      let elem = document.getElementById('status');
      elem.innerHTML = "📼 Watching an interesting Instagram story...";
      
    },
    playbackfinished: function () {
      console.log("video ended");
      currentVideo += 1;
      let statusElement = document.getElementById('status');
      statusElement.innerHTML = "";
      playVideo(currentVideo);
    }
  }
};
console.log("Setting source: " + sources[0]);
let container = document.getElementById('player');
console.log("Instantiating the Bitmovin player...");
let player = new bitmovin.player.Player(container, conf);
console.log("Loading source: " + sources[0].title);



function showVideos () {
    let videosElement = document.getElementById('videos-list');
    for (let i = 0; i < sources.length; i++) {
        let itemElement = document.createElement("button");
        itemElement.innerHTML = sources[i].title;
        itemElement.id = "item-element";
        itemElement.className = "btn btn-primary";
        itemElement.addEventListener("click", function () {
            console.log("Clicked to play video " + i);
            playVideo(i);
        })
        videosElement.appendChild(itemElement);
    }
}

function playVideo (videoIndex) {
  console.log('Video index: ' + videoIndex);
  if (videoIndex === sources.length) {
    videoIndex = 0;
    currentVideo = 0;
  }
  // Make sure the input index is valid and exists within the sources array.
  if (videoIndex < sources.length) {
    console.log("Playing video with source URL: " + sources[videoIndex].dash);
    player.load(sources[videoIndex]).then(() => {
      console.log('Source loaded successfully!');
      let elem = document.getElementById("title");
      // Set the video title
      elem.innerHTML = sources[videoIndex].title;
      if (videoIndex >= 0) {
        player.play();
      }
    }, function () {
      console.log('Error while loading source: ' + sources[videoIndex].title);
    });
  }
}


function navigateVideo (step) {
  
  if (step == 1 && currentVideo < sources.length) {
    currentVideo += 1;
    console.log("Showing next video");
    playVideo(currentVideo);
    
  } else if (step === 0 && currentVideo > 0) {
    currentVideo -= 1;
    console.log("Showing previous video");
    playVideo(currentVideo);
    
  }
}

// Display the videos on the screen
showVideos();

// Initialize the first video
playVideo(0);
