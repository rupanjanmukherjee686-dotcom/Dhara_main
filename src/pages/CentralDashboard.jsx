import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileText,
  LandPlot,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from "lucide-react"
import { motion } from "framer-motion"

const STORAGE_KEY = "dhara-projects"

function CentralDashboard() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const loadProjects = () => {
    try {
      const storedProjects = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      )

      const centralProjects = storedProjects.filter(
        (project) =>
          project.stage === "Central Oversight" &&
          project.authority === "Central Authority"
      )

      setProjects(centralProjects)
    } catch (error) {
      console.error("Failed to load central projects:", error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()

    const handleStorageChange = () => {
      loadProjects()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const totalLand = useMemo(() => {
    return projects.reduce(
      (total, project) => total + Number(project.landArea || 0),
      0
    )
  }, [projects])

  const totalParcels = useMemo(() => {
    return projects.reduce(
      (total, project) => total + Number(project.parcels || 0),
      0
    )
  }, [projects])

  const handleReview = (projectId) => {
    if (!projectId) return

    navigate(`/portal/central/project/${projectId}`)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-jakarta, body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-jakarta flex flex-col justify-between">
        
        {/* HEADER */}
        <header className="border-b border-slate-200 bg-white px-6 py-4 md:px-12 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-5">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="flex h-9 w-9 items-center justify-center bg-[#1e3a8a] text-white rounded font-bold">
                <span className="font-outfit text-base">🇮🇳</span>
              </div>
              <div>
                <p className="font-outfit text-base font-bold tracking-wide text-[#1e3a8a]">DHARA</p>
                <p className="text-[9px] font-semibold tracking-wider text-slate-500">CENTRAL AUTHORITY</p>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Government of India</p>
              <p className="text-xs font-bold text-slate-700">National land oversight</p>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="mx-auto max-w-7xl w-full px-5 md:px-12 py-10">
          
          {/* INTRO */}
          <div className="mb-8 border-b border-slate-200 pb-7">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-[#1e3a8a] text-xs font-bold tracking-wider mb-4">
                  CENTRAL OVERSIGHT QUEUE
                </span>

                <h1 className="font-outfit text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                  Projects requiring national-level oversight.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 font-medium">
                  Review projects that have completed district and state-level
                  scrutiny and have been forwarded for central oversight.
                </p>
              </div>

              <button
                type="button"
                onClick={loadProjects}
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 transition-all shadow-sm"
              >
                <RefreshCw size={14} className="text-[#1e3a8a]" />
                Refresh queue
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pending oversight
                </span>
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1e3a8a]">
                  <ClipboardCheck size={16} strokeWidth={1.5} />
                </div>
              </div>
              <p className="font-outfit text-3xl font-bold text-slate-900">{projects.length}</p>
              <p className="mt-1 text-xs text-slate-500 font-medium">Projects</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Land under oversight
                </span>
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1e3a8a]">
                  <LandPlot size={16} strokeWidth={1.5} />
                </div>
              </div>
              <p className="font-outfit text-3xl font-bold text-slate-900">
                {totalLand.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-500 font-medium">Acres</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Parcels
                </span>
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1e3a8a]">
                  <MapPin size={16} strokeWidth={1.5} />
                </div>
              </div>
              <p className="font-outfit text-3xl font-bold text-slate-900">
                {totalParcels.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-500 font-medium">Across submitted projects</p>
            </div>
          </div>

          {/* REVIEW QUEUE */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  National review queue
                </p>
                <h2 className="font-outfit text-xl font-bold text-slate-900 mt-0.5">
                  Central oversight
                </h2>
              </div>

              <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                {projects.length.toString().padStart(2, "0")} RECORDS
              </span>
            </div>

            {loading ? (
              <div className="bg-white border border-slate-200 p-10 text-center rounded-xl shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Loading central queue...
                </p>
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 p-12 text-center rounded-xl shadow-sm">
                <ShieldCheck
                  size={32}
                  className="mx-auto mb-3 text-blue-400"
                  strokeWidth={1.5}
                />
                <h3 className="font-outfit text-xl font-bold text-slate-900">
                  No projects awaiting central oversight.
                </h3>
                <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500 font-medium">
                  Projects approved at state level will appear here for
                  national-level review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <motion.article
                    key={project.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
                  >
                    {/* CARD HEADER */}
                    <div className="border-b border-slate-200 p-5 sm:p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#1e3a8a] text-[10px] font-bold uppercase tracking-wider">
                              Pending Central Review
                            </span>

                            <span className="text-xs font-semibold text-slate-500">
                              {project.id}
                            </span>
                          </div>

                          <h3 className="font-outfit text-xl font-bold text-slate-900 leading-tight">
                            {project.projectName || "Untitled Project"}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <Building2 size={14} className="text-[#1e3a8a]" />
                              {project.projectType || "Project"}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={14} className="text-[#1e3a8a]" />
                              {project.district || "District"},{" "}
                              {project.state || "State"}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-start lg:items-end bg-slate-50 border border-slate-200 p-3 rounded-lg">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            State approval
                          </span>
                          <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                            <ShieldCheck size={14} />
                            {project.stateDecision || "Approved"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0 bg-slate-50/50">
                      <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Land requirement
                        </p>
                        <p className="mt-1 font-outfit text-xl font-bold text-slate-900">
                          {project.landArea || "—"}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">Acres</p>
                      </div>

                      <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Parcels
                        </p>
                        <p className="mt-1 font-outfit text-xl font-bold text-slate-900">
                          {project.parcels || "—"}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">Identified parcels</p>
                      </div>

                      <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Current stage
                        </p>
                        <p className="mt-1 flex items-center gap-2 font-outfit text-xl font-bold text-[#1e3a8a]">
                          <ShieldCheck size={18} />
                          Central Oversight
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">National review</p>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex flex-col gap-4 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <FileText size={16} className="text-slate-400" />
                        <span>Review state clearance and national oversight record</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReview(project.id)}
                        className="inline-flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#1e3a8a] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                      >
                        <span>Review project</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-xs text-slate-500 font-medium">
          <span>© 2026 Government of India · National Land Information System</span>
        </footer>

      </div>
    </>
  )
}

export default CentralDashboard