// src/pages/Catalog/FilterBar.jsx
import { useState } from "react";

export default function FiltersBar({ search, onSearch, sort, onSort, total, loading }) {
  return (
    <div className="toolbar">
      <div className="left">
        <span className="count">{loading ? "…" : `${total} productos`}</span>
        <input
          className="search"
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="right">
        <label className="lbl">Ordenar:</label>
        <select
          className="select"
          value={sort}
          onChange={(e) => onSort(e.target.value)}
        >
          <option value="recientes">Más recientes</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
        </select>
      </div>
    </div>
  );
}