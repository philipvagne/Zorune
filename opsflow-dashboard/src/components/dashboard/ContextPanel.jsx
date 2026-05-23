export default function ContextPanel({ children }) {
  const hasDetails = Boolean(children);

  return (
    <section
      className={
        hasDetails
          ? "dashboard-context-panel"
          : "dashboard-context-panel is-empty"
      }
    >
      {hasDetails ? (
        children
      ) : (
        <div className="context-panel-empty">
          Open a task, project, or note when you need context
        </div>
      )}
    </section>
  );
}
