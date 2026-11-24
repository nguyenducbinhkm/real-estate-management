import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectService } from '../services/projectService';
import PropertyCard from '../components/property/PropertyCard';
import ProjectCard, { FeaturedBadge, ProjectImageCredits, StatusBadge } from '../components/projects/ProjectCard';
import NewsImage, { ImageCredit } from '../components/news/NewsImage';
import { AreaIcon, CameraIcon } from '../components/property/PropertyIcons';
import Spinner from '../components/ui/Spinner';
import { getProjectImage } from '../data/projectImages';
import { formatDate, formatHectare, formatMoney, formatPriceRange, projectLocation, statusInfo } from '../config/projectOptions';

const LISTING_PAGE_SIZE = 8;

const sections = [
  ['tong-quan', 'Tổng quan'],
  ['giai-doan', 'Giai đoạn mở bán'],
  ['tin-dang', 'Tin đăng'],
  ['lien-quan', 'Dự án liên quan'],
];

function Fact({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 font-bold text-ink">{value}</p>
    </div>
  );
}

function SectionTitle({ id, children }) {
  return <h2 id={id} className="scroll-mt-24 text-xl font-extrabold text-ink md:text-2xl">{children}</h2>;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, project: null, notFound: false, error: '' });
  const [related, setRelated] = useState([]);
  const [listings, setListings] = useState({ items: [], total: 0, page: 0, loading: false });

  const loadListings = (page) => {
    setListings((value) => ({ ...value, loading: true }));
    projectService
      .getListings(id, { page, pageSize: LISTING_PAGE_SIZE })
      .then((data) => setListings((value) => ({
        items: page === 1 ? data.items : [...value.items, ...data.items],
        total: data.total,
        page,
        loading: false,
      })))
      .catch(() => setListings((value) => ({ ...value, loading: false })));
  };

  useEffect(() => {
    let active = true;
    setState({ loading: true, project: null, notFound: false, error: '' });
    setRelated([]);
    window.scrollTo(0, 0);
    projectService
      .getById(id)
      .then((project) => active && setState({ loading: false, project, notFound: false, error: '' }))
      .catch((err) => active && setState({
        loading: false,
        project: null,
        notFound: err.response?.status === 404 || err.response?.status === 400,
        error: 'Không thể tải thông tin dự án.',
      }));
    projectService.getRelated(id, 4).then((items) => active && setRelated(items)).catch(() => {});
    loadListings(1);
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (state.loading) return <div className="py-24"><Spinner /></div>;

  const { project } = state;
  if (!project) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-ink">{state.notFound ? 'Không tìm thấy dự án' : state.error}</h1>
        <Link to="/projects" className="mt-4 inline-block font-semibold text-brand-600">← Về danh sách dự án</Link>
      </div>
    );
  }

  const image = getProjectImage(project);
  const status = statusInfo(project.status);
  const address = [project.streetAddress, project.wardName, project.districtName, project.provinceName].filter(Boolean).join(', ');

  return (
    <div>
      <div className="border-b border-slate-100 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl truncate px-4 py-3 text-sm text-slate-500">
          <Link to="/projects" className="hover:text-brand-600">Dự án</Link>
          <span className="mx-1.5">/</span>
          <Link to={`/projects?provinceCode=${project.provinceCode}`} className="hover:text-brand-600">{project.provinceName}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{project.name}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <figure>
          <div className="group relative overflow-hidden rounded-3xl">
            <NewsImage image={image} eager className="h-64 w-full transition-transform duration-1000 ease-out group-hover:scale-105 md:h-[420px]" />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-ink-900/15" aria-hidden="true" />
            <StatusBadge status={project.status} className="absolute left-4 top-4" />
            {project.isFeatured && <FeaturedBadge label="Dự án nổi bật" className="absolute right-4 top-4" />}
            {project.totalArea > 0 && (
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-ink shadow-sm">
                <AreaIcon className="h-4 w-4 text-brand-600" />
                {formatHectare(project.totalArea)}
              </span>
            )}
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-xs text-white backdrop-blur-sm">
              <CameraIcon className="h-3.5 w-3.5" />
              Ảnh minh họa khu vực
            </span>
          </div>
          <figcaption className="mt-2"><ImageCredit image={image} /></figcaption>
        </figure>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0">
            <h1 className="text-3xl font-extrabold text-ink md:text-4xl">{project.name}</h1>
            <p className="mt-2 text-slate-600">{address}</p>

            <div className="mt-5 grid grid-cols-2 gap-4 rounded-3xl bg-brand-50/70 p-5 ring-1 ring-brand-100 sm:grid-cols-4">
              <Fact label="Khoảng giá" value={formatPriceRange(project.minPrice, project.maxPrice)} />
              <Fact label="Diện tích" value={formatHectare(project.totalArea)} />
              <Fact label="Giai đoạn" value={`${project.phaseCount} giai đoạn`} />
              <Fact label="Tin đăng" value={`${project.listingCount} tin`} />
            </div>

            <nav aria-label="Mục lục dự án" className="sticky top-16 z-10 mt-6 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white xl:top-[72px]">
              {sections.map(([anchor, label]) => (
                <a key={anchor} href={`#${anchor}`} className="my-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700">
                  {label}
                </a>
              ))}
            </nav>

            <section className="mt-8">
              <SectionTitle id="tong-quan">Tổng quan {project.name}</SectionTitle>
              <dl className="mt-4 grid gap-x-6 gap-y-3 rounded-3xl bg-slate-50 p-5 sm:grid-cols-2">
                {[
                  ['Chủ đầu tư', project.developer],
                  ['Trạng thái', status.label],
                  ['Vị trí', projectLocation(project)],
                  ['Khoảng giá', formatPriceRange(project.minPrice, project.maxPrice)],
                  ['Diện tích', formatHectare(project.totalArea)],
                  ['Ngày mở bán', formatDate(project.launchDate)],
                  ['Ngày bàn giao (dự kiến)', formatDate(project.handoverDate)],
                  ['Số tin đăng', `${project.listingCount} tin`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 border-b border-slate-200 pb-2 text-sm">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-right font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              {project.description && <p className="mt-5 leading-relaxed text-slate-700">{project.description}</p>}
            </section>

            <section className="mt-10">
              <SectionTitle id="giai-doan">Giai đoạn mở bán</SectionTitle>
              {project.phases.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Chưa có thông tin giai đoạn.</p>
              ) : (
                <ol className="mt-5 space-y-4 border-l-2 border-brand-300 pl-6">
                  {project.phases.map((phase) => (
                    <li key={phase.id} className="relative">
                      <span className="absolute -left-[33px] top-0.5 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                        {phase.sortOrder}
                      </span>
                      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-bold text-ink">{phase.name}</h3>
                          {phase.startingPrice && <p className="text-sm font-bold text-brand-700">Giá từ {formatMoney(phase.startingPrice)}</p>}
                        </div>
                        {phase.description && <p className="mt-1 text-sm text-slate-600">{phase.description}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="mt-10">
              <SectionTitle id="tin-dang">Tin đăng thuộc dự án ({listings.total})</SectionTitle>
              {listings.items.length === 0 && !listings.loading ? (
                <p className="mt-3 text-sm text-slate-500">Chưa có tin đăng trong dự án này.</p>
              ) : (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {listings.items.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}
                </div>
              )}
              {listings.items.length < listings.total && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    disabled={listings.loading}
                    onClick={() => loadListings(listings.page + 1)}
                    className="h-11 rounded-full border border-brand-200 px-7 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50"
                  >
                    {listings.loading ? 'Đang tải…' : `Xem thêm tin (${listings.total - listings.items.length})`}
                  </button>
                </div>
              )}
            </section>

            {related.length > 0 && (
              <section className="mt-12">
                <SectionTitle id="lien-quan">Dự án liên quan</SectionTitle>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {related.map((item) => <ProjectCard key={item.id} project={item} />)}
                </div>
              </section>
            )}
          </article>

          <aside className="h-fit space-y-4 lg:sticky lg:top-24">
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
              <p className="text-sm text-slate-500">Khoảng giá</p>
              <p className="mt-1 text-2xl font-extrabold text-brand-700">{formatPriceRange(project.minPrice, project.maxPrice)}</p>
              <p className="mt-3 text-sm text-slate-600">Chủ đầu tư: <strong className="text-ink">{project.developer}</strong></p>
              <p className="mt-1 text-sm text-slate-600">Bàn giao dự kiến: <strong className="text-ink">{formatDate(project.handoverDate)}</strong></p>
              <a href="#tin-dang" className="mt-4 flex h-12 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white shadow-md shadow-brand-600/30 hover:bg-brand-700">
                Xem {project.listingCount} tin đăng
              </a>
              <Link
                to={`/projects?provinceCode=${project.provinceCode}`}
                className="mt-2 flex h-12 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-ink hover:border-brand-400 hover:text-brand-700"
              >
                Dự án khác tại {project.provinceName}
              </Link>
            </section>
          </aside>
        </div>

        <ProjectImageCredits projects={[project, ...related]} />
      </div>
    </div>
  );
}
