import { writable } from 'svelte/store';
import type { Post } from "../types/Post";

export const posts = writable<Post[]>([]);
