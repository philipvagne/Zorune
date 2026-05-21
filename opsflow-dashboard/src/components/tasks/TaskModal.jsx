export default function TaskModal({
  task,
  onClose,
  updateTaskStatus,
  assignTask,
}) {
  if (!task) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          width: "520px",
          maxWidth: "90%",
          borderRadius: "14px",
          padding: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>{task.title}</h2>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* STATUS */}
        <div style={{ marginBottom: "15px" }}>
          <strong>Status</strong>

          <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
            <button onClick={() => updateTaskStatus(task.id, "TODO")}>
              TODO
            </button>

            <button onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")}>
              IN PROGRESS
            </button>

            <button onClick={() => updateTaskStatus(task.id, "DONE")}>
              DONE
            </button>
          </div>

          <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
            Current: <strong>{task.status}</strong>
          </div>
        </div>

        {/* ASSIGN */}
        <div style={{ marginTop: "20px" }}>
          <strong>Assign Task</strong>

          <input
            type="text"
            placeholder="Enter user ID"
            defaultValue={task.assigneeId || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                assignTask(task.id, e.target.value);
              }
            }}
            style={{
              padding: "8px",
              width: "100%",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: "10px",
            }}
          />

          <div style={{ fontSize: "12px", color: "#666", marginTop: "6px" }}>
            Press Enter to assign
          </div>
        </div>

        {/* DESCRIPTION */}
        <div style={{ marginTop: "20px" }}>
          <strong>Description</strong>
          <p style={{ marginTop: "8px", color: "#444" }}>
            {task.description || "No description"}
          </p>
        </div>

        {/* FOOTER */}
        <div
          style={{
            marginTop: "25px",
            fontSize: "12px",
            color: "#888",
          }}
        >
          Task ID: {task.id}
        </div>
      </div>
    </div>
  );
}