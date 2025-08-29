import { UserCheck, UserX, ArrowRightCircle } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface StudentListProps {
  students: Student[];
  absentees: Set<string>;
  selectedStudents: Set<string>;
  onToggleAttendance: (studentId: string) => void;
  onSelectStudent: (student: Student) => void;
  disabled?: boolean;
}

export default function StudentList({
  students,
  absentees,
  selectedStudents,
  onToggleAttendance,
  onSelectStudent,
  disabled = false
}: StudentListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-[250px]">
      <h2 className="section-heading mb-2">Class List</h2>
      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {students.map((student) => {
          const isAbsent = absentees.has(student.id);
          const isSelected = selectedStudents.has(student.id);
          
          return (
            <div
              key={student.id}
              className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg text-sm"
            >
              <span className={`font-medium ${isAbsent ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {student.lastName} {student.firstName}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => !disabled && onToggleAttendance(student.id)}
                  className={`p-0.5 rounded-full transition-colors ${
                    disabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : isAbsent 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-green-500 hover:text-green-600'
                  }`}
                  title={isAbsent ? 'Mark as present' : 'Mark as absent'}
                  disabled={disabled}
                >
                  {isAbsent ? <UserX size={16} /> : <UserCheck size={16} />}
                </button>

                <button
                  onClick={() => onSelectStudent(student)}
                  className={`p-0.5 rounded-full transition-colors ${
                    isSelected || isAbsent || disabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-blue-500 hover:text-blue-600'
                  }`}
                  title={
                    isSelected 
                      ? 'Student already selected'
                      : isAbsent
                        ? 'Cannot select absent student'
                        : disabled
                          ? 'Wheel is spinning'
                          : 'Select student'
                  }
                  disabled={isSelected || isAbsent || disabled}
                >
                  <ArrowRightCircle size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}