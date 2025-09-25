// src/components/OrderTimeline/OrderTimeline.jsx
import "./OrderTimeline.css";

export default function OrderTimeline({ order }) {
  if (!order) return null;

  const status = String(order.status || "pending");
  const isPaid = status === "paid" || status === "approved";
  const isRejected = status === "rejected" || status === "cancelled";
  const isDespachado = Boolean(order?.shipping?.trackingNumber);
  const isDelivered = Boolean(order?.shipping?.deliveredAt); // 👈 NUEVO
  const isRetiro = order?.shipping?.method === "retiro";

  const steps = [
    { key:"creado",   label:"Pedido creado",              done:true },
    { key:"pago",     label:isRejected ? "Pago rechazado" : "Pago acreditado", done:isPaid, error:isRejected },
    { key:"prep",     label:"Preparación",                done:isPaid && (isDespachado || isRetiro), doing:isPaid && !isDespachado },
    { key:"envio",    label:isRetiro ? "Listo para retirar" : "Despachado",    done:isDespachado || (isRetiro && isPaid) },
    { key:"entrega",  label:"Entrega (transportista)",    done:isDelivered, upcoming:!isDelivered },
  ];

  return (
    <div className="otl">
      {steps.map((s) => (
        <div key={s.key} className={`otl-step ${s.done?"done":""} ${s.doing?"doing":""} ${s.error?"error":""}`}>
          <div className="otl-dot" />
          <div className="otl-line" />
          <div className="otl-label">{s.label}</div>
        </div>
      ))}
      {(order?.shipping?.trackingNumber || order?.shipping?.company || order?.shipping?.method) && (
        <div className="otl-extra">
          {order?.shipping?.trackingNumber && <div><b>Tracking:</b> {order.shipping.trackingNumber}</div>}
          {order?.shipping?.company && <div><b>Compañía:</b> {order.shipping.company}</div>}
          {order?.shipping?.method && <div><b>Método:</b> {isRetiro ? "Retiro en local" : "Envío a domicilio"}</div>}
        </div>
      )}
    </div>
  );
}
