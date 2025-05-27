import { addDays, subDays, subMonths, startOfYear } from 'date-fns';

interface DashboardProps {}

export default function DashboardPage({}: DashboardProps) {
  // ... existing code ...
  const percentPontos = getPercentChange(curr?.total_pontos || 0, prev?.total_pontos || 0);
  if (prevStatsArr?.length > 0) {
    prevAst = prevStatsArr.reduce((a, b) => a + (b?.total_assistencias || 0), 0);
  }
  // ...
  <tr key={j?.id || idx}>
    <td>{j?.numero || '-'}</td>
    <td>{j?.nome || '-'}</td>
    <td>{j?.posicao || '-'}</td>
    <td>{j?.total_pontos ?? j?.pontos ?? 0}</td>
    <td>{j?.total_rebotes ?? j?.rebotes ?? 0}</td>
    <td>{j?.total_assistencias ?? j?.assistencias ?? 0}</td>
  </tr>
  // ... existing code ...
} 