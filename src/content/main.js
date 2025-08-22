import { mount } from "svelte";
import App from "./views/App.svelte";
import "./highlightManager.js";

/**
 * Mount the Svelte app to the DOM.
 */
function mountApp() {
  const container = document.createElement("div");
  container.id = "crxjs-app";
  document.body.appendChild(container);
  mount(App, {
    target: container,
  });
}

mountApp();
