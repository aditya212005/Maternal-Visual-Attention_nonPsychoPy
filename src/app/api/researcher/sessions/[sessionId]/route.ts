import { NextResponse } from "next/server";
import { getResearcherSession } from "@/lib/server/database";
import { parsePositiveInteger } from "@/lib/server/validation";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId: sessionIdParam } = await params;
  const sessionId = parsePositiveInteger(Number(sessionIdParam));
  if (!sessionId) {
    return NextResponse.json({ error: "Invalid session ID." }, { status: 400 });
  }
  try {
    const data = getResearcherSession(sessionId);
    return data ? NextResponse.json(data) : NextResponse.json({ error: "Session not found." }, { status: 404 });
  } catch (error) {
    console.error("Researcher session detail failed", error);
    return NextResponse.json({ error: "Session data could not be loaded." }, { status: 500 });
  }
}