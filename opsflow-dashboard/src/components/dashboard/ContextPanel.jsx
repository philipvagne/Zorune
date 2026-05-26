export default function ContextPanel({ children, className = "" }) {
  const hasDetails = Boolean(children);

  if (!hasDetails) {
    return null;
  }

  const panelClassName = ["dashboard-context-panel", className]
    .filter(Boolean)
    .join(" ");

  return <section className={panelClassName}>{children}</section>;
}
