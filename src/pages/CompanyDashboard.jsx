import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FileText,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../api"
import { clearSession } from "../auth"

function CompanyDashboard() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])

  useEffect(() => {
    const fetchProjects = async () => {
      const storedProjects = (() => {
        try {
          const stored = JSON.parse(localStorage.getItem("dhara-projects") || "[]")
          return Array.isArray(stored) ? stored : []
        } catch {
          return []
        }
      })()

      try {
        const userEmail = (localStorage.getItem("userEmail") || "").trim().toLowerCase()
        
        if (userEmail) {
          const response = await fetch(`${API_BASE_URL}/api/projects?email=${encodeURIComponent(userEmail)}`)
          const text = await response.text()
          let data = {}
          try {
            data = text ? JSON.parse(text) : {}
          } catch {
            console.error("Invalid JSON response:", text)
          }

          if (response.ok && data.success && Array.isArray(data.projects)) {
            const apiProjects = data.projects
            const localProjects = storedProjects.filter(
              (project) =>
                (project.email || project.userEmail || "").trim().toLowerCase() === userEmail
            )
            const projectsById = new Map()
            ;[...localProjects, ...apiProjects].forEach((project) => {
              const id = project.projectId || project.id
              if (id) projectsById.set(id, project)
            })
            setProjects([...projectsById.values()])
            return
          }
        }

        setProjects(storedProjects)
      } catch (err) {
        console.error("Error fetching projects:", err)
        setProjects([])
      }
    }

    fetchProjects()
  }, [])

  const totalProjects = projects.length

  const pendingProjects = projects.filter(
    (project) =>
      project.status === "Pending" ||
      project.status === "Awaiting review"
  ).length

  const activeProjects = projects.filter(
    (project) =>
      project.status === "In progress" ||
      project.status === "Pending"
  ).length

  const handleOpenProject = (projectId) => {
    if (!projectId) return
    navigate(`/portal/company/project/${projectId}`)
  }

  const getProjectId = (project) => project.projectId || project.id

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        body, .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <main className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-jakarta selection:bg-blue-600 selection:text-white">

        {/* TOP GOV BAR */}
        <div className="bg-[#1e3a8a] text-white px-5 py-2 text-[11px] font-medium flex justify-between items-center border-b border-blue-900">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-3 bg-orange-500 rounded-sm"></span>
            <span className="font-medium tracking-wide text-[11px]">Ministry of Land and Infrastructure, Government of India</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-300">
            <span>Skip to main content</span>
            <span>|</span>
            <span>A- A A+</span>
            <span>|</span>
            <span>English / বাংলা</span>
          </div>
        </div>

        {/* MAIN NAV HEADER */}
        <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-10">

            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 text-left group"
            >
              <div className="flex h-10 w-10 items-center justify-center bg-[#1e3a8a] text-white rounded font-bold shadow">
                <span className="font-outfit text-lg">
                  🇮🇳
                </span>
              </div>

              <div>
                <p className="font-outfit text-lg font-bold tracking-wide text-[#1e3a8a] leading-none">
                  DHARA
                </p>
                <p className="mt-1 text-[10px] font-semibold tracking-wide text-slate-500">
                  NATIONAL LAND INFORMATION SYSTEM
                </p>
              </div>
            </button>

            {/* Navigation Links */}
            <div className="hidden items-center gap-8 text-xs font-semibold tracking-wider text-slate-700 md:flex">
              <button 
                onClick={() => scrollToSection("project-management")} 
                className="hover:text-[#1e3a8a] transition cursor-pointer"
              >
                PROJECT MANAGEMENT
              </button>
              <button 
                onClick={() => scrollToSection("submitted-projects")} 
                className="hover:text-[#1e3a8a] transition cursor-pointer"
              >
                SUBMITTED PROJECTS
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-[11px] tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </div>

              <button
                onClick={() => {
                  clearSession()
                  navigate("/signin", { replace: true })
                }}
                className="border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-bold tracking-wider text-slate-700 transition hover:bg-slate-200 rounded"
              >
                Sign Out
              </button>
            </div>

          </div>
        </header>


        {/* MAIN CONTENT CONTAINER */}
        <div className="bg-[#f8fafc] py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-5 md:px-10">

            {/* PAGE TITLE / HERO SECTION */}
            <div className="mb-12 border-b border-slate-200 pb-8">
              <div className="inline-block bg-blue-50 border border-blue-200 px-3 py-1 mb-4 rounded-full">
                <p className="text-[11px] font-bold tracking-wider text-[#1e3a8a]">
                  01 / SECURE COMPLIANCE & PORTAL HUB
                </p>
              </div>
              <h1 className="font-outfit text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Company Portal & <span className="text-[#1e3a8a]">Land Requirements</span>
              </h1>
              <p className="mt-4 text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed font-medium">
                Ensure mandatory proposal clearance before project implementation and official land acquisition takes effect across administrative tiers.
              </p>

              <div className="mt-6">
                <button
                  onClick={() => navigate("/portal/company/propose")}
                  className="group inline-flex items-center gap-3 bg-blue-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-blue-700 shadow-lg rounded-lg"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  Propose a Project
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>


            {/* STATS OVERVIEW SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="border border-slate-200 bg-white p-6 shadow-sm rounded-xl border-t-4 border-t-blue-600">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Active Projects</p>
                <p className="mt-2 font-outfit text-4xl font-bold text-slate-900">{totalProjects}</p>
              </div>
              <div className="border border-slate-200 bg-white p-6 shadow-sm rounded-xl border-t-4 border-t-emerald-600">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Active Submissions</p>
                <p className="mt-2 font-outfit text-4xl font-bold text-slate-900">{activeProjects}</p>
              </div>
              <div className="border border-slate-200 bg-white p-6 shadow-sm rounded-xl border-t-4 border-t-amber-500">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Pending Review</p>
                <p className="mt-2 font-outfit text-4xl font-bold text-slate-900">{pendingProjects}</p>
              </div>
            </div>


            {/* QUICK ACTIONS MODULE */}
            <div id="project-management" className="mb-16 scroll-mt-24">
              <div>
                <p className="text-[11px] font-bold tracking-wider text-[#1e3a8a]">
                  02 / AVAILABLE ACTIONS
                </p>
                <h2 className="mt-1 font-outfit text-3xl font-bold text-slate-900">
                  Project Management & Workflows
                </h2>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <button
                  onClick={() => navigate("/portal/company/propose")}
                  className="group text-left border border-slate-200 bg-white p-6 transition hover:shadow-md hover:border-blue-400 rounded-xl shadow-sm"
                >
                  <FileText size={22} className="text-[#1e3a8a]" />
                  <h3 className="mt-4 font-outfit text-xl font-bold text-slate-900">New Proposal</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 font-medium">
                    Submit land requirements and initiate official digital project proposals.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold tracking-wider text-[#1e3a8a]">
                    Start filing <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (projects.length > 0) handleOpenProject(projects[0].id)
                  }}
                  className="group text-left border border-slate-200 bg-white p-6 transition hover:shadow-md hover:border-emerald-400 rounded-xl shadow-sm"
                >
                  <Search size={22} className="text-emerald-600" />
                  <h3 className="mt-4 font-outfit text-xl font-bold text-slate-900">Track Project</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 font-medium">
                    Follow government review stages, document verifications, and approvals.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-600">
                    Open latest status <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-sm">
                  <ShieldCheck size={22} className="text-indigo-600" />
                  <h3 className="mt-4 font-outfit text-xl font-bold text-slate-900">Government Workflow</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 font-medium">
                    Proposals are securely routed through authorized state and district departments.
                  </p>
                </div>
              </div>
            </div>


            {/* PROJECTS REGISTER */}
            <div id="submitted-projects" className="scroll-mt-24">
              <div className="flex flex-col gap-2 border-b border-slate-300 pb-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-[#1e3a8a]">
                    03 / PROJECT REGISTER
                  </p>
                  <h2 className="mt-1 font-outfit text-3xl font-bold text-slate-900">
                    Your Submitted Projects
                  </h2>
                </div>
                <p className="text-xs uppercase tracking-wider text-slate-600 font-bold">
                  Total Records: {projects.length}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {projects.length === 0 ? (
                  <div className="border border-dashed border-slate-300 bg-white px-6 py-16 text-center rounded-xl shadow-sm">
                    <ClipboardList size={32} className="mx-auto text-slate-400" />
                    <p className="mt-4 font-outfit text-2xl font-bold text-slate-900">
                      No projects submitted yet
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 font-medium leading-relaxed">
                      Submit your first project proposal to begin the official government land acquisition workflow.
                    </p>
                    <button
                      onClick={() => navigate("/portal/company/propose")}
                      className="mt-6 inline-flex items-center gap-2 bg-[#1e3a8a] px-5 py-2.5 text-xs uppercase tracking-wider text-white hover:bg-blue-800 rounded-lg shadow font-bold"
                    >
                      <Plus size={14} /> Propose First Project
                    </button>
                  </div>
                ) : (
                  projects.map((project, index) => (
                    <motion.div
                      key={`${getProjectId(project)}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-slate-200 bg-white p-6 md:p-7 rounded-xl shadow-sm hover:border-slate-300 transition"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs font-bold tracking-wider text-[#1e3a8a] bg-blue-50 px-2.5 py-1 border border-blue-200 rounded">
                              {getProjectId(project)}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-slate-400" />
                            <span className="text-xs font-bold tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 border border-amber-200 rounded">
                              {project.status || "Pending Verification"}
                            </span>
                          </div>

                          <h3 className="mt-3 font-outfit text-2xl md:text-3xl font-bold text-slate-900">
                            {project.projectName || project.name}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
                            <span className="flex items-center gap-1.5 text-[#1e3a8a] font-semibold">
                              <MapPin size={13} />
                              {project.location || `${project.district || "District"}, ${project.state || "State"}`}
                            </span>
                            <span>•</span>
                            <span>Land Area: {project.landArea ? `${project.landArea} acres` : project.land}</span>
                            <span>•</span>
                            <span>Parcels: {project.parcels || 1}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 lg:min-w-[280px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                              Current Stage
                            </p>
                            <p className="mt-1 font-outfit text-lg text-slate-900 font-bold">
                              {project.stage || "Proposal Submitted"}
                            </p>
                          </div>

                          <button
                            onClick={() => handleOpenProject(getProjectId(project))}
                            className="group flex w-full items-center justify-between border border-[#1e3a8a] bg-[#1e3a8a] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-blue-800 rounded-lg shadow-sm"
                          >
                            <span>Track Status</span>
                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  ))
                )}
              </div>

            </div>


            {/* SYSTEM NOTICE */}
            <div className="mt-16 border-l-4 border-[#1e3a8a] bg-white p-6 md:p-8 rounded-r-xl border border-slate-200 shadow-sm">
              <div className="flex gap-4 items-start">
                <ShieldCheck size={22} className="mt-0.5 shrink-0 text-[#1e3a8a]" />
                <div>
                  <p className="text-xs font-bold tracking-wider text-[#1e3a8a]">
                    Official Compliance Notice
                  </p>
                  <p className="mt-2 text-sm text-slate-700 font-medium leading-relaxed">
                    Companies initiate project proposals and define their required land metrics. Official reviews, verifications, statutory approvals, and subsequent administrative land acquisition actions remain strictly under the authority of designated government departments.
                  </p>
                </div>
              </div>
            </div>


            {/* BACK LINK */}
            <button
              onClick={() => navigate("/")}
              className="mt-10 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-700 hover:text-[#1e3a8a] transition"
            >
              <ArrowLeft size={14} /> Return to DHARA Portal Hub
            </button>

          </div>
        </div>


        {/* FOOTER */}
        <footer className="border-t border-slate-900 bg-[#0f172a] px-5 py-8 md:px-10 text-xs text-slate-400">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p>© 2026 Ministry of Land and Infrastructure, Government of India. All rights reserved.</p>
            <div className="flex items-center gap-6 uppercase tracking-wider font-bold text-[11px]">
              <span>Privacy Policy</span>
              <span>Terms of Use</span>
              <span>Help Desk</span>
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}

export default CompanyDashboard