function formatRecentTime(value) {
  if (!value) {
    return "";
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "";
  }

  const diff = Date.now() - timestamp;
  const minutes = Math.max(1, Math.round(diff / 60000));

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.round(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(value).toLocaleDateString();
}

export default function RecentActivityStrip({
  eyebrow = "Recently Active",
  title = "Return to recent work",
  items = [],
  emptyText = "No recent activity yet.",
  onSelect,
  renderMeta,
}) {
  return (
    <section className="recent-activity-strip">
      <div className="recent-activity-strip-header">
        <div>
          <div className="dashboard-eyebrow">{eyebrow}</div>
          <h3>{title}</h3>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="recent-activity-empty">{emptyText}</div>
      ) : (
        <div className="recent-activity-list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="recent-activity-card"
              onClick={() => onSelect?.(item)}
            >
              <div className="recent-activity-topline">
                <span>{item.label}</span>
                <span>{formatRecentTime(item.recentAt)}</span>
              </div>
              <strong>{item.title}</strong>
              {renderMeta ? (
                <div className="recent-activity-meta">{renderMeta(item)}</div>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
