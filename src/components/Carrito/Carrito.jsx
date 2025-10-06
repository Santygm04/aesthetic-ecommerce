// src/components/Carrito/Carrito.jsx
import "../../components/Carrito/Carrito.css";
import { useCart } from "./CartContext";
import { Link } from "react-router-dom";
import FormularioCheckout from "../../components/Carrito/FormularioCheckout";
import { FaPlus, FaMinus, FaTrashAlt } from "react-icons/fa";

export default function Carrito() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const total = cart.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);

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

      <div className="carrito-flex">
        <div className="carrito-table-box">
          {/* wrapper para scroll en móvil */}
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
                {cart.map((prod) => (
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
                    <td>${prod.precio}</td>
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
                          title={prod.maxStock ? `Stock máximo: ${prod.maxStock}` : undefined}
                          disabled={prod.maxStock ? prod.cantidad >= prod.maxStock : false}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </td>
                    <td><b>${prod.precio * prod.cantidad}</b></td>
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
                ))}
              </tbody>
            </table>
          </div>

          <div className="carrito-total">
            <h3>
              Total: <span className="total-highlight">${total}</span>
            </h3>
            <button className="cart-clear-btn" onClick={clearCart}>Vaciar carrito</button>
          </div>
        </div>

        <FormularioCheckout total={total} productos={cart} />
      </div>
    </section>
  );
}
