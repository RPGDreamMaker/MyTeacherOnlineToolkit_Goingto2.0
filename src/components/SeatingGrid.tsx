import { useState } from 'react';
import { useSeatingStore } from '../store/seating';
import { Move } from 'lucide-react';
import StudentCard from './StudentCard';

export default function SeatingGrid() {
  const { getCurrentPlan, updateSeat } = useSeatingStore();
  const [isDragging, setIsDragging] = useState(false);
  const currentPlan = getCurrentPlan();

  // If no plan is selected, show a message
  if (!currentPlan) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-500">
          Please create or select a seating plan to start arranging students.
        </p>
      </div>
    );
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${currentPlan.gridSettings.cols}, minmax(0, 1fr))`,
    gap: '1rem', // Increased gap between cells
  };

  function handleDragOver(e: React.DragEvent, isOccupied: boolean) {
    e.preventDefault();
    e.dataTransfer.dropEffect = isOccupied ? 'none' : 'move';
  }

  function handleDrop(e: React.DragEvent, row: number, col: number) {
    e.preventDefault();
    setIsDragging(false);
    
    const isOccupied = currentPlan.seats.some(s => s.row === row && s.col === col);
    if (isOccupied) return;

    const studentId = e.dataTransfer.getData('text/plain');
    if (studentId) {
      updateSeat(studentId, row, col);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-[1400px] mx-auto">
      <div style={gridStyle}>
        {Array.from({ length: currentPlan.gridSettings.rows * currentPlan.gridSettings.cols }).map((_, index) => {
          const row = Math.floor(index / currentPlan.gridSettings.cols);
          const col = index % currentPlan.gridSettings.cols;
          const seat = currentPlan.seats.find(s => s.row === row && s.col === col);
          const isOccupied = Boolean(seat);
          const isSelected = seat && currentPlan.selectedStudents?.includes(seat.studentId);

          return (
            <div
              key={`${row}-${col}`}
              className={`
                aspect-square border-2 rounded-lg p-4
                ${isSelected ? 'border-yellow-400 bg-yellow-50' : 
                  seat ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}
                ${isDragging && isOccupied ? 'cursor-no-drop' : 'hover:border-blue-400'}
                transition-colors
              `}
              onDragOver={(e) => handleDragOver(e, isOccupied)}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => handleDrop(e, row, col)}
            >
              {seat ? (
                <StudentCard
                  studentId={seat.studentId}
                  isDraggable
                  onDragStart={() => setIsDragging(true)}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <Move className="h-8 w-8" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}