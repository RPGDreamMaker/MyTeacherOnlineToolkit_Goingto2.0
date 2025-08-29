import { useState } from 'react';
import { useSeatingStore } from '../store/seating';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface CreateScoreSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

function CreateScoreSetModal({ isOpen, onClose, onSave }: CreateScoreSetModalProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
    setName('');
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
  onSave: (newName: string) => void;
}

function RenameScoreSetModal({ isOpen, onClose, currentName, onSave }: RenameScoreSetModalProps) {
  const [name, setName] = useState(currentName);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
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

export default function ScoreSetSelector() {
  const { 
    getCurrentPlan, 
    getCurrentScoreSet, 
    createScoreSet, 
    switchScoreSet, 
    deleteScoreSet, 
    renameScoreSet 
  } = useSeatingStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const currentPlan = getCurrentPlan();
  const currentScoreSet = getCurrentScoreSet();

  if (!currentPlan) return null;

  const scoreSets = Object.entries(currentPlan.scoreSets).map(([id, scoreSet]) => ({
    id,
    ...scoreSet
  }));

  function handleRename() {
    if (!currentScoreSet) return;
    setIsRenameModalOpen(true);
  }

  function handleDelete() {
    if (!currentScoreSet) return;
    
    if (scoreSets.length <= 1) {
      alert('Cannot delete the last score set');
      return;
    }
    
    if (confirm('Are you sure you want to delete this score set? All scores will be lost.')) {
      deleteScoreSet(currentScoreSet.id);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-heading">Score Sets</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
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
          >
            {scoreSets.map((scoreSet) => (
              <option key={scoreSet.id} value={scoreSet.id}>
                {scoreSet.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleRename}
          disabled={!currentScoreSet}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          title="Rename selected score set"
        >
          <Pencil className="h-4 w-4" />
        </button>
        {scoreSets.length > 1 && (
          <button
            onClick={handleDelete}
            disabled={!currentScoreSet}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete selected score set"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <CreateScoreSetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={createScoreSet}
      />

      <RenameScoreSetModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false);
        }}
        currentName={currentScoreSet?.name || ''}
        onSave={(newName) => {
          if (currentScoreSet) {
            renameScoreSet(currentScoreSet.id, newName);
          }
          setIsRenameModalOpen(false);
        }}
      />
    </div>
  );
}