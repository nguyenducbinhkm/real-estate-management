import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { newsService } from '../services/newsService';
import { formatNewsDate, newsCategories } from '../data/newsArticles';
import NewsImage from '../components/news/NewsImage';
import NewsSidebar from '../components/news/NewsSidebar';

const PAGE_SIZE = 10;

function Meta({ article, light = false }) {
  return (
    <p className={`text-xs ${light ? 'text-slate-200' : 'text-slate-500'}`}>
      {formatNewsDate(article.publishedAt)} • {article.category}
    </p>
  );
}

function FeaturedBlock({ articles }) {
  const [main, ...others] = articles;
  if (!main) return null;

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Link to={`/news/${main.slug}`} className="group relative block overflow-hidden rounded-3xl shadow-card">
        <NewsImage image={main.image} eager className="h-72 w-full transition-transform duration-500 group-hover:scale-105 md:h-[420px]" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/90 via-ink-900/50 to-transparent p-5 md:p-7">
          <Meta article={main} light />
          <h2 className="mt-2 text-xl font-extrabold leading-snug text-white md:text-2xl">{main.title}</h2>
        </div>
      </Link>

      <ul className="divide-y divide-slate-200">
        {others.map((article) => (
          <li key={article.slug} className="py-4 first:pt-0">
            <Link to={`/news/${article.slug}`} className="group flex gap-3">
              <NewsImage image={article.image} className="h-20 w-28 shrink-0 rounded-2xl" />
              <div className="min-w-0">
                <Meta article={article} />
                <h3 className="mt-1 line-clamp-3 font-bold leading-snug text-ink group-hover:text-brand-600">{article.title}</h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArticleRow({ article }) {
  return (
    <article>
      <Link to={`/news/${article.slug}`} className="group flex flex-col gap-4 sm:flex-row">
        <div className="relative shrink-0 overflow-hidden rounded-2xl sm:w-72">
          <NewsImage image={article.image} className="h-48 w-full transition-transform duration-500 group-hover:scale-105 sm:h-44" />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 shadow-sm">
            {article.category}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500">
            {formatNewsDate(article.publishedAt)} • {article.author}
          </p>
          <h3 className="mt-1.5 text-lg font-extrabold leading-snug text-ink group-hover:text-brand-600">{article.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{article.summary}</p>
        </div>
      </Link>
    </article>
  );
}

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const q = searchParams.get('q') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const [keyword, setKeyword] = useState(q);
  const [result, setResult] = useState({ items: [], total: 0, loading: true });

  useEffect(() => setKeyword(q), [q]);

  useEffect(() => {
    let active = true;
    setResult((value) => ({ ...value, loading: true }));
    newsService.search({ category, q, page, pageSize: PAGE_SIZE }).then((data) => {
      if (active) setResult({ items: data.items, total: data.total, loading: false });
    });
    return () => {
      active = false;
    };
  }, [category, q, page]);

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next);
  };

  const showFeatured = !category && !q && page === 1;
  const featured = showFeatured ? result.items.slice(0, 4) : [];
  const list = result.items;
  const pageCount = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <div>
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
            <Link to="/" className="hover:text-brand-600">Trang chủ</Link>
            <span className="mx-1.5">/</span>
            <span className="text-ink">Tin tức</span>
          </nav>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              updateParams({ q: keyword.trim() });
            }}
            className="flex w-full items-center gap-2 rounded-full bg-slate-50 px-4 ring-1 ring-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-300 sm:w-72"
          >
            <label className="sr-only" htmlFor="news-search">Tìm bài viết</label>
            <input
              id="news-search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm bài viết…"
              className="h-9 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="text-sm font-semibold text-brand-600">Tìm</button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold text-ink md:text-4xl">Tin tức bất động sản mới nhất</h1>
          <p className="mt-3 text-slate-600">
            Thông tin thị trường, dự án và sự kiện bất động sản được BS Realty tổng hợp, tóm tắt ngắn gọn kèm liên kết tới bài gốc.
          </p>
        </header>

        {showFeatured && !result.loading && (
          <div className="mt-8">
            <FeaturedBlock articles={featured} />
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section>
            <div role="tablist" aria-label="Chủ đề" className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
              {[['', 'Tất cả'], ...newsCategories.map((name) => [name, name])].map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={category === value}
                  onClick={() => updateParams({ category: value })}
                  className={`h-9 rounded-full px-4 text-sm font-semibold transition-colors ${
                    category === value ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {q && (
              <p className="mt-4 text-sm text-slate-600">
                Kết quả cho “<strong className="text-ink">{q}</strong>”: {result.total} bài viết.{' '}
                <button type="button" onClick={() => updateParams({ q: '' })} className="font-semibold text-brand-600">Xóa tìm kiếm</button>
              </p>
            )}

            <div className="mt-6 space-y-8">
              {result.loading ? (
                Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="flex flex-col gap-4 sm:flex-row">
                    <div className="h-44 animate-pulse rounded-2xl bg-slate-200 sm:w-72" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                      <div className="h-6 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))
              ) : list.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-brand-200 bg-white py-14 text-center">
                  <p className="font-bold text-ink">Chưa có bài viết phù hợp</p>
                  <button type="button" onClick={() => setSearchParams({})} className="mt-3 text-sm font-semibold text-brand-600">Xem tất cả bài viết</button>
                </div>
              ) : (
                list.map((article) => <ArticleRow key={article.slug} article={article} />)
              )}
            </div>

            {pageCount > 1 && (
              <nav aria-label="Phân trang" className="mt-10 flex justify-center gap-2">
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                  <button
                    key={number}
                    type="button"
                    aria-current={number === page ? 'page' : undefined}
                    onClick={() => updateParams({ page: number > 1 ? String(number) : '' })}
                    className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition-colors ${number === page ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : 'border border-slate-200 bg-white text-ink hover:border-brand-300'}`}
                  >
                    {number}
                  </button>
                ))}
              </nav>
            )}
          </section>

          <NewsSidebar />
        </div>
      </div>
    </div>
  );
}
