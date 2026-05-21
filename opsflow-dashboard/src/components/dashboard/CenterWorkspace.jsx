export default function CenterWorkspace({ children }) {
  return (
    <main className="dashboard-center-workspace">
      <div className="workspace-header">
        <div>
          <div className="dashboard-eyebrow">Kanban</div>
          <h3>Active Tasks</h3>
        </div>
      </div>

      {children}
    </main>
  );
}
