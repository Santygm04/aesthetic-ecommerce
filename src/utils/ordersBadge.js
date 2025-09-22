// src/utils/ordersBadge.js
const KEY_UNSEEN = "orders.unseen";
const KEY_STATUSMAP = "orders.statusmap";

// === helpers de storage ===
function getJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "") ?? fallback; } catch { return fallback; }
}
function setJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function getOrdersUnseen() {
  return Number(localStorage.getItem(KEY_UNSEEN) || 0);
}
export function setOrdersUnseen(n) {
  localStorage.setItem(KEY_UNSEEN, String(Math.max(0, n|0)));
}
export function clearOrdersBadge() {
  setOrdersUnseen(0);
  emitOrdersBadge();
}
export function bumpOrdersBadge(by = 1) {
  setOrdersUnseen(getOrdersUnseen() + by);
  emitOrdersBadge();
}

export function getKnownOrderStatuses() {
  return getJSON(KEY_STATUSMAP, {});
}
export function rememberOrderStatuses(mapObj) {
  setJSON(KEY_STATUSMAP, mapObj || {});
}

// Llamá esto cuando detectes un cambio real
export function noteOrderUpdate({ id, status }) {
  const map = getKnownOrderStatuses();
  if (id) map[id] = status;
  rememberOrderStatuses(map);
  bumpOrdersBadge(1);
}

// Eventos para que el Navbar se entere
export function emitOrdersBadge() {
  window.dispatchEvent(new CustomEvent("orders:badge", { detail: { unseen: getOrdersUnseen() } }));
}
export function listenOrdersBadge(cb) {
  const h = (e) => cb(e?.detail?.unseen ?? getOrdersUnseen());
  window.addEventListener("orders:badge", h);
  return () => window.removeEventListener("orders:badge", h);
}
