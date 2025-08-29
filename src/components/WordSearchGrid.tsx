interface WordSearchGridProps {
  grid: string[][];
}

export default function WordSearchGrid({ grid }: WordSearchGridProps) {
  if (!grid || grid.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No grid to display</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div 
        className="inline-grid border-2 border-gray-400 bg-white"
        style={{
          gridTemplateColumns: `repeat(${grid[0]?.length || 0}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${grid.length}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, rowIndex) => (
          row.map((char, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="flex items-center justify-center border border-gray-300 text-lg font-mono font-bold text-gray-800 hover:bg-yellow-100 transition-colors cursor-pointer"
              style={{ width: '32px', height: '32px' }}
            >
              {char}
            </div>
          ))
        ))}
      </div>
    </div>
  );
}