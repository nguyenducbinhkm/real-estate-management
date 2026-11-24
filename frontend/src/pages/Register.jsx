import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const roles = [
  ['Buyer', 'Người tìm mua / thuê'],
  ['Seller', 'Chủ nhà / người bán'],
  ['Agent', 'Môi giới'],
];

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'Buyer' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (name) => (event) => setForm({ ...form, [name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);
    try {
      const auth = await authService.register(form);
      setAuth(auth);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.details) {
        const mapped = Object.fromEntries(
          Object.entries(data.details).map(([key, messages]) => [
            key.charAt(0).toLowerCase() + key.slice(1),
            Array.isArray(messages) ? messages[0] : messages,
          ]),
        );
        setErrors(mapped);
      }
      setError(data?.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-2xl font-black text-slate-900">Đăng ký tài khoản</h1>
        <p className="mt-1 text-sm text-slate-500">Tạo tài khoản để lưu tin và đăng tin trên BS Realty.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Input label="Họ và tên" name="fullName" value={form.fullName} onChange={update('fullName')} error={errors.fullName} />
          <Input label="Email" name="email" type="email" value={form.email} onChange={update('email')} error={errors.email} placeholder="name@example.com" />
          <Input label="Số điện thoại" name="phone" value={form.phone} onChange={update('phone')} error={errors.phone} />
          <Input label="Mật khẩu" name="password" type="password" value={form.password} onChange={update('password')} error={errors.password} placeholder="Tối thiểu 8 ký tự" />
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-slate-700">Bạn là</legend>
            <div className="grid gap-2">
              {roles.map(([value, label]) => (
                <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${form.role === value ? 'border-brand-600 bg-brand-50' : 'border-slate-300'}`}>
                  <input type="radio" name="role" value={value} checked={form.role === value} onChange={update('role')} className="accent-brand-600" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Đang đăng ký...' : 'Đăng ký'}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          Đã có tài khoản? <Link to="/login" className="font-bold text-brand-700">Đăng nhập</Link>
        </p>
      </section>
    </div>
  );
}
