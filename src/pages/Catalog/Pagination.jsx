// src/components/Catalog/Pagination.jsx
export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const go = (p) => {
    if (p < 1 || p > pages || p === page) return;
    onChange(p);
  };

  const range = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
    range.push(i);
  }

  return (
    <div className="pager">
      <button onClick={() => go(page - 1)} disabled={page === 1}>
        ‹ Anterior
      </button>
      {range.map((n) => (
        <button
          key={n}
          className={n === page ? "active" : ""}
          onClick={() => go(n)}
        >
          {n}
        </button>
      ))}
      <button onClick={() => go(page + 1)} disabled={page === pages}>
        Siguiente ›
      </button>
    </div>
  );
}
