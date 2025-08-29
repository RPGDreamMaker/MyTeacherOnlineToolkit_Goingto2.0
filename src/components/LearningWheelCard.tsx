import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleDot, Pencil, Trash2, Plus } from 'lucide-react';
import { LearningWheel } from '../types/learningWheel';
import EditLearningWheelModal from './EditLearningWheelModal';

interface LearningWheelCardProps {
  wheel: LearningWheel;
  onWheelUpdated: (wheelId: string, updates: Partial<LearningWheel>) => void;
  onWheelDeleted: (wheelId: string) => void;
}

export default function LearningWheelCard({
  wheel,
  onWheelUpdated,
  onWheelDeleted,
}: LearningWheelCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function handleDelete() {
    if (confirm('Are you sure you want to delete this learning wheel?')) {
      try {
        onWheelDeleted(wheel.id);
      } catch (err) {
        console.error('Failed to delete learning wheel:', err);
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Edit wheel"
        >
          <Pencil className="h-5 w-5" />
        </button>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 transition-colors"
          title="Delete wheel"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2 pr-24">
        {wheel.name}
      </h3>
      {wheel.description && (
        <p className="text-gray-600 mb-4">{wheel.description}</p>
      )}

      <div className="flex items-center text-sm text-gray-500 mb-4">
        <CircleDot className="h-4 w-4 mr-1" />
        <span>{wheel.slices.length} slices</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Link to={`/learning-wheel/${wheel.id}`}>
          <button className="w-full flex items-center justify-center gap-2 btn-primary">
            <CircleDot className="h-4 w-4" />
            <span>Open Wheel</span>
          </button>
        </Link>
      </div>

      <EditLearningWheelModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        wheel={wheel}
        onSave={(updates) => {
          onWheelUpdated(wheel.id, updates);
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
}