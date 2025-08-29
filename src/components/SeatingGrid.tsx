import { useState } from 'react';
import { useSeatingStore } from '../store/seating';
import { Move, Lock, Unlock } from 'lucide-react';
import StudentCard from './StudentCard';

export default function SeatingGrid() {
  const { getCurrentPlan, updateSeat, toggleSeatLock, isSeatLocked } = useSeatingStore();
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
    const row = parseInt(e.currentTarget.getAttribute('data-row') || '0');
    const col = parseInt(e.currentTarget.getAttribute('data-col') || '0');
    const isLocked = isSeatLocked(row, col);
    e.dataTransfer.dropEffect = (isOccupied || isLocked) ? 'none' : 'move';
  }

  function handleDrop(e: React.DragEvent, row: number, col: number) {
    e.preventDefault();
    setIsDragging(false);
    
    const isOccupied = currentPlan.seats.some(s => s.row === row && s.col === col);
    const isLocked = isSeatLocked(row, col);
    if (isOccupied || isLocked) return;

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
          const isLocked = isSeatLocked(row, col);
          const isOccupied = Boolean(seat);
          const isSelected = seat && currentPlan.selectedStudents?.includes(seat.studentId);

          return (
            <div
              key={`${row}-${col}`}
              data-row={row}
              data-col={col}
              className={`
                aspect-square border-2 rounded-lg p-4
                ${isSelected ? 'border-yellow-400 bg-yellow-50' :
                  isLocked ? 'border-red-300 bg-red-50' :
                  seat ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}
                ${isDragging && (isOccupied || isLocked) ? 'cursor-no-drop' : 'hover:border-blue-400'}
                transition-colors
              `}
              onDragOver={(e) => handleDragOver(e, isOccupied || isLocked)}
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
              ) : isLocked ? (
                <div className="h-full flex flex-col items-center justify-center text-red-500">
                  <Lock className="h-8 w-8 mb-2" />
                  <button
                    onClick={() => toggleSeatLock(row, col)}
                    className="text-xs text-red-600 hover:text-red-800 transition-colors"
                  >
                    Click to unlock
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Move className="h-6 w-6 mb-2" />
                  <button
                    onClick={() => toggleSeatLock(row, col)}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                  >
                    <Lock className="h-3 w-3" />
                    Lock seat
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}