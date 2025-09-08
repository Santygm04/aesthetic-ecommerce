import { Link } from "react-router-dom";
import useWishlist from "../../hooks/useWishlist";
import "../../pages/Wishlist/Wishlist.css";

export default function Wishlist() {
  const { list, remove } = useWishlist();
  if (!list.length) return <section className="wl">No tenés favoritos todavía.</section>;

  return (
    <section className="wl">
      <h2>Tus favoritos</h2>
      <div className="wl-grid">
        {list.map((p) => (
          <div key={p._id} className="wl-item">
            <Link to={`/producto/${p._id}`} className="img"><img src={p.imagen} alt={p.nombre} /></Link>
            <div className="name">{p.nombre}</div>
            <div className="price">${Number(p.precio ?? 0).toLocaleString("es-AR")}</div>
            <button onClick={() => remove(p._id)}>Quitar</button>
          </div>
        ))}
      </div>
    </section>
  );
}
