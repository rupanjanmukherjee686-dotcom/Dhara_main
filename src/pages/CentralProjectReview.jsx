import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  LandPlot,
  MapPin,
  ShieldCheck,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { motion } from "framer-motion"
import { API_BASE_URL } from "../api"

function CentralProjectReview() {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const [project, setProject] = useState(null)
  const [decision, setDecision] = useState("")
  const [remarks, setRemarks] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects/${projectId}`)
      .then((response) => response.json())
      .then((data) => setProject(data.success ? data.project : null))
      .catch(() => setProject(null))
  }, [projectId])

  const handleSubmit = async () => {
    if (!decision) return
    const response = await fetch(`${API_BASE_URL}/api/central/review/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        officerId: localStorage.getItem("dhara-officer-id") || "Central Authority",
        decision,
        remarks: remarks.trim(),
      }),
    })
    const data = await response.json()
    if (response.ok && data.success) {
      setProject(data.project)
      setSubmitted(true)
    }
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex items-center justify-center px-6">
        <div className="text-center bg-white border border-slate-200 p-10 rounded-xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Project record unavailable
          </p>

          <button
            onClick={() => navigate("/portal/central")}
            className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-[#1e3a8a] text-white px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Central Authority
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] relative overflow-hidden flex items-center justify-center px-6 font-jakarta">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full bg-white border border-slate-200 p-8 md:p-12 text-center rounded-2xl shadow-sm"
        >
          <div className="w-14 h-14 mx-auto mb-6 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1e3a8a]">
            {decision === "approve" ? (
              <CheckCircle2 size={28} strokeWidth={1.5} />
            ) : decision === "information" ? (
              <AlertTriangle size={28} strokeWidth={1.5} />
            ) : (
              <XCircle size={28} strokeWidth={1.5} />
            )}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Central Authority Decision Recorded
          </p>

          <h1 className="font-outfit text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {decision === "approve"
              ? "Project approved."
              : decision === "information"
              ? "Information requested."
              : "Project rejected."}
          </h1>

          <p className="text-xs text-slate-600 font-medium leading-relaxed mb-8">
            {decision === "approve"
              ? "The project has been cleared for the acquisition and implementation stage."
              : decision === "information"
              ? "The project has been returned to the Project Authority for additional information."
              : "The project has been rejected at the Central Authority level."}
          </p>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left mb-8 space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Project ID
              </span>
              <span className="text-xs font-bold text-slate-700">
                {project.projectId}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                New Stage
              </span>
              <span className="text-xs font-bold text-[#1e3a8a]">
                {project.currentStage}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/portal/central")}
            className="w-full bg-[#0f172a] hover:bg-[#1e3a8a] text-white py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-md"
          >
            Return to Central Dashboard
          </button>
        </motion.div>
      </div>
    )
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
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("/portal/central")}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#1e3a8a] transition"
            >
              <ArrowLeft size={16} />
              Central Authority
            </button>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1e3a8a] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full shadow-sm">
              <ShieldCheck size={14} />
              National Oversight
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="max-w-7xl mx-auto w-full px-5 md:px-12 py-10">

          {/* TITLE */}
          <section className="mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-[#1e3a8a] text-xs font-bold tracking-wider mb-4">
                  CENTRAL PROJECT REVIEW
                </span>

                <h1 className="font-outfit text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                  National oversight
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 font-medium">
                  Review the project record and determine whether it can
                  proceed toward acquisition and implementation.
                </p>
              </div>

              <div className="bg-white border border-slate-200 px-5 py-4 rounded-xl shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Project ID
                </p>
                <p className="font-outfit text-base font-bold text-slate-900 mt-1">
                  {project.projectId}
                </p>
              </div>
            </div>
          </section>

          {/* PROJECT OVERVIEW */}
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-8">

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4 flex items-center gap-3 bg-slate-50/50">
                <Building2 size={16} className="text-[#1e3a8a]" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Project Record
                </p>
              </div>

              <div className="p-6 md:p-8">
                <h2 className="font-outfit text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                  {project.projectName || project.name}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InfoBlock
                    label="Project Type"
                    value={project.projectType || "Not specified"}
                  />
                  <InfoBlock
                    label="State"
                    value={project.preferredState || "Not specified"}
                    icon={<MapPin size={14} className="text-[#1e3a8a]" />}
                  />
                  <InfoBlock
                    label="District"
                    value={project.district || "Not specified"}
                    icon={<MapPin size={14} className="text-[#1e3a8a]" />}
                  />
                  <InfoBlock
                    label="Land Requirement"
                    value={`${project.totalLandRequired || "—"} ${project.landUnit || "Acres"}`}
                    icon={<LandPlot size={14} className="text-[#1e3a8a]" />}
                  />
                  <InfoBlock
                    label="Number of Parcels"
                    value={project.surveyPlotNumbers || "—"}
                    icon={<LandPlot size={14} className="text-[#1e3a8a]" />}
                  />
                  <InfoBlock
                    label="Current Authority"
                    value={project.authority || "—"}
                  />
                </div>
              </div>
            </div>

            {/* CURRENT STATUS */}
            <div className="bg-[#0f172a] text-white border border-slate-900 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="border-b border-slate-800 px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current Workflow Position
                </p>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Stage
                  </p>
                  <p className="font-outfit text-xl font-bold text-white">
                    {project.currentStage}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Status
                  </p>
                  <p className="text-xs font-semibold text-blue-300">
                    {project.status}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Next Action
                  </p>
                  <p className="text-xs font-semibold text-slate-200">
                    {project.authority || "Central Authority review"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* LAND REQUIREMENT */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center gap-3 bg-slate-50/50">
              <LandPlot size={16} className="text-[#1e3a8a]" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Land Requirement & Purpose
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Proposed Requirement
                  </p>
                  <p className="font-outfit text-3xl font-bold text-slate-900">
                    {project.totalLandRequired || "—"} {project.landUnit || "Acres"}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {project.surveyPlotNumbers || "No parcel numbers listed"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Purpose / Justification
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600 font-medium">
                    {project.acquisitionPurpose ||
                      "No purpose or land requirement justification has been provided."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* DESCRIPTION */}
          {project.detailedProjectDescription && (
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="border-b border-slate-200 px-6 py-4 flex items-center gap-3 bg-slate-50/50">
                <FileText size={16} className="text-[#1e3a8a]" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Project Description
                </p>
              </div>

              <div className="p-6 md:p-8">
                <p className="text-xs leading-relaxed text-slate-600 font-medium">
                  {project.detailedProjectDescription}
                </p>
              </div>
            </section>
          )}

          {/* FIELD + DISTRICT FINDINGS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ReviewPanel
              title="Field Verification"
              status={project.fieldVerification}
              remarks={project.fieldVerificationRemarks}
            />
            <ReviewPanel
              title="District Field Review"
              status={project.districtFieldReview}
              remarks={project.districtFieldReviewRemarks}
            />
          </section>

          {/* STATE DECISION */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center gap-3 bg-slate-50/50">
              <ShieldCheck size={16} className="text-[#1e3a8a]" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                State Authority Decision
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Decision
                  </p>
                  <p className="font-outfit text-2xl font-bold text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 size={20} />
                    {project.stateScrutinyStatus || "Verified"}
                  </p>
                </div>

                {project.stateRemarks && (
                  <div className="max-w-xl">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Remarks
                    </p>
                    <p className="text-xs leading-relaxed text-slate-600 font-medium">
                      {project.stateRemarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* DECISION FORM */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-5 bg-slate-50/50">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Central Authority Decision
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Record the national-level decision for this project.
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <DecisionButton
                  active={decision === "approve"}
                  onClick={() => setDecision("approve")}
                  icon={<CheckCircle2 size={18} strokeWidth={1.5} />}
                  title="Approve"
                  description="Proceed to acquisition"
                />

                <DecisionButton
                  active={decision === "information"}
                  onClick={() => setDecision("information")}
                  icon={<AlertTriangle size={18} strokeWidth={1.5} />}
                  title="Request Information"
                  description="Return to company"
                />

                <DecisionButton
                  active={decision === "reject"}
                  onClick={() => setDecision("reject")}
                  icon={<XCircle size={18} strokeWidth={1.5} />}
                  title="Reject"
                  description="End project workflow"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Decision Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  rows={4}
                  placeholder="Enter the reasoning, conditions, or information required..."
                  className="w-full resize-none border border-slate-300 bg-slate-50 rounded-lg px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!decision}
                className={`w-full py-4 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-md ${
                  decision
                    ? "bg-[#0f172a] hover:bg-[#1e3a8a] text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                Record Central Authority Decision
              </button>
            </div>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-xs text-slate-500 font-medium mt-12">
          <span>© 2026 Government of India · National Land Information System</span>
        </footer>

      </div>
    </>
  )
}

function InfoBlock({ label, value, icon }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-xs font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  )
}

function ReviewPanel({ title, status, remarks }) {
  const statusValue = typeof status === "object" ? status?.status : status
  const remarksValue = remarks || (typeof status === "object" ? status?.remarks : "")

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {title}
        </p>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Finding
          </p>
          <p className="font-outfit text-xl font-bold text-slate-900">
            {statusValue || "Not recorded"}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Remarks
          </p>
          <p className="text-xs leading-relaxed text-slate-600 font-medium">
            {remarksValue || "No remarks recorded."}
          </p>
        </div>
      </div>
    </div>
  )
}

function DecisionButton({
  active,
  onClick,
  icon,
  title,
  description,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl border transition-all ${
        active
          ? "border-[#1e3a8a] bg-blue-50/50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${active ? "text-[#1e3a8a]" : "text-slate-400"}`}>
          {icon}
        </div>
        <div>
          <p className="font-outfit text-sm font-bold text-slate-900">
            {title}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {description}
          </p>
        </div>
      </div>
    </button>
  )
}

export default CentralProjectReview
