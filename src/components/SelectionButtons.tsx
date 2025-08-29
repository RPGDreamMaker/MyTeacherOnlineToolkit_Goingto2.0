import { useState } from 'react';
import { Users, Loader2, ArrowLeftRight, X } from 'lucide-react';
import { useSeatingStore } from '../store/seating';

export default function SelectionButtons() {
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentPlan, getCurrentScoreSet, getRandomStudents, getRandomStudentsFromSides, clearSelectedStudents, selectStudentsByScore } = useSeatingStore();
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div className="flex items-center mb-4">
        <h3 className="section-heading flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600" />
          Random Selection
        </h3>
      </div>
      
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
          Select 5 Students (&lt;5 points)
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
      
      <div className="mt-4 pt-4 border-t border-gray-200">
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
  );
}