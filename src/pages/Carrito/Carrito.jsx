// src/pages/Carrito/Cart.jsx
import { useCart } from "../../components/Carrito/CartContext";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import "../../components/Carrito/Cart.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: "", email: "", direccion: "" });
  const handleInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const total = cart.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  const handleBuy = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.direccion) {
      alert("Por favor completá todos los campos.");
      return;
    }
    alert("¡Gracias por tu compra! (simulación)");
    clearCart();
    navigate("/");
  };

  if (cart.length === 0)
    return (
      <section className="cart-container">
        <h2>Tu carrito está vacío 😢</h2>
        <button onClick={() => navigate("/")} className="btn-volver">Volver a la tienda</button>
      </section>
    );

  return (
    <section className="cart-container">
      <h2>🛒 Mi Carrito</h2>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((prod) => (
            <tr key={prod.key}>
              <td>
                <img src={prod.imagen} alt={prod.nombre} className="cart-thumb" />
              </td>
              <td>
                {prod.nombre}
                {prod.variant && (
                  <div style={{ fontSize: ".88rem", color: "#666", marginTop: 2 }}>
                    {prod.variant.size} • {prod.variant.color}
                  </div>
                )}
              </td>
              <td>${prod.precio}</td>
              <td>
                <div className="qty-buttons">
                  <button onClick={() => updateQuantity(prod.key, Math.max(1, prod.cantidad - 1))} disabled={prod.cantidad === 1}><FaMinus /></button>
                  <span>{prod.cantidad}</span>
                  <button onClick={() => updateQuantity(prod.key, prod.cantidad + 1)}><FaPlus /></button>
                </div>
              </td>
              <td><b>${prod.precio * prod.cantidad}</b></td>
              <td>
                <button className="btn-remove" onClick={() => removeFromCart(prod.key)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cart-summary">
        <h3>Total: <span>${total}</span></h3>
        <button className="btn-clear" onClick={clearCart}>Vaciar Carrito</button>
      </div>

      <form className="checkout-form" onSubmit={handleBuy}>
        <h4>Finalizar Compra</h4>
        <input type="text" name="nombre" value={form.nombre} onChange={handleInput} placeholder="Tu nombre" required />
        <input type="email" name="email" value={form.email} onChange={handleInput} placeholder="Correo electrónico" required />
        <input type="text" name="direccion" value={form.direccion} onChange={handleInput} placeholder="Dirección de entrega" required />
        <button type="submit" className="btn-buy">Pagar ahora</button>
      </form>
    </section>
  );
}
