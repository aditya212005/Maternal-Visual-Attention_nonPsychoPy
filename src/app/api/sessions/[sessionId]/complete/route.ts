import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/server/database";
import { parsePositiveInteger } from "@/lib/server/validation";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId: sessionIdParam } = await params;
  const sessionId = parsePositiveInteger(Number(sessionIdParam));
  if (!sessionId) {
    return NextResponse.json({ error: "Invalid session ID." }, { status: 400 });
  }

  try {
    const result = getDatabase().prepare(
      "UPDATE sessions SET status = 'completed', completed_at = ? WHERE id = ? AND status = 'in_progress'",
    ).run(new Date().toISOString(), sessionId);
    if (result.changes === 0) {
      const session = getDatabase().prepare("SELECT id, status FROM sessions WHERE id = ?").get(sessionId) as { id: number; status: string } | undefined;
      if (!session) {
        return NextResponse.json({ error: "Session not found." }, { status: 404 });
      }
      if (session.status === "completed") {
        return NextResponse.json({ success: true, alreadyCompleted: true });
      }
      return NextResponse.json({ error: "Session could not be completed." }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session completion failed", error);
    return NextResponse.json({ error: "The session could not be completed." }, { status: 500 });
  }
}