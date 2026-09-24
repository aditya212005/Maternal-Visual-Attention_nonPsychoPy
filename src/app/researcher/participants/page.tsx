"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, formatDate, LoadingState, ResearcherError, ResearcherShell } from "@/components/researcher/ResearcherShell";

interface Participant {
  id: number;
  participantId: string;
  sessionCount: number;
  completedSessionCount: number;
  mostRecentSessionDate: string | null;
  trialCount: number;
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/researcher/participants")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Participants could not be loaded.");
        setParticipants(body.participants);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Participants could not be loaded."));
  }, []);

  const visibleParticipants = participants?.filter((participant) => participant.participantId.toLowerCase().includes(filter.toLowerCase())) ?? [];

  return (
    <ResearcherShell>
      <section className="researcher-page-heading">
        <div>
          <p className="researcher-eyebrow">Data management</p>
          <h1>Participants</h1>
          <p>Participant identifiers only. Select a row to inspect its sessions.</p>
        </div>
        <a className="researcher-button researcher-button-secondary" href="/api/researcher/export">Export all CSV</a>
      </section>
      {error && <ResearcherError message={error} />}
      {!participants && !error && <LoadingState />}
      {participants && (
        <section className="researcher-section">
          <div className="researcher-toolbar">
            <label htmlFor="participant-filter">Filter participant ID</label>
            <input id="participant-filter" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="e.g. TEST-001" />
          </div>
          {visibleParticipants.length === 0 ? <EmptyState message={participants.length === 0 ? "No participants have been recorded." : "No matching participants."} /> : (
            <div className="researcher-table-wrap">
              <table className="researcher-table">
                <thead><tr><th>Participant ID</th><th>Sessions</th><th>Completed</th><th>Most recent session</th><th>Trials</th></tr></thead>
                <tbody>{visibleParticipants.map((participant) => (
                  <tr key={participant.id}>
                    <td><Link href={`/researcher/participants/${encodeURIComponent(participant.participantId)}`}>{participant.participantId}</Link></td>
                    <td>{participant.sessionCount}</td>
                    <td>{participant.completedSessionCount}</td>
                    <td>{formatDate(participant.mostRecentSessionDate)}</td>
                    <td>{participant.trialCount}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </ResearcherShell>
  );
}
