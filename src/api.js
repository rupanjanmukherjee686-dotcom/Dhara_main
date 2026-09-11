const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname)

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalhost ? "http://localhost:5000" : window.location.origin)