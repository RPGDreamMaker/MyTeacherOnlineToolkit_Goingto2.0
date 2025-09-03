import { useState, FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { LearningSlice } from '../types/learningWheel';

interface EditSliceModalProps {
  isOpen: boolean;
  onClose: () => void;
  slice: LearningSlice | null;
  onSave: (updates: Partial<LearningSlice>) => void;
}

export default function EditSliceModal({
  isOpen,
  onClose,
  slice,
  onSave,
}: EditSliceModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (slice) {
      setName(slice.name);
      setUrl(slice.url);
    }
  }, [slice]);

  if (!isOpen || !slice) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSave({
        name: name.trim(),
        url: url.trim() || '',
      });
      onClose();
    } catch (err) {
      console.error('Failed to update slice:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="modal-title">Edit Slice</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="form-label">
              Slice Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="url" className="form-label">
              URL/Link
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}