import NavItem from "./NavItem.jsx";
import {
  HomeIcon,
  KanbanIcon,
  TimelineIcon,
  CollabIcon,
  LogoutIcon,
} from "./icons.jsx";
import Logo from "./Logo.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTheme } from "../theme/ThemeContext.jsx";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: <HomeIcon /> },
  { key: "kanban", label: "Kanban board", icon: <KanbanIcon /> },
  { key: "timeline", label: "Timeline", icon: <TimelineIcon /> },
  { key: "collab", label: "Collaborators", icon: <CollabIcon /> },
];

export default function Sidebar({ view, setView }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="sidebar">
      <Logo />
      <div className="nav">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={view === item.key}
            onClick={() => setView(item.key)}
          />
        ))}
      </div>
      <div className="user">
        {user?.picture ? (
          <img
            className="avatar"
            src={user.picture}
            alt={user.name}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="avatar" />
        )}
        <div className="user-info">
          <span className="user-name">{user?.name ?? "Guest"}</span>
          {user?.email && <span className="user-email">{user.email}</span>}
        </div>
        <button
          className="logout-btn"
          onClick={toggleTheme}
          aria-label={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
        >
          {theme === "light" ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
        <button className="logout-btn" onClick={logout} aria-label="Log out">
          <LogoutIcon />
        </button>
      </div>
    </div>
  );
}

export const MoonIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const SunIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
  </svg>
);
