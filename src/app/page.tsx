"use client";

import { useEffect, useRef, useState } from "react";
import { CompletionScreen } from "@/components/experiment/CompletionScreen";
import { InstructionsScreen } from "@/components/experiment/InstructionsScreen";
import { ParticipantScreen } from "@/components/experiment/ParticipantScreen";
import { TrialScreen } from "@/components/experiment/TrialScreen";
import {
  chooseDevelopmentDotPosition,
  createDevelopmentTrials,
  DEVELOPMENT_TIMING,
  RESPONSE_KEYS,
} from "@/lib/experiment/config";
import type { ExperimentStage, ResponseKey, TrialResult } from "@/lib/experiment/types";

export default function Home() {
  const [stage, setStage] = useState<ExperimentStage>("participant");
  const [participantId, setParticipantId] = useState("");
  const [trials] = useState(createDevelopmentTrials);
  const [trialIndex, setTrialIndex] = useState(0);
  const [dotPosition, setDotPosition] = useState(chooseDevelopmentDotPosition);
  const [results, setResults] = useState<TrialResult[]>([]);
  const probePresentationTimeRef = useRef<number | null>(null);
  const responseRecordedRef = useRef(false);

  const currentTrial = trials[trialIndex];

  useEffect(() => {
    if (stage === "participant" || stage === "instructions" || stage === "probe" || stage === "completed") {
      return;
    }

    const durationByStage = {
      fixation: DEVELOPMENT_TIMING.fixationDurationMs,
      stimulus: DEVELOPMENT_TIMING.imagePresentationDurationMs,
      blank: DEVELOPMENT_TIMING.blankIntervalDurationMs,
    } as const;

    const timer = window.setTimeout(() => {
      if (stage === "blank") {
        setDotPosition(chooseDevelopmentDotPosition());
        setStage("probe");
      } else if (stage === "fixation") {
        setStage("stimulus");
      } else {
        setStage("blank");
      }
    }, durationByStage[stage]);

    return () => window.clearTimeout(timer);
  }, [stage, trialIndex]);

  useEffect(() => {
    if (stage !== "probe") {
      return;
    }

    responseRecordedRef.current = false;
    // The reaction-time clock starts when the probe is presented, not at trial start.
    probePresentationTimeRef.current = performance.now();

    const handleKeyDown = (event: KeyboardEvent) => {
      const responseKey = event.key.toUpperCase();
      if ((responseKey !== "Q" && responseKey !== "O") || responseRecordedRef.current) {
        return;
      }

      responseRecordedRef.current = true;
      const responseTime = performance.now();
      const reactionTimeMs = Math.round(responseTime - (probePresentationTimeRef.current ?? responseTime));
      const typedResponseKey = responseKey as ResponseKey;
      const expectedKey = RESPONSE_KEYS[dotPosition];
      const result: TrialResult = {
        ...currentTrial,
        participantId,
        trialNumber: trialIndex + 1,
        dotPosition,
        expectedKey,
        responseKey: typedResponseKey,
        correct: typedResponseKey === expectedKey,
        reactionTimeMs,
        timestamp: new Date().toISOString(),
      };

      setResults((previousResults) => {
        const nextResults = [...previousResults, result];
        if (process.env.NODE_ENV === "development") {
          console.debug("Development trial result", result);
        }
        return nextResults;
      });

      if (trialIndex + 1 >= trials.length) {
        setStage("completed");
      } else {
        setTrialIndex((previousIndex) => previousIndex + 1);
        setStage("fixation");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTrial, dotPosition, participantId, stage, trialIndex, trials.length]);

  const startInstructions = () => {
    if (participantId.trim()) {
      setParticipantId(participantId.trim());
      setStage("instructions");
    }
  };

  const beginExperiment = () => {
    setTrialIndex(0);
    setDotPosition(chooseDevelopmentDotPosition());
    setStage("fixation");
  };

  return (
    <main className="experiment-app">
      {stage === "participant" && (
        <ParticipantScreen
          participantId={participantId}
          onParticipantIdChange={setParticipantId}
          onStart={startInstructions}
        />
      )}
      {stage === "instructions" && <InstructionsScreen onBegin={beginExperiment} />}
      {currentTrial && ["fixation", "stimulus", "blank", "probe"].includes(stage) && (
        <TrialScreen
          stage={stage as Exclude<ExperimentStage, "participant" | "instructions" | "completed">}
          trialNumber={trialIndex + 1}
          totalTrials={trials.length}
          stimulus={currentTrial}
          dotPosition={dotPosition}
        />
      )}
      {stage === "completed" && <CompletionScreen results={results} />}
    </main>
  );
}
