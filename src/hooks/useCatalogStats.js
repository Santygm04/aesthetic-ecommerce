import { useEffect, useState } from "react";
import api from "../utils/api";

export default function useCatalogStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/productos/stats");
        if (!alive) return;
        setStats(data);
      } catch (e) {
        if (!alive) return;
        console.error("Stats error:", e?.response?.data || e.message);
        setError(e?.response?.data || e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { stats, loading, error };
}
