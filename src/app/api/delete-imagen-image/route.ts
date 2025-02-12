import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Ensure the filename is from our generated directory
    if (!filename.startsWith("/generated/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const publicDir = path.join(process.cwd(), "public");
    const filepath = path.join(publicDir, filename);

    // Delete the file
    await fs.unlink(filepath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
