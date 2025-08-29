import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSeatingStore } from '../store/seating';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: string;
  initialName?: string;
  initialDescription?: string;
}

function EditPlanModal({
  isOpen,
  onClose,
  planId,
  initialName = '',
  initialDescription = ''
}: EditPlanModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const { createPlan, updatePlan } = useSeatingStore();
  const { classId } = useParams<{ classId: string }>();

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !classId) return;

    if (planId) {
      updatePlan(planId, { name: name.trim(), description: description.trim() });
    } else {
      createPlan(name.trim(), description.trim(), classId);
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
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="form-input"
              />
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
  const { getPlansForClass, getCurrentPlan, switchPlan, deletePlan } = useSeatingStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<{
    id: string;
    name: string;
    description: string;
  } | null>(null);

  const plans = classId ? getPlansForClass(classId) : [];
  const currentPlan = getCurrentPlan();

  function handleEdit(plan: { id: string; name: string; description: string }) {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  }

  function handleDelete() {
    if (!currentPlan) return;
    if (confirm('Are you sure you want to delete this seating plan?')) {
      deletePlan(currentPlan.id);
    }
  }
  return (
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
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} {plan.description ? `- ${plan.description}` : ''}
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

      <EditPlanModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPlan(null);
        }}
        planId={editingPlan?.id}
        initialName={editingPlan?.name}
        initialDescription={editingPlan?.description}
      />
    </div>
  );
}