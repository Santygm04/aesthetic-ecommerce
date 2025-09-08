import { NavLink } from "react-router-dom";
import "../../components/Footer/Footer.css";

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-main">
        <div className="footer-brand">
          <h3>AESTHETIC</h3>
          <p>Moda, belleza y tendencias para vos.</p>

          {/* Badge mayorista (ahora fucsia) */}
          <div className="wh-badge" role="note">
            Solo mayoristas · Mínimo <b>$120.000</b>
          </div>
        </div>

        <div className="footer-links">
          <div>
            <h4>Secciones</h4>
            <ul>
              <li><NavLink to="/category">Categorías</NavLink></li>
              <li><NavLink to="/promos">Promos</NavLink></li>
              <li><NavLink to="/contacto">Contacto</NavLink></li>
              <li><NavLink to="/nosotros">Nosotros</NavLink></li>
            </ul>
          </div>
          <div>
            <h4>Pagos & envíos</h4>
            <ul>
              <li><NavLink to="/pagos">Pagos mayoristas</NavLink></li>
              <li><NavLink to="/envios">Envíos</NavLink></li>
              {/* externas se mantienen como <a> */}
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-contact">
          <h4>Contacto</h4>
          <p>Mail: Paulagonzaleslazaro@gmail.com</p>
          <p>WhatsApp: +5493854112412</p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AESTHETIC. Todos los derechos reservados.</span>
        <span className="footer-sep" aria-hidden="true"> • </span>
        <small className="footer-credit">
          Sitio creado por{" "}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Autor del sitio"
          >
            Santiago Gil Mina
          </a>
        </small>
      </div>
    </footer>
  );
}
