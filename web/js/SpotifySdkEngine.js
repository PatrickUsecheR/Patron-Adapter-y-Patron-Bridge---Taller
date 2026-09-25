import { PlaybackEngine } from "./PlaybackEngine.js";

export class SpotifySdkEngine extends PlaybackEngine {
  static apiPromise = null;
  static resolveApi = null;

  constructor() {
    super("spotify");
    this.controller = null;
    this.generation = 0;
  }

  static onApiReady(api) {
    window.spotifyEmbedAPI = api;
    SpotifySdkEngine.resolveApi?.(api);
    SpotifySdkEngine.resolveApi = null;
  }

  static loadApi() {
    if (window.spotifyEmbedAPI) return Promise.resolve(window.spotifyEmbedAPI);
    if (SpotifySdkEngine.apiPromise) return SpotifySdkEngine.apiPromise;

    SpotifySdkEngine.apiPromise = new Promise((resolve) => {
      SpotifySdkEngine.resolveApi = resolve;
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.onerror = () => resolve(null);
      document.head.append(script);
    });
    return SpotifySdkEngine.apiPromise;
  }

  async load(track, host) {
    super.load(track, host);
    const generation = ++this.generation;
    host.innerHTML = '<div class="engine-placeholder">Conectando con Spotify…</div>';
    const api = await SpotifySdkEngine.loadApi();
    if (!api || generation !== this.generation || !host.isConnected) {
      if (generation === this.generation) host.innerHTML = '<div class="engine-placeholder">Spotify Embed API no está disponible.</div>';
      return;
    }

    const uri = `spotify:track:${track.id}`;
    if (this.controller) {
      this.controller.loadUri(uri);
      return;
    }

    host.innerHTML = '<div class="spotify-player-target"></div>';
    api.createController(host.querySelector(".spotify-player-target"), { uri }, (controller) => {
      if (generation !== this.generation) {
        controller.destroy();
        return;
      }
      this.controller = controller;
      controller.addListener("playback_update", (event) => this.adapter.normalize(this.provider, event));
    });
  }

  play() { this.controller?.play(); }
  pause() { this.controller?.pause(); }
  seek(seconds) { this.controller?.seek(seconds * 1000); }

  setVolume(volume) {
    super.setVolume(volume);
  }

  destroy() {
    this.generation++;
    this.controller?.destroy();
    this.controller = null;
  }
}

window.onSpotifyIframeApiReady = SpotifySdkEngine.onApiReady;