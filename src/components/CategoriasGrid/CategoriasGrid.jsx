// src/components/CategoriasGrid/CategoriasGrid.jsx
import { Link } from "react-router-dom";
import "../../components/CategoriasGrid/CategoriasGrid.css";
import skincareImg from "../../../assets/Skincaree.PNG";
import bodycareImg from "../../../assets/Bodycare.png"
import unasImg from "../../../assets/Unas.PNG";
import pestañasImg from "../../../assets/Pestanas.PNG";
import peluqueriaImg from "../../../assets/Peluquería.PNG";
import marroquineriaImg from "../../../assets/Marroquineria.PNG";
import maquillajeImg from "../../../assets/Maquillajes.PNG";
import bijouteriaImg from "../../../assets/Bijouterie.PNG";
import lenceriaImg from "../../../assets/Lenceria.PNG";
import accesoriosImg from "../../../assets/Accesorios.PNG"; 
import conjuntosImg from "../../../assets/Conjuntos.PNG"
import topsImg from "../../../assets/TOPS.PNG"
import vedetinasImg from "../../../assets/Vedetinas.PNG"
import colalesImg from "../../../assets/Colales.PNG"
import slipImg from "../../../assets/Slips.PNG"
import boxerImg from "../../../assets/Boxers.PNG"
import mediasImg from "../../../assets/Medias.PNG"
import niñaImg from "../../../assets/Niña.PNG"
import masvendidosImg from "../../../assets/Masvendidos.png"
import nuevosingresosImg from "../../../assets/Nuevosingresos.png"
import ofertasImg from "../../../assets/Ofertas.png"
import todolosproductosImg from "../../../assets/Todoslosproductos.png"

const FEATURED = [
    { id: "nuevos-ingresos", label: "NUEVOS INGRESOS",    to: "/category/nuevos-ingresos",  img: nuevosingresosImg, tone: "t-violet"  },
    { id: "todos",           label: "TODOS LOS PRODUCTOS", to: "/catalog",                  img: todolosproductosImg, tone: "t-pink"    },
    { id: "ofertas",         label: "OFERTAS / PROMOCIONES", to: "/promos",                 img: ofertasImg, tone: "t-peach"   },
    { id: "mas-vendidos",    label: "MÁS VENDIDOS",             to: "/mas-vendidos",        img: masvendidosImg, tone: "t-beige" },
];

const CATEGORIES = [
  { id: "skincare",   label: "SKIN CARE",    to: "/category/skincare",      img: skincareImg,     tone: "t-pink-soft"  },
  { id: "bodycare",   label: "BODY CARE",    to: "/category/bodycare",      img: bodycareImg,     tone: "t-pink-soft"  },
  { id: "unas",       label: "UÑAS",         to: "/category/uñas",          img: unasImg,         tone: "t-nude"       },
  { id: "pestañas",   label: "PESTAÑAS",     to: "/category/pestañas",      img: pestañasImg,     tone: "t-gray"       },
  { id: "peluqueria", label: "PELUQUERÍA",   to: "/category/peluquería",    img: peluqueriaImg,   tone: "t-violet-soft"},
  { id: "bolsos",     label: "MARROQUINERÍA",to: "/category/marroquineria", img: marroquineriaImg,tone: "t-rose"       },
  { id: "maquillaje", label: "MAQUILLAJE",   to: "/category/maquillaje",    img: maquillajeImg,   tone: "t-pink"       },
  { id: "bijouteria", label: "BIJOUTERIE",   to: "/category/bijouteria",    img: bijouteriaImg,   tone: "t-peach"      },
  { id: "lenceria",   label: "LENCERÍA",     to: "/category/lenceria",      img: lenceriaImg,     tone: "t-rose"       },
  { id: "accesorios", label: "ACCESORIOS",   to: "/category/accesorios",    img: accesoriosImg,   tone: "t-violet-soft"},
];

/* Subcategorías de Lencería */
const LENCERIA_SUBS = [
  { id: "conjuntos",  label: "CONJUNTOS",   to: "/category/lenceria/conjuntos",  img: conjuntosImg, tone: "t-pink-soft" },
  { id: "tops",       label: "TOPS",        to: "/category/lenceria/tops-y-corpiños",       img: topsImg, tone: "t-nude"      },
  { id: "vedetinas",  label: "VEDETINAS",   to: "/category/lenceria/vedetinas",  img: vedetinasImg, tone: "t-cream"     },
  { id: "colales",    label: "COLALES",     to: "/category/lenceria/colales",    img: colalesImg, tone: "t-rose"      },
  { id: "boxer",      label: "BOXERS",       to: "/category/lenceria/boxer",      img: boxerImg, tone: "t-violet-soft"},
  { id: "slip",       label: "SLIPS",        to: "/category/lenceria/slip",       img: slipImg, tone: "t-pink"      },
  { id: "medias",     label: "MEDIAS",      to: "/category/lenceria/medias",     img: mediasImg, tone: "t-peach"     },
  { id: "niña",       label: "NIÑA",        to: "/category/lenceria/Niña",       img: niñaImg, tone: "t-pink-soft" },
];

function Tile({ item, big = false }) {
  return (
    <div className={`cat-tile-wrap${big ? " is-big" : ""}`}>
      <Link
        to={item.to}
        className={`cat-tile ${item.tone}${big ? " is-big" : ""}`}
        style={item.img ? { backgroundImage: `url(${item.img})` } : undefined}
        aria-label={item.label}
      >
        <span className="cat-tile-overlay" aria-hidden />
        <span className="cat-tile-label">{item.label}</span>
      </Link>
      <span className="cat-tile-name">{item.label}</span>
    </div>
  );
}

export default function CategoriasGrid() {
  return (
    <section className="cat-grid-section" aria-labelledby="cat-grid-title">
      <h2 id="cat-grid-title" className="cat-grid-title">Categorías</h2>
      <p className="cat-grid-sub">Explorá nuestras secciones</p>

      {/* 4 tiles grandes */}
      <div className="cat-grid cat-grid-featured">
        {FEATURED.map((it) => <Tile key={it.id} item={it} big />)}
      </div>

      {/* 10 categorías regulares (5+5) */}
      <div className="cat-grid cat-grid-regular">
        {CATEGORIES.map((it) => <Tile key={it.id} item={it} />)}
      </div>

      {/* Subcategorías de Lencería */}
      <div className="cat-subcat-title">
        <span>Lencería</span>
        <span className="cat-subcat-dash" aria-hidden />
      </div>
      <div className="cat-grid cat-grid-subs">
        {LENCERIA_SUBS.map((it) => <Tile key={it.id} item={it} />)}
      </div>
    </section>
  );
}