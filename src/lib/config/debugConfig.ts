import { API_BASE } from "./apiBase";
import { isLocalDevelopment } from "./isLocalDevelopment";
import { isTunnelEnvironment } from "./isTunnelEnvironment";
import { isProduction } from "./isProduction";
import { AUTH_ENDPOINTS } from "./authEndpoints";
import { API_ENDPOINTS } from "./apiEndpoints";
import { getFrontendUrl } from "./getFrontendUrl";

export const debugConfig = () => {
  if (typeof window === "undefined") return {};

  return {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    href: window.location.href,
    API_BASE,
    environment: {
      isLocal: isLocalDevelopment(),
      isTunnel: isTunnelEnvironment(),
      isProduction: isProduction(),
    },
    endpoints: {
      auth: AUTH_ENDPOINTS,
      api: API_ENDPOINTS,
    },
    frontendUrl: getFrontendUrl(),
  };
};
