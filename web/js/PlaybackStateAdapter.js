export class PlaybackStateAdapter {
  constructor(initialVolume = 0.75) {
    this.listeners = new Set();
    this.volume = initialVolume;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setVolume(volume) {
    this.volume = volume;
  }

  normalize(engine, nativeEvent) {
    let state;
    if (engine === "html5") {
      const audio = nativeEvent.target;
      state = {
        isPlaying: !audio.paused && !audio.ended,
        currentTime: audio.currentTime || 0,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
        volume: audio.volume,
        status: nativeEvent.type === "error" ? "error" : nativeEvent.type,
      };
    } else if (engine === "youtube") {
      const playerState = nativeEvent.data;
      const player = nativeEvent.target;
      state = {
        isPlaying: playerState === 1 || playerState === 3,
        currentTime: player.getCurrentTime() || 0,
        duration: player.getDuration() || 0,
        volume: player.getVolume() / 100,
        status: playerState === -1 ? "error" : playerState === 1 || playerState === 3
          ? "playing"
          : playerState === 0 ? "ended" : "paused",
      };
    } else {
      const data = nativeEvent.data || {};
      state = {
        isPlaying: !data.isPaused,
        currentTime: (data.position || 0) / 1000,
        duration: (data.duration || 0) / 1000,
        volume: this.volume,
        status: data.isPaused ? "paused" : "playing",
      };
    }

    for (const listener of this.listeners) listener(state);
    return state;
  }
}