var bitrateChart;
var currentDownloadBitrate = 0;
var currentPlayingBitrate = 0;
var player;
var source;
var slider = document.querySelector('#targetLatencySlider');
var sliderPlaybackRate = document.querySelector('#targetPlaybackRateSlider');
var targetLatency = 3;
var targetPlaybackRate = 120;
var targetLatencyDisplay = document.querySelector('#targetLatency');
var targetPlaybackRateDisplay = document.querySelector('#targetPlaybackRate');

var conf = {
  key: '<INSERT_LICENSE_KEY_HERE>',
  source: {},
  playback: {
    autoplay: true,
    muted: true
  },
  adaptation: {
    preload: false,
  },
  tweaks: {
    RESTART_THRESHOLD: 0.2,
    RESTART_THRESHOLD_DELTA: 0.05,
    STARTUP_THRESHOLD: 0.2,
    STARTUP_THRESHOLD_DELTA: 0.05,
    END_OF_BUFFER_TOLERANCE: 0.05,
    LIVE_EDGE_DISTANCE: 0.5,
    LOW_LATENCY_BUFFER_GUARD: 0.8,
    CHUNKED_CMAF_STREAMING: true,
  },
  live: {
    lowLatency: {
      targetLatency: 3,
      catchup: {
        playbackRateThreshold: 0.075,
        seekThreshold: 5,
        playbackRate: 1.2,
      },
      fallback: {
        playbackRateThreshold: 0.075,
        seekThreshold: 5,
        playbackRate: 0.95,
      }
    }
  }
};

var container = document.getElementById('player');

function getNewSource() {
  var newSource = {
    dash: $('#dashManifest').val()
  };
  return newSource;
}

source = getNewSource();
conf.source = source;

player = new bitmovin.player.Player(container, conf);

player.load(source).then(() => {
  console.log('Source loaded successful');
  player.setVideoQuality(player.getAvailableVideoQualities()[0].id);
  updateTargetLatency();
  setupChart();
}, function() {
  console.log('Error while loading source');
});

player.on(bitmovin.player.PlayerEvent.LatencyModeChanged, function(event) {
  if (event.to == "catchup") {
    $('#targetPlaybackRateText').addClass("catchup");
    var videoBufferLevel = Math.round(player.lowlatency.getCatchupConfig().playbackRate * 100);
  } else {
    $('#targetPlaybackRateText').removeClass("catchup");
  }

});

player.on('timechanged', function(event) {
  var currentLatency = player.lowlatency.getLatency();
  addNewData(event.time, targetLatency, currentLatency)
});

$('#loadSourceButton').click(function(link) {
  player.load(getNewSource());
})

$('#unloadSourceButton').click(function(link) {
  player.unload();
  $('#targetPlaybackRateText').removeClass("catchup");
})


// SLIDER

var updateTargetLatency = function() {
  targetLatencyDisplay.innerText = slider.value + 's';
  targetLatency = Number(slider.value);
  player.lowlatency.setTargetLatency(targetLatency);
};

slider.oninput = updateTargetLatency;
slider.value = String(targetLatency);

var updatePlaybackRate = function() {
  targetPlaybackRateDisplay.innerText = sliderPlaybackRate.value + '%';
  targetPlaybackRate = Number(sliderPlaybackRate.value);
  player.lowlatency.setCatchupConfig({
    playbackRate: sliderPlaybackRate.value / 100,
    playbackRateThreshold: 0.075,
    seekThreshold: 5
  });
};

sliderPlaybackRate.oninput = updatePlaybackRate;
sliderPlaybackRate.value = String(targetPlaybackRate);


// CHART

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
}


function getTimeFromTimestamp(unix_timestamp) {
  var date = new Date(unix_timestamp * 1000);
  var hours = date.getHours();
  var minutes = "0" + date.getMinutes();
  var seconds = "0" + date.getSeconds();
  var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  return formattedTime;
}

var addNewData = function(time, targetLatency, currentLatency) {
  if (time % 2) {

    time = getTimeFromTimestamp(time);
    bitrateChart.data.datasets[0].data.push({
      x: time,
      y: targetLatency
    });
    bitrateChart.data.datasets[1].data.push({
      x: time,
      y: currentLatency
    });

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
        label: "Target Latency",
        borderColor: window.chartColors.red,
        backgroundColor: window.chartColors.red,
        fill: false
      }, {
        data: [],
        label: "Current Latency",
        borderColor: window.chartColors.grey,
        backgroundColor: window.chartColors.grey,
        fill: false
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Latency'
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
            max: 5,
            stepSize: 1
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'seconds'
          },
          ticks: {
            min: 0,
            max: 5,
            stepSize: 1
          }
        }]
      }
    }
  });
};
