import "../../pages/Envios/Envios.css";

export default function Envios() {
  return (
    <section className="envios">
      <div className="envios-container">
        <h2>Envíos</h2>
        <p className="envios-intro">
          En AESTHETIC buscamos brindarte una experiencia de compra confiable y placentera. <br />
          A continuación, te compartimos toda la información sobre nuestros métodos de envío y política de devoluciones.
        </p>

        <div className="envios-box">
          <h3>🚚 Envíos a todo el país</h3>
          <ul>
            <li>📦 Interior del país: <strong>$10.000/$16.000</strong></li>
          </ul>
          <p>
            Los envíos se despachan dentro de las 24 hs hábiles posteriores a la confirmación del pago.
            Recibirás un código de seguimiento por email.
            El precio Tambien dependera de la compañia que haga los envios.
          </p>
        </div>

        <p className="envios-footer-msg">
          Para más ayuda, contactanos directamente a través de nuestras <a href="/contacto">redes o formulario</a>. Estamos para ayudarte.
        </p>
      </div>
    </section>
  );
}