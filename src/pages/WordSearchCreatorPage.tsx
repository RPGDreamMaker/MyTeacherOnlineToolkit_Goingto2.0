import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Grid, Search, Download, RotateCcw, FileText } from 'lucide-react';
import WordSearchGrid from '../components/WordSearchGrid';
import { generateWordSearch } from '../utils/wordSearchGenerator';

interface VocabularyEntry {
  english: string;
  french: string;
}

interface WordSearchData {
  grid: string[][];
  words: string[];
  vocabularyList: VocabularyEntry[];
  placedWords: Array<{
    word: string;
    startRow: number;
    startCol: number;
    direction: string;
  }>;
}

const DIRECTION_OPTIONS = [
  { key: 'horizontal', label: 'Horizontal →', description: 'Left to right' },
  { key: 'vertical', label: 'Vertical ↓', description: 'Top to bottom' },
  { key: 'diagonal-down-right', label: 'Diagonal ↘', description: 'Top-left to bottom-right' },
  { key: 'diagonal-down-left', label: 'Diagonal ↙', description: 'Top-right to bottom-left' },
  { key: 'horizontal-reverse', label: 'Horizontal ←', description: 'Right to left (backwards)' },
  { key: 'vertical-reverse', label: 'Vertical ↑', description: 'Bottom to top (backwards)' },
  { key: 'diagonal-up-right', label: 'Diagonal ↗', description: 'Bottom-left to top-right (backwards)' },
  { key: 'diagonal-up-left', label: 'Diagonal ↖', description: 'Bottom-right to top-left (backwards)' },
];

export default function WordSearchCreatorPage() {
  const [wordSearchTitle, setWordSearchTitle] = useState('Vocabulary Word Search');
  const [wordsInput, setWordsInput] = useState('');
  const [rows, setRows] = useState(15);
  const [cols, setCols] = useState(15);
  const [selectedDirections, setSelectedDirections] = useState<Set<string>>(
    new Set(['horizontal', 'vertical', 'diagonal-down-right', 'diagonal-down-left'])
  );
  const [generatedData, setGeneratedData] = useState<WordSearchData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  function handleDirectionToggle(directionKey: string) {
    const newDirections = new Set(selectedDirections);
    if (newDirections.has(directionKey)) {
      newDirections.delete(directionKey);
    } else {
      newDirections.add(directionKey);
    }
    setSelectedDirections(newDirections);
  }

  function selectAllDirections() {
    setSelectedDirections(new Set(DIRECTION_OPTIONS.map(d => d.key)));
  }

  function selectBasicDirections() {
    setSelectedDirections(new Set(['horizontal', 'vertical']));
  }

  function selectNoBackwards() {
    setSelectedDirections(new Set(['horizontal', 'vertical', 'diagonal-down-right', 'diagonal-down-left']));
  }

  function parseVocabularyInput(input: string): { vocabularyList: VocabularyEntry[], englishWords: string[] } {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const vocabularyList: VocabularyEntry[] = [];
    const englishWords: string[] = [];

    for (const line of lines) {
      if (line.includes(' - ')) {
        // Vocabulary format: "English - French"
        const [english, french] = line.split(' - ', 2);
        const cleanEnglish = english.trim().toUpperCase().replace(/[^A-Z]/g, '');
        const cleanFrench = french.trim();
        
        if (cleanEnglish.length > 0 && cleanFrench.length > 0) {
          vocabularyList.push({
            english: cleanEnglish,
            french: cleanFrench
          });
          englishWords.push(cleanEnglish);
        }
      } else {
        // Regular word format
        const cleanWord = line.trim().toUpperCase().replace(/[^A-Z]/g, '');
        if (cleanWord.length > 0) {
          vocabularyList.push({
            english: cleanWord,
            french: '' // No translation provided
          });
          englishWords.push(cleanWord);
        }
      }
    }

    return { vocabularyList, englishWords };
  }

  async function handleGenerate() {
    const { vocabularyList, englishWords } = parseVocabularyInput(wordsInput);

    if (englishWords.length === 0) {
      setError('Please enter at least one word or vocabulary pair');
      return;
    }

    if (englishWords.some(word => word.length > Math.max(rows, cols))) {
      setError('Some words are too long for the grid size');
      return;
    }

    if (selectedDirections.size === 0) {
      setError('Please select at least one direction');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const allowedDirections = Array.from(selectedDirections);
      const result = await generateWordSearch(englishWords, rows, cols, allowedDirections);
      
      // Combine the word search result with vocabulary data
      setGeneratedData({
        ...result,
        vocabularyList
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate word search');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownloadHtml() {
    if (!generatedData) return;

    // Generate the grid HTML
    const gridHTML = generatedData.grid.map(row =>
      `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
    ).join('');

   // Generate English words list with numbers (only words that were placed in the grid)
    const placedWordsSet = new Set(generatedData.placedWords.map(pw => pw.word));
    const filteredEnglishEntries = generatedData.vocabularyList
      .filter(entry => placedWordsSet.has(entry.english));

    // Divide words into three columns
    const totalWords = filteredEnglishEntries.length;
    const wordsPerColumn = Math.ceil(totalWords / 3);

    const column1Words = filteredEnglishEntries.slice(0, wordsPerColumn);
    const column2Words = filteredEnglishEntries.slice(wordsPerColumn, wordsPerColumn * 2);
    const column3Words = filteredEnglishEntries.slice(wordsPerColumn * 2);

    const englishWordsHTMLCol1 = column1Words.map((entry, index) => `<li>${index + 1}. ${entry.english}</li>`).join('');
    const englishWordsHTMLCol2 = column2Words.map((entry, index) => `<li>${column1Words.length + index + 1}. ${entry.english}</li>`).join('');
    const englishWordsHTMLCol3 = column3Words.map((entry, index) => `<li>${column1Words.length + column2Words.length + index + 1}. ${entry.english}</li>`).join('');

    // Generate French translations list (only for words with translations that were placed)
    let frenchCounter = 0;
    const frenchTranslationsHTML = generatedData.vocabularyList
      .filter(entry => placedWordsSet.has(entry.english) && entry.french)
      .map(entry => {
        frenchCounter++;
        return `<li>${frenchCounter}. ${entry.french}</li>`;
      })
      .join('');

    // Check if we have any French translations
    const hasFrenchTranslations = generatedData.vocabularyList.some(entry => entry.french && placedWordsSet.has(entry.english));

    // Calculate optimal sizes based on grid dimensions and fixed container size
    const targetGridDimension = 596; // 600px grid-container width/height minus 2px table border on each side (2*2=4px)
    const cellSize = Math.min(targetGridDimension / cols, targetGridDimension / rows);
    const fontSize = cellSize * 0.55; // Adjust as needed for optimal text fit

    // Create the complete HTML document
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${wordSearchTitle}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 20px;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: Arial, sans-serif;
        color: #000;
        line-height: 1.2;
        font-size: 10px;
        width: 794px;
        height: 1123px;
        margin: 0 auto;
        padding: 20px;
        overflow: hidden;
      }

      h1 {
        text-align: center;
        margin-bottom: 15px;
        font-size: 18px;
        color: #2563eb;
        height: 25px;
        line-height: 25px;
      }

      .main-container {
        display: flex;
        gap: 15px;
        height: 1063px;
        overflow: hidden;
      }

      .left-section {
        width: 600px;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
      }

      .grid-container {
        height: 600px;
        width: 600px;
        display: flex;
        justify-content: center;
        margin-bottom: 15px;
      }

      table {
        border-collapse: collapse;
        border: 2px solid #374151;
      }

      td {
        width: ${cellSize}px;
        height: ${cellSize}px;
        border: 1px solid #6b7280;
        text-align: center;
        vertical-align: middle;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        font-size: ${fontSize}px;
        background-color: #f9fafb;
        padding: 0;
        line-height: ${cellSize}px;
      }

      .words-section {
        flex: 1;
        background-color: #f8f9fa;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        padding: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .words-columns-container {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(3, 1fr); 
        gap: 10px;
        overflow: hidden; 
      }

      .word-column {
        display: flex;
        flex-direction: column;
        justify-content: space-between; 
        height: 100%;
      }

      .words-section ol {
        list-style-type: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
      }

      .words-section li {
        break-inside: avoid;
        font-size: 12px;
        line-height: 1.3;
        font-weight: 500;
        padding: 1px 0;
      }

      .french-section {
        width: ${hasFrenchTranslations ? '140px' : '0px'};
        height: ${hasFrenchTranslations ? '1063px' : '0px'};
        background-color: #f8f9fa;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        padding: 8px;
        overflow: hidden;
        flex-shrink: 0;
        ${!hasFrenchTranslations ? 'display: none;' : ''}
      }

      .french-section ol {
        list-style-type: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        overflow: hidden;
      }

      .french-section li {
        margin-bottom: 0;
        break-inside: avoid;
        font-size: 12px;
        line-height: 1.3;
        padding: 1px 0;
        font-weight: 400;
      }

      @media print {
        body {
          width: 794px !important;
          height: 1123px !important;
          margin: 0 !important;
          padding: 20px !important;
          overflow: hidden !important;
        }

        .main-container {
          height: 1063px !important;
          overflow: hidden !important;
        }

        .words-section, .french-section {
          background-color: white !important;
          border: 1px solid #000 !important;
          overflow: hidden !important;
        }

        td {
          background-color: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        * {
          page-break-inside: avoid !important;
        }

        .main-container {
          page-break-inside: avoid !important;
        }
      }
    </style>
  </head>
  <body>
    <h1>${wordSearchTitle}</h1>

    <div class="main-container">
      <div class="left-section">
        <div class="grid-container">
          <table>
            ${gridHTML}
          </table>
        </div>

        <div class="words-section">
          <div class="words-columns-container">
            <div class="word-column">
              <ol>${englishWordsHTMLCol1}</ol>
            </div>
            <div class="word-column">
              <ol>${englishWordsHTMLCol2}</ol>
            </div>
            <div class="word-column">
              <ol>${englishWordsHTMLCol3}</ol>
            </div>
          </div>
        </div>
      </div>

      <div class="french-section">
        <ol>
          ${frenchTranslationsHTML}
        </ol>
      </div>
    </div>
  </body>
</html>`;

    // Create and download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wordSearchTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-puzzle.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleExport() {
    if (!generatedData) return;

    const content = [
      wordSearchTitle.toUpperCase(),
      '='.repeat(wordSearchTitle.length),
      '',
      'Grid:',
      ...generatedData.grid.map(row => row.join(' ')),
      '',
      'Words to find:',
      ...generatedData.vocabularyList.map((entry, index) => {
        if (entry.french) {
          return `${index + 1}. ${entry.english} - ${entry.french}`;
        } else {
          return `${index + 1}. ${entry.english}`;
        }
      }),
      '',
      'Answer Key:',
      ...generatedData.placedWords.map(item => 
        `${item.word}: Row ${item.startRow + 1}, Col ${item.startCol + 1}, Direction: ${item.direction}`
      ),
      '',
      `Generated on: ${new Date().toLocaleDateString()}`
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wordSearchTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-puzzle.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setGeneratedData(null);
    setError('');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-6 w-6 text-gray-600" />
              <h1 className="page-title">Vocabulary Word Search Creator</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Title Input */}
              <div className="lg:col-span-3 mb-4">
                <label htmlFor="title" className="form-label">
                  Word Search Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={wordSearchTitle}
                  onChange={(e) => setWordSearchTitle(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Travel Vocabulary, Science Terms, etc."
                />
              </div>

              {/* Words Input */}
              <div>
                <label htmlFor="words" className="form-label">
                  Vocabulary Words
                </label>
                <textarea
                  id="words"
                  value={wordsInput}
                  onChange={(e) => setWordsInput(e.target.value)}
                  rows={12}
                  className="form-input"
                  placeholder="Travel - Voyager&#10;Trip - Voyage&#10;Luggage - Valise (US)&#10;Suitcase - Valise (GB)&#10;Bag - Sac&#10;Backpack - Sac à dos&#10;Clothes - Vêtements&#10;T-shirt - T-shirt&#10;Jumper - Pull-over&#10;Raincoat - Imperméable"
                />
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 text-sm mb-1">Input Format:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• <strong>Vocabulary:</strong> English - French (e.g., "Travel - Voyager")</li>
                    <li>• <strong>Regular words:</strong> Just the word (e.g., "APPLE")</li>
                    <li>• One entry per line</li>
                    <li>• English words will be placed in the grid</li>
                    <li>• French translations appear in the word list</li>
                  </ul>
                </div>
              </div>

              {/* Grid Settings */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="rows" className="form-label">
                    Grid Rows
                  </label>
                  <input
                    type="number"
                    id="rows"
                    value={rows}
                    onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                    min="5"
                    max="30"
                    className="form-input"
                  />
                </div>
                <div>
                  <label htmlFor="cols" className="form-label">
                    Grid Columns
                  </label>
                  <input
                    type="number"
                    id="cols"
                    value={cols}
                    onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                    min="5"
                    max="30"
                    className="form-input"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Grid className="h-5 w-5" />
                  {isGenerating ? 'Generating...' : 'Generate Word Search'}
                </button>
                {generatedData && (
                  <div className="space-y-2">
                    <button
                      onClick={handleDownloadHtml}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Download HTML
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={handleExport}
                        className="btn-secondary flex-1 flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export TXT
                      </button>
                      <button
                        onClick={handleReset}
                        className="btn-secondary flex-1 flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Direction Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="form-label">
                    Word Directions ({selectedDirections.size} selected)
                  </label>
                </div>
                
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={selectAllDirections}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    All
                  </button>
                  <button
                    onClick={selectBasicDirections}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    Basic
                  </button>
                  <button
                    onClick={selectNoBackwards}
                    className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                  >
                    No Backwards
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {DIRECTION_OPTIONS.map((direction) => (
                    <div key={direction.key} className="flex items-start">
                      <input
                        type="checkbox"
                        id={direction.key}
                        checked={selectedDirections.has(direction.key)}
                        onChange={() => handleDirectionToggle(direction.key)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                      />
                      <label htmlFor={direction.key} className="ml-2 block text-sm">
                        <span className="font-medium text-gray-700">{direction.label}</span>
                        <br />
                        <span className="text-gray-500 text-xs">{direction.description}</span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 text-sm mb-1">Difficulty Tips:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• <strong>Easy:</strong> Horizontal + Vertical only</li>
                    <li>• <strong>Medium:</strong> Add diagonal directions</li>
                    <li>• <strong>Hard:</strong> Include backwards directions</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {generatedData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="section-heading mb-4">{wordSearchTitle}</h2>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 flex flex-col items-center gap-6">
                  <WordSearchGrid grid={generatedData.grid} />
                  
                  {/* English words list - 3 columns, no title */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 w-full max-w-2xl">
                    <div className="grid grid-cols-3 gap-4">
                      {generatedData.vocabularyList
                        .filter(entry => generatedData.placedWords.some(pw => pw.word === entry.english))
                        .map((entry, index) => (
                          <div key={index} className="text-gray-700 font-mono text-sm">
                            <span className="font-bold">{index + 1}. {entry.english}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                
                {/* French translations - smaller font, no title */}
                {generatedData.vocabularyList.some(entry => entry.french) && (
                  <div className="lg:w-1/3">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="space-y-1">
                        {generatedData.vocabularyList
                          .filter(entry => entry.french && generatedData.placedWords.some(pw => pw.word === entry.english))
                          .map((entry, index) => (
                            <div key={index} className="text-gray-600 text-xs">
                              <span>{index + 1}. {entry.french}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Statistics:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>Grid size: {rows} × {cols}</li>
                  <li>Words placed: {generatedData.placedWords.length}</li>
                  <li>Words requested: {generatedData.vocabularyList.length}</li>
                  <li>Success rate: {Math.round((generatedData.placedWords.length / generatedData.vocabularyList.length) * 100)}%</li>
                  <li>Directions used: {selectedDirections.size}</li>
                  <li>Vocabulary pairs: {generatedData.vocabularyList.filter(entry => entry.french).length}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}