import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "../Pago/EstadoPago.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const SELLER_WA = (import.meta.env.VITE_SELLER_PHONE || "").replace(/\D/g, "");
const AUTO_OPEN_WA =
  String(import.meta.env.VITE_AUTO_OPEN_WA_ON_PAID || "false").toLowerCase() === "true";

export default function EstadoPago() {
  const { estado } = useParams(); // exito | error | pending (pista)
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = params.get("o") || "";
  const paymentId = params.get("payment_id") || params.get("collection_id") || "";

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const esRef = useRef(null);
  const pollRef = useRef(null);
  const autoOpenedRef = useRef(false);

  const niceMoney = (n) =>
    typeof n === "number" ? n.toLocaleString("es-AR") : String(n || "");
  const shortId = (id) => (id ? String(id).slice(-6).toUpperCase() : "");
  const prettyOrder = (o) => o?.shippingTicket || `AE-${shortId(o?.id || "")}`;

  const buildAddress = (a = {}) => {
    const parts = [
      [a.calle, a.numero].filter(Boolean).join(" "),
      a.piso,
      a.ciudad,
      a.provincia,
      a.cp,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const buildWaText = (o) => {
    if (!o) return "";
    const entrega =
      o?.shipping?.method === "envio"
        ? `Envío a domicilio — ${buildAddress(o?.shipping?.address)}`
        : "Retiro en local";
    const lines = [
      "Hola 👋, acabo de hacer un pedido en Aesthetic.",
      `Pedido: ${prettyOrder(o)} (ID ${o?.id})`,
      `Total: $${niceMoney(o?.total)}`,
      `Entrega: ${entrega}`,
    ];
    return encodeURIComponent(lines.join("\n"));
  };

  const waHref = info && SELLER_WA ? `https://wa.me/${SELLER_WA}?text=${buildWaText(info)}` : null;

  // Cargar y enganchar SSE
  useEffect(() => {
    let alive = true;
    if (!orderId) {
      setLoading(false);
      return;
    }

    async function loadOnce() {
      try {
        const res = await fetch(`${API_URL}/api/payments/order/${orderId}`);
        const data = await res.json();

        // Si venís de MP y no está pago, intentá refrescar con payment_id (opcional)
        if (
          alive &&
          paymentId &&
          data?.paymentMethod === "mercadopago" &&
          data?.status !== "paid"
        ) {
          try {
            const r = await fetch(
              `${API_URL}/api/payments/mp/refresh?o=${orderId}&p=${paymentId}`
            );
            const upd = await r.json();
            setInfo(upd?.id ? upd : data);
          } catch {
            setInfo(data);
          } finally {
            setLoading(false);
          }
        } else {
          if (alive) setInfo(data);
          setLoading(false);
        }
      } catch {
        if (alive) {
          setInfo(null);
          setLoading(false);
        }
      }
    }

    // 1) Primera carga
    loadOnce();

    // 2) SSE en vivo
    try {
      const es = new EventSource(`${API_URL}/api/payments/order/${orderId}/stream`);
      esRef.current = es;
      es.addEventListener("update", (ev) => {
        try {
          const msg = JSON.parse(ev.data || "{}");
          if (msg?.status && alive) {
            setInfo((prev) => (prev ? { ...prev, status: msg.status } : prev));
          }
        } catch {}
      });
      es.onerror = () => {
        // fallback a polling suave si SSE falla
        if (!pollRef.current) {
          pollRef.current = setInterval(async () => {
            try {
              const r = await fetch(`${API_URL}/api/payments/order/${orderId}`);
              const d = await r.json();
              setInfo(d);
            } catch {}
          }, 8000);
        }
      };
    } catch {
      // si no soporta EventSource -> polling
      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${API_URL}/api/payments/order/${orderId}`);
          const d = await r.json();
          setInfo(d);
        } catch {}
      }, 8000);
    }

    return () => {
      alive = false;
      if (esRef.current) esRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orderId, paymentId]);

  // Auto-open WA cuando pasa a paid (opcional)
  useEffect(() => {
    if (!AUTO_OPEN_WA || !SELLER_WA || !info) return;
    if (autoOpenedRef.current) return;
    if (info.paymentMethod === "transfer" && info.status === "paid") {
      autoOpenedRef.current = true;
      setTimeout(() => {
        if (waHref) window.location.href = waHref;
      }, 400);
    }
  }, [info, waHref]);

  // UI según estado real (incluye RECHAZADO en transferencia)
  const ui = useMemo(() => {
    if (!info) return { titulo: "Procesando…", color: "#f59e0b", rejected: false };

    if (info.paymentMethod === "mercadopago") {
      if (info.status === "paid" || info.status === "approved") {
        return { titulo: "¡Pago aprobado!", color: "#22c55e", rejected: false };
      }
      if (info.status === "rejected" || info.status === "cancelled") {
        return { titulo: "Pago rechazado", color: "#ef4444", rejected: true };
      }
      return { titulo: "Pago pendiente…", color: "#f59e0b", rejected: false };
    }

    if (info.paymentMethod === "transfer") {
      if (info.status === "paid") {
        return { titulo: "¡Comprobante verificado!", color: "#22c55e", rejected: false };
      }
      // 👇 nuevo: rechazado por admin / webhook
      if (info.status === "cancelled" || info.status === "rejected") {
        return { titulo: "Comprobante rechazado", color: "#ef4444", rejected: true };
      }
      return { titulo: "Pedido registrado (a confirmar)", color: "#f59e0b", rejected: false };
    }

    return { titulo: "Estado del pedido", color: "#111827", rejected: false };
  }, [info]);

  return (
    <section className="wrap">
      <div className="card" style={{ borderColor: ui.color }}>
        <h2 className="title" style={{ color: ui.color }}>{ui.titulo}</h2>

        {/* Mensaje de ayuda cuando está rechazado */}
        {ui.rejected && (
          <p className="muted" style={{ color: "#7a3d3d" }}>
            No pudimos validar el pago. Revisá monto, alias/CBU y reenviá el comprobante.
            Si ya transferiste correctamente, escribinos por WhatsApp con tu número de pedido <b>{prettyOrder(info)}</b>.
          </p>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            <p className="muted">Cargando datos…</p>
          </div>
        ) : !info ? (
          <p className="muted">No pudimos cargar el pedido.</p>
        ) : (
          <>
            <div className="block">
              <h3 className="h3">Resumen</h3>
              <ul className="ul">
                <li>
                  <b>Pedido:</b> {prettyOrder(info)}
                </li>
                <li>
                  <b>ID:</b> {info.id}
                </li>
                <li>
                  <b>Estado:</b> {info.status}
                </li>
                <li>
                  <b>Método:</b> {info.paymentMethod}
                </li>
                <li>
                  <b>Total:</b> ${niceMoney(info.total)}
                </li>
              </ul>
            </div>

            <div className="block">
              <h3 className="h3">Envío</h3>

              {info?.shipping?.method === "envio" ? (
                <>
                  <p className="p">
                    <b>Ticket de envío:</b> {info.shippingTicket}{" "}
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard.writeText(info.shippingTicket || "")
                      }
                      className="copyBtn"
                    >
                      Copiar
                    </button>
                  </p>
                  <p className="p">
                    <b>Dirección:</b>{" "}
                    {buildAddress(info?.shipping?.address) || "—"}
                  </p>
                </>
              ) : (
                <p className="muted">
                  Seleccionaste <b>Retiro en local</b>. Te vamos a contactar por
                  WhatsApp para coordinar.
                </p>
              )}
            </div>

            {/* CTA WhatsApp (si hay teléfono de la tienda configurado) */}
            {SELLER_WA && (
              <div className="actions">
                <a href={waHref || "#"} target="_blank" rel="noreferrer" className="waBtn">
                  Chatear por WhatsApp
                </a>
              </div>
            )}

            <div className="actions">
              {/* Si está rechazado, damos opción de re-subir comprobante */}
              {ui.rejected && (
                <a href={`/pago?o=${encodeURIComponent(orderId)}`} className="outlineBtn">
                  Subir nuevo comprobante
                </a>
              )}
              <a href="/" className="homeBtn">
                Volver al inicio
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
