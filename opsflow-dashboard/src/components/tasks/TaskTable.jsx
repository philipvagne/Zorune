const formatStatus = (status) =>
  status === "IN_PROGRESS" ? "In progress" : status;

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "No due date";

const getAssigneeName = (assignment) =>
  assignment.user?.fullName ||
  assignment.user?.username ||
  assignment.user?.email ||
  "User";

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const isOverdue = (task) =>
  task.dueDate &&
  task.status !== "DONE" &&
  new Date(task.dueDate).setHours(0, 0, 0, 0) <
    new Date().setHours(0, 0, 0, 0);

export default function TaskTable({ tasks, onSelectTask }) {
  if (tasks.length === 0) {
    return (
      <div className="workspace-placeholder">
        No active tasks assigned to you
      </div>
    );
  }

  return (
    <div className="task-table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Due date</th>
            <th>Assignees</th>
            <th>Project</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="task-table-row"
              onClick={() => onSelectTask(task)}
            >
              <td>
                <div className="task-table-title">{task.title}</div>
                {task.description ? (
                  <div className="task-table-description">
                    {task.description}
                  </div>
                ) : null}
              </td>
              <td>
                <span className={`status-pill status-${task.status}`}>
                  {formatStatus(task.status)}
                </span>
              </td>
              <td>
                <span
                  className={
                    isOverdue(task)
                      ? "task-table-date overdue"
                      : "task-table-date"
                  }
                >
                  {formatDate(task.dueDate)}
                </span>
              </td>
              <td>
                {task.assignments?.length > 0 ? (
                  <div className="table-avatar-stack">
                    {task.assignments.map((assignment, index) => {
                      const name = getAssigneeName(assignment);

                      return (
                        <div
                          key={assignment.id || assignment.userId}
                          className="user-avatar table-avatar"
                          title={name}
                          style={{
                            marginLeft: index === 0 ? "0" : "-8px",
                          }}
                        >
                          {getInitials(name)}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="muted-inline">Unassigned</span>
                )}
              </td>
              <td>
                <span className="muted-inline">
                  {task.project?.name || "No project"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
