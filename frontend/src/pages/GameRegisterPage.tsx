import React, { useState } from "react";
import { Card, Button, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui';
import { useGameStats } from '../hooks/useGameStats';
import type { Player } from '../types/game';
import { toast } from 'sonner';

const GameRegisterPage: React.FC = () => {
  const { game, setGame, stats, addStat, undoLastAction, resetStats, saveGame } = useGameStats();
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({ name: "", number: 0 });

  const handleGameChange = (field: string, value: any) => {
    setGame((prev: any) => prev ? { ...prev, [field]: value } : {
      id: Date.now().toString(),
      name: "",
      category: "sub-13",
      location: "",
      date: "",
      time: "",
      players: [],
      stats: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      [field]: value
    });
  };

  const handleAddPlayer = () => {
    if (!newPlayer.name || !newPlayer.number) {
      toast.error("Preencha todos os campos do jogador");
      return;
    }
    const player: Player = {
      id: Date.now().toString(),
      name: newPlayer.name,
      number: newPlayer.number,
    };
    setGame((prev: any) => prev ? {
      ...prev,
      players: [...(prev.players ?? []), player]
    } : null);
    setNewPlayer({ name: "", number: 0 });
  };

  const handleAddStat = (statType: string) => {
    if (!selectedPlayer) {
      toast.error("Selecione um jogador");
      return;
    }
    addStat(selectedPlayer, statType as any);
  };

  const handleSave = async () => {
    try {
      await saveGame();
      toast.success("Jogo salvo com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar o jogo");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Informações do Jogo */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-eerieblack">Informações do Jogo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Jogo</Label>
              <Input
                id="name"
                value={game?.name || ""}
                onChange={(e: any) => handleGameChange("name", e.target.value)}
                placeholder="Ex: Jogo 1"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={game?.category || "sub-13"}
                onValueChange={(value: any) => handleGameChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sub-13">Sub-13</SelectItem>
                  <SelectItem value="sub-15">Sub-15</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={game?.location || ""}
                onChange={(e: any) => handleGameChange("location", e.target.value)}
                placeholder="Local do jogo"
              />
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={game?.date || ""}
                onChange={(e: any) => handleGameChange("date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={game?.time || ""}
                onChange={(e: any) => handleGameChange("time", e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Adicionar Jogadores */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-eerieblack">Jogadores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="playerName">Nome do Jogador</Label>
              <Input
                id="playerName"
                value={newPlayer.name}
                onChange={(e: any) => setNewPlayer((prev: any) => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do jogador"
              />
            </div>
            <div>
              <Label htmlFor="playerNumber">Número</Label>
              <Input
                id="playerNumber"
                type="number"
                value={newPlayer.number || ""}
                onChange={(e: any) => setNewPlayer((prev: any) => ({ ...prev, number: parseInt(e.target.value) }))}
                placeholder="Número"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddPlayer} className="w-full">Adicionar Jogador</Button>
            </div>
          </div>

          {/* Lista de Jogadores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(game?.players ?? []).map((player) => (
              <div key={player.id} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">{player.name}</p>
                <p className="text-sm text-gray-600">#{player.number}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Estatísticas */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-eerieblack">Estatísticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="playerSelect">Selecione o Jogador</Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um jogador" />
                </SelectTrigger>
                <SelectContent>
                  {(game?.players ?? []).map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} (#{player.number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões de Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <Button onClick={() => handleAddStat("points")}>Ponto (+1)</Button>
            <Button onClick={() => handleAddStat("rebounds")}>Rebote (+1)</Button>
            <Button onClick={() => handleAddStat("assists")}>Assistência (+1)</Button>
            <Button onClick={() => handleAddStat("steals")}>Roubo (+1)</Button>
            <Button onClick={() => handleAddStat("blocks")}>Bloqueio (+1)</Button>
            <Button onClick={() => handleAddStat("fouls")}>Falta (+1)</Button>
          </div>

          {/* Ações */}
          <div className="flex gap-4">
            <Button onClick={undoLastAction} variant="outline">Desfazer</Button>
            <Button onClick={resetStats} variant="outline">Zerar Estatísticas</Button>
            <Button onClick={handleSave}>Salvar Jogo</Button>
          </div>
        </Card>

        {/* Estatísticas Atuais */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-eerieblack">Estatísticas Atuais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((playerStat) => {
              const player = (game?.players ?? []).find((p) => p.id === playerStat.playerId);
              return (
                <div key={playerStat.playerId} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">{player?.name} (#{player?.number})</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p>Pontos: {playerStat.stats.points}</p>
                    <p>Rebotes: {playerStat.stats.rebounds}</p>
                    <p>Assistências: {playerStat.stats.assists}</p>
                    <p>Roubos: {playerStat.stats.steals}</p>
                    <p>Bloqueios: {playerStat.stats.blocks}</p>
                    <p>Faltas: {playerStat.stats.fouls}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GameRegisterPage; 