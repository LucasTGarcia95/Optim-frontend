import { createContext, useContext, useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";

const AuthContext = createContext(null);

// NOTE: no /api prefix — matches the real backend's app.js.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("optim_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("optim_user", JSON.stringify(user));
    else localStorage.removeItem("optim_user");
  }, [user]);

  // Sends the Google access token to OUR backend, which verifies it with
  // Google server-side and issues our own JWT back. The frontend no longer
  // trusts a client-side round-trip to Google directly, and no longer talks
  // to Google's userinfo endpoint itself.
  const login = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(`${API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Google sign-in failed");
        }
        const data = await res.json();
        localStorage.setItem("optim_token", data.token);
        setUser(data.user);
      } catch (err) {
        console.error("Google sign-in failed", err);
      }
    },
    onError: (err) => console.error("Google login failed", err),
  });

  // Local username/password login, added alongside Google.
  async function loginWithPassword(username, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    localStorage.setItem("optim_token", data.token);
    setUser(data.user);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("optim_token");
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
