import { useState } from 'react';
import { X } from 'lucide-react';

interface AutomaticSeatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (options: { alphabetical: boolean; random: boolean }) => void;
}

export default function AutomaticSeatingModal({
  isOpen,
  onClose,
  onApply,
}: AutomaticSeatingModalProps) {
  const [alphabetical, setAlphabetical] = useState(false);
  const [random, setRandom] = useState(false);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!alphabetical && !random) return;
    onApply({ alphabetical, random });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="modal-title">Automatic Seating</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="alphabetical"
                checked={alphabetical}
                onChange={(e) => {
                  setAlphabetical(e.target.checked);
                  if (e.target.checked) setRandom(false);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="alphabetical" className="ml-2 block text-sm text-gray-700">
                Place students in alphabetical order
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="random"
                checked={random}
                onChange={(e) => {
                  setRandom(e.target.checked);
                  if (e.target.checked) setAlphabetical(false);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="random" className="ml-2 block text-sm text-gray-700">
                Place students randomly
              </label>
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
              disabled={!alphabetical && !random}
              className="btn-primary disabled:opacity-50"
            >
              Apply Seating
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}