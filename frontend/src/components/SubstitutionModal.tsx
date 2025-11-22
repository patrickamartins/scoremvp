import React, { useState } from 'react';
import { Player } from '../types/player';

interface SubstitutionModalProps {
  onClose: () => void;
  onSubstitute: (playerId: number) => void;
  benchPlayers: Player[];
  currentPlayerName: string;
}

export function SubstitutionModal({
  onClose,
  onSubstitute,
  benchPlayers,
  currentPlayerName,
}: SubstitutionModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedPlayerId !== null) {
      onSubstitute(selectedPlayerId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Substituir Jogador</h3>
        <p className="text-sm text-gray-600 mb-4">
          Substituindo: <span className="font-semibold">{currentPlayerName}</span>
        </p>

        {benchPlayers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Não há jogadores disponíveis no banco.</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto mb-4">
            <div className="space-y-2">
              {benchPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedPlayerId === player.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                      {player.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{player.name}</div>
                      <div className="text-xs text-gray-500">
                        #{player.number} - {player.position}
                      </div>
                    </div>
                    {selectedPlayerId === player.id && (
                      <div className="text-blue-600">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedPlayerId === null}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

