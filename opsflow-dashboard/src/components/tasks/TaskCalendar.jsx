const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getDateKey = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value.toISOString();
};

const formatDateHeading = (dateKey) =>
  new Date(dateKey).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatStatus = (status) =>
  status === "IN_PROGRESS" ? "In progress" : status;

const isOverdue = (task) =>
  task.dueDate &&
  task.status !== "DONE" &&
  new Date(task.dueDate).setHours(0, 0, 0, 0) <
    startOfToday().getTime();

const isToday = (dateKey) =>
  new Date(dateKey).getTime() === startOfToday().getTime();

const getAssigneeLabel = (task) => {
  const count = task.assignments?.length || 0;

  if (count === 0) return "Unassigned";
  if (count === 1) {
    const user = task.assignments[0].user;
    return user?.fullName || user?.username || user?.email || "1 assignee";
  }

  return `${count} assignees`;
};

function CalendarTaskItem({ task, onSelectTask }) {
  return (
    <button
      type="button"
      className={
        isOverdue(task)
          ? "calendar-task calendar-task-overdue"
          : "calendar-task"
      }
      onClick={() => onSelectTask(task)}
    >
      <span>
        <strong>
          {task.title}
          {task.unreadNoteCount > 0 ? (
            <span className="task-awareness-text inline">
              {task.unreadNoteCount} new note
              {task.unreadNoteCount > 1 ? "s" : ""}
            </span>
          ) : null}
        </strong>
        <span className="calendar-task-meta">
          {formatStatus(task.status)} - {getAssigneeLabel(task)}
          {task.project?.name ? ` - ${task.project.name}` : ""}
        </span>
      </span>
      {isOverdue(task) ? (
        <span className="calendar-state-pill overdue">Overdue</span>
      ) : null}
    </button>
  );
}

export default function TaskCalendar({ tasks, onSelectTask }) {
  const tasksWithDueDate = tasks
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const tasksWithoutDueDate = tasks.filter((task) => !task.dueDate);

  const groupedTasks = tasksWithDueDate.reduce((groups, task) => {
    const dateKey = getDateKey(task.dueDate);

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(task);
    return groups;
  }, {});

  const dateKeys = Object.keys(groupedTasks).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  if (tasks.length === 0) {
    return (
      <div className="workspace-placeholder">
        No active tasks assigned to you
      </div>
    );
  }

  return (
    <div className="task-calendar">
      {dateKeys.map((dateKey) => {
        const dateIsToday = isToday(dateKey);
        const hasOverdueTasks = groupedTasks[dateKey].some(isOverdue);

        return (
          <section
            key={dateKey}
            className={
              hasOverdueTasks
                ? "calendar-date-group overdue"
                : "calendar-date-group"
            }
          >
            <div className="calendar-date-header">
              <div>
                <div className="dashboard-eyebrow">
                  {dateIsToday ? "Today" : "Due date"}
                </div>
                <h4>{formatDateHeading(dateKey)}</h4>
              </div>
              {dateIsToday ? (
                <span className="calendar-state-pill today">Today</span>
              ) : hasOverdueTasks ? (
                <span className="calendar-state-pill overdue">
                  Overdue
                </span>
              ) : null}
            </div>

            <div className="calendar-task-list">
              {groupedTasks[dateKey].map((task) => (
                <CalendarTaskItem
                  key={task.id}
                  task={task}
                  onSelectTask={onSelectTask}
                />
              ))}
            </div>
          </section>
        );
      })}

      {tasksWithoutDueDate.length > 0 ? (
        <section className="calendar-date-group">
          <div className="calendar-date-header">
            <div>
              <div className="dashboard-eyebrow">Unscheduled</div>
              <h4>No due date</h4>
            </div>
          </div>

          <div className="calendar-task-list">
            {tasksWithoutDueDate.map((task) => (
              <CalendarTaskItem
                key={task.id}
                task={task}
                onSelectTask={onSelectTask}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
