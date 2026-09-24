import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/server/database";
import { parsePositiveInteger, validateTrialResult } from "@/lib/server/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { sessionId?: unknown; trial?: unknown };
    const sessionId = parsePositiveInteger(body.sessionId);
    if (!sessionId || !validateTrialResult(body.trial)) {
      return NextResponse.json({ error: "Invalid session or trial data." }, { status: 400 });
    }
    const trial = body.trial;

    const database = getDatabase();
    const session = database.prepare(`
      SELECT sessions.id, sessions.status, participants.participant_id AS participantId
      FROM sessions
      JOIN participants ON participants.id = sessions.participant_id
      WHERE sessions.id = ?
    `).get(sessionId) as { id: number; status: string; participantId: string } | undefined;
    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }
    if (session.status !== "in_progress") {
      return NextResponse.json({ error: "Trials cannot be added to a completed session." }, { status: 409 });
    }
    if (trial.participantId !== session.participantId) {
      return NextResponse.json({ error: "Trial participant does not match the session." }, { status: 400 });
    }
    const expectedKey = trial.dotPosition === "LEFT" ? "Q" : "O";
    if (trial.expectedKey !== expectedKey || trial.correct !== (trial.responseKey === trial.expectedKey)) {
      return NextResponse.json({ error: "Trial response fields are inconsistent." }, { status: 400 });
    }

    const result = database.prepare(`
      INSERT INTO trials (
        session_id, trial_number, baby_image, adult_image, adult_gender,
        baby_position, adult_position, dot_position, expected_key, response_key,
        correct, reaction_time_ms, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId, trial.trialNumber, trial.babyImage, trial.adultImage, trial.adultGender,
      trial.babyPosition, trial.adultPosition, trial.dotPosition, trial.expectedKey,
      trial.responseKey, trial.correct ? 1 : 0, Math.round(trial.reactionTimeMs), trial.timestamp,
    );
    return NextResponse.json({ success: true, trialId: Number(result.lastInsertRowid) }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed: trials.session_id, trials.trial_number")) {
      return NextResponse.json({ error: "This trial has already been saved." }, { status: 409 });
    }
    console.error("Trial save failed", error);
    return NextResponse.json({ error: "The trial could not be saved." }, { status: 500 });
  }
}