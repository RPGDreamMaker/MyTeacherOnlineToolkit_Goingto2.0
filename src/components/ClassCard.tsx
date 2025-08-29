import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Layout, CircleDot, Pencil, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Class } from '../store/classes';
import EditClassModal from './EditClassModal';

interface ClassCardProps {
  classData: Class;
  onClassUpdated: (classId: string, updates: Partial<Class>) => void;
  onClassDeleted: (classId: string) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function ClassCard({
  classData,
  onClassUpdated,
  onClassDeleted,
  onMoveLeft,
  onMoveRight,
  isFirst,
  isLast,
}: ClassCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      onClassDeleted(classData.id);
    } catch (err) {
      console.error('Failed to delete class:', err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        {onMoveLeft && !isFirst && (
          <button
            onClick={onMoveLeft}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Move left"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {onMoveRight && !isLast && (
          <button
            onClick={onMoveRight}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Move right"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Edit class"
        >
          <Pencil className="h-5 w-5" />
        </button>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 transition-colors"
          title="Delete class"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2 pr-24">
        {classData.name}
      </h3>
      {classData.description && (
        <p className="text-gray-600 mb-4">{classData.description}</p>
      )}

      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Users className="h-4 w-4 mr-1" />
        <span>{classData.students.length} students</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Link to={`/class/${classData.id}`}>
          <button className="w-full flex items-center justify-center gap-2 btn-secondary">
            <Users className="h-4 w-4" />
            <span>Open Class Tools</span>
          </button>
        </Link>
      </div>

      <EditClassModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        classData={classData}
        onSave={(updates) => {
          onClassUpdated(classData.id, updates);
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
}