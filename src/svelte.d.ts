/// <reference types="svelte" />
/// <reference path="../node_modules/svelte/svelte-html.d.ts" />

declare module "*.svelte" {
  import type { SvelteComponentTyped } from "svelte";

  export default class SvelteComponent extends SvelteComponentTyped<
    Record<string, any>,
    Record<string, any>,
    any
  > {}
}

export {};
