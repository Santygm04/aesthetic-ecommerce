// src/pages/PagoExito.jsx
import { useEffect, useState } from "react";
import { addOrderRef } from "../utils/ordersLocal.js";

export default function PagoExito() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("o");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | waiting | paid | rejected | notfound

  useEffect(() => {
    let timer;

    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/payments/order/${orderId}`);
        if (res.status === 404) {
          setStatus("notfound");
          return;
        }
        const data = await res.json();
        setOrder(data);

        if (data.status === "paid") {
          setStatus("paid");
          return;
        }
        if (data.status === "cancelled" || data.mp?.status === "rejected") {
          setStatus("rejected");
          return;
        }

        // sigue pendiente: esperamos webhook/confirmación
        setStatus("waiting");
        timer = setTimeout(load, 2500);
      } catch {
        // reintentar suave
        timer = setTimeout(load, 2500);
      }
    }

    if (orderId) load();
    return () => clearTimeout(timer);
  }, [orderId]);

  if (!orderId) {
    return <div className="container">Falta el ID de la orden.</div>;
  }

  if (status === "loading" || status === "waiting") {
    return (
      <div className="container">
        <h2>Procesando tu pago…</h2>
        <p>Estamos confirmando con Mercado Pago. Esto puede tardar unos segundos.</p>
      </div>
    );
  }

  if (status === "notfound") {
    return <div className="container">No encontramos la orden.</div>;
  }

  if (status === "rejected") {
    return (
      <div className="container">
        <h2 style={{ color: "#c51d34" }}>Pago rechazado</h2>
        <p>Pedido: {orderId}</p>
        <a href="/">Volver al inicio</a>
      </div>
    );
  }

  // paid ✅
  const envio = order?.shipping?.method === "envio";
  const ticket = order?.shippingTicket;

  return (
    <div className="container">
      <h2 style={{ color: "#16a34a" }}>¡Pago aprobado!</h2>

      <div className="card">
        <p><strong>Pedido:</strong> {order.id || orderId}</p>
        <p><strong>Estado:</strong> {order.status}</p>
        <p><strong>Método:</strong> {order.paymentMethod}</p>
        <p><strong>Total:</strong> ${order.total}</p>

        <h3>Envío</h3>
        <p>
          <strong>Ticket de envío:</strong> {ticket}{" "}
          <button
            onClick={() => navigator.clipboard.writeText(ticket || "")}
            disabled={!ticket}
          >
            Copiar
          </button>
        </p>

        {envio ? (
          <>
            <p>Seleccionaste <strong>Envío a domicilio (Andreani)</strong>.</p>
            <small>Te avisamos por mail/WhatsApp cuando esté despachado.</small>
          </>
        ) : (
          <>
            <p>Seleccionaste <strong>Retiro en local</strong>.</p>
            <small>Te vamos a contactar por WhatsApp para coordinar el retiro.</small>
          </>
        )}
      </div>

      <a className="btn" href="/">Volver al inicio</a>
    </div>
  );
}
