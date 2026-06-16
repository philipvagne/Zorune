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

export default function RecentWorkPanel({
  isOpen,
  items,
  onSelectItem,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="recent-work-panel"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="recent-work-panel-header">
        <div className="dashboard-eyebrow">Recent Work</div>
        <p>Jump back into recent work</p>
      </div>

      {items.length === 0 ? (
        <div className="recent-work-empty">
          Your recently opened work will appear here.
        </div>
      ) : (
        <div className="recent-work-list" role="list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="recent-work-item"
              onClick={() => onSelectItem?.(item)}
            >
              <strong title={item.title}>{item.title}</strong>
              <span className="recent-work-item-meta">
                {item.itemType}
                {item.recentAt ? ` • ${formatRecentTime(item.recentAt)}` : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
