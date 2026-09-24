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
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearConfirmation, setClearConfirmation] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  const loadParticipants = () => fetch("/api/researcher/participants")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Participants could not be loaded.");
        setParticipants(body.participants);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Participants could not be loaded."));

  useEffect(() => {
    void loadParticipants();
  }, []);

  const clearAllRecords = async () => {
    if (clearConfirmation !== "CLEAR") return;
    setIsClearing(true);
    setError(null);
    setClearMessage(null);
    try {
      const response = await fetch("/api/researcher/data", { method: "DELETE" });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Research records could not be cleared.");
      setIsClearModalOpen(false);
      setClearConfirmation("");
      setClearMessage("All research records have been cleared.");
      await loadParticipants();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Research records could not be cleared.");
    } finally {
      setIsClearing(false);
    }
  };

  const visibleParticipants = participants?.filter((participant) => participant.participantId.toLowerCase().includes(filter.toLowerCase())) ?? [];

  return (
    <ResearcherShell>
      <section className="researcher-page-heading">
        <div>
          <p className="researcher-eyebrow">Data management</p>
          <h1>Participants</h1>
          <p>Participant identifiers only. Select a row to inspect its sessions.</p>
        </div>
        <div className="researcher-action-group">
          <a className="researcher-button researcher-button-secondary" href="/api/researcher/export">Export all CSV</a>
          <button className="researcher-danger-button" type="button" onClick={() => { setClearMessage(null); setIsClearModalOpen(true); }}>Clear All Records</button>
        </div>
      </section>
      {error && <ResearcherError message={error} />}
      {clearMessage && <p className="researcher-success" role="status">{clearMessage}</p>}
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
      {isClearModalOpen && (
        <div className="researcher-modal-backdrop" role="presentation">
          <section className="researcher-modal" role="dialog" aria-modal="true" aria-labelledby="clear-records-title">
            <p className="researcher-eyebrow">Destructive action</p>
            <h2 id="clear-records-title">Clear all records?</h2>
            <p>This will permanently delete all participants, sessions, and trial records. This action cannot be undone.</p>
            <label htmlFor="clear-confirmation">Type CLEAR to continue</label>
            <input id="clear-confirmation" value={clearConfirmation} onChange={(event) => setClearConfirmation(event.target.value)} autoFocus autoComplete="off" />
            <div className="researcher-modal-actions">
              <button className="researcher-button researcher-button-secondary" type="button" onClick={() => { setIsClearModalOpen(false); setClearConfirmation(""); }} disabled={isClearing}>Cancel</button>
              <button className="researcher-danger-button" type="button" onClick={() => void clearAllRecords()} disabled={clearConfirmation !== "CLEAR" || isClearing}>{isClearing ? "Clearing..." : "Permanently clear records"}</button>
            </div>
          </section>
        </div>
      )}
    </ResearcherShell>
  );
}
