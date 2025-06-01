import { useState } from "react";

const presets = [
  { label: "Hoje", value: "today" },
  { label: "Ontem", value: "yesterday" },
  { label: "Últimos 7 dias", value: "last7" },
  { label: "Últimos 14 dias", value: "last14" },
  { label: "Últimos 28 dias", value: "last28" },
  { label: "Últimos 30 dias", value: "last30" },
  { label: "Esta semana", value: "thisWeek" },
  { label: "Semana passada", value: "lastWeek" },
  { label: "Este mês", value: "thisMonth" },
  { label: "Mês passado", value: "lastMonth" },
  { label: "Máximo", value: "max" },
  { label: "Personalizado", value: "custom" },
];

export function DateRangePicker({ onChange }: { onChange?: (range: any) => void }) {
  const [selectedPreset, setSelectedPreset] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  function handlePresetChange(value: string) {
    setSelectedPreset(value);
    if (value !== "custom" && onChange) {
      onChange({ preset: value });
    }
  }

  function handleCustomChange() {
    if (onChange) {
      onChange({ preset: "custom", start: customStart, end: customEnd });
    }
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 rounded shadow mb-6">
      <div className="flex flex-col gap-2">
        {presets.map((preset) => (
          <label key={preset.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="date-preset"
              value={preset.value}
              checked={selectedPreset === preset.value}
              onChange={() => handlePresetChange(preset.value)}
            />
            <span>{preset.label}</span>
          </label>
        ))}
      </div>
      {selectedPreset === "custom" && (
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <span>a</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleCustomChange}
          >
            Atualizar
          </button>
        </div>
      )}
    </div>
  );
} 