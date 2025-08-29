interface VocabularyEntry {
  english: string;
  french: string;
}

interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: string;
}

interface WordSearchResult {
  grid: string[][];
  words: string[];
  placedWords: PlacedWord[];
}

const DIRECTIONS = [
  { key: 'horizontal', name: 'Horizontal', dr: 0, dc: 1 },
  { key: 'vertical', name: 'Vertical', dr: 1, dc: 0 },
  { key: 'diagonal-down-right', name: 'Diagonal Down-Right', dr: 1, dc: 1 },
  { key: 'diagonal-down-left', name: 'Diagonal Down-Left', dr: 1, dc: -1 },
  { key: 'horizontal-reverse', name: 'Horizontal Reverse', dr: 0, dc: -1 },
  { key: 'vertical-reverse', name: 'Vertical Reverse', dr: -1, dc: 0 },
  { key: 'diagonal-up-right', name: 'Diagonal Up-Right', dr: -1, dc: 1 },
  { key: 'diagonal-up-left', name: 'Diagonal Up-Left', dr: -1, dc: -1 },
];

function canPlaceWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: { dr: number; dc: number }
): boolean {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * direction.dr;
    const col = startCol + i * direction.dc;

    // Check bounds
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
      return false;
    }

    // Check if cell is empty or contains the same letter
    const currentCell = grid[row][col];
    if (currentCell !== '' && currentCell !== word[i]) {
      return false;
    }
  }

  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: { dr: number; dc: number }
): void {
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * direction.dr;
    const col = startCol + i * direction.dc;
    grid[row][col] = word[i];
  }
}

function findValidPlacements(
  grid: string[][],
  word: string,
  allowedDirections: string[]
): Array<{ row: number; col: number; direction: typeof DIRECTIONS[0] }> {
  const placements = [];
  const rows = grid.length;
  const cols = grid[0].length;

  // Filter directions based on allowed directions
  const filteredDirections = DIRECTIONS.filter(dir => allowedDirections.includes(dir.key));

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      for (const direction of filteredDirections) {
        if (canPlaceWord(grid, word, row, col, direction)) {
          placements.push({ row, col, direction });
        }
      }
    }
  }

  return placements;
}

function fillEmptyCells(grid: string[][]): void {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] === '') {
        // Generate a random letter
        grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }
}

export async function generateWordSearch(
  words: string[],
  rows: number,
  cols: number,
  allowedDirections: string[] = ['horizontal', 'vertical', 'diagonal-down-right', 'diagonal-down-left']
): Promise<WordSearchResult> {
  return new Promise((resolve, reject) => {
    // Use setTimeout to prevent blocking the UI
    setTimeout(() => {
      try {
        // Validate inputs
        if (words.length === 0) {
          throw new Error('No words provided');
        }

        if (rows < 5 || cols < 5 || rows > 30 || cols > 30) {
          throw new Error('Grid size must be between 5x5 and 30x30');
        }

        if (allowedDirections.length === 0) {
          throw new Error('At least one direction must be allowed');
        }

        // Filter and validate words
        const validWords = words
          .filter(word => word.length > 0 && word.length <= Math.max(rows, cols))
          .map(word => word.toUpperCase().replace(/[^A-Z]/g, ''))
          .filter(word => word.length > 0);

        if (validWords.length === 0) {
          throw new Error('No valid words found');
        }

        // Initialize empty grid
        const grid: string[][] = Array(rows).fill(0).map(() => Array(cols).fill(''));
        const placedWords: PlacedWord[] = [];
        const failedWords: string[] = [];

        // Sort words by length (longest first) for better placement success
        const sortedWords = [...validWords].sort((a, b) => b.length - a.length);

        // Try to place each word
        for (const word of sortedWords) {
          const validPlacements = findValidPlacements(grid, word, allowedDirections);
          
          if (validPlacements.length > 0) {
            // Randomly select one of the valid placements
            const placement = validPlacements[Math.floor(Math.random() * validPlacements.length)];
            
            placeWord(grid, word, placement.row, placement.col, placement.direction);
            placedWords.push({
              word,
              startRow: placement.row,
              startCol: placement.col,
              direction: placement.direction.name,
            });
          } else {
            failedWords.push(word);
          }
        }

        // Fill empty cells with random letters
        fillEmptyCells(grid);

        // If no words were placed, throw an error
        if (placedWords.length === 0) {
          throw new Error('Could not place any words in the grid. Try using a larger grid, shorter words, or more directions.');
        }

        resolve({
          grid,
          words: validWords,
          placedWords,
        });
      } catch (error) {
        reject(error);
      }
    }, 100); // Small delay to allow UI to update
  });
}

export type { VocabularyEntry, WordSearchResult, PlacedWord };