import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import {
  getProjectBoard,
  getColumns,
  getTasks,
  updateTask,
  createColumn,
  renameColumn,
  reorderColumns,
  deleteColumn,
} from "../api/api.js";

export default function Kanban({ projectId }) {
  const { token } = useAuth();
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingCol, setAddingCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [editingColId, setEditingColId] = useState(null);
  const [editingColName, setEditingColName] = useState("");

  const load = useCallback(() => {
    if (!projectId || !token) return;
    setLoading(true);
    setError("");
    getProjectBoard(projectId, token)
      .then(({ board }) =>
        Promise.all([
          board,
          getColumns(board.id, token),
          getTasks(projectId, token),
        ]),
      )
      .then(([board, colsRes, tasksRes]) => {
        setBoard(board);
        setColumns(colsRes.columns);
        setTasks(tasksRes.tasks);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId, token]);

  useEffect(() => {
    load();
  }, [load]);

  if (!projectId) {
    return (
      <div>
        <div className="main-header">
          <h1>Kanban board</h1>
        </div>
        <p className="settings-message">
          Select a project from Home to see its board.
        </p>
      </div>
    );
  }
  if (loading)
    return (
      <div className="main-header">
        <h1>Kanban board</h1>
      </div>
    );

  const tasksForColumn = (colId) => tasks.filter((t) => t.column_id === colId);
  const unassigned = tasks.filter((t) => t.column_id == null);

  const moveTask = async (taskId, columnId) => {
    const prev = tasks;
    setTasks((ts) =>
      ts.map((t) => (t.id === taskId ? { ...t, column_id: columnId } : t)),
    );
    try {
      await updateTask(taskId, { column_id: columnId }, token);
    } catch (err) {
      setTasks(prev);
      setError(err.message);
    }
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData("text/task-id"));
    if (taskId) moveTask(taskId, colId);
  };

  const handleAddColumn = async () => {
    if (!newColName.trim()) return;
    try {
      const { column } = await createColumn(board.id, newColName.trim(), token);
      setColumns((cs) => [...cs, column]);
      setNewColName("");
      setAddingCol(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRenameColumn = async (colId) => {
    if (!editingColName.trim()) return setEditingColId(null);
    try {
      const { column } = await renameColumn(
        colId,
        editingColName.trim(),
        token,
      );
      setColumns((cs) => cs.map((c) => (c.id === colId ? column : c)));
    } catch (err) {
      setError(err.message);
    } finally {
      setEditingColId(null);
    }
  };

  const handleDeleteColumn = async (colId) => {
    try {
      await deleteColumn(colId, token);
      setColumns((cs) => cs.filter((c) => c.id !== colId));
    } catch (err) {
      setError(err.message);
    }
  };

  const moveColumn = async (index, direction) => {
    const next = [...columns];
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setColumns(next);
    try {
      await reorderColumns(
        board.id,
        next.map((c) => c.id),
        token,
      );
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  return (
    <div>
      <div className="main-header">
        <h1>{board?.name ?? "Kanban board"}</h1>
        <button className="btn-primary" onClick={() => setAddingCol(true)}>
          + New column
        </button>
      </div>
      {error && <p className="settings-error">{error}</p>}

      <div className="kanban">
        {columns.map((col, i) => (
          <div
            className="kcol"
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="kcol-header">
              {editingColId === col.id ? (
                <input
                  autoFocus
                  value={editingColName}
                  onChange={(e) => setEditingColName(e.target.value)}
                  onBlur={() => handleRenameColumn(col.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleRenameColumn(col.id)
                  }
                />
              ) : (
                <h4
                  onClick={() => {
                    setEditingColId(col.id);
                    setEditingColName(col.name);
                  }}
                >
                  {col.name}
                </h4>
              )}
              <div className="kcol-actions">
                <button disabled={i === 0} onClick={() => moveColumn(i, -1)}>
                  &larr;
                </button>
                <button
                  disabled={i === columns.length - 1}
                  onClick={() => moveColumn(i, 1)}
                >
                  &rarr;
                </button>
                <button onClick={() => handleDeleteColumn(col.id)}>
                  &times;
                </button>
              </div>
            </div>
            {tasksForColumn(col.id).map((task) => (
              <div
                className="ktask"
                key={task.id}
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("text/task-id", String(task.id))
                }
              >
                <span className={`priority-dot priority-${task.priority}`} />
                {task.title}
              </div>
            ))}
          </div>
        ))}

        {addingCol && (
          <div className="kcol kcol-new">
            <input
              autoFocus
              placeholder="Column name"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
            />
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setAddingCol(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddColumn}>
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {unassigned.length > 0 && (
        <div className="kanban-unassigned">
          <h4>No column</h4>
          {unassigned.map((task) => (
            <div
              className="ktask"
              key={task.id}
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData("text/task-id", String(task.id))
              }
            >
              {task.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
