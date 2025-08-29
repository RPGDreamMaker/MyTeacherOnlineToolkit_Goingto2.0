import { useState, FormEvent, useRef } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: { firstName: string; lastName: string }[]) => void;
}

export default function ImportStudentsModal({
  isOpen,
  onClose,
  onImport,
}: ImportStudentsModalProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function parseStudents(text: string): { firstName: string; lastName: string }[] {
    const lines = text.trim().split('\n');
    const students: { firstName: string; lastName: string }[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const words = line.trim().split(' ');
      if (words.length < 2) {
        errors.push(`Line ${index + 1}: Invalid format. Expected "LASTNAME Firstname"`);
        return;
      }

      // Find where the last name ends by looking for the last word in all caps
      let lastNameEndIndex = -1;
      for (let i = 0; i < words.length; i++) {
        if (words[i] === words[i].toUpperCase()) {
          lastNameEndIndex = i;
        } else {
          break;
        }
      }

      if (lastNameEndIndex === -1) {
        errors.push(`Line ${index + 1}: Last name should be in capital letters`);
        return;
      }

      const lastName = words.slice(0, lastNameEndIndex + 1).join(' ');
      const firstName = words.slice(lastNameEndIndex + 1).join(' ').trim();

      if (!lastName || !firstName) {
        errors.push(`Line ${index + 1}: Missing ${!lastName ? 'last name' : 'first name'}`);
        return;
      }

      students.push({ firstName, lastName });
    });

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    return students;
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setText(text);
      setError('');
    } catch (err) {
      setError('Failed to read file');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const students = parseStudents(text);
      if (students.length === 0) {
        throw new Error('No valid students found in the file');
      }
      await onImport(students);
      setText('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import students');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="modal-title">Import Students</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">File Format Instructions</h3>
            <p className="text-sm text-blue-700">
              Upload a text file or paste your student list with one student per line in the format:
              <br />
              <code className="bg-blue-100 px-2 py-1 rounded">LASTNAME Firstname</code>
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Example:
              <br />
              <code className="bg-blue-100 px-2 py-1 rounded block mt-1">
                SMITH John<br />
                DUPONT MARTIN Marie
              </code>
            </p>
            <div className="text-sm text-blue-700 mt-2">
              Requirements:
              <ul className="list-disc ml-4 mt-1">
                <li>Last name must be in CAPITAL LETTERS (can be multiple words)</li>
                <li>First name follows after the last capitalized word</li>
                <li>One student per line</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="form-label">
                  Student List
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Upload File
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setError('');
                }}
                rows={10}
                className="form-input"
                placeholder="LASTNAME Firstname&#10;LASTNAME Firstname&#10;..."
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Import Error</span>
                </div>
                <pre className="mt-2 whitespace-pre-wrap">{error}</pre>
              </div>
            )}

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
                disabled={isLoading || !text.trim()}
                className="flex items-center gap-2 btn-primary disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {isLoading ? 'Importing...' : 'Import Students'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}