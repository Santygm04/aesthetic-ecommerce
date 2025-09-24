import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getUnseenOrdersCount, resetOrdersUnseen } from "../../utils/ordersBadge.js";
import "./OrdersNavLink.css";

export default function OrdersNavLink() {
  const [count, setCount] = useState(getUnseenOrdersCount());

  useEffect(() => {
    const onPing = (e) => setCount(e?.detail?.count ?? getUnseenOrdersCount());
    const onStorage = (e) => {
      if (e.key === "orders_unseen_count") setCount(getUnseenOrdersCount());
    };
    window.addEventListener("orders:badge", onPing);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("orders:badge", onPing);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <NavLink
      to="/pedidos"
      className={({ isActive }) => "orders-nav-link" + (isActive ? " active" : "")}
      onClick={resetOrdersUnseen}
    >
      Mis pedidos
      {count > 0 && <span className="orders-badge">{count > 9 ? "9+" : count}</span>}
    </NavLink>
  );
}
