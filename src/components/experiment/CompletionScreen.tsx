import type { TrialResult } from "@/lib/experiment/types";

interface CompletionScreenProps {
  results: TrialResult[];
}

export function CompletionScreen({ results }: CompletionScreenProps) {
  const correctResponses = results.filter((result) => result.correct).length;
  const averageReactionTime = results.length
    ? Math.round(results.reduce((total, result) => total + result.reactionTimeMs, 0) / results.length)
    : 0;

  return (
    <section className="intro-screen" aria-labelledby="completion-title">
      <div className="intro-panel completion-panel">
        <p className="eyebrow">Complete</p>
        <h1 id="completion-title">Experiment completed. Thank you.</h1>
        <div className="development-summary">
          <p className="summary-label">DEVELOPMENT INFORMATION</p>
          <p>Trials completed: {results.length}</p>
          <p>Correct responses: {correctResponses}</p>
          <p>Average reaction time: {averageReactionTime} ms</p>
        </div>
      </div>
    </section>
  );
}