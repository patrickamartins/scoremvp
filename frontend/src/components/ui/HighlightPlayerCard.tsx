interface HighlightPlayerCardProps {
  title: string;
  value: string | number;
  playerName: string;
  playerImage: string;
  legend?: string;
}

export function HighlightPlayerCard({ title, value, playerName, playerImage, legend }: HighlightPlayerCardProps) {
  return (
    <div className="flex flex-col items-center bg-white rounded shadow p-4 min-w-[220px]">
      <div className="font-bold text-lg mb-2 text-center">{title}</div>
      <img
        src={playerImage}
        alt={playerName}
        className="w-20 h-20 object-cover rounded-full border mb-2"
        style={{ background: '#f3f3f3' }}
      />
      <div className="font-semibold text-center mb-1">{playerName}</div>
      <div className="text-3xl font-extrabold text-blue-700 mb-1">{value}</div>
      {legend && <div className="text-xs text-gray-500 text-center">{legend}</div>}
    </div>
  );
} 