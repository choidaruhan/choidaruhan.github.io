import { writable } from 'svelte/store';
import type { Post } from "../../shared/types/Post";

export const selectedPost = writable<Post | null>(null);
