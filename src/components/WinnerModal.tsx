import { useEffect } from 'react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface WinnerModalProps {
  student: Student | null;
  onClose: () => void;
}

export default function WinnerModal({ student, onClose }: WinnerModalProps) {
  useEffect(() => {
    if (student) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    }
  }, [student]);

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-24 flex flex-col items-center">
          <h2 className="modal-title text-center mb-2 mt-8">We have a winner!</h2>
          <p className="text-4xl font-bold text-center text-blue-600 mb-6">{student.firstName}</p>
          <button
            onClick={onClose}
            className="btn-primary mb-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}