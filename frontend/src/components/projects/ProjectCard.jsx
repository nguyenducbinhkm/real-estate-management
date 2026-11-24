import { Link } from 'react-router-dom';
import NewsImage, { ImageCredit } from '../news/NewsImage';
import { getProjectImage } from '../../data/projectImages';
import { formatHectare, formatPriceRange, projectLocation, statusInfo } from '../../config/projectOptions';

function StatusBadge({ status, className = '' }) {
  const info = statusInfo(status);
  return <span className={`rounded-md px-2 py-1 text-xs font-semibold text-white ${info.tone} ${className}`}>{info.label}</span>;
}

/** Thẻ dự án. variant="grid" (thẻ dọc) hoặc "row" (thẻ ngang cho trang danh sách). */
export default function ProjectCard({ project, variant = 'grid' }) {
  const image = getProjectImage(project);
  const facts = [formatHectare(project.totalArea), `${project.phaseCount} giai đoạn`, `${project.listingCount} tin đăng`];

  if (variant === 'row') {
    return (
      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-card">
        <Link to={`/projects/${project.id}`} className="group block md:flex">
          <div className="relative shrink-0 overflow-hidden md:w-80">
            <NewsImage image={image} className="h-52 w-full transition-transform duration-500 group-hover:scale-105 md:h-full md:min-h-[210px]" />
            <StatusBadge status={project.status} className="absolute left-3 top-3" />
            {project.isFeatured && (
              <span className="absolute right-3 top-3 rounded-md bg-brand-600 px-2 py-1 text-xs font-semibold text-white">Nổi bật</span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col p-5">
            <h3 className="text-lg font-extrabold text-ink group-hover:text-brand-600">{project.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{[project.streetAddress, projectLocation(project)].filter(Boolean).join(', ')}</p>
            <p className="mt-3 text-base font-bold text-brand-700">{formatPriceRange(project.minPrice, project.maxPrice)}</p>
            <p className="mt-2 flex flex-wrap gap-x-2 text-sm text-slate-600">
              {facts.map((fact, index) => (
                <span key={fact}>{index > 0 && <span className="mr-2 text-slate-300">·</span>}{fact}</span>
              ))}
            </p>
            <p className="mt-auto pt-4 text-sm text-slate-500">Chủ đầu tư: <strong className="text-ink">{project.developer}</strong></p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <Link to={`/projects/${project.id}`} className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="relative overflow-hidden">
        <NewsImage image={image} className="h-44 w-full transition-transform duration-500 group-hover:scale-105" />
        <StatusBadge status={project.status} className="absolute left-3 top-3" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-ink group-hover:text-brand-600">{project.name}</h3>
        <p className="mt-1 text-sm font-semibold text-brand-700">{formatPriceRange(project.minPrice, project.maxPrice)}</p>
        <p className="mt-1 text-sm text-slate-600">{formatHectare(project.totalArea)} · {project.listingCount} tin đăng</p>
        <p className="mt-2 text-sm text-slate-500">{projectLocation(project)}</p>
      </div>
    </Link>
  );
}

export { StatusBadge };

/** Ghi nguồn các ảnh minh họa đang hiển thị trên trang (yêu cầu của giấy phép CC). */
export function ProjectImageCredits({ projects }) {
  const seen = new Map();
  projects.forEach((project) => {
    const image = getProjectImage(project);
    if (image && !seen.has(image.url)) seen.set(image.url, image);
  });
  if (seen.size === 0) return null;

  return (
    <section className="mt-10 border-t border-slate-200 pt-4">
      <p className="text-xs font-semibold text-slate-500">Ảnh minh họa khu vực, không phải ảnh thực tế của dự án:</p>
      <div className="mt-1 space-y-0.5">
        {[...seen.values()].map((image) => <ImageCredit key={image.url} image={image} />)}
      </div>
    </section>
  );
}
