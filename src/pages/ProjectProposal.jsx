import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  LandPlot,
  MapPin,
  ShieldCheck,
  Upload,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../api"

const projectTypes = [
  "Industrial Development",
  "Infrastructure",
  "Transportation",
  "Energy",
  "Logistics",
  "Urban Development",
  "Other",
]

const states = [
  "Maharashtra",
  "West Bengal",
  "Odisha",
  "Tamil Nadu",
  "Gujarat",
  "Karnataka",
  "Other",
]

const landUnits = ["Acres", "Hectares", "Sq. Meters"]
const landTypes = ["Agricultural", "Non-agricultural"]
const irrigationTypes = ["Irrigated", "Non-irrigated"]
const cropTypes = ["Multi-crop", "Single-crop", "Wasteland"]

const steps = [
  { number: "01", label: "Company details" },
  { number: "02", label: "Project details" },
  { number: "03", label: "Land requirement" },
  { number: "04", label: "Land characteristics" },
  { number: "05", label: "Acquisition requirement" },
  { number: "06", label: "Documents & declaration" },
]

function generateProjectId() {
  const year = new Date().getFullYear()
  const randomNumber = Math.floor(1000 + Math.random() * 9000)
  return `DH-${year}-${randomNumber}`
}

function ProjectProposal() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)

  const [form, setForm] = useState({
    companyName: "",
    companyRegistrationNumber: "",
    registeredAddress: "",
    authorizedPersonName: "",
    designation: "",
    email: "",
    phoneNumber: "",
    projectName: "",
    projectType: "",
    detailedProjectDescription: "",
    estimatedProjectCost: "",
    expectedEmploymentGeneration: "",
    projectStartDate: "",
    expectedCompletionDate: "",
    totalLandRequired: "",
    landUnit: "Acres",
    preferredState: "",
    district: "",
    blockTehsil: "",
    villageMouza: "",
    surveyPlotNumbers: "",
    longitudeLatitude: "",
    agriculturalStatus: "",
    irrigationStatus: "",
    cropStatus: "",
    existingBuildings: "",
    existingFeatures: "",
    acquisitionPurpose: "",
    whyParticularLocation: "",
    alternativeLocationConsidered: "",
    requiredPossessionDate: "",
    approximateAffectedFamilies: "",
    compensationFundingDetails: "",
    declarationSigned: false,
  })

  const [documents, setDocuments] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [submittedProject, setSubmittedProject] = useState(null)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files || [])
    setDocuments((current) => [...current, ...files])
    event.target.value = ""
  }

  const removeDocument = (indexToRemove) => {
    setDocuments((current) => current.filter((_, index) => index !== indexToRemove))
  }

  const goToNextStep = () => {
    setCurrentStep((step) => Math.min(step + 1, 6))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goToPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const projectId = generateProjectId()
    const submittedAt = new Date().toISOString()
    const userEmail = (form.email || localStorage.getItem("userEmail") || "")
      .trim()
      .toLowerCase()

    const proposal = {
      projectId,
      ...form,
      email: userEmail,
      userEmail,
      documents: documents.map((document) => ({
        name: document.name,
        size: document.size,
        type: document.type,
      })),
      submittedAt,
      stage: "State Scrutiny",       // District skip kore direct State Scrutiny-te jabe
      status: "Pending",
      authority: "State Authority",   // Authority change kore State Authority kora holo
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/proposals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposal),
      })

      const data = await response.json()
      if (!response.ok) {
        console.error("Error saving to database:", data.message)
      } else {
        console.log("Successfully saved to MongoDB Atlas:", data)
      }
    } catch (error) {
      console.error("Network or server connection error:", error)
    }

    const existingProjects = JSON.parse(localStorage.getItem("dhara-projects") || "[]")
    const updatedProjects = [...existingProjects, proposal]

    localStorage.setItem("dhara-projects", JSON.stringify(updatedProjects))
    localStorage.setItem("dhara-latest-proposal", JSON.stringify(proposal))

    setSubmittedProject(proposal)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  const handleStepClick = (stepNumber) => {
    setCurrentStep(stepNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (submitted && submittedProject) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          .font-outfit { font-family: 'Outfit', sans-serif; }
          body, .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
          @media print {
            button, header, .no-print { display: none !important; }
            body { background: white !important; }
          }
        `}</style>
        <main className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-jakarta">
          <div className="bg-[#1e3a8a] text-white px-6 py-2.5 text-xs font-medium flex justify-between items-center border-b border-blue-900 no-print">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-3 bg-orange-500 rounded-sm"></span>
              <span>Ministry of Land and Infrastructure, Government of India</span>
            </div>
            <span>English / বাংলা</span>
          </div>

          <header className="border-b border-slate-200 bg-white no-print">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-[#1e3a8a] text-white rounded font-bold">
                  <span className="font-outfit text-lg">🇮🇳</span>
                </div>
                <div>
                  <p className="font-outfit text-lg font-bold tracking-wide text-[#1e3a8a]">DHARA</p>
                  <p className="text-[10px] font-semibold tracking-wide text-slate-500">NATIONAL LAND INFORMATION SYSTEM</p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/portal/company/project/${submittedProject.projectId || submittedProject.id}`)}
                className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1e3a8a] transition-colors hover:underline"
              >
                <ArrowLeft size={14} strokeWidth={1.5} />
                Back to portal
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-6 py-12">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="border-b border-slate-200 p-8 sm:p-12 bg-slate-50">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50">
                      <CheckCircle2 size={28} strokeWidth={2} className="text-emerald-600" />
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold tracking-wider mb-2">
                        Submission Successful & Saved to Database
                      </span>
                      <h1 className="font-outfit text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Proposal Form Generated.
                      </h1>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 font-medium">
                        Your project proposal has been successfully submitted and stored in MongoDB Atlas. You can download the official filled PDF form below.
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-200 bg-white p-5 rounded-xl shadow-sm sm:min-w-[210px]">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">DHARA Project ID</p>
                    <p className="mt-1 font-outfit text-lg font-bold text-[#1e3a8a]">{submittedProject.projectId || submittedProject.id}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-12 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
                  <div>
                    <h2 className="font-outfit text-2xl font-bold text-slate-900">{submittedProject.projectName || "Untitled Project"}</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Submitted on: {new Date(submittedProject.submittedAt).toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <Download size={16} strokeWidth={1.5} />
                    Download Form as PDF
                  </button>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">1. Company Details</h3>
                    <p className="text-xs text-slate-700"><strong>Company Name:</strong> {submittedProject.companyName || "N/A"}</p>
                    <p className="text-xs text-slate-700"><strong>Registration No:</strong> {submittedProject.companyRegistrationNumber || "N/A"}</p>
                    <p className="text-xs text-slate-700"><strong>Registered Address:</strong> {submittedProject.registeredAddress || "N/A"}</p>
                    <p className="text-xs text-slate-700"><strong>Authorized Person:</strong> {submittedProject.authorizedPersonName || "N/A"} ({submittedProject.designation || "N/A"})</p>
                    <p className="text-xs text-slate-700"><strong>Contact:</strong> {submittedProject.email || "N/A"} | {submittedProject.phoneNumber || "N/A"}</p>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">2. Project Details</h3>
                    <p className="text-xs text-slate-700"><strong>Type/Industry:</strong> {submittedProject.projectType || "N/A"}</p>
                    <p className="text-xs text-slate-700"><strong>Estimated Cost:</strong> ₹{submittedProject.estimatedProjectCost || "N/A"}</p>
                    <p className="text-xs text-slate-700"><strong>Employment Generation:</strong> {submittedProject.expectedEmploymentGeneration || "N/A"} jobs</p>
                    <p className="text-xs text-slate-700"><strong>Timeline:</strong> {submittedProject.projectStartDate || "N/A"} to {submittedProject.expectedCompletionDate || "N/A"}</p>
                    <p className="text-xs text-slate-700"><strong>Description:</strong> {submittedProject.detailedProjectDescription || "N/A"}</p>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">3. Land Requirement</h3>
                    <p className="text-xs text-slate-700"><strong>Extent Required:</strong> {submittedProject.totalLandRequired || "N/A"} {submittedProject.landUnit}</p>
                    <p className="text-xs text-slate-700"><strong>Location:</strong> Village/Mouza: {submittedProject.villageMouza || "N/A"}, Tehsil: {submittedProject.blockTehsil || "N/A"}, District: {submittedProject.district || "N/A"}, {submittedProject.preferredState || "N/A"}</p>
                    <p className="text-xs text-slate-700"><strong>Survey/Plot Numbers:</strong> {submittedProject.surveyPlotNumbers || "N/A"}</p>
                    <p className="text-xs text-slate-700"><strong>Coordinates:</strong> {submittedProject.longitudeLatitude || "N/A"}</p>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">4. Land Characteristics</h3>
                    <p className="text-xs text-slate-700"><strong>Classification:</strong> {submittedProject.agriculturalStatus || "N/A"} | {submittedProject.irrigationStatus || "N/A"} | {submittedProject.cropStatus || "N/A"}</p>
                    <p className="text-xs text-slate-700"><strong>Existing Buildings:</strong> {submittedProject.existingBuildings || "None"}</p>
                    <p className="text-xs text-slate-700"><strong>Features & Trees:</strong> {submittedProject.existingFeatures || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">5. Acquisition & Funding Details</h3>
                  <p className="text-xs text-slate-700"><strong>Purpose:</strong> {submittedProject.acquisitionPurpose || "N/A"}</p>
                  <p className="text-xs text-slate-700"><strong>Why this location:</strong> {submittedProject.whyParticularLocation || "N/A"}</p>
                  <p className="text-xs text-slate-700"><strong>Required Possession Date:</strong> {submittedProject.requiredPossessionDate || "N/A"}</p>
                  <p className="text-xs text-slate-700"><strong>Funding Details:</strong> {submittedProject.compensationFundingDetails || "N/A"}</p>
                </div>

                <div className="flex justify-end gap-4 no-print pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/portal/company")}
                    className="border border-slate-300 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Return to Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/portal/company/project/${submittedProject.projectId || submittedProject.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    Track Project
                    <ArrowRight size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </motion.section>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        body, .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
      <main className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-jakarta">
        <div className="bg-[#1e3a8a] text-white px-6 py-2.5 text-xs font-medium flex justify-between items-center border-b border-blue-900">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-3 bg-orange-500 rounded-sm"></span>
            <span>Ministry of Land and Infrastructure, Government of India</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span>English / বাংলা</span>
          </div>
        </div>

        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-[#1e3a8a] text-white rounded font-bold">
                <span className="font-outfit text-lg">🇮🇳</span>
              </div>
              <div>
                <p className="font-outfit text-lg font-bold tracking-wide text-[#1e3a8a]">DHARA</p>
                <p className="text-[10px] font-semibold tracking-wide text-slate-500">NATIONAL LAND INFORMATION SYSTEM</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/portal/company")}
              className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1e3a8a] transition-colors hover:underline"
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              Back to company portal
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <section className="mb-10 border-b border-slate-200 pb-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-block px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[#1e3a8a] text-xs font-bold tracking-wider">
                Project Authority Portal
              </span>
              <span className="h-px w-6 bg-slate-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">New Proposal</span>
            </div>

            <h1 className="max-w-4xl font-outfit text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Propose a new project & land requisition.
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 font-medium md:text-base">
              Complete the structured sections below. You can freely navigate through any section using the tabs above or the buttons below without restrictions. Upon final submission, your data will be saved securely to MongoDB Atlas.
            </p>
          </section>

          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-6">
            {steps.map((step, index) => {
              const stepNumber = index + 1
              const active = currentStep === stepNumber
              const completed = currentStep > stepNumber

              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => handleStepClick(stepNumber)}
                  className={`p-3.5 text-left transition-all rounded-xl border ${
                    active
                      ? "bg-[#1e3a8a] text-white border-blue-900 shadow-sm"
                      : completed
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-outfit text-xs font-bold ${active ? "text-blue-200" : completed ? "text-emerald-600" : "text-slate-400"}`}>
                      {completed ? "✓" : step.number}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-wider truncate">
                    {step.label}
                  </p>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <motion.section
                key="step-one"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="border-b border-slate-200 p-8 sm:p-10 bg-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-[#1e3a8a]">
                      <Building2 size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">Section 01</span>
                      <h2 className="mt-0.5 font-outfit text-2xl font-bold text-slate-900">Company Details</h2>
                      <p className="mt-1 text-xs text-slate-600 font-medium">Provide official company registration and contact details.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 p-8 sm:p-12 md:grid-cols-2">
                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Company Name *</span>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => updateField("companyName", e.target.value)}
                      placeholder="Enter company legal name"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Company Registration Number *</span>
                    <input
                      type="text"
                      value={form.companyRegistrationNumber}
                      onChange={(e) => updateField("companyRegistrationNumber", e.target.value)}
                      placeholder="Enter CIN / Registration No."
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Registered Address *</span>
                    <textarea
                      rows={3}
                      value={form.registeredAddress}
                      onChange={(e) => updateField("registeredAddress", e.target.value)}
                      placeholder="Enter complete registered corporate office address"
                      className="mt-3 w-full resize-none border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium leading-relaxed"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Authorized Person Name *</span>
                    <input
                      type="text"
                      value={form.authorizedPersonName}
                      onChange={(e) => updateField("authorizedPersonName", e.target.value)}
                      placeholder="Full name of authorized representative"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Designation *</span>
                    <input
                      type="text"
                      value={form.designation}
                      onChange={(e) => updateField("designation", e.target.value)}
                      placeholder="e.g. Director, CEO, Project Head"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Email *</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="corporate@domain.com"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Phone Number *</span>
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => updateField("phoneNumber", e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>
                </div>

                <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-8">
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <span>Proceed to Project Details</span>
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.section>
            )}

            {currentStep === 2 && (
              <motion.section
                key="step-two"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="border-b border-slate-200 p-8 sm:p-10 bg-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-[#1e3a8a]">
                      <FileText size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">Section 02</span>
                      <h2 className="mt-0.5 font-outfit text-2xl font-bold text-slate-900">Project Details</h2>
                      <p className="mt-1 text-xs text-slate-600 font-medium">Provide comprehensive parameters regarding the proposed project.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 p-8 sm:p-12 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Project Name *</span>
                    <input
                      type="text"
                      value={form.projectName}
                      onChange={(e) => updateField("projectName", e.target.value)}
                      placeholder="Enter project name"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Project Type / Industry *</span>
                    <select
                      value={form.projectType}
                      onChange={(e) => updateField("projectType", e.target.value)}
                      className="mt-3 w-full appearance-none border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    >
                      <option value="">Select project type / industry</option>
                      {projectTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Estimated Project Cost *</span>
                    <input
                      type="text"
                      value={form.estimatedProjectCost}
                      onChange={(e) => updateField("estimatedProjectCost", e.target.value)}
                      placeholder="Amount in INR"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Expected Employment Generation *</span>
                    <input
                      type="number"
                      value={form.expectedEmploymentGeneration}
                      onChange={(e) => updateField("expectedEmploymentGeneration", e.target.value)}
                      placeholder="Total jobs expected"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Project Start Date *</span>
                    <input
                      type="date"
                      value={form.projectStartDate}
                      onChange={(e) => updateField("projectStartDate", e.target.value)}
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Expected Completion Date *</span>
                    <input
                      type="date"
                      value={form.expectedCompletionDate}
                      onChange={(e) => updateField("expectedCompletionDate", e.target.value)}
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-8">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <span>Proceed to Next Steps</span>
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.section>
            )}

            {currentStep === 3 && (
              <motion.section
                key="step-three"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="border-b border-slate-200 p-8 sm:p-10 bg-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-[#1e3a8a]">
                      <LandPlot size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">Section 03</span>
                      <h2 className="mt-0.5 font-outfit text-2xl font-bold text-slate-900">Land Requirement</h2>
                      <p className="mt-1 text-xs text-slate-600 font-medium">Specify land area, location details, and coordinates.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 p-8 sm:p-12 md:grid-cols-2">
                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Total Land Required *</span>
                    <input
                      type="number"
                      value={form.totalLandRequired}
                      onChange={(e) => updateField("totalLandRequired", e.target.value)}
                      placeholder="Enter land area"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Land Unit *</span>
                    <select
                      value={form.landUnit}
                      onChange={(e) => updateField("landUnit", e.target.value)}
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    >
                      {landUnits.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Preferred State *</span>
                    <select
                      value={form.preferredState}
                      onChange={(e) => updateField("preferredState", e.target.value)}
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">District *</span>
                    <input
                      type="text"
                      value={form.district}
                      onChange={(e) => updateField("district", e.target.value)}
                      placeholder="Enter district name"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Block / Tehsil *</span>
                    <input
                      type="text"
                      value={form.blockTehsil}
                      onChange={(e) => updateField("blockTehsil", e.target.value)}
                      placeholder="Enter Block / Tehsil"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Village / Mouza *</span>
                    <input
                      type="text"
                      value={form.villageMouza}
                      onChange={(e) => updateField("villageMouza", e.target.value)}
                      placeholder="Enter Village / Mouza"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-8">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <span>Proceed to Land Characteristics</span>
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.section>
            )}

            {currentStep === 4 && (
              <motion.section
                key="step-four"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="border-b border-slate-200 p-8 sm:p-10 bg-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-[#1e3a8a]">
                      <MapPin size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">Section 04</span>
                      <h2 className="mt-0.5 font-outfit text-2xl font-bold text-slate-900">Land Characteristics</h2>
                      <p className="mt-1 text-xs text-slate-600 font-medium">Provide details regarding agricultural status, irrigation, and features.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 p-8 sm:p-12 md:grid-cols-2">
                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Agricultural Status *</span>
                    <select
                      value={form.agriculturalStatus}
                      onChange={(e) => updateField("agriculturalStatus", e.target.value)}
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    >
                      <option value="">Select status</option>
                      {landTypes.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Irrigation Status *</span>
                    <select
                      value={form.irrigationStatus}
                      onChange={(e) => updateField("irrigationStatus", e.target.value)}
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    >
                      <option value="">Select irrigation</option>
                      {irrigationTypes.map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Crop Status *</span>
                    <select
                      value={form.cropStatus}
                      onChange={(e) => updateField("cropStatus", e.target.value)}
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    >
                      <option value="">Select crop status</option>
                      {cropTypes.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Survey / Plot Numbers *</span>
                    <input
                      type="text"
                      value={form.surveyPlotNumbers}
                      onChange={(e) => updateField("surveyPlotNumbers", e.target.value)}
                      placeholder="e.g. Plot 123, 124"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-8">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <span>Proceed to Acquisition Requirement</span>
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.section>
            )}

            {currentStep === 5 && (
              <motion.section
                key="step-five"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="border-b border-slate-200 p-8 sm:p-10 bg-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-[#1e3a8a]">
                      <ShieldCheck size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">Section 05</span>
                      <h2 className="mt-0.5 font-outfit text-2xl font-bold text-slate-900">Acquisition Requirement</h2>
                      <p className="mt-1 text-xs text-slate-600 font-medium">Specify acquisition purpose and funding details.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 p-8 sm:p-12 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Acquisition Purpose *</span>
                    <textarea
                      rows={3}
                      value={form.acquisitionPurpose}
                      onChange={(e) => updateField("acquisitionPurpose", e.target.value)}
                      placeholder="Why is this land required?"
                      className="mt-3 w-full resize-none border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Why Particular Location *</span>
                    <textarea
                      rows={3}
                      value={form.whyParticularLocation}
                      onChange={(e) => updateField("whyParticularLocation", e.target.value)}
                      placeholder="Justification for selecting this location"
                      className="mt-3 w-full resize-none border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Required possession date *</span>
                    <input
                      type="date"
                      value={form.requiredPossessionDate}
                      onChange={(e) => updateField("requiredPossessionDate", e.target.value)}
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Approximate number of affected families, if known</span>
                    <input
                      type="number"
                      value={form.approximateAffectedFamilies}
                      onChange={(e) => updateField("approximateAffectedFamilies", e.target.value)}
                      placeholder="Number of families"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Compensation / acquisition cost funding details *</span>
                    <input
                      type="text"
                      value={form.compensationFundingDetails}
                      onChange={(e) => updateField("compensationFundingDetails", e.target.value)}
                      placeholder="Provide funding source and financial guarantee details"
                      className="mt-3 w-full border border-slate-300 bg-slate-50/50 px-6 py-4.5 text-sm rounded-xl outline-none focus:border-[#1e3a8a] focus:bg-white font-medium"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-8">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <span>Proceed to Documents & Declaration</span>
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.section>
            )}

            {currentStep === 6 && (
              <motion.section
                key="step-six"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="border-b border-slate-200 p-8 sm:p-10 bg-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-[#1e3a8a]">
                      <Upload size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">Section 06 & 07</span>
                      <h2 className="mt-0.5 font-outfit text-2xl font-bold text-slate-900">Documents Upload & Declaration</h2>
                      <p className="mt-1 text-xs text-slate-600 font-medium">Upload DPR, land records, maps, and sign final certification.</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 sm:p-12 space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Required Documents (DPR, Sanction Letters, Revenue Maps, Record of Rights, Land-use, Site Map)
                    </span>
                    <label className="mt-3 flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center rounded-2xl transition-all hover:bg-slate-100/50 hover:border-slate-400">
                      <Upload size={28} strokeWidth={1.5} className="text-blue-600" />
                      <p className="mt-3 font-outfit text-base font-bold text-slate-800">Upload supporting documents</p>
                      <p className="mt-1 max-w-sm text-xs text-slate-500">PDF, maps or supporting records.</p>
                      <span className="mt-5 bg-white border border-slate-300 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 rounded-xl shadow-sm">
                        Choose files
                      </span>
                      <input type="file" multiple onChange={handleDocumentUpload} className="hidden" />
                    </label>
                  </div>

                  {documents.length > 0 && (
                    <div className="space-y-2">
                      {documents.map((document, index) => (
                        <div
                          key={`${document.name}-${index}`}
                          className="flex items-center justify-between gap-4 border border-slate-200 bg-slate-50 px-6 py-4 rounded-xl"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <FileText size={16} strokeWidth={1.5} className="shrink-0 text-blue-600" />
                            <p className="truncate text-xs font-semibold text-slate-700">{document.name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="shrink-0 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border border-slate-200 bg-slate-50 p-6 rounded-2xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.declarationSigned}
                        onChange={(e) => updateField("declarationSigned", e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-semibold leading-relaxed text-slate-800">
                        “I certify that the information provided is true and complete.” *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-8">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <span>Submit Proposal & Save to Database</span>
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.section>
            )}
          </form>
        </div>
      </main>
    </>
  )
}

export default ProjectProposal