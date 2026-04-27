import { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import { normalizeProduct } from "../../utils/product";
import ProductCard from "../../components/ProductCard/ProductCard";
import FiltersBar from "../../pages/Catalog/FilterBar";
import Pagination from "../../pages/Catalog/Pagination";
import "./Catalog.css";

const DEFAULT_LIMIT = 24;

export default function CatalogGrid({
  categoria,
  subcategoria,
  initialSearch = "",
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("recientes"); // recientes | precio-asc | precio-desc
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // fetch catálogo del back
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (categoria) params.set("categoria", categoria);
        if (subcategoria) params.set("subcategoria", subcategoria);
        if (search?.trim()) params.set("q", search.trim());
        params.set("page", String(page));
        params.set("limit", String(DEFAULT_LIMIT));
        // si tu back entiende 'sort' lo mandamos:
        // recientes | precio-asc | precio-desc  (podés mapearlo en tu back)
        params.set("sort", sort);

        const { data } = await api.get(`/api/productos?${params.toString()}`);

        // soporta dos formatos: array directo o { items, page, pages, total }
        const dataItems = Array.isArray(data) ? data : data.items || [];
        const dataPage = data.page || page;
        const dataPages = data.pages || 1;
        const dataTotal = data.total ?? dataItems.length;

        // normalizo para ProductCard
        const norm = dataItems.map((raw) => {
          const p = normalizeProduct(raw);
          return {
            ...raw, // por si el Card necesita algo extra
            _id: p.id,
            nombre: p.nombre,
            imagen: p.imagenes?.[0],
            precio: p.precio,
            precioOriginal: p.precioOriginal,
            categoria: p.categoria,
            subcategoria: p.subcategoria,
            stock: p.stock,
            destacado: p.destacado,
          };
        });

        if (!alive) return;
        setItems(norm);
        setPage(dataPage);
        setPages(dataPages);
        setTotal(dataTotal);
      } catch (e) {
        if (!alive) return;
        setItems([]);
        setPage(1);
        setPages(1);
        setTotal(0);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [categoria, subcategoria, search, sort, page]);

  // fallback de ordenamiento si el back no ordena
  const sorted = useMemo(() => {
    if (sort === "precio-asc")
      return [...items].sort((a, b) => Number(a.precio) - Number(b.precio));
    if (sort === "precio-desc")
      return [...items].sort((a, b) => Number(b.precio) - Number(a.precio));
    return items;
  }, [items, sort]);

  return (
    <section className="catalog">
    <div className="catalog-header">
      <h1 className="catalog-title">Todos los productos</h1>
    </div>

      <FiltersBar
        loading={loading}
        search={search}
        onSearch={setSearch}
        sort={sort}
        onSort={setSort}
        total={total}
      />

      {loading ? (
        <div className="grid skeleton">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card-skel" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="empty-state">
          Sin resultados. Probá cambiando el filtro o la búsqueda.
        </div>
      ) : (
        <>
          <div className="grid">
            {sorted.map((p) => (
              <ProductCard key={p._id} producto={p} />
            ))}
          </div>

          {pages > 1 && (
            <Pagination
              page={page}
              pages={pages}
              onChange={(p) => window.scrollTo({ top: 0, behavior: "smooth" }) || setPage(p)}
            />
          )}
        </>
      )}
    </section>
  );
}
