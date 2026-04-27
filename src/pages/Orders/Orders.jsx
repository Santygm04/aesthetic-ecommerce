// src/pages/Orders/Orders.jsx
import "./Orders.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSavedOrderRefs, addOrderRef, removeOrderRef } from "../../utils/ordersLocal.js";
import { noteOrderUpdate, resetOrdersUnseen } from "../../utils/ordersBadge.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const SELLER_WA = (import.meta.env.VITE_SELLER_PHONE || "").replace(/\D/g, "");

const money = (n) =>
  Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const shortCode = (o) =>
  o?.shippingTicket || (o?.orderNumber ? `#${o.orderNumber}` : o?._id?.slice(-6)?.toUpperCase());

/* ── Mapa de estados ── */
const STATUS_MAP = {
  pending:   { label: "Pendiente",  cls: "st-pending",   icon: "⏳" },
  paid:      { label: "Pagado",     cls: "st-paid",      icon: "✅" },
  approved:  { label: "Aprobado",   cls: "st-paid",      icon: "✅" },
  shipped:   { label: "Enviado",    cls: "st-shipped",   icon: "📦" },
  delivered: { label: "Entregado",  cls: "st-delivered", icon: "🏠" },
  cancelled: { label: "Cancelado",  cls: "st-cancelled", icon: "❌" },
  rejected:  { label: "Rechazado",  cls: "st-rejected",  icon: "🚫" },
};

const getStatus = (s) => STATUS_MAP[s] || { label: s, cls: "st-pending", icon: "❓" };

/* ── Mensaje explicativo según estado ── */
const STATUS_MSG = {
  pending: {
    title: "Pedido recibido — esperando confirmación",
    body:  "Estamos revisando tu pedido. En breve te contactamos por WhatsApp para coordinar el pago.",
    color: "#d97706",
    bg:    "#fffbeb",
    bd:    "#fde68a",
  },
  paid: {
    title: "¡Pago confirmado!",
    body:  "Tu pago fue acreditado. Estamos preparando tu pedido para el envío.",
    color: "#059669",
    bg:    "#f0fdf4",
    bd:    "#a7f3d0",
  },
  approved: {
    title: "¡Pago aprobado!",
    body:  "Tu pago fue aprobado. Estamos preparando tu pedido.",
    color: "#059669",
    bg:    "#f0fdf4",
    bd:    "#a7f3d0",
  },
  shipped: {
    title: "¡Tu pedido fue enviado!",
    body:  "Tu pedido está en camino. Pronto lo tenés en casa.",
    color: "#2563eb",
    bg:    "#eff6ff",
    bd:    "#93c5fd",
  },
  delivered: {
    title: "Pedido entregado",
    body:  "Tu pedido fue entregado con éxito. ¡Gracias por tu compra!",
    color: "#059669",
    bg:    "#f0fdf4",
    bd:    "#a7f3d0",
  },
  cancelled: {
    title: "Pedido cancelado",
    body:  "Este pedido fue cancelado. Si tenés dudas, contactanos por WhatsApp.",
    color: "#dc2626",
    bg:    "#fef2f2",
    bd:    "#fca5a5",
  },
  rejected: {
    title: "Pedido rechazado",
    body:  "Lamentablemente tu pedido fue rechazado. Esto puede deberse a falta de stock o un problema con el pago. Contactanos por WhatsApp para más información.",
    color: "#dc2626",
    bg:    "#fef2f2",
    bd:    "#fca5a5",
    showWa: true,
  },
};

function StatusBanner({ status, orderCode }) {
  const info = STATUS_MSG[status];
  if (!info) return null;
  return (
    <div className="order-status-banner" style={{
      background: info.bg,
      border: `1.5px solid ${info.bd}`,
      borderLeft: `4px solid ${info.color}`,
    }}>
      <div className="osb-title" style={{ color: info.color }}>{info.title}</div>
      <div className="osb-body">{info.body}</div>
      {info.showWa && SELLER_WA && (
        <a
          className="osb-wa-btn"
          href={`https://wa.me/${SELLER_WA}?text=${encodeURIComponent(
            `Hola! Mi pedido ${orderCode} fue rechazado. ¿Pueden ayudarme?`
          )}`}
          target="_blank"
          rel="noreferrer"
        >
          💬 Consultar por WhatsApp
        </a>
      )}
    </div>
  );
}

/* ════════════════════════════════════ */
export default function Orders() {
  const [refs,    setRefs]    = useState(getSavedOrderRefs());
  const ids   = useMemo(() => refs.map(r => r._id).filter(Boolean),  [refs]);
  const codes = useMemo(() => refs.map(r => r.code).filter(Boolean), [refs]);

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [lookup, setLookup] = useState({ code: "", emailOrPhone: "", dni: "" });
  const [expanded,setExpanded]= useState(null); // id del pedido expandido

  const esMapRef      = useRef(new Map());
  const lastStatusRef = useRef(new Map());
  const askedNotifRef = useRef(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => { resetOrdersUnseen(); }, []);

  function askNotifOnce() {
    if (askedNotifRef.current) return;
    askedNotifRef.current = true;
    try {
      if ("Notification" in window && Notification.permission === "default")
        Notification.requestPermission().catch(() => {});
    } catch {}
  }

  function notifyBrowser(title, body) {
    try {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      new Notification(title, { body });
    } catch {}
  }

  function pushToast(text, type = "info") {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }

  async function fetchOrders() {
    if (!ids.length && !codes.length) { setOrders([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (ids.length)   params.set("ids",   ids.join(","));
      if (codes.length) params.set("codes", codes.join(","));
      const r    = await fetch(`${API_URL}/api/payments/orders/public/by-ids?${params.toString()}`);
      const data = await r.json();
      const list = Array.isArray(data) ? data : [];
      setOrders(list);
      list.forEach(o => { if (o?._id && o?.status) lastStatusRef.current.set(o._id, o.status); });
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [refs.length]);

  /* SSE por cada ID */
  useEffect(() => {
    for (const [id, es] of esMapRef.current.entries()) {
      if (!ids.includes(id)) {
        try { es.close(); } catch {}
        esMapRef.current.delete(id);
        lastStatusRef.current.delete(id);
      }
    }

    ids.forEach(id => {
      if (esMapRef.current.has(id)) return;
      try {
        const es = new EventSource(`${API_URL}/api/payments/order/${id}/stream`);
        es.addEventListener("update", ev => {
          try {
            const msg = JSON.parse(ev.data || "{}");
            if (!msg?.status) return;
            setOrders(prev => prev.map(o => o._id === id ? { ...o, status: msg.status } : o));
            const prev = lastStatusRef.current.get(id);
            if (prev && prev !== msg.status) {
              const ord  = orders.find(o => o._id === id);
              const code = shortCode(ord || { _id: id });
              const info = getStatus(msg.status);
              const txt  = `Pedido ${code}: ${info.label}`;
              const type = ["paid","approved","delivered"].includes(msg.status) ? "success"
                : ["cancelled","rejected"].includes(msg.status) ? "error" : "info";
              pushToast(txt, type);
              if (document.hidden) notifyBrowser(`Pedido ${code}`, info.label);
              noteOrderUpdate({ orderId: id, prevStatus: prev, newStatus: msg.status });
            }
            lastStatusRef.current.set(id, msg.status);
          } catch {}
        });
        es.onerror = () => {};
        esMapRef.current.set(id, es);
        askNotifOnce();
      } catch {}
    });

    return () => {
      for (const es of esMapRef.current.values()) { try { es.close(); } catch {} }
      esMapRef.current.clear();
    };
    // eslint-disable-next-line
  }, [ids.join(",")]);

  async function onLookup(e) {
  e.preventDefault();
  const hasCode = lookup.code.trim();
  const hasContact = lookup.emailOrPhone.trim() || lookup.dni.trim();

  if (!hasCode && !hasContact) return;

  try {
    setLoading(true);

    // Si tiene código → busca por código (flujo original)
    if (hasCode) {
      const p = new URLSearchParams({
        code: lookup.code.trim(),
        emailOrPhone: lookup.emailOrPhone.trim(),
      });
      const r = await fetch(`${API_URL}/api/payments/orders/public/lookup?${p.toString()}`);
      const o = await r.json();
      if (o && o._id) {
        addOrderRef({ _id: o._id, code: shortCode(o), createdAt: o.createdAt });
        setRefs(getSavedOrderRefs());
      } else {
        pushToast("No encontramos ese pedido.", "error");
      }
    } else {
      // Sin código → busca por email/teléfono/DNI
      const email = lookup.emailOrPhone.includes("@") ? lookup.emailOrPhone.trim() : "";
      const phone = !lookup.emailOrPhone.includes("@") ? lookup.emailOrPhone.trim() : "";
      const p = new URLSearchParams();
      if (email) p.set("email", email);
      if (phone) p.set("phone", phone);
      if (lookup.dni.trim()) p.set("dni", lookup.dni.trim());

      const r = await fetch(`${API_URL}/api/payments/orders/public/by-buyer?${p.toString()}`);
      const list = await r.json();
      if (Array.isArray(list) && list.length) {
        list.forEach(o => addOrderRef({ _id: o._id, code: shortCode(o), createdAt: o.createdAt }));
        setRefs(getSavedOrderRefs());
        pushToast(`Se encontraron ${list.length} pedido(s).`, "info");
      } else {
        pushToast("No encontramos pedidos con esos datos.", "error");
      }
    }
  } catch {
    pushToast("Error buscando el pedido.", "error");
  } finally {
    setLoading(false);
    setLookup({ code: "", emailOrPhone: "", dni: "" });
  }
}

  const remove = (idOrCode) => setRefs(removeOrderRef(idOrCode));

  return (
    <section className="orders-wrap">
      <h2 className="orders-title">Mis pedidos</h2>
      <p className="orders-sub">Seguimiento en tiempo real de tus compras.</p>

      {/* Buscador */}
      <form className="orders-lookup" onSubmit={onLookup}>
  <input
    placeholder="Código de pedido (AE-YYYYMMDD-XXXX o #número)"
    value={lookup.code}
    onChange={e => setLookup(v => ({ ...v, code: e.target.value }))}
  />
  <input
    placeholder="Email o teléfono"
    value={lookup.emailOrPhone}
    onChange={e => setLookup(v => ({ ...v, emailOrPhone: e.target.value }))}
  />
  <input
    placeholder="DNI (opcional)"
    inputMode="numeric"
    value={lookup.dni}
    onChange={e => setLookup(v => ({ ...v, dni: e.target.value }))}
  />
  <button className="btn" type="submit">Buscar</button>
</form>

      {loading && <div className="orders-msg">Actualizando…</div>}

      {!loading && orders.length === 0 && (
        <div className="orders-empty">
          <p>No hay pedidos guardados en este dispositivo.</p>
          <p className="muted">Después de comprar te van a aparecer acá automáticamente.</p>
        </div>
      )}

      <div className="orders-list">
        {orders.map(o => {
          const st   = getStatus(o.status);
          const code = shortCode(o);
          const isOpen = expanded === o._id;

          return (
            <article key={o._id} className={`order-card${["rejected","cancelled"].includes(o.status) ? " order-card--rejected" : o.status === "paid" || o.status === "approved" ? " order-card--paid" : ""}`}>

              {/* Cabecera */}
              <header className="order-head" onClick={() => setExpanded(isOpen ? null : o._id)} style={{ cursor: "pointer" }}>
                <div className="order-head-left">
                  <div className="order-code">
                    <span className="order-code-icon">{st.icon}</span>
                    Pedido <b>{code}</b>
                  </div>
                  <div className="order-date">{new Date(o.createdAt).toLocaleDateString("es-AR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })}</div>
                </div>
                <div className="order-head-right">
                  <span className={`badge ${st.cls}`}>{st.label}</span>
                  <span className="order-chevron">{isOpen ? "▲" : "▽"}</span>
                </div>
              </header>

              {/* Banner de estado — SIEMPRE visible si rechazado/cancelado */}
              <StatusBanner status={o.status} orderCode={code} />

              {/* Cuerpo expandible */}
              {isOpen && (
                <div className="order-body">
                  <ul className="order-items">
                    {(o.items || []).slice(0, 8).map((it, i) => (
                      <li key={i}>
                        <span className="name">{it.nombre}</span>
                        {(it?.variant?.size || it?.variant?.color) && (
                          <span className="muted"> ({[it?.variant?.size, it?.variant?.color].filter(Boolean).join(" / ")})</span>
                        )}
                        <span className="muted"> ×{it.cantidad}</span>
                        <span className="item-price"> {money(it.subtotal || (it.precio * it.cantidad))}</span>
                      </li>
                    ))}
                    {(o.items?.length || 0) > 8 && <li className="muted">…y más</li>}
                  </ul>

                  <div className="order-info">
                    <div><span className="muted">Total:</span> <b className="order-total">{money(o.total)}</b></div>
                    <div><span className="muted">Pago:</span> {o.paymentMethod}</div>
                    <div><span className="muted">Entrega:</span> {o.shipping?.method === "envio" ? "Envío a domicilio" : "Retiro en local"}</div>
                    {o.shipping?.trackingNumber && (
                      <div><span className="muted">Tracking:</span> <b>{o.shipping.trackingNumber}</b></div>
                    )}
                  </div>
                </div>
              )}

              {/* Acciones */}
             <footer className="order-actions">
  <a className="btn btn--ghost" href={`/pago/estado?o=${encodeURIComponent(o._id)}`}>
    Ver detalle
  </a>

  {SELLER_WA && (
    <a
      className="btn btn--wa-small"
      href={`https://wa.me/${SELLER_WA}?text=${encodeURIComponent(`Hola, consulto por mi pedido ${code}`)}`}
      target="_blank"
      rel="noreferrer"
    >
      💬 WhatsApp
    </a>
  )}

  <button
    type="button"
    className="btn btn--remove-small"
    onClick={() => remove(o._id || code)}
  >
    Quitar
  </button>
</footer>
            </article>
          );
        })}
      </div>

      {/* Toasters */}
      <div className="toast-wrap" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type || "info"}`}>{t.text}</div>
        ))}
      </div>
    </section>
  );
}