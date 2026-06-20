import { H as Hls } from "./hls-dru42stk.js";

function bindPlayer(box) {
  var video = box.querySelector("video");
  var overlay = box.querySelector(".play-overlay");
  if (!video) {
    return;
  }
  var source = video.getAttribute("data-src");
  var loaded = false;
  var hls = null;

  function attachSource() {
    if (loaded || !source) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
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

  function start() {
    attachSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll("[data-player]").forEach(bindPlayer);
