(function (global) {
  function initVideoPlayer(streamUrl) {
    const video = document.querySelector('[data-video-player]');
    const overlay = document.querySelector('[data-play-overlay]');

    if (!video || !overlay || !streamUrl) {
      return;
    }

    const Hls = global.Hls;
    let hls = null;

    const load = function () {
      if (video.dataset.ready === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      video.dataset.ready = '1';
    };

    const start = function () {
      load();
      overlay.classList.add('is-hidden');
      video.controls = true;
      const promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    };

    overlay.addEventListener('click', start);

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });

    global.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  global.initVideoPlayer = initVideoPlayer;
})(window);
