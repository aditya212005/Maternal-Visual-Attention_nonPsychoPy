import { NextResponse } from "next/server";
import { getStimulusDataset } from "@/lib/server/stimuli";

export const runtime = "nodejs";

export async function GET() {
  try {
    const dataset = await getStimulusDataset();
    const missingDatasets = [
      dataset.adults.length === 0 ? "adults" : null,
      dataset.babies.length === 0 ? "babies" : null,
    ].filter((name): name is string => name !== null);

    if (missingDatasets.length > 0) {
      const folders = missingDatasets.map((name) => `public/stimuli/${name}/`).join(" and ");
      return NextResponse.json(
        { error: `Experiment cannot start: no supported images were found in ${folders}. Add .jpg, .jpeg, .png, or .webp images and try again.` },
        { status: 422 },
      );
    }

    return NextResponse.json(dataset);
  } catch (error) {
    console.error("Stimulus dataset scan failed", error);
    return NextResponse.json({ error: "The stimulus folders could not be read." }, { status: 500 });
  }
}