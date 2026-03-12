import { getFrontendUrl } from "./getFrontendUrl";

export const getAuthRedirectUrl = (path = "") => {
  const frontendUrl = getFrontendUrl();
  return `${frontendUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
