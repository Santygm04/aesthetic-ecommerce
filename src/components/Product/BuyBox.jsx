// src/components/Product/BuyBox.jsx
import { FaTruck, FaShieldAlt, FaPlus, FaMinus, FaShoppingCart, FaStore } from "react-icons/fa";
import { useCart, precioEfectivo, PRECIO_ESPECIAL_MIN_ITEMS, PRECIO_MAYORISTA_MIN_ARS } from "../Carrito/CartContext";

const fmtARS = (n) =>
  `$${Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// Etiqueta visual de cada tier (igual que en ProductCard)
const TIER_META = {
  unitario:  { label: "Unitario",  tagLabel: "U", tagClass: "bb-tag--unitario",  desc: "Precio por unidad" },
  especial:  { label: "Especial",  tagLabel: "E", tagClass: "bb-tag--especial",  desc: `Llevando ${PRECIO_ESPECIAL_MIN_ITEMS}+ productos` },
  mayorista: { label: "Mayorista", tagLabel: "M", tagClass: "bb-tag--mayorista", desc: `Compra mínima ${fmtARS(PRECIO_MAYORISTA_MIN_ARS)}` },
};

// ← CAMBIO: firma extendida con props de variantes
export default function BuyBox({
  producto,
  stockNum,
  agotado,
  qty, setQty,
  onAddToCart,
  variants = [],
  sizes = [],
  selSize = "", setSelSize,
  colorsForSize = [],
  selColor = "", setSelColor,
  isSizeDisabled,
  isColorDisabled,
  chosenVariant = null,
  maxQty = 999,
  // ← CAMBIO #8
  selTonos = [],
  setSelTonos,
}) {

 const { tier, cart, cartCount, subtotal } = useCart();

const minimoMayoristaProducto = Number(producto.minimoMayorista) || 0;
const paso = minimoMayoristaProducto > 0 ? minimoMayoristaProducto : Number(producto.unidadesPorCaja) || 1;

const precioUnitario   = Number(producto.precio          ?? 0);
const precioEspecialP  = producto.precioEspecial  != null ? Number(producto.precioEspecial)  : null;
const precioMayoristaP = producto.precioMayorista != null ? Number(producto.precioMayorista) : null;

// ── Tier simulado: considera qty actual + lo que ya hay en el carrito ──
const totalUnidadesSimuladas = cartCount + qty;
// Calculamos primero si aplica especial por cantidad
// Verificamos mayorista usando el precio mayorista directamente
// ✅ FIX: usar precioUnitario (igual que calcTier en CartContext)
// El umbral se calcula con precio mayorista (lo que el cliente realmente paga)
const subtotalSimulado = subtotal + (precioUnitario * qty);

const faltaParaMayorista = Math.max(
  0,
  PRECIO_MAYORISTA_MIN_ARS - subtotalSimulado
);

const tierSimulado = (() => {
  if (minimoMayoristaProducto > 0 && precioMayoristaP != null && qty >= minimoMayoristaProducto) return "mayorista";
  if (precioMayoristaP != null && subtotalSimulado >= PRECIO_MAYORISTA_MIN_ARS) return "mayorista";
  if (precioEspecialP  != null && totalUnidadesSimuladas >= PRECIO_ESPECIAL_MIN_ITEMS) return "especial";
  return "unitario";
})();

const itemRef = { precioUnitario, precioEspecial: precioEspecialP, precioMayorista: precioMayoristaP };
const precioActual = precioEfectivo(itemRef, tierSimulado);

  // ← CAMBIO #8: unidades por caja — el paso del contador
const dec = () => {
  if (minimoMayoristaProducto > 0) {
    if (qty <= minimoMayoristaProducto) {
      setQty(1);
    } else {
      setQty(q => Math.max(minimoMayoristaProducto, q - minimoMayoristaProducto));
    }
  } else {
    setQty(q => Math.max(paso, q - paso));
  }
};
  const inc = () => {
    if (minimoMayoristaProducto > 0 && qty === 1) {
      setQty(minimoMayoristaProducto); // saltar de 1 a 6
    } else {
      setQty(q => Math.min(maxQty, q + paso));
    }
  };



  // ← CAMBIO #8: distribución de tonos
  const cantTonos    = Number(producto.cantidadTonos) || 0;
  const tonos        = Array.isArray(producto.tonosDisponibles) && producto.tonosDisponibles.length
    ? producto.tonosDisponibles
    : cantTonos ? Array.from({ length: cantTonos }, (_, i) => `Tono ${i + 1}`) : [];
  const porTono      = cantTonos > 0 ? Math.floor(qty / cantTonos) : 0;
  const extra        = cantTonos > 0 ? qty % cantTonos : 0;

  // Cuántos productos faltan para el siguiente tier
  const faltanEspecial = Math.max(0, PRECIO_ESPECIAL_MIN_ITEMS - totalUnidadesSimuladas);
  const tierInfo       = TIER_META[tierSimulado] || TIER_META.unitario;

  return (
    <aside className="pd-buy" aria-labelledby="pd-title">
      <h1 className="pd-title" id="pd-title">{producto.nombre}</h1>

      <div className="pd-chips">
        {producto.categoria   && <span className="chip">{producto.categoria}</span>}
        {producto.subcategoria && <span className="chip">{producto.subcategoria}</span>}
        {producto.marca?.trim() && <span className="chip outline">{producto.marca}</span>}
      </div>

      {/* ── BLOQUE DE 3 PRECIOS ─────────────────────────────────── */}
      <div className="bb-tiers">

        {/* Precio Unitario — siempre */}
        <div className={`bb-tier-row ${tierSimulado === "unitario" ? "is-active" : ""}`}>
          <span className={`bb-tag bb-tag--unitario`}>U</span>
          <div className="bb-tier-info">
            <span className="bb-tier-name">Precio Unitario</span>
            <span className="bb-tier-desc">Sin mínimo de compra</span>
          </div>
          <span className="bb-tier-price">{fmtARS(precioUnitario)}</span>
        </div>

        {/* Precio Especial — si el producto lo tiene */}
        {precioEspecialP != null && (
          <div className={`bb-tier-row ${tierSimulado === "especial" ? "is-active" : ""}`}>
            <span className="bb-tag bb-tag--especial">E</span>
            <div className="bb-tier-info">
              <span className="bb-tier-name">Precio Especial</span>
              <span className="bb-tier-desc">Llevando {PRECIO_ESPECIAL_MIN_ITEMS}+ productos</span>
            </div>
            <span className="bb-tier-price">{fmtARS(precioEspecialP)}</span>
          </div>
        )}

        {/* Precio Mayorista — si el producto lo tiene */}
        {precioMayoristaP != null && (
          <div className={`bb-tier-row ${tierSimulado === "mayorista" ? "is-active" : ""}`}>
            <span className="bb-tag bb-tag--mayorista">M</span>
            <div className="bb-tier-info">
              <span className="bb-tier-name">Precio Mayorista</span>
              <span className="bb-tier-desc">Mínimo {fmtARS(PRECIO_MAYORISTA_MIN_ARS)}</span>
            </div>
            <span className="bb-tier-price">{fmtARS(precioMayoristaP)}</span>
          </div>
        )}
      </div>

      {/* ── PRECIO EFECTIVO ACTUAL ─────────────────────────────── */}
      <div className="bb-precio-actual">
  <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
    <span className="bb-precio-actual-label">Tu precio ahora</span>
    <span style={{ fontSize: ".78rem", color: "#e11a8a", fontWeight: 600 }}>
      Total: {fmtARS(precioActual * qty)}
      {tierSimulado !== "mayorista" && precioMayoristaP != null && faltaParaMayorista > 0 && (
    <span style={{ color: "#15803d", marginLeft: 6 }}>
      · con Mayorista: {fmtARS((precioMayoristaP ?? precioUnitario) * qty)}
    </span>
  )}
</span>
  </div>
  <span className="bb-precio-actual-val">{fmtARS(precioActual)}</span>
  <span className="bb-precio-actual-tier">{tierInfo.label}</span>
</div>
      {/* ── NUDGE: cuánto falta para el siguiente tier ─────────── */}
      {tierSimulado === "unitario" && precioEspecialP != null && faltanEspecial > 0 && (
        <div className="bb-nudge bb-nudge--especial">
          🛍️ Agregá {faltanEspecial} producto{faltanEspecial > 1 ? "s" : ""} más y pasás al{" "}
          <strong>Precio Especial</strong>
        </div>
      )}
      {tierSimulado !== "mayorista" && precioMayoristaP != null && (
    minimoMayoristaProducto > 0 ? (
    qty < minimoMayoristaProducto && (
      <div className="bb-nudge bb-nudge--mayorista">
        🏆 Llevá {minimoMayoristaProducto} o más unidades y pasás al <strong>Precio Mayorista</strong>
        {" "}({fmtARS(precioMayoristaP)}/u)
      </div>
    )
  ) : (
    faltaParaMayorista > 0 && (
      <div className="bb-nudge bb-nudge--mayorista">
        🏆 Te faltan {fmtARS(faltaParaMayorista)} para el <strong>Precio Mayorista</strong>
        {" "}(calculado a ${precioMayoristaP?.toLocaleString("es-AR")}/u)
      </div>
    )
  )
)}

      {/* ── VARIANTES ← CAMBIO: recibidas como props desde ProductDetail */}
      {variants?.length > 0 && (
        <div className="pd-variants">
          {sizes?.length > 0 && (
            <div className="pd-var-row">
              <span className="pd-var-label">Talle</span>
              <div className="swatches">
                {sizes.map((s) => (
                  <button
                    key={s}
                    className={`swatch ${selSize === s ? "active" : ""}`}
                    title={isSizeDisabled?.(s) ? "Sin stock" : ""}
                    onClick={() => {
                      setSelSize(s);
                      const colorsOfSize = variants
                        .filter((v) => v.size === s && v.color)
                        .map((v) => v.color);
                      const colorWithStock = variants.find(
                        (v) => v.size === s && Number(v.stock || 0) > 0 && v.color
                      )?.color;
                      if (!colorsOfSize.includes(selColor)) {
                        setSelColor(colorWithStock || colorsOfSize[0] || "");
                      }
                    }}
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colorsForSize?.length > 0 && (
            <div className="pd-var-row">
              <span className="pd-var-label">Color</span>
              <div className="swatches">
                {colorsForSize.map((c) => (
                  <button
                    key={c}
                    className={`swatch ${selColor === c ? "active" : ""}`}
                    title={isColorDisabled?.(c) ? "Sin stock" : c}
                    onClick={() => setSelColor(c)}
                    type="button"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STOCK + QTY ← CAMBIO #8: múltiplos por caja */}
      <div className="pd-stock-row">
        <span className={`stock ${agotado ? "danger" : "ok"}`}>
          {agotado ? "Sin stock" : "Disponible"}
          {chosenVariant ? ` · ${chosenVariant.size} / ${chosenVariant.color}` : ""}
        </span>
        <div className="qty">
          <button onClick={dec} aria-label="Restar" disabled={qty <= 1}><FaMinus /></button>
<input
  type="number" value={qty} min={1} step={1} max={maxQty}
  onChange={e => {
  const val = Number(e.target.value) || 1;
  if (minimoMayoristaProducto > 0) {
    if (val <= 1) { setQty(1); return; }
    if (val < minimoMayoristaProducto) { setQty(1); return; }
    const rounded = Math.round(val / minimoMayoristaProducto) * minimoMayoristaProducto;
    setQty(Math.max(minimoMayoristaProducto, Math.min(rounded, maxQty)));
  } else {
    const rounded = Math.round(val / paso) * paso;
    setQty(Math.max(paso, Math.min(rounded, maxQty)));
  }
}}
/>
<button onClick={inc} aria-label="Sumar" disabled={qty >= maxQty || agotado}><FaPlus /></button>
        </div>
      </div>

      {/* ← CAMBIO #8: indicador de caja */}
      {paso > 1 && (
  <div style={{ fontSize: ".78rem", color: "#7a7a7a", marginTop: -6, marginBottom: 8, textAlign: "right" }}>
    {minimoMayoristaProducto > 0
      ? <>Mayorista desde <strong>{minimoMayoristaProducto}</strong> unidades</>
      : <>Venta de a <strong>{paso}</strong> unidades</>}
  </div>
)}

      {/* ── TONOS ← CAMBIO #8 */}
      {cantTonos > 0 && qty > 0 && (
        <div className="bb-tonos">
          <span className="bb-tonos-title">Distribución de tonos</span>
          <div className="bb-tonos-grid">
            {tonos.map((t, i) => (
              <div key={i} className="bb-tono-row">
                <span className="bb-tono-name">{t}</span>
                <span className="bb-tono-qty">{porTono + (i < extra ? 1 : 0)} ud.</span>
              </div>
            ))}
          </div>
          <small style={{ color: "#7a7a7a", fontSize: ".76rem" }}>
            La distribución es automática y pareja según la cantidad elegida.
          </small>
        </div>
      )}

      {/* ── BENEFICIOS ─────────────────────────────────────────── */}
      <ul className="pd-benefits">
        <li><FaTruck /><span>Envío rápido</span><small>a todo el país</small></li>
        <li><FaShieldAlt /><span>Compra protegida</span><small>pagos seguros</small></li>
      </ul>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <button className="pd-cta" onClick={onAddToCart} disabled={agotado} aria-disabled={agotado}>
        <FaShoppingCart style={{ marginRight: 8 }} />
        {agotado ? "Sin stock" : "Agregar al carrito"}
      </button>

      {producto.tienda && (
        <div className="seller-card" style={{ marginTop: 12 }}>
          <div className="seller-head" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <FaStore />
            <div>
              <strong>{producto.tienda?.nombre || "Tienda oficial"}</strong>
              <div className="seller-sub">
                {producto.tienda?.ventas ? `${producto.tienda.ventas} ventas` : "Atención personalizada"}
              </div>
            </div>
          </div>
          {producto.garantiaDias && <div className="seller-row">Garantía: {producto.garantiaDias} días</div>}
        </div>
      )}
    </aside>
  );
}