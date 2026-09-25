import { PlaybackStateAdapter } from "./PlaybackStateAdapter.js";

export class PlaybackEngine {
  constructor(provider) {
    if (new.target === PlaybackEngine) throw new TypeError("PlaybackEngine is abstract");
    this.provider = provider;
    this.adapter = new PlaybackStateAdapter();
    this.track = null;
    this.host = null;
  }

  load(track, host) {
    this.track = track;
    this.host = host;
  }

  play() { throw new Error("Concrete engines must implement play()."); }
  pause() { throw new Error("Concrete engines must implement pause()."); }
  seek() { throw new Error("Concrete engines must implement seek()."); }
  setVolume(volume) { this.adapter.setVolume(volume); }
  destroy() {}
}