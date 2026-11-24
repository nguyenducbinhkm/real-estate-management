import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroSearch from "../components/home/HeroSearch";
import PropertyCard from "../components/property/PropertyCard";
import { listingService } from "../services/listingService";
import { newsService } from "../services/newsService";
import { formatNewsDate } from "../data/newsArticles";
import NewsImage from "../components/news/NewsImage";
import ProjectCard from "../components/projects/ProjectCard";
import { projectService } from "../services/projectService";
import {
  featuredLocations,
  introBlocks,
  quickLinks,
  samplePartners,
  utilities,
} from "../data/homeContent";

const LOCATION_IMAGES = {
  "01": "/images/ha_noi.jpg",
  HN: "/images/ha_noi.jpg",
  "ha-noi": "/images/ha_noi.jpg",
  79: "/images/thanh-pho-ho-chi-minh.png",
  HCM: "/images/thanh-pho-ho-chi-minh.png",
  "ho-chi-minh": "/images/thanh-pho-ho-chi-minh.png",
  48: "/images/da_nang.jpg",
  DN: "/images/da_nang.jpg",
  "da-nang": "/images/da_nang.jpg",
  74: "/images/binh_duong.jpg",
  BD: "/images/binh_duong.jpg",
  "binh-duong": "/images/binh_duong.jpg",
  75: "/images/dong_nai.jpg",
  DNA: "/images/dong_nai.jpg",
  "dong-nai": "/images/dong_nai.jpg",
};

function resolveLocationImage(location) {
  if (location.image) return location.image;
  const code = String(location.code || "").trim();
  if (LOCATION_IMAGES[code]) return LOCATION_IMAGES[code];

  const normalizedName = String(location.name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();

  if (normalizedName.includes("ha noi")) return "/images/ha_noi.jpg";
  if (
    normalizedName.includes("ho chi minh") ||
    normalizedName.includes("tp.hcm")
  ) {
    return "/images/thanh-pho-ho-chi-minh.png";
  }
  if (normalizedName.includes("da nang")) return "/images/da_nang.jpg";
  if (normalizedName.includes("binh duong")) return "/images/binh_duong.jpg";
  if (normalizedName.includes("dong nai")) return "/images/dong_nai.jpg";

  return "/images/logo-mark.png";
}

function SectionHeader({ title, to, linkLabel = "Xem thêm", children }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <h2 className="text-xl font-extrabold text-ink md:text-2xl">{title}</h2>
      {children}
      {to && (
        <Link
          to={to}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

// Dùng chung nguồn dữ liệu với trang Tin tức (newsService); rê chuột vào tiêu đề để đổi bài nổi bật.
function NewsSection() {
  const [articles, setArticles] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let alive = true;
    newsService
      .search({ page: 1, pageSize: 6 })
      .then((data) => alive && setArticles(data.items));
    return () => {
      alive = false;
    };
  }, []);

  const featured = articles[active] || articles[0];
  if (!featured) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10">
      <SectionHeader title="Tin tức bất động sản" to="/news" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Link
          to={`/news/${featured.slug}`}
          className="group block overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <div className="overflow-hidden">
            <NewsImage
              image={featured.image}
              className="h-56 w-full transition-transform duration-500 group-hover:scale-105 md:h-72"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold text-ink group-hover:text-brand-600">
              {featured.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {formatNewsDate(featured.publishedAt)} • {featured.category}
            </p>
          </div>
        </Link>
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {articles.map((item, index) => (
            <li key={item.slug}>
              <Link
                to={`/news/${item.slug}`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={`block px-4 py-3.5 text-sm transition-colors ${index === active ? "bg-brand-50 font-semibold text-brand-700" : "text-ink hover:bg-slate-50"}`}
              >
                {item.title}
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  {formatNewsDate(item.publishedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ListingsForYou() {
  const [tab, setTab] = useState("ForSale");
  const [state, setState] = useState({ loading: true, items: [], error: "" });

  useEffect(() => {
    let active = true;
    setState((value) => ({ ...value, loading: true, error: "" }));
    listingService
      .search({ transactionType: tab, page: 1, pageSize: 8 })
      .then(
        (data) =>
          active &&
          setState({ loading: false, items: data.items || [], error: "" }),
      )
      .catch(
        () =>
          active &&
          setState({
            loading: false,
            items: [],
            error: "Không thể tải tin đăng lúc này.",
          }),
      );
    return () => {
      active = false;
    };
  }, [tab]);

  const tabButton = (value, label) => (
    <button
      type="button"
      onClick={() => setTab(value)}
      aria-pressed={tab === value}
      className={`text-sm font-semibold ${tab === value ? "text-brand-600" : "text-slate-500 hover:text-ink"}`}
    >
      {label}
    </button>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12">
      <SectionHeader title="Bất động sản dành cho bạn">
        <div className="order-last flex w-full items-center gap-3 text-slate-300 sm:order-none sm:w-auto">
          {tabButton("ForSale", "Tin nhà đất bán mới nhất")}
          <span>|</span>
          {tabButton("ForRent", "Tin nhà đất cho thuê mới nhất")}
        </div>
      </SectionHeader>

      {state.loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      ) : state.error || state.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
          {state.error || "Chưa có tin đăng."}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {state.items.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          to={`/listings?transactionType=${tab}`}
          className="inline-flex h-11 items-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-semibold text-ink hover:border-brand-500 hover:text-brand-700"
        >
          Mở rộng
        </Link>
      </div>
    </section>
  );
}

// Dự án thật từ database (API /api/projects), dự án nổi bật xếp trước.
function FeaturedProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let alive = true;
    projectService
      .search({ pageSize: 4 })
      .then((data) => alive && setProjects(data.items))
      .catch(() => alive && setProjects([]));
    return () => {
      alive = false;
    };
  }, []);

  if (projects.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12">
      <SectionHeader title="Dự án bất động sản nổi bật" to="/projects" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

function LocationsSection() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let active = true;
    Promise.allSettled(
      featuredLocations.map((location) =>
        listingService
          .search({ provinceCode: location.code, page: 1, pageSize: 1 })
          .then((data) => [location.code, data.total]),
      ),
    ).then((results) => {
      if (!active) return;
      setCounts(
        Object.fromEntries(
          results.filter((r) => r.status === "fulfilled").map((r) => r.value),
        ),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12">
      <SectionHeader title="Bất động sản theo địa điểm" />
      <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
        {featuredLocations.map((location) => {
          const imageSrc = resolveLocationImage(location);
          return (
            <Link
              key={location.code}
              to={`/listings?provinceCode=${location.code}`}
              className={`group relative overflow-hidden rounded-xl bg-slate-900 shadow-sm ${location.large ? "h-52 md:col-span-2 md:row-span-2 md:h-auto" : "h-44 md:h-48"}`}
            >
              <img
                src={imageSrc}
                alt={location.name}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/images/logo-mark.png";
                }}
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 pt-12">
                <p
                  className={`font-extrabold text-white drop-shadow-sm ${location.large ? "text-2xl" : "text-lg"}`}
                >
                  {location.name}
                </p>
                {counts[location.code] !== undefined && (
                  <p className="mt-1 text-sm font-medium text-brand-300">
                    {counts[location.code].toLocaleString("vi-VN")} tin đăng
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function UtilitiesAndPartners() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 pt-12 lg:grid-cols-2">
      <div>
        <SectionHeader title="Hỗ trợ tiện ích" />
        <div className="grid grid-cols-2 gap-3">
          {utilities.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-300"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-lg font-bold text-brand-600">
                {item.title.charAt(0)}
              </span>
              <p className="mt-3 font-bold text-ink">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.text}</p>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <SectionHeader title="Doanh nghiệp tiêu biểu" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {samplePartners.map((name) => (
            <div
              key={name}
              className="grid h-24 place-items-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-400"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntroAndLinks() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 pt-14">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {introBlocks.map((block) => (
          <Link
            key={block.title}
            to={block.to}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-300"
          >
            <h3 className="font-extrabold text-ink group-hover:text-brand-600">
              {block.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {block.text}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 border-t border-slate-200 pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((column) => (
          <div key={column.title}>
            <p className="font-bold text-ink">{column.title}</p>
            <ul className="mt-3 space-y-2">
              {column.links.map(([label, to]) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-slate-600 hover:text-brand-600"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <HeroSearch />
      <NewsSection />
      <ListingsForYou />
      <FeaturedProjects />
      <LocationsSection />
      <UtilitiesAndPartners />
      <IntroAndLinks />
    </div>
  );
}
