function getPresenceName(user) {
  return user.fullName || user.username || user.email || "User";
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function RightRail({
  children,
  onlineUsers = [],
}) {
  return (
    <aside className="dashboard-right-rail">
      <div className="rail-section-title">Updates</div>
      {children}

      <section className="presence-section">
        <div className="rail-section-title">Online Users</div>

        {onlineUsers.length === 0 ? (
          <div className="presence-empty">No users online</div>
        ) : (
          <div className="presence-list">
            {onlineUsers.map((user) => {
              const name = getPresenceName(user);

              return (
                <div key={user.id} className="presence-user">
                  <div className="presence-avatar">
                    {getInitials(name)}
                  </div>
                  <span>{name}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </aside>
  );
}
