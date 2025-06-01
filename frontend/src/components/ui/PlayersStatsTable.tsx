interface PlayerStats {
  no: number;
  name: string;
  pos: string;
  min: string;
  pts: number;
  aq: string;
  ac: string;
  p2: string;
  p2pts: number;
  p3: string;
  p3pts: number;
  ll: string;
  pll: number;
  rebo: number;
  rebd: number;
  treb: number;
  ass: number;
  err: number;
  rb: number;
  t: number;
  tr: number;
  fp: number;
  fr: number;
  plusMinus: number;
  ef: number;
}

interface PlayersStatsTableProps {
  data: PlayerStats[];
}

export function PlayersStatsTable({ data }: PlayersStatsTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded shadow p-4 mb-8">
      <table className="min-w-full text-xs md:text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-2 py-1">NO.</th>
            <th className="px-2 py-1 text-left">JOGADOR</th>
            <th className="px-2 py-1">POS</th>
            <th className="px-2 py-1">MIN</th>
            <th className="px-2 py-1">PTS</th>
            <th className="px-2 py-1">AQ</th>
            <th className="px-2 py-1">AC</th>
            <th className="px-2 py-1">2P</th>
            <th className="px-2 py-1">2PTS</th>
            <th className="px-2 py-1">3P</th>
            <th className="px-2 py-1">3PTS</th>
            <th className="px-2 py-1">LL</th>
            <th className="px-2 py-1">PLL</th>
            <th className="px-2 py-1">REBO</th>
            <th className="px-2 py-1">REBD</th>
            <th className="px-2 py-1">TREB</th>
            <th className="px-2 py-1">ASS</th>
            <th className="px-2 py-1">ERR</th>
            <th className="px-2 py-1">RB</th>
            <th className="px-2 py-1">T</th>
            <th className="px-2 py-1">TR</th>
            <th className="px-2 py-1">FP</th>
            <th className="px-2 py-1">FR</th>
            <th className="px-2 py-1">+/- PTS</th>
            <th className="px-2 py-1">EF</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player, idx) => (
            <tr key={player.no} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-2 py-1 text-center font-bold">{player.no}</td>
              <td className="px-2 py-1 text-left whitespace-nowrap">{player.name}</td>
              <td className="px-2 py-1 text-center">{player.pos}</td>
              <td className="px-2 py-1 text-center">{player.min}</td>
              <td className="px-2 py-1 text-center">{player.pts}</td>
              <td className="px-2 py-1 text-center">{player.aq}</td>
              <td className="px-2 py-1 text-center">{player.ac}</td>
              <td className="px-2 py-1 text-center">{player.p2}</td>
              <td className="px-2 py-1 text-center">{player.p2pts}</td>
              <td className="px-2 py-1 text-center">{player.p3}</td>
              <td className="px-2 py-1 text-center">{player.p3pts}</td>
              <td className="px-2 py-1 text-center">{player.ll}</td>
              <td className="px-2 py-1 text-center">{player.pll}</td>
              <td className="px-2 py-1 text-center">{player.rebo}</td>
              <td className="px-2 py-1 text-center">{player.rebd}</td>
              <td className="px-2 py-1 text-center">{player.treb}</td>
              <td className="px-2 py-1 text-center">{player.ass}</td>
              <td className="px-2 py-1 text-center">{player.err}</td>
              <td className="px-2 py-1 text-center">{player.rb}</td>
              <td className="px-2 py-1 text-center">{player.t}</td>
              <td className="px-2 py-1 text-center">{player.tr}</td>
              <td className="px-2 py-1 text-center">{player.fp}</td>
              <td className="px-2 py-1 text-center">{player.fr}</td>
              <td className="px-2 py-1 text-center">{player.plusMinus}</td>
              <td className="px-2 py-1 text-center">{player.ef}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 