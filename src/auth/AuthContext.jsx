import { createContext, useContext, useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("optim_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("optim_user", JSON.stringify(user));
    else localStorage.removeItem("optim_user");
  }, [user]);

  const login = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );
        const profile = await res.json();
        setUser({
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
        });
      } catch (err) {
        console.error("Failed to load Google profile", err);
      }
    },
    onError: (err) => console.error("Google login failed", err),
  });

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
