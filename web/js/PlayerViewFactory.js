import { FullPlayerView } from "./FullPlayerView.js";
import { MiniPlayerView } from "./MiniPlayerView.js";
import { SidebarWidget } from "./SidebarWidget.js";

export class PlayerViewFactory {
  constructor(container) {
    this.container = container;
    this.views = {
      full: FullPlayerView,
      mini: MiniPlayerView,
      sidebar: SidebarWidget,
    };
  }

  create(name, track, engine) {
    const View = this.views[name];
    if (!View) throw new Error(`Unsupported player view: ${name}`);
    return new View(this.container, track, engine);
  }
}