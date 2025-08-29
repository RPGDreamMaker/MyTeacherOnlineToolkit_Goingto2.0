import { useParams } from 'react-router-dom';
import { useSeatingStore } from '../store/seating';
import { useClassesStore } from '../store/classes';
import { Plus, Minus, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';

interface StudentCardProps {
  studentId: string;
  isDraggable?: boolean;
  onDragStart?: () => void;
}

export default function StudentCard({ 
  studentId, 
  isDraggable = false,
  onDragStart 
}: StudentCardProps) {
  const { classId } = useParams<{ classId: string }>();
  const { getStudent, updateStudentScore, getCurrentPlan, getCurrentScoreSet } = useSeatingStore();
  const { isStudentAbsent, toggleStudentAbsent } = useClassesStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState<number | null>(null);
  
  if (!classId) return null;
  
  const student = getStudent(studentId, classId);
  const currentPlan = getCurrentPlan();
  const currentScoreSet = getCurrentScoreSet();
  const score = currentScoreSet?.scores?.[studentId] ?? 0;
  const isAbsent = isStudentAbsent(classId, studentId);

  if (!student) return null;

  const handleScoreUpdate = (delta: number) => {
    if (currentPlan && currentScoreSet) {
      updateStudentScore(studentId, classId, delta);
    }
  };

  const handleMouseEnter = () => {
    const timeout = window.setTimeout(() => {
      setShowTooltip(true);
    }, 1000); // Show tooltip after 1 second
    setTooltipTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
    setShowTooltip(false);
  };
  
  const handleToggleAbsent = () => {
    toggleStudentAbsent(classId, studentId);
  };
  
  return (
    <div
      className="relative h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        draggable={isDraggable}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', studentId);
          onDragStart?.();
        }}
        className={`h-full flex flex-col justify-between ${isAbsent ? 'opacity-50' : ''}`}
      >
        <div className="text-center">
          <div className={`text-lg font-bold text-gray-900 truncate ${isAbsent ? 'line-through' : ''}`}>
            {student.firstName}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => handleScoreUpdate(-1)}
              className={`text-red-500 hover:text-red-600 p-1 rounded-full transition-colors ${isAbsent ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isAbsent}
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-lg font-medium">
              {score}
            </span>
            <button
              onClick={() => handleScoreUpdate(1)}
              className={`text-green-500 hover:text-green-600 p-1 rounded-full transition-colors ${isAbsent ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isAbsent}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2">
            <button
              onClick={handleToggleAbsent}
              className={`p-1 rounded-full transition-colors ${
                isAbsent 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-green-500 hover:text-green-600'
              }`}
              title={isAbsent ? 'Mark as present' : 'Mark as absent'}
            >
              {isAbsent ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
      
      {showTooltip && (
        <div className="absolute z-50 px-2 py-1 text-sm text-white bg-gray-800 rounded shadow-lg whitespace-nowrap -top-8 left-1/2 transform -translate-x-1/2">
          {student.firstName} {student.lastName}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}