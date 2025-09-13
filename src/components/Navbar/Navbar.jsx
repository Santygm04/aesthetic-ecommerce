// src/components/Navbar/Navbar.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../components/Navbar/Navbar.css";
import { useCart } from "../Carrito/CartContext";
import { FaShoppingCart, FaHome, FaThLarge, FaTags, FaSearch } from "react-icons/fa";
import NavbarSearch from "../../components/NavbarSearch/NavbarSearch";

// ICONOS
import skincare from "../../../assets/iconos/skincare.png";
import bodycare from "../../../assets/iconos/bodycare.png";
import maquillaje from "../../../assets/iconos/maquillaje.png";
import unas from "../../../assets/iconos/uñas.png";
import pestanas from "../../../assets/iconos/pestañas.png";
import peluqueria from "../../../assets/iconos/peluqueria.png";
import bijouteria from "../../../assets/iconos/bijouteria.png";
import lenceria from "../../../assets/iconos/lenceria.png";
import carteras from "../../../assets/iconos/carteras.png";
import nuevosIngresos from "../../../assets/iconos/nuevosI.png";

export default function Navbar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((s, p) => s + (p.cantidad || 1), 0);

  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isLenOpen, setIsLenOpen] = useState(false);
  const ddRef = useRef(null);

  // 🔎 para el botón "Buscar" de la tab bar inferior
  const mobileSearchRef = useRef(null);
  const nav = useNavigate();

  const toggleCats = () => setIsCatOpen((v) => !v);
  const toggleLen = () => setIsLenOpen((v) => !v);
  const closeAll = () => {
    setIsCatOpen(false);
    setIsLenOpen(false);
  };

  useEffect(() => {
    const handleDocClick = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) closeAll();
    };
    const handleKey = (e) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("click", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // === helpers tabbar móvil ===
  const focusMobileSearch = () => {
    // aseguramos estar arriba y dar foco
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {}
    setTimeout(() => {
      mobileSearchRef.current?.focus?.();
    }, 150);
  };

  const openCategoriesDrawer = () => {
    // abre el drawer y muestra categorías
    const toggle = document.getElementById("nav-toggle");
    if (toggle) toggle.checked = true;
    setIsCatOpen(true);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo brand-script">AESTHETIC</div>

      {/* === Toggle + Hamburguesa + Overlay (no rompe rutas/JS) === */}
      <input id="nav-toggle" className="nav-toggle" type="checkbox" aria-hidden="true" />
      <label htmlFor="nav-toggle" className="hamb" aria-label="Abrir menú" aria-controls="main-menu" />
      <label htmlFor="nav-toggle" className="nav-overlay" aria-hidden="true" />

      {/* 🔎 Buscador visible en el header del móvil */}
      <div className="nav-search mobile-top">
        <NavbarSearch inputRef={mobileSearchRef} />
      </div>

      <ul className="navbar-links" id="main-menu">
        {/* Cerrar dentro del drawer (solo móvil/tablet) */}
        <li className="nav-close-li">
          <label htmlFor="nav-toggle" className="nav-close-btn" title="Cerrar">✕</label>
        </li>

        {/* buscador dentro del drawer / desktop como estaba */}
        <li className="nav-search">
          <NavbarSearch />
        </li>

        <li>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Inicio
          </NavLink>
        </li>
        <li>
          <NavLink to="/nosotros" className={({ isActive }) => (isActive ? "active" : "")}>
            Nosotros
          </NavLink>
        </li>
        <li>
          <NavLink to="/promos" className={({ isActive }) => (isActive ? "active" : "")}>
            Promos
          </NavLink>
        </li>

        <li className={`dropdown ${isCatOpen ? "open" : ""}`} ref={ddRef}>
          <button
            type="button"
            className="dropdown-title"
            onClick={(e) => {
              e.stopPropagation();
              toggleCats();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleCats();
              }
            }}
            aria-haspopup="true"
            aria-expanded={isCatOpen}
          >
            Categorías <span className={`caret ${isCatOpen ? "rot" : ""}`}>▾</span>
          </button>

          <ul className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
            <li>
              <NavLink onClick={closeAll} to="/category/skincare">
                Skincare <img src={skincare} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/bodycare">
                Bodycare <img src={bodycare} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/maquillaje">
                Maquillaje <img src={maquillaje} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/uñas">
                Uñas <img src={unas} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/pestañas">
                Pestañas <img src={pestanas} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/peluquería">
                Peluquería <img src={peluqueria} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/bijouteria">
                Bijouteria <img src={bijouteria} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/marroquineria">
                Marroquineria <img src={carteras} className="img-icon" alt="" />
              </NavLink>
            </li>

            <li className="menu-divider" />

            <li className={`menu-section ${isLenOpen ? "open" : ""}`}>
              <button
                type="button"
                className="section-head"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLen();
                }}
              >
                <img src={lenceria} className="img-icon" alt="" />
                <span>Lencería / Ropa interior</span>
                <span className={`chev ${isLenOpen ? "rot" : ""}`}>▾</span>
              </button>

              <div className="submenu-grid">
                <NavLink onClick={closeAll} to="/category/lenceria">Ver todo</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/conjuntos">Conjuntos</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/tops-y-corpiños">Tops y corpiños</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/vedetinas">Vedetinas</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/colales">Colales</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/boxer">Boxer</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/slip">Slip</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/niña">Niña</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/medias">Medias</NavLink>
              </div>
            </li>

            <li className="menu-divider" />

            <li>
              <NavLink onClick={closeAll} to="/category/nuevos-ingresos">
                Nuevos ingresos <img src={nuevosIngresos} className="img-icon" alt="" />
              </NavLink>
            </li>
          </ul>
        </li>

        <li>
          <NavLink to="/contacto" className={({ isActive }) => (isActive ? "active" : "")}>
            Contacto
          </NavLink>
        </li>

        <li>
          <NavLink to="/carrito" className={({ isActive }) => (isActive ? "active cart-link" : "cart-link")}>
            <span className="cart-icon-wrapper">
              <FaShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </span>
          </NavLink>
        </li>
      </ul>

      {/* ===== Tab bar inferior móvil ===== */}
      <div className="mobile-tabbar">
        <NavLink to="/" className={({isActive}) => "tab-btn" + (isActive ? " is-active" : "")}>
          <FaHome />
          <span>Inicio</span>
        </NavLink>

        <button type="button" className="tab-btn" onClick={focusMobileSearch}>
          <FaSearch />
          <span>Buscar</span>
        </button>

        <button type="button" className="tab-btn" onClick={openCategoriesDrawer}>
          <FaThLarge />
          <span>Categorías</span>
        </button>

        <NavLink to="/promos" className={({isActive}) => "tab-btn" + (isActive ? " is-active" : "")}>
          <FaTags />
          <span>Promos</span>
        </NavLink>

        <NavLink to="/carrito" className={({isActive}) => "tab-btn cart" + (isActive ? " is-active" : "")}>
          <span className="cart-icon-wrapper">
            <FaShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </span>
          <span>Carrito</span>
        </NavLink>
      </div>
    </nav>
  );
}
