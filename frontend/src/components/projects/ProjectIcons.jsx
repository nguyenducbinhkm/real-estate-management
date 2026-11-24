// Biểu tượng cho nhãn trạng thái dự án và nhãn "Nổi bật".
function Icon({ children, className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const paths = {
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9" /><path d="m17 6 3 3" /><path d="m15 8 2 2" /></>,
  plan: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M9 11h6M9 15h4" /></>,
  build: <><path d="M3 21h18" /><path d="M6 21V9l6-5 6 5v12" /><path d="M10 21v-5h4v5" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.5 2.5L16 9.5" /></>,
  pause: <><circle cx="12" cy="12" r="9" /><path d="M10 9v6M14 9v6" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9Z" />,
};

export function ProjectIcon({ name, className }) {
  if (name === 'live') {
    // "Đang mở bán": chấm tròn nhấp nháy như trạng thái trực tiếp.
    return (
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>
    );
  }
  if (!paths[name]) return null;
  return <Icon className={className}>{paths[name]}</Icon>;
}
