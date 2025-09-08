// ECOMMERCE FRONT — src/components/ProductList/ProductList.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../../components/ProductList/ProductList.css";
import ProductCard from "../../components/ProductCard/ProductCard";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductList({ filtroCategoria, subCategoria }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel;
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const params = {
          ...(filtroCategoria ? { categoria: filtroCategoria } : {}),
          ...(subCategoria ? { subcategoria: subCategoria } : {}),
        };

        const res = await axios.get(`${API_URL}/api/productos`, {
          params,
          cancelToken: new axios.CancelToken((c) => (cancel = c)),
        });

        // ✅ soporta array (legacy) u objeto { items }
        const data = res.data;
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setProductos(items);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error al obtener productos", error);
          setProductos([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
    return () => cancel?.();
  }, [filtroCategoria, subCategoria]);

  if (loading) {
    return (
      <div className="product-list-empty">
        <p>Cargando productos…</p>
      </div>
    );
  }

  if (!productos.length) {
    return (
      <div className="product-list-empty">
        <p>No hay productos en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      {productos.map((producto) => (
        <ProductCard key={producto._id || producto.id} producto={producto} />
      ))}
    </div>
  );
}
