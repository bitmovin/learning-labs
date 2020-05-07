var conf = {
  key: '<INSERT_LICENSE_KEY_HERE>',
  analytics: {
    videoId: 'Bitmovin Learning Lab',
    title: 'Lets Play Video'
  },
  playback: {
  	autoplay: true,
    preload: false,
  },
  buffer: {
  	video: {
    	forwardduration: 5,
  	},
  	audio: {
    	forwardduration: 5,
  	},
	},
  cast: {
  	enable: true
  }
};

var source = {
    dash: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
    hls: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    progressive:
        'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
    poster: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/poster.jpg'
};

var container = document.getElementById('player');
var player = new bitmovin.player.Player(container, conf);

player.load(source).then(() => {
	console.log('Source loaded successful')
}, function () {
  console.log('Error while loading source');
});


var getVideoBufferLevel = function () {
	return player.buffer.getLevel('forwardduration','video').level
}

var getAudioBufferLevel = function () {
	return player.buffer.getLevel('forwardduration','audio').level
}

player.on('timechanged',function (event) {
	var videoBufferLevel =  Math.round(getVideoBufferLevel() * 100) / 100;
	$( "#videoBuffer" ).css('width', videoBufferLevel +'%').attr('aria-valuenow', 			videoBufferLevel);
  $( "#videoBuffer" ).text(videoBufferLevel)
  
  var audioBufferLevel = Math.round(getAudioBufferLevel() * 100) / 100;
	$( "#audioBuffer" ).css('width', audioBufferLevel +'%').attr('aria-valuenow', 			audioBufferLevel);
    $( "#audioBuffer" ).text(audioBufferLevel)

});


