import assert from "node:assert/strict";
import test from "node:test";

import { PlaybackStateAdapter } from "./PlaybackStateAdapter.js";
import { MiniPlayerView } from "./MiniPlayerView.js";

function createView(engine) {
  const card = { className: "" };
  const container = {
    innerHTML: "",
    closest: () => card,
  };
  const track = {
    id: "track-1",
    provider: "local",
    title: "A < B",
    artist: "Example Artist",
    album: "Demo Album",
    thumbnailUrl: "/cover.png",
  };
  return { view: new MiniPlayerView(container, track, engine), card, container };
}

test("PlayerView renders its concrete view and escapes track metadata", () => {
  const engine = { play() {}, pause() {}, seek() {}, setVolume() {} };
  const { view, card, container } = createView(engine);

  view.render();

  assert.equal(card.className, "player-card view-mini");
  assert.match(container.innerHTML, /A &lt; B/);
  assert.doesNotMatch(container.innerHTML, /<h2[^>]*>A < B/);
});

test("PlayerView delegates transport, seek, and volume to its composed engine", async () => {
  const calls = [];
  const engine = {
    play() { calls.push("play"); return "playing"; },
    pause() { calls.push("pause"); return "paused"; },
    seek(seconds) { calls.push(["seek", seconds]); },
    setVolume(volume) { calls.push(["volume", volume]); },
  };
  const { view } = createView(engine);

  assert.equal(await view.togglePlayback(false), "playing");
  assert.equal(await view.togglePlayback(true), "paused");
  view.seek(37);
  view.setVolume(0.4);

  assert.deepEqual(calls, ["play", "pause", ["seek", 37], ["volume", 0.4]]);
});

test("PlaybackStateAdapter normalizes provider events and notifies subscribers", () => {
  const adapter = new PlaybackStateAdapter();
  const received = [];
  adapter.subscribe((state) => received.push(state));
  const audio = { paused: false, ended: false, currentTime: 14, duration: 92, volume: 0.6 };

  const normalized = adapter.normalize("html5", { target: audio, type: "timeupdate" });

  assert.deepEqual(normalized, {
    isPlaying: true,
    currentTime: 14,
    duration: 92,
    volume: 0.6,
    status: "timeupdate",
  });
  assert.deepEqual(received, [normalized]);
});

test("PlaybackStateAdapter reports YouTube playback failures as errors", () => {
  const adapter = new PlaybackStateAdapter();
  const player = {
    getCurrentTime: () => 0,
    getDuration: () => 120,
    getVolume: () => 80,
  };

  const normalized = adapter.normalize("youtube", { data: -1, target: player });

  assert.equal(normalized.status, "error");
  assert.equal(normalized.isPlaying, false);
});

test("PlaybackStateAdapter converts Spotify milliseconds into seconds", () => {
  const adapter = new PlaybackStateAdapter();
  const normalized = adapter.normalize("spotify", {
    data: { isPaused: false, position: 12500, duration: 180000 },
  });

  assert.equal(normalized.currentTime, 12.5);
  assert.equal(normalized.duration, 180);
  assert.equal(normalized.isPlaying, true);
});