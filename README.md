# Good Vibes Google Imagen 3 & Gemini API Starter Template ✨

[![X Follow](https://img.shields.io/twitter/follow/jarimh1984?style=social)](https://x.com/jarimh1984)

Welcome to this starter template for building awesome image generation applications using Google's powerful Imagen 3 and Gemini Flash APIs! This project provides a solid foundation to quickly prototype and develop your own creative Image Generation tool. It's built with Next.js 15, making it fast, modern, and fun to work with. Let's create something amazing!

## Features 🚀

- **Image Generation with Imagen 3:** Generate high-quality images from text prompts using Google's cutting-edge Imagen 3 model.
- **Prompt Enhancement with Gemini:** Leverage the Gemini Flash API to intelligently improve your prompts, resulting in more detailed and creative images.
- **Style Selection:** Choose from a curated list of artistic styles (photography, traditional art, digital art, abstract, and more!) to guide the image generation.
- **Aspect Ratio Control:** Select different aspect ratios (1:1, 3:4, 4:3, 9:16, 16:9) for your generated images.
- **Image History & Management:** View a history of your generated images. Delete images you no longer need.
- **Responsive Design:** Works beautifully on all screen sizes.
- **Dark/Light Mode:** Adapts to your system's color scheme preference (thanks to the `globals.css` setup).
- **Interactive Image Modal:** Click on generated images to view them in a full-screen modal with details.
- **User-Friendly UI:** A clean and intuitive interface built with Tailwind CSS.
- **Local Storage:** Your generated images are saved in your browser's local storage, so they persist between sessions.
- **Error Handling:** Robust error handling throughout the application and API routes.
- **Code Quality:** Well-structured, commented, and type-safe code (TypeScript) for easy understanding and modification.
- **Prompt Suggestion:** Get help to improve prompts using Gemini API.

## Getting Started 🌟

### Prerequisites

1.  **Node.js and npm:** Make sure you have Node.js (version 18 or later) and npm (or yarn/pnpm) installed. You can download them from [nodejs.org](https://nodejs.org/).
2.  **API Key:**
    **Gemini API Key:** Get your Gemini API key from Google AI Studio ([https://ai.google.dev/](https://ai.google.dev/)). It's refered as `GOOGLE_AI_API_KEY` in the project.
    Imagen 3 Requires Paid Billing Activated in Google Cloud Console.

### Installation

1.  **Clone the repository:**

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of your project and add your API keys:

    ```
    GOOGLE_AI_API_KEY=your_imagen_api_key
    ```

    **Important:** Replace `your_imagen_api_key` with your actual API keys. _Do not_ commit your `.env.local` file to version control (it's already in `.gitignore`).

### Running the Application

1.  **Start the development server:**

    ```bash
    npm run dev
    ```

2.  **Open your browser:** The application will be running at `http://localhost:3000`.

## Usage 🎨

1.  **Enter a Prompt:** Describe the image you want to generate in the text input field. Be as descriptive as possible for the best results!
2.  **Select a Style:** Choose a style from the provided options. This helps guide Imagen 3 to create an image in the desired aesthetic.
3.  **Choose Aspect Ratio**: Choose aspect ratio from pre defined options.
4.  **Get Prompt Suggestion (Optional):** Click the "Suggest" button to use the Gemini API to enhance your prompt. You can accept or dismiss the suggestion.
5.  **Generate Image:** Click the "Generate Image" button. The generated image will appear in the image grid below.
6.  **View Images:** Click on any generated image to see it in a larger modal, along with its prompt and creation details.
7.  **Delete Images:** Click the trash can icon on an image to delete it. You'll be asked to confirm the deletion.

## Project Structure 📁

```
imagenstarter/
├── src/
│   ├── app/
│   │   ├── api/                   # API routes
│   │   │   ├── delete-imagen-image/ # Deletes an image
│   │   │   │   └── route.ts
│   │   │   ├── imagen-generate/    # Generates images using Imagen 3
│   │   │   │   └── route.ts
│   │   │   ├── list-imagen-images/ # Lists generated images
│   │   │   │   └── route.ts
│   │   │   └── prompt-suggestion/  # Generates prompt suggestions with Gemini
│   │   │       └── route.ts
│   │   ├── components/            # React components
│   │   │   ├── DeleteConfirmationModal.tsx # Confirmation modal for image deletion
│   │   │   ├── ImageModal.tsx       # Modal for displaying images
│   │   │   └── NavBar.tsx           # Navigation bar
│   │   ├── imagen/                # /imagen route (currently empty, for future use)
│   │   │    └── page.tsx
│   │   ├── page.tsx              # Main page (/)
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles (Tailwind CSS)
│    └── utils/                 # Utility file
│        └── imageUtils.ts        # Utility functions
├── public/
│   └── generated/              # Directory where generated images are saved
├── .env.local                  # Environment variables (API keys - *NOT* committed)
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## Key Files Explained 🔑

- **`src/app/page.tsx`:** The main page of the application. Handles user input, style selection, image generation, and display. This is where the core logic for interacting with the APIs resides.
- **`src/app/api/imagen-generate/route.ts`:** The API route that handles image generation requests. It interacts with the Google Imagen 3 API. Includes error handling and image saving.
- **`src/app/api/prompt-suggestion/route.ts`:** The API route that handles prompt enhancement requests using the Gemini API.
- **`src/app/api/list-imagen-images/route.ts`:** The API route for listing generated images from public/generated.
- **`src/app/api/delete-imagen-image/route.ts`:** API for deleting images, used in the main `page.tsx`
- **`src/app/components/ImageModal.tsx`:** A reusable component that displays an image in a full-screen modal.
- **`src/app/components/NavBar.tsx`:** The navigation bar.
- **`src/app/globals.css`:** Contains global styles, including Tailwind CSS directives and custom CSS for dark/light mode, scrollbars, and component styles.
- **`src/app/utils/imageUtils.ts`:** Provides helper functions like downloading image, saving, and generating name.
- **`src/app/layout.tsx`:** Sets up the basic HTML structure and includes the global CSS. Also defines metadata for the application.

## API Routes 🛣️

- **`/api/imagen-generate` (POST):**
  - **Request Body:**
    ```json
    {
      "prompt": "A majestic lion sitting on a rock in the savanna.",
      "styles": ["photo-realistic"],
      "aspectRatio": "16:9"
    }
    ```
  - **Response (Success):**
    ```json
    {
      "url": "/generated/imagen-a-majestic-lion-sitting-on-a-rock-1678886400000.png"
    }
    ```
  - **Response (Error):**
    ```json
    {
      "error": "Failed to generate image"
    }
    ```
- **`/api/prompt-suggestion` (POST):**
  - **Request Body:**
    ```json
    {
      "prompt": "cat",
      "styles": ["photo-realistic"]
    }
    ```
  - **Response (Success):**
    ```json
    {
      "suggestion": "A fluffy Persian cat with piercing blue eyes, sitting gracefully on a velvet cushion in a sunlit room, captured in a close-up, photorealistic style with soft, natural lighting, 8K resolution."
    }
    ```
  - **Response (Error):**
    ```json
    {
      "error": "Failed to generate prompt suggestion"
    }
    ```
- **/api/list-imagen-images** (GET): Lists all images with pre-fix imagen from public/generated
- **/api/delete-imagen-image** (POST): Deletes images from `public/generated` folder.

## Contributing 🤝

Contributions are welcome! If you have ideas for improvements, bug fixes, or new features, feel free to open an issue or submit a pull request.

## Created By

Jari Huomo ([@jarimh1984](https://x.com/jarimh1984) on X)

## License

This project is open-source and available under the [MIT License](LICENSE)
