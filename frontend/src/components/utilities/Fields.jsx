// Ô nhập dùng chung cho các công cụ tiện ích.

export function NumberField({ label, value, onChange, min = 0, max, step = 'any', suffix, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-brand-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
          className="h-11 min-w-0 flex-1 rounded-lg bg-transparent px-3 text-sm text-ink outline-none"
        />
        {suffix && <span className="pr-3 text-sm text-slate-500">{suffix}</span>}
      </div>
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

export function ToggleGroup({ label, value, onChange, options }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      <div className="mt-1.5 grid grid-cols-2 rounded-full bg-slate-100 p-1">
        {options.map(([optionValue, optionLabel]) => (
          <button
            key={optionValue}
            type="button"
            aria-pressed={value === optionValue}
            onClick={() => onChange(optionValue)}
            className={`h-9 rounded-full text-sm font-semibold transition-all ${value === optionValue ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-ink'}`}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Stat({ label, value, highlight = false }) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? 'bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-md shadow-brand-600/20' : 'bg-brand-50/60'}`}>
      <p className={`text-xs ${highlight ? 'text-brand-100' : 'text-slate-500'}`}>{label}</p>
      <p className={`mt-1 text-xl font-extrabold ${highlight ? 'text-white' : 'text-ink'}`}>{value}</p>
    </div>
  );
}

export function Disclaimer({ children }) {
  return <p className="mt-6 rounded-2xl bg-gold-50 p-4 text-xs leading-relaxed text-amber-800">{children}</p>;
}

/** Số hợp lệ để tính (ô trống hoặc âm coi như 0). */
export const num = (value) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0);
