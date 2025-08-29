import { useState } from 'react';
import { Plus, Minus, RotateCw, X } from 'lucide-react';
import { useSeatingStore } from '../store/seating';

interface PointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (points: number) => void;
  title: string;
  description: string;
  confirmLabel: string;
  quickActions?: number[];
  onQuickConfirm?: (points: number) => void;
}

function PointsModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  quickActions,
  onQuickConfirm,
}: PointsModalProps) {
  const [points, setPoints] = useState(0);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(points);
    onClose();
  }

  function handleQuickAction(quickPoints: number) {
    if (onQuickConfirm) {
      onQuickConfirm(quickPoints);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="modal-title">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {quickActions && quickActions.length > 0 && (
            <div>
              <label className="form-label mb-2">
                Quick Actions
              </label>
              <div className="grid grid-cols-5 gap-2">
                {quickActions.map((quickPoints) => (
                  <button
                    key={quickPoints}
                    type="button"
                    onClick={() => handleQuickAction(quickPoints)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      title.includes('Add') 
                        ? 'text-white bg-green-600 hover:bg-green-700' 
                        : 'text-white bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {title.includes('Add') ? '+' : '-'}{quickPoints}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label mb-1">
                {description}
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                className="form-input"
                placeholder="Enter custom amount"
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
                className="btn-primary"
              >
                {confirmLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PointsManipulation() {
  const [modalType, setModalType] = useState<'add' | 'subtract' | 'reset' | null>(null);
  const { getCurrentPlan, updateAllStudentScores, setAllStudentScores } = useSeatingStore();
  const currentPlan = getCurrentPlan();

  if (!currentPlan) return null;

  function handleConfirm(points: number) {
    switch (modalType) {
      case 'add':
        updateAllStudentScores(points);
        break;
      case 'subtract':
        updateAllStudentScores(-points);
        break;
      case 'reset':
        setAllStudentScores(points);
        break;
    }
  }

  function handleQuickConfirm(points: number) {
    switch (modalType) {
      case 'add':
        updateAllStudentScores(points);
        break;
      case 'subtract':
        updateAllStudentScores(-points);
        break;
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div className="flex items-center mb-4">
        <h3 className="section-heading">
          Points Manipulation
        </h3>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setModalType('add')}
          className="flex items-center justify-center gap-2 btn-success"
        >
          <Plus className="h-4 w-4" />
          Add Points to All
        </button>
        
        <button
          onClick={() => setModalType('subtract')}
          className="flex items-center justify-center gap-2 btn-danger"
        >
          <Minus className="h-4 w-4" />
          Subtract Points from All
        </button>
        
        <button
          onClick={() => setModalType('reset')}
          className="flex items-center justify-center gap-2 btn-secondary"
        >
          <RotateCw className="h-4 w-4" />
          Set Score for All
        </button>
      </div>

      <PointsModal
        isOpen={modalType === 'add'}
        onClose={() => setModalType(null)}
        onConfirm={handleConfirm}
        onQuickConfirm={handleQuickConfirm}
        title="Add Points to All Students"
        description="Or enter a custom amount:"
        confirmLabel="Add Points"
        quickActions={[1, 2, 3, 4, 5]}
      />

      <PointsModal
        isOpen={modalType === 'subtract'}
        onClose={() => setModalType(null)}
        onConfirm={handleConfirm}
        onQuickConfirm={handleQuickConfirm}
        title="Subtract Points from All Students"
        description="Or enter a custom amount:"
        confirmLabel="Subtract Points"
        quickActions={[1, 2, 3, 4, 5]}
      />

      <PointsModal
        isOpen={modalType === 'reset'}
        onClose={() => setModalType(null)}
        onConfirm={handleConfirm}
        title="Reset Points for All Students"
        description="What score would you like to set for all students?"
        confirmLabel="Set Points"
      />
    </div>
  );
}