var bitrateChart;
var currentDownloadBitrate = 0;
var currentPlayingBitrate = 0;
var player;
var source;

var conf = {
  key: '<INSERT_LICENSE_KEY_HERE>',
  source: {},
  playback: {
    autoplay: true,
    muted: true
  }
};

var container = document.getElementById('player');

function getNewSource() {
  var newSource = {
    dash: $('#dashManifest').val(),
    hls: $('#hlsManifest').val(),
    drm: {
      widevine: {
        LA_URL: $('#licenseUrl').val()
      },
      playready: {
        LA_URL: $('#licenseUrl').val()
      }
    }
  };
  return newSource;
}

source = getNewSource();
conf.source = source;

player = new bitmovin.player.Player(container, conf);

player.load(source).then(() => {
  console.log('Source loaded successful')
}, function() {
  console.log('Error while loading source');
});


$('#loadSourceButton').click(function(link) {
  player.load(getNewSource());
})

$('#unloadSourceButton').click(function(link) {
  player.unload();
})
