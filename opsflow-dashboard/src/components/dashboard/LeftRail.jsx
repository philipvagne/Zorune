const navItems = [
  "Organizations",
  "Projects",
  "Active Tasks",
  "Archive",
];

export default function LeftRail() {
  return (
    <aside className="dashboard-left-rail">
      <div className="rail-section-title">Navigation</div>

      <nav className="rail-nav">
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            className={item === "Active Tasks" ? "active" : ""}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}
