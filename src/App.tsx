import { useState, useEffect, useRef } from "react"
import {
  Search,
  User,
  ShoppingCart,
  X,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Send,
  Check,
  ArrowLeft,
} from "lucide-react"
import heroBg from "./imports/1015203.jpg"

const CURRENCIES = [
  "USD",
  "ARS",
  "MXN",
  "COP",
  "CLP",
  "PEN",
  "GTQ",
  "SVC",
  "PYG",
  "UYU",
  "BOB",
  "VES",
  "DOP",
  "BZD",
  "HNL",
  "NIO",
  "PAB",
  "CRC",
]

const PRODUCTS = [
  {
    id: 1,
    name: "Vintage Noir Jacket",
    price: "$45",
    image:
      "https://images.unsplash.com/photo-1660486044177-45cd45bb5e99?q=80&w=600&auto=format&fit=crop",
    category: "Outerwear",
    size: "XL",
    condition: "Vintage 9/10",
    seller: "@ThriferOax",
    rating: "4.9",
    location: "Oaxaca, MEX",
    styles: ["Streetwear", "Vintage 90s"],
    verified: true,
  },
  {
    id: 2,
    name: "Urban Skater Cap",
    price: "$20",
    image:
      "https://images.unsplash.com/photo-1721637635502-b0abaaa75edb?q=80&w=600&auto=format&fit=crop",
    category: "Headwear",
    size: "OSFA",
    condition: "Deadstock",
    seller: "@CoolFinds",
    rating: "5.0",
    location: "CDMX, MEX",
    styles: ["Streetwear"],
    verified: true,
  },
  {
    id: 3,
    name: "Retro Checkered Coat",
    price: "$65",
    image:
      "https://images.unsplash.com/photo-1691689761290-2641cf0fc59a?q=80&w=600&auto=format&fit=crop",
    category: "Outerwear",
    size: "L",
    condition: "Gently Used",
    seller: "@VintageClub",
    rating: "4.8",
    location: "Guadalajara, MEX",
    styles: ["Vintage 90s", "Avant Garde"],
    verified: false,
  },
  {
    id: 4,
    name: "Leather Utility Jacket",
    price: "$85",
    image:
      "https://images.unsplash.com/photo-1576775068668-c147f14c36f7?q=80&w=600&auto=format&fit=crop",
    category: "Outerwear",
    size: "M",
    condition: "Like New",
    seller: "@ThriftGod",
    rating: "4.7",
    location: "Monterrey, MEX",
    styles: ["Streetwear"],
    verified: true,
  },
  {
    id: 5,
    name: "Y2K Cargo Pants",
    price: "$50",
    image:
      "https://images.unsplash.com/photo-1576775068668-c147f14c36f7?q=80&w=600&auto=format&fit=crop",
    category: "Bottoms",
    size: "32",
    condition: "Good",
    seller: "@Y2K_Archive",
    rating: "4.6",
    location: "Puebla, MEX",
    styles: ["Y2K", "Streetwear"],
    verified: false,
  },
  {
    id: 6,
    name: "Oversized Graphic Tee",
    price: "$30",
    image:
      "https://images.unsplash.com/photo-1721637635502-b0abaaa75edb?q=80&w=600&auto=format&fit=crop",
    category: "Tops",
    size: "L",
    condition: "Vintage 8/10",
    seller: "@TeeCollector",
    rating: "4.9",
    location: "CDMX, MEX",
    styles: ["Vintage 90s", "Streetwear"],
    verified: true,
  },
  {
    id: 7,
    name: "Mesh Layer Top",
    price: "$28",
    image:
      "https://images.unsplash.com/photo-1721637635502-b0abaaa75edb?q=80&w=600&auto=format&fit=crop",
    category: "Tops",
    size: "S",
    condition: "Vintage 8/10",
    seller: "@Y2K_Archive",
    rating: "4.8",
    location: "Puebla, MEX",
    styles: ["Y2K"],
    verified: false,
  },
  {
    id: 8,
    name: "Deconstructed Blazer",
    price: "$95",
    image:
      "https://images.unsplash.com/photo-1691689761290-2641cf0fc59a?q=80&w=600&auto=format&fit=crop",
    category: "Outerwear",
    size: "M",
    condition: "Like New",
    seller: "@VintageClub",
    rating: "4.9",
    location: "Guadalajara, MEX",
    styles: ["Avant Garde"],
    verified: true,
  },
  {
    id: 9,
    name: "Ripstop Cargo Shorts",
    price: "$38",
    image:
      "https://images.unsplash.com/photo-1576775068668-c147f14c36f7?q=80&w=600&auto=format&fit=crop",
    category: "Bottoms",
    size: "30",
    condition: "Good",
    seller: "@ThriftGod",
    rating: "4.7",
    location: "Monterrey, MEX",
    styles: ["Streetwear"],
    verified: true,
  },
  {
    id: 10,
    name: "Faded Denim Jeans",
    price: "$42",
    image:
      "https://images.unsplash.com/photo-1660486044177-45cd45bb5e99?q=80&w=600&auto=format&fit=crop",
    category: "Bottoms",
    size: "34",
    condition: "Gently Used",
    seller: "@ThriferOax",
    rating: "4.9",
    location: "Oaxaca, MEX",
    styles: ["Vintage 90s"],
    verified: true,
  },
  {
    id: 11,
    name: "Tech Sling Bag",
    price: "$55",
    image:
      "https://images.unsplash.com/photo-1660486044177-45cd45bb5e99?q=80&w=600&auto=format&fit=crop",
    category: "Accesorios",
    size: "OSFA",
    condition: "Deadstock",
    seller: "@ThriftGod",
    rating: "5.0",
    location: "Monterrey, MEX",
    styles: ["Streetwear", "Avant Garde"],
    verified: true,
  },
  {
    id: 12,
    name: "Chrome Frame Shades",
    price: "$25",
    image:
      "https://images.unsplash.com/photo-1721637635502-b0abaaa75edb?q=80&w=600&auto=format&fit=crop",
    category: "Accesorios",
    size: "OSFA",
    condition: "Vintage 9/10",
    seller: "@CoolFinds",
    rating: "4.6",
    location: "CDMX, MEX",
    styles: ["Y2K"],
    verified: false,
  },
  {
    id: 13,
    name: "Knit Beanie",
    price: "$15",
    image:
      "https://images.unsplash.com/photo-1691689761290-2641cf0fc59a?q=80&w=600&auto=format&fit=crop",
    category: "Headwear",
    size: "OSFA",
    condition: "Good",
    seller: "@TeeCollector",
    rating: "4.5",
    location: "CDMX, MEX",
    styles: ["Streetwear", "Vintage 90s"],
    verified: false,
  },
]

const CATEGORY_TABS = [
  { key: "all", label: "Todo" },
  { key: "tops", label: "Tops" },
  { key: "bottoms", label: "Bottoms" },
  { key: "accesorios", label: "Accesorios" },
]

// Qué categorías de prenda entran en cada pestaña del header
const CATEGORY_GROUPS: Record<string, string[]> = {
  tops: ["Tops", "Outerwear"],
  bottoms: ["Bottoms"],
  accesorios: ["Headwear", "Accesorios"],
}

const STYLE_FILTERS = ["Y2K", "Avant Garde", "Streetwear", "Vintage 90s"]
const SIZE_FILTERS = ["XS", "S", "M", "L", "XL", "XXL", "OSFA", "30", "32", "34"]

const priceOf = (product: (typeof PRODUCTS)[0]) =>
  Number(product.price.replace(/[^0-9.]/g, ""))

const COMMUNITIES = [
  {
    id: 1,
    name: "Y2K ARCHIVES",
    image:
      "https://images.unsplash.com/photo-1492681290082-e932832941e6?q=80&w=800&auto=format&fit=crop",
    tag: "ARCHIVO",
    members: 1245,
    dropsToday: 34,
    curator: "@Y2K_Archive",
    location: "Puebla, MEX",
    description:
      "Cápsulas del 99 al 2005. Denim bajo, mesh, baby tees y todo lo que el internet temprano dejó atrás.",
    rules: [
      "Solo prendas fabricadas entre 1998 y 2006.",
      "Foto real de la prenda, nada de catálogos.",
      "Precio visible en la descripción o el drop se elimina.",
      "Cero réplicas: si es fake, es ban.",
    ],
    membersList: [
      { user: "@Y2K_Archive", role: "CURADOR", drops: 84 },
      { user: "@ThriferOax", role: "DEALER", drops: 41 },
      { user: "@TeeCollector", role: "DEALER", drops: 29 },
      { user: "@lowrise", role: "EXPLORADOR", drops: 0 },
    ],
    drops: [5, 6, 1, 7],
  },
  {
    id: 2,
    name: "AVANT GARDE",
    image:
      "https://images.unsplash.com/photo-1509631179647-0c739a4f686c?q=80&w=800&auto=format&fit=crop",
    tag: "DISEÑO",
    members: 872,
    dropsToday: 12,
    curator: "@VintageClub",
    location: "Guadalajara, MEX",
    description:
      "Silueta sobre tendencia. Piezas deconstruidas, patronaje raro y diseñadores independientes.",
    rules: [
      "Piezas con propuesta de diseño, no basics.",
      "Indica diseñador o taller si lo conoces.",
      "Se permite hecho a mano y upcycling.",
      "Ficha de medidas obligatoria.",
    ],
    membersList: [
      { user: "@VintageClub", role: "CURADOR", drops: 66 },
      { user: "@ThriferOax", role: "DEALER", drops: 38 },
      { user: "@pattern.err", role: "DEALER", drops: 17 },
      { user: "@studio.oax", role: "EXPLORADOR", drops: 0 },
    ],
    drops: [3, 1, 8],
  },
  {
    id: 3,
    name: "TECHWEAR GANG",
    image:
      "https://images.unsplash.com/photo-1511511450040-677116ff389e?q=80&w=800&auto=format&fit=crop",
    tag: "UTILITY",
    members: 2038,
    dropsToday: 51,
    curator: "@ThriftGod",
    location: "Monterrey, MEX",
    description:
      "Shells impermeables, arneses, nylon ripstop y capas técnicas listas para la calle.",
    rules: [
      "Solo prendas técnicas o utilitarias.",
      "Declara membrana e impermeabilidad real.",
      "Prohibido vender prendas con cierres rotos.",
      "Los intercambios se cierran dentro del colectivo.",
    ],
    membersList: [
      { user: "@ThriftGod", role: "CURADOR", drops: 120 },
      { user: "@CoolFinds", role: "DEALER", drops: 73 },
      { user: "@ripstop", role: "DEALER", drops: 44 },
      { user: "@night.ops", role: "EXPLORADOR", drops: 0 },
    ],
    drops: [4, 2, 9, 11],
  },
]

const SALES = [
  {
    id: "AP-1042",
    product: "Vintage Noir Jacket",
    buyer: "@luna.thrift",
    date: "08 SEP",
    amount: "$45",
    status: "ENVIADO",
  },
  {
    id: "AP-1041",
    product: "Urban Skater Cap",
    buyer: "@mesh.kid",
    date: "07 SEP",
    amount: "$20",
    status: "ENTREGADO",
  },
  {
    id: "AP-1040",
    product: "Retro Checkered Coat",
    buyer: "@nova.2000",
    date: "05 SEP",
    amount: "$65",
    status: "PENDIENTE",
  },
  {
    id: "AP-1039",
    product: "Leather Utility Jacket",
    buyer: "@ripstop",
    date: "03 SEP",
    amount: "$85",
    status: "ENTREGADO",
  },
  {
    id: "AP-1038",
    product: "Oversized Graphic Tee",
    buyer: "@shell.mx",
    date: "01 SEP",
    amount: "$30",
    status: "ENTREGADO",
  },
]

const PURCHASES = [
  {
    id: "AP-2091",
    productId: 5,
    seller: "@Y2K_Archive",
    date: "06 SEP",
    amount: "$50",
    status: "EN CAMINO",
    tracking: "MX-884213",
  },
  {
    id: "AP-2088",
    productId: 2,
    seller: "@CoolFinds",
    date: "29 AGO",
    amount: "$20",
    status: "ENTREGADO",
    tracking: "MX-881907",
  },
  {
    id: "AP-2084",
    productId: 4,
    seller: "@ThriftGod",
    date: "21 AGO",
    amount: "$85",
    status: "ENTREGADO",
    tracking: "MX-879442",
  },
]

const CHATS = [
  {
    id: 1,
    user: "@luna.thrift",
    about: "Vintage Noir Jacket",
    unread: 2,
    time: "10:24",
  },
  {
    id: 2,
    user: "@nova.2000",
    about: "Retro Checkered Coat",
    unread: 0,
    time: "AYER",
  },
  {
    id: 3,
    user: "@ripstop",
    about: "Leather Utility Jacket",
    unread: 0,
    time: "05 SEP",
  },
]

type ChatMessage = { from: "me" | "them"; text: string; time: string }

const INITIAL_THREADS: Record<number, ChatMessage[]> = {
  1: [
    {
      from: "them",
      text: "Hola, sigue disponible la Noir Jacket?",
      time: "10:18",
    },
    { from: "me", text: "Sí, la tengo apartada hasta mañana.", time: "10:20" },
    { from: "them", text: "Me pasas medidas de hombro y largo?", time: "10:24" },
  ],
  2: [
    {
      from: "them",
      text: "Aceptas cambio por unos cargo talla L?",
      time: "18:02",
    },
    { from: "me", text: "Mándame fotos y lo checo.", time: "18:40" },
  ],
  3: [
    { from: "me", text: "Ya salió tu paquete, guía adjunta.", time: "09:15" },
    { from: "them", text: "Perfecto, gracias. Todo llegó bien.", time: "12:03" },
  ],
}

const MONTHLY = [
  { month: "ABR", value: 320 },
  { month: "MAY", value: 480 },
  { month: "JUN", value: 410 },
  { month: "JUL", value: 690 },
  { month: "AGO", value: 850 },
  { month: "SEP", value: 1120 },
]

const TOP_PRODUCTS = [
  { name: "Leather Utility Jacket", views: 1840, pct: 100 },
  { name: "Vintage Noir Jacket", views: 1320, pct: 72 },
  { name: "Y2K Cargo Pants", views: 980, pct: 53 },
  { name: "Retro Checkered Coat", views: 910, pct: 49 },
  { name: "Urban Skater Cap", views: 640, pct: 35 },
]

const TRAFFIC = [
  { src: "Colectivos", pct: "42%" },
  { src: "Búsqueda interna", pct: "27%" },
  { src: "Recomendados", pct: "19%" },
  { src: "Externo", pct: "12%" },
]

// Unified mode - no more dealer/explorer toggle
const borderClass = "border-black"
const invertBgClass = "bg-black text-white"
const hoverInvertClass = "hover:bg-black hover:text-white"

type Nav = {
  onNavigate: (view: string, category?: string) => void
  onOpenCart: () => void
  isSearchOpen: boolean
  setIsSearchOpen: (open: boolean) => void
}

function ProductCard({ product }: { product: (typeof PRODUCTS)[0] }) {
  return (
    <div
      className={`group flex flex-col cursor-pointer border-4 ${borderClass} p-2 ${hoverInvertClass} transition-none min-w-[280px] sm:min-w-[320px] max-w-[320px] shrink-0 snap-start`}
    >
      <div
        className={`aspect-[3/4] w-full overflow-hidden border-4 ${borderClass} mb-4 relative bg-black`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-none"
        />
      </div>
      <div className="flex flex-col gap-2 p-1">
        <h3 className="font-display font-bold text-xl uppercase leading-tight truncate">
          {product.name}
        </h3>
        <div className="font-body text-xs font-semibold flex flex-wrap gap-2 uppercase tracking-wide">
          <span className={`border-2 ${borderClass} px-2 py-1`}>
            {product.category}
          </span>
          <span className={`border-2 ${borderClass} px-2 py-1`}>
            Size: {product.size}
          </span>
          <span className={`border-2 ${borderClass} px-2 py-1`}>
            {product.condition}
          </span>
        </div>
        <div className="flex items-center gap-1 font-body text-xs uppercase font-bold mt-1">
          <MapPin size={12} strokeWidth={2.5} /> {product.location}
        </div>
        <div className="flex justify-between items-center mt-2 border-t-4 border-dashed border-current pt-2">
          <div className="flex flex-col">
            <span className="font-body font-bold">{product.seller}</span>
            <span className="font-body text-sm flex items-center gap-1">
              <Star size={12} fill="currentColor" /> {product.rating}
            </span>
          </div>
          <span className="font-display text-3xl font-bold">
            {product.price}
          </span>
        </div>
      </div>
    </div>
  )
}

function Header({
  transparent = false,
  hideBorder = false,
  onNavigate,
  onOpenCart,
  isSearchOpen,
  setIsSearchOpen,
}: Nav & { transparent?: boolean; hideBorder?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isSolid = !transparent || isScrolled

  return (
    <div
      className={`w-full flex justify-between items-center p-6 fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        !isSolid
          ? "bg-transparent text-white"
          : `bg-white text-black ${
              !hideBorder || isScrolled ? "border-b-4 border-black" : ""
            }`
      }`}
    >
      <div className="flex gap-6 items-center">
        <button
          onClick={() => onNavigate("landing")}
          className="font-display font-bold text-3xl uppercase tracking-tighter"
        >
          ALLPACA
        </button>
        <nav className="hidden md:flex gap-6 font-display font-bold">
          <button
            onClick={() => onNavigate("list", "all")}
            className="hover:underline underline-offset-4 decoration-2 uppercase"
          >
            Directorio
          </button>
          <button
            onClick={() => onNavigate("communities")}
            className="hover:underline underline-offset-4 decoration-2 uppercase"
          >
            Comunidades
          </button>
          <button
            onClick={() => onNavigate("dashboard")}
            className="hover:underline underline-offset-4 decoration-2 uppercase"
          >
            Dashboard
          </button>

          <span className="opacity-50 mx-2">|</span>
          <button
            onClick={() => onNavigate("list", "tops")}
            className="hover:underline underline-offset-4 decoration-2"
          >
            Tops
          </button>
          <button
            onClick={() => onNavigate("list", "bottoms")}
            className="hover:underline underline-offset-4 decoration-2"
          >
            Bottoms
          </button>
          <button
            onClick={() => onNavigate("list", "accesorios")}
            className="hover:underline underline-offset-4 decoration-2"
          >
            Accesorios
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          {isSearchOpen && (
            <input
              type="text"
              placeholder="Buscar..."
              autoFocus
              className="absolute right-full mr-2 w-48 sm:w-64 rounded-full border-2 border-current bg-transparent py-2 px-4 text-sm font-body uppercase focus:outline-none placeholder:text-current/50 animate-in fade-in slide-in-from-right-4"
            />
          )}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 border-2 border-transparent hover:border-current transition-colors rounded-full"
          >
            <Search size={28} strokeWidth={2.5} />
          </button>
        </div>
        <button
          onClick={() => onNavigate("profile")}
          className="p-2 border-2 border-transparent hover:border-current transition-colors rounded-full"
        >
          <User size={28} strokeWidth={2.5} />
        </button>
        <button
          onClick={onOpenCart}
          className="p-2 border-2 border-transparent hover:border-current transition-colors rounded-full"
        >
          <ShoppingCart size={28} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

function LandingView(nav: Nav) {
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth / 2
          : scrollLeft + clientWidth / 2
      carouselRef.current.scrollTo({ left: scrollTo, behavior: "smooth" })
    }
  }

  return (
    <div className="w-full flex flex-col">
      <section className="relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden pt-20">
        <Header {...nav} transparent hideBorder />
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={heroBg}
            alt="Hero"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full max-w-7xl px-4 pointer-events-none text-center">
          <div className="flex flex-col items-center animate-fade-in-up">
            <h1 className="font-display text-[12vw] leading-none uppercase tracking-tighter text-white">
              ALLPACA
            </h1>
            <p className="font-signature text-6xl sm:text-7xl lg:text-[6rem] text-white tracking-normal mt-2 animate-pulse-slow">
              Como nuevo
            </p>
          </div>
        </div>
      </section>

      <section className="w-full py-16 px-0 sm:px-12 md:px-20 max-w-[1800px] mx-auto overflow-hidden">
        <div className="flex justify-between items-center mb-12 mx-6 sm:mx-0 border-b-4 border-black pb-4">
          <h2 className="font-display text-4xl sm:text-5xl uppercase inline-block">
            Recomendados para ti
          </h2>
          <div className="hidden sm:flex gap-4">
            <button
              onClick={() => scrollCarousel("left")}
              className="w-12 h-12 flex items-center justify-center border-4 border-black hover:bg-black hover:text-white transition-colors"
            >
              <ChevronLeft size={28} strokeWidth={3} />
            </button>
            <button
              onClick={() => scrollCarousel("right")}
              className="w-12 h-12 flex items-center justify-center border-4 border-black hover:bg-black hover:text-white transition-colors"
            >
              <ChevronRight size={28} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll / Carousel */}
        <div
          ref={carouselRef}
          className="w-full overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          <div className="flex gap-8 px-6 sm:px-0 w-max">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ListView({
  category,
  onCategoryChange,
  ...nav
}: Nav & { category: string; onCategoryChange: (category: string) => void }) {
  const [query, setQuery] = useState("")
  const [styles, setStyles] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [ratings, setRatings] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const toggle = (
    list: string[],
    setList: (value: string[]) => void,
    value: string,
  ) =>
    setList(
      list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value],
    )

  const clearFilters = () => {
    setQuery("")
    setStyles([])
    setSizes([])
    setRatings([])
    setMinPrice("")
    setMaxPrice("")
  }

  const hasFilters =
    query !== "" ||
    styles.length > 0 ||
    sizes.length > 0 ||
    ratings.length > 0 ||
    minPrice !== "" ||
    maxPrice !== ""

  const results = PRODUCTS.filter((p) => {
    const group = CATEGORY_GROUPS[category]
    if (group && !group.includes(p.category)) return false

    const q = query.trim().toLowerCase()
    if (
      q &&
      ![p.name, p.seller, p.category, p.location].some((field) =>
        field.toLowerCase().includes(q),
      )
    )
      return false

    if (styles.length && !p.styles.some((s) => styles.includes(s))) return false
    if (sizes.length && !sizes.includes(p.size)) return false

    const value = priceOf(p)
    if (minPrice !== "" && value < Number(minPrice)) return false
    if (maxPrice !== "" && value > Number(maxPrice)) return false

    if (ratings.includes("5") && Number(p.rating) < 5) return false
    if (ratings.includes("4") && Number(p.rating) < 4) return false
    if (ratings.includes("verified") && !p.verified) return false

    return true
  })

  const activeTab = CATEGORY_TABS.find((t) => t.key === category)

  return (
    <div className="w-full min-h-screen pt-[100px] flex flex-col">
      <Header {...nav} />
      <div className="w-full px-6 py-8">
        <div className="w-full max-w-3xl mx-auto mb-8">
          <div className="relative flex items-center">
            <Search className="absolute left-4 opacity-50" size={24} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en el directorio..."
              className={`w-full rounded-full border-2 ${borderClass} py-4 pl-12 pr-6 font-display text-lg uppercase focus:outline-none focus:ring-4 focus:ring-black/10`}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="w-full max-w-[1800px] mx-auto flex flex-wrap gap-4 mb-8">
          {CATEGORY_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onCategoryChange(t.key)}
              className={`px-6 py-3 border-4 ${borderClass} font-display text-lg uppercase font-bold transition-colors ${
                category === t.key ? invertBgClass : hoverInvertClass
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="w-full max-w-[1800px] mx-auto flex flex-wrap items-baseline justify-between gap-4 border-b-4 border-black pb-4 mb-12">
          <h1 className="font-display text-4xl sm:text-6xl uppercase font-bold">
            {activeTab ? activeTab.label : "Todo"}
          </h1>
          <span className="font-body font-bold uppercase text-sm">
            {results.length}{" "}
            {results.length === 1 ? "prenda" : "prendas"} disponibles
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 max-w-[1800px] mx-auto">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 shrink-0 flex flex-col gap-8 font-display uppercase font-bold text-sm">
            <div className="flex flex-col gap-4">
              <h3 className={`text-xl border-b-4 ${borderClass} pb-2`}>
                Estilos
              </h3>
              {STYLE_FILTERS.map((style) => (
                <label
                  key={style}
                  className="flex items-center gap-2 cursor-pointer hover:underline"
                >
                  <input
                    type="checkbox"
                    checked={styles.includes(style)}
                    onChange={() => toggle(styles, setStyles, style)}
                    className="w-5 h-5 border-2 border-black rounded-none"
                  />{" "}
                  {style}
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <h3 className={`text-xl border-b-4 ${borderClass} pb-2`}>
                Tallas
              </h3>
              <div className="flex flex-wrap gap-2">
                {SIZE_FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggle(sizes, setSizes, s)}
                    className={`border-2 ${borderClass} min-w-10 h-10 px-2 flex items-center justify-center transition-colors ${
                      sizes.includes(s) ? invertBgClass : hoverInvertClass
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className={`text-xl border-b-4 ${borderClass} pb-2`}>
                Precio
              </h3>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="MIN"
                  className={`w-full border-2 ${borderClass} p-2 focus:outline-none`}
                />
                <span>-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="MAX"
                  className={`w-full border-2 ${borderClass} p-2 focus:outline-none`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className={`text-xl border-b-4 ${borderClass} pb-2`}>
                Vendedor
              </h3>
              {[
                { key: "5", label: "5 Estrellas" },
                { key: "4", label: "4+ Estrellas" },
                { key: "verified", label: "Verified" },
              ].map((r) => (
                <label
                  key={r.key}
                  className="flex items-center gap-2 cursor-pointer hover:underline"
                >
                  <input
                    type="checkbox"
                    checked={ratings.includes(r.key)}
                    onChange={() => toggle(ratings, setRatings, r.key)}
                    className="w-5 h-5 border-2 border-black rounded-none"
                  />{" "}
                  {r.label}
                </label>
              ))}
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className={`w-full py-3 border-4 ${borderClass} font-display text-lg uppercase font-bold ${hoverInvertClass} transition-colors`}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div
                className={`border-4 ${borderClass} p-12 flex flex-col items-center gap-6 text-center`}
              >
                <p className="font-display text-3xl md:text-4xl uppercase font-bold">
                  Sin resultados
                </p>
                <p className="font-body font-bold uppercase text-sm opacity-60">
                  Nadie ha dropeado algo así todavía. Prueba con menos filtros.
                </p>
                <button
                  onClick={clearFilters}
                  className={`px-8 py-4 border-4 ${borderClass} ${invertBgClass} font-display text-xl uppercase font-bold`}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- DASHBOARD ---------------- */

const DASH_TABS = [
  { key: "inventario", label: "Inventario" },
  { key: "compras", label: "Mis Compras" },
  { key: "ventas", label: "Mis Ventas" },
  { key: "mensajes", label: "Mensajes" },
  { key: "analiticas", label: "Analíticas" },
]

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className={`border-4 ${borderClass} p-6 flex flex-col gap-1`}>
      <span className="font-body font-bold uppercase text-xs tracking-widest">
        {label}
      </span>
      <span className="font-display text-4xl md:text-5xl font-bold leading-none">
        {value}
      </span>
      <span className="font-body text-xs font-bold uppercase opacity-60">
        {hint}
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const style =
    status === "ENTREGADO"
      ? "bg-black text-white"
      : status === "PENDIENTE"
        ? "bg-[#ffff00] text-black"
        : "bg-white text-black"
  return (
    <span
      className={`inline-block border-2 border-black px-3 py-1 text-xs font-bold uppercase ${style}`}
    >
      {status}
    </span>
  )
}

function InventoryPanel() {
  return (
    <>
      <button className="w-full bg-black text-white font-display text-4xl md:text-6xl uppercase font-bold py-12 mb-12 hover:bg-neutral-800 transition-colors">
        + NUEVO DROP
      </button>
      <h2 className="font-display text-3xl uppercase font-bold border-b-4 border-black pb-4 mb-8">
        Inventario Activo
      </h2>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-4 border-black text-left font-body font-bold uppercase text-sm md:text-base">
          <thead className="border-b-4 border-black bg-black text-white">
            <tr>
              <th className="p-4 border-r-4 border-white">Prenda</th>
              <th className="p-4 border-r-4 border-white">Categoría</th>
              <th className="p-4 border-r-4 border-white">Talla</th>
              <th className="p-4 border-r-4 border-white">Precio</th>
              <th className="p-4">Acción</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p, i) => (
              <tr
                key={p.id}
                className={
                  i !== PRODUCTS.length - 1 ? "border-b-4 border-black" : ""
                }
              >
                <td className="p-4 border-r-4 border-black flex items-center gap-4">
                  <img
                    src={p.image}
                    className="w-12 h-12 object-cover border-2 border-black grayscale"
                  />
                  <span className="truncate max-w-[120px] md:max-w-xs">
                    {p.name}
                  </span>
                </td>
                <td className="p-4 border-r-4 border-black">{p.category}</td>
                <td className="p-4 border-r-4 border-black">{p.size}</td>
                <td className="p-4 border-r-4 border-black font-display text-xl">
                  {p.price}
                </td>
                <td className="p-4">
                  <button className="hover:underline">EDITAR</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function PurchasesPanel() {
  return (
    <>
      <h2 className="font-display text-4xl md:text-6xl uppercase font-bold border-b-4 border-black pb-4 mb-8">
        Mis Compras
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <StatCard label="Compras totales" value="3" hint="Últimos 30 días" />
        <StatCard label="Gastado" value="$155" hint="Promedio $52" />
        <StatCard label="En camino" value="1" hint="Llega el 12 SEP" />
      </div>

      <div className="flex flex-col gap-6">
        {PURCHASES.map((o) => {
          const p = PRODUCTS.find((x) => x.id === o.productId)
          if (!p) return null
          return (
            <div
              key={o.id}
              className={`flex flex-col md:flex-row gap-6 border-4 ${borderClass} p-4`}
            >
              <img
                src={p.image}
                alt={p.name}
                className={`w-full md:w-32 h-40 md:h-32 object-cover border-4 ${borderClass} grayscale`}
              />
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-display text-2xl uppercase font-bold">
                    {p.name}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="font-body font-bold uppercase text-sm">
                  Pedido #{o.id} • {o.date} • Vendido por {o.seller}
                </p>
                <p className="font-body font-bold uppercase text-sm flex items-center gap-1 opacity-70">
                  <MapPin size={12} strokeWidth={2.5} /> {p.location} • Guía{" "}
                  {o.tracking}
                </p>
                <div className="flex gap-4 mt-2">
                  <button
                    className={`border-4 ${borderClass} px-4 py-2 font-display uppercase font-bold text-sm ${hoverInvertClass} transition-colors`}
                  >
                    {o.status === "ENTREGADO" ? "Calificar" : "Rastrear"}
                  </button>
                  <button
                    className={`border-4 ${borderClass} px-4 py-2 font-display uppercase font-bold text-sm ${hoverInvertClass} transition-colors`}
                  >
                    Escribir al vendedor
                  </button>
                </div>
              </div>
              <span className="font-display text-4xl font-bold self-start md:self-center">
                {o.amount}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}

function SalesPanel() {
  return (
    <>
      <h2 className="font-display text-4xl md:text-6xl uppercase font-bold border-b-4 border-black pb-4 mb-8">
        Mis Ventas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <StatCard
          label="Ingresos del mes"
          value="$1,120"
          hint="+31% vs Agosto"
        />
        <StatCard label="Pedidos" value="5" hint="1 pendiente de envío" />
        <StatCard label="Ticket promedio" value="$47" hint="Meta: $60" />
      </div>

      <div className="flex flex-wrap gap-4 mb-8 font-display uppercase font-bold">
        <span className="border-4 border-black bg-black text-white px-4 py-2">
          Todas
        </span>
        <span className="border-4 border-black px-4 py-2">Pendientes (1)</span>
        <span className="border-4 border-black px-4 py-2">Enviadas (1)</span>
        <span className="border-4 border-black px-4 py-2">Entregadas (3)</span>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-4 border-black text-left font-body font-bold uppercase text-sm md:text-base">
          <thead className="border-b-4 border-black bg-black text-white">
            <tr>
              <th className="p-4 border-r-4 border-white">Pedido</th>
              <th className="p-4 border-r-4 border-white">Prenda</th>
              <th className="p-4 border-r-4 border-white">Comprador</th>
              <th className="p-4 border-r-4 border-white">Fecha</th>
              <th className="p-4 border-r-4 border-white">Total</th>
              <th className="p-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {SALES.map((s, i) => (
              <tr
                key={s.id}
                className={
                  i !== SALES.length - 1 ? "border-b-4 border-black" : ""
                }
              >
                <td className="p-4 border-r-4 border-black font-display text-lg">
                  #{s.id}
                </td>
                <td className="p-4 border-r-4 border-black truncate max-w-[160px]">
                  {s.product}
                </td>
                <td className="p-4 border-r-4 border-black">{s.buyer}</td>
                <td className="p-4 border-r-4 border-black">{s.date}</td>
                <td className="p-4 border-r-4 border-black font-display text-xl">
                  {s.amount}
                </td>
                <td className="p-4">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className={`mt-12 border-4 ${borderClass} p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}
      >
        <div>
          <p className="font-display text-2xl uppercase font-bold">
            Saldo disponible
          </p>
          <p className="font-body font-bold uppercase text-sm opacity-60">
            Se libera 72h después de la entrega
          </p>
        </div>
        <span className="font-display text-5xl font-bold">$1,035</span>
        <button
          className={`border-4 ${borderClass} px-8 py-4 font-display text-2xl uppercase font-bold ${hoverInvertClass} transition-colors`}
        >
          Retirar
        </button>
      </div>
    </>
  )
}

function MessagesPanel({
  threads,
  setThreads,
  activeChat,
  setActiveChat,
}: {
  threads: Record<number, ChatMessage[]>
  setThreads: (t: Record<number, ChatMessage[]>) => void
  activeChat: number
  setActiveChat: (id: number) => void
}) {
  const [draft, setDraft] = useState("")

  const sendMessage = () => {
    const text = draft.trim()
    if (!text) return
    const time = new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    })
    setThreads({
      ...threads,
      [activeChat]: [
        ...(threads[activeChat] || []),
        { from: "me", text, time } as ChatMessage,
      ],
    })
    setDraft("")
  }

  const chat = CHATS.find((c) => c.id === activeChat)

  return (
    <>
      <h2 className="font-display text-4xl md:text-6xl uppercase font-bold border-b-4 border-black pb-4 mb-8">
        Mensajes
      </h2>
      <div
        className={`flex flex-col md:flex-row border-4 ${borderClass} min-h-[520px]`}
      >
        <div
          className={`w-full md:w-72 border-b-4 md:border-b-0 md:border-r-4 ${borderClass} flex flex-col shrink-0`}
        >
          {CHATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChat(c.id)}
              className={`text-left p-4 border-b-4 border-black last:border-b-0 transition-colors ${
                activeChat === c.id ? "bg-black text-white" : "hover:bg-black/5"
              }`}
            >
              <div className="flex justify-between items-center gap-2">
                <span className="font-display font-bold uppercase text-lg truncate">
                  {c.user}
                </span>
                <span className="font-body text-xs font-bold uppercase opacity-70">
                  {c.time}
                </span>
              </div>
              <p className="font-body text-xs font-bold uppercase opacity-70 truncate">
                {c.about}
              </p>
              {c.unread > 0 && activeChat !== c.id && (
                <span className="inline-block mt-2 bg-[#ffff00] text-black border-2 border-black px-2 text-xs font-bold">
                  {c.unread} NUEVOS
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          <div
            className={`p-4 border-b-4 ${borderClass} flex items-center justify-between gap-4`}
          >
            <span className="font-display text-2xl uppercase font-bold">
              {chat?.user}
            </span>
            <span
              className={`font-body text-xs font-bold uppercase border-2 ${borderClass} px-3 py-1`}
            >
              {chat?.about}
            </span>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto max-h-[360px]">
            {(threads[activeChat] || []).map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.from === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] border-4 ${borderClass} p-3 ${
                    m.from === "me" ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  <p className="font-body font-bold">{m.text}</p>
                  <span className="font-body text-[10px] font-bold uppercase opacity-60">
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={`border-t-4 ${borderClass} flex`}>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage()
              }}
              placeholder="ESCRIBE UN MENSAJE..."
              className="flex-1 p-4 font-display uppercase text-lg bg-transparent focus:outline-none placeholder:opacity-40"
            />
            <button
              onClick={sendMessage}
              className={`px-6 border-l-4 ${borderClass} ${hoverInvertClass} transition-colors`}
            >
              <Send size={28} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function AnalyticsPanel() {
  const max = Math.max(...MONTHLY.map((m) => m.value))
  return (
    <>
      <h2 className="font-display text-4xl md:text-6xl uppercase font-bold border-b-4 border-black pb-4 mb-8">
        Analíticas
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Visitas" value="4.7K" hint="Últimos 30 días" />
        <StatCard label="Conversión" value="3.8%" hint="+0.6 pts" />
        <StatCard label="Seguidores" value="612" hint="+48 este mes" />
        <StatCard label="Rating" value="4.9" hint="128 reseñas" />
      </div>

      <div className={`border-4 ${borderClass} p-6 mb-12`}>
        <h3 className="font-display text-2xl uppercase font-bold mb-8">
          Ingresos por mes (USD)
        </h3>
        <div className="flex items-end justify-between gap-3 h-64">
          {MONTHLY.map((m) => (
            <div
              key={m.month}
              className="flex-1 flex flex-col items-center justify-end h-full gap-2"
            >
              <span className="font-display font-bold text-sm md:text-lg">
                ${m.value}
              </span>
              <div
                className={`w-full border-4 ${borderClass} bg-black`}
                style={{ height: `${(m.value / max) * 100}%` }}
              />
              <span className="font-body font-bold uppercase text-xs">
                {m.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`border-4 ${borderClass} p-6`}>
          <h3 className="font-display text-2xl uppercase font-bold mb-6">
            Prendas más vistas
          </h3>
          <div className="flex flex-col gap-5">
            {TOP_PRODUCTS.map((p) => (
              <div key={p.name} className="flex flex-col gap-2">
                <div className="flex justify-between font-body font-bold uppercase text-sm gap-4">
                  <span className="truncate">{p.name}</span>
                  <span>{p.views}</span>
                </div>
                <div className={`w-full h-5 border-4 ${borderClass}`}>
                  <div
                    className="h-full bg-black"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`border-4 ${borderClass} p-6`}>
          <h3 className="font-display text-2xl uppercase font-bold mb-6">
            De dónde llega tu tráfico
          </h3>
          <div className="flex flex-col font-body font-bold uppercase">
            {TRAFFIC.map((t) => (
              <div
                key={t.src}
                className="flex justify-between py-4 border-b-4 border-dashed border-black last:border-b-0"
              >
                <span>{t.src}</span>
                <span className="font-display text-2xl">{t.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function DashboardView({
  nav,
  joinedCount,
}: {
  nav: Nav
  joinedCount: number
}) {
  const [tab, setTab] = useState("inventario")
  const [threads, setThreads] = useState(INITIAL_THREADS)
  const [activeChat, setActiveChat] = useState(1)

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row pt-[88px]">
      <Header {...nav} />
      <div className="w-full md:w-64 bg-black text-white flex flex-col border-r-4 border-black shrink-0">
        <nav className="flex flex-col font-display text-xl uppercase font-bold p-4 gap-4 flex-1">
          {DASH_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-left transition-opacity ${
                tab === t.key
                  ? "underline underline-offset-4 decoration-2 opacity-100"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={() => nav.onNavigate("communities")}
            className="text-left opacity-50 hover:opacity-100 mt-auto"
          >
            Colectivos ({joinedCount})
          </button>
        </nav>
      </div>
      <div className="flex-1 bg-white text-black p-6 md:p-12 flex flex-col">
        {tab === "inventario" && <InventoryPanel />}
        {tab === "compras" && <PurchasesPanel />}
        {tab === "ventas" && <SalesPanel />}
        {tab === "mensajes" && (
          <MessagesPanel
            threads={threads}
            setThreads={setThreads}
            activeChat={activeChat}
            setActiveChat={setActiveChat}
          />
        )}
        {tab === "analiticas" && <AnalyticsPanel />}
      </div>
    </div>
  )
}

/* ---------------- COMUNIDADES ---------------- */

function CommunitiesView({
  nav,
  joined,
  onToggleJoin,
  onOpen,
}: {
  nav: Nav
  joined: number[]
  onToggleJoin: (id: number) => void
  onOpen: (id: number) => void
}) {
  return (
    <div className="w-full min-h-screen pt-[88px]">
      <Header {...nav} />
      <div className="p-6 md:p-12">
        <h1
          className={`font-display text-5xl md:text-8xl uppercase font-bold mb-6 border-b-4 ${borderClass} pb-6 inline-block`}
        >
          Colectivos
        </h1>

        <div
          className={`w-full border-4 ${borderClass} p-6 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6`}
        >
          <div>
            <p className="font-display text-2xl md:text-3xl uppercase font-bold">
              Perteneces a {joined.length} de {COMMUNITIES.length} colectivos
            </p>
            <p className="font-body font-bold uppercase text-sm opacity-60">
              {joined.length === COMMUNITIES.length
                ? "Acceso completo desbloqueado"
                : "Únete para ver los drops privados"}
            </p>
          </div>
          <div className="flex gap-2">
            {COMMUNITIES.map((c) => (
              <span
                key={c.id}
                className={`w-16 h-4 border-4 ${borderClass} ${
                  joined.includes(c.id) ? invertBgClass : ""
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex overflow-x-auto gap-8 pb-8 snap-x hide-scrollbar">
          {COMMUNITIES.map((c) => {
            const isMember = joined.includes(c.id)
            return (
              <div
                key={c.id}
                className={`relative w-[85vw] md:w-[600px] aspect-[4/3] shrink-0 snap-center border-4 ${borderClass} group overflow-hidden bg-black flex flex-col justify-end p-8`}
              >
                <div className="absolute inset-0 z-0">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 mix-blend-overlay"
                  />
                </div>

                <span className="absolute top-6 left-6 z-10 border-4 border-white px-3 py-1 font-display font-bold uppercase text-white text-sm">
                  {c.tag}
                </span>
                {isMember && (
                  <span className="absolute top-6 right-6 z-10 bg-white text-black border-4 border-white px-3 py-1 font-display font-bold uppercase text-sm flex items-center gap-1">
                    <Check size={16} strokeWidth={3} /> MIEMBRO
                  </span>
                )}

                <div className="relative z-10 flex flex-col gap-6">
                  <h2
                    onClick={() => onOpen(c.id)}
                    className="font-display text-5xl md:text-7xl uppercase font-bold text-white leading-none cursor-pointer"
                  >
                    {c.name}
                  </h2>
                  <div className="flex flex-col gap-4">
                    <p className="font-body text-white text-lg uppercase font-bold">
                      {(c.members + (isMember ? 1 : 0)).toLocaleString("en-US")}{" "}
                      Miembros activos • {c.dropsToday} Drops hoy
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => onToggleJoin(c.id)}
                        className={`flex-1 py-4 border-4 border-white font-display text-xl md:text-2xl uppercase font-bold transition-colors ${
                          isMember
                            ? "bg-white text-black hover:bg-black hover:text-white"
                            : "text-white hover:bg-white hover:text-black"
                        }`}
                      >
                        {isMember ? "SALIR DEL COLECTIVO" : "UNIRSE AL COLECTIVO"}
                      </button>
                      <button
                        onClick={() => onOpen(c.id)}
                        className="flex-1 py-4 border-4 border-white font-display text-xl md:text-2xl uppercase font-bold text-white hover:bg-white hover:text-black transition-colors"
                      >
                        VER COLECTIVO
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CommunityDetailView({
  nav,
  community,
  isMember,
  onToggleJoin,
  onBack,
}: {
  nav: Nav
  community: (typeof COMMUNITIES)[0]
  isMember: boolean
  onToggleJoin: (id: number) => void
  onBack: () => void
}) {
  const [tab, setTab] = useState("drops")
  const drops = community.drops
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is (typeof PRODUCTS)[0] => Boolean(p))

  return (
    <div className="w-full min-h-screen pt-[88px]">
      <Header {...nav} />

      <div className="relative w-full h-[60vh] bg-black flex flex-col justify-end p-6 md:p-12 overflow-hidden">
        <img
          src={community.image}
          alt={community.name}
          className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale mix-blend-overlay"
        />
        <button
          onClick={onBack}
          className="absolute top-6 left-6 md:left-12 z-10 flex items-center gap-2 border-4 border-white text-white px-4 py-2 font-display uppercase font-bold hover:bg-white hover:text-black transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={3} /> Colectivos
        </button>

        <div className="relative z-10 flex flex-col gap-4">
          <span className="border-4 border-white text-white px-3 py-1 font-display font-bold uppercase text-sm w-fit">
            {community.tag}
          </span>
          <h1 className="font-display text-6xl md:text-9xl uppercase font-bold text-white leading-none">
            {community.name}
          </h1>
          <p className="font-body text-white text-lg md:text-xl font-bold max-w-2xl">
            {community.description}
          </p>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-2">
            <p className="font-body text-white uppercase font-bold flex items-center gap-2 flex-wrap">
              {(community.members + (isMember ? 1 : 0)).toLocaleString("en-US")}{" "}
              Miembros • {community.dropsToday} Drops hoy • {community.curator}
              <span className="flex items-center gap-1">
                <MapPin size={14} strokeWidth={2.5} /> {community.location}
              </span>
            </p>
            <button
              onClick={() => onToggleJoin(community.id)}
              className={`px-8 py-4 border-4 border-white font-display text-2xl uppercase font-bold transition-colors w-fit ${
                isMember
                  ? "bg-white text-black hover:bg-black hover:text-white"
                  : "text-white hover:bg-white hover:text-black"
              }`}
            >
              {isMember ? "SALIR DEL COLECTIVO" : "UNIRSE AL COLECTIVO"}
            </button>
          </div>
        </div>
      </div>

      <div className={`flex border-b-4 ${borderClass}`}>
        {[
          { key: "drops", label: `Drops (${drops.length})` },
          { key: "miembros", label: "Miembros" },
          { key: "reglas", label: "Reglas" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-6 font-display text-xl md:text-3xl uppercase font-bold border-r-4 last:border-r-0 ${borderClass} transition-colors ${
              tab === t.key ? invertBgClass : hoverInvertClass
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-12">
        {tab === "drops" && (
          <div className="relative">
            <div
              className={`flex flex-wrap gap-8 ${
                isMember ? "" : "blur-sm pointer-events-none select-none"
              }`}
            >
              {drops.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {!isMember && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center">
                <p
                  className={`font-display text-3xl md:text-5xl uppercase font-bold bg-white border-4 ${borderClass} px-6 py-4`}
                >
                  DROPS PRIVADOS
                </p>
                <button
                  onClick={() => onToggleJoin(community.id)}
                  className={`px-10 py-5 border-4 ${borderClass} ${invertBgClass} font-display text-2xl uppercase font-bold`}
                >
                  UNIRSE PARA VER
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "miembros" && (
          <div className={`border-4 ${borderClass}`}>
            {community.membersList.map((m, i) => (
              <div
                key={m.user}
                className={`flex items-center justify-between p-6 ${
                  i !== community.membersList.length - 1
                    ? `border-b-4 ${borderClass}`
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 border-4 ${borderClass} ${invertBgClass} flex items-center justify-center font-display font-bold text-xl`}
                  >
                    {m.user.charAt(1).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display text-xl uppercase font-bold">
                      {m.user}
                    </span>
                    <span className="font-body text-xs font-bold uppercase opacity-60">
                      {m.drops} drops publicados
                    </span>
                  </div>
                </div>
                <span
                  className={`border-2 ${borderClass} px-3 py-1 font-body font-bold uppercase text-xs`}
                >
                  {m.role}
                </span>
              </div>
            ))}
            {isMember && (
              <div
                className={`flex items-center justify-between p-6 border-t-4 ${borderClass} ${invertBgClass}`}
              >
                <span className="font-display text-xl uppercase font-bold">
                  @ThriferOax (tú)
                </span>
                <span className="border-2 border-current px-3 py-1 font-body font-bold uppercase text-xs">
                  NUEVO MIEMBRO
                </span>
              </div>
            )}
          </div>
        )}

        {tab === "reglas" && (
          <div className="flex flex-col gap-6 max-w-3xl">
            {community.rules.map((r, i) => (
              <div key={i} className="flex gap-6 items-start">
                <span className="font-display text-5xl font-bold leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-body text-xl font-bold uppercase pt-2">
                  {r}
                </p>
              </div>
            ))}
            <p
              className={`mt-6 border-4 ${borderClass} p-6 font-body font-bold uppercase`}
            >
              Romper una regla saca tu drop del colectivo sin aviso. Tres
              strikes y pierdes el acceso.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function JoinModal({
  community,
  onClose,
  onEnter,
}: {
  community: (typeof COMMUNITIES)[0]
  onClose: () => void
  onEnter: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-lg border-8 ${borderClass} bg-white text-black p-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:rotate-90 transition-transform"
        >
          <X size={32} strokeWidth={2.5} />
        </button>
        <div
          className={`w-16 h-16 border-4 ${borderClass} ${invertBgClass} flex items-center justify-center`}
        >
          <Check size={40} strokeWidth={3} />
        </div>
        <h2 className="font-display text-4xl md:text-5xl uppercase font-bold leading-none">
          Bienvenido a {community.name}
        </h2>
        <p className="font-signature text-4xl leading-none">Como nuevo</p>
        <p className="font-body font-bold uppercase">
          Ya puedes ver los drops privados, escribirle a los dealers y publicar
          en el colectivo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onEnter}
            className={`flex-1 py-4 border-4 ${borderClass} ${invertBgClass} font-display text-xl uppercase font-bold`}
          >
            Entrar al colectivo
          </button>
          <button
            onClick={onClose}
            className={`flex-1 py-4 border-4 ${borderClass} font-display text-xl uppercase font-bold ${hoverInvertClass} transition-colors`}
          >
            Seguir explorando
          </button>
        </div>
      </div>
    </div>
  )
}

function ProfileView(nav: Nav) {
  return (
    <div className="w-full min-h-screen flex flex-col pt-[88px]">
      <Header {...nav} />
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto">
        <h1 className="font-display text-5xl uppercase font-bold mb-12 self-start w-full border-b-4 border-black pb-4">
          MI PERFIL
        </h1>
        <form
          className="w-full flex flex-col gap-12"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-2">
            <label className="font-display font-bold uppercase text-lg">
              Nombre de Usuario
            </label>
            <input
              type="text"
              defaultValue="@ThriferOax"
              className={`w-full bg-transparent border-b-4 ${borderClass} py-4 text-2xl font-body focus:outline-none focus:border-current`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-display font-bold uppercase text-lg">
              Correo Electrónico
            </label>
            <input
              type="email"
              defaultValue="hello@allpaca.com"
              className={`w-full bg-transparent border-b-4 ${borderClass} py-4 text-2xl font-body focus:outline-none focus:border-current`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-display font-bold uppercase text-lg">
              Bio
            </label>
            <input
              type="text"
              defaultValue="Curando archivos Y2K y Avant Garde."
              className={`w-full bg-transparent border-b-4 ${borderClass} py-4 text-2xl font-body focus:outline-none focus:border-current`}
            />
          </div>
          <button
            type="submit"
            className={`mt-8 w-full py-6 font-display text-3xl font-bold uppercase border-4 ${borderClass} ${hoverInvertClass} transition-colors`}
          >
            GUARDAR CAMBIOS
          </button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const [currentView, setCurrentView] = useState("landing")
  const [listCategory, setListCategory] = useState("all")
  const [currency, setCurrency] = useState("USD")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Colectivos
  const [joined, setJoined] = useState<number[]>([])
  const [activeCommunity, setActiveCommunity] = useState<number | null>(null)
  const [joinToast, setJoinToast] = useState<number | null>(null)

  // Unified mode - no more dealer/explorer toggle
  const themeClass = "bg-white text-black"

  const goTo = (view: string, category?: string) => {
    if (view === "communities") setActiveCommunity(null)
    if (view === "list" && category) setListCategory(category)
    setCurrentView(view)
    window.scrollTo({ top: 0 })
  }

  const nav: Nav = {
    onNavigate: goTo,
    onOpenCart: () => setIsCartOpen(true),
    isSearchOpen,
    setIsSearchOpen,
  }

  const toggleJoin = (id: number) => {
    if (joined.includes(id)) {
      setJoined(joined.filter((c) => c !== id))
    } else {
      setJoined([...joined, id])
      setJoinToast(id)
    }
  }

  const openCommunity = (id: number) => {
    setActiveCommunity(id)
    setJoinToast(null)
    window.scrollTo({ top: 0 })
  }

  const detailCommunity = COMMUNITIES.find((c) => c.id === activeCommunity)
  const toastCommunity = COMMUNITIES.find((c) => c.id === joinToast)

  return (
    <div
      className={`min-h-screen ${themeClass} font-body selection:bg-black selection:text-white transition-colors duration-300 pt-0`}
    >
      {currentView === "landing" && <LandingView {...nav} />}
      {currentView === "list" && (
        <ListView
          {...nav}
          category={listCategory}
          onCategoryChange={setListCategory}
        />
      )}
      {currentView === "dashboard" && (
        <DashboardView nav={nav} joinedCount={joined.length} />
      )}
      {currentView === "communities" &&
        (detailCommunity ? (
          <CommunityDetailView
            nav={nav}
            community={detailCommunity}
            isMember={joined.includes(detailCommunity.id)}
            onToggleJoin={toggleJoin}
            onBack={() => setActiveCommunity(null)}
          />
        ) : (
          <CommunitiesView
            nav={nav}
            joined={joined}
            onToggleJoin={toggleJoin}
            onOpen={openCommunity}
          />
        ))}
      {currentView === "profile" && <ProfileView {...nav} />}

      {currentView === "landing" && (
        <>
          <section className="w-full bg-black text-white py-24 px-6 md:px-20 text-center flex flex-col items-center justify-center border-t-4 border-black">
            <h2 className="font-display text-5xl sm:text-7xl md:text-9xl uppercase mb-8 leading-none tracking-tight">
              Únete al <br /> Movimiento
            </h2>
            <form
              className="w-full max-w-3xl flex flex-col sm:flex-row border-4 border-white"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="TU CORREO ELECTRÓNICO"
                className="flex-1 bg-black text-white px-6 py-6 font-display uppercase text-xl focus:outline-none placeholder:opacity-50"
                required
              />
              <button
                type="submit"
                className="bg-white text-black border-l-4 border-transparent sm:border-l-white px-12 py-6 font-display uppercase font-bold text-2xl hover:bg-black hover:text-white hover:border-white transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </section>
          <footer className={`w-full py-8 text-center border-t-4 ${borderClass}`}>
            <p className="font-body font-bold uppercase tracking-widest text-sm">
              © {new Date().getFullYear()} ALLPACA - CIRCULAR STREETWEAR
            </p>
          </footer>
        </>
      )}

      {toastCommunity && (
        <JoinModal
          community={toastCommunity}
          onClose={() => setJoinToast(null)}
          onEnter={() => {
            setCurrentView("communities")
            openCommunity(toastCommunity.id)
          }}
        />
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div
            className={`relative w-full max-w-md ${invertBgClass} h-full border-l-8 ${borderClass} flex flex-col shadow-2xl transform transition-transform`}
          >
            <div
              className={`p-6 border-b-4 ${borderClass} flex justify-between items-center`}
            >
              <h2 className="font-display text-4xl uppercase font-bold">
                CARRITO (2)
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="hover:rotate-90 transition-transform"
              >
                <X size={40} strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {PRODUCTS.slice(0, 2).map((p) => (
                <div
                  key={p.id}
                  className={`flex gap-4 border-4 ${borderClass} p-2`}
                >
                  <img
                    src={p.image}
                    className={`w-24 h-24 object-cover border-2 ${borderClass} grayscale`}
                  />
                  <div className="flex flex-col justify-center">
                    <span className="font-display font-bold uppercase text-lg leading-tight">
                      {p.name}
                    </span>
                    <span className="font-body text-sm font-bold uppercase">
                      {p.size} • {p.condition}
                    </span>
                    <span className="font-display font-bold text-2xl mt-1">
                      {p.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className={`p-6 border-t-4 ${borderClass}`}>
              <div className="flex justify-between font-display text-2xl uppercase font-bold mb-6">
                <span>TOTAL</span>
                <span>$65.00</span>
              </div>
              <button
                className={`w-full py-6 font-display text-4xl uppercase font-bold border-4 ${borderClass} bg-white text-black hover:bg-black hover:text-white hover:border-white transition-colors`}
              >
                CHECKOUT
              </button>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />
    </div>
  )
}