import TaskCard from "./TaskCard";

export default function KanbanColumn({
  title,
  tasks,
  setSelectedTask,
}) {
  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <h4>{title}</h4>

        <span className="count-pill">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="kanban-empty">
          No tasks here
        </div>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={setSelectedTask}
          />
        ))
      )}
    </div>
  );
}
