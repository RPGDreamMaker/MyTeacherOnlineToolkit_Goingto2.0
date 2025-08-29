import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSeatingStore } from '../store/seating';
import { useClassesStore } from '../store/classes';
import { Layout, RotateCcw, Settings, ArrowLeft, Download, Copy, Wand2 } from 'lucide-react';
import SeatingGrid from '../components/SeatingGrid';
import UnassignedStudents from '../components/UnassignedStudents';
import GridSettingsModal from '../components/GridSettingsModal';
import SeatingPlanSelector from '../components/SeatingPlanSelector';
import CopySeatingModal from '../components/CopySeatingModal';
import SelectionButtons from '../components/SelectionButtons';
import PointsManipulation from '../components/PointsManipulation';
import AutomaticSeatingModal from '../components/AutomaticSeatingModal';

export default function SeatingPlanPage() {
  const { classId } = useParams<{ classId: string }>();
  const { classes } = useClassesStore();
  const { 
    initialize, 
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

  const classData = classId ? classes.find(c => c.id === classId) : null;
  const currentPlan = getCurrentPlan();
  const availablePlans = classId ? getPlansForClass(classId) : [];

  useEffect(() => {
    if (classData) {
      initialize(classData.id, classData.students);
    }
  }, [classData, initialize]);

  function exportScores() {
    if (!currentPlan || !classId || !classData) return;

    const studentScores = classData.students.map(student => ({
      ...student,
      score: currentPlan.scores[student.id] || 0
    }));

    studentScores.sort((a, b) => 
      a.lastName.localeCompare(b.lastName) || 
      a.firstName.localeCompare(b.firstName)
    );

    const content = [
      `Class: ${classData.name}`,
      `Seating Plan: ${currentPlan.name}`,
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
    const fileName = `${classData.name.replace(/[^a-z0-9]/gi, '_')}_${currentPlan.name.replace(/[^a-z0-9]/gi, '_')}_scores.txt`.toLowerCase();
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleAutomaticSeating({ alphabetical, random }: { alphabetical: boolean; random: boolean }) {
    if (!currentPlan || !classData) return;

    // Clear current seating
    currentPlan.seats.forEach(seat => {
      updateSeat(seat.studentId, null, null);
    });

    let studentsToPlace = [...classData.students];

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

    // Place students in grid
    studentsToPlace.forEach((student, index) => {
      const row = Math.floor(index / currentPlan.gridSettings.cols);
      const col = index % currentPlan.gridSettings.cols;
      
      if (row < currentPlan.gridSettings.rows) {
        updateSeat(student.id, row, col);
      }
    });
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600">
              Invalid class ID
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-gray-600" />
              <h2 className="page-title">
                Seating Plan - {classData.name}
              </h2>
            </div>
            {currentPlan && (
              <div className="flex gap-2">
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
          </div>

          <SeatingPlanSelector />
          
          {currentPlan && <PointsManipulation />}
          
          {currentPlan && <SelectionButtons />}

          <div className="space-y-6">
            <SeatingGrid />
            {currentPlan && <UnassignedStudents />}
          </div>
        </div>
      </main>

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
          />
        </>
      )}
    </div>
  );
}