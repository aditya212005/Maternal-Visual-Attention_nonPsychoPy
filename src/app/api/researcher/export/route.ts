import { NextResponse } from "next/server";
import { createTrialsCsv } from "@/lib/server/csv";
import { getResearcherSession, getTrialsCsvRows } from "@/lib/server/database";
import { parsePositiveInteger } from "@/lib/server/validation";

export const runtime = "nodejs";

export function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawSessionId = url.searchParams.get("sessionId");
    let sessionId: number | undefined;
    if (rawSessionId !== null) {
      const parsedSessionId = parsePositiveInteger(Number(rawSessionId));
      if (!parsedSessionId) {
        return NextResponse.json({ error: "Invalid session ID." }, { status: 400 });
      }
      sessionId = parsedSessionId;
    }
    if (sessionId !== undefined && !getResearcherSession(sessionId)) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }
    const trials = getTrialsCsvRows(sessionId);
    if (!trials) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }
    const filename = sessionId === undefined ? "research_trials_all.csv" : `research_session_${sessionId}.csv`;
    return new NextResponse(createTrialsCsv(trials), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Researcher CSV export failed", error);
    return NextResponse.json({ error: "CSV export could not be generated." }, { status: 500 });
  }
}