import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  // Chỉ quay lại đường dẫn nội bộ ("/listings/..."), không nhận URL ngoài để tránh chuyển hướng lừa đảo.
  const redirect = params.get('redirect');
  const backTo = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const auth = await authService.login(form);
      setAuth(auth);
      navigate(backTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <section className="rounded-3xl border border-slate-100 bg-white p-7 shadow-lift">
        <h1 className="text-2xl font-black text-slate-900">Đăng nhập</h1>
        <p className="mt-1 text-sm text-slate-500">Tiếp tục quản lý tin và hồ sơ BS Realty.</p>
        {location.state?.message && <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{location.state.message}</p>}
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Input label="Email" name="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" />
          <Input label="Mật khẩu" name="password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          Chưa có tài khoản? <Link to="/register" className="font-bold text-brand-700">Đăng ký</Link>
        </p>
      </section>
    </div>
  );
}
