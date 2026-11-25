import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { accountService, readApiError } from '../services/accountService';
import Spinner from '../components/ui/Spinner';

/* Trang quản lý tài khoản: /profile (thông tin cá nhân) và /profile/password (đổi mật khẩu). */

const roleLabels = {
  Buyer: 'Người tìm mua / thuê',
  Seller: 'Người bán / cho thuê',
  Agent: 'Môi giới',
  Admin: 'Quản trị viên',
};

const fieldClass = (error) =>
  `h-11 w-full rounded-xl border bg-slate-50 px-3.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
    error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
  }`;

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—');

function Icon({ d, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  );
}

const icons = {
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>,
  check: <path d="m5 12 5 5L20 7" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.1 3.9M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
};

function AvatarImage({ name, url, className = 'h-20 w-20 text-2xl' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (url && !failed) {
    return <img src={url} alt="" onError={() => setFailed(true)} className={`shrink-0 rounded-full object-cover ring-4 ring-white ${className}`} />;
  }
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-bold text-white ring-4 ring-white ${className}`}>
      {(name || '?').trim().charAt(0).toUpperCase()}
    </span>
  );
}

function Notice({ tone, children }) {
  if (!children) return null;
  const styles = tone === 'success' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-red-50 text-red-700 ring-red-100';
  return (
    <p role={tone === 'success' ? 'status' : 'alert'} className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ring-1 ${styles}`}>
      {tone === 'success' && <Icon d={icons.check} className="mt-0.5 h-4 w-4 shrink-0" />}
      {children}
    </p>
  );
}

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/* ------------------------------ Thông tin cá nhân ------------------------------ */

function ProfileForm({ profile, onSaved }) {
  const initial = useMemo(
    () => ({ fullName: profile.fullName || '', phone: profile.phone || '', avatarUrl: profile.avatarUrl || '' }),
    [profile],
  );
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ saving: false, message: '', tone: '' });

  useEffect(() => setForm(initial), [initial]);

  const dirty = form.fullName !== initial.fullName || form.phone !== initial.phone || form.avatarUrl !== initial.avatarUrl;
  const set = (name) => (event) => {
    setForm((value) => ({ ...value, [name]: event.target.value }));
    setErrors((value) => ({ ...value, [name]: '' }));
    setStatus((value) => ({ ...value, message: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Vui lòng nhập họ tên.';
    if (!/^\+?[0-9 .]{8,20}$/.test(form.phone.trim())) next.phone = 'Số điện thoại chỉ gồm chữ số (8–20 ký tự).';
    if (form.avatarUrl.trim() && !/^https?:\/\/\S+$/i.test(form.avatarUrl.trim())) next.avatarUrl = 'Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setStatus({ saving: true, message: '', tone: '' });
    try {
      const saved = await accountService.updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        avatarUrl: form.avatarUrl.trim() || null,
      });
      onSaved(saved);
      setStatus({ saving: false, message: 'Đã lưu thông tin tài khoản.', tone: 'success' });
    } catch (error) {
      const { message, fields } = readApiError(error);
      setErrors(fields);
      setStatus({ saving: false, message, tone: 'error' });
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="fullName" label="Họ và tên" error={errors.fullName}>
          <input id="fullName" value={form.fullName} onChange={set('fullName')} autoComplete="name" maxLength={200} className={fieldClass(errors.fullName)} />
        </Field>
        <Field id="phone" label="Số điện thoại" error={errors.phone} hint="Người mua sẽ liên hệ bạn qua số này.">
          <input id="phone" value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" maxLength={20} className={fieldClass(errors.phone)} />
        </Field>
      </div>

      <Field id="email" label="Email đăng nhập" hint="Email dùng để đăng nhập nên không thể thay đổi.">
        <input id="email" value={profile.email} disabled className={`${fieldClass()} cursor-not-allowed text-slate-500`} />
      </Field>

      <Field id="avatarUrl" label="Ảnh đại diện (đường dẫn ảnh)" error={errors.avatarUrl} hint="Dán đường dẫn ảnh http(s). Để trống để dùng chữ cái đầu của tên.">
        <div className="flex items-center gap-3">
          <AvatarImage name={form.fullName} url={form.avatarUrl.trim()} className="h-11 w-11 text-base ring-2" />
          <input
            id="avatarUrl"
            value={form.avatarUrl}
            onChange={set('avatarUrl')}
            placeholder="https://…"
            maxLength={1000}
            className={fieldClass(errors.avatarUrl)}
          />
        </div>
      </Field>

      <Notice tone={status.tone}>{status.message}</Notice>

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">
        <button
          type="button"
          disabled={!dirty || status.saving}
          onClick={() => { setForm(initial); setErrors({}); setStatus({ saving: false, message: '', tone: '' }); }}
          className="h-11 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Hoàn tác
        </button>
        <button
          type="submit"
          disabled={!dirty || status.saving}
          className="h-11 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.saving ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------- Đổi mật khẩu -------------------------------- */

function passwordStrength(value) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (!value) return { score: 0, label: '', color: '' };
  if (score <= 2) return { score: 1, label: 'Yếu', color: 'bg-red-500' };
  if (score <= 3) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
  return { score: 3, label: 'Mạnh', color: 'bg-emerald-500' };
}

function PasswordInput({ id, value, onChange, error, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} maxLength={128} className={`${fieldClass(error)} pr-11`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <Icon d={visible ? icons.eyeOff : icons.eye} className="h-4 w-4" />
      </button>
    </div>
  );
}

function PasswordForm() {
  const empty = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ saving: false, message: '', tone: '' });
  const strength = passwordStrength(form.newPassword);

  const set = (name) => (event) => {
    setForm((value) => ({ ...value, [name]: event.target.value }));
    setErrors((value) => ({ ...value, [name]: '' }));
    setStatus((value) => ({ ...value, message: '' }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.currentPassword) next.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
    if (form.newPassword.length < 8) next.newPassword = 'Mật khẩu mới tối thiểu 8 ký tự.';
    else if (form.newPassword === form.currentPassword) next.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    if (form.confirmPassword !== form.newPassword) next.confirmPassword = 'Mật khẩu nhập lại không khớp.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus({ saving: true, message: '', tone: '' });
    try {
      await accountService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm(empty);
      setStatus({ saving: false, message: 'Đã đổi mật khẩu. Lần đăng nhập sau hãy dùng mật khẩu mới.', tone: 'success' });
    } catch (error) {
      const { message, fields, code } = readApiError(error, 'Không thể đổi mật khẩu. Vui lòng thử lại.');
      setErrors(code === 'INVALID_PASSWORD' ? { currentPassword: message } : fields);
      setStatus({ saving: false, message, tone: 'error' });
    }
  };

  return (
    <form onSubmit={submit} noValidate className="max-w-lg space-y-5">
      <Field id="currentPassword" label="Mật khẩu hiện tại" error={errors.currentPassword}>
        <PasswordInput id="currentPassword" value={form.currentPassword} onChange={set('currentPassword')} error={errors.currentPassword} autoComplete="current-password" />
      </Field>
      <Field id="newPassword" label="Mật khẩu mới" error={errors.newPassword} hint="Tối thiểu 8 ký tự; nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.">
        <PasswordInput id="newPassword" value={form.newPassword} onChange={set('newPassword')} error={errors.newPassword} autoComplete="new-password" />
        {form.newPassword && (
          <div className="mt-2 flex items-center gap-2" aria-live="polite">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3].map((step) => (
                <span key={step} className={`h-1.5 flex-1 rounded-full ${step <= strength.score ? strength.color : 'bg-slate-200'}`} />
              ))}
            </div>
            <span className="w-20 text-right text-xs font-medium text-slate-500">Độ mạnh: {strength.label}</span>
          </div>
        )}
      </Field>
      <Field id="confirmPassword" label="Nhập lại mật khẩu mới" error={errors.confirmPassword}>
        <PasswordInput id="confirmPassword" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" />
      </Field>

      <Notice tone={status.tone}>{status.message}</Notice>

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={status.saving}
          className="h-11 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.saving ? 'Đang cập nhật…' : 'Đổi mật khẩu'}
        </button>
      </div>
    </form>
  );
}

/* ---------------------------------- Trang ---------------------------------- */

function SideLink({ to, icon, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
        }`
      }
    >
      <Icon d={icon} className="h-[18px] w-[18px]" />
      {children}
    </NavLink>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-brand-50/70 px-4 py-3 ring-1 ring-brand-100">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function UserProfile() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, accessToken, refreshToken, setAuth, clearAuth } = useAuthStore();
  const [state, setState] = useState({ loading: true, profile: null, error: '' });
  const tab = pathname.endsWith('/password') ? 'password' : 'info';

  useEffect(() => {
    let alive = true;
    accountService
      .getProfile()
      .then((profile) => alive && setState({ loading: false, profile, error: '' }))
      .catch((error) => alive && setState({ loading: false, profile: null, error: readApiError(error, 'Không tải được thông tin tài khoản.').message }));
    return () => {
      alive = false;
    };
  }, []);

  // Lưu xong: cập nhật hồ sơ trên trang và tên/số điện thoại trong phiên đăng nhập (header hiển thị theo đó).
  const handleSaved = (profile) => {
    setState((value) => ({ ...value, profile }));
    setAuth({ accessToken, refreshToken, user: { ...user, fullName: profile.fullName, phone: profile.phone, avatarUrl: profile.avatarUrl } });
  };

  const logout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // Phiên có thể đã hết hạn; vẫn xoá phía client.
    }
    clearAuth();
    navigate('/');
  };

  if (state.loading) return <div className="py-24"><Spinner /></div>;

  if (!state.profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="font-semibold text-ink">{state.error}</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white">
          Thử lại
        </button>
      </div>
    );
  }

  const { profile } = state;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-600">Trang chủ</Link>
        <span aria-hidden="true">›</span>
        <span className="text-ink">Tài khoản</span>
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card lg:sticky lg:top-24">
          <div className="bg-gradient-to-br from-ink via-ink-800 to-brand-900 px-5 pb-5 pt-6 text-center">
            <AvatarImage name={profile.fullName} url={profile.avatarUrl} className="mx-auto h-20 w-20 text-2xl" />
            <p className="mt-3 truncate text-lg font-bold text-white">{profile.fullName}</p>
            <p className="truncate text-xs text-white/70">{profile.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <span className="rounded-full bg-gold-500 px-2.5 py-0.5 text-xs font-semibold text-white">{roleLabels[profile.role] || profile.role}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${profile.isVerified ? 'bg-emerald-500 text-white' : 'bg-white/15 text-white/80'}`}>
                {profile.isVerified ? '✓ Đã xác minh' : 'Chưa xác minh'}
              </span>
            </div>
          </div>
          <nav aria-label="Quản lý tài khoản" className="space-y-1 p-3">
            <SideLink to="/profile" icon={icons.user} end>Thông tin cá nhân</SideLink>
            <SideLink to="/profile/password" icon={icons.lock}>Đổi mật khẩu</SideLink>
            {profile.canPostListing && (
              <>
                <SideLink to="/seller/listings" icon={icons.list}>Tin đăng của tôi</SideLink>
                <SideLink to="/seller/post" icon={icons.plus}>Đăng tin mới</SideLink>
              </>
            )}
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Icon d={icons.logout} className="h-[18px] w-[18px]" />
              Đăng xuất
            </button>
          </nav>
        </aside>

        <section className="min-w-0 rounded-3xl border border-slate-100 bg-white p-5 shadow-card md:p-7">
          {tab === 'info' ? (
            <>
              <h1 className="text-2xl font-extrabold text-ink">Thông tin cá nhân</h1>
              <p className="mt-1 text-sm text-slate-500">Cập nhật họ tên, số điện thoại và ảnh đại diện hiển thị trên tin đăng của bạn.</p>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Loại tài khoản" value={roleLabels[profile.role] || profile.role} />
                <Stat label="Ngày tham gia" value={formatDate(profile.createdAt)} />
                <Stat label="Giới hạn tin đăng" value={profile.canPostListing ? `${profile.maxListings} tin` : 'Không đăng tin'} />
                <Stat label="Cập nhật lần cuối" value={formatDate(profile.updatedAt)} />
              </div>
              <div className="mt-7">
                <ProfileForm profile={profile} onSaved={handleSaved} />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-ink">Đổi mật khẩu</h1>
              <p className="mt-1 text-sm text-slate-500">Để bảo vệ tài khoản, hãy dùng mật khẩu mạnh và không dùng lại mật khẩu ở trang web khác.</p>
              <div className="mt-7">
                <PasswordForm />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
