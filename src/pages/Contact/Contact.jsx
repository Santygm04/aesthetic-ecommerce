import "./Contact.css";

const RAW_WA = (import.meta.env.VITE_SELLER_PHONE || "+5493854112412");
const SELLER_WA = RAW_WA.replace(/\D/g, "");
const CONTACT_MAIL = import.meta.env.VITE_CONTACT_EMAIL || "Paulagonzaleslazaro@gmail.com";
const IG_URL = import.meta.env.VITE_IG_URL || "https://instagram.com/";
const FB_URL = import.meta.env.VITE_FB_URL || "https://facebook.com/";

export default function Contact() {
  const onQuickWhatsApp = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget.form || e.currentTarget.closest("form"));
    const nombre = fd.get("nombre") || "";
    const telefono = fd.get("telefono") || "";
    const mensaje = fd.get("mensaje") || "";
    const lines = [
      "Hola 👋 me gustaría hacer una consulta.",
      nombre ? `Nombre: ${nombre}` : "",
      telefono ? `Teléfono: ${telefono}` : "",
      mensaje ? `Mensaje: ${mensaje}` : "",
    ].filter(Boolean);
    const url = `https://wa.me/${SELLER_WA}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onSendMail = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget.form || e.currentTarget.closest("form"));
    const nombre = fd.get("nombre") || "";
    const email = fd.get("email") || "";
    const telefono = fd.get("telefono") || "";
    const mensaje = fd.get("mensaje") || "";
    const subject = `Consulta web - ${nombre || "Cliente"}`;
    const body = [
      `Nombre: ${nombre}`,
      `Email: ${email}`,
      `Teléfono: ${telefono}`,
      "",
      mensaje
    ].join("\n");
    window.location.href = `mailto:${CONTACT_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="contacto-wrap">
      {/* Hero */}
      <div className="contacto-hero">
        <div className="contacto-hero-icon">📞</div>
        <div>
          <h2 className="contacto-title">Contactanos</h2>
          <p className="contacto-sub">Estamos aquí para ayudarte. Escribinos por WhatsApp o completá el formulario.</p>
        </div>
      </div>

      <div className="contacto-grid">
        {/* Tarjeta izquierda: información */}
        <aside className="card info-card">
          <h3 className="card-head"><span className="pin">📍</span> Información de Contacto</h3>

          <ul className="info-list">
            <li>
              <div className="ico">💬</div>
              <div>
                <div className="strong">WhatsApp</div>
                <div className="muted">+{SELLER_WA}</div>
              </div>
              <a className="pill" href={`https://wa.me/${SELLER_WA}`} target="_blank" rel="noreferrer">Abrir</a>
            </li>

            <li>
              <div className="ico">✉️</div>
              <div>
                <div className="strong">Email</div>
                <div className="muted">{CONTACT_MAIL}</div>
              </div>
              <a className="pill" href={`mailto:${CONTACT_MAIL}`}>Enviar</a>
            </li>

            <li>
              <div className="ico">📌</div>
              <div>
                <div className="strong">Ubicación</div>
                <div className="muted">Tucumán, Argentina</div>
              </div>
            </li>

            <li>
              <div className="ico">🚚</div>
              <div>
                <div className="strong">Envíos</div>
                <div className="muted">A todo el país</div>
              </div>
            </li>

            <li>
              <div className="ico">💳</div>
              <div>
                <div className="strong">Pagos</div>
                <div className="muted">Transferencia • 2 Cuotas</div>
              </div>
            </li>
          </ul>
        </aside>

        {/* Tarjeta derecha: formulario */}
        <form className="card form-card">
          <h3 className="card-head"><span className="pin">📝</span> Envíanos un Mensaje</h3>

          <div className="form-grid">
            <div className="fg">
              <label>Nombre *</label>
              <input name="nombre" placeholder="Tu nombre completo" required />
            </div>

            <div className="fg">
              <label>Email</label>
              <input type="email" name="email" placeholder="tu@email.com" />
            </div>

            <div className="fg">
              <label>Teléfono</label>
              <input name="telefono" placeholder="11 2345-6789" />
            </div>

            <div className="fg fg--full">
              <label>Mensaje *</label>
              <textarea name="mensaje" placeholder="Contanos qué necesitás: talles, colores, pedidos especiales, etc." rows={5} required />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn--wa" onClick={onQuickWhatsApp}>● Consulta Rápida</button>
            <button className="btn btn--brand" onClick={onSendMail}>✉ Enviar Mensaje</button>
          </div>
        </form>
      </div>

      {/* Redes */}
      <div className="card social-card">
        <h3 className="card-head"><span className="sun">🌞</span> Seguinos en Redes</h3>
        <div className="social-actions">
          <a className="round" href={IG_URL} target="_blank" rel="noreferrer" title="Instagram">IG</a>
          <a className="round" href={FB_URL} target="_blank" rel="noreferrer" title="Facebook">FB</a>
        </div>
      </div>

      {/* Horarios */}
      <div className="card hours-card">
        <h3 className="card-head"><span className="clock">⏰</span> Horarios de Atención</h3>
        <ul className="hours-list">
          <li><b>Lunes a Viernes:</b> 9:00 – 18:00 hs</li>
          <li><b>Sábados:</b> 9:00 – 13:00 hs</li>
          <li><b>Domingos:</b> Cerrado</li>
        </ul>
        <p className="muted small">Respondemos WhatsApp las 24hs.</p>
      </div>
    </section>
  );
}
