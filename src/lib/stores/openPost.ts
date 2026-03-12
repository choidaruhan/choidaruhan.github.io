import { selectedPost } from "./selectedPost";
import type { Post } from "../types/Post";

export function openPost(post: Post) {
  selectedPost.set(post);
}
