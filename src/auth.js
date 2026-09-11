export const SESSION_KEY = "dhara-session"

export function startSession(role, email = "") {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ role, email }))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem("userEmail")
}

export function hasSession() {
  return Boolean(localStorage.getItem(SESSION_KEY))
}