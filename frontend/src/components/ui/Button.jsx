export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700',
    accent: 'bg-gold-500 text-white hover:bg-gold-600',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
