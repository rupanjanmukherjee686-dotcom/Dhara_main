import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Crosshair,
  Landmark,
  MapPin,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
  FileText,
  AlertCircle
} from "lucide-react";

export default function StateDashboard() {
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states for scrutiny
  const [stateScrutinyStatus, setStateScrutinyStatus] = useState('Pending');
  const [landBankStatus, setLandBankStatus] = useState('Unchecked');
  const [gisRequired, setGisRequired] = useState(false);
  const [actComplianceChecked, setActComplianceChecked] = useState(false);
  const [stateRemarks, setStateRemarks] = useState('');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/state/proposals');
      const data = await response.json();
      if (data.success) {
        setProposals(data.proposals);
      }
    } catch (err) {
      console.error("Error fetching proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProposal = (prop) => {
    setSelectedProposal(prop);
    setStateScrutinyStatus(prop.stateScrutinyStatus || 'Pending');
    setLandBankStatus(prop.landBankStatus || 'Unchecked');
    setGisRequired(prop.gisRequired || false);
    setActComplianceChecked(prop.actComplianceChecked || false);
    setStateRemarks(prop.stateRemarks || '');
  };

  const handleLandBankChange = (status) => {
    setLandBankStatus(status);
    if (status === 'Not Found') {
      setGisRequired(true);
    } else {
      setGisRequired(false);
    }
  };

  const handleScrutinySubmit = async (e) => {
    e.preventDefault();
    if (!selectedProposal) return;

    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/state/scrutiny/${selectedProposal.projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stateScrutinyStatus,
          landBankStatus,
          gisRequired,
          actComplianceChecked,
          stateRemarks,
          currentStage: stateScrutinyStatus === 'Verified' ? 'Forwarded to District & Central' : 'State Scrutiny In Progress'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert("Scrutiny updated and data forwarded successfully!");
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

          <div className="grid gap-8 lg:grid-cols-[1.1fr_2fr]">
            
            {/* Left Column: Proposal List Queue */}
            <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex flex-col h-[70vh]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <h2 className="font-outfit text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={16} className="text-[#1e3a8a]" /> Proposals Queue ({proposals.length})
                </h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-[#1e3a8a] border border-blue-200">
                  Live Feed
                </span>
              </div>

              <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                {proposals.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    No proposals found in the system database.
                  </div>
                ) : (
                  proposals.map((prop) => {
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
            <div className="bg-white border border-slate-300 rounded-xl p-6 md:p-8 shadow-sm">
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
                      onChange={(e) => setActComplianceChecked(e.target.checked)}
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
                    <select
                      value={stateScrutinyStatus}
                      onChange={(e) => setStateScrutinyStatus(e.target.value)}
                      className="w-full p-3 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:border-[#1e3a8a] focus:outline-none"
                    >
                      <option value="Pending">Pending Review</option>
                      <option value="Verified">Verified & Forward (to District & Central)</option>
                      <option value="Rejected">Rejected</option>
                    </select>
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
                    disabled={submitting}
                    className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs uppercase tracking-wider py-3.5 px-6 rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? 'Processing Scrutiny...' : 'Submit Scrutiny & Forward Data'} <ArrowUpRight size={14} />
                  </button>
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
        </div>

      </main>
    </>
  );
}