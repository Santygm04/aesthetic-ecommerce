// src/components/Carrito/Carrito.jsx
import "../../components/Carrito/Carrito.css";
import { useCart, precioEfectivo } from "./CartContext";
import { Link } from "react-router-dom";
import FormularioCheckout from "../../components/Carrito/FormularioCheckout";
import { FaPlus, FaMinus, FaTrashAlt } from "react-icons/fa";

export default function Carrito() {
  // ← CAMBIO: traemos tier y subtotal del contexto
  const { cart, removeFromCart, updateQuantity, clearCart, tier, subtotal } = useCart();

  // ← CAMBIO: total calculado con precioEfectivo según tier
  const total = subtotal;

  const fmtARS = (n) =>
    Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const TIER_LABEL = {
    unitario:  { label: "Precio Unitario",  color: "#1a1a1a", bg: "#f5f5f5"  },
    especial:  { label: "Precio Especial",  color: "#fff",    bg: "#f97316"  },
    mayorista: { label: "Precio Mayorista", color: "#1a1a1a", bg: "#84e070"  },
  };
  const tierInfo = TIER_LABEL[tier] || TIER_LABEL.unitario;

  if (cart.length === 0) {
    return (
      <section className="carrito-vacio">
        <h2>Tu carrito está vacío 🛒</h2>
        <button className="volver-inicio-btn">
          <Link to="/">Volver al inicio</Link>
        </button>
      </section>
    );
  }

  return (
    <section className="carrito-container" aria-labelledby="carrito-title">
      <h2 className="carrito-title" id="carrito-title">Carrito de compras</h2>

      {/* ← CAMBIO: badge del tier activo */}
      <div className="carrito-tier-badge" style={{ background: tierInfo.bg, color: tierInfo.color }}>
        {tierInfo.label} activo
      </div>

      <div className="carrito-flex">
        <div className="carrito-table-box">
          <div className="carrito-table-scroll" role="region" aria-label="Productos del carrito" tabIndex={0}>
            <table className="carrito-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((prod) => {
                  // ← CAMBIO: precio efectivo según tier
                  const precioEf = precioEfectivo(prod, tier);
                  return (
                    <tr key={prod.key}>
                      <td>
                        <img src={prod.imagen} alt={prod.nombre} className="cart-thumb" loading="lazy" />
                      </td>
                      <td>
                        {prod.nombre}
                        {prod.variant && (
                          <div className="muted" style={{ fontSize: ".88rem" }}>
                            {prod.variant.size} • {prod.variant.color}
                          </div>
                        )}
                      </td>
                      {/* ← CAMBIO: muestra precio del tier */}
                      <td>${fmtARS(precioEf)}</td>
                      <td>
                        <div className="qty-btn-group">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(prod.key, prod.cantidad - 1)}
                            disabled={prod.cantidad <= 1}
                            aria-label="Quitar uno"
                          >
                            <FaMinus />
                          </button>
                          <span className="cantidad-span" aria-live="polite">{prod.cantidad}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(prod.key, prod.cantidad + 1)}
                            aria-label="Sumar uno"
                            disabled={prod.maxStock ? prod.cantidad >= prod.maxStock : false}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </td>
                      {/* ← CAMBIO: subtotal con precio del tier */}
                      <td><b>${fmtARS(precioEf * prod.cantidad)}</b></td>
                      <td>
                        <button
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(prod.key)}
                          title="Eliminar"
                          aria-label={`Eliminar ${prod.nombre}`}
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="carrito-total">
            <h3>
              Total: <span className="total-highlight">${fmtARS(total)}</span>
            </h3>
            <button className="cart-clear-btn" onClick={clearCart}>Vaciar carrito</button>
          </div>
        </div>

        <FormularioCheckout total={total} productos={cart} />
      </div>
    </section>
  );
}