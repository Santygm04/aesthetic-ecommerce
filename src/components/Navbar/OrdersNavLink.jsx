// src/components/Navbar/OrdersNavLink.jsx
import { useEffect, useState } from "react";
import { getSavedOrderRefs } from "../../utils/ordersLocal.js";
import {
  getOrdersUnseen, listenOrdersBadge, noteOrderUpdate,
  getKnownOrderStatuses, rememberOrderStatuses
} from "../../utils/ordersBadge.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function OrdersNavLink(){
  const [unseen, setUnseen] = useState(getOrdersUnseen());

  // escuchar eventos (Orders/EstadoPago pueden dispararlos)
  useEffect(() => listenOrdersBadge(setUnseen), []);

  // watcher muy liviano: cada 25s consulta estados guardados en este dispositivo
  useEffect(() => {
    let timer;
    const tick = async () => {
      try{
        const refs = getSavedOrderRefs();
        const ids = refs.map(r=>r._id).filter(Boolean);
        const codes = refs.map(r=>r.code).filter(Boolean);
        if(!ids.length && !codes.length) return;

        const p = new URLSearchParams();
        if(ids.length) p.set("ids", ids.join(","));
        if(codes.length) p.set("codes", codes.join(","));

        const r = await fetch(`${API_URL}/api/payments/orders/public/by-ids?${p.toString()}`);
        const arr = await r.json();

        const prev = getKnownOrderStatuses();
        const next = {};
        (arr||[]).forEach(o=>{
          next[o._id] = o.status;
          if (prev[o._id] && prev[o._id] !== o.status){
            // cambio detectado -> notificar
            noteOrderUpdate({ id:o._id, status:o.status });
          }
        });
        rememberOrderStatuses(next);
      }catch{}
    };
    tick();
    timer = setInterval(tick, 25000);
    return ()=> clearInterval(timer);
  }, []);

  return (
    <a href="/pedidos" className="nav-link nav-link--orders">
      Mis pedidos
      {unseen>0 && (
        <span className="nav-orders-badge" aria-label={`${unseen} novedades`}>{unseen}</span>
      )}
    </a>
  );
}
