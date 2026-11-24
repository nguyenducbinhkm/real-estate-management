import { propertyImageSet } from '../data/propertyImages';
import { projectImageList } from '../data/projectImages';
import { newsArticles } from '../data/newsArticles';
import { heroSlides } from '../data/homeContent';
import NewsImage, { ImageCredit } from '../components/news/NewsImage';

function CreditGrid({ title, note, images }) {
  const unique = [...new Map(images.filter(Boolean).map((image) => [image.url, image])).values()];
  return (
    <section className="mt-10">
      <h2 className="text-xl font-extrabold text-ink">{title}</h2>
      {note && <p className="mt-1 text-sm text-slate-600">{note}</p>}
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {unique.map((image) => (
          <figure key={image.url} className="overflow-hidden rounded-xl border border-slate-200">
            <NewsImage image={image} className="h-40 w-full" />
            <figcaption className="p-3"><ImageCredit image={image} /></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/** Ghi nguồn ảnh minh họa – yêu cầu của giấy phép Creative Commons. */
export default function ImageCredits() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink">Nguồn ảnh minh họa</h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        Các ảnh dưới đây lấy từ Wikimedia Commons theo giấy phép Creative Commons hoặc phạm vi công cộng.
        Ảnh chỉ dùng để minh họa loại hình bất động sản hoặc khu vực, không phải ảnh thực tế của tin đăng hay dự án.
        Riêng ảnh slide đầu tiên của banner trang chủ do BS Realty cung cấp.
      </p>
      <CreditGrid
        title="Ảnh banner trang chủ"
        note="Slide 1 dùng ảnh do BS Realty cung cấp; slide 2 và 3 dùng ảnh dưới đây."
        images={heroSlides.filter((s) => s.imageCredit).map((s) => ({ url: s.image, alt: s.imageAlt, ...s.imageCredit }))}
      />
      <CreditGrid title="Ảnh minh họa tin đăng" note="Chọn theo loại bất động sản: căn hộ, nhà riêng, biệt thự, shophouse, đất, văn phòng, kho xưởng." images={Object.values(propertyImageSet)} />
      <CreditGrid title="Ảnh minh họa dự án" note="Chọn theo tỉnh/thành của dự án." images={projectImageList} />
      <CreditGrid title="Ảnh bài viết tin tức" images={newsArticles.map((article) => article.image)} />
    </div>
  );
}
