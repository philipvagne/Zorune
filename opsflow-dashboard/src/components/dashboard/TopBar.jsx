export default function TopBar({
  title = "Dashboard",
  actions,
}) {
  return (
    <header className="dashboard-topbar">
      <div>
        <div className="dashboard-eyebrow">Workspace</div>
        <h2>{title}</h2>
      </div>

      <div className="dashboard-topbar-actions">
        {actions}
      </div>
    </header>
  );
}
