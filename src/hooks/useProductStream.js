// src/hooks/useProductStream.js
import { useEffect, useRef } from "react";

// Tomamos la URL y le sacamos cualquier "/" del final para evitar doble slash
const raw = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = raw.replace(/\/+$/, "");

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
      } catch { /* ignore */ }
    });

    es.addEventListener("product:delete", (e) => {
      try {
        const { _id } = JSON.parse(e.data);
        onDelete && onDelete(_id);
      } catch { /* ignore */ }
    });

    esRef.current = es;
    return () => {
      try { esRef.current?.close(); } catch {}
      esRef.current = null;
    };
  }, [onUpsert, onDelete]);
}
