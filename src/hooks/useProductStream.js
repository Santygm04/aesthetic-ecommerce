// src/hooks/useProductStream.js
import { useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Suscripción SSE al stream de productos.
 * onUpsert(product)   → cuando se crea/actualiza
 * onDelete(productId) → cuando se elimina
 */
export default function useProductStream({ onUpsert, onDelete }) {
  const esRef = useRef(null);

  useEffect(() => {
    const es = new EventSource(`${API_URL}/api/products/stream`, { withCredentials: false });

    es.addEventListener("product:upsert", (e) => {
      try {
        const p = JSON.parse(e.data);
        onUpsert && onUpsert(p);
      } catch {/* ignore */}
    });

    es.addEventListener("product:delete", (e) => {
      try {
        const { _id } = JSON.parse(e.data);
        onDelete && onDelete(_id);
      } catch {/* ignore */}
    });

    // keep reference
    esRef.current = es;
    return () => {
      try { esRef.current?.close(); } catch {}
      esRef.current = null;
    };
  }, [onUpsert, onDelete]);
}
