import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface GameScoreboardProps {
  homeScore: number;
  awayScore: number;
  onAwayScoreChange?: (score: number) => void;
  quarter: number;
  onQuarterChange?: (quarter: number) => void;
  onTimerStateChange?: (isRunning: boolean, time: number) => void;
  opponentName?: string;
  readOnly?: boolean;
  initialTime?: number;
  initialRunning?: boolean;
  onTimeChange?: (time: number) => void;
  onRunningChange?: (running: boolean) => void;
  homeFouls?: number;
  awayFouls?: number;
}

export function GameScoreboard({ 
  homeScore, 
  awayScore, 
  onAwayScoreChange,
  quarter,
  onQuarterChange,
  onTimerStateChange,
  opponentName = "VISITANTE",
  readOnly = false,
  initialTime = 720,
  initialRunning = false,
  onTimeChange,
  onRunningChange,
  homeFouls = 0,
  awayFouls = 0
}: GameScoreboardProps) {
  const [time, setTime] = useState(initialTime); // 12 minutos em segundos
  const [isRunning, setIsRunning] = useState(initialRunning);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [tempMinutes, setTempMinutes] = useState(12);
  const [tempSeconds, setTempSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousQuarter = useRef(quarter);
  const startTimeRef = useRef<number | null>(null);

  // Sincronizar com props externas (para visualização pública) - atualizar sempre que mudar
  useEffect(() => {
    if (readOnly && initialTime !== undefined) {
      // Se o timer não estiver rodando, atualizar o tempo diretamente
      // Se estiver rodando, não atualizar para não interferir com o contador
      if (!isRunning) {
        setTime(initialTime);
        // Resetar a referência de tempo quando o tempo é atualizado externamente
        startTimeRef.current = null;
      } else {
        // Se estiver rodando, ajustar o startTimeRef para manter a sincronização
        startTimeRef.current = Date.now() - (720 - initialTime) * 1000;
      }
    }
  }, [initialTime, readOnly, isRunning]);

  useEffect(() => {
    if (readOnly && initialRunning !== undefined) {
      const wasRunning = isRunning;
      setIsRunning(initialRunning);
      
      // Se estava pausado e agora deve rodar, resetar o startTimeRef
      if (!wasRunning && initialRunning) {
        startTimeRef.current = Date.now() - (720 - time) * 1000;
      }
    }
  }, [initialRunning, readOnly, time]);

  // Resetar cronômetro ao trocar de quarto
  useEffect(() => {
    if (previousQuarter.current !== quarter) {
      setTime(720); // 12 minutos
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      startTimeRef.current = null; // Resetar referência de tempo
      previousQuarter.current = quarter;
      if (onTimeChange) onTimeChange(720);
      if (onRunningChange) onRunningChange(false);
    }
  }, [quarter, onTimeChange, onRunningChange]);

  // Gerenciar o cronômetro com centésimos (funciona tanto no painel quanto na página pública)
  useEffect(() => {
    if (isRunning && time > 0) {
      // Se for readOnly (página pública), usar o tempo inicial como base
      if (readOnly && !startTimeRef.current) {
        // Calcular o tempo de início baseado no tempo atual
        startTimeRef.current = Date.now() - (720 - time) * 1000;
      } else if (!readOnly && !startTimeRef.current) {
        startTimeRef.current = Date.now() - (720 - time) * 1000;
      }
      
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - (startTimeRef.current || Date.now())) / 1000;
        const newTime = Math.max(0, 720 - elapsed);
        setTime(newTime);
        if (onTimeChange) onTimeChange(newTime);
        if (newTime <= 0) {
          setIsRunning(false);
          if (onRunningChange) onRunningChange(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          startTimeRef.current = null;
        }
      }, 10); // Atualizar a cada 10ms para centésimos
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      // Não resetar startTimeRef quando pausar em modo readOnly, para manter a referência
      if (!readOnly) {
        startTimeRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, readOnly, onTimeChange, onRunningChange, time]);

  const formatTime = (seconds: number) => {
    const totalCentiseconds = Math.floor(seconds * 100);
    const mins = Math.floor(totalCentiseconds / 6000);
    const secs = Math.floor((totalCentiseconds % 6000) / 100);
    const centiseconds = totalCentiseconds % 100;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (readOnly) return;
    const newState = !isRunning;
    setIsRunning(newState);
    if (onRunningChange) onRunningChange(newState);
    if (onTimerStateChange) {
      onTimerStateChange(newState, time);
    }
  };

  // Notificar mudanças de tempo quando o cronômetro está rodando (com debounce)
  useEffect(() => {
    if (onTimerStateChange && isRunning) {
      // Usar debounce para evitar muitas requisições
      const timeoutId = setTimeout(() => {
        onTimerStateChange(isRunning, time);
      }, 500); // Atualizar a cada 500ms no máximo
      
      return () => clearTimeout(timeoutId);
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
    if (readOnly) return;
    const newTime = (tempMinutes * 60) + tempSeconds;
    setTime(newTime);
    if (onTimeChange) onTimeChange(newTime);
    setShowTimeModal(false);
    setIsRunning(false);
    if (onRunningChange) onRunningChange(false);
  };

  const handleAwayScoreIncrement = () => {
    if (onAwayScoreChange) {
      onAwayScoreChange(awayScore + 1);
    }
  };

  const handleAwayScoreDecrement = () => {
    if (onAwayScoreChange) {
      onAwayScoreChange(Math.max(0, awayScore - 1));
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-2xl p-3 md:p-6 mb-6">
        <div className="flex items-center justify-center gap-2 md:gap-8 flex-wrap">
          {/* Botão Play/Pause */}
          {!readOnly && (
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
          )}

          {/* Placar Casa */}
          <div className="flex flex-col items-center">
            <span className="text-white text-xs md:text-sm font-semibold mb-1 md:mb-2">CASA</span>
            <div className="bg-white rounded-lg px-3 md:px-6 py-2 md:py-4 min-w-[60px] md:min-w-[80px] text-center shadow-lg">
              <span className="text-2xl md:text-4xl font-bold text-gray-800">{homeScore}</span>
            </div>
            {/* Bolinhas de faltas */}
            <div className="flex gap-1 mt-1 md:mt-2">
              {Array.from({ length: Math.min(homeFouls, 5) }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500"></div>
              ))}
            </div>
          </div>

          {/* Cronômetro */}
          <div className="flex flex-col items-center">
            {readOnly ? (
              <div className="bg-red-600 rounded-lg px-4 md:px-8 py-3 md:py-4 shadow-lg">
                <span className="text-2xl md:text-5xl font-mono font-bold text-white tracking-wider">
                  {formatTime(time)}
                </span>
              </div>
            ) : (
              <button
                onClick={handleTimeClick}
                className="bg-red-600 hover:bg-red-700 rounded-lg px-4 md:px-8 py-3 md:py-4 transition-colors shadow-lg cursor-pointer"
                title="Clique para definir o tempo"
              >
                <span className="text-2xl md:text-5xl font-mono font-bold text-white tracking-wider">
                  {formatTime(time)}
                </span>
              </button>
            )}
          </div>

          {/* Placar Visitante */}
          <div className="flex flex-col items-center">
            <span className="text-white text-xs md:text-sm font-semibold mb-1 md:mb-2 truncate max-w-[100px] md:max-w-none">{opponentName}</span>
            <div className="bg-white rounded-lg px-3 md:px-6 py-2 md:py-4 min-w-[60px] md:min-w-[80px] text-center shadow-lg relative">
              <span className="text-2xl md:text-4xl font-bold text-gray-800">{awayScore}</span>
              {!readOnly && onAwayScoreChange && (
                <div className="absolute -right-8 md:-right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                  <button
                    onClick={handleAwayScoreIncrement}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold rounded px-1.5 md:px-2 py-0.5 md:py-1 transition-colors"
                  >
                    +1
                  </button>
                  <button
                    onClick={handleAwayScoreDecrement}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold rounded px-1.5 md:px-2 py-0.5 md:py-1 transition-colors"
                  >
                    -1
                  </button>
                </div>
              )}
            </div>
            {/* Bolinhas de faltas do adversário (faltas recebidas pelas jogadoras) */}
            <div className="flex gap-1 mt-1 md:mt-2">
              {Array.from({ length: Math.min(awayFouls, 5) }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500"></div>
              ))}
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

