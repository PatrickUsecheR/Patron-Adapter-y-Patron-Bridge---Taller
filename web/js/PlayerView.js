import { Markup } from "./Markup.js";

export class PlayerView {
  constructor(container, track, engine) {
    if (new.target === PlayerView) throw new TypeError("PlayerView is abstract");
    this.container = container;
    this.track = track;
    this.engine = engine;
  }

  render() { throw new Error("Concrete views must implement render()."); }

  renderLayout(layout) {
    const card = this.container.closest(".player-card");
    card.className = `player-card view-${layout}`;
    this.container.innerHTML = `<div class="view-art-row">
      <img class="view-cover" src="${Markup.escape(this.track.thumbnailUrl)}" alt="">
      <div class="view-track-copy"><h2 class="view-title">${Markup.escape(this.track.title)}</h2>
      <p class="view-artist">${Markup.escape(this.track.artist)}</p>
      <p class="view-album">${Markup.escape(this.track.album)} · ${Markup.escape(this.track.provider.toUpperCase())}</p></div></div>`;
  }

  togglePlayback(isPlaying) {
    return isPlaying ? this.engine.pause() : this.engine.play();
  }

  seek(seconds) { this.engine.seek(seconds); }
  setVolume(volume) { this.engine.setVolume(volume); }
}