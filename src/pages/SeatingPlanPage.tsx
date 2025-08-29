import { useState } from 'react';
import { useSeatingStore } from '../store/seating';
import { RotateCcw, Settings, Download, Copy, Wand2 } from 'lucide-react';
import SeatingGrid from '../components/SeatingGrid';
import UnassignedStudents from '../components/UnassignedStudents';
import GridSettingsModal from '../components/GridSettingsModal';
import SeatingPlanSelector from '../components/SeatingPlanSelector';
import ScoreSetSelector from '../components/ScoreSetSelector';
import CopySeatingModal from '../components/CopySeatingModal';
import SelectionButtons from '../components/SelectionButtons';
import PointsManipulation from '../components/PointsManipulation';
import AutomaticSeatingModal from '../components/AutomaticSeatingModal';
import { Class } from '../store/classes';
import { useClassesStore } from '../store/classes';

interface SeatingPlanPageProps {
  classId: string;
  classData: Class;
}

export default function SeatingPlanPage({ classId, classData }: SeatingPlanPageProps) {
  const { isStudentAbsent } = useClassesStore();
  const { 
    resetSeating, 
    getCurrentPlan, 
    updateGridSettings,
    getStudent,
    getPlansForClass,
    copyPlan,
    updateSeat
  } = useSeatingStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isAutomaticSeatingOpen, setIsAutomaticSeatingOpen] = useState(false);

  const currentPlan = getCurrentPlan();
  const availablePlans = classId ? getPlansForClass(classId) : [];

    const { getCurrentScoreSet } = useSeatingStore.getState();
    const currentScoreSet = getCurrentScoreSet();
    if (!currentScoreSet) return;

    const studentScores = classData.students.map(student => ({
      ...student,
      score: currentScoreSet.scores[student.id] || 0
    }));

    studentScores.sort((a, b) => 
      a.lastName.localeCompare(b.lastName) || 
      a.firstName.localeCompare(b.firstName)
    );

    const content = [
      `Class: ${classData.name}`,
      `Seating Plan: ${currentPlan.name}`,
      `Score Set: ${currentScoreSet.name}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      'Student Scores:',
      '-------------',
      ...studentScores.map(student => 
        `${student.lastName} ${student.firstName}: ${student.score}`
      )
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `${classData.name.replace(/[^a-z0-9]/gi, '_')}_${currentPlan.name.replace(/[^a-z0-9]/gi, '_')}_${currentScoreSet.name.replace(/[^a-z0-9]/gi, '_')}_scores.txt`.toLowerCase();
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleAutomaticSeating({ alphabetical, random }: { alphabetical: boolean; random: boolean }) {
    if (!currentPlan || !classData) return;

    // Get available seats (not locked and not occupied)
    const totalSeats = currentPlan.gridSettings.rows * currentPlan.gridSettings.cols;
    const lockedSeats = new Set(currentPlan.lockedSeats.map(seat => `${seat.row}-${seat.col}`));
    const availablePositions: Array<{ row: number; col: number }> = [];
    
    for (let row = 0; row < currentPlan.gridSettings.rows; row++) {
      for (let col = 0; col < currentPlan.gridSettings.cols; col++) {
        if (!lockedSeats.has(`${row}-${col}`)) {
          availablePositions.push({ row, col });
        }
      }
    }
    // Clear current seating
    currentPlan.seats.forEach(seat => {
      updateSeat(seat.studentId, null, null);
    });

    let studentsToPlace = classData.students.filter(student => !isStudentAbsent(classId, student.id));

    // Sort students if alphabetical is selected
    if (alphabetical) {
      studentsToPlace.sort((a, b) => 
        a.lastName.localeCompare(b.lastName) || 
        a.firstName.localeCompare(b.firstName)
      );
    }

    // Randomize order if random is selected
    if (random) {
      for (let i = studentsToPlace.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [studentsToPlace[i], studentsToPlace[j]] = [studentsToPlace[j], studentsToPlace[i]];
      }
    }

    // Place students in available positions only
    studentsToPlace.forEach((student, index) => {
      if (index < availablePositions.length) {
        const position = availablePositions[index];
        updateSeat(student.id, position.row, position.col);
      }
    });
  }

  return (
    <div>
      {currentPlan && (
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={exportScores}
            className="flex items-center gap-2 btn-secondary"
          >
            <Download className="h-4 w-4" />
            Export Scores
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 btn-secondary"
          >
            <Settings className="h-4 w-4" />
            Grid Settings
          </button>
          <button
            onClick={() => setIsAutomaticSeatingOpen(true)}
            className="flex items-center gap-2 btn-secondary"
          >
            <Wand2 className="h-4 w-4" />
            Automatic Seating
          </button>
          <button
            onClick={() => setIsCopyModalOpen(true)}
            className="flex items-center gap-2 btn-secondary"
          >
            <Copy className="h-4 w-4" />
            Copy Seating
          </button>
          <button
            onClick={resetSeating}
            className="flex items-center gap-2 btn-secondary"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Seating
          </button>
        </div>
      )}

      <SeatingPlanSelector />
          
      {currentPlan && <ScoreSetSelector />}
          
      {currentPlan && <PointsManipulation />}
          
      {currentPlan && <SelectionButtons />}

      <div className="space-y-6">
        <SeatingGrid />
        {currentPlan && <UnassignedStudents />}
      </div>

      {currentPlan && (
        <>
          <GridSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            currentSettings={currentPlan.gridSettings}
            onSave={updateGridSettings}
          />
          <CopySeatingModal
            isOpen={isCopyModalOpen}
            onClose={() => setIsCopyModalOpen(false)}
            plans={availablePlans}
            currentPlanId={currentPlan.id}
            onCopy={copyPlan}
          />
          <AutomaticSeatingModal
            isOpen={isAutomaticSeatingOpen}
            onClose={() => setIsAutomaticSeatingOpen(false)}
            onApply={handleAutomaticSeating}
            availableSeats={availableSeats}
            totalStudents={totalStudents}
          />
        </>
      )}
    </div>
  );
}