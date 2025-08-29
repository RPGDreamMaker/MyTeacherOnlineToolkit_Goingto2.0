import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLearningWheelsStore } from '../store/learningWheels';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import LearningWheelComponent from '../components/LearningWheelComponent';
import SliceDetailsModal from '../components/SliceDetailsModal';
import CreateSliceModal from '../components/CreateSliceModal';
import EditSliceModal from '../components/EditSliceModal';
import { LearningSlice } from '../types/learningWheel';

export default function LearningWheelPage() {
  const { wheelId } = useParams<{ wheelId: string }>();
  const { getLearningWheel, addSlice, updateSlice, deleteSlice } = useLearningWheelsStore();
  const [selectedSlice, setSelectedSlice] = useState<LearningSlice | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isCreateSliceModalOpen, setIsCreateSliceModalOpen] = useState(false);
  const [editingSlice, setEditingSlice] = useState<LearningSlice | null>(null);

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

  function handleDeleteSlice(sliceId: string) {
    if (confirm('Are you sure you want to delete this slice?')) {
      deleteSlice(wheel.id, sliceId);
    }
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
                onClick={() => setIsCreateSliceModalOpen(true)}
                disabled={isSpinning}
                className="flex items-center gap-2 btn-primary disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Slice
              </button>
            </div>

            {wheel.slices.length > 0 && (
              <div className="mb-6">
                <h3 className="section-heading mb-3">Slices ({wheel.slices.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {wheel.slices.map((slice) => (
                    <div
                      key={slice.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{slice.name}</p>
                        <p className="text-sm text-gray-500 truncate">{slice.url}</p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => setEditingSlice(slice)}
                          disabled={isSpinning}
                          className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlice(slice.id)}
                          disabled={isSpinning}
                          className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      <CreateSliceModal
        isOpen={isCreateSliceModalOpen}
        onClose={() => setIsCreateSliceModalOpen(false)}
        onSave={(name, url) => {
          addSlice(wheel.id, name, url);
          setIsCreateSliceModalOpen(false);
        }}
      />

      <EditSliceModal
        isOpen={Boolean(editingSlice)}
        onClose={() => setEditingSlice(null)}
        slice={editingSlice}
        onSave={(updates) => {
          if (editingSlice) {
            updateSlice(wheel.id, editingSlice.id, updates);
            setEditingSlice(null);
          }
        }}
      />
    </div>
  );
}