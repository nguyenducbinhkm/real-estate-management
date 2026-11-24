export default function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name;

  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>}
      <input
        id={inputId}
        className={`h-11 w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
