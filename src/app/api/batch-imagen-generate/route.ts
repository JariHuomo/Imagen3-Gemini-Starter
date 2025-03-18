import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Extract the prompt, styles, and iterations from the request
    const { prompt, styles, aspectRatio, iterations = 1 } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!styles || !Array.isArray(styles) || styles.length === 0) {
      return NextResponse.json(
        { error: "At least one style is required" },
        { status: 400 }
      );
    }

    // Validate and limit iterations
    const maxIterations = 10;
    const safeIterations = Math.min(
      Math.max(1, Number(iterations) || 1),
      maxIterations
    );

    // Calculate total images (styles × iterations)
    const totalImages = styles.length * safeIterations;
    if (totalImages > 30) {
      return NextResponse.json(
        {
          error: "Maximum limit is 30 total images. Please reduce styles or iterations.",
        },
        { status: 400 }
      );
    }

    // Initialize memory for previous prompts
    const promptMemory: string[] = [];
    
    // Process each style with the specified number of iterations
    const results = [];
    for (const style of styles) {
      try {
        // Generate multiple images for this style
        for (let i = 0; i < safeIterations; i++) {
          // Get a fresh improved prompt with memory context
          const suggestionResponse = await fetch(
            `${request.nextUrl.origin}/api/prompt-suggestion`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prompt,
                styles: [style],
                promptMemory,
              }),
            }
          );
          
          const suggestionData = await suggestionResponse.json();
          if (suggestionData.error) throw new Error(suggestionData.error);
          
          const improvedPrompt = suggestionData.suggestion;
          
          // Add to memory for future iterations
          promptMemory.push(improvedPrompt);
          
          // Generate image with the improved prompt
          const imageResponse = await fetch(
            `${request.nextUrl.origin}/api/imagen-generate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prompt: improvedPrompt,
                styles: [style],
                aspectRatio,
              }),
            }
          );
          
          const imageData = await imageResponse.json();
          if (imageData.error) throw new Error(imageData.error);
          
          // Add to results with iteration ID
          results.push({
            styleId: style,
            iterationId: i + 1,
            improvedPrompt: improvedPrompt,
            imageUrl: imageData.url,
          });
        }
      } catch (styleError) {
        console.error(`Error processing style ${style}:`, styleError);
        results.push({
          styleId: style,
          error: styleError instanceof Error ? styleError.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in batch imagen generate:", error);
    return NextResponse.json(
      { error: "Failed to process batch image generation" },
      { status: 500 }
    );
  }
}

// Configure the maximum duration for the API route - longer for batch processing
export const maxDuration = 600; // 10 minutes

// Configure the maximum request size
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};