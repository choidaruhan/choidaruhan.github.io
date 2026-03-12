import { mount } from "svelte";
import App from "../../../App.svelte";
import { getAppTarget } from "./getAppTarget";

export function mountApp() {
  return mount(App, {
    target: getAppTarget(),
  });
}
