// src/components/Carrito/FormularioCheckout.jsx
import { useMemo, useState } from "react";
import "../../components/Carrito/Carrito.css";
import { useCart, precioEfectivo, PRECIO_ESPECIAL_MIN_ITEMS, PRECIO_MAYORISTA_MIN_ARS } from "./CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const BANK_ALIAS = import.meta.env.VITE_BANK_ALIAS || "SANTYGM";

const fmtARS = (n) =>
  Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const PROVINCIAS = [
  "Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba","Corrientes",
  "Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja","Mendoza","Misiones",
  "Neuquén","Río Negro","Salta","San Juan","San Luis","Santa Cruz","Santa Fe",
  "Santiago del Estero","Tierra del Fuego","Tucumán",
];

const CIUDADES = {
  "Buenos Aires": ["La Plata","San Miguel","Mar del Plata","Bahía Blanca","San Isidro","Quilmes"],
  CABA: ["Palermo","Recoleta","Caballito","Belgrano","Almagro"],
  Córdoba: ["Córdoba","Río Cuarto","Villa María","Villa Carlos Paz"],
  "Santa Fe": ["Rosario","Santa Fe","Rafaela","Venado Tuerto"],
  Mendoza: ["Mendoza","Godoy Cruz","Guaymallén","San Rafael"],
  Tucumán: ["San Miguel de Tucumán","Yerba Buena","Tafí Viejo"],
  Neuquén: ["Neuquén","San Martín de los Andes","Plottier"],
  "Río Negro": ["Viedma","General Roca","Bariloche"],
  Misiones: ["Posadas","Oberá","Iguazú"],
  Salta: ["Salta","Cafayate","Metán"],
  "San Juan": ["San Juan","Rawson","Chimbas"],
  "San Luis": ["San Luis","Villa Mercedes","Merlo"],
  Jujuy: ["San Salvador de Jujuy","Palpalá","Perico"],
  "Entre Ríos": ["Paraná","Concordia","Gualeguaychú"],
  Chaco: ["Resistencia","Barranqueras","Roque Sáenz Peña"],
  Corrientes: ["Corrientes","Goya","Paso de los Libros"],
  Chubut: ["Rawson","Trelew","Comodoro Rivadavia"],
  "Santa Cruz": ["Río Gallegos","Caleta Olivia","El Calafate"],
  "Tierra del Fuego": ["Ushuaia","Río Grande"],
  Catamarca: ["San Fernando del Valle","Tinogasta"],
  "La Pampa": ["Santa Rosa","General Pico"],
  "La Rioja": ["La Rioja","Chilecito"],
  Formosa: ["Formosa","Clorinda"],
  "Santiago del Estero": ["Santiago del Estero","La Banda"],
};

const TIER_META = {
  unitario:  { label: "Unitario",  color: "#1a1a1a", bg: "#f5f5f5",  desc: "Sin mínimo" },
  especial:  { label: "Especial",  color: "#fff",    bg: "#f97316",  desc: `+${PRECIO_ESPECIAL_MIN_ITEMS} productos` },
  mayorista: { label: "Mayorista", color: "#1a1a1a", bg: "#84e070",  desc: `+$${fmtARS(PRECIO_MAYORISTA_MIN_ARS)}` },
};

const LoadingModal = ({ loading }) => {
  return (
    <div className="loading-modal-overlay" style={{
      opacity: loading ? 1 : 0,
      pointerEvents: loading ? "auto" : "none",
      transition: "opacity 0.2s",
    }}>
      <div className="loading-modal-content">
        <div className="loader-spinner" />
        <p>Procesando tu compra. Por favor, esperá...</p>
      </div>
    </div>
  );
};

export default function FormularioCheckout({ total, productos }) {
  const { clearCart, tier } = useCart();
  const tierInfo = TIER_META[tier] || TIER_META.unitario;

  // ← CAMBIO: campos extendidos con DNI y Empresa
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    empresa: "",
    email: "",
    telefono: "",
    notas: "",
  });

  const [pago, setPago] = useState("transferencia");
  const [shippingMethod, setShippingMethod] = useState("envio");
  const [address, setAddress] = useState({
    calle: "", numero: "", piso: "", ciudad: "", provincia: "", cp: "",
  });

  const [comprobante, setComprobante] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const ciudadesDisponibles = useMemo(
    () => (address.provincia ? CIUDADES[address.provincia] || [] : []),
    [address.provincia]
  );

  // ← CAMBIO: items con precio efectivo del tier
  const itemsForOrder = useMemo(
    () => productos.map((p) => {
      const precioEf = precioEfectivo(p, tier);
      const v = p.variant || null;
      return {
        productId: p._id,
        nombre: p.nombre,
        precio: precioEf,                          // ← precio del tier
        precioUnitario: Number(p.precioUnitario ?? p.precio ?? 0),
        cantidad: Number(p.cantidad || 1),
        subtotal: precioEf * Number(p.cantidad || 1),
        ...(v ? { variant: { vid: v.vid || "", size: v.size || "", color: v.color || "" } } : {}),
        ...(p.maxStock != null ? { maxStock: Number(p.maxStock) } : {}),
      };
    }),
    [productos, tier]
  );

  // ← CAMBIO: total calculado desde items con tier
  const totalEfectivo = useMemo(
    () => itemsForOrder.reduce((s, it) => s + it.subtotal, 0),
    [itemsForOrder]
  );

  const submitTransfer = async () => {
    const fd = new FormData();
    fd.append("alias", BANK_ALIAS);
    fd.append("total", String(totalEfectivo));
    // ← CAMBIO: buyer con DNI, Empresa, Apellido y Notas
    fd.append("buyer", JSON.stringify({
      nombre:   `${form.nombre} ${form.apellido}`.trim(),
      email:    form.email,
      telefono: form.telefono,
      dni:      form.dni,
      empresa:  form.empresa,
      notas:    form.notas,
    }));
    fd.append("items", JSON.stringify(itemsForOrder));
    fd.append("shipping", JSON.stringify({ method: shippingMethod, address }));
    if (comprobante) fd.append("comprobante", comprobante);

    const res = await fetch(`${API_URL}/api/payments/transfer`, { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error enviando comprobante");

    clearCart();
    window.location.href = `/pago/exito?o=${data.orderId}`;
  };

  const submitMercadoPago = async () => {
    const payload = {
      buyer: {
        nombre:   `${form.nombre} ${form.apellido}`.trim(),
        email:    form.email,
        telefono: form.telefono,
        dni:      form.dni,
        empresa:  form.empresa,
        notas:    form.notas,
      },
      items: itemsForOrder,
      total: totalEfectivo,
      shipping: { method: shippingMethod, address },
    };

    const res = await fetch(`${API_URL}/api/payments/mp/create-preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Error iniciando Mercado Pago");

    clearCart();
    if (!data?.init_point) throw new Error("Mercado Pago no devolvió el link de pago.");
    window.location.href = data.init_point;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);
    try {
      const over = productos.find(
        (p) => p.maxStock != null && Number(p.cantidad) > Number(p.maxStock)
      );
      if (over) throw new Error(`Stock insuficiente para "${over.nombre}". Disponible: ${over.maxStock}.`);

      if (shippingMethod === "envio") {
        const ok = address.calle && address.numero && address.ciudad && address.provincia && address.cp;
        if (!ok) throw new Error("Completá la dirección de envío.");
      }

      if (pago === "transferencia") await submitTransfer();
      else if (pago === "mercadopago") await submitMercadoPago();
      else throw new Error("Método de pago no disponible.");
    } catch (err) {
      setMensaje("❌ " + (err?.message || "Error procesando el pago"));
    } finally {
      setLoading(false);
    }
  };

  const copiarAlias = async () => {
    try {
      await navigator.clipboard.writeText(BANK_ALIAS);
      setMensaje("📋 Alias copiado al portapapeles");
      setTimeout(() => setMensaje(""), 1500);
    } catch {}
  };

  return (
    <>
      <form className="checkout-form pro" onSubmit={handleSubmit}>
        <h3>Completá tus datos</h3>

        {/* ── DATOS PERSONALES — grid 2 col ── */}
        <div className="form-grid grid-2">
          <div className="form-group">
            <label>Nombre</label>
            <input className="control" name="nombre" placeholder="Ej: Ana"
              value={form.nombre} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Apellido</label>
            {/* ← CAMBIO: campo nuevo */}
            <input className="control" name="apellido" placeholder="Ej: Pérez"
              value={form.apellido} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>DNI</label>
            {/* ← CAMBIO: campo nuevo */}
            <input className="control" name="dni" placeholder="Ej: 38123456"
              inputMode="numeric" value={form.dni} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Empresa <span style={{ fontWeight: 400, color: "#9a9a9a" }}>(opcional)</span></label>
            {/* ← CAMBIO: campo nuevo */}
            <input className="control" name="empresa" placeholder="Ej: Mi Tienda SRL"
              value={form.empresa} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input className="control" name="telefono" type="tel"
              placeholder="Ej: +54 9 11 5555 5555"
              value={form.telefono} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input className="control" name="email" type="email"
              placeholder="tu@correo.com"
              value={form.email} onChange={handleChange} required />
          </div>

          {/* MÉTODO DE PAGO */}
          <div className="form-group grid-span-2">
            <label>Método de pago</label>
            <div className="pay-methods">
              <label className={`pay-card ${pago === "transferencia" ? "active" : ""}`}>
                <input type="radio" name="pago" value="transferencia"
                  checked={pago === "transferencia"} onChange={(e) => setPago(e.target.value)} />
                <div className="pay-icon" aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M3 10h18M5 10V8l7-4 7 4v2M6 10v8M10 10v8M14 10v8M18 10v8M4 20h16"
                      fill="none" stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="pay-title">Transferencia</div>
                <div className="pay-sub">Alias: <strong>{BANK_ALIAS.toUpperCase()}</strong></div>
              </label>

              <label className={`pay-card pay-card--mp ${pago === "mercadopago" ? "active" : ""}`}>
                <input type="radio" name="pago" value="mercadopago"
                  checked={pago === "mercadopago"} onChange={(e) => setPago(e.target.value)} />
                <div className="pay-icon" aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M7 12c2.2-2.2 7.8-2.2 10 0" fill="none" stroke="currentColor"
                      strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="pay-title-1">Mercado Pago</div>
                <div className="pay-sub1">Tarjeta / Débito / Transferencia</div>
              </label>

              <label className="pay-card disabled" title="Próximamente">
                <input type="radio" name="pago" value="tarjeta" disabled />
                <div className="pay-icon" aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <rect x="3" y="6" width="18" height="12" rx="2.5" fill="none"
                      stroke="currentColor" strokeWidth="1.6" />
                    <rect x="6" y="12" width="6" height="2.5" rx="1.2" />
                  </svg>
                </div>
                <div className="pay-title-2">Tarjeta</div>
                <div className="pay-badge2">Próximamente</div>
              </label>
            </div>
          </div>
        </div>

        {/* ── ENTREGA ── */}
        <div className="form-group">
          <label>Entrega</label>
          <div className="shipping-options">
            <label className={`ship-card ${shippingMethod === "envio" ? "active" : ""}`}>
              <input type="radio" name="shipping" value="envio"
                checked={shippingMethod === "envio"} onChange={() => setShippingMethod("envio")} />
              <div className="ship-title">Envío (coordinamos por WhatsApp)</div>
              <div className="ship-text">Lo recibís en tu domicilio</div>
            </label>
            <label className={`ship-card ${shippingMethod === "retiro" ? "active" : ""}`}>
              <input type="radio" name="shipping" value="retiro"
                checked={shippingMethod === "retiro"} onChange={() => setShippingMethod("retiro")} />
              <div className="ship-title">Retiro en local</div>
              <div className="ship-text">Coordinamos por WhatsApp</div>
            </label>
          </div>
        </div>

        {/* ── DIRECCIÓN ── */}
        {shippingMethod === "envio" && (
          <div className="shipping-form-grid compact">
            <div className="form-group grid-span-2">
              <label>Calle</label>
              <input className="control" placeholder="Ej: Av. Siempreviva"
                value={address.calle} onChange={(e) => setAddress({ ...address, calle: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Número</label>
              <input className="control" placeholder="1234"
                value={address.numero} onChange={(e) => setAddress({ ...address, numero: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Piso/Depto (opcional)</label>
              <input className="control" placeholder="Piso 2, Dto A"
                value={address.piso} onChange={(e) => setAddress({ ...address, piso: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Provincia</label>
              <select className="control" value={address.provincia}
                onChange={(e) => setAddress({ ...address, provincia: e.target.value, ciudad: "" })} required>
                <option value="" disabled>Seleccioná provincia</option>
                {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ciudad</label>
              <select className="control" value={address.ciudad}
                onChange={(e) => setAddress({ ...address, ciudad: e.target.value })}
                required disabled={!address.provincia}>
                <option value="" disabled>
                  {address.provincia ? "Seleccioná ciudad" : "Primero elegí provincia"}
                </option>
                {ciudadesDisponibles.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Código Postal</label>
              <input className="control" placeholder="Ej: 1663"
                value={address.cp} onChange={(e) => setAddress({ ...address, cp: e.target.value })} required />
            </div>
          </div>
        )}

        {/* ── NOTAS ← CAMBIO: campo nuevo ── */}
        <div className="form-group">
          <label>Notas del pedido <span style={{ fontWeight: 400, color: "#9a9a9a" }}>(opcional)</span></label>
          <textarea className="control" name="notas" placeholder="Instrucciones especiales, variantes, etc."
            value={form.notas} onChange={handleChange}
            style={{ height: 72, resize: "vertical", paddingTop: ".75rem" }} />
        </div>

        {/* ── TRANSFERENCIA: alias + comprobante ── */}
        {pago === "transferencia" && (
          <div className="form-grid grid-2">
            <div className="form-group grid-span-2">
              <label>Alias para transferir</label>
              <div className="alias-display" onClick={copiarAlias} role="button" tabIndex={0}>
                <span className="alias-text">{BANK_ALIAS.toUpperCase()}</span>
                <button type="button" className="copy-btn" onClick={copiarAlias}>Copiar</button>
              </div>
              <small className="alias-hint">Tocá el alias o el botón para copiarlo.</small>
            </div>
            <div className="form-group grid-span-2">
              <label>Comprobante (JPG/PNG/PDF)</label>
              <input className="control-file" type="file" accept="image/*,application/pdf"
                onChange={(e) => setComprobante(e.target.files?.[0] || null)} />
            </div>
          </div>
        )}

        {/* ── RESUMEN CON TIER ← CAMBIO ── */}
        <div className="summary-card">
          {/* Badge del tier */}
          <div className="sum-tier-badge" style={{ background: tierInfo.bg, color: tierInfo.color }}>
            {tierInfo.label} — {tierInfo.desc}
          </div>

          {/* Detalle por producto */}
          <div className="sum-items">
            {itemsForOrder.map((it, i) => (
              <div key={i} className="sum-item-row">
                <span className="sum-item-name">{it.nombre} x{it.cantidad}</span>
                <span className="sum-item-price">${fmtARS(it.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="sum-divider" />

          <div className="sum-row">
            <span>Total ({tier})</span>
            <strong>${fmtARS(totalEfectivo)}</strong>
          </div>
        </div>

        <button type="submit" className="checkout-btn" disabled={loading}>
          {loading ? "Procesando…" : "Confirmar compra"}
        </button>

        {mensaje && <div className="mensaje-exito">{mensaje}</div>}
      </form>

      <LoadingModal loading={loading} />
    </>
  );
}