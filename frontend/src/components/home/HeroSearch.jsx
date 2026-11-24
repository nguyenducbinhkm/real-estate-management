import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearchStore } from '../../store/searchStore';
import { heroSlides, provinces } from '../../data/homeContent';

const tabs = [
  ['ForSale', 'Mua bán'],
  ['ForRent', 'Cho thuê'],
  ['project', 'Dự án'],
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function HeroSearch() {
  const navigate = useNavigate();
  const setCriteria = useSearchStore((state) => state.setCriteria);
  const [tab, setTab] = useState('ForSale');
  const [keyword, setKeyword] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [slide, setSlide] = useState(0);

  // Tự chuyển slide sau 6 giây; đếm lại từ đầu mỗi khi slide đổi (kể cả khi người dùng bấm chọn).
  useEffect(() => {
    const timer = setTimeout(() => setSlide((value) => (value + 1) % heroSlides.length), 6000);
    return () => clearTimeout(timer);
  }, [slide]);

  const submit = (event) => {
    event.preventDefault();
    if (tab === 'project') {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set('q', keyword.trim());
      if (provinceCode) params.set('provinceCode', provinceCode);
      navigate(`/projects${params.toString() ? `?${params}` : ''}`);
      return;
    }
    setCriteria({
      keyword: keyword.trim(),
      transactionType: tab,
      provinceCode,
      propertyType: '',
      districtCode: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      page: 1,
    });
    navigate('/listings');
  };

  const current = heroSlides[slide];

  return (
    <section className="relative overflow-hidden bg-ink bg-grid">
      {current.image ? (
        <>
          {/* Nạp sẵn ảnh của mọi slide, chuyển slide bằng hiệu ứng mờ dần (không bị nháy nền tối). */}
          {heroSlides.map((item, index) =>
            item.image ? (
              <img
                key={item.image}
                src={item.image}
                alt={index === slide ? item.imageAlt || '' : ''}
                aria-hidden={index !== slide}
                fetchpriority={index === 0 ? 'high' : 'auto'}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === slide ? 'opacity-100' : 'opacity-0'}`}
              />
            ) : null,
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" aria-hidden="true" />
          {current.imageCredit && (
            <p className="absolute bottom-2 right-3 z-10 text-[10px] text-white/70">
              Ảnh:{' '}
              <a href={current.imageCredit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                {current.imageCredit.author}
              </a>
              {' / '}
              <a href={current.imageCredit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                {current.imageCredit.license}
              </a>
              {' – Wikimedia Commons'}
            </p>
          )}
        </>
      ) : (
        <img
          src="/images/logo-mark.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-1/2 hidden w-[520px] -translate-y-1/2 opacity-[0.08] md:block"
        />
      )}
      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-10 md:pb-20 md:pt-14">
        <form
          onSubmit={submit}
          className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur md:p-5"
        >
          <div role="tablist" aria-label="Loại tìm kiếm" className="flex justify-center gap-1">
            {tabs.map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`relative px-5 pb-3 pt-1 text-sm font-semibold transition-colors ${tab === value ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {label}
                {tab === value && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded bg-brand-300" />}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2 rounded-lg bg-white p-2 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="hero-province">Tỉnh thành</label>
            <select
              id="hero-province"
              value={provinceCode}
              onChange={(event) => setProvinceCode(event.target.value)}
              className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-ink sm:w-44 sm:border-0 sm:border-r"
            >
              {provinces.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
            <div className="flex min-w-0 flex-1 items-center gap-2 px-2 text-slate-400">
              <SearchIcon />
              <label className="sr-only" htmlFor="hero-keyword">Từ khóa</label>
              <input
                id="hero-keyword"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={tab === 'project' ? 'Nhập tên dự án hoặc chủ đầu tư' : 'Nhập địa điểm, đường, tên dự án…'}
                className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
              />
            </div>
            <button type="submit" className="h-11 rounded-md bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
              Tìm kiếm
            </button>
          </div>
        </form>

        <div className="mt-10 grid items-center gap-6 md:mt-14 md:grid-cols-[1fr_auto]" aria-live="polite">
          <div key={slide} className="animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-300">{current.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-extrabold text-white md:text-5xl">{current.title}</h1>
            <p className="mt-3 max-w-xl text-slate-300">{current.text}</p>
          </div>
          <Link
            to={current.cta[1]}
            className="inline-flex h-12 w-fit items-center rounded-full bg-brand-300 px-7 text-sm font-bold text-ink transition-colors hover:bg-brand-100"
          >
            {current.cta[0]}
          </Link>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {heroSlides.map((item, index) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Chuyển tới banner ${index + 1}`}
              onClick={() => setSlide(index)}
              className={`h-1.5 rounded-full transition-all ${index === slide ? 'w-6 bg-brand-300' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
