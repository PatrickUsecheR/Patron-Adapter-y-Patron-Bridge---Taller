import { Markup } from "./Markup.js";
import { PlaybackEngineFactory } from "./PlaybackEngineFactory.js";
import { PlayerViewFactory } from "./PlayerViewFactory.js";
import { TrackApiClient } from "./TrackApiClient.js";
import { TrackLibraryView } from "./TrackLibraryView.js";

export class PlayerApplication {
  constructor(documentRoot = document) {
    this.document = documentRoot;
    this.api = new TrackApiClient();
    this.engineFactory = new PlaybackEngineFactory();
    this.library = new TrackLibraryView({
      list: this.document.querySelector("#track-list"),
      resultTotal: this.document.querySelector("#result-total"),
      searchInput: this.document.querySelector("#search-input"),
      sourceList: this.document.querySelector(".source-list"),
      sortSelect: this.document.querySelector("#sort-select"),
    });
    this.viewFactory = new PlayerViewFactory(this.document.querySelector("#player-view"));
    this.elements = {
      card: this.document.querySelector("#player-card"),
      duration: this.document.querySelector("#duration-time"),
      elapsed: this.document.querySelector("#elapsed-time"),
      engineLabel: this.document.querySelector("#engine-label"),
      engineStatus: this.document.querySelector("#engine-status"),
      engineStatusNote: this.document.querySelector("#engine-note"),
      host: this.document.querySelector("#engine-host"),
      next: this.document.querySelector("#next-button"),
      play: this.document.querySelector("#play-button"),
      previous: this.document.querySelector("#previous-button"),
      seek: this.document.querySelector("#seek-slider"),
      viewSwitch: this.document.querySelector(".view-switch"),
      volume: this.document.querySelector("#volume-slider"),
    };
    this.tracks = [];
    this.selectedTrack = null;
    this.engine = null;
    this.playerView = null;
    this.provider = "all";
    this.searchTerm = "";
    this.sortBy = "title";
    this.viewName = "mini";
    this.playbackState = { isPlaying: false, currentTime: 0, duration: 0, volume: 0.75 };
    this.searchRequestId = 0;
    this.bindEvents();
  }

  async start() {
    await this.loadTracks();
  }

  async loadTracks() {
    const requestId = ++this.searchRequestId;
    try {
      const tracks = await this.api.search({ term: this.searchTerm, provider: this.provider });
      if (requestId !== this.searchRequestId) return;
      this.tracks = tracks;
      this.renderTracks();
      if (!this.selectedTrack && tracks.length > 0) {
        this.selectTrack(tracks.find((track) => track.provider === "local") || tracks[0]);
      }
    } catch (error) {
      if (requestId === this.searchRequestId) this.library.showError(error);
    }
  }

  selectTrack(track) {
    this.engine?.destroy();
    this.selectedTrack = track;
    this.engine = this.engineFactory.create(track.provider);
    const currentEngine = this.engine;
    currentEngine.adapter.subscribe((state) => {
      if (this.engine === currentEngine) this.updatePlayback(state);
    });
    this.playbackState = {
      isPlaying: false,
      currentTime: 0,
      duration: track.durationSeconds,
      volume: this.playbackState.volume,
    };
    this.playerView = this.viewFactory.create(this.viewName, track, currentEngine);
    this.playerView.render();
    this.elements.engineLabel.textContent = this.getEngineLabel(currentEngine.provider);
    this.setEngineStatus(track.provider === "spotify"
      ? "Requiere conexión con Spotify para iniciar reproducción"
      : "Listo para reproducir");
    Promise.resolve(currentEngine.load(track, this.elements.host)).catch(() => {
      if (this.engine === currentEngine) this.setEngineStatus("No se pudo cargar este reproductor.");
    });
    this.renderTracks();
  }

  renderTracks() {
    this.library.render(this.tracks, this.selectedTrack?.id, this.sortBy);
  }

  renderPlaybackButtons() {
    this.elements.play.textContent = this.playbackState.isPlaying ? "Ⅱ" : "▶";
    this.elements.play.setAttribute("aria-label", this.playbackState.isPlaying ? "Pausar" : "Reproducir");
    this.elements.elapsed.textContent = Markup.formatTime(this.playbackState.currentTime);
    this.elements.duration.textContent = Markup.formatTime(this.playbackState.duration);
    this.elements.seek.max = String(Math.max(1, this.playbackState.duration));
    if (this.document.activeElement !== this.elements.seek) {
      this.elements.seek.value = String(this.playbackState.currentTime);
    }
    this.elements.engineStatusNote.classList.toggle("is-playing", this.playbackState.isPlaying);
  }

  updatePlayback(state) {
    this.playbackState = { ...this.playbackState, ...state };
    this.renderPlaybackButtons();
    if (state.status === "error") this.setEngineStatus("No se pudo reproducir esta pista.");
    else if (state.isPlaying) this.setEngineStatus("Reproduciendo");
    else if (state.status === "loadedmetadata" || (state.status === "pause" && state.currentTime === 0)) {
      this.setEngineStatus("Listo para reproducir");
    } else if (state.status) this.setEngineStatus("En pausa");
  }

  setEngineStatus(message) {
    this.elements.engineStatus.textContent = message;
  }

  getEngineLabel(provider) {
    const labels = { html5: "HTML5 AUDIO ENGINE", spotify: "SPOTIFY EMBED ENGINE", youtube: "YOUTUBE IFRAME ENGINE" };
    return labels[provider] || "PLAYBACK ENGINE";
  }

  moveTrack(direction) {
    if (this.tracks.length === 0) return;
    const currentIndex = this.tracks.findIndex((track) => track.id === this.selectedTrack?.id);
    const nextIndex = (Math.max(currentIndex, 0) + direction + this.tracks.length) % this.tracks.length;
    this.selectTrack(this.tracks[nextIndex]);
  }

  changeView(viewName) {
    if (!this.selectedTrack || viewName === this.viewName) return;
    this.viewName = viewName;
    this.playerView = this.viewFactory.create(viewName, this.selectedTrack, this.engine);
    this.playerView.render();
    this.elements.viewSwitch.querySelectorAll("[data-view]").forEach((button) => {
      const active = button.dataset.view === viewName;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  bindEvents() {
    this.library.setActions({
      search: (term) => { this.searchTerm = term; this.loadTracks(); },
      provider: (provider) => {
        this.provider = provider;
        this.library.setActiveProvider(provider);
        this.loadTracks();
      },
      selectTrack: (id) => {
        const track = this.tracks.find((item) => item.id === id);
        if (track) this.selectTrack(track);
      },
      sort: (sortBy) => { this.sortBy = sortBy; this.renderTracks(); },
    });

    this.elements.viewSwitch.addEventListener("click", (event) => {
      const button = event.target.closest("[data-view]");
      if (button) this.changeView(button.dataset.view);
    });
    this.elements.play.addEventListener("click", () => {
      if (!this.playerView) return;
      Promise.resolve(this.playerView.togglePlayback(this.playbackState.isPlaying)).catch(() => {
        this.setEngineStatus("No se pudo iniciar. Comprueba la conexión con el proveedor.");
      });
    });
    this.elements.seek.addEventListener("input", (event) => {
      const seconds = Number(event.target.value);
      this.playerView?.seek(seconds);
      this.elements.elapsed.textContent = Markup.formatTime(seconds);
    });
    this.elements.volume.addEventListener("input", (event) => {
      this.playbackState.volume = Number(event.target.value) / 100;
      this.playerView?.setVolume(this.playbackState.volume);
    });
    this.elements.previous.addEventListener("click", () => this.moveTrack(-1));
    this.elements.next.addEventListener("click", () => this.moveTrack(1));
    this.document.addEventListener("keydown", (event) => this.handleKeyboard(event));
  }

  handleKeyboard(event) {
    const tagName = this.document.activeElement?.tagName;
    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(tagName)) {
      event.preventDefault();
      this.library.searchInput.focus();
    } else if (event.code === "Space" && !["INPUT", "TEXTAREA", "BUTTON"].includes(tagName)) {
      event.preventDefault();
      this.elements.play.click();
    }
  }
}