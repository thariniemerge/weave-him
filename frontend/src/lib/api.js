import axios from "axios";

// Same-origin unless the configured backend shares this page's host (never call another domain)
const BASE = process.env.REACT_APP_BACKEND_URL;
const sameHost = (() => { try { return new URL(BASE).host === window.location.host; } catch { return false; } })();
export const API = `${sameHost ? BASE : ""}/api`;

export const getStats = () => axios.get(`${API}/stats`).then((r) => r.data);
export const createHusband = (payload) => axios.post(`${API}/husbands`, payload, { timeout: 25000 }).then((r) => r.data);
export const getHusband = (id) => axios.get(`${API}/husbands/${id}`).then((r) => r.data);
export const shareLink = (id) => `${window.location.origin}/api/share/${id}`;

const cache = {};
const TOKENS = "weave-him-tokens";
const tokens = () => JSON.parse(localStorage.getItem(TOKENS) || "{}");
export const rememberHusband = (h) => {
  cache[h.id] = h;
  if (h.edit_token) localStorage.setItem(TOKENS, JSON.stringify({ ...tokens(), [h.id]: h.edit_token }));
};
export const isMine = (id) => !!tokens()[id];
export const reweaveVow = (id, index) =>
  axios.post(`${API}/husbands/${id}/reweave`, { index, token: tokens()[id] || "" }, { timeout: 20000 }).then((r) => r.data);
export const cardUrl = (id) => `${API}/husbands/${id}/card.png`;
export const getCardBlob = (id) => axios.get(`${API}/husbands/${id}/card.jpg?v=14`, { responseType: "blob", timeout: 20000 }).then((r) => r.data);
export const cachedHusband = (id) => cache[id];
