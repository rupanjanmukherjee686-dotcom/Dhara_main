import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Crosshair,
  Landmark,
  MapPin,
  Menu,
  Shield,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import DHARAMap from "../gis/DHARAMap"

// Image import from src/assets/ folder
import landAcqImg from "../assets/landaquisition1.jpg"

const heroSlides = [
  {
    id: 1,
    title: "National Land Information System",
    highlight: "DHARA Platform",
    description: "Streamlining land acquisition, verification, and administrative approvals securely across all government tiers.",
    badge: "Government Initiative",
    type: "image",
    image: landAcqImg,
    statTitle: "Active Projects",
    statValue: "24+",
  },
  {
    id: 2,
    title: "Transparent Ground Verification",
    highlight: "Field-to-State Tracking",
    description: "Empowering district authorities and field officers with real-time GIS mapping and transparent parcel tracking.",
    badge: "Spatial Intelligence",
    type: "widget-map",
    parcelId: "WB-KOL-2026-894",
    district: "Kolkata District",
    status: "GPS Verified",
    officer: "Field Unit #4",
  },
  {
    id: 3,
    title: "Secure Compensation & Possession",
    highlight: "Clearance Protocols",
    description: "Ensuring mandatory compensation clearance before project implementation and land possession take effect.",
    badge: "Secure Compliance",
    type: "widget-compliance",
    projectCode: "NH-112 Extension",
    escrowStatus: "Disbursed & Locked",
    complianceStep: "Step 09 of 09 Completed",
  }
]

const workflowStages = [
  {
    name: "Proposal",
    number: "01",
    type: "ENTRY",
    authority: "Project Authority",
    next: "District Scrutiny",
    description: "A land requirement is registered in DHARA with the project proposal, required area and supporting records.",
    state: "Project initiated",
  },
  {
    name: "District Scrutiny",
    number: "02",
    type: "REVIEW",
    authority: "District Authority",
    next: "Field Verification",
    description: "The submitted requirement is reviewed against land records, geography and administrative requirements.",
    state: "Under district review",
  },
  {
    name: "Field Verification",
    number: "03",
    type: "GROUND",
    authority: "Field Officer",
    next: "District Field Review",
    description: "The proposed parcels are verified on the ground and field observations are recorded against the project.",
    state: "Ground verification",
  },
  {
    name: "District Field Review",
    number: "04",
    type: "REVIEW",
    authority: "District Authority",
    next: "State Scrutiny",
    description: "The district reviews the field findings and confirms whether the verified land can proceed to state-level scrutiny.",
    state: "District verification review",
  },
  {
    name: "State Scrutiny",
    number: "05",
    type: "DECISION",
    authority: "State Authority",
    next: "Central Oversight",
    description: "The state authority reviews the verified project, monitors district decisions and determines whether it should proceed.",
    state: "State-level review",
  },
  {
    name: "Central Oversight",
    number: "06",
    type: "NATIONAL",
    authority: "Central Authority",
    next: "Compensation",
    description: "The project reaches national-level oversight where progress, compliance and administrative readiness are reviewed.",
    state: "National oversight",
  },
  {
    name: "Compensation",
    number: "07",
    type: "SETTLEMENT",
    authority: "Government Administration",
    next: "Possession / Implementation",
    description: "Compensation obligations are tracked against affected parcels. Implementation remains locked until mandatory compensation conditions are cleared.",
    state: "Compensation clearance",
  },
  {
    name: "Possession / Implementation",
    number: "08",
    type: "EXECUTION",
    authority: "Government Administration",
    next: "Completed",
    description: "Once compensation requirements are cleared, possession and implementation progress can be recorded against the approved project.",
    state: "Execution stage",
  },
  {
    name: "Completed",
    number: "09",
    type: "COMPLETE",
    authority: "System Authority",
    next: "Complete",
    description: "The project reaches completion with its land, verification, approval, compensation and implementation history preserved in DHARA.",
    state: "Case closed",
  },
]

const portals = [
  {
    id: "company",
    number: "01",
    label: "PROJECT AUTHORITY",
    title: "Company",
    description: "A project-facing view for organisations requiring land for infrastructure and development.",
    question: "What requires attention?",
    metrics: [
      ["24", "Active projects"],
      ["08", "Pending submissions"],
      ["13", "Scrutiny responses"],
    ],
    actions: [
      "View project proposals",
      "Submit land requirements",
      "Upload supporting documents",
      "Define required land",
      "Track proposal status",
    ],
    icon: Landmark,
    color: { bg: "#e2ebf5", active: "#1d4ed8", text: "#1e3a8a" },
  },
  {
    id: "authority",
    number: "02",
    label: "GOVERNMENT SYSTEM",
    title: "Authority",
    description: "The connected government layer through which district, field, state and central responsibilities operate.",
    question: "Which authority are you?",
    metrics: [
      ["04", "Government roles"],
      ["01", "Connected system"],
      ["24/7", "Administrative visibility"],
    ],
    actions: [
      "District administration",
      "Field verification",
      "State scrutiny",
      "Central oversight",
      "Compensation & implementation",
    ],
    icon: Shield,
    color: { bg: "#e0f2fe", active: "#0369a1", text: "#0c4a6e" },
  },
  {
    id: "citizen",
    number: "03",
    label: "PUBLIC ACCESS",
    title: "Landowner",
    description: "A simpler public-facing view helping people understand what is happening with their land.",
    question: "What happens to my land?",
    metrics: [
      ["01", "Parcel search"],
      ["09", "Lifecycle states"],
      ["24/7", "Status access"],
    ],
    actions: [
      "Search Project ID",
      "Search Parcel ID",
      "View current status",
      "Track compensation",
      "Understand what happens next",
    ],
    icon: Users,
    color: { bg: "#dcfce7", active: "#15803d", text: "#14532d" },
  },
]

const authorityRoles = [
  {
    id: "district",
    number: "01",
    title: "District Authority",
    label: "DISTRICT ADMINISTRATION",
    description: "Review proposals, coordinate verification and manage district-level administrative decisions.",
    icon: Shield,
    color: "#0369a1",
  },
  {
    id: "field",
    number: "02",
    title: "Field Officer",
    label: "GROUND VERIFICATION",
    description: "Verify parcels on the ground, capture evidence and update field observations.",
    icon: MapPin,
    color: "#0d9488",
  },
  {
    id: "state",
    number: "03",
    title: "State Authority",
    label: "STATE OVERSIGHT",
    description: "Monitor districts, identify delays and oversee project progress across the state.",
    icon: Landmark,
    color: "#1d4ed8",
  },
  {
    id: "central",
    number: "04",
    title: "Central Authority",
    label: "NATIONAL OVERSIGHT",
    description: "Monitor national progress, compare states and identify systemic delays.",
    icon: Crosshair,
    color: "#6d28d9",
  },
]

export default function Landing() {
  const navigate = useNavigate()

  const [activeStage, setActiveStage] = useState(0)
  const [activePortal, setActivePortal] = useState(0)
  const [authorityOpen, setAuthorityOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  const currentStage = workflowStages[activeStage]
  const currentPortal = portals[activePortal]
  const PortalIcon = currentPortal.icon

  const openPortal = (portalId) => {
    navigate("/signin", {
      state: { role: portalId },
    })
  }

  const handlePortalClick = (portal, index) => {
    setActivePortal(index)
    if (portal.id === "authority") {
      setAuthorityOpen(true)
      return
    }
    openPortal(portal.id)
  }

  const slide = heroSlides[currentSlide]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        body, .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <main className="min-h-screen overflow-hidden bg-[#f8fafc] text-[#0f172a] font-jakarta">
        
        {/* Top Bar */}
        <div className="bg-[#1e3a8a] text-white px-5 py-2 text-[11px] font-medium flex justify-between items-center border-b border-blue-900">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-3 bg-orange-500 rounded-sm"></span>
            <span>Ministry of Land and Infrastructure, Government of India</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="cursor-pointer hover:underline">Skip to main content</span>
            <span>|</span>
            <span className="cursor-pointer hover:underline">A- A A+</span>
            <span>|</span>
            <span className="cursor-pointer hover:underline">English / বাংলা</span>
          </div>
        </div>

        {/* Header Navigation */}
        <nav className="relative z-50 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 md:px-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-[#1e3a8a] text-white rounded font-bold">
                <span className="font-outfit text-lg">🇮🇳</span>
              </div>
              <div>
                <p className="font-outfit text-lg font-bold tracking-wide text-[#1e3a8a]">DHARA</p>
                <p className="text-[10px] font-semibold tracking-wide text-slate-500">NATIONAL LAND INFORMATION SYSTEM</p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-xs font-semibold tracking-wider text-slate-700 md:flex">
            <a href="#portals" className="transition-colors hover:text-[#1e3a8a]">PORTALS</a>
            <a href="#gis" className="transition-colors hover:text-[#1e3a8a]">GIS MAP</a>
            <a href="#workflow" className="transition-colors hover:text-[#1e3a8a]">LIFECYCLE</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-blue-900 leading-none">Digital India</p>
                <p className="text-[8px] text-slate-500 font-medium">Power To Empower</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                DI
              </div>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 items-center justify-center border border-slate-300 rounded md:hidden"
              aria-label="Open menu"
            >
              <Menu size={16} strokeWidth={1.5} />
            </button>
          </div>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 right-0 top-full border-b border-slate-200 bg-white px-5 py-5 md:hidden shadow-lg z-50"
            >
              <div className="flex flex-col gap-5 text-xs font-bold tracking-wider">
                <a href="#portals" onClick={() => setMenuOpen(false)}>PORTALS</a>
                <a href="#gis" onClick={() => setMenuOpen(false)}>GIS MAP</a>
                <a href="#workflow" onClick={() => setMenuOpen(false)}>LIFECYCLE</a>
              </div>
            </motion.div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 text-white">
          <div className="relative min-h-[520px] md:min-h-[580px] flex items-center">
            
            <div className="relative z-20 mx-auto max-w-7xl px-6 py-16 md:px-12 w-full flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="grid gap-8 items-center lg:grid-cols-[1.3fr_1fr]"
                >
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wider mb-4">
                      {slide.badge}
                    </span>
                    <h1 className="font-outfit text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                      {slide.title} <br />
                      <span className="text-blue-400">{slide.highlight}</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-sm md:text-base leading-relaxed text-slate-300 font-medium">
                      {slide.description}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                      <a href="#portals" className="bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-wider px-6 py-3 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2">
                        Explore Portals <ArrowUpRight size={14} />
                      </a>
                      <a href="#gis" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs uppercase tracking-wider px-6 py-3 rounded-lg font-bold transition-all">
                        Check Land Status
                      </a>
                    </div>
                  </div>

                  {/* Professional Dashboard Widget Card */}
                  <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 p-6 rounded-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    {slide.type === "image" ? (
                      <>
                        <img 
                          src={slide.image} 
                          alt="Land Acquisition" 
                          className="h-44 w-full object-cover rounded-lg mb-4 border border-slate-700"
                        />
                        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{slide.statTitle}</span>
                          <span className="font-outfit text-xl font-bold text-blue-400">{slide.statValue}</span>
                        </div>
                      </>
                    ) : slide.type === "widget-map" ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                          <span className="text-xs text-blue-400 font-bold uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">Live GIS Node</span>
                          <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> {slide.status}
                          </span>
                        </div>

                        <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-700/60 space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Parcel ID:</span>
                            <span className="text-white font-bold">{slide.parcelId}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">District Unit:</span>
                            <span className="text-slate-200 font-semibold">{slide.district}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Assigned Team:</span>
                            <span className="text-blue-300 font-semibold">{slide.officer}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-lg flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-medium">Boundary coordinates synchronized</span>
                          <span className="text-xs font-bold text-blue-400">100% Match</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                          <span className="text-xs text-blue-400 font-bold uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">Audit Trail</span>
                          <span className="text-xs text-blue-300 font-bold">Secure Protocol</span>
                        </div>

                        <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-700/60 space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Project Reference:</span>
                            <span className="text-white font-bold">{slide.projectCode}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Escrow / Compensation:</span>
                            <span className="text-emerald-400 font-bold">{slide.escrowStatus}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Lifecycle Progress:</span>
                            <span className="text-blue-300 font-bold">{slide.complianceStep}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                          <span className="text-xs text-slate-300 font-medium">Ready for final state registration</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/15">
                <div className="flex items-center gap-2">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 transition-all rounded-full ${
                        currentSlide === index ? "w-8 bg-blue-500" : "w-2 bg-white/40"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={prevSlide}
                    className="h-10 w-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="h-10 w-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    aria-label="Next Slide"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Portals Section */}
        <section id="portals" className="bg-slate-100 px-5 py-20 md:px-10 md:py-28 border-b border-slate-200">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">
                  01 / Government Portals
                </p>
                <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-600 font-medium">
                  DHARA connects different administrative tiers through one secure unified land information system.
                </p>
              </div>
              <div>
                <h2 className="max-w-4xl font-outfit text-4xl leading-[1.05] tracking-tight md:text-6xl text-slate-900 font-bold">
                  Different roles. <br />One national system.
                </h2>
                <p className="mt-8 max-w-xl text-sm leading-relaxed text-slate-600 font-medium md:text-base">
                  Companies initiate projects, government authorities manage the administrative lifecycle, and landowners access transparent land status.
                </p>
              </div>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {portals.map((portal, index) => {
                const Icon = portal.icon
                const active = activePortal === index
                const color = portal.color

                return (
                  <motion.button
                    key={portal.id}
                    onClick={() => handlePortalClick(portal, index)}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.99 }}
                    style={{ backgroundColor: active ? color.active : color.bg }}
                    className={`group relative flex min-h-[350px] flex-col overflow-hidden p-6 text-left transition-all duration-300 md:p-8 rounded-xl shadow-sm border ${
                      active ? 'border-transparent shadow-md' : 'border-slate-300'
                    }`}
                  >
                    <motion.div
                      animate={{ width: active ? "100%" : "0%" }}
                      transition={{ duration: 0.35 }}
                      style={{ backgroundColor: "#ffffff" }}
                      className="absolute left-0 top-0 h-1.5"
                    />

                    <div className="flex items-start justify-between">
                      <div>
                        <p style={{ color: active ? "#ffffff" : color.text }} className="text-xs font-bold tracking-wider">
                          {portal.number}
                        </p>
                        <p className={`mt-3 text-[10px] font-bold uppercase tracking-wider ${active ? "text-white/80" : "text-slate-600"}`}>
                          {portal.label}
                        </p>
                      </div>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${active ? "border-white/40 bg-white/10" : "border-slate-300 bg-white"}`}>
                        <Icon size={16} strokeWidth={1.5} style={{ color: active ? "#ffffff" : color.text }} />
                      </div>
                    </div>

                    <div className="mt-12">
                      <h3 className={`font-outfit text-3xl leading-none md:text-4xl font-bold ${active ? "text-white" : "text-slate-900"}`}>
                        {portal.title}
                      </h3>
                      <p className={`mt-5 max-w-sm text-xs leading-relaxed md:text-sm font-medium ${active ? "text-white/90" : "text-slate-700"}`}>
                        {portal.description}
                      </p>
                    </div>

                    <div className={`mt-auto flex items-center justify-between border-t pt-5 ${active ? "border-white/20" : "border-slate-300"}`}>
                      <div>
                        <p className={`text-[10px] uppercase tracking-wider font-medium ${active ? "text-white/60" : "text-slate-500"}`}>
                          {portal.id === "authority" ? "Four government tiers" : "Secure access"}
                        </p>
                        <p className={`mt-1 text-xs font-bold uppercase tracking-wider ${active ? "text-white" : "text-slate-900"}`}>
                          {portal.id === "authority" ? "Choose authority" : "Open portal"}
                        </p>
                      </div>
                      <motion.div animate={{ x: active ? 3 : 0, y: active ? -3 : 0 }}>
                        <ArrowUpRight size={18} strokeWidth={1.5} style={{ color: active ? "#ffffff" : color.text }} />
                      </motion.div>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <motion.div
              key={currentPortal.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-16 bg-white border border-slate-300 rounded-xl p-6 md:p-10 shadow-sm"
            >
              <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-blue-200 bg-blue-50">
                      <PortalIcon size={20} strokeWidth={1.5} className="text-[#1e3a8a]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">
                        Portal {currentPortal.number}
                      </p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {currentPortal.label}
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-8 font-outfit text-4xl leading-none md:text-5xl font-bold text-slate-900">
                    {currentPortal.title}
                  </h3>
                  <p className="mt-6 max-w-lg text-sm leading-relaxed text-slate-700 font-medium md:text-base">
                    {currentPortal.description}
                  </p>

                  <div className="mt-10 inline-flex items-center gap-3 border-l-2 border-[#1e3a8a] pl-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">
                      {currentPortal.question}
                    </span>
                    <ArrowRight size={14} className="text-[#1e3a8a]" />
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-3 border border-slate-200 bg-slate-50 rounded-lg overflow-hidden">
                    {currentPortal.metrics.map(([value, label]) => (
                      <div key={label} className="border-r border-slate-200 px-3 py-5 last:border-r-0 md:px-4 text-center">
                        <p className="font-outfit text-2xl md:text-3xl font-bold text-[#1e3a8a]">
                          {value}
                        </p>
                        <p className="mt-2 text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-600">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">
                      Available Actions
                    </p>
                    <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
                      {currentPortal.actions.map((action, index) => (
                        <div key={action} className="flex items-center justify-between py-3.5">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-400">0{index + 1}</span>
                            <span className="text-xs font-semibold text-slate-800">{action}</span>
                          </div>
                          <ArrowUpRight size={14} strokeWidth={1.5} className="text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Authority Role Modal */}
        <AnimatePresence>
          {authorityOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm md:px-8"
              onClick={() => setAuthorityOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 25, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-slate-300 bg-white shadow-2xl rounded-xl"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-6 md:px-10 md:py-8 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">
                      02 / Government Authority Portal
                    </p>
                    <h2 className="mt-2 font-outfit text-3xl md:text-5xl font-bold text-slate-900">
                      Select your administrative tier.
                    </h2>
                    <p className="mt-3 max-w-xl text-xs md:text-sm font-medium text-slate-600">
                      Choose your specific official role to sign into the secure portal.
                    </p>
                  </div>
                  <button
                    onClick={() => setAuthorityOpen(false)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-100"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 p-6 gap-6 bg-slate-50">
                  {authorityRoles.map((role) => {
                    const Icon = role.icon
                    return (
                      <motion.button
                        key={role.id}
                        onClick={() => openPortal(role.id)}
                        whileHover={{ backgroundColor: "#ffffff" }}
                        className="group bg-white border border-slate-200 rounded-xl p-6 text-left transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-blue-200 bg-blue-50">
                            <Icon size={20} strokeWidth={1.5} style={{ color: role.color }} />
                          </div>
                          <ArrowUpRight size={18} strokeWidth={1.5} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="mt-6 text-[10px] font-bold uppercase tracking-wider" style={{ color: role.color }}>
                          {role.number} / {role.label}
                        </p>
                        <h3 className="mt-2 font-outfit text-2xl font-bold text-slate-900">{role.title}</h3>
                        <p className="mt-3 text-xs leading-relaxed text-slate-600 font-medium">{role.description}</p>
                        <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs font-bold text-[#1e3a8a]">
                          <span>Proceed to sign in</span>
                          <ArrowRight size={14} />
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GIS Map Section */}
        <section id="gis" className="bg-white px-5 py-20 md:px-10 md:py-28 border-b border-slate-200">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 grid gap-8 md:grid-cols-[1fr_2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">
                  02 / Spatial Intelligence
                </p>
                <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-600 font-medium">
                  Live geographic mapping integrated directly with land records.
                </p>
              </div>
              <div>
                <h2 className="max-w-4xl font-outfit text-4xl font-bold md:text-6xl text-slate-900">
                  Visualise land parcels <br />on the ground.
                </h2>
                <p className="mt-6 max-w-xl text-sm leading-relaxed text-slate-600 font-medium md:text-base">
                  Explore project locations interactively with connected administrative data layers.
                </p>
              </div>
            </div>
            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
              <DHARAMap />
            </div>
          </div>
        </section>

        {/* Project Lifecycle Section */}
        <section id="workflow" className="bg-[#0f172a] px-5 py-20 text-white md:px-10 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  03 / Project Lifecycle
                </p>
                <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-400 font-medium">
                  Every project follows a transparent sequence of administrative and verification decisions.
                </p>
              </div>
              <div>
                <h2 className="font-outfit text-4xl leading-tight md:text-6xl font-bold">
                  From proposal <br />to completion.
                </h2>
                <p className="mt-6 max-w-xl text-sm leading-relaxed text-slate-300 font-medium md:text-base">
                  A step-by-step audit trail showing the active stage, responsible government authority, and next action.
                </p>
              </div>
            </div>

            <div className="mt-16 hidden md:block">
              <div className="grid grid-cols-9">
                {workflowStages.map((stage, index) => {
                  const active = index === activeStage
                  const completed = index < activeStage
                  return (
                    <button
                      key={stage.name}
                      onClick={() => setActiveStage(index)}
                      className="group relative text-left"
                    >
                      {index < workflowStages.length - 1 && (
                        <div className="absolute left-1/2 right-0 top-[7px] h-px bg-slate-700" />
                      )}
                      <div className="relative z-10">
                        <motion.div
                          animate={{ scale: active ? 1.35 : 1 }}
                          className={`h-3.5 w-3.5 rounded-full border ${
                            active
                              ? "border-blue-400 bg-blue-500"
                              : completed
                              ? "border-blue-400 bg-blue-900"
                              : "border-slate-600 bg-slate-800"
                          }`}
                        />
                        <p className={`mt-4 text-[10px] uppercase tracking-wider font-semibold ${active ? "text-white font-bold" : "text-slate-400 group-hover:text-slate-200"}`}>
                          {stage.name}
                        </p>
                        <p className="mt-1 text-[10px] font-bold text-slate-500">{stage.number}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <motion.div
              key={currentStage.number}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-16 border-t border-slate-700 pt-10"
            >
              <div className="grid gap-10 md:grid-cols-[1.1fr_1fr_1fr]">
                <div>
                  <p className="text-xs uppercase tracking-wider text-blue-400 font-bold">
                    Current Stage / {currentStage.number}
                  </p>
                  <h3 className="mt-3 font-outfit text-3xl md:text-4xl font-bold">{currentStage.name}</h3>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">What happens</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300 font-medium">{currentStage.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Responsible</p>
                    <p className="mt-3 text-sm font-bold text-white">{currentStage.authority}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Next action</p>
                    <p className="mt-3 text-sm font-bold text-blue-400">{currentStage.next}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider font-bold">
                  <span className="text-slate-400">System State</span>
                  <span className="text-slate-200">{currentStage.state}</span>
                </div>
                <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${((activeStage + 1) / workflowStages.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-300 bg-slate-900 text-slate-300 px-5 py-8 md:px-10">
          <div className="mx-auto max-w-7xl flex flex-col gap-4 text-xs font-semibold uppercase tracking-wider md:flex-row md:items-center md:justify-between">
            <span>DHARA / National Land Information System, NIC</span>
            <span>Portals · GIS Mapping · Lifecycle Tracking</span>
            <span>© 2026 Government of India</span>
          </div>
        </footer>

      </main>
    </>
  )
}