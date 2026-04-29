// src/pages/Pago/EstadoPago.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "../Pago/EstadoPago.css";
import { addOrderRef } from "../../utils/ordersLocal.js";
import { noteOrderUpdate } from "../../utils/ordersBadge.js";
import OrderTimeline from "../../components/OrderTimeline/OrderTimeline.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const SELLER_WA = (import.meta.env.VITE_SELLER_PHONE || "").replace(/\D/g, "");
const AUTO_OPEN_WA =
  String(import.meta.env.VITE_AUTO_OPEN_WA_ON_PAID || "false").toLowerCase() === "true";

export default function EstadoPago() {
  const { estado } = useParams();
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const orderId   = params.get("orderId") || params.get("o") || "";
  const paymentId = params.get("payment_id") || params.get("collection_id") || params.get("paymentId") || "";
  const canAutoOpen = params.get("fresh") === "1";

  const [info, setInfo]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);
  const esRef         = useRef(null);
  const pollRef       = useRef(null);
  const autoOpenedRef = useRef(false);

  /* ── helpers ── */
  const niceMoney   = (n) => typeof n === "number" ? n.toLocaleString("es-AR") : String(n || "");
  const shortId     = (id) => id ? String(id).slice(-6).toUpperCase() : "";
  const prettyOrder = (o) =>
    o?.shippingTicket || (o?.orderNumber ? `#${o.orderNumber}` : `AE-${shortId(o?.id || "")}`);

  const buildAddress = (a = {}) =>
    [[a.calle, a.numero].filter(Boolean).join(" "), a.piso, a.ciudad, a.provincia, a.cp]
      .filter(Boolean).join(", ");

  const buildWaText = (o) => {
    if (!o) return "";
    const entrega = o?.shipping?.method === "envio"
      ? `Envío a domicilio — ${buildAddress(o?.shipping?.address)}`
      : "Retiro en local";
    return encodeURIComponent([
      "Hola 👋, acabo de hacer un pedido en Aesthetic.",
      `Pedido: ${prettyOrder(o)} (ID ${o?.id})`,
      `Total: $${niceMoney(o?.total)}`,
      `Entrega: ${entrega}`,
    ].join("\n"));
  };

  const waHref = info && SELLER_WA
    ? `https://wa.me/${SELLER_WA}?text=${buildWaText(info)}`
    : null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── fetch + SSE ── */
  useEffect(() => {
    let alive = true;
    if (!orderId) { setLoading(false); return; }

    async function loadOnce() {
      try {
        const res  = await fetch(`${API_URL}/api/payments/order/${orderId}`);
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) throw new Error("No data");
        try {
          const code = data?.shippingTicket || (data?.orderNumber ? `#${data.orderNumber}` : null);
          addOrderRef({ _id: orderId, code, createdAt: data?.createdAt || Date.now() });
        } catch {}
        if (!alive) return;
        setInfo(data);
        if (!esRef.current) esRef.current = {};
        esRef.current._lastStatus = data?.status;
        setLoading(false);
      } catch {
        if (!alive) return;
        setInfo(null);
        setLoading(false);
      }
    }

    loadOnce();

    try {
      const es = new EventSource(`${API_URL}/api/payments/order/${orderId}/stream`);
      esRef.current = es;
      es.addEventListener("update", async (ev) => {
  try {
    const msg = JSON.parse(ev.data || "{}");
    if (!msg?.status || !alive) return;
    // Re-fetch completo para obtener shipping actualizado
    try {
      const r = await fetch(`${API_URL}/api/payments/order/${orderId}`);
      const d = await r.json().catch(() => null);
      if (d && alive) setInfo(d);
    } catch {
      setInfo((prev) => prev ? { ...prev, status: msg.status } : prev);
    }
    const prevSt = esRef.current?._lastStatus || null;
    noteOrderUpdate({ orderId, prevStatus: prevSt, newStatus: msg.status });
    esRef.current._lastStatus = msg.status;
  } catch {}
});
      es.onerror = () => {
        if (!pollRef.current) {
          pollRef.current = setInterval(async () => {
            try {
              const r = await fetch(`${API_URL}/api/payments/order/${orderId}`);
              const d = await r.json().catch(() => null);
              if (!d) return;
              setInfo(d);
              noteOrderUpdate({ orderId, prevStatus: esRef.current?._lastStatus, newStatus: d?.status });
              if (esRef.current) esRef.current._lastStatus = d?.status;
            } catch {}
          }, 8000);
        }
      };
    } catch {
      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${API_URL}/api/payments/order/${orderId}`);
          const d = await r.json().catch(() => null);
          if (!d) return;
          setInfo(d);
          noteOrderUpdate({ orderId, prevStatus: esRef.current?._lastStatus, newStatus: d?.status });
          if (esRef.current) esRef.current._lastStatus = d?.status;
        } catch {}
      }, 8000);
    }

    return () => {
      alive = false;
      if (esRef.current?.close) esRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orderId]);

  /* ── auto-open WA ── */
  useEffect(() => {
    if (!AUTO_OPEN_WA || !SELLER_WA || !info || !canAutoOpen) return;
    if (autoOpenedRef.current) return;
    if (info.status === "paid") {
      autoOpenedRef.current = true;
      setTimeout(() => { if (waHref) window.location.href = waHref; }, 400);
    }
  }, [info, waHref, canAutoOpen]);

  /* ── estado visual ── */
  const ui = useMemo(() => {
    if (!info) return {
      heroKey:  "pending",
      icon:     "⏳",
      titulo:   "Procesando pago…",
      subtitulo:"Estamos verificando tu transacción. Esto puede demorar unos segundos.",
    };
    const st = String(info.status || "pending");
    if (st === "paid") return {
      heroKey:  "paid",
      icon:     "✓",
      titulo:   "¡Pago aprobado!",
      subtitulo:"Tu pedido fue confirmado y está siendo preparado. Te avisamos cada avance.",
    };
    if (st === "rejected" || st === "cancelled") return {
      heroKey:  "error",
      icon:     "✕",
      titulo:   "Pago no aprobado",
      subtitulo:"No pudimos procesar el pago. Podés reintentar o contactarnos por WhatsApp.",
    };
    return {
      heroKey:  "pending",
      icon:     "⏳",
      titulo:   "Pago pendiente…",
      subtitulo:"Tu pago está siendo procesado. En breve recibirás la confirmación.",
    };
  }, [info]);

  /* ── avances ── */
  const { isPaid, isRetiro, isDespachado, deliveredAt } = useMemo(() => {
    const st = String(info?.status || "pending");
    return {
      isPaid:       st === "paid",
      isRetiro:     info?.shipping?.method === "retiro",
      isDespachado: Boolean(info?.shipping?.trackingNumber) || Boolean(info?.shipping?.shippedAt),
      deliveredAt:  info?.shipping?.deliveredAt ? new Date(info.shipping.deliveredAt) : null,
    };
  }, [info]);

  const statusBadge = (st) => {
    if (st === "paid")
      return <span className="ep-badge-paid">Aprobado</span>;
    if (st === "rejected" || st === "cancelled")
      return <span style={{ color: "var(--ep-red)", fontWeight: 800 }}>Rechazado</span>;
    return <span className="ep-badge-pending">Pendiente</span>;
  };

  /* ── step dot style helper ── */
  const dot = (done, active) => ({
    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
    display: "grid", placeItems: "center",
    fontSize: ".8rem", fontWeight: 900, marginTop: 2,
    background: done ? "var(--ep-brand)" : active ? "var(--ep-brand-50)" : "#f3f4f6",
    color:      done ? "#fff"           : active ? "var(--ep-brand)"    : "var(--ep-muted)",
    border:     done ? "none"           : active ? "2px solid var(--ep-brand)" : "2px solid #e5e7eb",
    boxShadow:  done ? "0 0 0 6px rgba(255,46,166,.12)" : "none",
  });

  /* ══════════════════════════════════════════════ RENDER ══ */
  return (
    <main className="ep-page">

      {/* HERO */}
      <div className={`ep-hero ep-hero--${ui.heroKey}`}>
        <div className="ep-hero-icon">{ui.icon}</div>
        <div className="ep-hero-text">
          <h1 className="ep-hero-title">{ui.titulo}</h1>
          <p className="ep-hero-sub">{ui.subtitulo}</p>
        </div>
      </div>

      {/* LOADING / ERROR */}
      {loading ? (
        <div className="ep-center">
          <div className="ep-spinner" />
          <p className="ep-muted">Cargando datos de tu pedido…</p>
        </div>
      ) : !info ? (
        <div className="ep-center">
          <p className="ep-muted">No pudimos cargar el pedido. Revisá tu conexión o contactanos.</p>
        </div>
      ) : (
        <>
          {/* TICKET */}
          <div className="ep-ticket">
            <span className="ep-ticket-label">🏷 Número de pedido</span>
            <span className="ep-ticket-code">{prettyOrder(info)}</span>
            <button type="button" className="ep-copy-btn" onClick={() => handleCopy(prettyOrder(info))}>
              {copied ? "✓ Copiado" : "Copiar"}
            </button>
          </div>

          {/* GRID */}
          <div className="ep-grid">

            {/* Card: Resumen */}
            <div className="ep-card">
              <div className="ep-card-title"><span className="ep-card-icon">📋</span>Resumen</div>
              <div className="ep-rows">
                <div className="ep-row">
                  <span className="ep-row-label">Estado</span>
                  <span className="ep-row-value">{statusBadge(info.status)}</span>
                </div>
                <div className="ep-row">
                  <span className="ep-row-label">Método</span>
                  <span className="ep-row-value" style={{ textTransform: "capitalize" }}>{info.paymentMethod}</span>
                </div>
                <div className="ep-row">
                  <span className="ep-row-label">Total</span>
                  <span className="ep-row-value" style={{ color: "var(--ep-brand)", fontSize: "1rem" }}>
                    ${niceMoney(info.total)}
                  </span>
                </div>
                <div className="ep-row">
                  <span className="ep-row-label">ID</span>
                  <span className="ep-row-value" style={{ fontFamily: "monospace", fontSize: ".76rem", color: "var(--ep-muted)" }}>
                    …{String(info.id).slice(-10)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card: Envío */}
            <div className="ep-card">
              <div className="ep-card-title">
                <span className="ep-card-icon">{info?.shipping?.method === "envio" ? "📦" : "🏪"}</span>
                {info?.shipping?.method === "envio" ? "Datos de envío" : "Retiro en local"}
              </div>
              <div className="ep-rows">
                {info?.shipping?.method === "envio" ? (
                  <>
                    {info.shippingTicket && (
                      <div className="ep-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: ".35rem" }}>
                        <span className="ep-row-label">Ticket</span>
                        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", width: "100%" }}>
                          <span style={{ fontFamily: "monospace", fontWeight: 900, color: "var(--ep-brand)", flex: 1, fontSize: ".88rem" }}>
                            {info.shippingTicket}
                          </span>
                          <button
                            type="button"
                            className="ep-copy-btn"
                            style={{ fontSize: ".72rem", padding: ".28rem .65rem" }}
                            onClick={() => handleCopy(info.shippingTicket)}
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                    )}
                    {buildAddress(info?.shipping?.address) && (
                      <div className="ep-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: ".15rem" }}>
                        <span className="ep-row-label">Dirección</span>
                        <span className="ep-row-value" style={{ maxWidth: "100%", textAlign: "left" }}>
                          {buildAddress(info.shipping.address)}
                        </span>
                      </div>
                    )}
                    {info?.shipping?.company && (
                      <div className="ep-row">
                        <span className="ep-row-label">Empresa</span>
                        <span className="ep-row-value">{info.shipping.company}</span>
                      </div>
                    )}
                    {info?.shipping?.trackingNumber && (
                      <div className="ep-row">
                        <span className="ep-row-label">Tracking</span>
                        <span className="ep-row-value" style={{ fontFamily: "monospace", fontSize: ".82rem" }}>
                          {info.shipping.trackingNumber}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="ep-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <p className="ep-muted" style={{ margin: 0, fontSize: ".85rem", lineHeight: 1.65 }}>
                      Elegiste <strong style={{ color: "var(--ep-ink)" }}>Retiro en local</strong>.
                      Te vamos a contactar por WhatsApp para coordinar el horario.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Card: Seguimiento (full) */}
            <div className="ep-card ep-card--full">
              <div className="ep-card-title"><span className="ep-card-icon">🗺</span>Seguimiento del pedido</div>
              <OrderTimeline order={info} />
            </div>

            {/* Card: Avances (full) */}
            <div className="ep-card ep-card--full">
              <div className="ep-card-title"><span className="ep-card-icon">⚡</span>Estado de avances</div>

              {/* Paso 1 */}
              <div style={{ display: "flex", gap: "1rem", padding: ".6rem 0", borderBottom: "1px solid var(--ep-line)", alignItems: "flex-start" }}>
                <div style={dot(isPaid, !isPaid)}>
                  {isPaid ? "✓" : "1"}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: ".88rem", color: isPaid ? "var(--ep-ink)" : "var(--ep-amber)" }}>
                    Preparación del pedido
                  </p>
                  <p style={{ margin: 0, fontSize: ".78rem", color: "var(--ep-muted)", marginTop: 3 }}>
                    {isPaid ? "Pago confirmado — en preparación" : "Esperando confirmación de pago"}
                  </p>
                </div>
              </div>

              {/* Paso 2 */}
              <div style={{ display: "flex", gap: "1rem", padding: ".6rem 0", borderBottom: "1px solid var(--ep-line)", alignItems: "flex-start" }}>
                <div style={dot(isDespachado, isPaid && !isDespachado)}>
                  {isDespachado ? "✓" : "2"}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: ".88rem",
                    color: isDespachado ? "var(--ep-ink)" : isPaid ? "var(--ep-brand)" : "var(--ep-muted)"
                  }}>
                    {isRetiro ? "Listo para retirar" : "Despacho"}
                  </p>
                  <p style={{ margin: 0, fontSize: ".78rem", color: "var(--ep-muted)", marginTop: 3 }}>
                    {isDespachado
                    ? (isRetiro ? (deliveredAt ? "Retirado ✓" : "Tu pedido te espera en el local 🎉") : "Enviado — en camino a tu domicilio")
                    : "Pendiente"}
                    {info?.shipping?.trackingNumber && !isRetiro
                      ? ` · ${info.shipping.trackingNumber}${info?.shipping?.company ? ` (${info.shipping.company})` : ""}`
                      : ""}
                  </p>
                </div>
              </div>

              {/* Paso 3 — envío o retiro */}
              <div style={{ display: "flex", gap: "1rem", padding: ".6rem 0 0", alignItems: "flex-start" }}>
                <div style={dot(!!deliveredAt, isDespachado && !deliveredAt)}>
                  {deliveredAt ? "✓" : "3"}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: ".88rem", color: deliveredAt ? "var(--ep-ink)" : isDespachado ? "var(--ep-brand)" : "var(--ep-muted)" }}>
                    {isRetiro ? "Retirado" : "Entrega por transportista"}
                  </p>
                  <p style={{ margin: 0, fontSize: ".78rem", color: "var(--ep-muted)", marginTop: 3 }}>
                    {deliveredAt
                      ? (isRetiro
                          ? `Retirado el ${deliveredAt.toLocaleDateString("es-AR", { day: "numeric", month: "long" })} ✓`
                          : `Entregado el ${deliveredAt.toLocaleDateString("es-AR", { day: "numeric", month: "long" })}`)
                      : isDespachado
                        ? (isRetiro ? "Esperando que retires el pedido" : "En camino a tu domicilio")
                        : "Pendiente"}
                  </p>
                </div>
              </div>
            </div>

          </div>{/* /ep-grid */}

          {/* NOTAS DEL PEDIDO */}
          {info?.buyer?.notas && (
            <div className="ep-infobox" style={{ background: "#fff8f0", borderColor: "#fde68a", borderLeftColor: "#f59e0b" }}>
              <strong style={{ color: "#92400e" }}>📝 Notas del pedido</strong>
              <span style={{ color: "#78350f" }}>{info.buyer.notas}</span>
            </div>
          )}

          {/* INFOBOX transferencia pendiente */}
          {info.status !== "paid" && info.paymentMethod === "transfer" && (
            <div className="ep-infobox">
              <strong>⚠️ Pago por transferencia</strong>
              <span>
                Una vez que realices la transferencia, envianos el comprobante por WhatsApp
                indicando tu número de pedido <strong>{prettyOrder(info)}</strong>.
                La acreditación puede demorar hasta 24 hs hábiles.
              </span>
            </div>
          )}

          {/* ACCIONES */}
          <div className="ep-actions">
            {SELLER_WA && (
              <a href={waHref || "#"} target="_blank" rel="noreferrer" className="ep-btn ep-btn--wa">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chatear por WhatsApp
              </a>
            )}
            <a href="/pedidos" className="ep-btn ep-btn--orders">Ver mis pedidos</a>
            <a href="/" className="ep-btn ep-btn--home">← Inicio</a>
          </div>

        </>
      )}
    </main>
  );
}