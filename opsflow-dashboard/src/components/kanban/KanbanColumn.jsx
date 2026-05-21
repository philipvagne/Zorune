import TaskCard from "./TaskCard";

export default function KanbanColumn({
  title,
  tasks,
  setSelectedTask,
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "#f5f5f5",
        padding: "15px",
        borderRadius: "10px",
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h4 style={{ margin: 0 }}>{title}</h4>

        <span
          style={{
            fontSize: "12px",
            background: "#e5e7eb",
            padding: "4px 8px",
            borderRadius: "999px",
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* EMPTY STATE */}
      {tasks.length === 0 ? (
        <div
          style={{
            fontSize: "13px",
            color: "#888",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
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