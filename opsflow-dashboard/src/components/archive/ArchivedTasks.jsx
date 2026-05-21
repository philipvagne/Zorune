import { useEffect, useState } from "react";
import { getArchivedTasks, restoreTask } from "../../api";

function formatDate(value) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString();
}

function getAssigneeName(assignment) {
  return (
    assignment.user?.fullName ||
    assignment.user?.email ||
    assignment.userId ||
    "User"
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ArchivedTasks({ token }) {
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restoringTaskId, setRestoringTaskId] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchArchivedTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getArchivedTasks(token);

        if (active) {
          setArchivedTasks(res.data);
        }
      } catch (err) {
        if (active) {
          setError("Could not load archived tasks.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchArchivedTasks();

    return () => {
      active = false;
    };
  }, [token]);

  const handleRestore = async (taskId) => {
    setRestoringTaskId(taskId);
    setError("");

    try {
      await restoreTask(token, taskId);
      setArchivedTasks((current) =>
        current.filter((task) => task.id !== taskId)
      );
    } catch (err) {
      setError("Could not restore task.");
    } finally {
      setRestoringTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="workspace-placeholder">
        Loading archived tasks...
      </div>
    );
  }

  if (error) {
    return <div className="archive-error">{error}</div>;
  }

  if (archivedTasks.length === 0) {
    return (
      <div className="workspace-placeholder">
        Archived tasks will appear here
      </div>
    );
  }

  return (
    <div className="archive-list">
      {archivedTasks.map((task) => (
        <article key={task.id} className="archive-card">
          <div className="archive-card-main">
            <div>
              <h4>{task.title}</h4>
              <div className="archive-meta">
                <span>{task.status}</span>
                {task.dueDate && (
                  <span>Due {formatDate(task.dueDate)}</span>
                )}
                {task.archivedAt && (
                  <span>Archived {formatDate(task.archivedAt)}</span>
                )}
              </div>
            </div>

            <button
              type="button"
              className="archive-restore-button"
              disabled={restoringTaskId === task.id}
              onClick={() => handleRestore(task.id)}
            >
              {restoringTaskId === task.id ? "Restoring..." : "Restore"}
            </button>
          </div>

          {task.assignments?.length > 0 && (
            <div className="archive-assignees">
              {task.assignments.map((assignment, index) => {
                const name = getAssigneeName(assignment);

                return (
                  <div
                    key={assignment.id}
                    className="archive-avatar"
                    title={name}
                    style={{
                      marginLeft: index === 0 ? 0 : -8,
                    }}
                  >
                    {getInitials(name)}
                  </div>
                );
              })}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
