import { useState } from 'react';
import { Users, Loader2, ArrowLeftRight, X, Plus, Minus, RotateCw } from 'lucide-react';
import { useSeatingStore } from '../store/seating';
import { useClassesStore } from '../store/classes';

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

export default function SelectionButtons() {
  const [isLoading, setIsLoading] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'subtract' | 'reset' | null>(null);
  const { getCurrentPlan, getCurrentScoreSet, getRandomStudents, getRandomStudentsFromSides, clearSelectedStudents, selectStudentsByScore, updateAllStudentScores, setAllStudentScores } = useSeatingStore();
  const currentPlan = getCurrentPlan();
  const currentScoreSet = getCurrentScoreSet();

  // Function to check if any students have a specific score
  function hasStudentsWithScore(targetScore: number | string): boolean {
    if (!currentPlan || !currentScoreSet) return false;
    
    const isStudentAbsent = useClassesStore.getState().isStudentAbsent;
    
    return currentPlan.seats.some(seat => {
      if (isStudentAbsent(currentPlan.classId, seat.studentId)) return false;
      
      const score = currentScoreSet.scores[seat.studentId] || 0;
      
      if (targetScore === '20+') {
        return score > 20;
      } else {
        return score === targetScore;
      }
    });
  }

  if (!currentPlan) return null;

  async function handleRandomSelection(minScore: number, maxScore: number) {
    setIsLoading(true);
    try {
      await getRandomStudents(5, minScore, maxScore);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSidesSelection() {
    setIsLoading(true);
    try {
      await getRandomStudentsFromSides();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClearSelection() {
    setIsLoading(true);
    try {
      await clearSelectedStudents();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleScoreSelection(score: number) {
    setIsLoading(true);
    try {
      await selectStudentsByScore(score);
    } finally {
      setIsLoading(false);
    }
  }

  function handlePointsConfirm(points: number) {
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
    <>
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center mb-4">
          <h3 className="section-heading flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            Student Selection & Points Management
          </h3>
        </div>
        
        {/* Random Selection Section */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Random Selection</h4>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <button
              onClick={() => handleRandomSelection(0, 1)}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 btn-primary disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Select 5 Students (0 points)
            </button>
            
            <button
              onClick={() => handleRandomSelection(0, 5)}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 btn-primary disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Select 5 Students (<5 points)
            </button>
            
            <button
              onClick={() => handleRandomSelection(5, 11)}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 btn-primary disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Select 5 Students (5-10 points)
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleRandomSelection(10, Infinity)}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 btn-success disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Select 5 Students (≥10 points)
            </button>
            
            <button
              onClick={handleSidesSelection}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 btn-purple disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <ArrowLeftRight className="h-4 w-4" />
              Select Left & Right
            </button>
            
            <button
              onClick={handleClearSelection}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 btn-outline-danger disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Cancel All Selection
            </button>
          </div>
        </div>
        
        {/* Points Manipulation Section */}
        <div className="mb-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Points Manipulation</h4>
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
        </div>
        
        {/* Select by Score Section */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Select Students by Score</h4>
          <div className="space-y-1">
            <div className="grid grid-cols-11 gap-1">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleScoreSelection(i)}
                  disabled={isLoading}
                  className={`px-2 py-1 text-xs font-medium rounded border transition-colors disabled:opacity-50 ${
                    hasStudentsWithScore(i)
                      ? 'border-yellow-400 bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-11 gap-1">
              {Array.from({ length: 10 }, (_, i) => (
                <button
                  key={i + 11}
                  onClick={() => handleScoreSelection(i + 11)}
                  disabled={isLoading}
                  className={`px-2 py-1 text-xs font-medium rounded border transition-colors disabled:opacity-50 ${
                    hasStudentsWithScore(i + 11)
                      ? 'border-yellow-400 bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {i + 11}
                </button>
              ))}
              <button
                onClick={() => handleScoreSelection('20+')}
                disabled={isLoading}
                className={`px-2 py-1 text-xs font-medium rounded border transition-colors disabled:opacity-50 ${
                  hasStudentsWithScore('20+')
                    ? 'border-yellow-400 bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                20+
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click a number to highlight all students with that exact score, or "20+" for students with more than 20 points. Yellow buttons indicate scores that exist in the current seating plan.
          </p>
        </div>
      </div>

      <PointsModal
        isOpen={modalType === 'add'}
        onClose={() => setModalType(null)}
        onConfirm={handlePointsConfirm}
        onQuickConfirm={handleQuickConfirm}
        title="Add Points to All Students"
        description="Or enter a custom amount:"
        confirmLabel="Add Points"
        quickActions={[1, 2, 3, 4, 5]}
      />

      <PointsModal
        isOpen={modalType === 'subtract'}
        onClose={() => setModalType(null)}
        onConfirm={handlePointsConfirm}
        onQuickConfirm={handleQuickConfirm}
        title="Subtract Points from All Students"
        description="Or enter a custom amount:"
        confirmLabel="Subtract Points"
        quickActions={[1, 2, 3, 4, 5]}
      />

      <PointsModal
        isOpen={modalType === 'reset'}
        onClose={() => setModalType(null)}
        onConfirm={handlePointsConfirm}
        title="Reset Points for All Students"
        description="What score would you like to set for all students?"
        confirmLabel="Set Points"
      />
    </>
  );
}