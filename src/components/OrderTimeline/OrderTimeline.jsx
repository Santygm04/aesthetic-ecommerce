// src/components/OrderTimeline/OrderTimeline.jsx
import "./OrderTimeline.css";

export default function OrderTimeline({ order }) {
  if (!order) return null;

  const status = String(order.status || "pending");
  const isPaid = status === "paid" || status === "approved";
  const isRejected = status === "rejected" || status === "cancelled";

  const isRetiro = order?.shipping?.method === "retiro";

  // ✅ DESPACHADO / LISTO: SOLO cuando el admin lo marca (ship) o hay tracking
  // - En envío: normalmente ponés trackingNumber o shippedAt
  // - En retiro: al tocar "DESPACHAR" (tu endpoint /order/:id/ship) setea shippedAt
  const isDespachado = Boolean(order?.shipping?.trackingNumber || order?.shipping?.shippedAt);

  // ✅ Entregado: SOLO cuando admin marca delivered
  const isEntregado = Boolean(order?.shipping?.deliveredAt);

  // ✅ Preparación: se completa cuando ya está despachado/listo (o entregado).
  //   Si está pago pero todavía no despachado/listo, queda "doing".
  const prepDone = isPaid && (isDespachado || isEntregado);
  const prepDoing = isPaid && !isDespachado && !isEntregado && !isRejected;

  const steps = [
    { key: "creado", label: "Pedido creado", done: true },

    {
      key: "pago",
      label: isRejected ? "Pago rechazado" : "Pago acreditado",
      done: isPaid,
      error: isRejected,
    },

    {
      key: "prep",
      label: "Preparación",
      done: prepDone,
      doing: prepDoing,
    },

    {
      key: "envio",
      label: isRetiro ? "Listo para retirar" : "Despachado",
      // ✅ IMPORTANTE: ya NO usamos (isRetiro && isPaid)
      done: isDespachado,
      upcoming: !isDespachado,
    },

    {
      key: "entrega",
      label: "Entrega (transportista)",
      // En retiro, "Entregado" puede significar "retirado"
      done: isEntregado,
      upcoming: !isEntregado,
    },
  ];

  return (
    <div className="otl">
      {steps.map((s) => (
        <div
          key={s.key}
          className={`otl-step ${s.done ? "done" : ""} ${s.doing ? "doing" : ""} ${
            s.error ? "error" : ""
          }`}
        >
          <div className="otl-dot" />
          <div className="otl-line" />
          <div className="otl-label">{s.label}</div>
        </div>
      ))}

      {(order?.shipping?.trackingNumber ||
        order?.shipping?.company ||
        order?.shipping?.method ||
        order?.shipping?.shippedAt ||
        order?.shipping?.deliveredAt) && (
        <div className="otl-extra">
          {order?.shipping?.trackingNumber && (
            <div>
              <b>Tracking:</b> {order.shipping.trackingNumber}
            </div>
          )}

          {order?.shipping?.company && (
            <div>
              <b>Compañía:</b> {order.shipping.company}
            </div>
          )}

          {order?.shipping?.method && (
            <div>
              <b>Método:</b> {isRetiro ? "Retiro en local" : "Envío a domicilio"}
            </div>
          )}

          {order?.shipping?.shippedAt && (
            <div>
              <b>{isRetiro ? "Listo para retirar:" : "Despachado:"}</b>{" "}
              {new Date(order.shipping.shippedAt).toLocaleString()}
            </div>
          )}

          {order?.shipping?.deliveredAt && (
            <div>
              <b>{isRetiro ? "Retirado:" : "Entregado:"}</b>{" "}
              {new Date(order.shipping.deliveredAt).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}