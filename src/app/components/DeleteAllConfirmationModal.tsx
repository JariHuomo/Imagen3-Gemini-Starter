import React from 'react';

interface DeleteAllConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteAllConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
}: DeleteAllConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl transform transition-all">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="text-center space-y-4">
                    {/* Warning Icon */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Delete All Images</h3>
                    <p className="text-white/70">
                        Are you sure you want to delete ALL generated images? This action cannot be undone.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 hover:border-white/20"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-red-500 hover:bg-red-600 text-white"
                    >
                        Delete All
                    </button>
                </div>
            </div>
        </div>
    );
} 