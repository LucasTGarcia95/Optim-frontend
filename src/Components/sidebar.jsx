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

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: <HomeIcon /> },
  { key: "kanban", label: "Kanban board", icon: <KanbanIcon /> },
  { key: "timeline", label: "Timeline", icon: <TimelineIcon /> },
  { key: "collab", label: "Collaborators", icon: <CollabIcon /> },
];

export default function Sidebar({ view, setView }) {
  const { user, logout } = useAuth();

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
        <button className="logout-btn" onClick={logout} aria-label="Log out">
          <LogoutIcon />
        </button>
      </div>
    </div>
  );
}
