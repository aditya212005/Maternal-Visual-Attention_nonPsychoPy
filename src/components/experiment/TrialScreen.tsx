import type { ExperimentStage, Position, TrialStimulus } from "@/lib/experiment/types";

interface TrialScreenProps {
  stage: Exclude<ExperimentStage, "participant" | "instructions" | "completed">;
  trialNumber: number;
  totalTrials: number;
  stimulus: TrialStimulus;
  dotPosition: Position;
  persistenceError: string | null;
  onRetry: (() => void) | null;
}

export function TrialScreen({
  stage,
  trialNumber,
  totalTrials,
  stimulus,
  dotPosition,
  persistenceError,
  onRetry,
}: TrialScreenProps) {
  return (
    <section className="trial-screen" aria-label="Experiment trial">
      <div className="trial-status">Trial {trialNumber} of {totalTrials}</div>
      <div className={`trial-field trial-field--${stage}`}>
        {stage === "fixation" && <span className="fixation" aria-label="Fixation">+</span>}
        {stage === "stimulus" && (
          <div className="stimulus-pair" aria-label="Test images">
            <img className={`stimulus-image stimulus-image--${stimulus.babyPosition.toLowerCase()}`} src={stimulus.babyImage} alt="TEST baby stimulus" />
            <img className={`stimulus-image stimulus-image--${stimulus.adultPosition.toLowerCase()}`} src={stimulus.adultImage} alt={`${stimulus.adultGender} stimulus`} />
          </div>
        )}
        {stage === "probe" && <span className={`probe probe--${dotPosition.toLowerCase()}`} aria-label={`Dot on the ${dotPosition.toLowerCase()}`} />}
      </div>
      {persistenceError && (
        <div className="persistence-error" role="alert">
          <p>{persistenceError}</p>
          {onRetry && <button type="button" onClick={onRetry}>Retry save</button>}
        </div>
      )}
    </section>
  );
}