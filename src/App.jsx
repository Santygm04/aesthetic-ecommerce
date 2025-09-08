// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

// ⚡ Lazy load por ruta
const Categories     = lazy(() => import("./pages/Categories/Categories"));
const Promos         = lazy(() => import("./pages/Promos/Promos"));
const Contact        = lazy(() => import("./pages/Contact/Contact"));
const Envios         = lazy(() => import("./pages/Envios/Envios"));
const CategoryPage   = lazy(() => import("./pages/CategoryPage/CategoryPage"));
const ProductDetail  = lazy(() => import("./pages/ProductDetail/ProductDetail"));
const Carrito        = lazy(() => import("./components/Carrito/Carrito"));
const Home           = lazy(() => import("./pages/Home/Home"));
const Nosotros       = lazy(() => import("./pages/Nosotros/Nosotros"));
const SearchResults  = lazy(() => import("./pages/SearchResults/SearchResults"));
const Pagos          = lazy(() => import("./pages/Pagos/Pagos")); // 👈 NUEVO
const EstadoPago     = lazy(() => import("./pages/Pago/EstadoPago"));
const WAFloat    = lazy(() => import("./components/WAFloat/WAFloat"));
function App() {
  return (
    <>
      <Navbar />
        <WAFloat />
      <Suspense fallback={<div style={{ padding: "2rem" }}>Cargando…</div>}>
        <Routes>
          <Route path="/buscar" element={<SearchResults />} />
          <Route path="/" element={<Home />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/pago/:estado" element={<EstadoPago />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/promos" element={<Promos />} />
          <Route path="/contacto" element={<Contact />} />

          {/* 👇 Reemplazo Devoluciones por Pagos */}
          <Route path="/pagos" element={<Pagos />} />
          <Route path="/devoluciones" element={<Navigate to="/pagos" replace />} />

          <Route path="/envios" element={<Envios />} />
          <Route path="/category" element={<Categories />} />

          {/* Rutas de categorías */}
          <Route path="/category/:categoria" element={<CategoryPage />} />
          <Route path="/category/:categoria/:subcategoria" element={<CategoryPage />} />

          {/* Ruta de detalle de producto */}
          <Route path="/producto/:id" element={<ProductDetail />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

export default App;
