"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, formatDate, LoadingState, ResearcherError, ResearcherShell, statusLabel } from "@/components/researcher/ResearcherShell";

interface Session {
  id: number;
  participantId: string;
  startedAt: string;
  completedAt: string | null;
  status: "in_progress" | "completed";
  trialCount: number;
}

export default function ParticipantDetailPage({ params }: { params: Promise<{ participantId: string }> }) {
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ participantId: encodedId }) => {
      const decodedId = decodeURIComponent(encodedId);
      setParticipantId(decodedId);
      return fetch(`/api/researcher/participants/${encodeURIComponent(decodedId)}`);
    }).then(async (response) => {
      if (!response) return;
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Participant data could not be loaded.");
      setSessions(body.sessions);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Participant data could not be loaded."));
  }, [params]);

  return (
    <ResearcherShell>
      <p className="researcher-breadcrumb"><Link href="/researcher/participants">← Participants</Link></p>
      <section className="researcher-page-heading">
        <div><p className="researcher-eyebrow">Participant detail</p><h1>{participantId ?? "Participant"}</h1><p>Sessions associated with this participant identifier.</p></div>
      </section>
      {error && <ResearcherError message={error} />}
      {!sessions && !error && <LoadingState />}
      {sessions && (
        <section className="researcher-section">
          <h2>Sessions</h2>
          {sessions.length === 0 ? <EmptyState message="This participant has no sessions." /> : <div className="researcher-table-wrap"><table className="researcher-table"><thead><tr><th>Session ID</th><th>Started</th><th>Completed</th><th>Status</th><th>Trials</th></tr></thead><tbody>{sessions.map((session) => <tr key={session.id}><td><Link href={`/researcher/sessions/${session.id}`}>Session {session.id}</Link></td><td>{formatDate(session.startedAt)}</td><td>{formatDate(session.completedAt)}</td><td><span className={`status-badge status-${session.status}`}>{statusLabel(session.status)}</span></td><td>{session.trialCount}</td></tr>)}</tbody></table></div>}
        </section>
      )}
    </ResearcherShell>
  );
}
