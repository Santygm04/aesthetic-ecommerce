// src/utils/ordersBadge.js
// Utilidad para manejar el "badge" (contador de novedades) en "Mis pedidos".

const KEY = "orders_unseen_count";

export function getUnseenOrdersCount() {
  const n = parseInt(localStorage.getItem(KEY) || "0", 10);
  return Number.isFinite(n) ? n : 0;
}

export function incrementOrdersUnseen(delta = 1) {
  const next = Math.max(0, getUnseenOrdersCount() + delta);
  localStorage.setItem(KEY, String(next));
  try {
    window.dispatchEvent(new CustomEvent("orders:badge", { detail: { count: next } }));
  } catch {}
}

export function resetOrdersUnseen() {
  localStorage.setItem(KEY, "0");
  try {
    window.dispatchEvent(new CustomEvent("orders:badge", { detail: { count: 0 } }));
  } catch {}
}

// Llamalo siempre que detectes que una orden cambió de estado.
export function noteOrderUpdate({ orderId, prevStatus, newStatus }) {
  if (!orderId || !newStatus) return;
  if (prevStatus && prevStatus !== newStatus) {
    incrementOrdersUnseen(1);
  }
}
