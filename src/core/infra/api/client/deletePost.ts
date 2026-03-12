import { getFetchOptions } from "./getFetchOptions";
import { DEFAULT_API_BASE } from "../../../app/constants/DEFAULT_API_BASE";

export async function deletePost(id: number, apiBase: string = DEFAULT_API_BASE): Promise<void> {
  const res = await fetch(`${apiBase}/posts/${id}`, {
    ...getFetchOptions(),
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete failed");
}
