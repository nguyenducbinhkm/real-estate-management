import { newsArticles } from '../data/newsArticles';

// Hiện đọc từ dữ liệu mẫu (src/data/newsArticles.js).
// Khi backend có API tin tức, chỉ cần thay phần thân các hàm bằng lời gọi api.get(...);
// các trang dùng newsService không phải sửa.
//   search      -> GET /api/news?category=&q=&page=&pageSize=
//   getBySlug   -> GET /api/news/{slug}
//   mostViewed  -> GET /api/news/most-viewed?limit=
//   related     -> GET /api/news/{slug}/related?limit=

const byNewest = (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt);

function normalize(text) {
  return (text || '').toLocaleLowerCase('vi').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
}

export const newsService = {
  async search({ category = '', q = '', page = 1, pageSize = 10 } = {}) {
    const keyword = normalize(q.trim());
    const filtered = newsArticles
      .filter((article) => !category || article.category === category)
      .filter((article) => !keyword || normalize(`${article.title} ${article.summary}`).includes(keyword))
      .sort(byNewest);
    const start = (page - 1) * pageSize;
    return { items: filtered.slice(start, start + pageSize), page, pageSize, total: filtered.length };
  },

  async getBySlug(slug) {
    const article = newsArticles.find((item) => item.slug === slug);
    if (!article) {
      const error = new Error('Không tìm thấy bài viết.');
      error.status = 404;
      throw error;
    }
    return article;
  },

  async mostViewed(limit = 5) {
    return [...newsArticles].sort((a, b) => b.views - a.views).slice(0, limit);
  },

  async related(slug, limit = 3) {
    const current = newsArticles.find((item) => item.slug === slug);
    return newsArticles
      .filter((item) => item.slug !== slug)
      .sort((a, b) => (b.category === current?.category) - (a.category === current?.category) || byNewest(a, b))
      .slice(0, limit);
  },
};
