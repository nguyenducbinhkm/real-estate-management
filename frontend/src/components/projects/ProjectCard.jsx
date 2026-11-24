import { Link } from 'react-router-dom';
import NewsImage, { ImageCredit } from '../news/NewsImage';
import { getProjectImage } from '../../data/projectImages';
import { formatHectare, formatPriceRange, projectLocation, statusInfo } from '../../config/projectOptions';
import { ProjectIcon } from './ProjectIcons';
import { AreaIcon } from '../property/PropertyIcons';
import { HoverCorner, ImageShade, zoomImageClass } from '../ui/CardImageFx';

function StatusBadge({ status, className = '' }) {
  const info = statusInfo(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm ${info.tone} ${className}`}>
      <ProjectIcon name={info.icon} />
      {info.label}
    </span>
  );
}

/** Nhãn "Nổi bật" màu vàng logo, kèm ngôi sao. */
function FeaturedBadge({ label = 'Nổi bật', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm [text-shadow:0_1px_1px_rgba(0,0,0,0.25)] ${className}`}>
      <ProjectIcon name="star" className="h-3.5 w-3.5 fill-white/90" />
      {label}
    </span>
  );
}

/** Góc trái dưới ảnh: quy mô dự án (ha), giống nhãn diện tích trên thẻ tin đăng. */
function AreaChip({ project }) {
  if (!project.totalArea) return null;
  return (
    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm">
      <AreaIcon className="h-3.5 w-3.5 text-brand-600" />
      {formatHectare(project.totalArea)}
    </span>
  );
}

/** Thẻ dự án. variant="grid" (thẻ dọc) hoặc "row" (thẻ ngang cho trang danh sách). */
export default function ProjectCard({ project, variant = 'grid' }) {
  const image = getProjectImage(project);
  // Quy mô (ha) đã hiện trên ảnh nên dòng thông tin chỉ còn số giai đoạn và tin đăng.
  const facts = [`${project.phaseCount} giai đoạn`, `${project.listingCount} tin đăng`];

  if (variant === 'row') {
    return (
      <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
        <Link to={`/projects/${project.id}`} className="group block md:flex">
          <div className="relative m-2 shrink-0 overflow-hidden rounded-2xl md:mr-0 md:w-80">
            <NewsImage image={image} className={`h-52 w-full md:h-full md:min-h-[210px] ${zoomImageClass}`} />
            <ImageShade />
            <StatusBadge status={project.status} className="absolute left-3 top-3" />
            {project.isFeatured && <FeaturedBadge className="absolute right-3 top-3" />}
            <AreaChip project={project} />
            <HoverCorner note="Ảnh minh họa khu vực" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col p-5">
            <h3 className="text-lg font-extrabold text-ink transition-colors group-hover:text-brand-700">{project.name}</h3>
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
    <Link to={`/projects/${project.id}`} className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative m-2 mb-0 overflow-hidden rounded-xl">
        <NewsImage image={image} className={`h-44 w-full ${zoomImageClass}`} />
        <ImageShade />
        <StatusBadge status={project.status} className="absolute left-3 top-3" />
        {project.isFeatured && <FeaturedBadge className="absolute right-3 top-3" />}
        <AreaChip project={project} />
        <HoverCorner note="Ảnh minh họa khu vực" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-ink transition-colors group-hover:text-brand-700">{project.name}</h3>
        <p className="mt-1 text-sm font-semibold text-brand-700">{formatPriceRange(project.minPrice, project.maxPrice)}</p>
        <p className="mt-1 text-sm text-slate-600">{facts.join(' · ')}</p>
        <p className="mt-2 text-sm text-slate-500">{projectLocation(project)}</p>
      </div>
    </Link>
  );
}

export { FeaturedBadge, StatusBadge };

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
