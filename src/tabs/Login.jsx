import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="login-screen">
      <h1>Optim</h1>
      <p>Sign in to continue</p>
      <GoogleLogin
        onSuccess={login}
        onError={() => console.error("Login failed")}
      />
    </div>
  );
}
