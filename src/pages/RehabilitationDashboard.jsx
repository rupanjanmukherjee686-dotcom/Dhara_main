import { useEffect, useMemo, useState } from "react"
import { ArrowRight, CalendarDays, FileText, Home, MapPin, RefreshCw, ShieldCheck, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../api"

function RehabilitationDashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [consentPercentage, setConsentPercentage] = useState(0)
  const [meetingDate, setMeetingDate] = useState("")
  const [faceToFaceNotes, setFaceToFaceNotes] = useState("")
  const [landownerAgreement, setLandownerAgreement] = useState("Pending")
  const [resettlementPlan, setResettlementPlan] = useState("")
  const [approveForState, setApproveForState] = useState(false)
  const [savingReview, setSavingReview] = useState(false)

  const loadProjects = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/rehabilitation/projects`)
      const data = await response.json()
      setProjects(data.success && Array.isArray(data.projects) ? data.projects : [])
    } catch (error) {
      console.error("Failed to load rehabilitation projects:", error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const totalFamilies = useMemo(
    () => projects.reduce((total, project) => total + Number(project.approximateAffectedFamilies || 0), 0),
    [projects]
  )

  const projectsWithFunding = projects.filter((project) => project.compensationFundingDetails).length
  const projectsWithFamilies = projects.filter((project) => project.approximateAffectedFamilies).length
  const savedProjects = projects.filter((project) => project.rehabilitationReview?.reviewedAt)
  const incomingProjects = projects.filter((project) => !project.rehabilitationReview?.reviewedAt)

  const selectProject = (project) => {
    setSelectedProject(selectedProject?.projectId === project.projectId ? null : project)
    if (selectedProject?.projectId !== project.projectId) {
      setConsentPercentage(project.rehabilitationReview?.consentPercentage || 0)
      setMeetingDate(project.rehabilitationReview?.meetingDate || "")
      setFaceToFaceNotes(project.rehabilitationReview?.faceToFaceNotes || "")
      setLandownerAgreement(project.rehabilitationReview?.landownerAgreement || "Pending")
      setResettlementPlan(project.rehabilitationReview?.resettlementPlan || "")
      setApproveForState(Boolean(project.rehabilitationReview?.approvedForState))
    }
  }

  const saveReview = async (event) => {
    event.preventDefault()
    if (!selectedProject) return
    setSavingReview(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/rehabilitation/review/${selectedProject.projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officerId: localStorage.getItem("dhara-officer-id") || "Rehabilitation Authority",
          consentPercentage,
          meetingDate,
          faceToFaceNotes,
          landownerAgreement,
          resettlementPlan,
          approveForState,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || "Review could not be saved")
      alert(data.approvedForState ? `R&R approved and sent to State. DHARA ID: ${data.dharaId}` : data.consentReached ? "80% consent recorded. Approve it to issue the DHARA ID and notify State." : "Rehabilitation review saved.")
      await loadProjects()
      setSelectedProject(data.project)
    } catch (error) {
      alert(error.message)
    } finally {
      setSavingReview(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-jakarta">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        body, .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <header className="border-b border-slate-200 bg-white px-5 py-4 shadow-sm md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-[#1e3a8a] text-lg text-white">🇮🇳</div>
            <div>
              <p className="font-outfit text-lg font-bold tracking-wide text-[#1e3a8a]">DHARA</p>
              <p className="text-[10px] font-semibold tracking-wide text-slate-500">REHABILITATION & RESETTLEMENT ADMINISTRATION</p>
            </div>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-xs font-bold text-slate-800">R&R Administrator</span>
              <span className="block text-[10px] text-slate-500">Government access</span>
            </span>
            <ShieldCheck size={22} className="text-amber-700" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <section className="mb-8 border-b border-slate-200 pb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">Administrative rehabilitation cell</p>
              <h1 className="mt-2 font-outfit text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">Rehabilitation & Resettlement Dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-600">Review affected families, compensation readiness and resettlement obligations linked to land acquisition projects.</p>
            </div>
            <button type="button" onClick={loadProjects} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm hover:border-amber-300">
              <RefreshCw size={14} className="text-amber-700" /> Refresh records
            </button>
          </div>
        </section>

        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<FileText size={18} />} label="Projects" value={projects.length} />
          <StatCard icon={<Users size={18} />} label="Affected families" value={totalFamilies.toLocaleString()} />
          <StatCard icon={<ShieldCheck size={18} />} label="Funding details" value={projectsWithFunding} />
          <StatCard icon={<Home size={18} />} label="Family records" value={projectsWithFamilies} />
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between border-b border-slate-200 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">R&R case register</p>
              <h2 className="mt-1 font-outfit text-2xl font-bold text-slate-900">Projects received from State Authority</h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">{projects.length} records</span>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Loading R&R records...</div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Users size={30} className="mx-auto text-amber-600" />
              <h3 className="mt-4 font-outfit text-xl font-bold text-slate-900">No project records available</h3>
              <p className="mt-2 text-xs font-medium text-slate-500">Submitted projects will appear here for rehabilitation and resettlement review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingProjects.map((project) => {
                const projectId = project.projectId || project.id
                const families = project.approximateAffectedFamilies || "Not recorded"
                return (
                  <article key={projectId} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start md:justify-between md:p-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">{projectId}</span>
                          <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">{project.currentStage || project.stage || "Proposal submitted"}</span>
                        </div>
                        <h3 className="mt-3 font-outfit text-2xl font-bold text-slate-900">{project.projectName || project.title || "Untitled Project"}</h3>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                          <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-amber-700" />{project.district || "District not recorded"}, {project.preferredState || "State not recorded"}</span>
                          <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} className="text-amber-700" />Possession: {project.requiredPossessionDate || "Not recorded"}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => selectProject(project)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-amber-700">
                        {selectedProject?.projectId === projectId ? "Close record" : "Review R&R record"}<ArrowRight size={14} />
                      </button>
                    </div>

                    <div className="grid border-t border-slate-200 bg-slate-50/70 sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
                      <Summary label="Affected families" value={families} />
                      <Summary label="Compensation funding" value={project.compensationFundingDetails ? "Recorded" : "Pending details"} />
                      <Summary label="Acquisition purpose" value={project.acquisitionPurpose || "Not recorded"} />
                    </div>

                    {selectedProject?.projectId === projectId && (
                      <form onSubmit={saveReview} className="border-t border-slate-200 p-5 md:p-6">
                        <div className="grid gap-4 md:grid-cols-2">
                        <Detail label="Company" value={project.companyName || "Not recorded"} />
                        <Detail label="Authorized person" value={project.authorizedPersonName || "Not recorded"} />
                        <Detail label="Affected families" value={families} />
                        <Detail label="Compensation funding details" value={project.compensationFundingDetails || "No funding details recorded"} />
                        <Detail label="Required possession date" value={project.requiredPossessionDate || "Not recorded"} />
                        <Detail label="Location rationale" value={project.whyParticularLocation || "Not recorded"} />
                        <Detail label="Alternative location considered" value={project.alternativeLocationConsidered || "Not recorded"} />
                        <Detail label="Current status" value={project.status || "Pending"} />
                        </div>
                        <div className="mt-6 border-t border-slate-200 pt-5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Face-to-face landowner consultation</p>
                          <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <label className="text-xs font-semibold text-slate-700">Consent percentage
                              <input type="number" min="0" max="100" value={consentPercentage} onChange={(event) => setConsentPercentage(event.target.value)} className="mt-2 w-full rounded border border-slate-300 p-3" />
                            </label>
                            <label className="text-xs font-semibold text-slate-700">Meeting date
                              <input type="date" value={meetingDate} onChange={(event) => setMeetingDate(event.target.value)} className="mt-2 w-full rounded border border-slate-300 p-3" />
                            </label>
                            <label className="text-xs font-semibold text-slate-700">Agreement status
                              <select value={landownerAgreement} onChange={(event) => setLandownerAgreement(event.target.value)} className="mt-2 w-full rounded border border-slate-300 bg-white p-3">
                                <option>Pending</option>
                                <option>Discussed with landowners</option>
                                <option>Consent not reached</option>
                                <option>80% Consent Reached</option>
                              </select>
                            </label>
                          </div>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <label className="text-xs font-semibold text-slate-700">Face-to-face meeting notes
                              <textarea rows="4" value={faceToFaceNotes} onChange={(event) => setFaceToFaceNotes(event.target.value)} className="mt-2 w-full rounded border border-slate-300 p-3" placeholder="Record the discussion with affected landowners..." />
                            </label>
                            <label className="text-xs font-semibold text-slate-700">Rehabilitation / resettlement plan
                              <textarea rows="4" value={resettlementPlan} onChange={(event) => setResettlementPlan(event.target.value)} className="mt-2 w-full rounded border border-slate-300 p-3" placeholder="Record the agreed rehabilitation and resettlement measures..." />
                            </label>
                          </div>
                          {project.rehabilitationDharaId && (
                            <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
                              DHARA ID issued: {project.rehabilitationDharaId}. This ID is now available to the landowners and State Authority.
                            </div>
                          )}
                          <label className="mt-5 flex items-start gap-3 rounded border border-blue-200 bg-blue-50 p-4 text-xs font-semibold text-blue-900">
                            <input type="checkbox" checked={approveForState} disabled={Number(consentPercentage) < 80} onChange={(event) => setApproveForState(event.target.checked)} className="mt-0.5 h-4 w-4" />
                            <span>Approve this rehabilitation, compensation and resettlement information for State Authority (requires 80% consent)</span>
                          </label>
                          <button type="submit" disabled={savingReview} className="mt-5 inline-flex items-center gap-2 rounded bg-amber-700 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50">
                            <ShieldCheck size={14} /> {savingReview ? "Saving..." : approveForState ? "Approve & Notify State" : "Save consultation record"}
                          </button>
                        </div>
                      </form>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between border-b border-slate-200 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Saved R&R register</p>
              <h2 className="mt-1 font-outfit text-2xl font-bold text-slate-900">Rehabilitation records saved in this portal</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">These records remain available after State notification and include the R&R review history.</p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{savedProjects.length} saved</span>
          </div>
          {savedProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-xs font-medium text-slate-400">No R&R review record saved yet.</div>
          ) : (
            <div className="space-y-4">
              {savedProjects.map((project) => {
                const projectId = project.projectId || project.id
                return (
                  <article key={`saved-${projectId}`} className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Saved R&R record · {projectId}</p>
                        <h3 className="mt-2 font-outfit text-xl font-bold text-slate-900">{project.projectName || project.title || "Untitled Project"}</h3>
                        <div className="mt-2 grid gap-2 text-xs font-medium text-slate-600 sm:grid-cols-3">
                          <span>Consent: {project.rehabilitationReview?.consentPercentage || 0}%</span>
                          <span>DHARA ID: {project.rehabilitationDharaId || "Not issued"}</span>
                          <span>State: {project.rehabilitationReview?.approvedForState ? "Notified" : "Pending approval"}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => selectProject(project)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-emerald-800 hover:bg-emerald-100">
                        {selectedProject?.projectId === projectId ? "Close record" : "Open saved record"}<ArrowRight size={14} />
                      </button>
                    </div>
                    {selectedProject?.projectId === projectId && (
                      <div className="mt-5 grid gap-3 border-t border-emerald-100 pt-5 md:grid-cols-3">
                        <Detail label="Meeting notes" value={project.rehabilitationReview?.faceToFaceNotes || "Not recorded"} />
                        <Detail label="Resettlement plan" value={project.rehabilitationReview?.resettlementPlan || "Not recorded"} />
                        <Detail label="Approved by" value={project.rehabilitationReview?.approvedBy || "Pending approval"} />
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function StatCard({ icon, label, value }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">{icon}{label}</div><p className="mt-3 font-outfit text-3xl font-bold text-slate-900">{value}</p></div>
}

function Summary({ label, value }) {
  return <div className="p-5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-800">{value}</p></div>
}

function Detail({ label, value }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 break-words text-sm font-semibold text-slate-800">{value}</p></div>
}

export default RehabilitationDashboard
