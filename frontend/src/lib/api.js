import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const getStats = () => axios.get(`${API}/stats`).then((r) => r.data);
export const createHusband = (payload) => axios.post(`${API}/husbands`, payload, { timeout: 20000 }).then((r) => r.data);
export const getHusband = (id) => axios.get(`${API}/husbands/${id}`).then((r) => r.data);
export const uploadCard = (id, blob) => axios.post(`${API}/husbands/${id}/card`, blob, { headers: { "Content-Type": "image/png" } });
export const shareLink = (id) => `${window.location.origin}/api/share/${id}`;

const cache = {};
export const rememberHusband = (h) => {
  cache[h.id] = h;
  const mine = JSON.parse(localStorage.getItem("weave-him-mine") || "[]");
  localStorage.setItem("weave-him-mine", JSON.stringify([...mine, h.id].slice(-30)));
};
export const isMine = (id) => JSON.parse(localStorage.getItem("weave-him-mine") || "[]").includes(id);
export const cachedHusband = (id) => cache[id];
