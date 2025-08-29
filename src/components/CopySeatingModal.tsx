import { useState } from 'react';
import { X, Copy } from 'lucide-react';

interface SeatingPlan {
  id: string;
  name: string;
  description: string;
}

interface CopySeatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SeatingPlan[];
  currentPlanId: string;
  onCopy: (sourcePlanId: string, newPlanName: string, newPlanDescription: string, resetScores: boolean) => void;
}

export default function CopySeatingModal({
  isOpen,
  onClose,
  plans,
  currentPlanId,
  onCopy,
}: CopySeatingModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [resetScores, setResetScores] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlanId || !newPlanName.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onCopy(selectedPlanId, newPlanName.trim(), newPlanDescription.trim(), resetScores);
      onClose();
    } catch (err) {
      console.error('Failed to copy seating plan:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="modal-title">Copy Seating Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="form-label mb-1">
              Copy From
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="form-input"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="newPlanName" className="form-label">
              New Plan Name
            </label>
            <input
              type="text"
              id="newPlanName"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              className="form-input"
              placeholder="e.g., Term 2 Seating"
              required
            />
          </div>

          <div>
            <label htmlFor="newPlanDescription" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="newPlanDescription"
              value={newPlanDescription}
              onChange={(e) => setNewPlanDescription(e.target.value)}
              rows={3}
              className="form-input"
              placeholder="Add a description for your new seating plan"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="resetScores"
              checked={resetScores}
              onChange={(e) => setResetScores(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="resetScores" className="ml-2 block text-sm text-gray-700">
              Reset all scores to 0 in the new plan
            </label>
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
              disabled={isLoading || !newPlanName.trim()}
              className="flex items-center gap-2 btn-primary disabled:opacity-50"
            >
              <Copy className="h-4 w-4" />
              {isLoading ? 'Copying...' : 'Copy Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}