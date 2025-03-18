'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface StyleTag {
  id: string;
  name: string;
  category: string;
}

interface BatchProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  aspectRatio: string;
  styleTags: StyleTag[];
  onComplete: (results: BatchResult[]) => void;
}

interface BatchResult {
  styleId: string;
  imageUrl: string;
  improvedPrompt: string;
  iterationId?: number;
  error?: string;
}

export default function BatchProcessingModal({
  isOpen,
  onClose,
  prompt,
  aspectRatio,
  styleTags,
  onComplete,
}: BatchProcessingModalProps) {
  const [results, setResults] = useState<BatchResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentStyleIndex, setCurrentStyleIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [iterations, setIterations] = useState<number>(1); // New state for iterations

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setResults([]);
      setProcessing(false);
      setCurrentStyleIndex(-1);
      setError(null);
      setProcessedCount(0);
      setIterations(1); // Reset iterations to 1
      // Default to select all styles
      setSelectedStyles(styleTags.map(tag => tag.id));
    }
  }, [isOpen, styleTags]);

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId)
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const toggleAllStyles = () => {
    if (selectedStyles.length === styleTags.length) {
      setSelectedStyles([]);
    } else {
      setSelectedStyles(styleTags.map(tag => tag.id));
    }
  };

  const startProcessing = async () => {
    if (selectedStyles.length === 0) {
      setError("Please select at least one style");
      return;
    }
    
    // Calculate total images for validation
    const totalImages = selectedStyles.length * iterations;
    if (totalImages > 75) {
      setError("Maximum limit is 75 total images. Please reduce styles or iterations.");
      return;
    }
    
    setProcessing(true);
    setResults([]);
    setError(null);
    setProcessedCount(0);

    try {
      const response = await fetch('/api/batch-imagen-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          styles: selectedStyles,
          aspectRatio,
          iterations, // Add iterations parameter
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results);
      onComplete(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during batch processing');
    } finally {
      setProcessing(false);
    }
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold">Batch Process Images</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Prompt display */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Base Prompt:</h3>
            <div className="p-3 bg-black/20 rounded-lg border border-white/10">
              {prompt}
            </div>
          </div>

          {/* Style selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Select Styles:</h3>
              <button
                onClick={toggleAllStyles}
                className="text-sm px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {selectedStyles.length === styleTags.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {styleTags.map((style) => (
                <button
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    selectedStyles.includes(style.id)
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Iterations setting - NEW */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Iterations per Style:</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIterations(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                disabled={iterations <= 1}
              >
                -
              </button>
              <span className="text-xl font-medium">{iterations}</span>
              <button 
                onClick={() => setIterations(prev => Math.min(25, prev + 1))}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                +
              </button>
              <span className="text-sm text-white/60 ml-2">
                Total images: {selectedStyles.length * iterations}
              </span>
            </div>
          </div>

          {/* Processing controls */}
          <div className="mb-6">
            <button
              onClick={startProcessing}
              disabled={processing || selectedStyles.length === 0}
              className="generate-button"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing styles...
                </span>
              ) : (
                `Process ${selectedStyles.length * iterations} Image${selectedStyles.length * iterations !== 1 ? 's' : ''}`
              )}
            </button>
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Results:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {results.map((result, index) => (
                  <div key={index} className="card-container p-4">
                    {result.error ? (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                        Error: {result.error}
                      </div>
                    ) : (
                      <>
                        <div className="mb-3 relative aspect-square">
                          <Image
                            src={result.imageUrl}
                            alt={result.improvedPrompt}
                            fill
                            className="object-cover rounded-lg"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <h4 className="font-medium mb-2">
                          {styleTags.find(tag => tag.id === result.styleId)?.name || result.styleId}
                          {result.iterationId && result.iterationId > 1 ? ` (Variation ${result.iterationId})` : ''}
                        </h4>
                        <p className="text-sm text-white/70 line-clamp-3">{result.improvedPrompt}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
