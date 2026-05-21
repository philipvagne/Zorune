export default function ContextPanel({ children }) {
  const hasDetails = Boolean(children);

  return (
    <section className="dashboard-context-panel">
      {hasDetails ? (
        children
      ) : (
        <div className="context-panel-empty">
          Select a task to view details
        </div>
      )}
    </section>
  );
}
