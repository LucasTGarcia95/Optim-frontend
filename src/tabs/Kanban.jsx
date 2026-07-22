import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import TaskDetailsModal from "../Components/TaskDetailModal.jsx";
import {
  getProjectBoard,
  getColumns,
  getTasks,
  createTask,
  moveTask,
  createColumn,
  renameColumn,
  reorderColumns,
  deleteColumn,
} from "../api/api.js";

const PRIORITIES = ["low", "medium", "high", "urgent"];

export default function Kanban({ projectId }) {
  const { token } = useAuth();

  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addingCol, setAddingCol] = useState(false);
  const [newColName, setNewColName] = useState("");

  const [editingColId, setEditingColId] = useState(null);
  const [editingColName, setEditingColName] = useState("");

  const [addingTaskCol, setAddingTaskCol] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");

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
      .then(([loadedBoard, columnsResponse, tasksResponse]) => {
        setBoard(loadedBoard);
        setColumns(columnsResponse.columns);
        setTasks(tasksResponse.tasks);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId, token]);

  useEffect(() => {
    load();
  }, [load]);

  const tasksForColumn = (columnId) =>
    tasks.filter((task) => task.column_id === columnId);

  const unassigned = tasks.filter((task) => task.column_id == null);

  const moveTaskOnBoard = async (taskId, columnId) => {
    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              column_id: columnId,
            }
          : task,
      ),
    );

    try {
      const { task: updatedTask } = await moveTask(taskId, columnId, token);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      );

      setSelectedTask((currentTask) =>
        currentTask?.id === updatedTask.id ? updatedTask : currentTask,
      );
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message);
    }
  };

  const handleDrop = (event, columnId) => {
    event.preventDefault();

    const taskId = Number(
      event.dataTransfer.getData("text/task-id"),
    );

    if (taskId) {
      moveTaskOnBoard(taskId, columnId);
    }
  };

  const handleAddColumn = async () => {
    if (!newColName.trim()) return;

    try {
      const { column } = await createColumn(
        board.id,
        newColName.trim(),
        token,
      );

      setColumns((currentColumns) => [
        ...currentColumns,
        column,
      ]);

      setNewColName("");
      setAddingCol(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRenameColumn = async (columnId) => {
    if (!editingColName.trim()) {
      setEditingColId(null);
      return;
    }

    try {
      const { column } = await renameColumn(
        columnId,
        editingColName.trim(),
        token,
      );

      setColumns((currentColumns) =>
        currentColumns.map((currentColumn) =>
          currentColumn.id === columnId
            ? column
            : currentColumn,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setEditingColId(null);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      await deleteColumn(columnId, token);

      setColumns((currentColumns) =>
        currentColumns.filter(
          (column) => column.id !== columnId,
        ),
      );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.column_id === columnId
            ? {
                ...task,
                column_id: null,
              }
            : task,
        ),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const moveColumn = async (index, direction) => {
    const nextColumns = [...columns];
    const swapIndex = index + direction;

    if (
      swapIndex < 0 ||
      swapIndex >= nextColumns.length
    ) {
      return;
    }

    [nextColumns[index], nextColumns[swapIndex]] = [
      nextColumns[swapIndex],
      nextColumns[index],
    ];

    setColumns(nextColumns);

    try {
      await reorderColumns(
        board.id,
        nextColumns.map((column) => column.id),
        token,
      );
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  const handleAddTask = async (columnId) => {
    if (!newTaskTitle.trim()) return;

    try {
      const { task } = await createTask(
        projectId,
        {
          columnId,
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
        },
        token,
      );

      setTasks((currentTasks) => [
        ...currentTasks,
        task,
      ]);

      setNewTaskTitle("");
      setNewTaskPriority("medium");
      setAddingTaskCol(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id
          ? updatedTask
          : task,
      ),
    );

    setSelectedTask(updatedTask);
  };

  const handleTaskDragStart = (event, taskId) => {
    event.dataTransfer.setData(
      "text/task-id",
      String(taskId),
    );
  };

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

  if (loading) {
    return (
      <div className="main-header">
        <h1>Kanban board</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="main-header">
        <h1>{board?.name ?? "Kanban board"}</h1>

        <button
          className="btn-primary"
          onClick={() => setAddingCol(true)}
        >
          + New column
        </button>
      </div>

      {error && (
        <p className="settings-error">{error}</p>
      )}

      <div className="kanban">
        {columns.map((column, index) => (
          <div
            className="kcol"
            key={column.id}
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={(event) =>
              handleDrop(event, column.id)
            }
          >
            <div className="kcol-header">
              {editingColId === column.id ? (
                <input
                  autoFocus
                  value={editingColName}
                  onChange={(event) =>
                    setEditingColName(
                      event.target.value,
                    )
                  }
                  onBlur={() =>
                    handleRenameColumn(column.id)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleRenameColumn(column.id);
                    }
                  }}
                />
              ) : (
                <h4
                  onClick={() => {
                    setEditingColId(column.id);
                    setEditingColName(column.name);
                  }}
                >
                  {column.name}
                </h4>
              )}

              <div className="kcol-actions">
                <button
                  disabled={index === 0}
                  onClick={() =>
                    moveColumn(index, -1)
                  }
                >
                  &larr;
                </button>

                <button
                  disabled={
                    index === columns.length - 1
                  }
                  onClick={() =>
                    moveColumn(index, 1)
                  }
                >
                  &rarr;
                </button>

                <button
                  onClick={() =>
                    handleDeleteColumn(column.id)
                  }
                >
                  &times;
                </button>
              </div>
            </div>

            {tasksForColumn(column.id).map(
              (task) => (
                <div
                  className="ktask"
                  key={task.id}
                  draggable
                  onDragStart={(event) =>
                    handleTaskDragStart(
                      event,
                      task.id,
                    )
                  }
                  onClick={() =>
                    setSelectedTask(task)
                  }
                >
                  <span
                    className={`priority-dot priority-${task.priority}`}
                  />

                  <span>{task.title}</span>
                </div>
              ),
            )}

            {addingTaskCol === column.id ? (
              <div className="ktask-new">
                <input
                  autoFocus
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={(event) =>
                    setNewTaskTitle(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleAddTask(column.id);
                    }
                  }}
                />

                <select
                  value={newTaskPriority}
                  onChange={(event) =>
                    setNewTaskPriority(
                      event.target.value,
                    )
                  }
                >
                  {PRIORITIES.map((priority) => (
                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority}
                    </option>
                  ))}
                </select>

                <div className="modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setAddingTaskCol(null);
                      setNewTaskTitle("");
                      setNewTaskPriority("medium");
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() =>
                      handleAddTask(column.id)
                    }
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="add-task-btn"
                onClick={() =>
                  setAddingTaskCol(column.id)
                }
              >
                + Add task
              </button>
            )}
          </div>
        ))}

        {addingCol && (
          <div className="kcol kcol-new">
            <input
              autoFocus
              placeholder="Column name"
              value={newColName}
              onChange={(event) =>
                setNewColName(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddColumn();
                }
              }}
            />

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setAddingCol(false);
                  setNewColName("");
                }}
              >
                Cancel
              </button>

              <button
                className="btn-primary"
                onClick={handleAddColumn}
              >
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
              onDragStart={(event) =>
                handleTaskDragStart(
                  event,
                  task.id,
                )
              }
              onClick={() =>
                setSelectedTask(task)
              }
            >
              <span
                className={`priority-dot priority-${task.priority}`}
              />

              <span>{task.title}</span>
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          token={token}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}