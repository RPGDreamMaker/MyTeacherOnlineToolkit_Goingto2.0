import { ExternalLink } from 'lucide-react';
import { LearningSlice } from '../types/learningWheel';

interface SliceDetailsModalProps {
  slice: LearningSlice | null;
  onClose: () => void;
}

export default function SliceDetailsModal({ slice, onClose }: SliceDetailsModalProps) {
  if (!slice) return null;

  function handleGoToLink() {
    window.open(slice.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-12 flex flex-col items-center">
          <h2 className="modal-title text-center mb-2 mt-8">Here you go!</h2>
          <p className="text-4xl font-bold text-center text-blue-600 mb-6">{slice.name}</p>
          <div className="flex gap-3">
            {slice.url && slice.url.trim() && (
              <button
                onClick={handleGoToLink}
                className="flex items-center gap-2 btn-primary mb-4"
              >
                <ExternalLink className="h-4 w-4" />
                Go to Link
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-secondary mb-4"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}