(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var layer = box.querySelector('.play-layer');
    var source = video ? video.getAttribute('data-src') : '';
    var loaded = false;
    var hls = null;

    function attachSource() {
      if (!video || loaded || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function playVideo() {
      attachSource();
      box.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    if (layer) {
      layer.addEventListener('click', function () {
        playVideo();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          box.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
