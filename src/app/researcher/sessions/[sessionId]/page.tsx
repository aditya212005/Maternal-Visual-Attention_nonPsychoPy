"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, formatDate, formatNumber, LoadingState, ResearcherError, ResearcherShell, statusLabel } from "@/components/researcher/ResearcherShell";

type Position = "LEFT" | "RIGHT";
type Key = "Q" | "O";
interface Trial { id: number; sessionId: number; trialNumber: number; babyImage: string; adultImage: string; adultGender: string; babyPosition: Position; adultPosition: Position; dotPosition: Position; expectedKey: Key; responseKey: Key; correct: boolean; reactionTimeMs: number; timestamp: string; }
interface Session { id: number; participantId: string; startedAt: string; completedAt: string | null; status: "in_progress" | "completed"; }

function safeStimulusPath(path: string) {
  return path.startsWith("/test-stimuli/") && !path.includes("..") ? path : null;
}

export default function SessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const [session, setSession] = useState<Session | null>(null);
  const [trials, setTrials] = useState<Trial[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect">("all");

  useEffect(() => {
    params.then(({ sessionId }) => fetch(`/api/researcher/sessions/${encodeURIComponent(sessionId)}`)).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Session data could not be loaded.");
      setSession(body.session);
      setTrials(body.trials);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Session data could not be loaded."));
  }, [params]);

  const stats = useMemo(() => {
    if (!trials || trials.length === 0) return { total: 0, correct: 0, incorrect: 0, accuracy: 0, mean: 0, median: 0, min: 0, max: 0 };
    const reactionTimes = trials.map((trial) => trial.reactionTimeMs).sort((a, b) => a - b);
    const correct = trials.filter((trial) => trial.correct).length;
    return { total: trials.length, correct, incorrect: trials.length - correct, accuracy: (correct / trials.length) * 100, mean: reactionTimes.reduce((sum, value) => sum + value, 0) / reactionTimes.length, median: reactionTimes.length % 2 ? reactionTimes[Math.floor(reactionTimes.length / 2)] : (reactionTimes[reactionTimes.length / 2 - 1] + reactionTimes[reactionTimes.length / 2]) / 2, min: reactionTimes[0], max: reactionTimes[reactionTimes.length - 1] };
  }, [trials]);

  const visibleTrials = trials?.filter((trial) => filter === "all" || (filter === "correct" ? trial.correct : !trial.correct)) ?? [];

  return (
    <ResearcherShell>
      <p className="researcher-breadcrumb"><Link href="/researcher/participants">← Participants</Link></p>
      {error && <ResearcherError message={error} />}
      {!session && !error && <LoadingState />}
      {session && trials && <>
        <section className="researcher-page-heading">
          <div><p className="researcher-eyebrow">Session detail</p><h1>Session {session.id}</h1><p>Participant: <strong>{session.participantId}</strong></p></div>
          <a className="researcher-button" href={`/api/researcher/export?sessionId=${session.id}`}>Export session CSV</a>
        </section>
        <section className="researcher-meta-grid"><div><span>Started</span><strong>{formatDate(session.startedAt)}</strong></div><div><span>Completed</span><strong>{formatDate(session.completedAt)}</strong></div><div><span>Status</span><strong className={`status-badge status-${session.status}`}>{statusLabel(session.status)}</strong></div><div><span>Trials</span><strong>{stats.total}</strong></div></section>
        <section className="researcher-section"><h2>Descriptive statistics</h2><div className="researcher-stat-grid researcher-stat-grid-compact"><div><span>Total trials</span><strong>{stats.total}</strong></div><div><span>Correct</span><strong>{stats.correct}</strong></div><div><span>Incorrect</span><strong>{stats.incorrect}</strong></div><div><span>Accuracy</span><strong>{formatNumber(stats.accuracy)}%</strong></div><div><span>Mean RT</span><strong>{formatNumber(stats.mean)} ms</strong></div><div><span>Median RT</span><strong>{formatNumber(stats.median)} ms</strong></div><div><span>Min RT</span><strong>{stats.min} ms</strong></div><div><span>Max RT</span><strong>{stats.max} ms</strong></div></div><p className="researcher-muted">Descriptive values only; no scientific interpretation is provided.</p></section>
        <section className="researcher-section"><div className="researcher-section-heading"><div><h2>Trial data</h2><p>Raw values stored in SQLite.</p></div><label htmlFor="trial-filter">Show <select id="trial-filter" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">All trials</option><option value="correct">Correct only</option><option value="incorrect">Incorrect only</option></select></label></div>{visibleTrials.length === 0 ? <EmptyState message={trials.length === 0 ? "This session has no trials." : "No trials match this filter."} /> : <div className="researcher-table-wrap"><table className="researcher-table researcher-trial-table"><thead><tr><th>Trial</th><th>Baby image</th><th>Adult image</th><th>Adult gender</th><th>Baby pos.</th><th>Adult pos.</th><th>Dot</th><th>Expected</th><th>Response</th><th>Correct</th><th>RT (ms)</th><th>Timestamp</th></tr></thead><tbody>{visibleTrials.map((trial) => <tr key={trial.id}><td>{trial.trialNumber}</td><td><StimulusCell path={trial.babyImage} alt="Test baby stimulus" /></td><td><StimulusCell path={trial.adultImage} alt="Test adult stimulus" /></td><td>{trial.adultGender}</td><td>{trial.babyPosition}</td><td>{trial.adultPosition}</td><td>{trial.dotPosition}</td><td>{trial.expectedKey}</td><td>{trial.responseKey}</td><td>{trial.correct ? "Yes" : "No"}</td><td>{trial.reactionTimeMs}</td><td>{formatDate(trial.timestamp)}</td></tr>)}</tbody></table></div>}</section>
      </>}
    </ResearcherShell>
  );
}

function StimulusCell({ path, alt }: { path: string; alt: string }) {
  const safePath = safeStimulusPath(path);
  return <div className="stimulus-cell">{safePath ? <img src={safePath} alt={alt} /> : null}<span>{path}</span></div>;
}
