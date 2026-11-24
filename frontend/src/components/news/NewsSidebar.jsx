import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { newsService } from '../../services/newsService';
import { provinces } from '../../data/homeContent';

function Box({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
      <h2 className="mb-3 text-base font-extrabold text-ink">{title}</h2>
      {children}
    </section>
  );
}

const hotProvinces = provinces.filter(([code]) => code === '01' || code === '79');
const otherProvinces = provinces.filter(([code]) => code && code !== '01' && code !== '79');

const topics = [
  ['Tin tức bất động sản', '/news'],
  ['Thị trường', '/news?category=Th%E1%BB%8B%20tr%C6%B0%E1%BB%9Dng'],
  ['Dự án', '/news?category=D%E1%BB%B1%20%C3%A1n'],
  ['Sự kiện', '/news?category=S%E1%BB%B1%20ki%E1%BB%87n'],
  ['Quy hoạch - Pháp lý', '/wiki/quy-hoach-phap-ly'],
  ['Tài chính BĐS', '/wiki/tai-chinh'],
  ['Tính lãi vay', '/utilities/tinh-lai-vay'],
];

export default function NewsSidebar({ excludeSlug }) {
  const [mostViewed, setMostViewed] = useState([]);

  useEffect(() => {
    let active = true;
    newsService.mostViewed(5).then((items) => active && setMostViewed(items));
    return () => {
      active = false;
    };
  }, []);

  return (
    <aside className="space-y-5">
      <Box title="Bài viết được xem nhiều nhất">
        <ol className="space-y-3">
          {mostViewed.map((article, index) => (
            <li key={article.slug} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                {index + 1}
              </span>
              <Link
                to={`/news/${article.slug}`}
                aria-current={article.slug === excludeSlug ? 'page' : undefined}
                className="text-sm font-medium leading-snug text-ink hover:text-brand-600"
              >
                {article.title}
              </Link>
            </li>
          ))}
        </ol>
      </Box>

      <Box title="Thị trường BĐS tại các tỉnh / thành sôi động nhất">
        <div className="flex flex-wrap gap-2">
          {hotProvinces.map(([code, name]) => (
            <Link key={code} to={`/listings?provinceCode=${code}`} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-ink hover:border-brand-500 hover:text-brand-700">
              {name}
            </Link>
          ))}
        </div>
      </Box>

      <Box title="Thị trường BĐS tại các tỉnh / thành phố lớn">
        <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
          {otherProvinces.map(([code, name]) => (
            <li key={code}>
              <Link to={`/listings?provinceCode=${code}`} className="text-sm text-slate-600 hover:text-brand-600">{name}</Link>
            </li>
          ))}
        </ul>
      </Box>

      <Box title="Chủ đề nổi bật">
        <div className="flex flex-wrap gap-2">
          {topics.map(([label, to]) => (
            <Link key={label} to={to} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700">
              {label}
            </Link>
          ))}
        </div>
      </Box>
    </aside>
  );
}
