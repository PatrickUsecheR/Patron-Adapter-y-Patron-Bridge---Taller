import { PlaybackEngine } from "./PlaybackEngine.js";

const SAMPLE_AUDIO = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export class HTML5Engine extends PlaybackEngine {
  constructor() {
    super("html5");
    this.audio = new Audio();
    for (const eventName of ["play", "pause", "timeupdate", "loadedmetadata", "ended", "volumechange", "error"]) {
      this.audio.addEventListener(eventName, (event) => this.adapter.normalize(this.provider, event));
    }
  }

  load(track, host) {
    super.load(track, host);
    this.audio.src = track.playbackUrl || SAMPLE_AUDIO;
    this.audio.volume = this.adapter.volume;
    this.audio.load();
    host.innerHTML = '<div class="engine-placeholder">HTML5 Audio · listo para reproducir</div>';
  }

  play() { return this.audio.play(); }
  pause() { this.audio.pause(); }

  seek(seconds) {
    if (Number.isFinite(this.audio.duration)) this.audio.currentTime = seconds;
  }

  setVolume(volume) {
    super.setVolume(volume);
    this.audio.volume = volume;
  }

  destroy() {
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
  }
}