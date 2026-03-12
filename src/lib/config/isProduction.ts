export const isProduction = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname === "choidaruhan.github.io";
};
