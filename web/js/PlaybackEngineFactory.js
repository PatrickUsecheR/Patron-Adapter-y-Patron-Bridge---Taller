import { HTML5Engine } from "./HTML5Engine.js";
import { SpotifySdkEngine } from "./SpotifySdkEngine.js";
import { YouTubeIframeEngine } from "./YouTubeIframeEngine.js";

export class PlaybackEngineFactory {
  create(provider) {
    const engines = {
      local: HTML5Engine,
      spotify: SpotifySdkEngine,
      youtube: YouTubeIframeEngine,
    };
    const Engine = engines[provider];
    if (!Engine) throw new Error(`Unsupported playback provider: ${provider}`);
    return new Engine();
  }
}