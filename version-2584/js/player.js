(function () {
    function attachPlayer(root) {
        var video = root.querySelector('video[data-stream]');
        var overlay = root.querySelector('[data-play-overlay]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-stream');
        var hls = null;

        function prepare() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            video.setAttribute('data-ready', '1');
        }

        function play() {
            prepare();
            root.classList.add('is-playing');

            if (overlay) {
                overlay.hidden = true;
            }

            var action = video.play();

            if (action && typeof action.catch === 'function') {
                action.catch(function () {
                    root.classList.remove('is-playing');

                    if (overlay) {
                        overlay.hidden = false;
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            root.classList.add('is-playing');

            if (overlay) {
                overlay.hidden = true;
            }
        });

        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                root.classList.remove('is-playing');

                if (overlay) {
                    overlay.hidden = false;
                }
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(attachPlayer);
})();
