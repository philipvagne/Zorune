export default function TaskProductivityToolbar({
  filters,
  onFiltersChange,
  assigneeOptions,
  projectOptions,
  activeFilterCount,
  onClear,
  onCreateTask,
  activeTaskLayout,
  onTaskLayoutChange,
}) {
  const updateFilter = (key, value) => {
    onFiltersChange((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const layoutOptions = [
    { id: "kanban", label: "Kanban" },
    { id: "table", label: "Table" },
    { id: "calendar", label: "Calendar" },
  ];

  return (
    <div className="task-productivity-toolbar dashboard-structure-toolbar">
      <div className="dashboard-toolbar-filters">
        <div className="dashboard-toolbar-filter-strip">
        <select
          className="toolbar-select"
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
          title="Status"
        >
          <option value="ALL">All status</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </select>

        <select
          className="toolbar-select"
          value={filters.project}
          onChange={(event) => updateFilter("project", event.target.value)}
          title="Project"
        >
          <option value="ALL">All projects</option>
          {projectOptions.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          className="toolbar-select"
          value={filters.assignee}
          onChange={(event) => updateFilter("assignee", event.target.value)}
          title="Assignee"
        >
          <option value="ALL">All assignees</option>
          <option value="ME">Me</option>
          <option value="UNASSIGNED">Unassigned</option>
          {assigneeOptions.map((user) => (
            <option key={user.id} value={user.id}>
              {user.label}
            </option>
          ))}
        </select>

        <select
          className="toolbar-select"
          value={filters.due}
          onChange={(event) => updateFilter("due", event.target.value)}
          title="Due date"
        >
          <option value="ALL">All dates</option>
          <option value="OVERDUE">Overdue</option>
          <option value="TODAY">Due today</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="NONE">No due date</option>
        </select>
        </div>
      </div>

      <div className="dashboard-toolbar-actions">
        <div className="dashboard-toolbar-action-strip">
        <div className="dashboard-layout-tabs" role="tablist" aria-label="Task layout">
          {layoutOptions.map((layout) => (
            <button
              key={layout.id}
              type="button"
              role="tab"
              aria-selected={activeTaskLayout === layout.id}
              className={
                activeTaskLayout === layout.id
                  ? "dashboard-layout-tab active"
                  : "dashboard-layout-tab"
              }
              onClick={() => onTaskLayoutChange?.(layout.id)}
            >
              {layout.label}
            </button>
          ))}
        </div>

        {activeFilterCount > 0 ? (
          <button
            type="button"
            className="toolbar-clear"
            onClick={onClear}
            title="Clear filters"
          >
            Clear {activeFilterCount}
          </button>
        ) : null}

        <button
          type="button"
          className="ui-button ui-button-primary toolbar-new-task"
          onClick={onCreateTask}
        >
          + New Task
        </button>
        </div>
      </div>
    </div>
  );
}
