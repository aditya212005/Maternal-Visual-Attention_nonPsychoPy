"use client";

import { useEffect, useState } from "react";
import { ResearcherError, ResearcherShell, LoadingState, formatNumber } from "@/components/researcher/ResearcherShell";
import { StatCard } from "@/components/researcher/StatCard";

interface DashboardSummary {
  participantCount: number;
  sessionCount: number;
  completedSessionCount: number;
  trialCount: number;
  correctTrialCount: number;
  incorrectTrialCount: number;
  meanReactionTimeMs: number;
}

export default function ResearcherDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/researcher/overview")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Dashboard data could not be loaded.");
        setSummary(body.summary);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Dashboard data could not be loaded."));
  }, []);

  return (
    <ResearcherShell>
      <section className="researcher-page-heading">
        <div>
          <p className="researcher-eyebrow">Overview</p>
          <h1>Research dashboard</h1>
          <p>Descriptive database summaries. No scientific interpretation is applied here.</p>
        </div>
        <a className="researcher-button" href="/api/researcher/export">Export all CSV</a>
      </section>
      {error && <ResearcherError message={error} />}
      {!summary && !error && <LoadingState />}
      {summary && (
        <>
          <div className="researcher-stat-grid">
            <StatCard label="Participants" value={summary.participantCount} />
            <StatCard label="Sessions" value={summary.sessionCount} detail={`${summary.completedSessionCount} completed`} />
            <StatCard label="Trials" value={summary.trialCount} />
            <StatCard label="Correct responses" value={summary.correctTrialCount} />
            <StatCard label="Incorrect responses" value={summary.incorrectTrialCount} />
            <StatCard label="Mean reaction time" value={`${formatNumber(summary.meanReactionTimeMs)} ms`} />
          </div>
          <section className="researcher-section researcher-note">
            <h2>Data status</h2>
            <p>{summary.sessionCount - summary.completedSessionCount} session(s) in progress and {summary.completedSessionCount} completed.</p>
            <p>Values shown are descriptive summaries of records currently stored in the local SQLite database.</p>
          </section>
        </>
      )}
    </ResearcherShell>
  );
}
