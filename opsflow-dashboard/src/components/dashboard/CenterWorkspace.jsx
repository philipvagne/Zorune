export default function CenterWorkspace({
  eyebrow = "Workspace",
  title,
  children,
}) {
  return (
    <main className="dashboard-center-workspace">
      {children}
    </main>
  );
}
