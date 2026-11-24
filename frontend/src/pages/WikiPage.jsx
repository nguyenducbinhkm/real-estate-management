import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  articlesInCategory,
  featuredWikiSlugs,
  formatWikiDate,
  getWikiArticle,
  getWikiCategory,
  wikiArticles,
  wikiCategories,
} from '../data/wikiArticles';
import { heroSlides } from '../data/homeContent';
import { provinceList } from '../data/locations';
import { getUtility } from '../config/utilities';
import { listingService } from '../services/listingService';
import NewsImage, { ImageCredit } from '../components/news/NewsImage';

/* Bố cục tham khảo chuyên trang Wiki của batdongsan.com.vn (thanh chuyên mục, bài nổi bật,
   danh sách bài mới, cột phải); nội dung bài viết do BS Realty tự biên soạn. */

const normalize = (text) => (text || '').toLocaleLowerCase('vi').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
const articleUrl = (article) => `/wiki/${article.category}/${article.slug}`;
const newest = [...wikiArticles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
const PAGE_SIZE = 6;

/* ------------------------------ Biểu tượng ------------------------------ */

const iconPaths = {
  'mua-bds': <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" /></>,
  'ban-bds': <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
  'thue-bds': <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9" /><path d="m17 6 3 3" /><path d="m15 8 2 2" /></>,
  'tai-chinh': <><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
  'quy-hoach-phap-ly': <><path d="M12 3v18" /><path d="M7 21h10" /><path d="M4 7h16" /><path d="m4 7-2.5 6a3 3 0 0 0 5 0L4 7Z" /><path d="m20 7-2.5 6a3 3 0 0 0 5 0L20 7Z" /></>,
  'noi-ngoai-that': <><path d="M4 18v-6a2 2 0 0 1 4 0v2h8v-2a2 2 0 0 1 4 0v6Z" /><path d="M6 10V7a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3" /><path d="M6 18v2M18 18v2" /></>,
  'phong-tuc': <><path d="m12 2 7 3 3 7-3 7-7 3-7-3-3-7 3-7Z" /><circle cx="12" cy="12" r="4" /><path d="M12 8a2 2 0 0 0 0 4 2 2 0 0 1 0 4" /></>,
};

function CategoryIcon({ slug, className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[slug]}
    </svg>
  );
}

function SearchIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/* ------------------------------ Khung trang ------------------------------ */

/** Thanh chuyên mục nền tối ngay dưới header, mục đang xem có gạch chân. */
function WikiSubNav({ active = '' }) {
  const items = [{ slug: '', name: 'Wiki BĐS' }, ...wikiCategories];
  return (
    <div className="border-b border-slate-100 bg-white">
      <nav aria-label="Chuyên mục Wiki BĐS" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 text-sm font-semibold">
        {items.map((item) => {
          const on = active === item.slug;
          return (
            <Link
              key={item.slug || 'all'}
              to={item.slug ? `/wiki/${item.slug}` : '/wiki'}
              aria-current={on ? 'page' : undefined}
              className={`whitespace-nowrap rounded-full px-4 py-2 transition-colors ${on ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'}`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function WikiSearch() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [text, setText] = useState(params.get('q') || '');

  useEffect(() => setText(params.get('q') || ''), [params]);

  const submit = (event) => {
    event.preventDefault();
    const q = text.trim();
    navigate(q ? `/wiki?q=${encodeURIComponent(q)}` : '/wiki');
  };

  return (
    <form role="search" onSubmit={submit} className="flex items-center gap-2 rounded-full bg-white px-4 text-slate-400 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-brand-300">
      <SearchIcon />
      <label className="sr-only" htmlFor="wiki-search">Tìm bài viết Wiki</label>
      <input
        id="wiki-search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Tìm bài viết: sổ đỏ, vay mua nhà…"
        className="h-9 w-44 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400 sm:w-64"
      />
    </form>
  );
}

/** Dòng breadcrumb (biểu tượng nhà › Wiki BĐS › …) và ô tìm kiếm bên phải. */
function WikiTopBar({ crumbs = [] }) {
  return (
    <div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
          <Link to="/" aria-label="Trang chủ" className="shrink-0 hover:text-brand-600">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" />
            </svg>
          </Link>
          {[['Wiki BĐS', '/wiki'], ...crumbs].map(([label, to], index, list) => (
            <span key={label} className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true">›</span>
              {to && index < list.length - 1 ? (
                <Link to={to} className="whitespace-nowrap hover:text-brand-600">{label}</Link>
              ) : (
                <span className="truncate text-slate-700">{label}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="hidden shrink-0 md:block"><WikiSearch /></div>
      </div>
      <div className="px-4 pb-2 md:hidden"><WikiSearch /></div>
    </div>
  );
}

function WikiShell({ active, crumbs, children }) {
  return (
    <div>
      <WikiSubNav active={active} />
      <WikiTopBar crumbs={crumbs} />
      <div className="mx-auto max-w-6xl px-4 pb-16">{children}</div>
    </div>
  );
}

function PageTitle({ title, description }) {
  return (
    <header className="mx-auto max-w-3xl py-10 text-center">
      <h1 className="text-3xl font-extrabold text-ink md:text-4xl">{title}</h1>
      {description && <p className="mt-3 leading-relaxed text-slate-600">{description}</p>}
    </header>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-2xl font-extrabold text-ink">{children}</h2>;
}

/* ------------------------------- Thẻ bài viết ------------------------------- */

function ArticleMeta({ article, withCategory = true, className = '' }) {
  const category = getWikiCategory(article.category);
  return (
    <p className={`text-xs ${className}`}>
      {formatWikiDate(article.updatedAt)}
      {withCategory ? ` · ${category?.name}` : ' · BS Realty'}
    </p>
  );
}

/** Bài nổi bật cỡ lớn: ảnh phủ, ngày · chuyên mục, tiêu đề và mô tả nằm trên ảnh. */
function FeaturedArticle({ article }) {
  return (
    <Link to={articleUrl(article)} className="group relative block h-72 overflow-hidden rounded-3xl bg-ink shadow-card md:h-[400px]">
      <NewsImage image={article.image} eager className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
        <ArticleMeta article={article} className="text-slate-200" />
        <h2 className="mt-2 text-xl font-extrabold leading-snug text-white md:text-[28px] md:leading-tight">{article.title}</h2>
        <p className="mt-3 hidden text-sm leading-relaxed text-slate-200 sm:line-clamp-2">{article.summary}</p>
      </div>
    </Link>
  );
}

/** Danh sách tiêu đề ngắn đặt cạnh bài nổi bật. */
function HeadlineList({ articles }) {
  return (
    <ul className="divide-y divide-slate-200">
      {articles.map((article) => (
        <li key={article.slug} className="py-4 first:pt-0">
          <ArticleMeta article={article} className="text-slate-500" />
          <Link to={articleUrl(article)} className="mt-1.5 block text-lg font-bold leading-snug text-ink hover:text-brand-600">
            {article.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Một dòng trong danh sách bài mới: ảnh có nhãn chuyên mục, ngày · tác giả, tiêu đề, mô tả, thẻ. */
function ArticleRow({ article }) {
  const category = getWikiCategory(article.category);
  return (
    <article className="flex gap-4 border-b border-slate-200 py-6 sm:gap-5">
      <Link to={articleUrl(article)} className="group relative h-24 w-32 shrink-0 overflow-hidden rounded-2xl sm:h-36 sm:w-56">
        <NewsImage image={article.image} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-brand-700 shadow-sm">
          {category?.name}
        </span>
      </Link>
      <div className="min-w-0 flex-1">
        <ArticleMeta article={article} withCategory={false} className="text-slate-500" />
        <h3 className="mt-1.5 text-base font-bold leading-snug text-ink sm:text-lg">
          <Link to={articleUrl(article)} className="hover:text-brand-600">{article.title}</Link>
        </h3>
        <p className="mt-2 hidden text-sm leading-relaxed text-slate-600 sm:line-clamp-2">{article.summary}</p>
        <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
          {article.tags.map((tag) => (
            <Link key={tag} to={`/wiki?q=${encodeURIComponent(tag)}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700">
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

function ArticleList({ articles, empty = 'Chưa có bài viết.' }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  if (articles.length === 0) return <p className="py-6 text-sm text-slate-500">{empty}</p>;
  return (
    <>
      {articles.slice(0, shown).map((article) => <ArticleRow key={article.slug} article={article} />)}
      {shown < articles.length && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShown((value) => value + PAGE_SIZE)}
            className="h-11 rounded-full border border-brand-200 bg-white px-7 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            Xem thêm
          </button>
        </div>
      )}
    </>
  );
}

/* --------------------------------- Cột phải --------------------------------- */

function SideBox({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
      <h2 className="text-lg font-extrabold leading-snug text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PopularArticles({ exclude }) {
  const list = featuredWikiSlugs
    .map((slug) => wikiArticles.find((article) => article.slug === slug))
    .filter((article) => article && article.slug !== exclude)
    .slice(0, 5);
  return (
    <SideBox title="Bài viết nổi bật">
      <ol className="divide-y divide-slate-100">
        {list.map((article, index) => (
          <li key={article.slug} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{index + 1}</span>
            <Link to={articleUrl(article)} className="text-sm font-medium leading-snug text-slate-700 hover:text-brand-600">{article.title}</Link>
          </li>
        ))}
      </ol>
    </SideBox>
  );
}

const shortName = (name) => name.replace(/^(Thành phố|Tỉnh)\s+/, '');
const provinceName = (code) => shortName(provinceList.find(([value]) => value === code)?.[1] || code);

const hotCities = [
  { code: '01', image: heroSlides[0].image },
  { code: '79', image: heroSlides[1].image, credit: heroSlides[1].imageCredit },
];
const bigProvinces = ['77', '74', '48', '75', '31', '33', '56', '80', '27', '92'];

// Đếm số tin đăng theo tỉnh một lần, dùng lại cho mọi trang Wiki.
let provinceCountCache = null;
function useProvinceCounts() {
  const [counts, setCounts] = useState(provinceCountCache || {});
  useEffect(() => {
    if (provinceCountCache) return undefined;
    let alive = true;
    const codes = [...hotCities.map((city) => city.code), ...bigProvinces];
    Promise.allSettled(
      codes.map((code) => listingService.search({ provinceCode: code, page: 1, pageSize: 1 }).then((data) => [code, data.total])),
    ).then((results) => {
      provinceCountCache = Object.fromEntries(results.filter((r) => r.status === 'fulfilled').map((r) => r.value));
      if (alive) setCounts(provinceCountCache);
    });
    return () => {
      alive = false;
    };
  }, []);
  return counts;
}

function MarketBoxes() {
  const counts = useProvinceCounts();
  const countText = (code) => (counts[code] !== undefined ? `${counts[code].toLocaleString('vi-VN')} tin` : '');

  return (
    <>
      <SideBox title="Thị trường BĐS tại các tỉnh / thành sôi động nhất">
        <div className="grid grid-cols-2 gap-3">
          {hotCities.map((city) => (
            <Link key={city.code} to={`/listings?provinceCode=${city.code}`} className="group relative block h-24 overflow-hidden rounded-2xl bg-ink">
              <img src={city.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <span className="absolute inset-0 bg-black/40" />
              <span className="absolute inset-x-0 bottom-0 p-2 text-center">
                <span className="block text-sm font-bold text-white">{provinceName(city.code)}</span>
                <span className="block text-[11px] text-brand-100">{countText(city.code)}</span>
              </span>
            </Link>
          ))}
        </div>
        {hotCities.filter((city) => city.credit).map((city) => (
          <p key={city.code} className="mt-2 text-[10px] text-slate-400">
            Ảnh {provinceName(city.code)}:{' '}
            <a href={city.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{city.credit.author}</a>
            {' / '}
            <a href={city.credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">{city.credit.license}</a>
          </p>
        ))}
      </SideBox>

      <SideBox title="Thị trường BĐS tại 10 tỉnh / thành phố lớn">
        <ul className="space-y-1">
          {bigProvinces.map((code) => (
            <li key={code}>
              <Link to={`/listings?provinceCode=${code}`} className="flex items-center gap-3 rounded-md px-1 py-1.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600">
                <span className="grid h-8 w-10 shrink-0 place-items-center rounded bg-brand-50 text-brand-600">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" />
                  </svg>
                </span>
                <span className="flex-1">{provinceName(code)}</span>
                <span className="text-xs text-slate-400">{countText(code)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </SideBox>
    </>
  );
}

/* ---------------------------------- Trang ---------------------------------- */

function WikiHome() {
  const [params] = useSearchParams();
  const query = (params.get('q') || '').trim();
  const results = useMemo(() => {
    const keyword = normalize(query);
    if (!keyword) return [];
    return newest.filter((article) => normalize(`${article.title} ${article.summary} ${article.tags.join(' ')}`).includes(keyword));
  }, [query]);

  if (query) {
    return (
      <WikiShell crumbs={[['Tìm kiếm']]}>
        <PageTitle title={`Kết quả cho “${query}”`} description={`Tìm thấy ${results.length} bài viết phù hợp.`} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <ArticleList
              key={query}
              articles={results}
              empty="Không tìm thấy bài viết phù hợp. Thử từ khóa khác như “sổ đỏ”, “lãi suất”, “phong thủy”."
            />
          </div>
          <aside className="space-y-6"><PopularArticles /></aside>
        </div>
      </WikiShell>
    );
  }

  const [lead, ...rest] = newest;
  return (
    <WikiShell>
      <PageTitle
        title="Wiki BĐS"
        description="Cẩm nang bất động sản dành cho người mua, bán, thuê và đầu tư: các bước giao dịch, tài chính, pháp lý, quy hoạch, nội ngoại thất và phong tục khi làm nhà."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <FeaturedArticle article={lead} />
        <HeadlineList articles={rest.slice(0, 3)} />
      </div>

      <section className="mt-14">
        <SectionTitle>Chuyên mục</SectionTitle>
        <div className="mt-8 grid grid-cols-2 gap-y-8 border-b border-slate-200 pb-10 sm:grid-cols-4">
          {wikiCategories.map((category) => (
            <Link key={category.slug} to={`/wiki/${category.slug}`} className="group flex flex-col items-center gap-3 text-center">
              <span className="grid h-24 w-24 place-items-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                <CategoryIcon slug={category.slug} className="h-11 w-11" />
              </span>
              <span className="font-semibold text-ink group-hover:text-brand-600">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <SectionTitle>Cẩm nang Wiki BĐS mới nhất</SectionTitle>
          <ArticleList articles={rest.slice(3)} />
        </section>
        <aside className="space-y-6">
          <PopularArticles />
          <MarketBoxes />
        </aside>
      </div>
    </WikiShell>
  );
}

function WikiCategory({ category }) {
  const articles = [...articlesInCategory(category.slug)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const [lead, ...rest] = articles;

  return (
    <WikiShell active={category.slug} crumbs={[[category.name]]}>
      <PageTitle title={category.name} description={category.description} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {lead && <FeaturedArticle article={lead} />}
          <section className="mt-12">
            <SectionTitle>{category.name} mới nhất</SectionTitle>
            <ArticleList key={category.slug} articles={rest} empty="Chuyên mục đang được cập nhật thêm bài viết." />
          </section>
        </div>
        <aside className="space-y-6">
          <PopularArticles />
          <MarketBoxes />
        </aside>
      </div>
    </WikiShell>
  );
}

function ShareBox() {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const copy = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <section className="mt-10 flex flex-wrap items-center gap-3 border-y border-slate-200 py-5">
      <h2 className="mr-2 font-bold text-ink">Chia sẻ bài viết này</h2>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-9 rounded-full border border-slate-300 px-4 text-sm font-semibold leading-9 text-slate-700 hover:border-brand-500 hover:text-brand-600"
      >
        Facebook
      </a>
      <button
        type="button"
        onClick={copy}
        className="h-9 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-600"
      >
        {copied ? 'Đã sao chép liên kết' : 'Sao chép liên kết'}
      </button>
    </section>
  );
}

function WikiArticle({ article }) {
  const category = getWikiCategory(article.category);
  const tool = article.relatedTool ? getUtility(article.relatedTool) : null;
  const others = newest.filter((item) => item.slug !== article.slug && item.category === article.category)
    .concat(newest.filter((item) => item.category !== article.category))
    .slice(0, 4);
  const anchor = (index) => `muc-${index + 1}`;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article.slug]);

  return (
    <WikiShell active={category.slug} crumbs={[[category.name, `/wiki/${category.slug}`], [article.title]]}>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <h1 className="text-3xl font-extrabold leading-tight text-ink md:text-[40px] md:leading-[1.2]">{article.title}</h1>

          <div className="mt-5 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white">
              <img src="/images/logo-mark.png" alt="" aria-hidden="true" className="h-7 w-7 object-contain" />
            </span>
            <div className="text-sm">
              <p className="text-slate-600">Được đăng bởi <span className="font-semibold text-ink">BS Realty</span></p>
              <p className="text-slate-500">
                Cập nhật lần cuối vào {formatWikiDate(article.updatedAt)} · Đọc trong khoảng {article.readMinutes} phút
              </p>
            </div>
          </div>

          <p className="mt-6 text-lg font-medium leading-relaxed text-ink">{article.summary}</p>

          <figure className="mt-6">
            <NewsImage image={article.image} eager className="h-60 w-full rounded-3xl md:h-[420px]" />
            <figcaption className="mt-2 italic"><ImageCredit image={article.image} /></figcaption>
          </figure>

          <div className="mt-8 space-y-8">
            {article.sections.map((section, index) => (
              <section key={section.heading} id={anchor(index)} className="scroll-mt-24">
                <h2 className="text-2xl font-extrabold leading-snug text-ink">{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="mt-3 leading-relaxed text-slate-700">{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-slate-700">
                    {section.bullets.map((bullet) => <li key={bullet.slice(0, 32)}>{bullet}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {tool && (
            <Link to={`/utilities/${tool.slug}`} className="mt-10 flex items-center gap-4 rounded-3xl border border-brand-100 bg-brand-50 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-xl font-bold text-brand-600" aria-hidden="true">{tool.icon}</span>
              <span>
                <span className="block text-sm text-slate-600">Công cụ liên quan</span>
                <span className="block font-extrabold text-ink">{tool.title} →</span>
              </span>
            </Link>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link key={tag} to={`/wiki?q=${encodeURIComponent(tag)}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700">
                {tag}
              </Link>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-slate-400">
            Nội dung mang tính tham khảo. Quy định về thuế, phí và thủ tục có thể thay đổi theo thời gian và địa phương – hãy kiểm tra văn bản pháp luật hiện hành hoặc hỏi cơ quan có thẩm quyền.
          </p>

          <ShareBox />

          <section className="mt-10">
            <SectionTitle>Bài viết khác</SectionTitle>
            {others.map((item) => <ArticleRow key={item.slug} article={item} />)}
          </section>
        </article>

        <aside className="h-fit space-y-6 lg:sticky lg:top-24">
          <SideBox title="Nội dung bài viết">
            <ol className="space-y-2 text-sm">
              {article.sections.map((section, index) => (
                <li key={section.heading}>
                  <a href={`#${anchor(index)}`} className="text-slate-600 hover:text-brand-600">{section.heading}</a>
                </li>
              ))}
            </ol>
          </SideBox>
          <PopularArticles exclude={article.slug} />
        </aside>
      </div>
    </WikiShell>
  );
}

/** /wiki (?q= để tìm), /wiki/:category, /wiki/:category/:article */
export default function WikiPage() {
  const { category: categorySlug, article: articleSlug } = useParams();
  if (!categorySlug) return <WikiHome />;

  const category = getWikiCategory(categorySlug);
  if (!category) return <Navigate to="/wiki" replace />;
  if (!articleSlug) return <WikiCategory category={category} />;

  const article = getWikiArticle(categorySlug, articleSlug);
  if (!article) return <Navigate to={`/wiki/${categorySlug}`} replace />;
  return <WikiArticle article={article} />;
}
