import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_MODEL_NAME = "gemini-2.0-flash"; 
const MAX_PROMPT_LENGTH = 480;

// Simple function to estimate tokens (rough approximation)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4.5);
}

async function generatePromptSuggestion(
  prompt: string,
  styles: string[],
  promptMemory?: string[]
): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API key not configured.");
    return null;
  }

  // Check prompt length before processing
  if (estimateTokens(prompt) > MAX_PROMPT_LENGTH) {
    throw new Error("Prompt exceeds maximum length of 480 tokens");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL_NAME,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  const styleNames = styles
    .map((styleId) => {
      const styleTag = STYLE_TAGS.find((tag) => tag.id === styleId);
      return styleTag ? styleTag.name : styleId;
    })
    .join(", ");

  // Add previous prompts context if available
  let previousPromptsContext = "";
  if (promptMemory && promptMemory.length > 0) {
    previousPromptsContext = `
Previous prompts in this batch:
${promptMemory.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Based on the previous prompts above, create a DIFFERENT variation that maintains the core theme of "${prompt}" but explores a new aspect, perspective, or interpretation.
`;
  }

  console.log("previousPromptsContext", promptMemory);

  const enhancedPromptInstructions = `Please enhance the following image prompt to be more effective for Google Imagen 3.

${previousPromptsContext}

A good starting point can be to think of subject, context, and style.
  
To create a more compelling and visually rich image, focus on these aspects:

1. Subject Clarity and Detail:
    - Ensure the subject of the image is very clear and specific. Instead of vague terms, use precise nouns and descriptions.
    - Add details about the subject's appearance, pose, and any unique characteristics.

2. Context and Background Enrichment:
    - Describe a vivid and relevant background that complements the subject and style.
    - Consider the environment, setting, and atmosphere you want to create. Is it indoors or outdoors? What time of day is it? What's the mood?

3. Style Deep Dive (Crucial for Imagen 3):
    - For Photography Styles (like Realistic, Portrait, Landscape, Street, Macro):
        - Suggest photography-related modifiers from the guide. Think about:
            - Camera Proximity:  "close-up photo", "zoomed out photo", "aerial photo"
            - Camera Position: "from below", "eye-level view", "high-angle shot"
            - Lighting: "natural lighting", "dramatic lighting", "golden hour", "soft lighting", "studio lighting"
            - Camera Settings: "motion blur", "soft focus", "bokeh", "shallow depth of field", "long exposure"
            - Lens Types: "35mm lens", "50mm lens", "wide-angle lens", "macro lens", "fisheye lens"
            - Film Types: "black and white film", "polaroid photo", "vintage film"
            - Image Quality: "4K", "HDR", "Studio Photo", "photorealistic", "high resolution", "detailed"

    - For Art & Illustration Styles (like Watercolor, Oil, Digital Painting, Comic, Anime):
        - Consider historical art references and techniques relevant to the style.
        - If applicable, suggest artists or art movements (e.g., "in the style of Van Gogh", "impressionistic painting", "art deco poster").
        - Think about artistic mediums and techniques (e.g., "watercolor washes", "oil painting with thick brushstrokes", "vector art with clean lines").
        - Add quality modifiers like "detailed", "by a professional illustrator", "beautiful illustration".

    - For Abstract & Special Styles:
        - Encourage more conceptual descriptions.
        - For abstract styles, suggest focusing on shapes, colors, textures, and composition (e.g., "geometric shapes", "fluid colors", "minimalist composition").
        - For special styles (Vintage, Cyberpunk, Gothic, Surrealism etc.), emphasize elements that define these styles (e.g., "vintage aesthetic with aged textures", "cyberpunk cityscape with neon lights", "gothic architecture with dark atmosphere", "surreal scene with dreamlike qualities").
        
    - For Traditional Art Movements:
        - For Cubism: Consider fragmented perspectives, geometric forms, and multiple viewpoints.
        - For Ukiyo-e: Think about flat color planes, bold outlines, and themes of everyday life or landscapes.
        - For Renaissance: Suggest elements like classical themes, realistic human figures, perspective, and balanced composition.
        - For Impressionism: Focus on light effects, visible brushstrokes, and emphasis on movement and atmosphere.
        - For Expressionism: Exaggerate emotional impact, distortion, and intense colors.
        - For Pointillism: Describe tiny, distinct dots of color that form patterns or images.
        - For Art Nouveau: Include organic, flowing curves, ornamental elements, and natural forms.
        - For Baroque: Focus on dramatic lighting, rich colors, and dynamic movement.
        - For Romanticism: Emphasize emotion, nature, and the sublime.
        
    - For Special Modern Styles:
        - For Magical Realism: Blend realistic elements with fantastical or magical components.
        - For Avant-garde: Experiment with radical, experimental, or unconventional artistic approaches.
        - For Bauhaus: Use geometric forms, minimalist design, and functional aesthetics.
        - For Dada: Incorporate absurdity, irrationality, and rejection of traditional aesthetic standards.

4. Descriptive Language Expansion:
    - Use more descriptive adjectives and adverbs to enhance every aspect of the prompt.
    - Example: Instead of "a tree", suggest "a majestic willow tree with weeping branches".

Original Prompt: ${prompt}
User Selected Styles: ${styleNames}

Instructions for Output:
- Provide only the improved and enhanced prompt text.
- Ensure the improved prompt is ready to be directly used for image generation with Google Imagen 3.
- Do not include any extra explanations, conversational text, or introductions. Just the refined prompt.
`;

  try {
    const result = await model.generateContent(enhancedPromptInstructions);
    const responseText = result.response.text();
    return responseText;
  } catch (error) {
    console.error("Error generating prompt suggestion:", error);
    return null;
  }
}

const STYLE_TAGS = [
  // Photography styles
  {
    id: "photo-realistic",
    name: "Realistic Photography",
    category: "Photography",
  },
  {
    id: "photo-portrait",
    name: "Portrait Photography",
    category: "Photography",
  },
  {
    id: "photo-landscape",
    name: "Landscape Photography",
    category: "Photography",
  },
  { id: "photo-street", name: "Street Photography", category: "Photography" },
  { id: "photo-macro", name: "Macro Photography", category: "Photography" },
  // Traditional Art styles
  {
    id: "art-watercolor",
    name: "Watercolor Painting",
    category: "Traditional Art",
  },
  { id: "art-acrylic", name: "Acrylic Painting", category: "Traditional Art" },
  { id: "art-oil", name: "Oil Painting", category: "Traditional Art" },
  { id: "art-charcoal", name: "Charcoal Drawing", category: "Traditional Art" },
  { id: "art-pencil", name: "Pencil Sketch", category: "Traditional Art" },
  // Digital Art styles
  { id: "3d-model", name: "3D Model", category: "Digital Art" },
  { id: "digital-painting", name: "Digital Painting", category: "Digital Art" },
  { id: "pixel-art", name: "Pixel Art", category: "Digital Art" },
  { id: "vector-art", name: "Vector Art", category: "Digital Art" },
  { id: "concept-art", name: "Concept Art", category: "Digital Art" },
  // Abstract styles
  {
    id: "abstract-geometric",
    name: "Geometric Abstract",
    category: "Abstract",
  },
  { id: "abstract-fluid", name: "Fluid Abstract", category: "Abstract" },
  { id: "abstract-minimal", name: "Minimalist", category: "Abstract" },
  // Illustration styles
  { id: "illustration-comic", name: "Comic Style", category: "Illustration" },
  { id: "illustration-anime", name: "Anime Style", category: "Illustration" },
  {
    id: "illustration-children",
    name: "Children's Book",
    category: "Illustration",
  },
  // Special styles
  { id: "style-vintage", name: "Vintage", category: "Special" },
  { id: "style-noir", name: "Film Noir", category: "Special" },
  { id: "style-cyberpunk", name: "Cyberpunk", category: "Special" },
  { id: "style-steampunk", name: "Steampunk", category: "Special" },
  { id: "style-vaporwave", name: "Vaporwave", category: "Special" },
  { id: "style-pop-art", name: "Pop Art", category: "Special" },
  { id: "style-gothic", name: "Gothic", category: "Special" },
  { id: "style-surreal", name: "Surrealism", category: "Special" },
  // New Styles
  { id: 'style-pointillism', name: 'Pointillism', category: 'Traditional Art' },
  { id: 'style-expressionism', name: 'Expressionism', category: 'Traditional Art' },
  { id: 'style-impressionism', name: 'Impressionism', category: 'Traditional Art' },
  { id: 'style-dada', name: 'Dada', category: 'Abstract' },
  { id: 'style-abstract', name: 'Abstract', category: 'Abstract' },
  { id: 'style-renaissance', name: 'Renaissance', category: 'Traditional Art' },
  { id: 'style-art-nouveau', name: 'Art Nouveau', category: 'Traditional Art' },
  { id: 'style-magical-realism', name: 'Magical Realism', category: 'Special' },
  { id: 'style-romanticism', name: 'Romanticism', category: 'Traditional Art' },
  { id: 'style-ukiyo-e', name: 'Ukiyo-e', category: 'Traditional Art' },
  { id: 'style-baroque', name: 'Baroque', category: 'Traditional Art' },
  { id: 'style-avant-garde', name: 'Avant-garde', category: 'Special' },
  { id: 'style-cubism', name: 'Cubism', category: 'Abstract' },
  { id: 'style-bauhaus', name: 'Bauhaus', category: 'Design' },
];

export async function POST(request: Request) {
  try {
    const { prompt, styles, promptMemory } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Check prompt length
    if (estimateTokens(prompt) > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        {
          error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} tokens`,
        },
        { status: 400 }
      );
    }

    if (!styles || styles.length === 0) {
      return NextResponse.json(
        { error: "Styles are required for prompt suggestion" },
        { status: 400 }
      );
    }

    const suggestion = await generatePromptSuggestion(prompt, styles, promptMemory);

    if (!suggestion) {
      return NextResponse.json(
        { error: "Failed to generate prompt suggestion" },
        { status: 500 }
      );
    }

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Error in /api/prompt-suggestion:", error);
    return NextResponse.json(
      { error: "Internal server error during prompt suggestion" },
      { status: 500 }
    );
  }
}