// src/hooks/useWishlist.js
import { useState } from "react";

const KEY = "aesthetic:wishlist";

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(arr) {
  try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch {}
}

export default function useWishlist() {
  const [list, setList] = useState(() => read());

  const has = (id) => list.some((x) => x._id === id);

  const add = (p) => {
    setList((prev) => {
      if (prev.some((x) => x._id === p._id)) return prev;
      const next = [{ 
        _id:    p._id,
        nombre: p.nombre,
        imagen: p.imagen,
        precio: p.precio,
        stock:  Number(p.stock ?? 1), // ← CAMBIO: guardar stock para evitar falso "agotado"
      }, ...prev];
      write(next);
      return next;
    });
  };

  const remove = (id) => {
    setList((prev) => {
      const next = prev.filter((x) => x._id !== id);
      write(next);
      return next;
    });
  };

  const toggle = (p) => (has(p._id) ? remove(p._id) : add(p));

  return { list, has, add, remove, toggle };
}
