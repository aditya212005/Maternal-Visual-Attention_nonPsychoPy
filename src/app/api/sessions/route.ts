import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/server/database";
import { validateParticipantId } from "@/lib/server/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { participantId?: unknown };
    const participantId = validateParticipantId(body.participantId);
    if (!participantId) {
      return NextResponse.json({ error: "A valid participant ID is required." }, { status: 400 });
    }

    const database = getDatabase();
    const now = new Date().toISOString();
    const transaction = database.transaction(() => {
      database.prepare("INSERT OR IGNORE INTO participants (participant_id, created_at) VALUES (?, ?)").run(participantId, now);
      const participant = database.prepare("SELECT id FROM participants WHERE participant_id = ?").get(participantId) as { id: number };
      const session = database.prepare("INSERT INTO sessions (participant_id, started_at, status) VALUES (?, ?, 'in_progress')").run(participant.id, now);
      return Number(session.lastInsertRowid);
    });

    return NextResponse.json({ sessionId: transaction() }, { status: 201 });
  } catch (error) {
    console.error("Session creation failed", error);
    return NextResponse.json({ error: "The session could not be started." }, { status: 500 });
  }
}