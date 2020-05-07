var bitrateChart;
var currentDownloadBitrate = 0;
var currentPlayingBitrate = 0;

var randomNumber = Math.floor(Math.random()*100);
var percentageUsers = 40;
var bufferTarget = 30;
var experimentName = 'buffer_30';

if (randomNumber <= percentageUsers) {
	experimentName = 'buffer_10'
	bufferTarget = 5;
}

var conf = {
  key: '<INSERT_LICENSE_KEY_HERE>',
  analytics: {
    videoId: 'Bitmovin Learning Lab',
    title: 'Lets Play Video',
    experimentName: experimentName
  },
  playback: {
  	autoplay: true,
    muted: true
  },
  buffer: {
  	video: {
    	forwardduration: bufferTarget,
  	},
  	audio: {
    	forwardduration: bufferTarget,
  	},
	},
  cast: {
  	enable: true
  },
  adaptation: {
  	preload: false,
    bitrates: {
      minSelectableAudioBitrate: '0kbps',
      maxSelectableAudioBitrate: '320kbps',
      minSelectableVideoBitrate: '0kbps',
      maxSelectableVideoBitrate: 'infinity'  
  	}
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
  setupChart();
}, function () {
  console.log('Error while loading source');
});


$('#loadSourceButton').click(function (link) {
	var source = {
  	dash: $('#dashManifest').val(),
  	hls: $('#hlsManifest').val(),
  	smooth: $('#smoothManifest').val(),
  	progressive: $('#mp4Url').val(),
    poster: $('#posterImage').val(),
    thumbnailTrack: {
    	url: $('#vttFile').val()
    }
  }
  
  player.load(source);
})

$('#unloadSourceButton').click(function (link) {
	player.unload();
  clearChart();
  setupChart();
})



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
    
  addNewData(event.time,currentPlayingBitrate,currentDownloadBitrate)
});

player.on('videoplaybackqualitychanged',function (event) {
	currentPlayingBitrate = event.targetQuality.bitrate
  console.log('Video Download Quality Changed ' + currentPlayingBitrate)
});

player.on('videodownloadqualitychanged',function (event) {
	currentDownloadBitrate = event.targetQuality.bitrate
  console.log('Video Download Quality Changed ' + currentDownloadBitrate)
});

window.chartColors = {
    black: 'rgb(0,0,0)',
    white: 'rgb(255,255,255)',
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

function clearChart() {
    bitrateChart.destroy();
    var videoBufferLevel =  0;
		$( "#videoBuffer" ).css('width', videoBufferLevel +'%').attr('aria-valuenow', 			videoBufferLevel);
  	$( "#videoBuffer" ).text(videoBufferLevel)
  
  	var audioBufferLevel = 0;
		$( "#audioBuffer" ).css('width', audioBufferLevel +'%').attr('aria-valuenow', 			audioBufferLevel);
  	$( "#audioBuffer" ).text(audioBufferLevel)
}

var addNewData = function(time, playingBitrate, downloadBitrate) {
	if(time % 2) {
    time = time.toFixed(2)
   	bitrateChart.data.datasets[0].data.push({ x: time, y: playingBitrate / 1000000.0 });
    bitrateChart.data.datasets[1].data.push({ x: time, y: downloadBitrate / 1000000.0 });

   	bitrateChart.data.labels.push(time);
 		if (bitrateChart.data.datasets[0].data.length > 20) {
     	bitrateChart.data.labels.shift();
     	bitrateChart.data.datasets[0].data.shift();
      bitrateChart.data.datasets[1].data.shift();
 		}
 		bitrateChart.update();
 	}
}

var setupChart = function() {
    initialTimestamp = Date.now()

    bitrateChart = new Chart(document.getElementById("myChart"), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                data: [],
                label: "Playing Bitrate",
                borderColor: window.chartColors.black,
                backgroundColor: window.chartColors.black,
                fill: false
            },{
                data: [],
                label: "Download Bitrate",
                borderColor: window.chartColors.grey,
                backgroundColor: window.chartColors.grey,
                fill: false
            }
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Playback Bitrate'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Time'
                    },
                    ticks: {
                        min: 0,
                        max: 60,
                        stepSize: 20
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'kbps'
                    },
                    ticks: {
                        min: 0,
                        max: 8,
                        stepSize: 1
                    }
                }]
            }
        }
    });
};











