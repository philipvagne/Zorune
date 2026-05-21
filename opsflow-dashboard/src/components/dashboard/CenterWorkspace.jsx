export default function CenterWorkspace({
  eyebrow = "Workspace",
  title,
  children,
}) {
  return (
    <main className="dashboard-center-workspace">
      <div className="workspace-header">
        <div>
          <div className="dashboard-eyebrow">{eyebrow}</div>
          <h3>{title}</h3>
        </div>
      </div>

      {children}
    </main>
  );
}
