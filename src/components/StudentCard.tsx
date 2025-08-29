import { useParams } from 'react-router-dom';
import { useSeatingStore } from '../store/seating';
import { Plus, Minus } from 'lucide-react';

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
  
  if (!classId) return null;
  
  const student = getStudent(studentId, classId);
  const currentPlan = getCurrentPlan();
  const currentScoreSet = getCurrentScoreSet();
  const score = currentScoreSet?.scores?.[studentId] ?? 0;

  if (!student) return null;

  const handleScoreUpdate = (delta: number) => {
    if (currentPlan && currentScoreSet) {
      updateStudentScore(studentId, classId, delta);
    }
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', studentId);
        onDragStart?.();
      }}
      className="h-full flex flex-col justify-between"
    >
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900 truncate">
          {student.firstName}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            onClick={() => handleScoreUpdate(-1)}
            className="text-red-500 hover:text-red-600 p-1 rounded-full transition-colors"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="text-lg font-medium">
            {score}
          </span>
          <button
            onClick={() => handleScoreUpdate(1)}
            className="text-green-500 hover:text-green-600 p-1 rounded-full transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}