const navItems = [
  {
    id: "tasks",
    label: "Active Tasks",
    icon: "[]",
  },
  {
    id: "archive",
    label: "Archived Tasks",
    icon: "##",
  },
  {
    id: "projects",
    label: "Projects",
    icon: "//",
  },
  {
    id: "organizations",
    label: "Organizations",
    icon: "::",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "**",
  },
  {
    id: "profile",
    label: "Profile",
    icon: "@@",
  },
];

export default function LeftRail({
  activeView,
  onViewChange,
}) {
  return (
    <aside className="dashboard-left-rail">
      <div className="rail-section-title">Navigation</div>

      <nav className="rail-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activeView === item.id ? "active" : ""}
            onClick={() => onViewChange(item.id)}
          >
            <span className="rail-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
