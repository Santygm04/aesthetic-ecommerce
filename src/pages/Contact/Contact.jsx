import "./Contact.css";

const RAW_WA = (import.meta.env.VITE_SELLER_PHONE || "+5493854112412");
const SELLER_WA = RAW_WA.replace(/\D/g, "");
const CONTACT_MAIL = import.meta.env.VITE_CONTACT_EMAIL || "Paulagonzaleslazaro@gmail.com";
const IG_URL = import.meta.env.VITE_IG_URL || "https://instagram.com/";
const FB_URL = import.meta.env.VITE_FB_URL || "https://facebook.com/";

export default function Contact() {
  const onQuickWhatsApp = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget.closest("form"));
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
    const fd = new FormData(e.currentTarget.closest("form"));
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
      mensaje,
    ].join("\n");
    window.location.href = `mailto:${CONTACT_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="cw">

      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-dot" />
            Estamos aquí para vos
          </div>
          <h1>
            Hablemos,<br />
            <span>¿en qué podemos</span><br />
            ayudarte?
          </h1>
          <p>Escribinos por WhatsApp o completá el formulario y te respondemos a la brevedad.</p>
          <div className="hero-badge">
            <span className="online-dot" />
            WhatsApp disponible las 24 hs
          </div>
        </div>
      </div>

      {/* ── Grid principal ── */}
      <div className="main-grid">

        {/* Info */}
        <aside className="card">
          <div className="card-label">Información</div>

          <ul className="info-list">
            <li className="info-item">
              <div className="info-icon ico-wa">💬</div>
              <div className="info-body">
                <div className="info-label-text">WhatsApp</div>
                <div className="info-value">+{SELLER_WA}</div>
              </div>
              <a className="info-action" href={`https://wa.me/${SELLER_WA}`} target="_blank" rel="noreferrer">Abrir</a>
            </li>

            <li className="info-item">
              <div className="info-icon ico-mail">✉️</div>
              <div className="info-body">
                <div className="info-label-text">Email</div>
                <div className="info-value info-value--sm">{CONTACT_MAIL}</div>
              </div>
              <a className="info-action" href={`mailto:${CONTACT_MAIL}`}>Enviar</a>
            </li>

            <li className="info-item">
              <div className="info-icon ico-loc">📍</div>
              <div className="info-body">
                <div className="info-label-text">Ubicación</div>
                <div className="info-value">Santiago del Estero, Argentina</div>
              </div>
            </li>

            <li className="info-item">
              <div className="info-icon ico-ship">🚚</div>
              <div className="info-body">
                <div className="info-label-text">Envíos</div>
                <div className="info-value">A todo el país</div>
              </div>
            </li>

            <li className="info-item">
              <div className="info-icon ico-pay">💳</div>
              <div className="info-body">
                <div className="info-label-text">Medios de pago</div>
                <div className="info-value">Transferencia bancaria</div>
              </div>
            </li>
          </ul>
        </aside>

        {/* Formulario */}
        <form className="card form-card">
          <div className="card-label">Envianos un mensaje</div>

          <div className="form-grid">
            <div className="fg">
              <label>Nombre *</label>
              <input name="nombre" placeholder="Tu nombre completo" required />
            </div>

            <div className="fg">
              <label>Email</label>
              <input type="email" name="email" placeholder="tu@email.com" />
            </div>

            <div className="fg fg--full">
              <label>Teléfono</label>
              <input name="telefono" placeholder="11 2345-6789" />
            </div>

            <div className="fg fg--full">
              <label>Mensaje *</label>
              <textarea
                name="mensaje"
                placeholder="Contanos qué necesitás: talles, colores, pedidos especiales..."
                rows={5}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn--wa" onClick={onQuickWhatsApp}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.123 1.532 5.852L.072 23.928l6.227-1.428A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.825 9.825 0 01-5.012-1.37l-.36-.213-3.697.848.875-3.597-.234-.37A9.818 9.818 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818s9.818 4.398 9.818 9.818-4.398 9.818-9.818 9.818z"/>
              </svg>
              Consulta Rápida
            </button>
            <button className="btn btn--brand" onClick={onSendMail}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Enviar mensaje
            </button>
          </div>
        </form>
      </div>

      {/* ── Fila inferior ── */}
      <div className="bottom-row">

        {/* Redes */}
        <div className="card social-card">
          <div className="card-label">Redes sociales</div>
          <div className="social-block">
            <p className="social-desc">Seguinos para ver las últimas novedades, colecciones y promociones.</p>
            <div className="social-links">
              <a className="soc soc--ig" href={IG_URL} target="_blank" rel="noreferrer" title="Instagram">IG</a>
              <a className="soc soc--fb" href={FB_URL} target="_blank" rel="noreferrer" title="Facebook">FB</a>
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="card">
          <div className="card-label">Horarios de atención</div>
          <ul className="hours-list">
            <li className="hour-row">
              <span className="hour-day">Lunes a Viernes</span>
              <span className="hour-time">9:00 – 18:00 hs</span>
            </li>
            <li className="hour-row">
              <span className="hour-day">Sábados</span>
              <span className="hour-time">9:00 – 13:00 hs</span>
            </li>
            <li className="hour-row hour-row--closed">
              <span className="hour-day">Domingos</span>
              <span className="hour-time">Cerrado</span>
            </li>
          </ul>
          <div className="wa-note">
            <span className="wa-note-dot" />
            WhatsApp disponible todos los días, las 24 hs.
          </div>
        </div>
      </div>

      {/* ── Botón flotante WhatsApp (solo mobile) ── */}
      <a
        className="wa-float"
        href={`https://wa.me/${SELLER_WA}`}
        target="_blank"
        rel="noreferrer"
        title="WhatsApp"
      >
        💬
      </a>
    </section>
  );
}