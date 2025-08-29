import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWheelStore } from '../store/wheel';
import { useClassesStore } from '../store/classes';
import { ArrowLeft } from 'lucide-react';
import Wheel from '../components/Wheel';
import WinnerModal from '../components/WinnerModal';
import StudentList from '../components/StudentList';
import SelectedStudents from '../components/SelectedStudents';
import WheelPlanSelector from '../components/WheelPlanSelector';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

export default function WheelOfNamesPage() {
  const { classId } = useParams<{ classId: string }>();
  const { classes } = useClassesStore();
  const {
    initialize,
    getAvailableStudents,
    getSelectedStudents,
    selectStudent,
    returnStudent,
    returnAllStudents,
    toggleAttendance,
    isAbsent,
    infiniteMode,
    setInfiniteMode,
  } = useWheelStore();
  
  const [winner, setWinner] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const classData = classId ? classes.find(c => c.id === classId) : null;

  useEffect(() => {
    if (classData) {
      initialize(classData.id, classData.students);
    }
  }, [classData, initialize]);

  if (!classId || !classData) return null;

  const availableStudents = getAvailableStudents(classId);
  const selectedStudents = getSelectedStudents(classId);
  const selectedStudentIds = new Set(selectedStudents.map(s => s.id));

  async function handleWinnerClose() {
    if (winner) {
      await selectStudent(winner.id);
    }
    setWinner(null);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-8">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="mb-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>

          <WheelPlanSelector />

          <div className="flex justify-center items-start gap-8">
            <StudentList
              students={classData.students}
              absentees={new Set(classData.students.filter(s => isAbsent(s.id)).map(s => s.id))}
              selectedStudents={selectedStudentIds}
              onToggleAttendance={toggleAttendance}
              onSelectStudent={(student) => !isSpinning && selectStudent(student.id)}
              disabled={isSpinning}
            />
            
            {availableStudents.length > 0 ? (
              <div className="flex-1 flex justify-center">
                <Wheel
                  students={availableStudents}
                  onSelectStudent={setWinner}
                  onSpinStart={() => setIsSpinning(true)}
                  onSpinEnd={() => setIsSpinning(false)}
                />
              </div>
            ) : (
              <div className="flex-1 flex justify-center">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                  <p className="text-xl font-medium text-gray-700 mb-4">
                    All students have been selected!
                  </p>
                  <button
                    onClick={returnAllStudents}
                    className="btn-primary"
                  >
                    Reset Wheel
                  </button>
                </div>
              </div>
            )}

            <SelectedStudents
              students={selectedStudents}
              onReturnStudent={(studentId) => !isSpinning && returnStudent(studentId)}
              onReturnAll={() => !isSpinning && returnAllStudents()}
              infiniteMode={infiniteMode}
              onToggleInfiniteMode={() => !isSpinning && setInfiniteMode(!infiniteMode)}
              disabled={isSpinning}
            />
          </div>
        </div>
      </main>

      <WinnerModal
        student={winner}
        onClose={handleWinnerClose}
      />
    </div>
  );
}