import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';

interface CreateSliceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, url: string) => void;
}

export default function CreateSliceModal({
  isOpen,
  onClose,
  onSave,
}: CreateSliceModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSave(name.trim(), url.trim());
      setName('');
      setUrl('');
      onClose();
    } catch (err) {
      console.error('Failed to create slice:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="modal-title">Add New Slice</h2>
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
              placeholder="e.g., Present Perfect"
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
              placeholder="https://example.com"
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
              {isLoading ? 'Adding...' : 'Add Slice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}