import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClassesStore } from '../store/classes';
import { useLearningWheelsStore } from '../store/learningWheels';
import { useWelcomeStore } from '../store/welcome';
import { Plus, Pencil, X, Download, Upload, Search } from 'lucide-react';
import ClassCard from '../components/ClassCard';
import LearningWheelCard from '../components/LearningWheelCard';
import CreateClassModal from '../components/CreateClassModal';
import CreateLearningWheelModal from '../components/CreateLearningWheelModal';
import { exportAppData, importAppData } from '../utils/dataManagement';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { logout } = useAuth();
  const { classes, addClass, updateClass, deleteClass, moveClass } = useClassesStore();
  const { learningWheels, addLearningWheel, updateLearningWheel, deleteLearningWheel } = useLearningWheelsStore();
  const { message, setMessage } = useWelcomeStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateLearningWheelModalOpen, setIsCreateLearningWheelModalOpen] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [tempMessage, setTempMessage] = useState(message);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedClasses = [...classes].sort((a, b) => a.displayOrder - b.displayOrder);

  function handleMessageSave() {
    setMessage(tempMessage);
    setIsEditingMessage(false);
  }

  function handleMessageCancel() {
    setTempMessage(message);
    setIsEditingMessage(false);
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      exportAppData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  }

  function handleImportClick() {
    setImportError('');
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError('');

    try {
      await importAppData(file);
      alert('Data imported successfully! Your classes, seating plans, wheel configurations, and learning wheels have been restored.');
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setIsImporting(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {isEditingMessage ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempMessage}
                    onChange={(e) => setTempMessage(e.target.value)}
                    className="text-xl border-b border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-2 w-96"
                    placeholder="Enter welcome message"
                  />
                  <button
                    onClick={handleMessageSave}
                    className="text-green-600 hover:text-green-700 p-1"
                    title="Save message"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleMessageCancel}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Cancel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <h1 className="page-title">{message}</h1>
              )}
            </div>
            <div className="flex items-center gap-4">
              {!isEditingMessage && (
                <button
                  onClick={() => setIsEditingMessage(true)}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  Edit Message
                </button>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="page-title">Your Classes</h2>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="flex items-center gap-2 btn-secondary disabled:opacity-50"
              >
                <Upload className="h-5 w-5" />
                <span>{isImporting ? 'Importing...' : 'Import All Data'}</span>
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 btn-secondary disabled:opacity-50"
              >
                <Download className="h-5 w-5" />
                <span>{isExporting ? 'Exporting...' : 'Export All Data'}</span>
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 btn-primary"
              >
                <Plus className="h-5 w-5" />
                <span>Create New Class</span>
              </button>
            </div>
          </div>

          {importError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{importError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sortedClasses.map((classData, index) => (
              <ClassCard
                key={classData.id}
                classData={classData}
                onClassUpdated={updateClass}
                onClassDeleted={deleteClass}
                onMoveLeft={
                  index > 0
                    ? () => moveClass(classData.id, 'left')
                    : undefined
                }
                onMoveRight={
                  index < classes.length - 1
                    ? () => moveClass(classData.id, 'right')
                    : undefined
                }
                isFirst={index === 0}
                isLast={index === classes.length - 1}
              />
            ))}
          </div>

          {classes.length === 0 && (
            <div className="text-center py-12 mb-12">
              <p className="text-gray-500 text-lg">
                You haven't created any classes yet.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-6 py-3 btn-primary"
              >
                Create Your First Class
              </button>
            </div>
          )}

          {/* Learning Wheels Section */}
          <div className="border-t border-gray-200 pt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="page-title">Learning Wheels</h2>
              <button
                onClick={() => setIsCreateLearningWheelModalOpen(true)}
                className="flex items-center gap-2 btn-primary"
              >
                <Plus className="h-5 w-5" />
                <span>Create New Learning Wheel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningWheels.map((wheel) => (
                <LearningWheelCard
                  key={wheel.id}
                  wheel={wheel}
                  onWheelUpdated={updateLearningWheel}
                  onWheelDeleted={deleteLearningWheel}
                />
              ))}
            </div>

            {learningWheels.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  You haven't created any learning wheels yet.
                </p>
                <button
                  onClick={() => setIsCreateLearningWheelModalOpen(true)}
                  className="mt-4 px-6 py-3 btn-primary"
                >
                  Create Your First Learning Wheel
                </button>
              </div>
            )}
          </div>

          {/* Word Search Creator Section */}
          <div className="border-t border-gray-200 pt-12 mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="page-title">Word Search Creator</h2>
              <Link to="/word-search">
                <button className="flex items-center gap-2 btn-primary">
                  <Search className="h-5 w-5" />
                  <span>Open Word Search Creator</span>
                </button>
              </Link>
            </div>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                Create custom word search puzzles for your students.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                <h3 className="font-medium text-blue-800 mb-2">Features:</h3>
                <ul className="text-sm text-blue-700 text-left space-y-1">
                  <li>• Customizable grid size (5×5 to 30×30)</li>
                  <li>• Words placed in 8 directions (horizontal, vertical, diagonal)</li>
                  <li>• Automatic random letter filling</li>
                  <li>• Export puzzles with answer keys</li>
                  <li>• Perfect for vocabulary practice and classroom activities</li>
                </ul>
              </div>
              <Link to="/word-search">
                <button className="mt-4 px-6 py-3 btn-primary">
                  Start Creating Word Searches
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={addClass}
      />

      <CreateLearningWheelModal
        isOpen={isCreateLearningWheelModalOpen}
        onClose={() => setIsCreateLearningWheelModalOpen(false)}
        onSave={addLearningWheel}
      />
    </div>
  );
}