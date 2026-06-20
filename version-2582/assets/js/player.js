(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));

  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-trigger');
    var url = shell.getAttribute('data-play');
    var started = false;
    var hls = null;

    function attachAndPlay() {
      if (!video || !url) {
        return;
      }
      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        video.controls = true;
        shell.classList.add('is-playing');
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', attachAndPlay);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          attachAndPlay();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  });
})();
