'use client'
import React from 'react';
import Image from 'next/image';

interface ImageData {
  url: string;
  prompt: string;
  aspectRatio: string;
  styles: string[];
  timestamp: string;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageData | null; 
  styleTagsMap: { [key: string]: string };
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, image, styleTagsMap }) => {
  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-5xl aspect-square" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        {/* Image */}
        <div className="relative w-full h-full">
          <Image src={image.url} alt={image.prompt} fill className="object-contain" sizes="(max-width: 1024px) 100vw, 1024px" priority />
        </div>
        {/* Image info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
          <p className="text-white/90 text-lg mb-2">{image.prompt}</p>
          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <span>Aspect Ratio: <span className="font-medium">{image.aspectRatio}</span></span>
            <span>Styles: <span className="font-medium">{image.styles.map((styleId: string) => styleTagsMap[styleId]).join(', ')}</span></span>
            <span>Created: <span className="font-medium">{image.timestamp}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
