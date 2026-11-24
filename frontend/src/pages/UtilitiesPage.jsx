import { Link, Navigate, useParams } from 'react-router-dom';
import { getUtility, utilityTools } from '../config/utilities';
import LoanCalculator from '../components/utilities/LoanCalculator';
import ConstructionEstimator from '../components/utilities/ConstructionEstimator';
import BuildingAgeChecker from '../components/utilities/BuildingAgeChecker';
import HouseDirectionAdvisor from '../components/utilities/HouseDirectionAdvisor';

const tools = {
  'tinh-lai-vay': LoanCalculator,
  'chi-phi-lam-nha': ConstructionEstimator,
  'xem-tuoi-xay-nha': BuildingAgeChecker,
  'huong-nha-hop-tuoi': HouseDirectionAdvisor,
};

function ToolTabs({ active }) {
  return (
    <nav aria-label="Các công cụ" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-card ring-1 ring-slate-100">
      {utilityTools.map((tool) => (
        <Link
          key={tool.slug}
          to={`/utilities/${tool.slug}`}
          aria-current={tool.slug === active ? 'page' : undefined}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tool.slug === active ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
          }`}
        >
          {tool.title}
        </Link>
      ))}
    </nav>
  );
}

/** /utilities – danh sách công cụ; /utilities/:slug – một công cụ. */
export default function UtilitiesPage() {
  const { slug } = useParams();

  if (!slug) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-ink">Hỗ trợ tiện ích</h1>
        <p className="mt-2 max-w-2xl text-slate-600">Các công cụ giúp bạn ước tính tài chính, chi phí xây dựng và tra cứu phong thủy khi mua, xây nhà.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {utilityTools.map((tool) => (
            <Link key={tool.slug} to={`/utilities/${tool.slug}`} className="group flex gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-2xl font-bold text-brand-600" aria-hidden="true">{tool.icon}</span>
              <div>
                <h2 className="text-lg font-extrabold text-ink group-hover:text-brand-600">{tool.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const tool = getUtility(slug);
  const Tool = tools[slug];
  if (!tool || !Tool) return <Navigate to="/utilities" replace />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-600">Trang chủ</Link>
        <span className="mx-1.5">/</span>
        <Link to="/utilities" className="hover:text-brand-600">Tiện ích</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{tool.title}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">{tool.title}</h1>
      <p className="mt-2 text-slate-600">{tool.description}</p>
      <div className="mt-6"><ToolTabs active={slug} /></div>
      <div className="mt-8"><Tool /></div>
    </div>
  );
}
