import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLearningWheelsStore } from '../store/learningWheels';
import { ArrowLeft, Edit } from 'lucide-react';
import LearningWheelComponent from '../components/LearningWheelComponent';
import SliceDetailsModal from '../components/SliceDetailsModal';
import EditWheelBulkModal from '../components/EditWheelBulkModal';

export default function LearningWheelPage() {
  const { wheelId } = useParams<{ wheelId: string }>();
  const { getLearningWheel, updateLearningWheel } = useLearningWheelsStore();
  const [selectedSlice, setSelectedSlice] = useState<any>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isEditWheelModalOpen, setIsEditWheelModalOpen] = useState(false);

  const wheel = wheelId ? getLearningWheel(wheelId) : null;

  if (!wheel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600">
              Learning wheel not found
            </div>
            <Link to="/dashboard" className="text-blue-600 hover:underline">
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
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

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="page-title">{wheel.name}</h1>
                {wheel.description && (
                  <p className="text-gray-600 mt-1">{wheel.description}</p>
                )}
              </div>
              <button
                onClick={() => setIsEditWheelModalOpen(true)}
                disabled={isSpinning}
                className="flex items-center gap-2 btn-primary disabled:opacity-50"
              >
                <Edit className="h-4 w-4" />
                Edit Wheel
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <LearningWheelComponent
              slices={wheel.slices}
              onSelectSlice={setSelectedSlice}
              onSpinStart={() => setIsSpinning(true)}
              onSpinEnd={() => setIsSpinning(false)}
            />
          </div>
        </div>
      </main>

      <SliceDetailsModal
        slice={selectedSlice}
        onClose={() => setSelectedSlice(null)}
      />

      <EditWheelBulkModal
        isOpen={isEditWheelModalOpen}
        onClose={() => setIsEditWheelModalOpen(false)}
        wheel={wheel}
        onSave={(name, description, slices) => {
          if (wheel) {
            updateLearningWheel(wheel.id, {
              name,
              description,
              slices: slices.map(slice => ({
                id: crypto.randomUUID(),
                name: slice.name,
                url: slice.url
              }))
            });
            setIsEditWheelModalOpen(false);
          }
        }}
      />
    </div>
  );
}