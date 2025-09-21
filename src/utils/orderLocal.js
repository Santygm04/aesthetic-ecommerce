// src/utils/ordersLocal.js
const KEY = "ae_my_orders_v1";

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}
function write(list) { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20))); }

export function addOrderRef({ _id = null, code = null, createdAt = Date.now() }) {
  const list = read();
  const exists = list.some(o => (o._id && o._id === _id) || (o.code && o.code === code));
  if (!exists) { list.unshift({ _id, code, createdAt }); write(list); }
  return list;
}
export function getSavedOrderRefs(){ return read(); }
export function removeOrderRef(idOrCode){
  const list = read().filter(o => o._id !== idOrCode && o.code !== idOrCode);
  write(list); return list;
}
export function clearSavedOrders(){ localStorage.removeItem(KEY); }
