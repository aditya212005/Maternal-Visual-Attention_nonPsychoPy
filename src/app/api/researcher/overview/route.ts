import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/server/database";

export const runtime = "nodejs";

export function GET() {
  try {
    return NextResponse.json(getDashboardData());
  } catch (error) {
    console.error("Researcher overview failed", error);
    return NextResponse.json({ error: "Dashboard data could not be loaded." }, { status: 500 });
  }
}