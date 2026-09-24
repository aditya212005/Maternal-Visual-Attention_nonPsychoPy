import { NextResponse } from "next/server";
import { getResearcherParticipants } from "@/lib/server/database";

export const runtime = "nodejs";

export function GET() {
  try {
    return NextResponse.json({ participants: getResearcherParticipants() });
  } catch (error) {
    console.error("Researcher participants failed", error);
    return NextResponse.json({ error: "Participants could not be loaded." }, { status: 500 });
  }
}