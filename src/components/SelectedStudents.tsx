import { ArrowLeftCircle, RotateCcw, Repeat } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface SelectedStudentsProps {
  students: Student[];
  onReturnStudent: (studentId: string) => void;
  onReturnAll: () => void;
  infiniteMode: boolean;
  onToggleInfiniteMode: () => void;
  disabled?: boolean;
}

export default function SelectedStudents({ 
  students, 
  onReturnStudent, 
  onReturnAll,
  infiniteMode,
  onToggleInfiniteMode,
  disabled = false
}: SelectedStudentsProps) {
  return (
    <div className="flex-none bg-white rounded-lg shadow-md p-4" style={{ width: '200px' }}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="section-heading text-gray-800">Selected</h2>
        <div className="flex gap-1">
          <button
            onClick={onToggleInfiniteMode}
            disabled={disabled}
            className={`flex items-center transition-colors p-0.5 rounded-full ${
              disabled
                ? 'text-gray-300 cursor-not-allowed'
                : infiniteMode 
                  ? 'text-purple-600 hover:text-purple-700' 
                  : 'text-gray-400 hover:text-gray-500'
            }`}
            title={disabled ? 'Wheel is spinning' : infiniteMode ? 'Disable infinite mode' : 'Enable infinite mode'}
          >
            <Repeat size={16} />
          </button>
          {students.length > 0 && (
            <button
              onClick={onReturnAll}
              disabled={disabled}
              className={`flex items-center p-0.5 rounded-full transition-colors ${
                disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-700'
              }`}
              title={disabled ? 'Wheel is spinning' : 'Return all students to wheel'}
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-1 max-h-[600px] overflow-y-auto text-sm">
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {infiniteMode 
              ? 'Infinite mode: Names stay in wheel' 
              : 'No students selected yet'}
          </p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg"
            >
              <span className="font-medium text-gray-700 truncate max-w-[170px]">
                {student.firstName}
              </span>
              <button
                onClick={() => onReturnStudent(student.id)}
                disabled={disabled}
                className={`p-0.5 rounded-full transition-colors flex-shrink-0 ml-2 ${
                  disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-800'
                }`}
                title={disabled ? 'Wheel is spinning' : 'Return to wheel'}
              >
                <ArrowLeftCircle size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}