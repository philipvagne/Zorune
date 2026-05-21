export default function NotificationBell({
  notifications,
  openNotifications,
  setOpenNotifications,
  markAsRead,
  deleteNotification,
}) {
  const unreadCount = notifications.filter(
    (n) => !n.isRead
  ).length;

  return (
    <div className="notification-shell">
      <button
        className="ui-button ui-button-secondary notification-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setOpenNotifications((prev) => !prev);
        }}
      >
        Notifications{" "}
        {unreadCount > 0 && `(${unreadCount})`}
      </button>

      {openNotifications && (
        <div
          className="notification-menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="notification-menu-header">
            Notifications
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={
                    n.isRead
                      ? "notification-item"
                      : "notification-item unread"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(n.id);
                  }}
                >
                  <div className="notification-item-row">
                    <span>{n.message}</span>

                    {n.isRead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="ui-button ui-button-ghost notification-delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
