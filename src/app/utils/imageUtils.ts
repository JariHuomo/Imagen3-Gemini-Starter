import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to download image");
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function saveImage(
  imageBuffer: Buffer,
  filename: string
): Promise<string> {
  const publicDir = path.join(process.cwd(), "public", "generated");
  // Create the generated directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const filepath = path.join(publicDir, filename);
  await writeFile(filepath, imageBuffer);
  // Return the public URL path
  return `/generated/${filename}`;
}

export function generateImageFilename(
  prompt: string,
  type: "original" | "upscaled"
): string {
  const timestamp = Date.now();
  const sanitizedPrompt = prompt
    .slice(0, 30)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
  return `${sanitizedPrompt}-${type}-${timestamp}.png`;
}
