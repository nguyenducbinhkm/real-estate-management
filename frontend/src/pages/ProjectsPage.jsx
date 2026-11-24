import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { projectService } from '../services/projectService';
import ProjectCard, { FeaturedBadge, ProjectImageCredits, StatusBadge } from '../components/projects/ProjectCard';
import { HoverCorner, ImageShade, zoomImageClass } from '../components/ui/CardImageFx';
import NewsImage from '../components/news/NewsImage';
import { getProjectImage } from '../data/projectImages';
import {
  formatPriceRange,
  projectLocation,
  projectPriceRanges,
  projectSortOptions,
  statusFilterOptions,
} from '../config/projectOptions';

const PAGE_SIZE = 6;

function FeaturedStrip({ projects }) {
  if (projects.length === 0) return null;
  return (
    <section className="grid gap-5 md:grid-cols-2">
      {projects.map((project) => (
        <Link key={project.id} to={`/projects/${project.id}`} className="group relative block overflow-hidden rounded-3xl shadow-card transition-shadow hover:shadow-lift">
          <NewsImage image={getProjectImage(project)} eager className={`h-64 w-full md:h-80 ${zoomImageClass}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/30 to-transparent transition-colors duration-500 group-hover:from-brand-900/90" />
          <ImageShade />
          {project.isFeatured && <FeaturedBadge className="absolute right-4 top-4" />}
          <HoverCorner note="Ảnh minh họa khu vực" />
          <div className="absolute inset-x-0 bottom-0 p-5 pr-16">
            <StatusBadge status={project.status} />
            <h2 className="mt-3 text-2xl font-extrabold text-white">{project.name}</h2>
            <p className="mt-1 text-sm text-slate-200">{projectLocation(project)}</p>
            <p className="mt-3 inline-flex rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-brand-700">{formatPriceRange(project.minPrice, project.maxPrice)}</p>
          </div>
        </Link>
      ))}
    </section>
  );
}

const selectClass = 'h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-ink outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100';

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = {
    provinceCode: searchParams.get('provinceCode') || '',
    status: searchParams.get('status') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    keyword: searchParams.get('q') || '',
    sort: searchParams.get('sort') || 'default',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
  };
  const filterKey = searchParams.toString();

  const [keyword, setKeyword] = useState(filters.keyword);
  const [provinces, setProvinces] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [result, setResult] = useState({ loading: true, items: [], total: 0, error: '' });
  const [retry, setRetry] = useState(0);

  useEffect(() => setKeyword(filters.keyword), [filters.keyword]);

  useEffect(() => {
    projectService.getProvinces().then(setProvinces).catch(() => setProvinces([]));
    projectService.search({ featured: true, pageSize: 2 }).then((data) => setFeatured(data.items)).catch(() => setFeatured([]));
  }, []);

  useEffect(() => {
    let active = true;
    setResult((value) => ({ ...value, loading: true, error: '' }));
    projectService
      .search({ ...filters, pageSize: PAGE_SIZE })
      .then((data) => active && setResult({ loading: false, items: data.items, total: data.total, error: '' }))
      .catch(() => active && setResult({ loading: false, items: [], total: 0, error: 'Không thể tải danh sách dự án.' }));
    return () => {
      active = false;
    };
    // filterKey thay đổi khi bất kỳ tham số nào trên URL đổi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, retry]);

  const update = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in patch)) next.delete('page');
    next.delete('type'); // tham số loại hình từ menu header – database chưa phân loại dự án
    setSearchParams(next);
  };

  const provinceName = provinces.find((p) => p.provinceCode === filters.provinceCode)?.provinceName;
  const pageCount = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const priceValue = `${filters.minPrice}|${filters.maxPrice}`;
  const hasFilter = filters.provinceCode || filters.status || filters.minPrice || filters.maxPrice || filters.keyword;
  const showFeatured = !hasFilter && filters.page === 1;

  return (
    <div className="bg-white">
      <div className="border-b border-slate-200">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 py-3 text-sm text-slate-500">
          <Link to="/" className="hover:text-brand-600">Trang chủ</Link>
          <span className="mx-1.5">/</span>
          <Link to="/projects" className="hover:text-brand-600">Dự án</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">Dự án BĐS {provinceName || 'toàn quốc'}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {showFeatured && featured.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-4 text-xl font-extrabold text-ink">Dự án nổi bật</h2>
            <FeaturedStrip projects={featured} />
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            update({ q: keyword.trim() });
          }}
          className="grid gap-2 rounded-3xl border border-slate-100 bg-white p-3 shadow-card md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto]"
        >
          <label className="sr-only" htmlFor="project-keyword">Tên dự án hoặc chủ đầu tư</label>
          <input
            id="project-keyword"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tên dự án hoặc chủ đầu tư"
            className={`${selectClass} min-w-0`}
          />
          <label className="sr-only" htmlFor="project-province">Khu vực</label>
          <select id="project-province" value={filters.provinceCode} onChange={(e) => update({ provinceCode: e.target.value })} className={selectClass}>
            <option value="">Toàn quốc</option>
            {provinces.map((p) => (
              <option key={p.provinceCode} value={p.provinceCode}>{p.provinceName} ({p.projectCount})</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="project-status">Trạng thái</label>
          <select id="project-status" value={filters.status} onChange={(e) => update({ status: e.target.value })} className={selectClass}>
            {statusFilterOptions.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
          </select>
          <label className="sr-only" htmlFor="project-price">Khoảng giá</label>
          <select
            id="project-price"
            value={priceValue}
            onChange={(e) => {
              const [minPrice, maxPrice] = e.target.value.split('|');
              update({ minPrice, maxPrice });
            }}
            className={selectClass}
          >
            {projectPriceRanges.map(([min, max, label]) => <option key={label} value={`${min}|${max}`}>{label}</option>)}
          </select>
          <button type="submit" className="h-10 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">Tìm kiếm</button>
        </form>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-ink">Dự án bất động sản {provinceName || 'toàn quốc'}</h1>
                <p className="mt-1 text-sm text-slate-600">
                  {result.loading ? 'Đang tải…' : <>Hiện đang có <strong className="text-ink">{result.total}</strong> dự án</>}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Sắp xếp
                <select value={filters.sort} onChange={(e) => update({ sort: e.target.value === 'default' ? '' : e.target.value })} className="h-9 rounded-full border border-slate-200 bg-white px-3 text-sm text-ink">
                  {projectSortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>

            {hasFilter && (
              <button type="button" onClick={() => setSearchParams({})} className="mt-2 text-sm font-semibold text-brand-600">Xóa bộ lọc</button>
            )}

            <div className="mt-5 space-y-5">
              {result.loading ? (
                Array.from({ length: 3 }, (_, i) => <div key={i} className="h-52 animate-pulse rounded-3xl bg-slate-100" />)
              ) : result.error ? (
                <div className="rounded-3xl border border-red-100 bg-red-50 py-12 text-center">
                  <p className="font-bold text-red-700">{result.error}</p>
                  <button type="button" onClick={() => setRetry((v) => v + 1)} className="mt-4 h-10 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold">Thử lại</button>
                </div>
              ) : result.items.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-brand-200 bg-white py-14 text-center">
                  <p className="font-bold text-ink">Không có dự án phù hợp</p>
                  <button type="button" onClick={() => setSearchParams({})} className="mt-3 text-sm font-semibold text-brand-600">Xem tất cả dự án</button>
                </div>
              ) : (
                result.items.map((project) => <ProjectCard key={project.id} project={project} variant="row" />)
              )}
            </div>

            {!result.loading && pageCount > 1 && (
              <nav aria-label="Phân trang" className="mt-8 flex justify-center gap-2">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-current={n === filters.page ? 'page' : undefined}
                    onClick={() => {
                      update({ page: n > 1 ? String(n) : '' });
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }}
                    className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition-colors ${n === filters.page ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : 'border border-slate-200 bg-white text-ink hover:border-brand-300'}`}
                  >
                    {n}
                  </button>
                ))}
              </nav>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
              <h2 className="mb-3 font-extrabold text-ink">Dự án theo khu vực</h2>
              <ul className="space-y-1.5">
                {provinces.map((p) => (
                  <li key={p.provinceCode}>
                    <button
                      type="button"
                      onClick={() => update({ provinceCode: filters.provinceCode === p.provinceCode ? '' : p.provinceCode })}
                      className={`flex w-full justify-between text-left text-sm hover:text-brand-600 ${filters.provinceCode === p.provinceCode ? 'font-semibold text-brand-700' : 'text-slate-600'}`}
                    >
                      <span>{p.provinceName}</span>
                      <span className="text-slate-400">({p.projectCount})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
              <h2 className="mb-3 font-extrabold text-ink">Theo trạng thái</h2>
              <div className="flex flex-wrap gap-2">
                {statusFilterOptions.filter(([v]) => v).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update({ status: filters.status === value ? '' : value })}
                    className={`h-9 rounded-full border px-3 text-sm ${filters.status === value ? 'border-brand-600 bg-brand-50 font-semibold text-brand-700' : 'border-slate-300 text-ink'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <ProjectImageCredits projects={[...(showFeatured ? featured : []), ...result.items]} />
      </div>
    </div>
  );
}
