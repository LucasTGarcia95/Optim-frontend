import { useState } from "react";
import Sidebar from "./Components/sidebar.jsx";
import NewBoardModal from "./Components/NewBoardModal.jsx";
import LandingPage from "./tabs/LandingPage.jsx";
import Home from "./tabs/home.jsx";
import Kanban from "./tabs/Kanban.jsx";
import Timeline from "./tabs/Timeline.jsx";
import Collaborators from "./tabs/Collaborators.jsx";
import { useAuth } from "./auth/AuthContext.jsx";
import LoginPage from "./tabs/LoginPage.jsx";

const INITIAL_BOARDS = [
  {
    id: 1,
    name: "Site redesign",
    status: "on-track",
    tasks: 12,
    updated: "2h ago",
    progress: 70,
    avatars: 3,
  },
  {
    id: 2,
    name: "Mobile app v2",
    status: "at-risk",
    tasks: 27,
    updated: "1d ago",
    progress: 35,
    avatars: 2,
  },
  {
    id: 3,
    name: "Q3 marketing",
    status: "on-track",
    tasks: 8,
    updated: "just now",
    progress: 85,
    avatars: 3,
  },
];

const VIEWS = {
  home: Home,
  kanban: Kanban,
  timeline: Timeline,
  collab: Collaborators,
};

export default function App() {
  const [view, setView] = useState("home");
  const [boards, setBoards] = useState(INITIAL_BOARDS);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const [screen, setScreen] = useState("landing");

  if (!user) {
    return screen === "login" ? (
      <LoginPage onBack={() => setScreen("landing")} />
    ) : (
      <LandingPage onGetStarted={() => setScreen("login")} />
    );
  }

  const handleCreateBoard = (name) => {
    setBoards((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        status: "on-track",
        tasks: 0,
        updated: "just now",
        progress: 0,
        avatars: 1,
      },
    ]);
    setModalOpen(false);
  };

  const handleSelectBoard = () => setView("kanban");

  const ActiveView = VIEWS[view];

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} />
      <div className="main">
        {view === "home" ? (
          <Home
            boards={boards}
            onSelectBoard={handleSelectBoard}
            onNewBoard={() => setModalOpen(true)}
          />
        ) : (
          <ActiveView />
        )}
      </div>
      <NewBoardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
}
