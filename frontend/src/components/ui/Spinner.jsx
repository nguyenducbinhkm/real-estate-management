export default function Spinner({ label = 'Đang tải...' }) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-slate-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600" />
      {label}
    </div>
  );
}
