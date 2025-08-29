import { useState } from 'react';
import { Users, Loader2, ArrowLeftRight, X } from 'lucide-react';
import { useSeatingStore } from '../store/seating';

export default function SelectionButtons() {
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentPlan, getRandomStudents, getRandomStudentsFromSides, clearSelectedStudents } = useSeatingStore();
  const currentPlan = getCurrentPlan();

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
    </div>
  );
}