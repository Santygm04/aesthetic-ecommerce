import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "../src/index.css";
import { CartProvider } from "./components/Carrito/CartContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CartProvider>
      <App />
    </CartProvider>
  </BrowserRouter>
);

if (import.meta.env.DEV) {
  const b = document.createElement('div');
  Object.assign(b.style, {
    position:'fixed', right:'8px', bottom:'8px', zIndex:999999,
    background:'rgba(0,0,0,.7)', color:'#fff', padding:'6px 8px',
    borderRadius:'8px', font:'12px/1.2 system-ui'
  });
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(b);
    const upd = () => { b.textContent =
      `${window.innerWidth}×${window.innerHeight} @DPR ${window.devicePixelRatio}`; };
    addEventListener('resize', upd); upd();
  });
}