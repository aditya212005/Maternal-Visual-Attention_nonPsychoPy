export type ExperimentStage =
  | "participant"
  | "instructions"
  | "fixation"
  | "stimulus"
  | "blank"
  | "probe"
  | "completed";

export type Position = "LEFT" | "RIGHT";
export type ResponseKey = "Q" | "O";

export interface StimulusDataset {
  adults: string[];
  babies: string[];
}

export interface TrialStimulus {
  babyImage: string;
  adultImage: string;
  adultGender: string;
  babyPosition: Position;
  adultPosition: Position;
}

export interface TrialResult extends TrialStimulus {
  participantId: string;
  trialNumber: number;
  dotPosition: Position;
  expectedKey: ResponseKey;
  responseKey: ResponseKey;
  correct: boolean;
  reactionTimeMs: number;
  timestamp: string;
}