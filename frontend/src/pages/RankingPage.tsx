import React from "react";
import '../components/ui';
import { Card } from '../components/ui';
import { usePageTitle } from "../hooks/usePageTitle";

const highlights = [
  { name: "Luka Dončić", team: "Los Angeles Lakers", pos: "Armador", points: 30.2, img: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png" },
  { name: "Giannis Antetokounmpo", team: "Milwaukee Bucks", pos: "Ala Pivô", points: 33, img: "https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png" },
  { name: "Donovan Mitchell", team: "Cleveland Cavaliers", pos: "Ala Armador", points: 29.6, img: "https://cdn.nba.com/headshots/nba/latest/1040x760/1628378.png" },
];

const players = [
  { name: "Paolo Banchero", pos: "Ala Pivô", team: "Orlando Magic", points: 29.4 },
  { name: "Jalen Brunson", pos: "Armador", team: "New York Knicks", points: 28.8 },
  { name: "Shai Gilgeous-Alexander", pos: "Armador", team: "Oklahoma City Thunder", points: 28.4 },
  { name: "Jayson Tatum", pos: "Ala", team: "Boston Celtics", points: 28.1 },
  { name: "Nikola Jokic", pos: "Pivô", team: "Denver Nuggets", points: 26.7 },
  { name: "Anthony Edwards", pos: "Ala Armador", team: "Minnesota Timberwolves", points: 26.5 },
  { name: "Franz Wagner", pos: "Ala", team: "Orlando Magic", points: 25.8 },
];

const RankingPage: React.FC = () => {
  usePageTitle("Ranking");

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center">
        {highlights.map((player) => (
          <Card key={player.name} className="flex flex-col items-center p-6 w-full max-w-xs">
            <img src={player.img} alt={player.name} className="w-20 h-20 rounded-full object-cover mb-2 border-4 border-persimoon" />
            <div className="text-2xl font-bold text-persimoon">{player.points}</div>
            <div className="font-semibold text-eerieblack mt-1">{player.name}</div>
            <div className="text-xs text-eerieblack/60">{player.team}</div>
            <div className="text-xs text-eerieblack/60 mb-2">{player.pos}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="font-semibold mb-2">Ranking de Pontos</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-eerieblack/70">
                <th className="px-2 py-1 text-left">Nome</th>
                <th className="px-2 py-1 text-left">Posição</th>
                <th className="px-2 py-1 text-left">Time</th>
                <th className="px-2 py-1 text-left">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.name}>
                  <td className="px-2 py-1">{player.name}</td>
                  <td className="px-2 py-1">{player.pos}</td>
                  <td className="px-2 py-1">{player.team}</td>
                  <td className="px-2 py-1 font-bold text-persimoon">{player.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RankingPage; 