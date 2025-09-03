import { useState, FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { LearningWheel } from '../types/learningWheel';

interface EditWheelBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  wheel: LearningWheel | null;
  onSave: (name: string, description?: string, slices?: Array<{ name: string; url: string }>) => void;
}

export default function EditWheelBulkModal({
  isOpen,
  onClose,
  wheel,
  onSave,
}: EditWheelBulkModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slicesInput, setSlicesInput] = useState('');
  const [defaultUrl, setDefaultUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (wheel) {
      setName(wheel.name);
      setDescription(wheel.description || '');
      
      // Convert existing slices to text format
      const slicesText = wheel.slices.map(slice => {
        // If the slice has a URL, format as "name - url"
        if (slice.url && slice.url.trim()) {
          return `${slice.name} - ${slice.url}`;
        } else {
          return slice.name;
        }
      }).join('\n');
      
      setSlicesInput(slicesText);
      setDefaultUrl('');
    }
  }, [wheel]);

  if (!isOpen || !wheel) return null;

  function parseSlices(input: string, defaultUrl: string): Array<{ name: string; url: string }> {
    if (!input.trim()) return [];
    
    return input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Check if line contains " - " for name - url format
        if (line.includes(' - ')) {
          const [sliceName, sliceUrl] = line.split(' - ', 2);
          return {
            name: sliceName.trim(),
            url: sliceUrl.trim() || defaultUrl
          };
        } else {
          // Just a name, use default URL
          return {
            name: line.trim(),
            url: defaultUrl
          };
        }
      });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const slices = parseSlices(slicesInput, defaultUrl);
      await onSave(name.trim(), description.trim() || undefined, slices);
      onClose();
    } catch (err) {
      console.error('Failed to update learning wheel:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="modal-title">Edit Learning Wheel</h2>
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
              Wheel Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="e.g., Grammar Topics"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="form-input"
              placeholder="Add a description for your learning wheel"
            />
          </div>

          <div>
            <label htmlFor="defaultUrl" className="form-label">
              Default URL (Optional)
            </label>
            <input
              type="url"
              id="defaultUrl"
              value={defaultUrl}
              onChange={(e) => setDefaultUrl(e.target.value)}
              className="form-input"
              placeholder="https://example.com (used for slices without specific URLs)"
            />
          </div>

          <div>
            <label htmlFor="slicesInput" className="form-label">
              Slices
            </label>
            <textarea
              id="slicesInput"
              value={slicesInput}
              onChange={(e) => setSlicesInput(e.target.value)}
              rows={12}
              className="form-input"
              placeholder="Present Perfect&#10;Past Simple&#10;Future Tense&#10;Conditionals - https://example.com/conditionals&#10;Modal Verbs&#10;Passive Voice"
            />
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 text-sm mb-1">Input Format:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• <strong>Simple:</strong> Just the slice name (e.g., "Present Perfect")</li>
                <li>• <strong>With URL:</strong> Name - URL (e.g., "Conditionals - https://example.com")</li>
                <li>• One slice per line</li>
                <li>• Slices without URLs will use the default URL above</li>
                <li>• <strong>Note:</strong> Editing will replace all existing slices</li>
              </ul>
            </div>
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