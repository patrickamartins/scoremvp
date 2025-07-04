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

function getTotals(data: PlayerStats[]) {
  const sum = (key: keyof PlayerStats) => data.reduce((acc, p) => acc + (Number(p[key]) || 0), 0);
  return {
    pts: sum('pts'),
    p2pts: sum('p2pts'),
    p3pts: sum('p3pts'),
    pll: sum('pll'),
    rebo: sum('rebo'),
    rebd: sum('rebd'),
    treb: sum('treb'),
    ass: sum('ass'),
    err: sum('err'),
    rb: sum('rb'),
    t: sum('t'),
    tr: sum('tr'),
    fp: sum('fp'),
    fr: sum('fr'),
    plusMinus: sum('plusMinus'),
    ef: sum('ef'),
  };
}

export function PlayersStatsTable({ data }: PlayersStatsTableProps) {
  const totals = getTotals(data);
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
            <tr key={player.no + '-' + idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
          <tr className="bg-gray-100 font-bold">
            <td className="px-2 py-1 text-center" colSpan={4}>TOTAL</td>
            <td className="px-2 py-1 text-center">{totals.pts}</td>
            <td className="px-2 py-1 text-center"></td>
            <td className="px-2 py-1 text-center"></td>
            <td className="px-2 py-1 text-center"></td>
            <td className="px-2 py-1 text-center">{totals.p2pts}</td>
            <td className="px-2 py-1 text-center"></td>
            <td className="px-2 py-1 text-center">{totals.p3pts}</td>
            <td className="px-2 py-1 text-center"></td>
            <td className="px-2 py-1 text-center">{totals.pll}</td>
            <td className="px-2 py-1 text-center">{totals.rebo}</td>
            <td className="px-2 py-1 text-center">{totals.rebd}</td>
            <td className="px-2 py-1 text-center">{totals.treb}</td>
            <td className="px-2 py-1 text-center">{totals.ass}</td>
            <td className="px-2 py-1 text-center">{totals.err}</td>
            <td className="px-2 py-1 text-center">{totals.rb}</td>
            <td className="px-2 py-1 text-center">{totals.t}</td>
            <td className="px-2 py-1 text-center">{totals.tr}</td>
            <td className="px-2 py-1 text-center">{totals.fp}</td>
            <td className="px-2 py-1 text-center">{totals.fr}</td>
            <td className="px-2 py-1 text-center">{totals.plusMinus}</td>
            <td className="px-2 py-1 text-center">{totals.ef}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
} 