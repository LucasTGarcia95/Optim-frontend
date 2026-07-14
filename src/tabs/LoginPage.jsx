import { GoogleIcon } from "../Components/icons.jsx";
import Logo from "../Components/Logo.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

export default function LoginPage({ onBack }) {
  const { login } = useAuth();

  return (
    <div className="login-page">
      <div className="login-page-logo">
        <Logo />
      </div>

      <div className="login-card">
        <h1>Welcome to Optim</h1>
        <p>To get started, please sign in</p>

        <button className="google-btn" onClick={login}>
          <GoogleIcon />
          Continue with Google
        </button>

        <button className="login-back" onClick={onBack}>
          Back to home
        </button>
      </div>

      <div className="login-page-footer">
        <span>Support</span>
        <span>Terms</span>
        <span>Privacy</span>
      </div>
    </div>
  );
}
