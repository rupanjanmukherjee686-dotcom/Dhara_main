import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  MapPin,
  Activity,
  FileText,
} from "lucide-react";
import { API_BASE_URL } from "../api";
import { Circle, CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const REVIEW_CHECKS = [
  { key: "companyDetails", label: "Company identity and registration details verified" },
  { key: "projectDetails", label: "Project scope, cost, employment and timeline verified" },
  { key: "landDetails", label: "Land requirement, location and parcel details verified" },
  { key: "landCharacteristics", label: "Agricultural, irrigation and crop details verified" },
  { key: "acquisitionDetails", label: "Acquisition purpose, affected families and funding verified" },
  { key: "documents", label: "Submitted supporting documents checked" },
  { key: "actCompliance", label: "LARR Act 2013 and applicable state law compliance verified" },
]

function parseCoordinates(value) {
  const matches = String(value || "").match(/-?\d+(?:\.\d+)?/g)
  if (!matches || matches.length < 2) return null

  const latitude = Number(matches[0])
  const longitude = Number(matches[1])
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null
  return [latitude, longitude]
}

function getScreeningResult(proposal, checks) {
  const coordinates = parseCoordinates(proposal?.longitudeLatitude)
  const checksPassed = Object.values(checks).filter(Boolean).length
  const score = Math.round(
    (coordinates ? 25 : 0) +
    (proposal?.preferredState ? 15 : 0) +
    (proposal?.district ? 15 : 0) +
    (proposal?.totalLandRequired ? 15 : 0) +
    (proposal?.landUnit ? 5 : 0) +
    (proposal?.surveyPlotNumbers ? 10 : 0) +
    (proposal?.documents?.length ? 5 : 0) +
    (checksPassed / REVIEW_CHECKS.length) * 10
  )

  return {
    coordinates,
    score,
    label: score >= 80 ? "Suitable for state review" : score >= 55 ? "Needs field verification" : "Insufficient location data",
  }
}

export default function StateDashboard() {
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [returningToDistrict, setReturningToDistrict] = useState(false);

  // Form states for scrutiny
  const [stateScrutinyStatus, setStateScrutinyStatus] = useState('Verified');
  const [landBankStatus, setLandBankStatus] = useState('Unchecked');
  const [gisRequired, setGisRequired] = useState(false);
  const [actComplianceChecked, setActComplianceChecked] = useState(false);
  const [stateRemarks, setStateRemarks] = useState('');
  const [reviewChecks, setReviewChecks] = useState({});

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/state/proposals`);
      const data = await response.json();
      if (data.success) setProposals(data.proposals);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProposal = (prop) => {
    setSelectedProposal(prop);
    setStateScrutinyStatus('Verified');
    setLandBankStatus(prop.landBankStatus || 'Unchecked');
    setGisRequired(prop.gisRequired || false);
    setActComplianceChecked(prop.actComplianceChecked || false);
    setStateRemarks(prop.stateRemarks || '');
    setReviewChecks({
      ...Object.fromEntries(REVIEW_CHECKS.map(({ key }) => [key, false])),
      ...(prop.reviewChecks || {}),
      actCompliance: prop.actComplianceChecked || prop.reviewChecks?.actCompliance || false,
    });
  };

  const openRegisterRecord = (project) => {
    handleSelectProposal(project);
    window.requestAnimationFrame(() => {
      document.getElementById("state-review-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleLandBankChange = (status) => {
    setLandBankStatus(status);
    if (status === 'Not Found') {
      setGisRequired(true);
    } else {
      setGisRequired(false);
    }
  };

  const updateReviewCheck = (key, value) => {
    setReviewChecks((current) => ({ ...current, [key]: value }));
    if (key === 'actCompliance') setActComplianceChecked(value);
  };

  const handleScrutinySubmit = async (e) => {
    e.preventDefault();
    if (!selectedProposal) return;

    setSubmitting(true);

    const isFieldAndDistrictVerified = 
      selectedProposal.fieldVerification?.status === 'Verified' && 
      selectedProposal.fieldVerification?.verifiedAt && 
      selectedProposal.districtReview?.status === 'Verified' && 
      selectedProposal.districtReview?.verifiedAt;

    try {
      const response = await fetch(`${API_BASE_URL}/api/state/scrutiny/${selectedProposal.projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stateScrutinyStatus,
          landBankStatus,
          gisRequired,
          actComplianceChecked,
          reviewChecks,
          screeningScore: getScreeningResult(selectedProposal, reviewChecks).score,
          screeningLabel: getScreeningResult(selectedProposal, reviewChecks).label,
          stateRemarks,
          officerId: localStorage.getItem("dhara-officer-id") || "State Authority",
          currentStage: isFieldAndDistrictVerified 
            ? 'Forwarded to Rehabilitation Authority' 
            : 'Forwarded to District & Central',
          // 🟢 rehab-এ ডাটা ফরোয়ার্ড করার জন্য এই গুরুত্বপূর্ণ ফ্ল্যাগটি যুক্ত করা হলো
          forwardedToRehabilitation: isFieldAndDistrictVerified ? true : Boolean(selectedProposal.forwardedToRehabilitation)
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(
          isFieldAndDistrictVerified
            ? "Proposal verified and forwarded to Rehabilitation Authority successfully!"
            : "Scrutiny updated and data forwarded successfully!"
        );
        fetchProposals();
        setSelectedProposal(null);
      } else {
        alert("Failed to update: " + data.message);
      }
    } catch (err) {
      console.error("Error updating scrutiny:", err);
      alert("Server error occurred!");
    } finally {
      setSubmitting(false);
    }
  };

  const returnToDistrict = async () => {
    if (!selectedProposal) return;
    setReturningToDistrict(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/state/return-to-district/${selectedProposal.projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerId: localStorage.getItem("dhara-officer-id") || "State Authority",
          remarks: stateRemarks || "Additional District review required.",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not return project to District Authority");
      alert("Project returned to District Authority for review.");
      await fetchProposals();
      setSelectedProposal(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setReturningToDistrict(false);
    }
  };

  const screeningResult = selectedProposal
    ? getScreeningResult(selectedProposal, reviewChecks)
    : null;
  const allChecksPassed = REVIEW_CHECKS.every(({ key }) => reviewChecks[key]);
  const forwardedProjects = proposals.filter(
    (proposal) =>
      (proposal.forwardedToDistrict || proposal.forwardedToCentral) &&
      !proposal.forwardedToRehabilitation
  );
  const fieldDistrictVerifiedProjects = proposals.filter(
    (proposal) =>
      proposal.fieldVerification?.status === 'Verified' &&
      proposal.fieldVerification?.verifiedAt &&
      proposal.districtReview?.status === 'Verified' &&
      proposal.districtReview?.verifiedAt &&
      !(
        proposal.forwardedToRehabilitation === true ||
        (proposal.stateScrutinyStatus === 'Verified' && proposal.forwardedToDistrict)
      ) &&
      proposal.status !== 'Rejected'
  );
  const rehabilitationProjects = proposals.filter(
    (proposal) =>
      (proposal.forwardedToRehabilitation === true && proposal.rehabilitationReview?.approvedForState === true) ||
      (
        proposal.fieldVerification?.status === 'Verified' &&
        proposal.fieldVerification?.verifiedAt &&
        proposal.districtReview?.status === 'Verified' &&
        proposal.districtReview?.verifiedAt &&
        proposal.stateScrutinyStatus === 'Verified' &&
        proposal.forwardedToDistrict &&
        proposal.rehabilitationReview?.approvedForState === true
      )
  );
  const scrutinyQueue = proposals.filter(
    (proposal) =>
      !proposal.forwardedToDistrict &&
      !proposal.forwardedToCentral &&
      !fieldDistrictVerifiedProjects.some((item) => item.projectId === proposal.projectId)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-jakarta flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1e3a8a] border-r-transparent"></div>
          <p className="mt-4 text-sm font-semibold text-slate-600">Loading State Scrutiny Queue...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        body, .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <main className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-jakarta">
        
        {/* Top Bar */}
        <div className="bg-[#1e3a8a] text-white px-5 py-2 text-[11px] font-medium flex justify-between items-center border-b border-blue-900">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-3 bg-orange-500 rounded-sm"></span>
            <span>Ministry of Land and Infrastructure, Government of India — State Authority Oversight</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="cursor-pointer hover:underline">State Scrutiny Panel</span>
            <span>|</span>
            <span className="cursor-pointer hover:underline">DHARA System v2.6</span>
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
                <p className="text-[10px] font-semibold tracking-wide text-slate-500">STATE SCRUTINY & LAND BANK PORTAL</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">State Officer Portal</p>
              <p className="text-[10px] text-slate-500 font-medium">Logged in securely</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1e3a8a] font-bold text-xs">
              SO
            </div>
          </div>
        </nav>

        {/* Dashboard Main Container */}
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">02 / Administrative Review</p>
            <h1 className="mt-2 font-outfit text-3xl md:text-4xl font-bold text-slate-900">
              State Scrutiny & Land Allocation Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600 font-medium">
              Review submitted project proposals, verify land bank availability, trigger GIS mapping when required, and enforce statutory act compliances.
            </p>
          </div>

          {/* Field and District verified proposals */}
          <section className="mb-8 rounded-xl border border-amber-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Ready for state scrutiny</p>
                <h2 className="mt-1 font-outfit text-xl font-bold text-slate-900">Field & District Verified Proposals</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Field Officer evidence has been reviewed and forwarded by the District Authority.
                </p>
              </div>
              <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                {fieldDistrictVerifiedProjects.length} ready
              </span>
            </div>

            {fieldDistrictVerifiedProjects.length === 0 ? (
              <div className="py-8 text-center text-xs font-medium text-slate-400">
                No field and district verified proposals are waiting.
              </div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {fieldDistrictVerifiedProjects.map((proposal) => (
                  <button
                    type="button"
                    key={proposal.projectId}
                    onClick={() => handleSelectProposal(proposal)}
                    className={`rounded-lg border p-4 text-left transition-all ${selectedProposal?.projectId === proposal.projectId ? 'border-[#1e3a8a] bg-blue-50 shadow-sm' : 'border-amber-100 bg-amber-50/40 hover:border-amber-300 hover:bg-amber-50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-outfit text-base font-bold text-slate-900">{proposal.projectName || proposal.title || 'Untitled Project'}</h3>
                        <p className="mt-1 text-[11px] font-semibold text-slate-500">ID: {proposal.projectId}</p>
                      </div>
                      <span className="shrink-0 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Verified</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Field Officer</p><p className="mt-1 font-semibold text-slate-800">{proposal.fieldVerification?.officerId || 'N/A'}</p></div>
                      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Photos</p><p className="mt-1 font-semibold text-slate-800">{proposal.fieldVerification?.photos?.length || 0} submitted</p></div>
                    </div>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#1e3a8a]">Open verified record and review →</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_2fr]">
            
            {/* Left Column: Proposal List Queue */}
            <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex flex-col h-[70vh]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <h2 className="font-outfit text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={16} className="text-[#1e3a8a]" /> Proposals Queue ({scrutinyQueue.length})
                </h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-[#1e3a8a] border border-blue-200">
                  Live Feed
                </span>
              </div>

              <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                {scrutinyQueue.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    No proposals waiting for state scrutiny.
                  </div>
                ) : (
                  scrutinyQueue.map((prop) => {
                    const isSelected = selectedProposal?.projectId === prop.projectId;
                    return (
                      <div
                        key={prop.projectId}
                        onClick={() => handleSelectProposal(prop)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-[#1e3a8a] bg-blue-50/60 shadow-sm' 
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-outfit font-bold text-slate-900 text-sm">
                            {prop.projectName || prop.title || 'Untitled Project'}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            prop.stateScrutinyStatus === 'Verified' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : prop.stateScrutinyStatus === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {prop.stateScrutinyStatus || 'Pending'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">ID: {prop.projectId}</p>
                        <p className="text-xs text-slate-600 mt-2 font-semibold">Company: {prop.companyName || prop.email || 'N/A'}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Scrutiny Detail & Action Panel */}
            <div id="state-review-panel" className="bg-white border border-slate-300 rounded-xl p-6 md:p-8 shadow-sm">
              {selectedProposal ? (
                <form onSubmit={handleScrutinySubmit} className="space-y-6">
                  <div className="border-b border-slate-200 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Active Scrutiny Session
                    </span>
                    <h2 className="mt-2 font-outfit text-2xl font-bold text-slate-900">
                      {selectedProposal.projectName || selectedProposal.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Proposal Reference ID: {selectedProposal.projectId}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div><span className="font-semibold text-slate-500">Company Name:</span> <p className="font-bold text-slate-800 mt-0.5">{selectedProposal.companyName || 'N/A'}</p></div>
                    <div><span className="font-semibold text-slate-500">Contact Email:</span> <p className="font-bold text-slate-800 mt-0.5">{selectedProposal.email || selectedProposal.userEmail || 'N/A'}</p></div>
                    <div><span className="font-semibold text-slate-500">Land Required:</span> <p className="font-bold text-slate-800 mt-0.5">{selectedProposal.totalLandRequired || '0'} {selectedProposal.landUnit || 'Acres'}</p></div>
                    <div><span className="font-semibold text-slate-500">District:</span> <p className="font-bold text-slate-800 mt-0.5">{selectedProposal.district || 'N/A'}</p></div>
                  </div>

                  <details open className="rounded-lg border border-slate-200 bg-white">
                    <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">
                      Open full company, project, land and document data
                    </summary>
                    <div className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-2">
                      {Object.entries(selectedProposal)
                        .filter(([key, value]) => !['_id', '__v', 'reviewChecks', 'stateRemarks', 'documents'].includes(key) && value !== '' && value !== null && value !== undefined)
                        .map(([key, value]) => (
                          <div key={key} className="rounded border border-slate-100 bg-slate-50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{key.replaceAll(/([A-Z])/g, ' $1')}</p>
                            <p className="mt-1 break-words text-xs font-semibold text-slate-800">{String(value)}</p>
                          </div>
                        ))}
                      <div className="rounded border border-slate-100 bg-slate-50 p-3 sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Submitted documents</p>
                        <p className="mt-1 text-xs font-semibold text-slate-800">
                          {selectedProposal.documents?.length
                            ? selectedProposal.documents.map((document) => document.name).join(', ')
                            : 'No documents listed'}
                        </p>
                      </div>
                    </div>
                  </details>

                  {selectedProposal.fieldVerification?.verifiedAt && (
                    <div className="grid gap-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4 md:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Field Officer verified data</p>
                        <div className="mt-3 space-y-2 text-xs text-slate-700">
                          <p><strong>Officer:</strong> {selectedProposal.fieldVerification.officerId || 'Not recorded'}</p>
                          <p><strong>Status:</strong> {selectedProposal.fieldVerification.status || 'Verified'}</p>
                          <p><strong>Verified at:</strong> {new Date(selectedProposal.fieldVerification.verifiedAt).toLocaleString()}</p>
                          <p><strong>Coordinates:</strong> {selectedProposal.fieldVerification.coordinates ? JSON.stringify(selectedProposal.fieldVerification.coordinates) : 'Not recorded'}</p>
                          <p><strong>Photos:</strong> {selectedProposal.fieldVerification.photos?.length || 0} submitted</p>
                          <p><strong>Remarks:</strong> {selectedProposal.fieldVerification.remarks || 'No remarks recorded'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1e3a8a]">District Officer review</p>
                        <div className="mt-3 space-y-2 text-xs text-slate-700">
                          <p><strong>Officer:</strong> {selectedProposal.districtReview?.officerId || 'Not recorded'}</p>
                          <p><strong>Status:</strong> {selectedProposal.districtReview?.status || 'Not recorded'}</p>
                          <p><strong>Reviewed at:</strong> {selectedProposal.districtReview?.verifiedAt ? new Date(selectedProposal.districtReview.verifiedAt).toLocaleString() : 'Not recorded'}</p>
                          <p><strong>Remarks:</strong> {selectedProposal.districtReview?.remarks || 'No remarks recorded'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 md:grid-cols-[1fr_1.4fr]">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">GIS suitability screening</p>
                      <p className="mt-2 font-outfit text-3xl font-bold text-slate-900">{screeningResult?.score || 0}<span className="text-sm text-slate-500"> / 100</span></p>
                      <p className="mt-1 text-xs font-semibold text-emerald-800">{screeningResult?.label}</p>
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-600">Screening uses the submitted location and completeness signals. Final land suitability still requires official GIS layers and field verification.</p>
                    </div>
                    {screeningResult?.coordinates ? (
                      <div className="h-52 overflow-hidden rounded-lg border border-emerald-200">
                        <MapContainer center={screeningResult.coordinates} zoom={12} scrollWheelZoom={false} className="h-full w-full">
                          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Circle center={screeningResult.coordinates} radius={1000} pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.2 }} />
                          <CircleMarker center={screeningResult.coordinates} radius={8} pathOptions={{ color: '#065f46', fillColor: '#10b981', fillOpacity: 1 }} />
                        </MapContainer>
                      </div>
                    ) : (
                      <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-emerald-300 text-center text-xs font-semibold text-emerald-800">No valid latitude/longitude submitted</div>
                    )}
                  </div>

                  <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">State verification checklist</label>
                      <span className="text-[11px] font-bold text-slate-600">{Object.values(reviewChecks).filter(Boolean).length}/{REVIEW_CHECKS.length} verified</span>
                    </div>
                    {REVIEW_CHECKS.map(({ key, label }) => (
                      <label key={key} className="flex cursor-pointer items-start gap-3 rounded border border-blue-100 bg-white p-3 text-xs font-semibold text-slate-800">
                        <input type="checkbox" checked={Boolean(reviewChecks[key])} onChange={(e) => updateReviewCheck(key, e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1e3a8a] focus:ring-blue-500" />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>

                  {/* 1. Land Bank Verification */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      1. Land Bank Availability Check
                    </label>
                    <select
                      value={landBankStatus}
                      onChange={(e) => handleLandBankChange(e.target.value)}
                      className="w-full p-3 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:border-[#1e3a8a] focus:outline-none"
                    >
                      <option value="Unchecked">Select Land Bank Status</option>
                      <option value="Available">Available in Land Bank</option>
                      <option value="Not Found">Not Found in Land Bank</option>
                    </select>
                  </div>

                  {/* 2. Dynamic GIS Section (Triggered if Land Bank Not Found) */}
                  {gisRequired && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-orange-50/70 border border-orange-200 rounded-xl space-y-3"
                    >
                      <div className="flex items-center gap-2 text-orange-800 font-bold text-xs uppercase tracking-wider">
                        <MapPin size={16} /> GIS Section (Alternative Land Acquisition)
                      </div>
                      <p className="text-xs text-orange-700 font-medium">
                        Since land is unavailable in the Land Bank, specify geographical coordinates or mark boundaries for alternative acquisition protocols.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Latitude (e.g. 22.5726° N)"
                          className="p-2.5 text-xs rounded-lg border border-orange-300 bg-white font-medium focus:outline-none focus:border-orange-500"
                        />
                        <input
                          type="text"
                          placeholder="Longitude (e.g. 88.3639° E)"
                          className="p-2.5 text-xs rounded-lg border border-orange-300 bg-white font-medium focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* 3. Statutory Act Compliance */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      id="actCompliance"
                      checked={actComplianceChecked}
                      onChange={(e) => updateReviewCheck('actCompliance', e.target.checked)}
                      className="w-4 h-4 text-[#1e3a8a] border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="actCompliance" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Verify compliance with LARR Act 2013 & West Bengal Land Reforms Act
                    </label>
                  </div>

                  {/* 4. Scrutiny Status Decision */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Scrutiny Status Decision
                    </label>
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Verified</span>
                      <span className="ml-auto text-[10px] font-semibold text-emerald-700">Only verified status is allowed</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      State Officer Remarks
                    </label>
                    <textarea
                      rows="3"
                      value={stateRemarks}
                      onChange={(e) => setStateRemarks(e.target.value)}
                      placeholder="Enter administrative remarks regarding land availability, compliance, and recommendations..."
                      className="w-full p-3 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:border-[#1e3a8a] focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || (stateScrutinyStatus === 'Verified' && (!allChecksPassed || landBankStatus === 'Unchecked'))}
                    className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs uppercase tracking-wider py-3.5 px-6 rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting
                      ? 'Processing Scrutiny...'
                      : selectedProposal.fieldVerification?.verifiedAt && selectedProposal.districtReview?.verifiedAt
                        ? 'Review & Forward to Rehabilitation Authority'
                        : 'Submit State Scrutiny'} <ArrowUpRight size={14} />
                  </button>
                  {selectedProposal.forwardedToDistrict && !selectedProposal.forwardedToRehabilitation && (
                    <button
                      type="button"
                      onClick={returnToDistrict}
                      disabled={returningToDistrict}
                      className="w-full rounded-lg border border-amber-300 bg-amber-50 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                    >
                      {returningToDistrict ? 'Returning to District...' : 'Return to District for Review'}
                    </button>
                  )}
                  {stateScrutinyStatus === 'Verified' && (!allChecksPassed || landBankStatus === 'Unchecked') && (
                    <p className="text-center text-[11px] font-semibold text-amber-700">Complete every checklist item and select a land bank status before forwarding.</p>
                  )}
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center text-slate-400">
                  <Activity size={36} className="text-slate-300 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600">No Proposal Selected</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
                    Select a proposal from the left queue to perform state-level verification and land bank checks.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Forwarded projects register */}
          <section className="mt-8 rounded-xl border border-amber-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">R&R coordination register</p>
                <h2 className="mt-1 font-outfit text-xl font-bold text-slate-900">Rehabilitation Authority Information</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">State-reviewed projects sent to R&R and the consent information returned by the Rehabilitation Authority.</p>
              </div>
              <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{rehabilitationProjects.length} records</span>
            </div>
            {rehabilitationProjects.length === 0 ? (
              <div className="py-8 text-center text-xs font-medium text-slate-400">No project has been sent to Rehabilitation Authority yet.</div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {rehabilitationProjects.map((project) => (
                  <button
                    type="button"
                    key={project.projectId}
                    onClick={() => openRegisterRecord(project)}
                    className="rounded-lg border border-amber-100 bg-amber-50/40 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-outfit text-base font-bold text-slate-900">{project.projectName || project.title || 'Untitled Project'}</h3>
                        <p className="mt-1 text-[11px] font-semibold text-slate-500">ID: {project.projectId}</p>
                      </div>
                      <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">R&R Approved</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Consent</p><p className="mt-1 font-semibold text-slate-800">{project.rehabilitationReview?.consentPercentage || 0}%</p></div>
                      <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">DHARA ID</p><p className="mt-1 font-semibold text-slate-800">{project.rehabilitationDharaId || 'Not issued'}</p></div>
                    </div>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Approved by: {project.rehabilitationReview?.approvedBy || 'Rehabilitation Authority'}</p>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-amber-700">{project.rehabilitationReview?.officerId || 'Awaiting R&R review'}</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-xl border border-emerald-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">State decision register</p>
                <h2 className="mt-1 font-outfit text-xl font-bold text-slate-900">Sent to District & Central Authority</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Projects that completed state scrutiny and were sent onward for district and central review.
                </p>
              </div>
              <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                {forwardedProjects.length} forwarded
              </span>
            </div>

            {forwardedProjects.length === 0 ? (
              <div className="py-10 text-center text-xs font-medium text-slate-400">
                No projects have been forwarded yet.
              </div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {forwardedProjects.map((project) => (
                  <div
                    key={project.projectId}
                    onClick={() => openRegisterRecord(project)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      selectedProposal?.projectId === project.projectId
                        ? "border-[#1e3a8a] bg-blue-50 shadow-sm"
                        : "border-emerald-100 bg-emerald-50/40 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-outfit text-base font-bold text-slate-900">
                          {project.projectName || project.title || "Untitled Project"}
                        </h3>
                        <p className="mt-1 text-[11px] font-semibold text-slate-500">ID: {project.projectId}</p>
                      </div>
                      <span className="shrink-0 rounded border border-emerald-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Verified
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Company</p>
                        <p className="mt-1 font-semibold text-slate-800">{project.companyName || project.email || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">District</p>
                        <p className="mt-1 font-semibold text-slate-800">{project.district || "N/A"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                      <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-blue-800">District sent</span>
                      <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-indigo-800">Central sent</span>
                    </div>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#1e3a8a]">View full project details →</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

      </main>
    </>
  );
}