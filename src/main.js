// Entry point. Mounts the app into #root, wrapped in the global state provider.
import React, { ReactDOM } from "./react.js";
import { GameProvider } from "./state/GameContext.js";
import App from "./App.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(GameProvider, null, React.createElement(App))
);
