(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function waitForHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var handled = false;
    function finish() {
      if (handled) {
        return;
      }
      handled = true;
      callback();
    }
    window.addEventListener("hls-ready", finish, { once: true });
    window.setTimeout(finish, 1500);
  }

  function setupPlayer() {
    var video = document.querySelector("[data-player-video]");
    var button = document.querySelector("[data-play-button]");
    var message = document.querySelector("[data-player-message]");
    if (!video || !button) {
      return;
    }

    var sourceElement = video.querySelector("source");
    var videoUrl = sourceElement ? sourceElement.getAttribute("src") : video.getAttribute("src");
    var hlsInstance = null;
    var attached = false;

    function attachSource() {
      if (attached || !videoUrl) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal && message) {
            message.textContent = "视频加载失败，请稍后再试。";
          }
        });
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        return;
      }
      video.src = videoUrl;
    }

    function playVideo() {
      waitForHls(function () {
        attachSource();
        var playTask = video.play();
        if (playTask && typeof playTask.then === "function") {
          playTask.then(function () {
            button.classList.add("is-hidden");
          }).catch(function () {
            if (message) {
              message.textContent = "点击播放器即可继续播放。";
            }
          });
          return;
        }
        button.classList.add("is-hidden");
      });
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(setupPlayer);
})();
