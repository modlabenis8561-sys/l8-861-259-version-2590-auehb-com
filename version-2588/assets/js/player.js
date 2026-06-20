import { H as Hls } from './hls.js';

export function mountPlayer() {
  const panel = document.querySelector('.player-panel');
  const video = document.querySelector('#movie-player');
  const gate = document.querySelector('.play-gate');

  if (!panel || !video || !gate) {
    return;
  }

  const streamUrl = gate.dataset.stream;
  let hlsInstance = null;

  function attachStream() {
    if (video.dataset.ready === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    video.dataset.ready = 'true';
  }

  function beginPlay() {
    attachStream();
    panel.classList.add('started');
    const playRequest = video.play();

    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(() => {
        panel.classList.remove('started');
      });
    }
  }

  gate.addEventListener('click', beginPlay);
  video.addEventListener('click', () => {
    if (video.paused) {
      beginPlay();
    }
  });

  window.addEventListener('pagehide', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
