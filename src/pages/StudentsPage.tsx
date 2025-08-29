import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClassesStore } from '../store/classes';
import { ArrowLeft, Plus, UserPlus, Pencil, Trash2, Upload, UserX } from 'lucide-react';
import CreateStudentModal from '../components/CreateStudentModal';
import EditStudentModal from '../components/EditStudentModal';
import ImportStudentsModal from '../components/ImportStudentsModal';

export default function StudentsPage() {
  const { classId } = useParams<{ classId: string }>();
  const { classes, addStudent, updateStudent, deleteStudent, importStudents } = useClassesStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<{ id: string; firstName: string; lastName: string } | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const classData = classes.find(c => c.id === classId);

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600">Class not found</p>
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const sortedStudents = [...classData.students].sort((a, b) => 
    a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
  );

  function handleClearAllStudents() {
    if (classId) {
      // Delete each student one by one
      classData.students.forEach(student => {
        deleteStudent(classId, student.id);
      });
      setIsConfirmingClear(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="page-title">
                  {classData.name}
                </h1>
                {classData.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {classData.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2 btn-secondary"
                >
                  <Upload className="h-4 w-4" />
                  Import Students
                </button>
                {sortedStudents.length > 0 && (
                  <button
                    onClick={() => setIsConfirmingClear(true)}
                    className="flex items-center gap-2 btn-outline-danger"
                  >
                    <UserX className="h-4 w-4" />
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 btn-primary"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {sortedStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <Plus className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding students to your class.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="inline-flex items-center btn-secondary"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Students
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Name
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.firstName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteStudent(classId, student.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <CreateStudentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={(student) => {
            addStudent(classId, student);
            setIsCreateModalOpen(false);
          }}
        />

        <EditStudentModal
          isOpen={Boolean(editingStudent)}
          onClose={() => setEditingStudent(null)}
          student={editingStudent}
          onSave={(updates) => {
            if (editingStudent) {
              updateStudent(classId, editingStudent.id, updates);
              setEditingStudent(null);
            }
          }}
        />

        <ImportStudentsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={(students) => {
            importStudents(classId, students);
            setIsImportModalOpen(false);
          }}
        />

        {isConfirmingClear && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="modal-title text-gray-900 mb-4">Clear All Students</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove all students from this class? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsConfirmingClear(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllStudents}
                  className="btn-danger"
                >
                  Clear All Students
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}