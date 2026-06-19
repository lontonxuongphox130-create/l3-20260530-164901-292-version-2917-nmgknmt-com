(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));

  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.video-cover');
    var source = shell.getAttribute('data-src');

    if (!video || !source) {
      return;
    }

    function bindSource() {
      if (window.Hls && window.Hls.isSupported()) {
        if (!video.__hlsPlayer) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video.__hlsPlayer = hls;
        }
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== source) {
          video.src = source;
        }
        return;
      }

      if (video.src !== source) {
        video.src = source;
      }
    }

    function startPlayback() {
      bindSource();
      shell.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  });
})();
