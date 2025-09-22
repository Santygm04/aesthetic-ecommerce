// src/pages/Orders/Orders.jsx
import "./Orders.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSavedOrderRefs, addOrderRef, removeOrderRef } from "../../utils/ordersLocal.js";
import { clearOrdersBadge, noteOrderUpdate, rememberOrderStatuses } from "../../utils/ordersBadge.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Badge({ children, type }) { return <span className={`badge ${type||""}`}>{children}</span>; }
const money = (n)=> Number(n||0).toLocaleString("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0});
const shortCode = (o)=> o?.shippingTicket || (o?.orderNumber ? `#${o.orderNumber}` : o?._id);

export default function Orders(){
  const [refs, setRefs] = useState(getSavedOrderRefs());
  const ids = useMemo(()=> refs.map(r=>r._id).filter(Boolean), [refs]);
  const codes = useMemo(()=> refs.map(r=>r.code).filter(Boolean), [refs]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lookup, setLookup] = useState({ code:"", emailOrPhone:"" });

  // ---- NOTIFICACIONES EN VIVO ----
  const esMapRef = useRef(new Map());
  const lastStatusRef = useRef(new Map());
  const askedNotifRef = useRef(false);
  const [toasts, setToasts] = useState([]);

  // limpiar badge al abrir "Mis pedidos"
  useEffect(()=> { clearOrdersBadge(); }, []);

  function askNotificationPermissionOnce(){
    if (askedNotifRef.current) return;
    askedNotifRef.current = true;
    try{
      if ("Notification" in window && Notification.permission === "default"){
        Notification.requestPermission().catch(()=>{});
      }
    }catch{}
  }
  function notifyBrowser(title, body){
    try{
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      new Notification(title, { body });
    }catch{}
  }
  function pushToast(text, type="info"){
    const id = Math.random().toString(36).slice(2);
    setToasts(t=>[...t, { id, text, type }]);
    setTimeout(()=> setToasts(t=> t.filter(x=>x.id!==id)), 4200);
  }

  async function fetchOrders(){
    if(!ids.length && !codes.length){ setOrders([]); return; }
    setLoading(true);
    try{
      const params = new URLSearchParams();
      if(ids.length) params.set("ids", ids.join(","));
      if(codes.length) params.set("codes", codes.join(","));
      const r = await fetch(`${API_URL}/api/payments/orders/public/by-ids?${params.toString()}`);
      const data = await r.json();
      const arr = Array.isArray(data)? data : [];
      setOrders(arr);
      // snapshot de estados para el watcher global del navbar
      const map = {};
      arr.forEach(o=>{
        if(o?._id && o?.status){
          lastStatusRef.current.set(o._id, o.status);
          map[o._id] = o.status;
        }
      });
      rememberOrderStatuses(map);
    }catch{ /* ignore */ } finally{ setLoading(false); }
  }

  useEffect(()=>{ fetchOrders(); const t=setInterval(fetchOrders,20000); return ()=>clearInterval(t); }, [refs.length]);

  // SSE por cada ID
  useEffect(()=>{
    // cerrar desuscritos
    for (const [id, es] of esMapRef.current.entries()){
      if (!ids.includes(id)){ try{ es.close(); }catch{} esMapRef.current.delete(id); lastStatusRef.current.delete(id); }
    }
    // abrir nuevos
    ids.forEach(id=>{
      if (esMapRef.current.has(id)) return;
      try{
        const es = new EventSource(`${API_URL}/api/payments/order/${id}/stream`);
        es.addEventListener("update", (ev)=>{
          try{
            const msg = JSON.parse(ev.data||"{}");
            if (!msg?.status) return;

            setOrders(prev => prev.map(o => o._id===id ? {...o, status: msg.status} : o));
            const prevStatus = lastStatusRef.current.get(id);
            if (prevStatus && prevStatus !== msg.status){
              const o = orders.find(x=>x._id===id) || {};
              const code = shortCode(o);
              const nice =
                msg.status==="paid"||msg.status==="approved" ? "¡Pago aprobado!"
                : msg.status==="pending" ? "Pago pendiente"
                : msg.status==="cancelled"||msg.status==="rejected" ? "Pago rechazado"
                : `Estado: ${msg.status}`;

              // toasts + notificación del navegador
              pushToast(`Pedido ${code}: ${nice}`, msg.status==="paid"||msg.status==="approved" ? "success" : (msg.status==="cancelled"||msg.status==="rejected" ? "error" : "info"));
              if (document.hidden) notifyBrowser(`Pedido ${code}`, nice);

              // 👇 avisar al navbar (badge)
              noteOrderUpdate({ id, status: msg.status });
            }
            lastStatusRef.current.set(id, msg.status);
          }catch{}
        });
        es.onerror = ()=>{};
        esMapRef.current.set(id, es);
        askNotificationPermissionOnce();
      }catch{}
    });

    return ()=>{
      for (const es of esMapRef.current.values()){ try{ es.close(); }catch{} }
      esMapRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  async function onLookup(e){
    e.preventDefault();
    if(!lookup.code.trim()) return;
    try{
      setLoading(true);
      const p = new URLSearchParams({ code: lookup.code.trim(), emailOrPhone: lookup.emailOrPhone.trim() });
      const r = await fetch(`${API_URL}/api/payments/orders/public/lookup?${p.toString()}`);
      const o = await r.json();
      if(o && o._id){ addOrderRef({ _id:o._id, code: shortCode(o), createdAt: o.createdAt }); setRefs(getSavedOrderRefs()); }
      else alert("No pudimos encontrar ese pedido.");
    }catch{ alert("No pudimos buscar ese pedido."); } finally{ setLoading(false); setLookup({code:"",emailOrPhone:""}); }
  }

  const remove = (idOrCode)=> setRefs(removeOrderRef(idOrCode));
  const statusBadge = (s)=>({ paid:"st-paid", approved:"st-paid", pending:"st-pending", cancelled:"st-cancelled", rejected:"st-cancelled" }[s]||"");

  return (
    <section className="orders-wrap">
      <h2 className="orders-title">Mis pedidos</h2>
      <p className="orders-sub">Seguimiento en tiempo real de tus compras.</p>

      <form className="orders-lookup" onSubmit={onLookup}>
        <input placeholder="Código (ticket AE-YYYYMMDD-XXXX o #número)" value={lookup.code} onChange={e=>setLookup(v=>({...v,code:e.target.value}))}/>
        <input placeholder="Email o teléfono (opcional)" value={lookup.emailOrPhone} onChange={e=>setLookup(v=>({...v,emailOrPhone:e.target.value}))}/>
        <button className="btn" type="submit">Buscar</button>
      </form>

      {loading && <div className="orders-msg">Actualizando…</div>}
      {!loading && orders.length===0 && (
        <div className="orders-empty">
          <p>No hay pedidos guardados en este dispositivo.</p>
          <p className="muted">Después de comprar, te van a aparecer acá.</p>
        </div>
      )}

      <div className="orders-list">
        {orders.map(o=>(
          <article key={o._id} className="order-card">
            <header className="order-head">
              <div>
                <div className="order-code">Pedido <b>{shortCode(o)}</b></div>
                <div className="order-date">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <Badge type={statusBadge(o.status)}>{o.status}</Badge>
            </header>

            <div className="order-body">
              <ul className="order-items">
                {(o.items||[]).slice(0,6).map((it,i)=>(
                  <li key={i}>
                    <span className="name">{it.nombre}</span>
                    {(it?.variant?.size || it?.variant?.color) && (
                      <span className="muted"> ({[it?.variant?.size,it?.variant?.color].filter(Boolean).join(" / ")})</span>
                    )}
                    <span className="muted"> x{it.cantidad}</span>
                  </li>
                ))}
                {o.items?.length>6 && <li className="muted">…</li>}
              </ul>
              <div className="order-info">
                <div><span className="muted">Total:</span> <b>{money(o.total)}</b></div>
                <div><span className="muted">Pago:</span> {o.paymentMethod}</div>
                <div><span className="muted">Entrega:</span> {o.shipping?.method==="envio"?"Envío a domicilio":"Retiro en local"}</div>
              </div>
            </div>

            <footer className="order-actions">
              <a className="btn btn--ghost" href={`/pago/estado?o=${encodeURIComponent(o._id)}`}>Ver detalle</a>
              <button type="button" className="btn btn--ghost" onClick={()=>remove(o._id || shortCode(o))}>Quitar</button>
            </footer>
          </article>
        ))}
      </div>

      {/* Toasters */}
      <div className="toast-wrap" aria-live="polite" aria-atomic="true">
        {toasts.map(t=>(
          <div key={t.id} className={`toast ${t.type||"info"}`}>{t.text}</div>
        ))}
      </div>
    </section>
  );
}
