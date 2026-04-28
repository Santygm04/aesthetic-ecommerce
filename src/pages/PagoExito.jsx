// src/pages/PagoExito.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { addOrderRef } from "../utils/ordersLocal.js";
import "./PagoExito.css";

const API_URL   = import.meta.env.VITE_API_URL   || "http://localhost:4000";
const SELLER_WA = (import.meta.env.VITE_SELLER_PHONE || "").replace(/\D/g, "");
const BANK_ALIAS = import.meta.env.VITE_BANK_ALIAS || "SANTYGM";

const fmtARS = (n) =>
  `$${Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const shortId = (id) => (id ? String(id).slice(-6).toUpperCase() : "");

export default function PagoExito() {
  const params  = new URLSearchParams(window.location.search);
  const orderId = params.get("o");

  const [order,  setOrder]  = useState(null);
  const [status, setStatus] = useState("loading");
  const esRef   = useRef(null);
  const pollRef = useRef(null);

  const saveRef = (data) => {
    try {
      const code = data?.shippingTicket || (data?.orderNumber ? `#${data.orderNumber}` : null);
      addOrderRef({ _id: data?.id || orderId, code, createdAt: data?.createdAt || Date.now() });
    } catch {}
  };

  useEffect(() => {
    if (!orderId) { setStatus("notfound"); return; }
    let alive = true;

    async function loadOnce() {
      try {
        const res  = await fetch(`${API_URL}/api/payments/order/${orderId}`);
        if (res.status === 404) { if (alive) setStatus("notfound"); return; }
        const data = await res.json();
        if (!alive) return;
        setOrder(data);
        if (data.status === "paid")                              { setStatus("paid"); saveRef(data); }
        else if (["cancelled","rejected"].includes(data.status)) setStatus("rejected");
        else                                                      setStatus("waiting");
      } catch {
        if (alive) setStatus("waiting");
      }
    }

    loadOnce();

    try {
      const es = new EventSource(`${API_URL}/api/payments/order/${orderId}/stream`);
      esRef.current = es;
      es.addEventListener("update", (ev) => {
        try {
          const msg = JSON.parse(ev.data || "{}");
          if (!msg?.status || !alive) return;
          setOrder((prev) => prev ? { ...prev, status: msg.status } : prev);
          if (msg.status === "paid")                               setStatus("paid");
          else if (["cancelled","rejected"].includes(msg.status)) setStatus("rejected");
        } catch {}
      });
      es.onerror = () => {
        if (!pollRef.current) {
          pollRef.current = setInterval(async () => {
            try {
              const r = await fetch(`${API_URL}/api/payments/order/${orderId}`);
              const d = await r.json().catch(() => null);
              if (!d || !alive) return;
              setOrder(d);
              if (d.status === "paid")                               setStatus("paid");
              else if (["cancelled","rejected"].includes(d.status)) setStatus("rejected");
            } catch {}
          }, 4000);
        }
      };
    } catch {
      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${API_URL}/api/payments/order/${orderId}`);
          const d = await r.json().catch(() => null);
          if (!d || !alive) return;
          setOrder(d);
          if (d.status === "paid") setStatus("paid");
        } catch {}
      }, 4000);
    }

    return () => {
      alive = false;
      esRef.current?.close?.();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orderId]);

  const waText = order
    ? encodeURIComponent(
        `Hola! Hice un pedido en Aesthetic.\nPedido: ${order.shippingTicket || shortId(order.id)}\nTotal: ${fmtARS(order.total)}`
      )
    : "";
  const waHref = SELLER_WA ? `https://wa.me/${SELLER_WA}?text=${waText}` : null;

  /* ── Sin ID ── */
  if (!orderId) return (
    <div className="pe-wrap">
      <div className="pe-card pe-card--error">
        <div className="pe-icon">⚠️</div>
        <h2 className="pe-title pe-title--error">Falta el ID de la orden</h2>
        <Link to="/" className="pe-btn pe-btn--home">Volver al inicio</Link>
      </div>
    </div>
  );

  /* ── Cargando ── */
  if (status === "loading") return (
    <div className="pe-wrap">
      <div className="pe-card">
        <div className="pe-success-header">
          <div className="pe-spinner" />
          <p className="pe-muted">Cargando tu pedido…</p>
        </div>
      </div>
    </div>
  );

  /* ── Esperando (transferencia o MP procesando) ── */
  if (status === "waiting") {
    const isTransfer = order?.paymentMethod === "transfer" || order?.paymentMethod === "transferencia";
    const ticket = order?.shippingTicket;

    return (
      <div className="pe-wrap">
        <div className="pe-card">
          {isTransfer ? (
            <>
              <div className="pe-success-header">
                <div className="pe-check" style={{ background: "#f59e0b", boxShadow: "0 0 0 8px rgba(245,158,11,.12), 0 12px 32px rgba(245,158,11,.28)" }}>
                  ⏳
                </div>
                <h1 className="pe-title pe-title--pending">¡Pedido recibido!</h1>
                <p className="pe-muted">Gracias por tu compra en Aesthetic</p>
              </div>

              {ticket && (
                <div className="pe-ticket" style={{ flexDirection: "column", alignItems: "flex-start", gap: ".5rem" }}>
                  <span className="pe-ticket-label">🏷 Número de pedido</span>
                  <div style={{ display: "flex", alignItems: "center", gap: ".75rem", width: "100%" }}>
                    <span className="pe-ticket-code" style={{ fontSize: "1.6rem", letterSpacing: "2px", flex: 1 }}>
                      {ticket}
                    </span>
                    <button className="pe-copy-btn" onClick={() => navigator.clipboard.writeText(ticket)}>
                      Copiar
                    </button>
                  </div>
                  <span style={{ fontSize: ".78rem", color: "var(--pe-muted)" }}>
                    Usá este número como referencia en tu transferencia
                  </span>
                </div>
              )}

              <div className="pe-info-box">
                <strong>⏱ Verificamos tu pago en 24 a 72 horas</strong>
                <span>Una vez confirmado, te avisamos por WhatsApp y empezamos a preparar tu pedido.</span>
              </div>

              <div className="pe-section">
                <h3 className="pe-section-title">Datos para transferir</h3>
                <div className="pe-rows">
                  <div className="pe-row">
                    <span>Alias</span>
                    <strong style={{ fontFamily: "monospace", letterSpacing: ".5px" }}>{BANK_ALIAS}</strong>
                  </div>
                  <div className="pe-row">
                    <span>Total a transferir</span>
                    <strong>{fmtARS(order?.total)}</strong>
                  </div>
                  {ticket && (
                    <div className="pe-row">
                      <span>Referencia</span>
                      <span style={{ fontFamily: "monospace", fontSize: ".85rem" }}>{ticket}</span>
                    </div>
                  )}
                </div>
              </div>

              {order?.items?.length > 0 && (
                <div className="pe-section">
                  <h3 className="pe-section-title">Tu pedido</h3>
                  <div className="pe-items">
                    {order.items.map((it, i) => (
                      <div key={i} className="pe-item-row">
                        <span className="pe-item-name">
                          {it.nombre}
                          {(it.variant?.size || it.variant?.color)
                            ? ` (${[it.variant.size, it.variant.color].filter(Boolean).join(" / ")})`
                            : ""}
                          {" "}×{it.cantidad}
                        </span>
                        <span className="pe-item-price">{fmtARS(it.subtotal || it.precio * it.cantidad)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pe-actions" style={{flexWrap:"nowrap"}}>
  {waHref && (
    <a href={waHref} target="_blank" rel="noreferrer" className="pe-btn pe-btn--wa" style={{flex:"1 1 0",minWidth:0}}>
      💬 WhatsApp
    </a>
  )}
  <Link to="/pedidos" className="pe-btn pe-btn--orders" style={{flex:"1 1 0",minWidth:0}}>Mis pedidos</Link>
  <Link to="/" className="pe-btn pe-btn--home" style={{flex:"1 1 0",minWidth:0}}>Seguir comprando</Link>
</div>
            </>
          ) : (
            <div className="pe-success-header">
              <div className="pe-spinner" />
              <h2 className="pe-title pe-title--pending">Procesando tu pago…</h2>
              <p className="pe-muted">Estamos confirmando con Mercado Pago. Esta pantalla se actualiza sola.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── No encontrado ── */
  if (status === "notfound") return (
    <div className="pe-wrap">
      <div className="pe-card pe-card--error">
        <div className="pe-icon">🔍</div>
        <h2 className="pe-title pe-title--error">No encontramos la orden</h2>
        <Link to="/" className="pe-btn pe-btn--home">Volver al inicio</Link>
      </div>
    </div>
  );

  /* ── Rechazado ── */
  if (status === "rejected") return (
    <div className="pe-wrap">
      <div className="pe-card pe-card--error">
        <div className="pe-icon">❌</div>
        <h2 className="pe-title pe-title--error">Pago rechazado</h2>
        <p className="pe-muted">Pedido: <strong>{order?.shippingTicket || orderId}</strong></p>
        <p className="pe-muted">Si creés que hubo un error, escribinos por WhatsApp.</p>
        <div className="pe-actions">
          {waHref && <a href={waHref} target="_blank" rel="noreferrer" className="pe-btn pe-btn--wa">💬 WhatsApp</a>}
          <Link to="/" className="pe-btn pe-btn--home">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );

  /* ── PAID ✅ ── */
  if (!order) return (
    <div className="pe-wrap">
      <div className="pe-card">
        <div className="pe-success-header">
          <div className="pe-spinner" />
          <p className="pe-muted">Cargando tu pedido…</p>
        </div>
      </div>
    </div>
  );

  const envio  = order?.shipping?.method === "envio";
  const ticket = order?.shippingTicket;
  const addr   = order?.shipping?.address || {};
  const dirStr = [addr.calle, addr.numero, addr.piso, addr.ciudad, addr.provincia].filter(Boolean).join(", ");

  return (
    <div className="pe-wrap">
      <div className="pe-card pe-card--success">

        <div className="pe-success-header">
          <div className="pe-check">✓</div>
          <h1 className="pe-title pe-title--success">¡Pago aprobado!</h1>
          <p className="pe-muted">Gracias por tu compra en Aesthetic 🛍️</p>
        </div>

        <div className="pe-ticket" style={{ flexDirection: "column", alignItems: "flex-start", gap: ".5rem" }}>
          <span className="pe-ticket-label">🏷 Número de pedido</span>
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem", width: "100%" }}>
            <span className="pe-ticket-code" style={{ fontSize: "1.6rem", letterSpacing: "2px", flex: 1 }}>
              {ticket || shortId(orderId)}
            </span>
            <button
              className="pe-copy-btn"
              onClick={() => navigator.clipboard.writeText(ticket || "")}
              disabled={!ticket}
            >
              Copiar
            </button>
          </div>
          <span style={{ fontSize: ".78rem", color: "var(--pe-muted)" }}>
            Guardá este número para hacer seguimiento de tu pedido
          </span>
        </div>

        <div className="pe-section">
          <h3 className="pe-section-title">Resumen</h3>
          <div className="pe-rows">
            <div className="pe-row">
              <span>Estado</span>
              <strong className="pe-paid">✓ Pagado</strong>
            </div>
            <div className="pe-row">
              <span>Método</span>
              <span>{order?.paymentMethod === "mercadopago" ? "Mercado Pago" : "Transferencia"}</span>
            </div>
            <div className="pe-row">
              <span>Total</span>
              <strong>{fmtARS(order.total)}</strong>
            </div>
          </div>
        </div>

        {order?.items?.length > 0 && (
          <div className="pe-section">
            <h3 className="pe-section-title">Productos</h3>
            <div className="pe-items">
              {order.items.map((it, i) => (
                <div key={i} className="pe-item-row">
                  <span className="pe-item-name">
                    {it.nombre}
                    {(it.variant?.size || it.variant?.color)
                      ? ` (${[it.variant.size, it.variant.color].filter(Boolean).join(" / ")})`
                      : ""}
                    {" "}×{it.cantidad}
                  </span>
                  <span className="pe-item-price">{fmtARS(it.subtotal || it.precio * it.cantidad)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pe-section">
          <h3 className="pe-section-title">Entrega</h3>
          {envio ? (
            <div className="pe-rows">
              <div className="pe-row"><span>Tipo</span><span>Envío a domicilio</span></div>
              {dirStr && <div className="pe-row"><span>Dirección</span><span>{dirStr}</span></div>}
              <div className="pe-row pe-row--info">
                📦 Te avisamos por WhatsApp cuando esté despachado.
              </div>
            </div>
          ) : (
            <div className="pe-rows">
              <div className="pe-row"><span>Tipo</span><span>Retiro en local</span></div>
              <div className="pe-row pe-row--info">
                📍 Te contactamos por WhatsApp para coordinar el retiro.
              </div>
            </div>
          )}
        </div>

        <div className="pe-actions">
          {waHref && (
            <a href={waHref} target="_blank" rel="noreferrer" className="pe-btn pe-btn--wa">
              💬 Chatear por WhatsApp
            </a>
          )}
          <Link to="/pedidos" className="pe-btn pe-btn--orders">Mis pedidos</Link>
          <Link to="/" className="pe-btn pe-btn--home">Volver al inicio</Link>
        </div>

      </div>
    </div>
  );
}