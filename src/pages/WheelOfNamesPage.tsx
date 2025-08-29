import { useState } from 'react';
import { useWheelStore } from '../store/wheel';
import { useClassesStore } from '../store/classes';
import Wheel from '../components/Wheel';
import WinnerModal from '../components/WinnerModal';
import StudentList from '../components/StudentList';
import SelectedStudents from '../components/SelectedStudents';
import WheelPlanSelector from '../components/WheelPlanSelector';
import { Class } from '../store/classes';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface WheelOfNamesPageProps {
  classId: string;
  classData: Class;
}

export default function WheelOfNamesPage({ classId, classData }: WheelOfNamesPageProps) {
  const { isStudentAbsent, toggleStudentAbsent } = useClassesStore();
  const {
    getAvailableStudents,
    getSelectedStudents,
    selectStudent,
    returnStudent,
    returnAllStudents,
    infiniteMode,
    setInfiniteMode,
  } = useWheelStore();
  
  const [winner, setWinner] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

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
    <div>
      <WheelPlanSelector />

      <div className="flex justify-center items-start gap-8">
            <StudentList
              students={classData.students}
              absentees={new Set(classData.students.filter(s => isStudentAbsent(classId, s.id)).map(s => s.id))}
              selectedStudents={selectedStudentIds}
              onToggleAttendance={(studentId) => toggleStudentAbsent(classId, studentId)}
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

      <WinnerModal
        student={winner}
        onClose={handleWinnerClose}
      />
    </div>
  );
}