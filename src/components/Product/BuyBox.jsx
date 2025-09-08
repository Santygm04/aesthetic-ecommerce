// src/components/Product/BuyBox.jsx
import { FaTruck, FaShieldAlt, FaPlus, FaMinus, FaShoppingCart, FaStore } from "react-icons/fa";

export default function BuyBox({
  producto, // { nombre, categoria, subcategoria, marca, tienda, garantiaDias }
  precio,
  precioOriginal,
  off, // opcional
  stockNum,
  agotado,
  qty, setQty,
  onAddToCart,
}) {
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(999, q + 1));

  return (
    <aside className="pd-buy" aria-labelledby="pd-title">
      <h1 className="pd-title" id="pd-title">{producto.nombre}</h1>

      <div className="pd-chips">
        {producto.categoria && <span className="chip">{producto.categoria}</span>}
        {producto.subcategoria && <span className="chip">{producto.subcategoria}</span>}
        {producto.marca && producto.marca.trim() !== "" && (
          <span className="chip outline">{producto.marca}</span>
        )}
      </div>

      <div className="pd-price" aria-label="Precio">
        {precioOriginal ? (
          <>
            <span className="old">${precioOriginal.toLocaleString("es-AR")}</span>
            <span className="now">${precio.toLocaleString("es-AR")}</span>
          </>
        ) : (
          <span className="now">${precio.toLocaleString("es-AR")}</span>
        )}
      </div>

      <ul className="pd-benefits">
        <li>
          <FaTruck /><span>Envío rápido</span><small>a todo el país</small>
        </li>
        <li>
          <FaShieldAlt /><span>Compra protegida</span><small>pagos seguros</small>
        </li>
      </ul>

      <div className="pd-stock-row">
        <span className={`stock ${agotado ? "danger" : "ok"}`}>
          {agotado ? "Sin stock" : `Stock: ${stockNum}`}
        </span>

        <div className="qty">
          <button onClick={dec} aria-label="Restar"><FaMinus /></button>
          <input
            type="number" value={qty} min={1}
            onChange={(e) => {
              const v = Math.max(1, Number(e.target.value) || 1);
              setQty(v);
            }}
          />
          <button onClick={inc} aria-label="Sumar"><FaPlus /></button>
        </div>
      </div>

      <button
        className="pd-cta"
        onClick={onAddToCart}
        disabled={agotado}
        aria-disabled={agotado}
      >
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
          {producto.garantiaDias && (
            <div className="seller-row">Garantía: {producto.garantiaDias} días</div>
          )}
        </div>
      )}
    </aside>
  );
}
