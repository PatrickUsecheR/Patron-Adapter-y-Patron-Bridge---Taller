import { PlaybackEngine } from "./PlaybackEngine.js";

export class YouTubeIframeEngine extends PlaybackEngine {
  static apiPromise = null;

  constructor() {
    super("youtube");
    this.player = null;
    this.generation = 0;
  }

  static loadApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (YouTubeIframeEngine.apiPromise) return YouTubeIframeEngine.apiPromise;

    YouTubeIframeEngine.apiPromise = new Promise((resolve) => {
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => resolve(null);
      document.head.append(script);
    });
    return YouTubeIframeEngine.apiPromise;
  }

  async load(track, host) {
    super.load(track, host);
    const generation = ++this.generation;
    host.innerHTML = '<div class="engine-placeholder">Conectando con YouTube…</div>';
    const api = await YouTubeIframeEngine.loadApi();
    if (!api || generation !== this.generation || !host.isConnected) {
      if (generation === this.generation) host.innerHTML = '<div class="engine-placeholder">YouTube no está disponible en este momento.</div>';
      return;
    }

    this.player?.destroy();
    host.innerHTML = '<div class="youtube-player-target"></div>';
    this.player = new api.Player(host.querySelector(".youtube-player-target"), {
      videoId: track.id,
      playerVars: { playsinline: 1, rel: 0, origin: location.origin },
      events: {
        onReady: (event) => event.target.setVolume(this.adapter.volume * 100),
        onStateChange: (event) => this.adapter.normalize(this.provider, event),
        onError: () => this.adapter.normalize(this.provider, { data: -1, target: this.player }),
      },
    });
  }

  play() { this.player?.playVideo(); }
  pause() { this.player?.pauseVideo(); }
  seek(seconds) { this.player?.seekTo(seconds, true); }

  setVolume(volume) {
    super.setVolume(volume);
    this.player?.setVolume(volume * 100);
  }

  destroy() {
    this.generation++;
    this.player?.destroy();
    this.player = null;
  }
}