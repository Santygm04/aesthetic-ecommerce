import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../../pages/Nosotros/Nosotros.css";
import Indumentaria from "../../../assets/Indumentaria.avif"

export default function Nosotros() {
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in");
    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    };
    const observer = new IntersectionObserver(callback, { threshold: 0.1 });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="nosotros" id="nosotros">
      <div className="nosotros-bg-decor"></div>
      <div className="nosotros-container">
        <h2 className="fade-in">Sobre <span className="brand-highlight">AESTHETIC</span></h2>
        <p className="nosotros-intro fade-in">
          <b>AESTHETIC</b> nace del deseo de ofrecer moda, belleza y estilo en un solo lugar. Fundado por Paula Estefanía González, este emprendimiento busca empoderar a cada persona con productos únicos y seleccionados con amor.
        </p>
        <div className="nosotros-grid">
          <div className="nosotros-texto fade-in">
            <h3>✨ Nuestra esencia</h3>
            <p>
              Nos inspira la estética urbana, juvenil y elegante. Creemos que cada prenda, accesorio o producto de belleza tiene el poder de realzar tu confianza y reflejar tu personalidad.
            </p>
            <h3>¿Qué vas a encontrar?</h3>
            <ul>
              <li>Indumentaria y lencería femenina</li>
              <li>Accesorios y bijouterie con estilo</li>
              <li>Skincare, maquillaje y cuidado corporal</li>
              <li>Promos, novedades y productos exclusivos</li>
            </ul>
            <h3>💖 Nuestro compromiso</h3>
            <p>
              Brindarte una experiencia de compra ágil, con atención personalizada, envíos seguros y un catálogo que se renueva constantemente.
            </p>
            <li><NavLink to="/category" className={"nosotros-boton"}>Ver productos</NavLink></li>
          </div>
          <div className="nosotros-img fade-in">
            <img
              src= {Indumentaria}
              alt="Chica moda Aesthetic"
            />
            <div className="img-brillo"></div>
          </div>
        </div>
        <div className="nosotros-galeria fade-in">
          <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=400&q=80" alt="Galería 1" />
          <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=facearea&w=400&q=80" alt="Galería 2" />
          <img src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=400&q=80" alt="Galería 3" />
        </div>
        <p className="nosotros-final fade-in">
          Gracias por elegirnos. <span className="brand-highlight">¡Bienvenid@ a AESTHETIC</span>, donde el estilo se encuentra con la actitud!
        </p>
      </div>
    </section>
  );
}
