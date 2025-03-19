import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST() {
  try {
    const publicDir = path.join(process.cwd(), "public", "generated");

    // Check if the directory exists
    try {
      await fs.access(publicDir);
    } catch {
      // If the directory doesn't exist, there's nothing to delete
      return NextResponse.json({ success: true });
    }

    // Read the directory contents
    const files = await fs.readdir(publicDir);

    // Filter for Imagen-generated images
    const imagenFiles = files.filter((filename) =>
      filename.startsWith("imagen-")
    );

    // Delete each Imagen image
    for (const filename of imagenFiles) {
      const filepath = path.join(publicDir, filename);
      await fs.unlink(filepath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting all images:", error);
    return NextResponse.json(
      { error: "Failed to delete all images" },
      { status: 500 }
    );
  }
}
