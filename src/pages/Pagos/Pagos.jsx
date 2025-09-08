// src/pages/Pagos/Pagos.jsx
import "./Pagos.css";

export default function Pagos() {
  return (
    <main className="policy-wrap">
      <div className="policy-card">
        <header className="policy-head">
          <h1>Pagos mayoristas</h1>
          <p>
             Todos los precios
            publicados corresponden a lista mayorista.
          </p>
        </header>

        {/* Aviso destacado: solo transferencia */}
        <div className="policy-banner" role="note" aria-live="polite">
          <span className="banner-emoji" aria-hidden>🛍️</span>
          <div>
            <strong>Por el momento solo aceptamos transferencia bancaria.</strong> Compra mínima{" "}
            <b>$120.000</b>. Requiere <b>DNI</b> y datos de facturación. Emitimos{" "}
            <b>Factura A o B</b> según corresponda, si es envio o retiro.
          </div>
        </div>

        <section className="policy-items">
          {/* 1) Transferencia: único medio habilitado */}
          <article className="policy-item">
            <div className="pi-icon pi-bank" aria-hidden>🏦</div>
            <div className="pi-body">
              <h3>Transferencia bancaria (único medio habilitado)</h3>
              <p>
                Al confirmar la compra, el pedido queda en estado <b>Pendiente de pago</b> y te
                redirigimos a <b>WhatsApp</b> para coordinar los datos de transferencia y el envío.
              </p>
              <ul className="bullets">
                <li>Mostramos <b>CBU/Alias</b> y razón social al cerrar el pedido.</li>
                <li>Tenés <b>24 h</b> para realizar la transferencia y enviar el comprobante.</li>
                <li>Confirmamos el pedido cuando se acredita el pago.</li>
              </ul>
              <div className="chips">
                <span className="chip chip-soft">CBU / Alias</span>
                <span className="chip chip-soft">Redirección a WhatsApp</span>
                <span className="chip">Solo transferencia</span>
              </div>
            </div>
          </article>

          {/* 2) Preparación & envío */}
          <article className="policy-item">
            <div className="pi-icon pi-promo" aria-hidden>🚚</div>
            <div className="pi-body">
              <h3>Preparación & envío</h3>
              <p>
                Los pedidos mayoristas se preparan <b>una vez confirmado y acreditado el pago</b>.
                Coordinamos el envío o retiro con tu transportista.
              </p>
              <ul className="bullets">
                <li>Disponibilidad sujeta a stock al momento de acreditar.</li>
                <li>Costos y tiempos de envío se informan al despachar.</li>
              </ul>
            </div>
          </article>
        </section>

        <footer className="policy-foot">
          ¿Dudas sobre pagos mayoristas? Escribinos por <a href="/contacto">Contacto</a> o WhatsApp.
        </footer>
      </div>
    </main>
  );
}
