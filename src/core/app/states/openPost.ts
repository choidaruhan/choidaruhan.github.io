import { selectedPost } from "./selectedPost";
import type { Post } from "../../shared/types/Post";

export function openPost(post: Post) {
  selectedPost.set(post);
}
