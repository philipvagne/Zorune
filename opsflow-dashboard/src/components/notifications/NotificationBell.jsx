import { useMemo } from "react";

const typeCategoryMap = {
  TASK_ASSIGNED: "Assignment",
  TASK_UNASSIGNED: "Assignment",
  TASK_UPDATE_POSTED: "Update",
  TASK_NOTE_ADDED: "Comment",
  TASK_DUE_DATE_ADDED: "Due date",
  TASK_DUE_DATE_CHANGED: "Due date",
  TASK_DUE_DATE_CLEARED: "Due date",
  TASK_STATUS_CHANGED: "Status",
  TASK_ARCHIVED: "System",
  TASK_RESTORED: "System",
};

function getTypeLabel(type) {
  return typeCategoryMap[type] || "Notification";
}

function formatNotificationTime(value) {
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

export default function NotificationBell({
  notifications,
  openNotifications,
  setOpenNotifications,
  markAsRead,
  markAllAsRead,
  showTrigger = true,
  showPanel = true,
  embedded = false,
}) {
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (left, right) =>
          new Date(right.createdAt || 0).getTime() -
          new Date(left.createdAt || 0).getTime()
      ),
    [notifications]
  );

  return (
    <div className="notification-shell">
      {showTrigger ? (
        <button
          className="dashboard-topbar-action-button notification-trigger"
          data-count={unreadCount > 0 ? unreadCount : ""}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          title="Notifications"
          onClick={(event) => {
            event.stopPropagation();
            setOpenNotifications((current) => !current);
          }}
        >
          Notifications{" "}
          {unreadCount > 0 && `(${unreadCount})`}
        </button>
      ) : null}

      {showPanel && openNotifications ? (
        <div
          className={embedded ? "notification-menu notification-menu-embedded" : "notification-menu"}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="notification-menu-header">
            <div>
              <strong>Notifications</strong>
              <span>
                {unreadCount > 0
                  ? `${unreadCount} unseen`
                  : "Nothing new right now"}
              </span>
            </div>

            {unreadCount > 0 ? (
              <button
                type="button"
                className="notification-mark-all"
                onClick={markAllAsRead}
              >
                Mark all seen
              </button>
            ) : null}
          </div>

          <div className="notification-list">
            {sortedNotifications.length === 0 ? (
              <div className="notification-empty">
                Nothing needs your attention right now.
              </div>
            ) : (
              sortedNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={
                    notification.isRead
                      ? "notification-item"
                      : "notification-item unread"
                  }
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <span className="notification-message">
                    {notification.message}
                  </span>
                  <span className="notification-meta">
                    {getTypeLabel(notification.type)}
                    {notification.createdAt
                      ? ` • ${formatNotificationTime(notification.createdAt)}`
                      : ""}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
