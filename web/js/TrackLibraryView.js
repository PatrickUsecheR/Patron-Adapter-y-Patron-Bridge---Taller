import { Markup } from "./Markup.js";

export class TrackLibraryView {
  constructor({ list, resultTotal, searchInput, sourceList, sortSelect }) {
    this.list = list;
    this.resultTotal = resultTotal;
    this.searchInput = searchInput;
    this.sourceList = sourceList;
    this.sortSelect = sortSelect;
    this.actions = {};
    this.bindEvents();
  }

  setActions(actions) {
    this.actions = actions;
  }

  setActiveProvider(provider) {
    this.sourceList.querySelectorAll("[data-provider]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.provider === provider);
    });
  }

  render(tracks, selectedId, sortBy) {
    const sortedTracks = [...tracks].sort((first, second) => sortBy === "provider"
      ? first.provider.localeCompare(second.provider) || first.title.localeCompare(second.title)
      : first.title.localeCompare(second.title));
    this.resultTotal.textContent = String(sortedTracks.length).padStart(2, "0");
    if (sortedTracks.length === 0) {
      this.list.innerHTML = '<div class="empty-state">No hay canciones que coincidan con tu búsqueda.</div>';
      return;
    }

    this.list.innerHTML = sortedTracks.map((track, index) => `<article class="track-row ${selectedId === track.id ? "current" : ""}" style="animation-delay:${index * 35}ms">
      <span class="track-number">${String(index + 1).padStart(2, "0")}</span>
      <img class="track-art" src="${Markup.escape(track.thumbnailUrl)}" alt="" loading="lazy">
      <div class="track-meta"><span class="track-title">${Markup.escape(track.title)}</span><span class="track-artist">${Markup.escape(track.artist)}</span></div>
      <span class="provider-tag"><i class="source-dot ${Markup.escape(track.provider)}-dot"></i>${Markup.escape(track.provider)}</span>
      <span class="track-duration">${track.durationSeconds ? Markup.formatTime(track.durationSeconds) : "LIVE"}</span>
      <button class="row-play" type="button" data-track-id="${Markup.escape(track.id)}" aria-label="Reproducir ${Markup.escape(track.title)}">▶</button>
    </article>`).join("");
  }

  showError(error) {
    this.list.innerHTML = `<div class="empty-state">No se pudo cargar el catálogo: ${Markup.escape(error.message)}</div>`;
  }

  bindEvents() {
    this.searchInput.addEventListener("input", (event) => this.actions.search?.(event.target.value.trim()));
    this.sortSelect.addEventListener("change", (event) => this.actions.sort?.(event.target.value));
    this.sourceList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-provider]");
      if (button) this.actions.provider?.(button.dataset.provider);
    });
    this.list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-track-id]");
      if (button) this.actions.selectTrack?.(button.dataset.trackId);
    });
  }
}