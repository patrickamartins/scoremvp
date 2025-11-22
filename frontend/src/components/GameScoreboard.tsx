import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface GameScoreboardProps {
  homeScore: number;
  awayScore: number;
  onAwayScoreChange: (score: number) => void;
  quarter: number;
  onQuarterChange?: (quarter: number) => void;
  onTimerStateChange?: (isRunning: boolean, time: number) => void;
}

export function GameScoreboard({ 
  homeScore, 
  awayScore, 
  onAwayScoreChange,
  quarter,
  onQuarterChange,
  onTimerStateChange
}: GameScoreboardProps) {
  const [time, setTime] = useState(600); // 10 minutos em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [tempMinutes, setTempMinutes] = useState(10);
  const [tempSeconds, setTempSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousQuarter = useRef(quarter);

  // Resetar cronômetro ao trocar de quarto
  useEffect(() => {
    if (previousQuarter.current !== quarter) {
      setTime(600);
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      previousQuarter.current = quarter;
    }
  }, [quarter]);

  // Gerenciar o cronômetro
  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    if (onTimerStateChange) {
      onTimerStateChange(newState, time);
    }
  };

  // Notificar mudanças de tempo quando o cronômetro está rodando
  useEffect(() => {
    if (onTimerStateChange && isRunning) {
      onTimerStateChange(isRunning, time);
    }
  }, [time, isRunning, onTimerStateChange]);

  const handleTimeClick = () => {
    const currentMinutes = Math.floor(time / 60);
    const currentSeconds = time % 60;
    setTempMinutes(currentMinutes);
    setTempSeconds(currentSeconds);
    setShowTimeModal(true);
  };

  const handleSetTime = () => {
    const newTime = (tempMinutes * 60) + tempSeconds;
    setTime(newTime);
    setShowTimeModal(false);
    setIsRunning(false);
  };

  const handleAwayScoreIncrement = () => {
    onAwayScoreChange(awayScore + 1);
  };

  const handleAwayScoreDecrement = () => {
    onAwayScoreChange(Math.max(0, awayScore - 1));
  };

  return (
    <>
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-2xl p-6 mb-6">
        <div className="flex items-center justify-center gap-8">
          {/* Botão Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="bg-white hover:bg-gray-100 rounded-full p-3 transition-colors shadow-lg"
            title={isRunning ? 'Pausar' : 'Iniciar'}
          >
            {isRunning ? (
              <Pause className="w-6 h-6 text-gray-800" />
            ) : (
              <Play className="w-6 h-6 text-gray-800" />
            )}
          </button>

          {/* Placar Casa */}
          <div className="flex flex-col items-center">
            <span className="text-white text-sm font-semibold mb-2">CASA</span>
            <div className="bg-white rounded-lg px-6 py-4 min-w-[80px] text-center shadow-lg">
              <span className="text-4xl font-bold text-gray-800">{homeScore}</span>
            </div>
          </div>

          {/* Cronômetro */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleTimeClick}
              className="bg-red-600 hover:bg-red-700 rounded-lg px-8 py-4 transition-colors shadow-lg cursor-pointer"
              title="Clique para definir o tempo"
            >
              <span className="text-5xl font-mono font-bold text-white tracking-wider">
                {formatTime(time)}
              </span>
            </button>
          </div>

          {/* Placar Visitante */}
          <div className="flex flex-col items-center">
            <span className="text-white text-sm font-semibold mb-2">VISITANTE</span>
            <div className="bg-white rounded-lg px-6 py-4 min-w-[80px] text-center shadow-lg relative">
              <span className="text-4xl font-bold text-gray-800">{awayScore}</span>
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                <button
                  onClick={handleAwayScoreIncrement}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold rounded px-2 py-1 transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={handleAwayScoreDecrement}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold rounded px-2 py-1 transition-colors"
                >
                  -1
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de definir tempo */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Definir Tempo</h3>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minutos
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={tempMinutes}
                  onChange={(e) => setTempMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end pb-2 text-2xl font-bold text-gray-600">:</div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Segundos
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={tempSeconds}
                  onChange={(e) => setTempSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTimeModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSetTime}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

