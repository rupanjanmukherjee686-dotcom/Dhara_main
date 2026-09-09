import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { clearSession, hasSession } from "./auth"

import Landing from "./pages/Landing"
import SignIn from "./pages/SignIn"

// ================= COMPANY =================
import CompanyDashboard from "./pages/CompanyDashboard"
import ProjectProposal from "./pages/ProjectProposal"
import ProjectTracking from "./pages/ProjectTracking"
import CompanyRevision from "./pages/CompanyRevision"

// ================= DISTRICT AUTHORITY =================
import DistrictDashboard from "./pages/DistrictDashboard"
import ProposalReview from "./pages/ProposalReview"
import DistrictFieldReview from "./pages/DistrictFieldReview"

// ================= FIELD OFFICER =================
import FieldOfficerDashboard from "./pages/FieldOfficerDashboard"
import FieldVerification from "./pages/FieldVerification"

// ================= STATE AUTHORITY =================
import StateDashboard from "./pages/StateDashboard"
import StateProjectReview from "./pages/StateProjectReview"

// ================= CENTRAL AUTHORITY =================
import CentralDashboard from "./pages/CentralDashboard"
import CentralProjectReview from "./pages/CentralProjectReview"

// ================= CITIZEN =================
import CitizenDashboard from "./pages/CitizenDashboard"

function ProtectedPortal({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  if (!hasSession()) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }

  const handleSignOut = () => {
    clearSession()
    navigate("/signin", { replace: true })
  }

  return (
    <>
      {children}
      <button
        type="button"
        onClick={handleSignOut}
        className="fixed bottom-5 right-5 z-[1000] flex items-center gap-2 rounded-lg bg-rose-700 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-rose-800"
        title="Sign out of this portal"
      >
        <LogOut size={15} />
        Sign Out
      </button>
    </>
  )
}

function ProtectedRoute({ children }) {
  return <ProtectedPortal>{children}</ProtectedPortal>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= LANDING ================= */}

        <Route
          path="/"
          element={<Landing />}
        />

        {/* ================= SIGN IN ================= */}

        <Route
          path="/signin"
          element={<SignIn />}
        />

        {/* =====================================================
            COMPANY PORTAL
        ===================================================== */}

        <Route
          path="/portal/company"
          element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>}
        />

        <Route
          path="/portal/company/propose"
          element={<ProtectedRoute><ProjectProposal /></ProtectedRoute>}
        />

        <Route
          path="/portal/company/project/:projectId"
          element={<ProtectedRoute><ProjectTracking /></ProtectedRoute>}
        />

        <Route
          path="/portal/company/project/:projectId/revise"
          element={<ProtectedRoute><CompanyRevision /></ProtectedRoute>}
        />

        {/* =====================================================
            DISTRICT AUTHORITY
        ===================================================== */}

        <Route
          path="/portal/district"
          element={<ProtectedRoute><DistrictDashboard /></ProtectedRoute>}
        />

        <Route
          path="/portal/district/proposal/:projectId"
          element={<ProtectedRoute><ProposalReview /></ProtectedRoute>}
        />

        <Route
          path="/portal/district/field-review/:projectId"
          element={<ProtectedRoute><DistrictFieldReview /></ProtectedRoute>}
        />

        {/* =====================================================
            FIELD OFFICER
        ===================================================== */}

        <Route
          path="/portal/field"
          element={<ProtectedRoute><FieldOfficerDashboard /></ProtectedRoute>}
        />

        <Route
          path="/portal/field/project/:projectId"
          element={<ProtectedRoute><FieldVerification /></ProtectedRoute>}
        />

        {/* =====================================================
            STATE AUTHORITY
        ===================================================== */}

        <Route
          path="/portal/state"
          element={<ProtectedRoute><StateDashboard /></ProtectedRoute>}
        />

        <Route
          path="/portal/state/project/:projectId"
          element={<ProtectedRoute><StateProjectReview /></ProtectedRoute>}
        />

        {/* =====================================================
            CENTRAL AUTHORITY
        ===================================================== */}

        <Route
          path="/portal/central"
          element={<ProtectedRoute><CentralDashboard /></ProtectedRoute>}
        />

        <Route
          path="/portal/central/project/:projectId"
          element={<ProtectedRoute><CentralProjectReview /></ProtectedRoute>}
        />

        {/* =====================================================
            CITIZEN PORTAL
        ===================================================== */}

        <Route
          path="/portal/citizen"
          element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App