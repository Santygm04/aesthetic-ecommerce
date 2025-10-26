// src/components/Carrito/FormularioCheckout.jsx
import { useMemo, useState } from "react";
import "../../components/Carrito/Carrito.css";
import { useCart } from "./CartContext"; // 👈 NUEVO

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const BANK_ALIAS = import.meta.env.VITE_BANK_ALIAS || "SANTYGM";

/* ===== Selects: Provincias y Ciudades (AR) ===== */
const PROVINCIAS = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const CIUDADES = {
  "Buenos Aires": [
    "La Plata",
    "San Miguel",
    "Mar del Plata",
    "Bahía Blanca",
    "San Isidro",
    "Quilmes",
  ],
  CABA: ["Palermo", "Recoleta", "Caballito", "Belgrano", "Almagro"],
  Córdoba: ["Córdoba", "Río Cuarto", "Villa María", "Villa Carlos Paz"],
  "Santa Fe": ["Rosario", "Santa Fe", "Rafaela", "Venado Tuerto"],
  Mendoza: ["Mendoza", "Godoy Cruz", "Guaymallén", "San Rafael"],
  Tucumán: ["San Miguel de Tucumán", "Yerba Buena", "Tafí Viejo"],
  Neuquén: ["Neuquén", "San Martín de los Andes", "Plottier"],
  "Río Negro": ["Viedma", "General Roca", "Bariloche"],
  Misiones: ["Posadas", "Oberá", "Iguazú"],
  Salta: ["Salta", "Cafayate", "Metán"],
  "San Juan": ["San Juan", "Rawson", "Chimbas"],
  "San Luis": ["San Luis", "Villa Mercedes", "Merlo"],
  Jujuy: ["San Salvador de Jujuy", "Palpalá", "Perico"],
  "Entre Ríos": ["Paraná", "Concordia", "Gualeguaychú"],
  Chaco: ["Resistencia", "Barranqueras", "Roque Sáenz Peña"],
  Corrientes: ["Corrientes", "Goya", "Paso de los Libres"],
  Chubut: ["Rawson", "Trelew", "Comodoro Rivadavia"],
  "Santa Cruz": ["Río Gallegos", "Caleta Olivia", "El Calafate"],
  "Tierra del Fuego": ["Ushuaia", "Río Grande"],
  Catamarca: ["San Fernando del Valle", "Tinogasta"],
  "La Pampa": ["Santa Rosa", "General Pico"],
  "La Rioja": ["La Rioja", "Chilecito"],
  Formosa: ["Formosa", "Clorinda"],
  "Santiago del Estero": ["Santiago del Estero", "La Banda"],
};

export default function FormularioCheckout({ total, productos }) {
  const { clearCart } = useCart(); // 👈 NUEVO

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    direccion: "",
    telefono: "",
  });

  // Método de pago (por ahora solo transferencia)
  const [pago, setPago] = useState("transferencia");

  // Entrega
  const [shippingMethod, setShippingMethod] = useState("envio");
  const [address, setAddress] = useState({
    calle: "",
    numero: "",
    piso: "",
    ciudad: "",
    provincia: "",
    cp: "",
  });

  const [comprobante, setComprobante] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  const handlePagoChange = (e) => setPago(e.target.value);

  // 👉 opciones de ciudades según provincia
  const ciudadesDisponibles = useMemo(
    () => (address.provincia ? CIUDADES[address.provincia] || [] : []),
    [address.provincia]
  );

  // 👉 Enviamos también la VARIANTE elegida si existe
  const itemsForOrder = useMemo(
    () =>
      productos.map((p) => {
        const v = p.variant || p.variacion || p.selectedVariant || null;
        const variant = v
          ? {
              vid: v.vid || v._id || v.id || v.sku || "",
              size: v.size || v.talle || "",
              color: v.color || v.colour || "",
              stock: v.stock != null ? Number(v.stock) : undefined, // 👈 pasa stock de variante si existe
            }
          : p.vid || p.sku || p.size || p.talle || p.color
          ? {
              vid: p.vid || p.variantId || p.sku || "",
              size: p.size || p.talle || "",
              color: p.color || "",
            }
          : undefined;

        return {
          productId: p._id,
          nombre: p.nombre,
          precio: Number(p.precio),
          cantidad: Number(p.cantidad || 1),
          ...(variant ? { variant } : {}),
          ...(p.maxStock != null ? { maxStock: Number(p.maxStock) } : {}),
        };
      }),
    [productos]
  );

  // ---------- Transferencia
  const submitTransfer = async () => {
    const fd = new FormData();
    fd.append("alias", BANK_ALIAS);
    fd.append("total", String(total));
    fd.append("buyer", JSON.stringify(form));
    fd.append("items", JSON.stringify(itemsForOrder));
    fd.append("shipping", JSON.stringify({ method: shippingMethod, address }));
    if (comprobante) fd.append("comprobante", comprobante);

    const res = await fetch(`${API_URL}/api/payments/transfer`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error enviando comprobante");

    clearCart(); // 👈 vaciamos el carrito al confirmar la orden
    window.location.href = `/pago/exito?o=${data.orderId}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);
    try {
      // ✅ Chequeo rápido de stock antes de mandar
      const over = productos.find(
        (p) => p.maxStock != null && Number(p.cantidad) > Number(p.maxStock)
      );
      if (over) {
        throw new Error(
          `Stock insuficiente para "${over.nombre}". Disponible: ${over.maxStock}.`
        );
      }

      if (shippingMethod === "envio") {
        const ok =
          address.calle &&
          address.numero &&
          address.ciudad &&
          address.provincia &&
          address.cp;
        if (!ok) throw new Error("Completá la dirección de envío.");
      }
      if (pago === "transferencia") {
        await submitTransfer();
      } else {
        throw new Error("Método de pago no disponible.");
      }
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
    <form className="checkout-form pro" onSubmit={handleSubmit}>
      <h3>Completa tus datos</h3>

      {/* Datos principales */}
      <div className="form-grid grid-2">
        <div className="form-group">
          <label>Nombre y apellido</label>
          <input
            className="control"
            name="nombre"
            placeholder="Ej: Ana Pérez"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            className="control"
            name="telefono"
            type="tel"
            placeholder="Ej: +54 9 11 5555 5555"
            value={form.telefono}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            className="control"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* MÉTODO DE PAGO — Tarjetas lindas */}
        <div className="form-group">
          <label>Método de pago</label>
          <div className="pay-methods">
            {/* Transferencia (única habilitada) */}
            <label
              className={`pay-card ${pago === "transferencia" ? "active" : ""}`}
            >
              <input
                type="radio"
                name="pago"
                value="transferencia"
                checked={pago === "transferencia"}
                onChange={handlePagoChange}
              />
              <div className="pay-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    d="M3 10h18M5 10V8l7-4 7 4v2M6 10v8M10 10v8M14 10v8M18 10v8M4 20h16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="pay-title">Transferencia bancaria</div>
              <div className="pay-sub">
                Alias: <strong>{BANK_ALIAS.toUpperCase()}</strong>
              </div>
            </label>

            {/* Próximamente: MP */}
            <label className="pay-card disabled" title="Próximamente">
              <input type="radio" name="pago" value="mercadopago" disabled />
              <div className="pay-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M7 12c2.2-2.2 7.8-2.2 10 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="pay-title-1">Mercado Pago</div>
              <div className="pay-badge1">Próximamente</div>
            </label>

            {/* Próximamente: Tarjeta */}
            <label className="pay-card disabled" title="Próximamente">
              <input type="radio" name="pago" value="tarjeta" disabled />
              <div className="pay-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <rect
                    x="3"
                    y="6"
                    width="18"
                    height="12"
                    rx="2.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <rect x="6" y="12" width="6" height="2.5" rx="1.2" />
                </svg>
              </div>
              <div className="pay-title-2">Tarjeta</div>
              <div className="pay-badge2">Próximamente</div>
            </label>
          </div>
          <small className="alias-hint">
            {" "}
            Por ahora sólo disponible: transferencia bancaria.{" "}
          </small>
        </div>
      </div>

      {/* Entrega */}
      <div className="form-group">
        <label>Entrega</label>
        <div className="shipping-options">
          <label
            className={`ship-card ${shippingMethod === "envio" ? "active" : ""}`}
          >
            <input
              type="radio"
              name="shipping"
              value="envio"
              checked={shippingMethod === "envio"}
              onChange={() => setShippingMethod("envio")}
            />
            <div className="ship-title">Envío (coordinamos por WhatsApp)</div>
            <div className="ship-text">Lo recibís en tu domicilio</div>
          </label>

          <label
            className={`ship-card ${shippingMethod === "retiro" ? "active" : ""}`}
          >
            <input
              type="radio"
              name="shipping"
              value="retiro"
              checked={shippingMethod === "retiro"}
              onChange={() => setShippingMethod("retiro")}
            />
            <div className="ship-title">Retiro en local</div>
            <div className="ship-text">Coordinamos por WhatsApp</div>
          </label>
        </div>
      </div>

      {/* Dirección */}
      {shippingMethod === "envio" && (
        <div className="shipping-form-grid compact">
          <div className="form-group grid-span-2">
            <label>Calle</label>
            <input
              className="control"
              placeholder="Ej: Av. Siempreviva"
              value={address.calle}
              onChange={(e) =>
                setAddress({ ...address, calle: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Número</label>
            <input
              className="control"
              placeholder="1234"
              value={address.numero}
              onChange={(e) =>
                setAddress({ ...address, numero: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Piso/Depto (opcional)</label>
            <input
              className="control"
              placeholder="Piso 2, Dto A"
              value={address.piso}
              onChange={(e) => setAddress({ ...address, piso: e.target.value })}
            />
          </div>

          {/* === Ciudad (SELECT) === */}
          <div className="form-group">
            <label>Ciudad</label>
            <select
              className="control"
              value={address.ciudad}
              onChange={(e) =>
                setAddress({ ...address, ciudad: e.target.value })
              }
              required
              disabled={!address.provincia}
            >
              <option value="" disabled>
                {address.provincia ? "Seleccioná ciudad" : "Primero elegí provincia"}
              </option>
              {ciudadesDisponibles.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* === Provincia (SELECT) === */}
          <div className="form-group">
            <label>Provincia</label>
            <select
              className="control"
              value={address.provincia}
              onChange={(e) =>
                setAddress({ ...address, provincia: e.target.value, ciudad: "" })
              }
              required
            >
              <option value="" disabled>
                Seleccioná provincia
              </option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Código Postal</label>
            <input
              className="control"
              placeholder="Ej: 1663"
              value={address.cp}
              onChange={(e) => setAddress({ ...address, cp: e.target.value })}
              required
            />
          </div>
        </div>
      )}

      {/* Transferencia (sub-bloque) */}
      {pago === "transferencia" && (
        <div className="form-grid grid-2">
          <div className="form-group grid-span-2">
            <label>Alias para transferir</label>
            <div
              className="alias-display"
              onClick={copiarAlias}
              role="button"
              tabIndex={0}
            >
              <span className="alias-text">{BANK_ALIAS.toUpperCase()}</span>
              <button type="button" className="copy-btn" onClick={copiarAlias}>
                Copiar
              </button>
            </div>
            <small className="alias-hint">
              {" "}
              Tocá el alias o el botón para copiarlo.{" "}
            </small>
          </div>

          <div className="form-group grid-span-2">
            <label>Comprobante (JPG/PNG/PDF)</label>
            <input
              className="control-file"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setComprobante(e.target.files?.[0] || null)}
            />
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className="summary-card">
        <div className="sum-row">
          <span>Total</span>
          <strong>${total}</strong>
        </div>
      </div>

      <button type="submit" className="checkout-btn" disabled={loading}>
        {loading ? "Procesando…" : "Confirmar compra"}
      </button>
      {mensaje && <div className="mensaje-exito">{mensaje}</div>}
    </form>
  );
}
