// Home.jsx
import { useEffect, useState } from "react";
import Hero from "../../components/Hero/Hero";
import ProductSlider from "../../components/ProductSlider/ProductSlider";
import BannerPromo from "../../components/BannerPromo/BannerPromo";
import Beneficios from "../../components/Beneficios/Beneficios";
import Categories from "../Categories/Categories";
import api from "../../utils/api";
import "../../pages/Home/Home.css";

export default function Home() {
  const [destacados, setDestacados] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const hasStock = (p) => {
      const base = Number(p?.stock ?? 0);
      const varStock = Array.isArray(p?.variantes)
        ? p.variantes.reduce((acc, v) => acc + Number(v?.stock ?? 0), 0)
        : 0;
      return base + varStock > 0;
    };

    (async () => {
      try {
        setLoading(true);

        // --- Promos en paralelo
        const promosReq = api.get("/api/productos/promos", {
          params: { limit: 12, admin: true, _t: Date.now() },
        });

        // --- Destacados (principal) + fallback si viene vacío
        let destRaw = [];
        try {
          const d1 = await api.get("/api/productos", {
            params: {
              destacado: true,
              limit: 12,
              sort: "fecha-desc",
              admin: true,
              _t: Date.now(),
            },
          });
          destRaw = Array.isArray(d1.data) ? d1.data : d1.data?.items || [];
        } catch {
          destRaw = [];
        }

        // Fallback a /destacados si el primero no trae nada
        if (!destRaw.length) {
          try {
            const dAlt = await api.get("/api/productos/destacados", {
              params: { limit: 12, admin: true, _t: Date.now() },
            });
            destRaw = Array.isArray(dAlt.data) ? dAlt.data : dAlt.data?.items || [];
          } catch {
            destRaw = [];
          }
        }

        // Filtrado seguro en el front: solo visibles y con stock
        const dest = destRaw.filter((p) => p?.visible !== false && hasStock(p));

        // Resolvemos promos
        let pro = [];
        try {
          const pr = await promosReq;
          pro = Array.isArray(pr.data) ? pr.data : pr.data?.items || [];
        } catch {
          pro = [];
        }

        if (alive) {
          setDestacados(dest);
          setPromos(pro);
        }
      } catch (e) {
        console.error("Error cargando home:", e);
        if (alive) {
          setDestacados([]);
          setPromos([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="home-container">
      <Hero />

      <section className="home-strip fade-in-section">
        {loading ? (
          <p className="strip-msg">Cargando…</p>
        ) : destacados.length === 0 ? (
          <p className="strip-msg">No hay productos destacados aún.</p>
        ) : (
          <ProductSlider productos={destacados} title="Destacados" />
        )}
      </section>

      {/* Banner grande si hay promos activas */}
      {promos.length > 0 && <BannerPromo />}

      <Beneficios />
      <Categories />
    </div>
  );
}
