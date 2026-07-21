import { useEffect, useState } from "react";
import Sidebar from "./Components/sidebar.jsx";
import NewBoardModal from "./Components/NewBoardModal.jsx";
import LandingPage from "./tabs/LandingPage.jsx";
import Home from "./tabs/Home.jsx";
import Kanban from "./tabs/Kanban.jsx";
import Timeline from "./tabs/Timeline.jsx";
import Collaborators from "./tabs/Collaborators.jsx";
import { useAuth } from "./auth/AuthContext.jsx";
import LoginPage from "./tabs/LoginPage.jsx";
import WorkSpace from "./tabs/WorkSpace.jsx";
import {
  getWorkspaces,
  getProjects,
  createProject,
  createWorkspace,
} from "./api/api.js";

const VIEWS = {
  home: Home,
  kanban: Kanban,
  timeline: Timeline,
  collab: Collaborators,
  workspace: WorkSpace,
};

export default function App() {
  const [view, setView] = useState("home");
  const [boards, setBoards] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { user, token } = useAuth();
  const [screen, setScreen] = useState("landing");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [boardsError, setBoardsError] = useState("");
  const [createError, setCreateError] = useState("");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  useEffect(() => {
    if (!user || !token) return;
    let cancelled = false;
    setLoadingBoards(true);
    setBoardsError("");

    getWorkspaces(token)
      .then(({ workspaces }) => {
        if (cancelled) return null;
        const first = workspaces[0];
        if (!first) {
          setBoards([]);
          return null;
        }
        setWorkspaceId(first.id);
        return getProjects(first.id, token);
      })
      .then((res) => {
        if (cancelled || !res) return;
        setBoards(
          res.projects.map((p) => ({
            id: p.id,
            name: p.name,
            status: p.status,
            tasks: Number(p.open_task_count) || 0,
            updated: new Date(p.updated_at).toLocaleDateString(),
            progress: 0,
            avatars: 1,
          })),
        );
      })
      .catch((err) => {
        if (!cancelled) setBoardsError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingBoards(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, token]);

  if (!user) {
    return screen === "login" ? (
      <LoginPage onBack={() => setScreen("landing")} />
    ) : (
      <LandingPage onGetStarted={() => setScreen("login")} />
    );
  }

  const handleCreateBoard = async (name) => {
    setCreateError("");
    if (!workspaceId) {
      setCreateError("No workspace found yet!");
      return;
    }
    try {
      const { project } = await createProject({ workspaceId, name }, token);
      setBoards((prev) => [
        ...prev,
        {
          id: project.id,
          name: project.name,
          status: project.status,
          tasks: 0,
          updated: "just now",
          progress: 0,
          avatars: 1,
        },
      ]);
      setModalOpen(false);
    } catch (err) {
      setCreateError(err.message);
    }
  };

  const handleSelectBoard = (board) => {
    setSelectedProjectId(board.id);
    setView("kanban");
  };

  const ActiveView = VIEWS[view];

  const handleCreateWorkspace = async () => {
    const name = newWorkspaceName.trim();
    if (!name) return;
    setWorkspaceError("");
    setCreatingWorkspace(true);
    try {
      const { workspace } = await createWorkspace(name, token);
      setWorkspaceId(workspace.id);
      setBoards([]);
    } catch (err) {
      setWorkspaceError(err.message);
    } finally {
      setCreatingWorkspace(false);
    }
  };

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} />
      <div className="main">
        {view === "home" ? (
          loadingBoards ? (
            <div className="main-header">
              <h1>Your projects</h1>
            </div>
          ) : !workspaceId ? (
            <div>
              <div className="main-header">
                <h1>Create your workspace</h1>
              </div>
              <p className="settings-message">
                You need a workspace before you can create boards.
              </p>
              <input
                type="text"
                placeholder="Workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
              />
              <button
                className="btn-primary"
                onClick={handleCreateWorkspace}
                disabled={creatingWorkspace}
              >
                {creatingWorkspace ? "Creating…" : "Create workspace"}
              </button>
              {workspaceError && (
                <p className="settings-error">{workspaceError}</p>
              )}
            </div>
          ) : (
            <>
              {boardsError && <p className="settings-error">{boardsError}</p>}
              <Home
                boards={boards}
                onSelectBoard={handleSelectBoard}
                onNewBoard={() => {
                  setCreateError("");
                  setModalOpen(true);
                }}
              />
            </>
          )
        ) : view === "kanban" ? (
          <Kanban projectId={selectedProjectId} />
        ) : (
          <ActiveView />
        )}
      </div>
      <NewBoardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateBoard}
        error={createError}
      />
    </div>
  );
}
