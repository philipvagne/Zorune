export default function TaskCard({ task, onClick }) {
  const statusColors = {
    TODO: "#f59e0b",
    IN_PROGRESS: "#3b82f6",
    DONE: "#10b981",
  };
  const hasDueDate = Boolean(task.dueDate);
  const isOverdue =
    hasDueDate &&
    task.status !== "DONE" &&
    new Date(task.dueDate).setHours(0, 0, 0, 0) <
      new Date().setHours(0, 0, 0, 0);

  return (
    <div
      className="task-card"
      onClick={() => onClick(task)}
      style={{
        borderLeft: `4px solid ${statusColors[task.status] || "#ccc"}`,
      }}
    >
      <div className="task-card-title">
        {task.title}
      </div>

      {hasDueDate && (
        <div
          className={
            isOverdue
              ? "task-card-date overdue"
              : "task-card-date"
          }
        >
          Due {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}

      {task.assignments?.length > 0 && (
        <div className="avatar-stack">
          {task.assignments.map((assignment, index) => {
            const name =
              assignment.user?.fullName ||
              assignment.user?.email ||
              "U";

            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={assignment.id}
                className="user-avatar"
                title={name}
                style={{
                  marginLeft: index === 0 ? "0" : "-8px",
                }}
              >
                {initials}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
