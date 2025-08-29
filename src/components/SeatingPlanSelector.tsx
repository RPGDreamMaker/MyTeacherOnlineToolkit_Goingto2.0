import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSeatingStore } from '../store/seating';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

// Color options matching the wheel of names
const COLOR_OPTIONS = [
  { value: '#d50f25', name: 'Red', class: 'bg-red-600' },
  { value: '#3369e8', name: 'Blue', class: 'bg-blue-600' },
  { value: '#eeb211', name: 'Yellow', class: 'bg-yellow-500' },
  { value: '#009925', name: 'Green', class: 'bg-green-600' },
];

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: string;
  initialName?: string;
  initialColor?: string;
}

function EditPlanModal({
  isOpen,
  onClose,
  planId,
  initialName = '',
  initialColor = '#d50f25'
}: EditPlanModalProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const { createPlan, updatePlan } = useSeatingStore();
  const { classId } = useParams<{ classId: string }>();

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !classId) return;

    if (planId) {
      updatePlan(planId, { name: name.trim(), description: '', color });
    } else {
      createPlan(name.trim(), '', classId, color);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="modal-title mb-4">
            {planId ? 'Edit Seating Plan' : 'Create New Seating Plan'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">
                Plan Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div>
              <label className="form-label">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {COLOR_OPTIONS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setColor(colorOption.value)}
                    className={`
                      w-full h-10 rounded-md border-2 transition-all
                      ${color === colorOption.value 
                        ? 'border-gray-800 ring-2 ring-gray-300' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                      ${colorOption.class}
                    `}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {planId ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SeatingPlanSelector() {
  const { classId } = useParams<{ classId: string }>();
  const { 
    getPlansForClass, 
    getCurrentPlan, 
    switchPlan, 
    deletePlan,
    getCurrentScoreSet,
    createScoreSet,
    switchScoreSet,
    deleteScoreSet,
    renameScoreSet
  } = useSeatingStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateScoreSetModalOpen, setIsCreateScoreSetModalOpen] = useState(false);
  const [isRenameScoreSetModalOpen, setIsRenameScoreSetModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<{
    id: string;
    name: string;
    description: string;
    color?: string;
  } | null>(null);

  const plans = classId ? getPlansForClass(classId) : [];
  const currentPlan = getCurrentPlan();
  const currentScoreSet = getCurrentScoreSet();

  function handleEdit(plan: { id: string; name: string; description: string; color?: string }) {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  }

  function handleDelete() {
    if (!currentPlan) return;
    if (confirm('Are you sure you want to delete this seating plan?')) {
      deletePlan(currentPlan.id);
    }
  }

  function handleRenameScoreSet() {
    if (!currentScoreSet) return;
    setIsRenameScoreSetModalOpen(true);
  }

  function handleDeleteScoreSet() {
    if (!currentScoreSet) return;
    
    const scoreSets = currentPlan ? Object.entries(currentPlan.scoreSets) : [];
    if (scoreSets.length <= 1) {
      alert('Cannot delete the last score set');
      return;
    }
    
    if (confirm('Are you sure you want to delete this score set? All scores will be lost.')) {
      deleteScoreSet(currentScoreSet.id);
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-heading">Seating Plans</h2>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 btn-primary"
          >
            <Plus className="h-4 w-4" />
            New Plan
          </button>
        </div>

        {plans.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No seating plans yet. Create your first plan to get started.
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <select
                value={currentPlan?.id || ''}
                onChange={(e) => switchPlan(e.target.value)}
                className="form-input"
                style={{
                  backgroundColor: currentScoreSet?.color ? `${currentScoreSet.color}20` : undefined,
                  borderLeft: currentScoreSet?.color ? `4px solid ${currentScoreSet.color}` : undefined
                }}
              >
                {plans.map((plan) => (
                  <option 
                    key={plan.id} 
                    style={{
                      backgroundColor: plan.color ? `${plan.color}20` : undefined
                    }}
                    value={plan.id}
                  >
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => currentPlan && handleEdit(currentPlan)}
              disabled={!currentPlan}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Edit selected plan"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={!currentPlan}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete selected plan"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Score Sets Section */}
        {currentPlan && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-heading">Score Sets</h2>
              <button
                onClick={() => setIsCreateScoreSetModalOpen(true)}
                className="flex items-center gap-2 btn-primary"
              >
                <Plus className="h-4 w-4" />
                New Score Set
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <select
                  value={currentScoreSet?.id || ''}
                  onChange={(e) => switchScoreSet(e.target.value)}
                  className="form-input"
                  style={{
                    borderLeft: currentScoreSet?.color ? `4px solid ${currentScoreSet.color}` : undefined
                  }}
                >
                  {currentPlan && Object.entries(currentPlan.scoreSets).map(([id, scoreSet]) => (
                    <option key={id} value={id}>
                      {scoreSet.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleRenameScoreSet}
                disabled={!currentScoreSet}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                title="Rename selected score set"
                style={{
                  color: currentScoreSet?.color || undefined
                }}
              >
                <Pencil className="h-4 w-4" />
              </button>
              {currentPlan && Object.keys(currentPlan.scoreSets).length > 1 && (
                <button
                  onClick={handleDeleteScoreSet}
                  disabled={!currentScoreSet}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete selected score set"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <EditPlanModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPlan(null);
        }}
        planId={editingPlan?.id}
        initialName={editingPlan?.name}
        initialColor={editingPlan?.color}
      />

      <CreateScoreSetModal
        isOpen={isCreateScoreSetModalOpen}
        onClose={() => setIsCreateScoreSetModalOpen(false)}
        onSave={(name, color) => createScoreSet(name, color)}
      />

      <RenameScoreSetModal
        isOpen={isRenameScoreSetModalOpen}
        onClose={() => setIsRenameScoreSetModalOpen(false)}
        currentName={currentScoreSet?.name || ''}
        currentColor={currentScoreSet?.color || '#3369e8'}
        onSave={(newName, newColor) => {
          if (currentScoreSet) {
            renameScoreSet(currentScoreSet.id, newName, newColor);
          }
          setIsRenameScoreSetModalOpen(false);
        }}
      />
    </>
  );
}

interface CreateScoreSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
}

function CreateScoreSetModal({ isOpen, onClose, onSave }: CreateScoreSetModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3369e8');

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), color);
    setName('');
    setColor('#3369e8');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="modal-title">Create New Score Set</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="scoreSetName" className="form-label">
              Score Set Name
            </label>
            <input
              type="text"
              id="scoreSetName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="e.g., Week 1, Math Quiz, etc."
              required
            />
          </div>
          
          <div>
            <label className="form-label">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`
                    w-full h-10 rounded-md border-2 transition-all
                    ${color === colorOption.value 
                      ? 'border-gray-800 ring-2 ring-gray-300' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${colorOption.class}
                  `}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Create Score Set
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface RenameScoreSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentColor: string;
  onSave: (newName: string, newColor: string) => void;
}

function RenameScoreSetModal({ isOpen, onClose, currentName, currentColor, onSave }: RenameScoreSetModalProps) {
  const [name, setName] = useState(currentName);
  const [color, setColor] = useState(currentColor);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), color);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="modal-title">Rename Score Set</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="scoreSetName" className="form-label">
              Score Set Name
            </label>
            <input
              type="text"
              id="scoreSetName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <label className="form-label">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`
                    w-full h-10 rounded-md border-2 transition-all
                    ${color === colorOption.value 
                      ? 'border-gray-800 ring-2 ring-gray-300' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${colorOption.class}
                  `}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}