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
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [trials] = useState(createDevelopmentTrials);
  const [trialIndex, setTrialIndex] = useState(0);
  const [dotPosition, setDotPosition] = useState(chooseDevelopmentDotPosition);
  const [results, setResults] = useState<TrialResult[]>([]);
  const probePresentationTimeRef = useRef<number | null>(null);
  const responseRecordedRef = useRef(false);
  const pendingResultRef = useRef<TrialResult | null>(null);
  const completionPendingRef = useRef(false);

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
    if (stage !== "probe" || !currentTrial) {
      return;
    }

    responseRecordedRef.current = false;
    // The reaction-time clock starts when the probe is presented, not at trial start.
    probePresentationTimeRef.current = performance.now();

    const saveTrial = async (result: TrialResult) => {
      if (sessionId === null) {
        throw new Error("No active session is available.");
      }
      const response = await fetch("/api/trials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, trial: result }),
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "The trial could not be saved.");
      }
    };

    const completeSession = async () => {
      if (sessionId === null) {
        throw new Error("No active session is available.");
      }
      const response = await fetch(`/api/sessions/${sessionId}/complete`, { method: "POST" });
      const body = await response.json() as { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "The session could not be completed.");
      }
    };

    const persistResultAndAdvance = async (result: TrialResult) => {
      try {
        await saveTrial(result);
        setPersistenceError(null);
        setResults((previousResults) => [...previousResults, result]);

        if (trialIndex + 1 >= trials.length) {
          completionPendingRef.current = true;
          setCanRetry(true);
          await completeSession();
          completionPendingRef.current = false;
          pendingResultRef.current = null;
          setCanRetry(false);
          setStage("completed");
        } else {
          pendingResultRef.current = null;
          setCanRetry(false);
          setTrialIndex((previousIndex) => previousIndex + 1);
          setStage("fixation");
        }
      } catch (error) {
        setCanRetry(true);
        setPersistenceError(error instanceof Error ? error.message : "The trial could not be saved.");
      }
    };

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

      pendingResultRef.current = result;
      void persistResultAndAdvance(result);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTrial, dotPosition, participantId, sessionId, stage, trialIndex, trials.length]);

  const startInstructions = async () => {
    const normalizedParticipantId = participantId.trim();
    if (!normalizedParticipantId || isStarting) {
      return;
    }

    setIsStarting(true);
    setPersistenceError(null);
    setCanRetry(false);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: normalizedParticipantId }),
      });
      const body = await response.json() as { sessionId?: number; error?: string };
      if (!response.ok || typeof body.sessionId !== "number") {
        throw new Error(body.error ?? "The session could not be started.");
      }
      setParticipantId(normalizedParticipantId);
      setSessionId(body.sessionId);
      setStage("instructions");
    } catch (error) {
      setPersistenceError(error instanceof Error ? error.message : "The session could not be started.");
    } finally {
      setIsStarting(false);
    }
  };

  const beginExperiment = () => {
    setTrialIndex(0);
    setDotPosition(chooseDevelopmentDotPosition());
    setStage("fixation");
  };

  const retryPersistence = () => {
    void (async () => {
      try {
        if (completionPendingRef.current && sessionId !== null) {
          const response = await fetch(`/api/sessions/${sessionId}/complete`, { method: "POST" });
          const body = await response.json() as { error?: string };
          if (!response.ok) {
            throw new Error(body.error ?? "The session could not be completed.");
          }
          completionPendingRef.current = false;
          pendingResultRef.current = null;
          setCanRetry(false);
          setPersistenceError(null);
          setStage("completed");
          return;
        }

        const result = pendingResultRef.current;
        if (!result || sessionId === null) {
          throw new Error("No pending trial is available to retry.");
        }
        const response = await fetch("/api/trials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, trial: result }),
        });
        const body = await response.json() as { error?: string };
        if (!response.ok) {
          throw new Error(body.error ?? "The trial could not be saved.");
        }
        pendingResultRef.current = null;
        setPersistenceError(null);
        setResults((previousResults) => [...previousResults, result]);
        if (trialIndex + 1 >= trials.length) {
          completionPendingRef.current = true;
          setCanRetry(true);
          const completionResponse = await fetch(`/api/sessions/${sessionId}/complete`, { method: "POST" });
          const completionBody = await completionResponse.json() as { error?: string };
          if (!completionResponse.ok) {
            throw new Error(completionBody.error ?? "The session could not be completed.");
          }
          completionPendingRef.current = false;
          setCanRetry(false);
          setStage("completed");
        } else {
          setCanRetry(false);
          setTrialIndex((previousIndex) => previousIndex + 1);
          setStage("fixation");
        }
      } catch (error) {
        setCanRetry(true);
        setPersistenceError(error instanceof Error ? error.message : "The data could not be saved.");
      }
    })();
  };

  return (
    <main className="experiment-app">
      {stage === "participant" && (
        <ParticipantScreen
          participantId={participantId}
          onParticipantIdChange={setParticipantId}
          onStart={startInstructions}
          isStarting={isStarting}
          error={persistenceError}
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
          persistenceError={persistenceError}
          onRetry={canRetry ? retryPersistence : null}
        />
      )}
      {stage === "completed" && <CompletionScreen results={results} />}
    </main>
  );
}
