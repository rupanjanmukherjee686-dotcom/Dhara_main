import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Landmark,
  RefreshCw,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { startSession } from "../auth"
import { API_BASE_URL } from "../api"

const portalRoles = [
  {
    id: "company",
    label: "Company",
    description: "Submit and track project proposals",
    type: "external",
    path: "/portal/company",
    icon: Building2,
  },
  {
    id: "district",
    label: "District Authority",
    description: "District-level scrutiny and field review",
    type: "government",
    path: "/portal/district",
    icon: Landmark,
  },
  {
    id: "field",
    label: "Field Officer",
    description: "Parcel and land verification",
    type: "government",
    path: "/portal/field",
    icon: ShieldCheck,
  },
  {
    id: "state",
    label: "State Authority",
    description: "State-level project scrutiny",
    type: "government",
    path: "/portal/state",
    icon: Landmark,
  },
  {
    id: "central",
    label: "Central Authority",
    description: "National-level project oversight",
    type: "government",
    path: "/portal/central",
    icon: ShieldCheck,
  },
  {
    id: "citizen",
    label: "Citizen",
    description: "View land, compensation and project status",
    type: "external",
    path: "/portal/citizen",
    icon: UserRound,
  },
]

const CAPTCHA_CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generateCaptcha() {
  let result = ""

  for (let i = 0; i < 5; i++) {
    result += CAPTCHA_CHARACTERS.charAt(
      Math.floor(Math.random() * CAPTCHA_CHARACTERS.length)
    )
  }

  return result
}

function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()

  const initialRole = location.state?.role || "company"

  const [selectedRole, setSelectedRole] = useState(
    portalRoles.some((role) => role.id === initialRole)
      ? initialRole
      : "company"
  )

  const [authorityModalOpen, setAuthorityModalOpen] = useState(false)

  // Sign-In / Sign-Up Toggle State
  const [isSignUpMode, setIsSignUpMode] = useState(false)

  // External account details
  const [name, setName] = useState("")
  const [identifier, setIdentifier] = useState("")

  // Password
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // CAPTCHA
  const [captcha, setCaptcha] = useState("")
  const [captchaValue, setCaptchaValue] = useState(
    generateCaptcha()
  )

  const [verified, setVerified] = useState(false)

  const selectedPortal = portalRoles.find(
    (role) => role.id === selectedRole
  )

  const isGovernment = selectedPortal?.type === "government"

  // ==========================================
  // CAPTCHA
  // ==========================================

  const regenerateCaptcha = () => {
    setCaptchaValue(generateCaptcha())
    setCaptcha("")
  }

  // ==========================================
  // ROLE CHANGE
  // ==========================================

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId)

    setName("")
    setIdentifier("")
    setPassword("")
    setCaptcha("")
    setCaptchaValue(generateCaptcha())
    setVerified(false)
    setShowPassword(false)
    setIsSignUpMode(false)
  }

  const handleAuthoritySelect = (roleId) => {
    handleRoleChange(roleId)
    setAuthorityModalOpen(false)
  }

  // ==========================================
  // FORM SUBMIT
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault()

    // ========================================
    // GOVERNMENT LOGIN
    // ========================================
    if (isGovernment) {
      if (!identifier || !password) return

      try {
        const response = await fetch(`${API_BASE_URL}/api/officer/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            officialId: identifier, 
            password,
            role: selectedRole 
          }),
        });
        
        const text = await response.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          console.error("Invalid JSON response:", text);
        }

        if (!response.ok || !data.success) {
          alert(data.message || "Government login failed!");
          return;
        }

        setVerified(true)
        startSession(selectedRole, identifier)
        setTimeout(() => {
          if (selectedPortal?.path) {
            navigate(selectedPortal.path)
          }
        }, 500)
      } catch (err) {
        console.error("Connection error:", err);
        alert("Server error. Make sure the backend server is running.");
      }
      return
    }

    // ========================================
    // COMPANY / CITIZEN EMAIL SIGNUP OR SIGNIN
    // ========================================
    if (isSignUpMode && !name) return;
    if (!identifier || !password) return

    // CAPTCHA validation check
    if (
      captcha.trim().toUpperCase() !==
      captchaValue.toUpperCase()
    ) {
      alert(
        "Incorrect CAPTCHA. A new CAPTCHA has been generated."
      )
      regenerateCaptcha()
      return
    }

    try {
      if (isSignUpMode) {
        // Step A: Register the user if it's Sign-Up mode
        const signupResponse = await fetch(`${API_BASE_URL}/api/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email: identifier, password }),
        });
        
        const signupText = await signupResponse.text();
        let signupData = {};
        try {
          signupData = signupText ? JSON.parse(signupText) : {};
        } catch (e) {
          console.error("Invalid JSON response:", signupText);
        }

        if (!signupResponse.ok) {
          alert(signupData.message || "Registration failed!");
          return;
        }

        alert("Registration Successful! Please sign in now.");
        setIsSignUpMode(false);
        regenerateCaptcha();
        return;
      }

      // Step B: Authenticate and sign in the user
      const loginResponse = await fetch(`${API_BASE_URL}/api/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }),
      });
      
      const loginText = await loginResponse.text();
      let loginData = {};
      try {
        loginData = loginText ? JSON.parse(loginText) : {};
      } catch (e) {
        console.error("Invalid JSON response for login:", loginText);
      }

      if (!loginResponse.ok || !loginData.success) {
        alert(loginData.message || "Invalid credentials!");
        return;
      }

      // Save user email to localStorage for dynamic project fetching
      localStorage.setItem('userEmail', identifier);
      startSession(selectedRole, identifier)

      setVerified(true)
      setTimeout(() => {
        if (selectedPortal?.path) {
          navigate(selectedPortal.path)
        }
      }, 500)
    } catch (err) {
      console.error("Connection error:", err);
      alert("Server error. Make sure the backend server is running.");
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-jakarta, body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-jakarta flex flex-col justify-between">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="border-b border-slate-200 bg-white px-6 py-4 md:px-12 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-5">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="flex h-9 w-9 items-center justify-center bg-[#1e3a8a] text-white rounded font-bold">
                <span className="font-outfit text-base">🇮🇳</span>
              </div>
              <div>
                <p className="font-outfit text-base font-bold tracking-wide text-[#1e3a8a]">DHARA</p>
                <p className="text-[9px] font-semibold tracking-wider text-slate-500">NATIONAL LAND INFORMATION SYSTEM</p>
              </div>
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:inline-block">
              Digital Land Administration
            </span>
          </div>
        </header>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <main className="mx-auto max-w-7xl w-full px-5 md:px-12 py-10 md:py-16">

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">

            {/* =================================================
                LEFT
            ================================================- */}

            <section>

              <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-[#1e3a8a] text-xs font-bold tracking-wider mb-4">
                SECURE PORTAL ACCESS
              </span>

              <h1 className="font-outfit text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                {isSignUpMode ? "Create an account." : "Sign in to DHARA."}
              </h1>

              <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-600 font-medium max-w-md">
                Access the portal corresponding to your role in the
                land and project administration workflow.
              </p>

              {/* SELECTED ROLE */}

              <div className="mt-8 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Selected Portal
                </p>

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1e3a8a] shrink-0">
                    {selectedPortal?.icon && (
                      <selectedPortal.icon
                        size={18}
                        strokeWidth={1.5}
                      />
                    )}
                  </div>

                  <div>
                    <h2 className="font-outfit text-base font-bold text-slate-900 capitalize">
                      {selectedPortal?.label}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {selectedPortal?.description}
                    </p>
                  </div>

                </div>

              </div>

              {/* AUTHORITY SWITCH */}

              <button
                onClick={() => setAuthorityModalOpen(true)}
                className="mt-4 w-full p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between transition-all shadow-sm"
              >
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Authority access</span>
                  <span className="text-slate-700 font-bold mt-0.5 block">Choose another authority portal</span>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </button>

            </section>

            {/* =================================================
                RIGHT — LOGIN / SIGNUP FORM
            ================================================- */}

            <section className="bg-white border border-slate-200 rounded-xl shadow-sm relative">

              <div className="border-b border-slate-200 px-6 md:px-8 py-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Authentication
                  </p>
                  <h2 className="font-outfit text-xl font-bold text-slate-900 mt-0.5">
                    {isGovernment
                      ? "Government credentials"
                      : isSignUpMode
                      ? "Register New Account"
                      : "Account credentials"}
                  </h2>
                </div>

                <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1e3a8a] shrink-0">
                  <ShieldCheck size={18} strokeWidth={1.5} />
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 md:p-8 space-y-5"
              >

                {/* =================================================
                    GOVERNMENT LOGIN
                ================================================- */}

                {isGovernment ? (
                  <>
                    {/* GOVERNMENT ID */}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Official Government ID
                      </label>

                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(event) =>
                          setIdentifier(event.target.value)
                        }
                        placeholder="Enter official government ID"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-all"
                      />
                    </div>

                    {/* GOVERNMENT PASSWORD */}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Official Government Password
                      </label>

                      <div className="relative">
                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          required
                          value={password}
                          onChange={(event) =>
                            setPassword(event.target.value)
                          }
                          placeholder="Enter official password"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-all pr-10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((value) => !value)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* GOVERNMENT SECURITY NOTE */}

                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#1e3a8a] mb-1">
                        Restricted access
                      </p>
                      <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                        Government portals require an authorized
                        official government ID and password. Access
                        is limited to the responsibilities assigned
                        to the selected role.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* =================================================
                        FULL NAME (Only shown in Sign Up mode)
                    ================================================- */}

                    {isSignUpMode && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Full Name
                        </label>

                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(event) =>
                            setName(event.target.value)
                          }
                          placeholder={
                            selectedRole === "company"
                              ? "Enter authorized representative name"
                              : "Enter your full name"
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-all"
                        />
                      </div>
                    )}

                    {/* =================================================
                        EMAIL
                    ================================================- */}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Gmail / Email Address
                      </label>

                      <input
                        type="email"
                        required
                        value={identifier}
                        onChange={(event) =>
                          setIdentifier(event.target.value)
                        }
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-all"
                      />
                    </div>

                    {/* =================================================
                        PASSWORD
                    ================================================- */}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Password
                      </label>

                      <div className="relative">
                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          required
                          value={password}
                          onChange={(event) =>
                            setPassword(event.target.value)
                          }
                          placeholder="Enter password"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-all pr-10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((value) => !value)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* =================================================
                        CAPTCHA
                    ================================================- */}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Security Check
                        </label>

                        <button
                          type="button"
                          onClick={regenerateCaptcha}
                          className="text-[11px] font-bold text-[#1e3a8a] flex items-center gap-1 hover:underline"
                        >
                          <RefreshCw size={12} />
                          Refresh
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* CAPTCHA DISPLAY */}

                        <div className="bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center tracking-widest font-outfit text-lg font-bold text-slate-700 select-none py-2.5 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:8px_8px] relative overflow-hidden">
                          <span className="absolute inset-0 pointer-events-none opacity-30 flex items-center justify-center">
                            <span className="w-full border-t border-slate-400 rotate-6 absolute" />
                            <span className="w-full border-t border-[#1e3a8a] -rotate-6 absolute" />
                          </span>
                          <span className="relative">{captchaValue}</span>
                        </div>

                        {/* CAPTCHA INPUT */}

                        <input
                          required
                          value={captcha}
                          onChange={(event) =>
                            setCaptcha(
                              event.target.value
                                .toUpperCase()
                                .replace(/[^A-Z0-9]/g, "")
                            )
                          }
                          maxLength={5}
                          placeholder="ENTER CODE"
                          className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold tracking-wider uppercase text-slate-900 focus:outline-none focus:border-[#1e3a8a] focus:bg-white text-center"
                        />
                      </div>

                      <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        Enter the characters shown above. Refresh
                        the CAPTCHA if it is difficult to read.
                      </p>
                    </div>
                  </>
                )}

                {/* =================================================
                    VERIFIED
                ================================================- */}

                {verified && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-emerald-600 shrink-0"
                    />
                    <p className="text-xs font-bold text-emerald-900">
                      Authentication successful. Redirecting...
                    </p>
                  </div>
                )}

                {/* =================================================
                    SUBMIT
                ================================================- */}

                {!verified && (
                  <button
                    type="submit"
                    className="w-full bg-[#0f172a] hover:bg-[#1e3a8a] text-white text-xs uppercase tracking-wider py-3.5 rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <span>
                      {isGovernment
                        ? "Enter Government Portal"
                        : isSignUpMode
                        ? "Create Account & Register"
                        : "Sign In"}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                )}

                {/* =================================================
                    SIGN-IN / SIGN-UP TOGGLE SWITCH
                ================================================- */}

                {!isGovernment && (
                  <div className="mt-4 text-center border-t border-slate-200 pt-4">
                    <p className="text-xs text-slate-600 font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUpMode(!isSignUpMode)
                          setName("")
                          setIdentifier("")
                          setPassword("")
                        }}
                        className="text-[#1e3a8a] font-bold hover:underline"
                      >
                        {isSignUpMode
                          ? "Already have an account? Sign In"
                          : "Don't have an account? Create one (Sign Up)"}
                      </button>
                    </p>
                  </div>
                )}

                {/* =================================================
                    SECURITY NOTE
                ================================================- */}

                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
                  {isGovernment
                    ? "Government access is restricted by administrative role. Each official can access only the functions assigned to their authority level."
                    : isSignUpMode
                    ? "Register your company or citizen credentials securely into the platform database."
                    : "Company and citizen accounts use verified email credentials and CAPTCHA authentication before access is granted."}
                </div>

              </form>

            </section>

          </div>

        </main>

        {/* =====================================================
            AUTHORITY MODAL
        ===================================================== */}

        <AnimatePresence>

          {authorityModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-5"
              onClick={() => setAuthorityModalOpen(false)}
            >

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.97,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.97,
                  y: 15,
                }}
                onClick={(event) =>
                  event.stopPropagation()
                }
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl"
              >

                {/* MODAL HEADER */}

                <div className="border-b border-slate-200 px-6 py-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Authority Portals
                    </p>
                    <h2 className="font-outfit text-xl font-bold text-slate-900">
                      Select government function
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      setAuthorityModalOpen(false)
                    }
                    className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition shrink-0"
                  >
                    <X size5={16} />
                  </button>
                </div>

                {/* MODAL DESCRIPTION */}

                <div className="px-6 pt-5">
                  <p className="text-xs leading-relaxed text-slate-600 font-medium">
                    Government access is separated by administrative
                    responsibility. Select the official function
                    assigned to your government credentials.
                  </p>
                </div>

                {/* OPTIONS */}

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {portalRoles
                      .filter(
                        (role) =>
                          role.type === "government"
                      )
                      .map((role) => {
                        const Icon = role.icon

                        return (
                          <button
                            key={role.id}
                            onClick={() =>
                              handleAuthoritySelect(
                                role.id
                              )
                            }
                            className={`text-left p-4 rounded-xl border transition-all ${
                              selectedRole === role.id
                                ? "border-[#1e3a8a] bg-blue-50/50 shadow-sm"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#1e3a8a] shrink-0">
                                <Icon size={16} strokeWidth={1.5} />
                              </div>

                              <div>
                                <p className="font-outfit text-sm font-bold text-slate-900">
                                  {role.label}
                                </p>
                                <p className="text-[11px] leading-normal text-slate-500 font-medium mt-0.5">
                                  {role.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                  </div>
                </div>

              </motion.div>

            </motion.div>
          )}

        </AnimatePresence>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-xs text-slate-500 font-medium">
          <span>© 2026 Government of India · National Land Information System</span>
        </footer>

      </div>
    </>
  )
}

export default SignIn
