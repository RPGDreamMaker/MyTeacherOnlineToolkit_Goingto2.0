import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface GridSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: { rows: number; cols: number };
  onSave: (settings: { rows: number; cols: number }) => void;
}

export default function GridSettingsModal({
  isOpen,
  onClose,
  currentSettings,
  onSave,
}: GridSettingsModalProps) {
  const [rows, setRows] = useState(currentSettings.rows);
  const [cols, setCols] = useState(currentSettings.cols);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (rows < 1 || cols < 1) {
      setError('Rows and columns must be at least 1');
      return;
    }

    if (rows > 20 || cols > 20) {
      setError('Maximum size is 20x20');
      return;
    }

    onSave({ rows, cols });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="modal-title">Grid Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="rows" className="form-label">
              Number of Rows
            </label>
            <input
              type="number"
              id="rows"
              min="1"
              max="20"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 1)}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="cols" className="form-label">
              Number of Columns
            </label>
            <input
              type="number"
              id="cols"
              min="1"
              max="20"
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value) || 1)}
              className="form-input"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

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
              className="flex items-center gap-2 btn-primary"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}