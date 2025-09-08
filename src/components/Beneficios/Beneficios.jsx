// src/components/Beneficios/Beneficios.jsx
import "../../components/Beneficios/Beneficios.css";
import { Link } from "react-router-dom";
import precio from "../../../assets/iconos/precio.png";
import comprar from "../../../assets/iconos/comprar.png";
import pago from "../../../assets/iconos/pago.png";

export default function Beneficios() {
  return (
    <section className="beneficios" aria-labelledby="beneficios-title">
      <h2 id="beneficios-title">¿Como comprar?</h2>
      <div className="beneficios-lista">
        {/* 1) Cómo comprar (mayorista) */}
        <div className="beneficio">
          <div className="icon-wrap">
            <img src={comprar} alt="Cómo comprar" loading="lazy" />
          </div>
          <h3>Cómo comprar (mayorista)</h3>
          <ul className="steps">
            <li>Elegí tus productos desde el catálogo.</li>
            <li>Revisá el mínimo mayorista indicado en cada artículo.</li>
            <li>Confirmá el pedido y los datos de envío.</li>
            <li>Recibí la confirmación y el comprobante.</li>
          </ul>
          <Link to="/category" className="btn-cta">Ver catálogo</Link>
        </div>

        {/* 2) Formas de pago */}
        <div className="beneficio">
          <div className="icon-wrap">
            <img src={pago} alt="Formas de pago" loading="lazy" />
          </div>
          <h3>Formas de pago</h3>
          <p className="lead"> Elegí la opción que mejor se adapte a tu negocio: </p>
          <div className="chips">
            <span className="chip chip-card">Efectivo</span>
            <span className="chip chip-transfer">Transferencia: sin recargo</span>
          </div>
          <small className="footnote"> Los datos de pago se envían al confirmar el pedido. </small>
        </div>

        {/* 3) Precio mayorista */}
        <div className="beneficio-precio">
          <div className="icon-wrap">
            <img src={precio} alt="Precio mayorista" loading="lazy" />
          </div>
          <h3>Precio mayorista</h3>
          <ul className="points">
            <li>El precio publicado aplica al <b>mínimo mayorista</b> indicado.</li>
            <li>Puede haber <b>tramos por cantidad</b> con mejor precio.</li>
            <li>Algunos artículos se venden por <b>pack/bulto</b>.</li>
            <li>Consultá por <b>reposición</b> y <b>mix de talles/colores</b>.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
