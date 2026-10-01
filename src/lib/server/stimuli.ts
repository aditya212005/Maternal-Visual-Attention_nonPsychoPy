import fs from "node:fs/promises";
import path from "node:path";
import type { StimulusDataset } from "@/lib/experiment/types";

const IMAGE_EXTENSION = /\.(jpe?g|png|webp)$/i;

async function getImagePaths(directory: string, publicDirectory: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && IMAGE_EXTENSION.test(entry.name))
      .map((entry) => `/${path.relative(publicDirectory, path.join(directory, entry.name)).split(path.sep).map(encodeURIComponent).join("/")}`)
      .sort((left, right) => left.localeCompare(right));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function getStimulusDataset(): Promise<StimulusDataset> {
  const publicDirectory = path.join(process.cwd(), "public");
  const stimuliDirectory = path.join(publicDirectory, "stimuli");
  const [adults, babies] = await Promise.all([
    getImagePaths(path.join(stimuliDirectory, "adults"), publicDirectory),
    getImagePaths(path.join(stimuliDirectory, "babies"), publicDirectory),
  ]);

  return { adults, babies };
}