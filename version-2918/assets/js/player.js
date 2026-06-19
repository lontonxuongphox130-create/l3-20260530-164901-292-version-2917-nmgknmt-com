import { H as Hls } from './video-vendor-dru42stk.js';

function setupPlayer(container) {
    var video = container.querySelector('video');
    var button = container.querySelector('.play-cover');
    var stream = video ? video.getAttribute('data-stream') : '';
    var started = false;
    var hls = null;

    function start() {
        if (!video || !stream) {
            return;
        }

        if (!started) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            started = true;
        }

        if (button) {
            button.classList.add('hide');
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (button) {
                    button.classList.remove('hide');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('hide');
            }
        });
        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('hide');
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}

document.querySelectorAll('.player-shell').forEach(setupPlayer);
