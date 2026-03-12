export const isTunnelEnvironment = () => {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "my-blog-local.chl11wq12.workers.dev";
};
