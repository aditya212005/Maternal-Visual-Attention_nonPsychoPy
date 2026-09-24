import Link from "next/link";

export function ResearcherShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="researcher-app">
      <header className="researcher-header">
        <div>
          <p className="researcher-eyebrow">Research data management</p>
          <Link className="researcher-brand" href="/researcher">Maternal Visual Attention</Link>
        </div>
        <nav className="researcher-nav" aria-label="Researcher navigation">
          <Link href="/researcher">Overview</Link>
          <Link href="/researcher/participants">Participants</Link>
          <Link href="/">Participant experiment</Link>
        </nav>
      </header>
      <div className="researcher-content">{children}</div>
    </main>
  );
}

export function ResearcherError({ message }: { message: string }) {
  return <p className="researcher-error" role="alert">{message}</p>;
}

export function LoadingState() {
  return <p className="researcher-muted">Loading research data...</p>;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="researcher-empty">{message}</p>;
}

export function formatDate(value: string | null) {
  if (!value) return "Not completed";
  return new Date(value).toLocaleString();
}

export function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function statusLabel(status: "in_progress" | "completed") {
  return status === "completed" ? "Completed" : "In progress";
}
