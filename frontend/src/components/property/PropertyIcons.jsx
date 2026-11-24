// Biểu tượng nhỏ dùng trên ảnh tin đăng (thẻ tin, trang chi tiết).
function Icon({ children, className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

/** Nhãn "Bán" (thẻ giá) hoặc "Cho thuê" (chìa khóa). */
export function TransactionIcon({ rent, className }) {
  return rent ? (
    <Icon className={className}><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9" /><path d="m17 6 3 3" /><path d="m15 8 2 2" /></Icon>
  ) : (
    <Icon className={className}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1.5" /></Icon>
  );
}

export function CameraIcon({ className }) {
  return (
    <Icon className={className}><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13.5" r="3.5" /></Icon>
  );
}

export function AreaIcon({ className }) {
  return (
    <Icon className={className}><path d="M3 9V3h6" /><path d="M21 15v6h-6" /><path d="M3 3l7 7" /><path d="m21 21-7-7" /></Icon>
  );
}

export function DiamondIcon({ className }) {
  return (
    <Icon className={className}><path d="M6 3h12l4 6-10 12L2 9Z" /><path d="M2 9h20" /><path d="m10 3-2 6 4 12 4-12-2-6" /></Icon>
  );
}

export function CrownIcon({ className }) {
  return (
    <Icon className={className}><path d="m3 7 4.5 4L12 5l4.5 6L21 7l-2 11H5Z" /><path d="M5 21h14" /></Icon>
  );
}

export function MedalIcon({ className }) {
  return (
    <Icon className={className}><circle cx="12" cy="15" r="5" /><path d="m8.5 11.5-3-8.5h4l2.5 6" /><path d="m15.5 11.5 3-8.5h-4L12 9" /><path d="m12 13 .9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3Z" /></Icon>
  );
}

// Mỗi gói: tên đầy đủ (đọc màn hình / chú thích khi rê chuột), biểu tượng và màu nền.
const packages = {
  VipDiamond: { name: 'VIP Kim cương', icon: DiamondIcon, tone: 'bg-gold-500' },
  VipGold: { name: 'VIP Vàng', icon: CrownIcon, tone: 'bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600' },
  VipSilver: { name: 'VIP Bạc', icon: MedalIcon, tone: 'bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500' },
};

/** Nhãn gói tin VIP ở góc ảnh: chữ "VIP" kèm biểu tượng gói (kim cương / vương miện / huy chương). */
export function PackageBadge({ packageType, className = '', size = 'sm' }) {
  if (!packageType || packageType === 'Free') return null;
  const text = size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2.5 py-1';
  const pkg = packages[packageType];

  if (!pkg) {
    return <span className={`inline-flex items-center rounded-full bg-gold-500 font-semibold text-white shadow-sm ${text} ${className}`}>{packageType}</span>;
  }

  const PackageIcon = pkg.icon;
  return (
    <span
      title={pkg.name}
      aria-label={pkg.name}
      className={`inline-flex items-center gap-1 rounded-full font-semibold text-white shadow-sm [text-shadow:0_1px_1px_rgba(0,0,0,0.25)] ${pkg.tone} ${text} ${className}`}
    >
      VIP
      <PackageIcon className={`${size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]`} />
    </span>
  );
}

export function ArrowIcon({ className }) {
  return (
    <Icon className={className}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></Icon>
  );
}
