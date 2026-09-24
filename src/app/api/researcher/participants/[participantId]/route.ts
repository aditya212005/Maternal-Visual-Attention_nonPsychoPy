import { NextResponse } from "next/server";
import { getResearcherParticipant } from "@/lib/server/database";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ participantId: string }> }) {
  const { participantId } = await params;
  if (!participantId.trim()) {
    return NextResponse.json({ error: "Invalid participant ID." }, { status: 400 });
  }
  try {
    const data = getResearcherParticipant(participantId);
    return data ? NextResponse.json(data) : NextResponse.json({ error: "Participant not found." }, { status: 404 });
  } catch (error) {
    console.error("Researcher participant detail failed", error);
    return NextResponse.json({ error: "Participant data could not be loaded." }, { status: 500 });
  }
}