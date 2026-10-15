import { useMemo } from 'react';

const COLORS = [
  '#00e5ff', // cyan
  '#00b4ff', // electric blue
  '#7b5cff', // purple
  '#e040fb', // magenta
  '#00c9a7', // teal
  '#00e676', // emerald
  '#1de9b6', // aqua
  '#651fff', // deep purple
  '#00bcd4', // teal blue
  '#18ffff', // bright cyan
];

function getRandomColor(seed: number) {
  return COLORS[seed % COLORS.length];
}

export default function MosaicBackground() {
  const cols = 24;
  const rows = 16;

  const tiles = useMemo(() => {
    const result = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seed = r * cols + c;
        result.push({
          id: seed,
          color: getRandomColor(seed * 7 + 13),
          delay: ((seed * 17) % 40) / 10, // 0–4s staggered
        });
      }
    }
    return result;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="grid w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '1px',
          backgroundColor: '#000',
        }}
      >
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className="tile-animate"
            style={{
              backgroundColor: tile.color,
              animationDelay: `${tile.delay}s`,
            }}
          />
        ))}
      </div>
      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center 40%, rgba(5,13,24,0.25) 0%, rgba(5,13,24,0.55) 50%, rgba(5,13,24,0.85) 100%)',
        }}
      />
    </div>
  );
}
