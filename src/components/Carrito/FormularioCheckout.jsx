// src/components/Carrito/FormularioCheckout.jsx
import { useMemo, useState } from "react";
import "../../components/Carrito/Carrito.css";
import { useCart, precioEfectivo, PRECIO_ESPECIAL_MIN_ITEMS, PRECIO_MAYORISTA_MIN_ARS } from "./CartContext";
import { addOrderRef } from "../../utils/ordersLocal.js";

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
  "Buenos Aires": ["Adolfo Alsina","Adolfo Gonzales Chaves","Alberti","Almirante Brown","Arrecifes","Avellaneda","Ayacucho","Azul","Bahía Blanca","Balcarce","Baradero","Benito Juárez","Berazategui","Berisso","Bolívar","Bragado","Brandsen","Campana","Cañuelas","Capitán Sarmiento","Carlos Casares","Carlos Tejedor","Carmen de Areco","Castelli","Chacabuco","Chascomús","Chivilcoy","Colón","Coronel Dorrego","Coronel Pringles","Coronel Rosales","Coronel Suárez","Daireaux","Dolores","Ensenada","Escobar","Esteban Echeverría","Exaltación de la Cruz","Ezeiza","Florencio Varela","Florentino Ameghino","General Alvarado","General Alvear","General Arenales","General Belgrano","General Guido","General Juan Madariaga","General La Madrid","General Las Heras","General Lavalle","General Paz","General Pinto","General Pueyrredón","General Rodríguez","General San Martín","General Sarmiento","General Viamonte","General Villegas","Guaminí","Hipólito Yrigoyen","Hurlingham","Ituzaingó","José C. Paz","Junín","La Costa","La Matanza","La Plata","Lanús","Laprida","Las Flores","Leandro N. Alem","Lincoln","Lomas de Zamora","Luján","Magdalena","Maipú","Malvinas Argentinas","Mar Chiquita","Marcos Paz","Mercedes","Merlo","Monte","Monte Hermoso","Moreno","Morón","Navarro","Necochea","Nueve de Julio","Olavarría","Patagones","Pehuajó","Pellegrini","Pergamino","Pila","Pilar","Pinamar","Presidente Perón","Puán","Punta Indio","Quilmes","Ramallo","Rauch","Rivadavia","Rojas","Roque Pérez","Saavedra","Saladillo","Salliqueló","Salto","San Andrés de Giles","San Antonio de Areco","San Cayetano","San Fernando","San Isidro","San Miguel","San Nicolás","San Pedro","San Vicente","Suipacha","Tandil","Tapalqué","Tigre","Tordillo","Tornquist","Trenque Lauquen","Tres Arroyos","Tres de Febrero","Tres Lomas","Vicente López","Villa Gesell","Villarino","Zárate"],
  CABA: ["Agronomía","Almagro","Balvanera","Barracas","Belgrano","Boedo","Caballito","Chacarita","Coghlan","Colegiales","Constitución","Flores","Floresta","La Boca","La Paternal","Liniers","Mataderos","Monte Castro","Montserrat","Nueva Pompeya","Núñez","Palermo","Parque Avellaneda","Parque Chacabuco","Parque Chas","Parque Patricios","Puerto Madero","Recoleta","Retiro","Saavedra","San Cristóbal","San Nicolás","San Telmo","Vélez Sársfield","Versalles","Villa Crespo","Villa del Parque","Villa Devoto","Villa General Mitre","Villa Lugano","Villa Luro","Villa Ortúzar","Villa Pueyrredón","Villa Real","Villa Riachuelo","Villa Santa Rita","Villa Soldati","Villa Urquiza"],
  Córdoba: ["Córdoba","Río Cuarto","San Francisco","Villa María","Villa Carlos Paz","Cosquín","La Falda","Alta Gracia","Bell Ville","Jesús María","Laboulaye","Marcos Juárez","Oncativo","Río Ceballos","Unquillo","Villa Allende","Villa del Totoral","Villa Dolores","Villa General Belgrano","Cruz del Eje","Dean Funes","Huerta Grande","La Carlota","Mina Clavero","Morteros","Río Segundo","Río Tercero","Sampacho","San Marcos Sierras","Villa Cura Brochero","Leones","Morrison","Hernando","Monte Cristo","Salsipuedes","Bialet Massé","Capilla del Monte","Las Varillas","Porteña","Sacanta"],
  "Santa Fe": ["Rosario","Santa Fe","Rafaela","Venado Tuerto","Reconquista","Santo Tomé","Esperanza","Casilda","Cañada de Gómez","San Lorenzo","Firmat","Rufino","Las Rosas","Arroyito","Tostado","Vera","Gálvez","Sunchales","Villa Constitución","Villa Gobernador Gálvez","Avellaneda","Ceres","Coronda","San Genaro","San Justo","Sastre","Las Colonias","Frontera","Malabrigo"],
  Mendoza: ["Mendoza","Godoy Cruz","Guaymallén","Las Heras","Luján de Cuyo","Maipú","San Rafael","General Alvear","Malargüe","Rivadavia","Junín","La Paz","Lavalle","Rodeo del Medio","San Martín","Tunuyán","Tupungato","San Carlos","Ciudad","Palmira","Dorrego"],
  Tucumán: ["San Miguel de Tucumán","Yerba Buena","Tafí Viejo","Concepción","Banda del Río Salí","Aguilares","Alderetes","Famaillá","Monteros","Simoca","Lules","San Isidro de Lules","Bella Vista","Graneros","Juan Bautista Alberdi","Leales","Tafí del Valle","Trancas","Burruyacu","La Cocha","Los Díaz"],
  Salta: ["Salta","Tartagal","Orán","Rosario de la Frontera","Metán","Güemes","Cafayate","General Güemes","Joaquín V. González","Embarcación","Rivadavia","Pichanal","Salvador Mazza","San Ramón de la Nueva Orán"],
  Jujuy: ["San Salvador de Jujuy","Palpalá","San Pedro de Jujuy","Libertador General San Martín","Perico","Humahuaca","Tilcara","La Quiaca","Abra Pampa","El Carmen"],
  Misiones: ["Posadas","Oberá","Eldorado","Puerto Iguazú","Leandro N. Alem","Apóstoles","Montecarlo","San Vicente","Jardín América","Aristóbulo del Valle"],
  "Entre Ríos": ["Paraná","Concordia","Gualeguaychú","Concepción del Uruguay","Villaguay","Federación","Colón","Gualeguay","Victoria","La Paz","Chajarí","Crespo","San Salvador","Diamante"],
  Chaco: ["Resistencia","Presidencia Roque Sáenz Peña","Barranqueras","Villa Ángela","Charata","Las Breñas","General San Martín","Quitilipi","Fontana","Juan José Castelli"],
  Corrientes: ["Corrientes","Goya","Curuzú Cuatiá","Paso de los Libres","Mercedes","Monte Caseros","Esquina","Bella Vista","Ituzaingó","Santo Tomé"],
  Neuquén: ["Neuquén","San Martín de los Andes","Zapala","Junín de los Andes","Plottier","Cutral Có","Plaza Huincul","Cipolletti","Centenario","Rincón de los Sauces"],
  "Río Negro": ["Viedma","General Roca","Bariloche","Cipolletti","Allen","Catriel","El Bolsón","Cinco Saltos","Choele Choel","San Antonio Oeste"],
  Chubut: ["Rawson","Trelew","Comodoro Rivadavia","Puerto Madryn","Esquel","Río Gallegos","Sarmiento","Puerto Pirámides","Gaiman"],
  "Santa Cruz": ["Río Gallegos","Caleta Olivia","El Calafate","Puerto Madryn","Perito Moreno","Los Antiguos","Gobernador Gregores","Las Heras","Puerto San Julián"],
  "Tierra del Fuego": ["Ushuaia","Río Grande","Tolhuin"],
  "San Juan": ["San Juan","Rawson","Chimbas","Rivadavia","Santa Lucía","Pocito","Caucete","Albardón","Angaco","Calingasta","Iglesia","Jáchal","San Martín","Sarmiento","Valle Fértil","Zonda"],
  "San Luis": ["San Luis","Villa Mercedes","Merlo","Quines","Juana Koslay","Potrero de los Funes","La Punta","Justo Daract","Arizona","Buena Esperanza"],
  "La Rioja": ["La Rioja","Chilecito","Aimogasta","Chamical","Chepes","General Ángel Vicente Peñaloza","Vinchina"],
  Catamarca: ["San Fernando del Valle de Catamarca","Tinogasta","Santa María","Andalgalá","Belén","Recreo","San Isidro","Pomán","La Paz","Fiambalá"],
  Formosa: ["Formosa","Clorinda","Pirané","Las Lomitas","Ingeniero Juárez","General Lucio Victorio Mansilla"],
  "La Pampa": ["Santa Rosa","General Pico","Toay","Realicó","General Acha","Eduardo Castex","Victorica","Macachín","Winifreda"],
  "Santiago del Estero": ["Santiago del Estero","La Banda","Termas de Río Hondo","Añatuya","Frías","Loreto","Monte Quemado","Quimilí","Suncho Corral"],
  Peluquería: [],
  "Buenos Aires": [],
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
      precio: precioEf,
      precioUnitario: Number(p.precioUnitario ?? p.precio ?? 0),
      cantidad: Number(p.cantidad || 1),
      subtotal: precioEf * Number(p.cantidad || 1),
      distribucionTonos: p.distribucionTonos || null,
      unidadesPorCaja: p.unidadesPorCaja || null,

      ...(v ? {
  variant: {
    vid:   v.vid   || "",
    size:  v.size  || "",
    color: v.color || "",
    tono:  v.tono  || "",
  }
} : {}),

      ...(p.maxStock != null ? {
        maxStock: Number(p.maxStock)
      } : {}),

      // ✅ 🔥 AGREGAR ESTO (EL FIX CLAVE)
      ...(p.distribucionTonos ? {
        distribucionTonos: p.distribucionTonos
      } : {}),

      ...(p.unidadesPorCaja ? {
        unidadesPorCaja: p.unidadesPorCaja
      } : {}),
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
    try {
      addOrderRef({
        _id: data.orderId,
        code: data.ticket || data.shippingTicket || null,
        createdAt: Date.now(),
      });
    } catch {}
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
    try {
      addOrderRef({
        _id: data.orderId,
        code: data.ticket || data.shippingTicket || null,
        createdAt: Date.now(),
      });
    } catch {}
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

              <label className="pay-card disabled" title="Próximamente">
                <input type="radio" name="pago" value="mercadopago" disabled />
                <div className="pay-icon" aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M7 12c2.2-2.2 7.8-2.2 10 0" fill="none" stroke="currentColor"
                    strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="pay-title-1">Mercado Pago</div>
                <div className="pay-badge2">Próximamente</div>
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
            <div className="form-group" style={{ position: "relative" }}>
              <label>Ciudad</label>
              <input
                className="control"
                placeholder={address.provincia ? "Buscá tu ciudad..." : "Primero elegí provincia"}
                value={address.ciudad}
                disabled={!address.provincia}
                onChange={(e) => setAddress({ ...address, ciudad: e.target.value })}
                required
                autoComplete="off"
              />
              {address.provincia && address.ciudad && ciudadesDisponibles.filter(c =>
                c.toLowerCase().includes(address.ciudad.toLowerCase()) && c !== address.ciudad
              ).length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                  background: "#fff", border: "2px solid #f4c5df", borderRadius: "0 0 12px 12px",
                  maxHeight: 180, overflowY: "auto", boxShadow: "0 8px 20px rgba(255,46,166,.12)"
                }}>
                  {ciudadesDisponibles
                    .filter(c => c.toLowerCase().includes(address.ciudad.toLowerCase()) && c !== address.ciudad)
                    .slice(0, 8)
                    .map(c => (
                      <div key={c} onClick={() => setAddress({ ...address, ciudad: c })}
                        style={{
                          padding: ".55rem .95rem", cursor: "pointer", fontSize: ".9rem",
                          color: "#374151", borderBottom: "1px solid #ffe0f0",
                          transition: "background .12s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fff0f8"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                      >
                        {c}
                      </div>
                    ))}
                </div>
              )}
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
      
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span className="sum-item-name">
          {it.nombre} x{it.cantidad}
        </span>

        {/* 👇 TONOS */}
        {it.distribucionTonos && (
  <div className="tonos-container">
    {it.distribucionTonos.map((t, idx) => (
      <span key={idx} className="tono-item">
        {t.tono}: <strong>{t.cantidad} u.</strong>
      </span>
    ))}
  </div>
)}
      </div>

      <span className="sum-item-price">
        ${fmtARS(it.subtotal)}
      </span>
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