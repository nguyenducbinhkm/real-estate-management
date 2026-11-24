import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { newsService } from '../services/newsService';
import { formatNewsDate } from '../data/newsArticles';
import NewsImage, { ImageCredit } from '../components/news/NewsImage';
import NewsSidebar from '../components/news/NewsSidebar';
import Spinner from '../components/ui/Spinner';
import { Avatar } from '../components/layout/UserMenu';

function ShareButtons({ title }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-ink">Chia sẻ bài viết này</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-9 rounded-full border border-slate-200 px-4 text-sm leading-9 text-ink hover:border-brand-400 hover:text-brand-700"
        aria-label={`Chia sẻ "${title}" lên Facebook`}
      >
        Facebook
      </a>
      <button type="button" onClick={copy} className="h-9 rounded-full border border-slate-200 px-4 text-sm text-ink hover:border-brand-400 hover:text-brand-700">
        {copied ? 'Đã chép link' : 'Chép link'}
      </button>
    </div>
  );
}

export default function NewsDetail() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, article: null, related: [] });

  useEffect(() => {
    let active = true;
    setState({ loading: true, article: null, related: [] });
    Promise.all([newsService.getBySlug(slug), newsService.related(slug, 3)])
      .then(([article, related]) => active && setState({ loading: false, article, related }))
      .catch(() => active && setState({ loading: false, article: null, related: [] }));
    window.scrollTo(0, 0);
    return () => {
      active = false;
    };
  }, [slug]);

  if (state.loading) return <div className="py-24"><Spinner /></div>;

  const { article, related } = state;
  if (!article) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Không tìm thấy bài viết</h1>
        <Link to="/news" className="mt-4 inline-block font-semibold text-brand-600">← Về trang Tin tức</Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="border-b border-slate-200">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl truncate px-4 py-3 text-sm text-slate-500">
          <Link to="/" className="hover:text-brand-600">Trang chủ</Link>
          <span className="mx-1.5">/</span>
          <Link to="/news" className="hover:text-brand-600">Tin tức</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{article.title}</span>
        </nav>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <Link to={`/news?category=${encodeURIComponent(article.category)}`} className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            {article.category}
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-ink md:text-4xl">{article.title}</h1>

          <div className="mt-5 flex items-center gap-3">
            <Avatar name={article.author} className="h-10 w-10 text-sm" />
            <div className="text-sm">
              <p className="text-slate-600">Được đăng bởi <strong className="text-ink">{article.author}</strong></p>
              <p className="text-slate-500">
                Cập nhật lần cuối vào {formatNewsDate(article.publishedAt)} • Đọc trong khoảng {article.readMinutes} phút
              </p>
            </div>
          </div>

          <p className="mt-6 text-lg font-semibold leading-relaxed text-ink">{article.summary}</p>

          <figure className="mt-6">
            <NewsImage image={article.image} eager className="h-64 w-full rounded-3xl md:h-[440px]" />
            <figcaption className="mt-2">
              <ImageCredit image={article.image} />
            </figcaption>
          </figure>

          <div className="mt-8 space-y-8">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-extrabold text-ink md:text-2xl">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="mt-3 leading-relaxed text-slate-700">{paragraph}</p>
                ))}
              </section>
            ))}
          </div>

          <aside className="mt-10 rounded-3xl border border-brand-100 bg-brand-50 p-5">
            <p className="text-sm text-slate-700">
              Bài viết được BS Realty tóm tắt từ <strong className="text-ink">{article.sourceName}</strong>. Số liệu và nhận định thuộc về nguồn gốc.
            </p>
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">
              Đọc bài gốc đầy đủ →
            </a>
          </aside>

          {article.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link key={tag} to={`/news?q=${encodeURIComponent(tag)}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-slate-200 pt-6">
            <ShareButtons title={article.title} />
          </div>

          <p className="mt-6 text-xs leading-relaxed text-slate-400">
            Thông tin chỉ mang tính tham khảo, không phải lời khuyên đầu tư, tài chính hay pháp lý. Vui lòng tự kiểm tra thông tin trước khi ra quyết định.
          </p>

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-extrabold text-ink">Bài viết khác</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                {related.map((item) => (
                  <Link key={item.slug} to={`/news/${item.slug}`} className="group block">
                    <div className="overflow-hidden rounded-2xl">
                      <NewsImage image={item.image} className="h-36 w-full transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{formatNewsDate(item.publishedAt)}</p>
                    <h3 className="mt-1 line-clamp-3 font-bold leading-snug text-ink group-hover:text-brand-600">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        <NewsSidebar excludeSlug={article.slug} />
      </div>
    </div>
  );
}
