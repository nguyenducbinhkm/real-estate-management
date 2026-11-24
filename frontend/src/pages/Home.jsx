import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSearch from '../components/home/HeroSearch';
import PropertyCard from '../components/property/PropertyCard';
import { listingService } from '../services/listingService';
import { newsService } from '../services/newsService';
import { formatNewsDate } from '../data/newsArticles';
import NewsImage from '../components/news/NewsImage';
import ProjectCard from '../components/projects/ProjectCard';
import { projectService } from '../services/projectService';
import { featuredLocations, introBlocks } from '../data/homeContent';
import { utilityTools } from '../config/utilities';

function SectionHeader({ title, to, linkLabel = 'Xem thêm', children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <h2 className="text-xl font-extrabold text-ink md:text-2xl">{title}</h2>
      {children}
      {to && (
        <Link to={to} className="rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

// Dùng chung nguồn dữ liệu với trang Tin tức (newsService); rê chuột vào tiêu đề để đổi bài nổi bật.
function NewsSection() {
  const [articles, setArticles] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let alive = true;
    newsService.search({ page: 1, pageSize: 6 }).then((data) => alive && setArticles(data.items));
    return () => {
      alive = false;
    };
  }, []);

  const featured = articles[active] || articles[0];
  if (!featured) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10">
      <SectionHeader title="Tin tức bất động sản" to="/news" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Link to={`/news/${featured.slug}`} className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
          <div className="overflow-hidden">
            <NewsImage image={featured.image} className="h-56 w-full transition-transform duration-500 group-hover:scale-105 md:h-72" />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold text-ink group-hover:text-brand-600">{featured.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{formatNewsDate(featured.publishedAt)} • {featured.category}</p>
          </div>
        </Link>
        <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-100 bg-white shadow-card">
          {articles.map((item, index) => (
            <li key={item.slug}>
              <Link
                to={`/news/${item.slug}`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={`block px-4 py-3.5 text-sm transition-colors ${index === active ? 'bg-brand-50 font-semibold text-brand-700' : 'text-ink hover:bg-slate-50'}`}
              >
                {item.title}
                <span className="mt-1 block text-xs font-normal text-slate-500">{formatNewsDate(item.publishedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ListingsForYou() {
  const [tab, setTab] = useState('ForSale');
  const [state, setState] = useState({ loading: true, items: [], error: '' });

  useEffect(() => {
    let active = true;
    setState((value) => ({ ...value, loading: true, error: '' }));
    listingService
      .search({ transactionType: tab, page: 1, pageSize: 8 })
      .then((data) => active && setState({ loading: false, items: data.items || [], error: '' }))
      .catch(() => active && setState({ loading: false, items: [], error: 'Không thể tải tin đăng lúc này.' }));
    return () => {
      active = false;
    };
  }, [tab]);

  const tabButton = (value, label) => (
    <button
      type="button"
      onClick={() => setTab(value)}
      aria-pressed={tab === value}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${tab === value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-ink'}`}
    >
      {label}
    </button>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12">
      <SectionHeader title="Bất động sản dành cho bạn">
        <div className="order-last inline-flex rounded-full bg-slate-100 p-1 sm:order-none">
          {tabButton('ForSale', 'Nhà đất bán')}
          {tabButton('ForRent', 'Nhà đất cho thuê')}
        </div>
      </SectionHeader>

      {state.loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : state.error || state.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
          {state.error || 'Chưa có tin đăng.'}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {state.items.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          to={`/listings?transactionType=${tab}`}
          className="inline-flex h-11 items-center rounded-full border border-brand-200 bg-white px-7 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Xem thêm tin đăng
        </Link>
      </div>
    </section>
  );
}

// Dự án thật từ database (API /api/projects), dự án nổi bật xếp trước.
function FeaturedProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let alive = true;
    projectService.search({ pageSize: 4 }).then((data) => alive && setProjects(data.items)).catch(() => alive && setProjects([]));
    return () => {
      alive = false;
    };
  }, []);

  if (projects.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12">
      <SectionHeader title="Dự án bất động sản nổi bật" to="/projects" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>
    </section>
  );
}

function LocationsSection() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let active = true;
    Promise.allSettled(
      featuredLocations.map((location) =>
        listingService.search({ provinceCode: location.code, page: 1, pageSize: 1 }).then((data) => [location.code, data.total]),
      ),
    ).then((results) => {
      if (!active) return;
      setCounts(Object.fromEntries(results.filter((r) => r.status === 'fulfilled').map((r) => r.value)));
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12">
      <SectionHeader title="Bất động sản theo địa điểm" />
      <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
        {featuredLocations.map((location) => (
          <Link
            key={location.code}
            to={`/listings?provinceCode=${location.code}`}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-700 to-ink transition-shadow hover:shadow-lift ${location.large ? 'h-48 md:col-span-2 md:row-span-2 md:h-auto' : 'h-40 md:h-44'}`}
          >
            <NewsImage image={location.image} className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-110" />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/25 to-transparent transition-colors duration-500 group-hover:from-brand-900/90" aria-hidden="true" />
            <span className="absolute right-3 top-3 grid h-9 w-9 translate-x-2 place-items-center rounded-full bg-white/90 text-brand-700 opacity-0 shadow-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
            </span>
            {location.image?.author && (
              <span className="absolute bottom-1.5 right-3 z-10 text-[9px] text-white/60">
                Ảnh: {location.image.author} / {location.image.license}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className={`font-extrabold text-white ${location.large ? 'text-2xl' : 'text-lg'}`}>{location.name}</p>
              {counts[location.code] !== undefined && (
                <p className="mt-2 inline-flex rounded-full bg-white/20 px-3 py-0.5 text-sm text-white backdrop-blur">{counts[location.code].toLocaleString('vi-VN')} tin đăng</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function UtilitiesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12">
      <SectionHeader title="Hỗ trợ tiện ích" to="/utilities" linkLabel="Tất cả tiện ích" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {utilityTools.map((tool) => (
          <Link key={tool.slug} to={`/utilities/${tool.slug}`} className="group rounded-2xl border border-slate-100 bg-white shadow-card p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-xl font-bold text-brand-600" aria-hidden="true">
              {tool.icon}
            </span>
            <p className="mt-3 font-bold text-ink group-hover:text-brand-600">{tool.title}</p>
            <p className="mt-1 text-xs text-slate-500">{tool.short}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function IntroAndLinks() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 pt-14">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {introBlocks.map((block) => (
          <Link key={block.title} to={block.to} className="group rounded-2xl border border-slate-100 bg-white shadow-card p-5 transition-colors hover:border-brand-300">
            <h3 className="font-extrabold text-ink group-hover:text-brand-600">{block.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{block.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <HeroSearch />
      <NewsSection />
      <ListingsForYou />
      <FeaturedProjects />
      <LocationsSection />
      <UtilitiesSection />
      <IntroAndLinks />
    </div>
  );
}
