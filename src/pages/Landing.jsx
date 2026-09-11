import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import {
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  Landmark,
  MapPin,
  Menu,
  Shield,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import DHARAMap from "../gis/DHARAMap"

// Image import from src/assets/ folder
import landAcqImg from "../assets/landaquisition1.jpg"

export default function Landing() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [activeStage, setActiveStage] = useState(0)
  const [activePortal, setActivePortal] = useState(0)
  const [authorityOpen, setAuthorityOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Slides data using translations
  const slides = [
    {
      id: 1,
      badge: t("slide1Badge"),
      title: t("slide1Title"),
      highlight: t("slide1Highlight"),
      description: t("slide1Desc"),
      image: landAcqImg,
      primaryText: t("slide1Primary"),
      primaryHref: "#portals",
      secondaryText: t("slide1Secondary"),
      secondaryHref: "#workflow",
    },
    {
      id: 2,
      badge: t("slide2Badge"),
      title: t("slide2Title"),
      highlight: t("slide2Highlight"),
      description: t("slide2Desc"),
      image: landAcqImg,
      primaryText: t("slide2Primary"),
      primaryHref: "/portal/company",
      secondaryText: t("slide2Secondary"),
      secondaryHref: "/about",
    },
    {
      id: 3,
      badge: t("slide3Badge"),
      title: t("slide3Title"),
      highlight: t("slide3Highlight"),
      description: t("slide3Desc"),
      image: landAcqImg,
      primaryText: t("slide3Primary"),
      primaryHref: "/portal/state",
      secondaryText: t("slide3Secondary"),
      secondaryHref: "/guidelines",
    },
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
      number: t("portal1Number"),
      label: t("portal1Label"),
      title: t("portal1Title"),
      description: t("portal1Desc"),
      question: t("portal1Question"),
      metrics: [],
      actions: [],
      icon: Landmark,
      color: { bg: "#e2ebf5", active: "#1d4ed8", text: "#1e3a8a" },
    },
    {
      id: "authority",
      number: t("portal2Number"),
      label: t("portal2Label"),
      title: t("portal2Title"),
      description: t("portal2Desc"),
      question: t("portal2Question"),
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
      number: t("portal3Number"),
      label: t("portal3Label"),
      title: t("portal3Title"),
      description: t("portal3Desc"),
      question: t("portal3Question"),
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
      title: t("role1Title"),
      label: t("role1Label"),
      description: t("role1Desc"),
      icon: Shield,
      color: "#0369a1",
    },
    {
      id: "field",
      number: "02",
      title: t("role2Title"),
      label: t("role2Label"),
      description: t("role2Desc"),
      icon: MapPin,
      color: "#0d9488",
    },
    {
      id: "state",
      number: "03",
      title: t("role3Title"),
      label: t("role3Label"),
      description: t("role3Desc"),
      icon: Landmark,
      color: "#1d4ed8",
    },
    {
      id: "central",
      number: "04",
      title: t("role4Title"),
      label: t("role4Label"),
      description: t("role4Desc"),
      icon: Crosshair,
      color: "#6d28d9",
    },
  ]

  const landAcquisitionLaws = [
    {
      title: "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013",
      shortTitle: "RFCTLARR Act, 2013",
      href: "https://www.indiacode.nic.in/bitstream/123456789/1565/1/A2013-30.pdf",
    },
    {
      title: "The Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Rules, 2015",
      shortTitle: "RFCTLARR Rules, 2015",
      href: "https://dolr.gov.in/sites/default/files/RFCTLARR%20Rules%2C%202015.pdf",
    },
  ]

  // Toggle Language Handler
  const toggleLanguage = () => {
    const nextLang = i18n.language === "bn" ? "en" : "bn"
    i18n.changeLanguage(nextLang)
  }

  // Auto slide change every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        body, .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <main className="min-h-screen overflow-hidden bg-[#f8fafc] text-[#0f172a] font-jakarta">
        
        {/* Top Bar with Language Switcher */}
        <div className="bg-[#1e3a8a] text-white px-5 py-2 text-[11px] font-medium flex justify-between items-center border-b border-blue-900">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-3 bg-orange-500 rounded-sm"></span>
            <span>{t("ministry")}</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="cursor-pointer hover:underline">{t("skipText")}</span>
            <span>|</span>
            <span className="cursor-pointer hover:underline">A- A A+</span>
            <span>|</span>
            <button 
              onClick={toggleLanguage}
              className="cursor-pointer hover:underline font-bold text-amber-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800"
            >
              {i18n.language === "bn" ? "Switch to English" : "বাংলায় দেখুন (Switch to Bengali)"}
            </button>
          </div>
        </div>

        {/* Header Navigation */}
        <nav className="relative z-50 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 md:px-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-[#1e3a8a] text-white rounded font-bold">
                <span className="flex items-center gap-1 font-outfit text-sm" aria-label="Government of India">
                  <span>🇮🇳</span>
                </span>
              </div>
              <div>
                <p className="font-outfit text-lg font-bold tracking-wide text-[#1e3a8a]">{t("systemTitle")}</p>
                <p className="text-[10px] font-semibold tracking-wide text-slate-500">{t("systemSubtitle")}</p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-xs font-semibold tracking-wider text-slate-700 md:flex">
            <a href="#portals" className="transition-colors hover:text-[#1e3a8a]">{t("portalsNav")}</a>
            <a href="#workflow" className="transition-colors hover:text-[#1e3a8a]">{t("workflowNav")}</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-blue-900 leading-none">{t("digitalIndia")}</p>
                <p className="text-[8px] text-slate-500 font-medium">{t("powerToEmpower")}</p>
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
                <a href="#portals" onClick={() => setMenuOpen(false)}>{t("portalsNav")}</a>
                <a href="#workflow" onClick={() => setMenuOpen(false)}>{t("workflowNav")}</a>
                <button onClick={toggleLanguage} className="text-left text-blue-700 font-bold">
                  {i18n.language === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
                </button>
              </div>
            </motion.div>
          )}
        </nav>

        {/* Hero Section with Slider */}
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
                      {slides[currentSlide].badge}
                    </span>
                    <h1 className="font-outfit text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                      {slides[currentSlide].title} <br />
                      <span className="text-blue-400">{slides[currentSlide].highlight}</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-sm md:text-base leading-relaxed text-slate-300 font-medium">
                      {slides[currentSlide].description}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                      <a href={slides[currentSlide].primaryHref} className="bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-wider px-6 py-3 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2">
                        {slides[currentSlide].primaryText} <ArrowUpRight size={14} />
                      </a>
                      <a href={slides[currentSlide].secondaryHref} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs uppercase tracking-wider px-6 py-3 rounded-lg font-bold transition-all">
                        {slides[currentSlide].secondaryText}
                      </a>
                    </div>
                  </div>

                  {/* Professional Dashboard Widget Card */}
                  <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 p-6 rounded-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    <img src={slides[currentSlide].image} alt="Land acquisition" className="h-44 w-full object-cover rounded-lg border border-slate-700" />
                    
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-blue-400">Slide 0{currentSlide + 1} / 0{slides.length}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                          className="p-1.5 rounded bg-slate-700/60 hover:bg-slate-700 text-white transition-colors"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button 
                          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                          className="p-1.5 rounded bg-slate-700/60 hover:bg-slate-700 text-white transition-colors"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Portals Section */}
        <section id="portals" className="bg-slate-100 px-5 py-20 md:px-10 md:py-28 border-b border-slate-200">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">
                  {t("section1Tag")}
                </p>
                <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-600 font-medium">
                  {t("section1Desc")}
                </p>
              </div>
              <div>
                <h2 className="max-w-4xl font-outfit text-4xl leading-[1.05] tracking-tight md:text-6xl text-slate-900 font-bold">
                  {t("section1Heading")}
                </h2>
                <p className="mt-8 max-w-xl text-sm leading-relaxed text-slate-600 font-medium md:text-base">
                  {t("section1SubDesc")}
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
                          {t("portal1FooterSub")}
                        </p>
                        <p className={`mt-1 text-xs font-bold uppercase tracking-wider ${active ? "text-white" : "text-slate-900"}`}>
                          {t("portal1FooterAction")}
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
                  {currentPortal.id === "company" ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">{t("lawLibraryTitle")}</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">{t("lawLibraryDesc")}</p>
                      </div>
                      <div className="space-y-3">
                        {landAcquisitionLaws.map((law) => (
                          <a key={law.shortTitle} href={law.href} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-blue-50">
                            <span>
                              <span className="block text-xs font-bold text-slate-900">{law.shortTitle}</span>
                              <span className="mt-1 block text-[10px] leading-relaxed text-slate-500">{t("officialPdf")}</span>
                            </span>
                            <ArrowUpRight size={16} className="shrink-0 text-[#1e3a8a] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                  <>
                  <div className="grid grid-cols-3 border border-slate-200 bg-slate-50 rounded-lg overflow-hidden">
                    {currentPortal.metrics.length > 0 ? currentPortal.metrics.map(([value, label]) => (
                      <div key={label} className="border-r border-slate-200 px-3 py-5 last:border-r-0 md:px-4 text-center">
                        <p className="font-outfit text-2xl md:text-3xl font-bold text-[#1e3a8a]">
                          {value}
                        </p>
                        <p className="mt-2 text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-600">
                          {label}
                        </p>
                      </div>
                    )) : (
                      <div className="col-span-3 px-5 py-6 text-center text-xs font-semibold text-slate-600">
                        Company data is available after secure sign in.
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">
                      Available Actions
                    </p>
                    <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
                      {currentPortal.actions.length > 0 ? currentPortal.actions.map((action, index) => (
                        <div key={action} className="flex items-center justify-between py-3.5">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-400">0{index + 1}</span>
                            <span className="text-xs font-semibold text-slate-800">{action}</span>
                          </div>
                          <ArrowUpRight size={14} strokeWidth={1.5} className="text-slate-400" />
                        </div>
                      )) : (
                        <div className="py-4 text-xs font-semibold text-slate-600">
                          Sign in to view your company workflow.
                        </div>
                      )}
                    </div>
                  </div>
                  </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Neutral GIS Map Section */}
        <section id="map" className="border-b border-slate-200 bg-white px-5 py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 grid gap-8 md:grid-cols-[1fr_2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">{t("section2Tag")}</p>
                <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-600">{t("section2Desc")}</p>
              </div>
              <div>
                <h2 className="font-outfit text-4xl font-bold leading-tight text-slate-900 md:text-6xl">{t("section2Heading")}</h2>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-300 shadow-sm">
              <DHARAMap showMarkers={false} />
            </div>
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
                      {t("modalTitle")}
                    </h2>
                    <p className="mt-3 max-w-xl text-xs md:text-sm font-medium text-slate-600">
                      {t("modalSub")}
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
                          <span>{t("proceedSignIn")}</span>
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

        {/* Project Lifecycle Section */}
        <section id="workflow" className="bg-[#0f172a] px-5 py-20 text-white md:px-10 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  {t("section3Tag")}
                </p>
                <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-400 font-medium">
                  {t("section3Desc")}
                </p>
              </div>
              <div>
                <h2 className="font-outfit text-4xl leading-tight md:text-6xl font-bold">
                  {t("section3Heading")}
                </h2>
                <p className="mt-6 max-w-xl text-sm leading-relaxed text-slate-300 font-medium md:text-base">
                  {t("section3SubDesc")}
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
                    {t("currentStageLabel")} / {currentStage.number}
                  </p>
                  <h3 className="mt-3 font-outfit text-3xl md:text-4xl font-bold">{currentStage.name}</h3>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">{t("whatHappens")}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300 font-medium">{currentStage.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">{t("responsible")}</p>
                    <p className="mt-3 text-sm font-bold text-white">{currentStage.authority}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">{t("nextAction")}</p>
                    <p className="mt-3 text-sm font-bold text-blue-400">{currentStage.next}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider font-bold">
                  <span className="text-slate-400">{t("systemState")}</span>
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
            <span>{t("footerText1")}</span>
            <span>{t("footerText2")}</span>
            <span>{t("footerText3")}</span>
          </div>
        </footer>

      </main>
    </>
  )
}