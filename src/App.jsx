import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

const Catalog        = lazy(() => import("./pages/Catalog/Catalog"));
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
const Pagos          = lazy(() => import("./pages/Pagos/Pagos"));
const EstadoPago     = lazy(() => import("./pages/Pago/EstadoPago"));
const PagoExito      = lazy(() => import("./pages/PagoExito"));
const WAFloat        = lazy(() => import("./components/WAFloat/WAFloat"));
const Orders         = lazy(() => import("./pages/Orders/Orders"));
const MasVendidos = lazy(() => import("./pages/MasVendidos/MasVendidos"));

function App() {
  const location = useLocation();

  const getMeta = () => {
    const path = location.pathname;

    if (path === "/") {
      return {
        title: "AESTHETIC | Tienda online",
        desc: "Comprá productos de belleza, skincare y moda online.",
      };
    }

    if (path.includes("/producto")) {
      return {
        title: "Producto | AESTHETIC",
        desc: "Detalle del producto en AESTHETIC",
      };
    }

    if (path.includes("/category")) {
      return {
        title: "Categorías | AESTHETIC",
        desc: "Explorá productos por categoría",
      };
    }

    return {
      title: "AESTHETIC",
      desc: "Tienda online",
    };
  };

  const meta = getMeta();

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.desc} />
      </Helmet>

      <Navbar />
      <WAFloat />

      <Suspense fallback={<div style={{ padding: "2rem" }}>Cargando…</div>}>
        <Routes>
          <Route path="/pedidos" element={<Orders />} />
          <Route path="/buscar" element={<SearchResults />} />
          <Route path="/" element={<Home />} />
          <Route path="/carrito" element={<Carrito />} />

          <Route path="/pago/exito" element={<PagoExito />} />
          <Route path="/pago/:estado" element={<EstadoPago />} />

          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/promos" element={<Promos />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/pagos" element={<Pagos />} />
          <Route path="/devoluciones" element={<Navigate to="/pagos" replace />} />
          <Route path="/envios" element={<Envios />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/mas-vendidos" element={<MasVendidos />} />
          <Route path="/category" element={<Categories />} />
          <Route path="/category/:categoria" element={<CategoryPage />} />
          <Route path="/category/:categoria/:subcategoria" element={<CategoryPage />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
        </Routes>
      </Suspense>

      <Footer />
    </>
  );
}

export default App;