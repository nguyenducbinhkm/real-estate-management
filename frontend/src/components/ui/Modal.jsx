export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng cửa sổ"
        className="absolute inset-0 bg-slate-950/50"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b px-5 py-4">
          <h2 id="modal-title" className="text-lg font-bold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-700">×</button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
