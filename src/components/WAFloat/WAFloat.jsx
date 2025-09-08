// src/components/WAFloat/WAFloat.jsx
import { useMemo } from "react";
import "../WAFloat/WAFloat.css";

/**
 * Botón flotante de WhatsApp
 * Props opcionales:
 *  - phone: string (override de VITE_SELLER_PHONE)
 *  - message: string (mensaje personalizado; si no, genera uno automático)
 *  - bottom, right: números en px para ajustar posición (por defecto 18/18)
 */
export default function WAFloat({ phone, message, bottom = 18, right = 18 }) {
  const envPhone = (import.meta.env.VITE_SELLER_PHONE || "").replace(/\D/g, "");
  const phoneDigits = (phone || envPhone).replace(/\D/g, "");

  // Si no hay número, no se muestra.
  if (!phoneDigits) {
  console.warn("[WAFloat] No hay número (VITE_SELLER_PHONE ni prop).");
  return null;
}

  const encodedMsg = useMemo(() => {
    if (message && message.trim()) return encodeURIComponent(message.trim());

    const h = new Date().getHours();
    const saludo =
      h < 12 ? "¡Buen día!" : h < 19 ? "¡Hola!" : "¡Buenas noches!";
    const from = typeof window !== "undefined" ? window.location.pathname : "/";
    const texto = [
      `${saludo} 👋 Vengo desde la tienda Aesthetic.`,
      `Me interesa un producto y necesito ayuda.`,
      `Página: ${from}`,
    ].join("\n");
    return encodeURIComponent(texto);
  }, [message]);

  const href = `https://wa.me/${phoneDigits}?text=${encodedMsg}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float"
      style={{ bottom, right }}
      aria-label="Chatear por WhatsApp"
      title="Chatear por WhatsApp"
    >
      <svg
        className="wa-icon"
        viewBox="0 0 32 32"
        width="28"
        height="28"
        aria-hidden="true"
      >
        <path
          d="M19.1 17.4c-.3-.2-1.8-.9-2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.3-.7.1a8.1 8.1 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.4 0-.6.1-.7l.5-.5c.2-.1.3-.3.4-.5s0-.4 0-.6 0-.5-.2-.7-.7-1.6-1-2.2-.6-.5-.8-.5h-.7a1.4 1.4 0 0 0-1 .5 3.7 3.7 0 0 0-1.2 2.7 6.5 6.5 0 0 0 1.4 3.4 14.7 14.7 0 0 0 5.6 5.1 12.4 12.4 0 0 0 3.7 1.4 3.8 3.8 0 0 0 2.6-.8 3.1 3.1 0 0 0 1-2.2c0-.5 0-.7-.1-.8s-.2-.2-.5-.3Z"
          fill="#fff"
        />
        <path
          d="M27.6 4.4A13 13 0 0 0 5.6 23.2L4 28l5-1.6A13 13 0 0 0 28 16.3a13 13 0 0 0-.4-11.9ZM22.8 23a10.3 10.3 0 0 1-9.5 1.2l-.5-.2-3 .9.9-2.9-.2-.5a10.3 10.3 0 1 1 12.3 1.5Z"
          fill="#fff"
        />
      </svg>

      <span className="wa-tooltip" role="tooltip">¿Necesitás ayuda?</span>
    </a>
  );
}
