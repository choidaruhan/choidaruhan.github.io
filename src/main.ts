/**
 * my-blog/src/main.ts
 *
 * Svelte application entry point.
 * - Mounts `App.svelte` into the page element with id="app"
 */

import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";

const app = mount(App, {
  target: document.getElementById("app") ?? document.body,
});

export default app;
