import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public", "generated");

    // Check if the directory exists
    try {
      await fs.access(publicDir);
    } catch {
      // If the directory doesn't exist, return an empty array
      return NextResponse.json({ images: [] });
    }

    // Read the directory contents
    const files = await fs.readdir(publicDir);

    // Filter for Imagen-generated images and process each file
    const images = files
      .filter(filename => filename.startsWith('imagen-')) // Filter Imagen images
      .map((filename) => {
        // Extract information from filename (format: imagen-prompt-timestamp.png)
        const [prefix, promptPart, timestampPart] = filename.replace(".png", "").split("-");
        const prompt = promptPart.replace(/-/g, " ");
        const timestamp = timestampPart;

        return {
          id: timestamp,
          url: `/generated/${filename}`,
          prompt: prompt,
          timestamp: new Date(parseInt(timestamp)).toLocaleString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour12: false,
          }),
          styles: [], // You might want to extract styles from filename if you saved them there
        };
      });

    // Sort images by timestamp (newest first)
    images.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error listing Imagen images:", error);
    return NextResponse.json(
      { error: "Failed to list Imagen images" },
      { status: 500 }
    );
  }
}
