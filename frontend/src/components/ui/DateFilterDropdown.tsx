import { useState, useRef, useEffect } from "react";

const presets = [
  { label: "Hoje", value: "today" },
  { label: "Últimos 7 dias", value: "last7" },
  { label: "Últimos 15 dias", value: "last15" },
  { label: "Últimos 30 dias", value: "last30" },
  { label: "Personalizado", value: "custom" },
];

export function DateFilterDropdown({ value, onChange }: { value: any; onChange: (range: any) => void }) {
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(value?.preset || "today");
  const [customStart, setCustomStart] = useState(value?.start || "");
  const [customEnd, setCustomEnd] = useState(value?.end || "");
  const firstRadioRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && firstRadioRef.current) {
      firstRadioRef.current.focus();
    }
  }, [open]);

  // Fechar com ESC
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleApply() {
    if (selectedPreset === "custom") {
      onChange({ preset: "custom", start: customStart, end: customEnd });
    } else {
      onChange({ preset: selectedPreset });
    }
    setOpen(false);
  }

  function getLabel() {
    const preset = presets.find((p) => p.value === value?.preset);
    if (preset && preset.value !== "custom") return preset.label;
    if (value?.start && value?.end) {
      return `${formatDate(value.start)} - ${formatDate(value.end)}`;
    }
    return "Selecione o período";
  }

  function formatDate(date: string) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  return (
    <div className="relative inline-block">
      <button
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded shadow hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="date-filter-dropdown"
      >
        <span className="font-medium">{getLabel()}</span>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && (
        <div
          id="date-filter-dropdown"
          ref={dropdownRef}
          className="absolute left-1/2 -translate-x-1/2 mt-2 z-50 bg-white border rounded shadow-lg w-[480px] p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col gap-2 mb-4">
            {presets.map((preset, idx) => (
              <label key={preset.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="date-preset"
                  value={preset.value}
                  checked={selectedPreset === preset.value}
                  onChange={() => setSelectedPreset(preset.value)}
                  ref={idx === 0 ? firstRadioRef : undefined}
                  tabIndex={0}
                />
                <span>{preset.label}</span>
              </label>
            ))}
          </div>
          {selectedPreset === "custom" && (
            <div className="flex flex-row gap-4 mb-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-medium">Data inicial</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                  tabIndex={0}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-medium">Data final</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                  tabIndex={0}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setOpen(false)}
              tabIndex={0}
            >
              Cancelar
            </button>
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleApply}
              tabIndex={0}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 