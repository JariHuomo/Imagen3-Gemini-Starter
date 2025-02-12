'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

import ImageModal from './components/ImageModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
// Define the style tags interface and array interface
interface StyleTag {
  id: string;
  name: string;
  category: string;
}

// Add localStorage key constant
const LOCAL_STORAGE_IMAGES_KEY = 'imagen_starter_generated_images';

const STYLE_TAGS: StyleTag[] = [
  // Photography styles
  { id: 'photo-realistic', name: 'Realistic Photography', category: 'Photography' },
  { id: 'photo-portrait', name: 'Portrait Photography', category: 'Photography' },
  { id: 'photo-landscape', name: 'Landscape Photography', category: 'Photography' },
  { id: 'photo-street', name: 'Street Photography', category: 'Photography' },
  { id: 'photo-macro', name: 'Macro Photography', category: 'Photography' },
  // Traditional Art styles
  { id: 'art-watercolor', name: 'Watercolor Painting', category: 'Traditional Art' },
  { id: 'art-acrylic', name: 'Acrylic Painting', category: 'Traditional Art' },
  { id: 'art-oil', name: 'Oil Painting', category: 'Traditional Art' },
  { id: 'art-charcoal', name: 'Charcoal Drawing', category: 'Traditional Art' },
  { id: 'art-pencil', name: 'Pencil Sketch', category: 'Traditional Art' },
  // Digital Art styles
  { id: '3d-model', name: '3D Model', category: 'Digital Art' },
  { id: 'digital-painting', name: 'Digital Painting', category: 'Digital Art' },
  { id: 'pixel-art', name: 'Pixel Art', category: 'Digital Art' },
  { id: 'vector-art', name: 'Vector Art', category: 'Digital Art' },
  { id: 'concept-art', name: 'Concept Art', category: 'Digital Art' },
  // Abstract styles
  { id: 'abstract-geometric', name: 'Geometric Abstract', category: 'Abstract' },
  { id: 'abstract-fluid', name: 'Fluid Abstract', category: 'Abstract' },
  { id: 'abstract-minimal', name: 'Minimalist', category: 'Abstract' },
  // Illustration styles
  { id: 'illustration-comic', name: 'Comic Style', category: 'Illustration' },
  { id: 'illustration-anime', name: 'Anime Style', category: 'Illustration' },
  { id: 'illustration-children', name: 'Children\'s Book', category: 'Illustration' },
  // Special styles
  { id: 'style-vintage', name: 'Vintage', category: 'Special' },
  { id: 'style-noir', name: 'Film Noir', category: 'Special' },
  { id: 'style-cyberpunk', name: 'Cyberpunk', category: 'Special' },
  { id: 'style-steampunk', name: 'Steampunk', category: 'Special' },
  { id: 'style-vaporwave', name: 'Vaporwave', category: 'Special' },
  { id: 'style-pop-art', name: 'Pop Art', category: 'Special' },
  { id: 'style-gothic', name: 'Gothic', category: 'Special' },
  { id: 'style-surreal', name: 'Surrealism', category: 'Special' },
];

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
  styles: string[];
  aspectRatio: string; // Add aspect ratio here
}

// Aspect Ratio Options
const ASPECT_RATIOS = [
  "1:1",
  "3:4",
  "4:3",
  "9:16",
  "16:9",
];

// Add this helper function at the top of the file, after the interfaces
const getAspectRatioClass = (aspectRatio: string): string => {
  switch (aspectRatio) {
    case '1:1':
      return 'aspect-square';
    case '3:4':
      return 'aspect-[3/4]';
    case '4:3':
      return 'aspect-[4/3]';
    case '9:16':
      return 'aspect-[9/16]';
    case '16:9':
      return 'aspect-[16/9]';
    default:
      return 'aspect-square'; // fallback to square if unknown ratio
  }
};

export default function ImagenTest() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [imageToDelete, setImageToDelete] = useState<GeneratedImage | null>(null);
  const [isSuggestingPrompt, setIsSuggestingPrompt] = useState(false);
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);

  // useEffect to load existing images on component mount
  useEffect(() => {
    const loadExistingImages = async () => {
      try {
        // First try to load from localStorage
        const storedImages = localStorage.getItem(LOCAL_STORAGE_IMAGES_KEY);
        if (storedImages) {
          const parsedImages = JSON.parse(storedImages) as GeneratedImage[];
          setImages(parsedImages);
          return; // If we have local data, no need to fetch from API
        }

        // If no localStorage data, fetch from API
        const response = await fetch('/api/list-imagen-images');
        const data = await response.json();
        if (data.images) {
          setImages(data.images);
          // Store the fetched images in localStorage
          localStorage.setItem(LOCAL_STORAGE_IMAGES_KEY, JSON.stringify(data.images));
        }
      } catch (error) {
        console.error('Error loading images:', error);
        setError('Failed to load existing images');
      }
    };
    loadExistingImages();
  }, []); // Empty dependency array to run only on mount

  const generateImages = async () => {
    if (!prompt || !selectedStyle) {
      setError('Please enter a prompt and select a style');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Sending request with aspect ratio:', aspectRatio);
      const response: Response = await fetch('/api/imagen-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          styles: [selectedStyle],
          aspectRatio
        })
      });

      const data = await response.json();
      console.log('Response from server:', data);

      if (data.error) throw new Error(data.error);

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.url,
        prompt,
        styles: [selectedStyle],
        timestamp: new Date().toLocaleString('en-GB'),
        aspectRatio
      };

      // Update state with new image
      const updatedImages = [newImage, ...images];
      setImages(updatedImages);

      // Save to localStorage
      localStorage.setItem(LOCAL_STORAGE_IMAGES_KEY, JSON.stringify(updatedImages));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = (styleId: string) => {
    setSelectedStyle(styleId === selectedStyle ? '' : styleId);
  };

  // New function to get prompt suggestion
  const handleGetPromptSuggestion = async () => {
    if (!prompt || !selectedStyle) {
      setError('Please enter a prompt and select a style to get a suggestion.');
      return;
    }

    setIsSuggestingPrompt(true);
    setError(null);
    setSuggestedPrompt(null); // Clear previous suggestion
    setIsSuggestionVisible(false); // Hide previous suggestion UI

    try {
      const response = await fetch('/api/prompt-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, styles: [selectedStyle] }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get prompt suggestion: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestedPrompt(data.suggestion);
      setIsSuggestionVisible(true); // Show suggestion UI

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prompt suggestion.');
      console.error("Error getting prompt suggestion:", err);
    } finally {
      setIsSuggestingPrompt(false);
    }
  };

  const acceptSuggestedPrompt = () => {
    setPrompt(suggestedPrompt || ""); // Use suggested prompt if available, otherwise empty string (shouldn't happen)
    setIsSuggestionVisible(false); // Hide suggestion UI
    setSuggestedPrompt(null); // Clear suggested prompt state
  };

  const dismissSuggestedPrompt = () => {
    setIsSuggestionVisible(false); // Simply hide the suggestion UI
    setSuggestedPrompt(null); // Clear suggested prompt state
  };

  // Create a map of style IDs to names for the modal
  const styleTagsMap = STYLE_TAGS.reduce((acc, tag) => ({ ...acc, [tag.id]: tag.name }), {});

  const handleDeleteImage = async (image: GeneratedImage, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal when clicking delete
    setImageToDelete(image); // Open delete confirmation modal
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;

    try {
      const response = await fetch('/api/delete-imagen-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: imageToDelete.url }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Remove the image from the state
      const updatedImages = images.filter(img => img.id !== imageToDelete.id);
      setImages(updatedImages);

      // Update localStorage
      localStorage.setItem(LOCAL_STORAGE_IMAGES_KEY, JSON.stringify(updatedImages));
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image');
    }
  };

  return (
    <main className="min-h-screen p-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-12 text-center relative animate-float">
          <span className="bg-gradient-to-r from-primary via-secondary to-accent1 text-transparent bg-clip-text animate-gradient bg-[length:200%_200%]">
            Google Imagen 3 API Starter Template
          </span>
        </h1>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto space-y-8 mb-12">
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 mb-2"> {/* Container for input and button */}
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your image..."
                className="input-field flex-grow" // flex-grow to take available space
              />
              <button
                onClick={handleGetPromptSuggestion}
                disabled={isSuggestingPrompt || !prompt || !selectedStyle}
                className="px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-accent1 hover:bg-accent2 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Get Prompt Suggestion" // Accessibility label
              >
                {isSuggestingPrompt ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </span>
                ) : (
                  'Suggest'
                )}
              </button>
            </div>

            {isSuggestionVisible && suggestedPrompt && (
              <div className="p-4 rounded-xl bg-white/10 border border-white/20 mt-4">
                <p className="text-white/90 mb-3">💡 <strong>Suggestion:</strong></p>
                <p className="text-white/70 mb-4">{suggestedPrompt}</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={acceptSuggestedPrompt}
                    className="px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-primary hover:bg-secondary text-white font-bold"
                  >
                    Accept
                  </button>
                  <button
                    onClick={dismissSuggestedPrompt}
                    className="px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-gray-700 hover:bg-gray-600 text-white font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Aspect Ratio Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90"> Select Aspect Ratio: </h3>
              <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="select-field flex-1" >
                {ASPECT_RATIOS.map((ratio) => (
                  <option key={ratio} value={ratio}>
                    {ratio}
                  </option>
                ))}
              </select>
            </div>

            {/* Style Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90">Select a Style:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {STYLE_TAGS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => selectStyle(style.id)}
                    className={`px-3 py-2 rounded-xl text-sm transition-all ${
                      selectedStyle === style.id
                        ? 'bg-primary text-white shadow-lg scale-105'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateImages}
              disabled={loading || !prompt || !selectedStyle}
              className="generate-button"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Image...
                </span>
              ) : (
                'Generate Image'
              )}
            </button>
          </div>
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
              {error}
            </div>
          )}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div className={`relative ${getAspectRatioClass(image.aspectRatio)}`}>
                <Image
                  src={image.url}
                  alt={image.prompt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {/* Download Button */}
                  <a
                    href={image.url}
                    download={`imagen-${image.id}.png`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-full bg-blue-500/80 hover:bg-blue-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                    aria-label="Download image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteImage(image, e)}
                    className="p-2 rounded-full bg-red-500/80 hover:bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                    aria-label="Delete image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-sm text-white/90 line-clamp-2 mb-2">{image.prompt}</p>
                <div className="flex flex-wrap gap-1">
                  {image.styles.map((styleId, index) => (
                    <span 
                      key={`${image.id}-${styleId}-${index}`} 
                      className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white/80"
                    >
                      {STYLE_TAGS.find((s) => s.id === styleId)?.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Image Modal */}
        <ImageModal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} image={selectedImage} styleTagsMap={styleTagsMap} />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={!!imageToDelete}
          onClose={() => setImageToDelete(null)}
          onConfirm={confirmDelete}
          imageName={imageToDelete?.prompt || ''}
        />

      </div>
    </main>
  );
}
