import { isLocalDevelopment } from "./isLocalDevelopment";
import { isTunnelEnvironment } from "./isTunnelEnvironment";
import { isProduction } from "./isProduction";
import { FRONTEND_URLS } from "../constants/FRONTEND_URLS";

export const getFrontendUrl = () => {
  if (isLocalDevelopment()) return FRONTEND_URLS.local;
  if (isTunnelEnvironment()) return FRONTEND_URLS.tunnel;
  if (isProduction()) return FRONTEND_URLS.production;

  // Fallback to current location
  return `${window.location.protocol}//${window.location.host}`;
};
