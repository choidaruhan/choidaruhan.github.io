import { writable } from 'svelte/store';
import type { Post } from "../../shared/types/Post";

export const posts = writable<Post[]>([]);
