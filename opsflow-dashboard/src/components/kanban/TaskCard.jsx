export default function TaskCard({ task, onClick }) {
  const statusColors = {
    TODO: "#f59e0b",
    IN_PROGRESS: "#3b82f6",
    DONE: "#10b981",
  };

  return (
    <div
      onClick={() => onClick(task)}
      style={{
        background: "white",
        cursor: "pointer",
        padding: "12px",
        borderRadius: "10px",
        marginBottom: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        borderLeft: `4px solid ${statusColors[task.status] || "#ccc"}`,
        transition: "transform 0.1s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "scale(1.02)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
        {task.title}
      </div>

      <div style={{ fontSize: "12px", color: "#666" }}>
        {task.status.replace("_", " ")}
      </div>
    </div>
  );
}