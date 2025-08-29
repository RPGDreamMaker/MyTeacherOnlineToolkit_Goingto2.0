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
  const [renamingScoreSetId, setRenamingScoreSetId] = useState<string | null>(null);

  const currentPlan = getCurrentPlan();
  const currentScoreSet = getCurrentScoreSet();

  if (!currentPlan) return null;

  const scoreSets = Object.entries(currentPlan.scoreSets).map(([id, scoreSet]) => ({
    id,
    ...scoreSet
  }));

  function handleRename(scoreSetId: string, currentName: string) {
    setRenamingScoreSetId(scoreSetId);
    setIsRenameModalOpen(true);
  }

  function handleDelete(scoreSetId: string) {
    if (scoreSets.length <= 1) {
      alert('Cannot delete the last score set');
      return;
    }
    
    if (confirm('Are you sure you want to delete this score set? All scores will be lost.')) {
      deleteScoreSet(scoreSetId);
    }
  }

  const renamingScoreSet = renamingScoreSetId 
    ? scoreSets.find(s => s.id === renamingScoreSetId)
    : null;

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

      <div className="space-y-2">
        {scoreSets.map((scoreSet) => (
          <div
            key={scoreSet.id}
            className={`
              flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer
              ${scoreSet.id === currentScoreSet?.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }
              transition-colors
            `}
            onClick={() => switchScoreSet(scoreSet.id)}
          >
            <div>
              <h3 className="font-medium text-gray-900">{scoreSet.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                Created: {new Date(scoreSet.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename(scoreSet.id, scoreSet.name);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Rename score set"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {scoreSets.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(scoreSet.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete score set"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
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
          setRenamingScoreSetId(null);
        }}
        currentName={renamingScoreSet?.name || ''}
        onSave={(newName) => {
          if (renamingScoreSetId) {
            renameScoreSet(renamingScoreSetId, newName);
          }
          setIsRenameModalOpen(false);
          setRenamingScoreSetId(null);
        }}
      />
    </div>
  );
}