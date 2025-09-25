// src/components/OrderTimeline/OrderTimeline.jsx
import "./OrderTimeline.css";

export default function OrderTimeline({ order }) {
  if (!order) return null;

  const status = String(order.status || "pending");
  const isPaid = status === "paid" || status === "approved";
  const isRejected = status === "rejected" || status === "cancelled";
  // 👇 ahora también cuenta shippedAt (sin tracking)
  const isDespachado = Boolean(order?.shipping?.trackingNumber || order?.shipping?.shippedAt);
  const isRetiro = order?.shipping?.method === "retiro";
  const isEntregado = Boolean(order?.shipping?.deliveredAt);

  const steps = [
    { key:"creado",   label:"Pedido creado",              done:true },
    { key:"pago",     label:isRejected ? "Pago rechazado" : "Pago acreditado", done:isPaid, error:isRejected },
    { key:"prep",     label:"Preparación",                done:isPaid && (isDespachado || isRetiro), doing:isPaid && !isDespachado && !isEntregado },
    { key:"envio",    label:isRetiro ? "Listo para retirar" : "Despachado",    done:isDespachado || (isRetiro && isPaid) },
    { key:"entrega",  label:"Entrega (transportista)",    done:isEntregado, upcoming:!isEntregado },
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
      {(order?.shipping?.trackingNumber || order?.shipping?.company || order?.shipping?.method || order?.shipping?.deliveredAt) && (
        <div className="otl-extra">
          {order?.shipping?.trackingNumber && <div><b>Tracking:</b> {order.shipping.trackingNumber}</div>}
          {order?.shipping?.company && <div><b>Compañía:</b> {order.shipping.company}</div>}
          {order?.shipping?.method && <div><b>Método:</b> {isRetiro ? "Retiro en local" : "Envío a domicilio"}</div>}
          {order?.shipping?.deliveredAt && <div><b>Entregado:</b> {new Date(order.shipping.deliveredAt).toLocaleString()}</div>}
        </div>
      )}
    </div>
  );
}
