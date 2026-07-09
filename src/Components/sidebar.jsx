import NavItem from "./NavItem.jsx";
import { HomeIcon, KanbanIcon, TimelineIcon, CollabIcon } from "./Icons.jsx";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: <HomeIcon /> },
  { key: "kanban", label: "Kanban board", icon: <KanbanIcon /> },
  { key: "timeline", label: "Timeline", icon: <TimelineIcon /> },
  { key: "collab", label: "Collaborators", icon: <CollabIcon /> },
];

export default function Sidebar({ view, setView, userName }) {
  return (
    <div className="sidebar">
      <div className="logo">Optim</div>
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
        <div className="avatar" />
        {userName}
      </div>
    </div>
  );
}
