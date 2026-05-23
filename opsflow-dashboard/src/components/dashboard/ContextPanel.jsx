export default function ContextPanel({ children }) {
  const hasDetails = Boolean(children);

  if (!hasDetails) {
    return null;
  }

  return <section className="dashboard-context-panel">{children}</section>;
}
