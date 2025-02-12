import { NextResponse } from "next/server";
import axios from "axios";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";

// Types for the API request and response
interface ImagenRequest {
  prompt: string;
  styles: string[];
  aspectRatio: string; // Added aspectRatio to the request interface
}

interface ApiResponse {
  predictions: Array<{ bytesBase64Encoded: string }>;
}

// Configure API settings
const IMAGEN_API_KEY = process.env.GOOGLE_AI_API_KEY;
const IMAGEN_MODEL = "models/imagen-3.0-generate-002";
const API_VERSION = "v1beta";
const BASE_URL = "https://generativelanguage.googleapis.com";

// Supported aspect ratios - should match frontend options
const SUPPORTED_ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"];

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!IMAGEN_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    // Parse request body
    const { prompt, styles, aspectRatio }: ImagenRequest = await request.json();

    // Validate request parameters
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    if (!styles || styles.length === 0) {
      return NextResponse.json(
        { error: "Styles are required" },
        { status: 400 }
      );
    }

    // Validate aspectRatio
    if (!aspectRatio || !SUPPORTED_ASPECT_RATIOS.includes(aspectRatio)) {
      return NextResponse.json(
        { error: "Invalid or missing aspectRatio parameter" },
        { status: 400 }
      );
    }

    // Combine prompt with selected styles
    const enhancedPrompt = `${prompt} - Style: ${styles.join(", ")}`;

    // Configure API request
    const url = `${BASE_URL}/${API_VERSION}/${IMAGEN_MODEL}:predict`;
    const headers = {
      "Content-Type": "application/json",
      "x-goog-api-key": IMAGEN_API_KEY,
      "user-agent": "Starter Kit",
      "x-goog-api-client": "Starter Kit",
    };

    const data = {
      instances: {
        prompt: enhancedPrompt,
      },
      parameters: {
        sampleCount: 1, // Generate one image per style
        aspectRatio: aspectRatio, // Pass the aspect ratio directly as a string
      },
    };

    // Debug logs
    console.log("Request data:", JSON.stringify(data, null, 2));
    console.log("Aspect ratio being sent:", aspectRatio);

    // Make request to Imagen API
    const response = await axios.post<ApiResponse>(url, data, {
      headers,
    });

    // Validate response
    if (response.status !== 200) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseData: ApiResponse = response.data;

    if (!responseData?.predictions?.[0]?.bytesBase64Encoded) {
      throw new Error("No image data in response");
    }

    // Process the image data
    const imageBuffer = Buffer.from(
      responseData.predictions[0].bytesBase64Encoded,
      "base64"
    );

    // Create directory for generated images if it doesn't exist
    const publicDir = path.join(process.cwd(), "public", "generated");
    await mkdir(publicDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedPrompt = prompt
      .slice(0, 30)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const filename = `imagen-${sanitizedPrompt}-${timestamp}.png`;
    const filepath = path.join(publicDir, filename);

    // Save the image
    await writeFile(filepath, imageBuffer);

    // Return the public URL
    return NextResponse.json({ url: `/generated/${filename}` });
  } catch (error) {
    // Type guard for axios errors
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    // For other types of errors
    if (error instanceof Error) {
      console.error("Error generating image:", error.message);
    } else {
      console.error("Unknown error:", error);
    }

    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}

// Configure the maximum duration for the API route
export const maxDuration = 300; // 5 minutes

// Configure the maximum request size
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
