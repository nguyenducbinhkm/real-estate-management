import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSearchStore } from "../../store/searchStore";
import { heroSlides, provinces } from "../../data/homeContent";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 text-slate-500"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function HeroSearch() {
  const navigate = useNavigate();
  const setCriteria = useSearchStore((state) => state.setCriteria);
  const [keyword, setKeyword] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [slide, setSlide] = useState(0);

  // Tự động chuyển slide sau 6 giây
  useEffect(() => {
    const timer = setTimeout(
      () => setSlide((value) => (value + 1) % heroSlides.length),
      6000,
    );
    return () => clearTimeout(timer);
  }, [slide]);

  const submit = (event) => {
    event.preventDefault();
    setCriteria({
      keyword: keyword.trim(),
      transactionType: "ForSale",
      provinceCode,
      propertyType: "",
      districtCode: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      page: 1,
    });
    navigate("/listings");
  };

  const current = heroSlides[slide] || heroSlides[0];
  const nextSlide = heroSlides[(slide + 1) % heroSlides.length] || current;

  return (
    <section className="relative overflow-hidden bg-slate-950 py-12 md:py-16 lg:py-20">
      {/* 1. NỀN BANNER SẮC NÉT (LỚP PHỦ GRADIENT NHẸ THOÁNG) */}
      {heroSlides.map((item, index) =>
        item.image ? (
          <img
            key={item.image}
            src={item.image}
            alt={index === slide ? item.imageAlt || "" : ""}
            aria-hidden={index !== slide}
            fetchpriority={index === 0 ? "high" : "auto"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === slide ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null,
      )}

      {/* Lớp phủ chuyển màu nhẹ nhàng: chữ bên trái dễ đọc, bên phải sáng rõ tự nhiên */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
        aria-hidden="true"
      />

      {/* Credit tác giả ảnh */}
      {current.imageCredit && (
        <p className="absolute bottom-2 left-4 z-20 text-[10px] text-white/60">
          Ảnh:{" "}
          <a
            href={current.imageCredit.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            {current.imageCredit.author}
          </a>
        </p>
      )}

      {/* 2. NỘI DUNG CHÍNH */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          {/* CỘT TRÁI: TEXT SLIDE & THANH TÌM KIẾM */}
          <div className="space-y-6">
            {/* Chữ chuyển theo Slide với hiệu ứng fade-in */}
            <div key={slide} className="animate-fade-in space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C5A880]">
                  {current.eyebrow || "ĐĂNG TIN · MIỄN PHÍ"}
                </span>
                <span className="h-[1px] w-14 bg-[#C5A880]/70" />
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[46px] lg:leading-[1.18]">
                {current.title}
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-200 md:text-base">
                {current.text}
              </p>
            </div>

            {/* THANH TÌM KIẾM BO TRÒN TRẮNG (BỎ TAB MUA BÁN/DỰ ÁN) */}
            <form
              onSubmit={submit}
              className="mt-6 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row sm:items-center sm:rounded-full"
            >
              <div className="relative flex items-center border-b border-slate-200 px-3 sm:w-44 sm:border-b-0 sm:border-r">
                <select
                  id="hero-province"
                  value={provinceCode}
                  onChange={(event) => setProvinceCode(event.target.value)}
                  className="h-11 w-full appearance-none bg-transparent pr-6 text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="">Toàn quốc</option>
                  {provinces.map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3">
                  <ChevronDownIcon />
                </div>
              </div>

              <div className="flex flex-1 items-center gap-2.5 px-3">
                <SearchIcon />
                <input
                  id="hero-keyword"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Nhập địa điểm, đường, tên dự án..."
                  className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="h-11 rounded-xl bg-[#A37835] px-7 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#8F672C] sm:rounded-full shrink-0"
              >
                Tìm kiếm
              </button>
            </form>
          </div>

          {/* CỘT PHẢI: 2 KHUNG VIỀN CHỈ MỀM MẠI CHUẨN MẪU ẢNH 1 */}
          <div className="relative flex flex-col items-center lg:items-end">
            {/* Các đường chỉ vàng nghệ thuật phía sau */}
            <svg
              className="pointer-events-none absolute -right-6 -top-10 h-[380px] w-[380px] opacity-35 sm:-right-10 sm:-top-14 sm:h-[440px] sm:w-[440px]"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="280"
                cy="180"
                r="160"
                stroke="#C5A880"
                strokeWidth="1"
              />
              <path
                d="M 120 40 C 260 20, 360 140, 350 320"
                stroke="#C5A880"
                strokeWidth="1"
              />
              <path
                d="M 60 220 C 180 180, 280 260, 320 380"
                stroke="#C5A880"
                strokeWidth="0.8"
              />
            </svg>

            {/* KHỐI 2 ẢNH SO LE NGHỆ THUẬT */}
            <div className="relative flex items-start justify-center gap-3 sm:gap-4 p-3">
              {/* KHUNG 1: Cắt từ slide hiện tại - KHÔNG CÓ VIỀN TRẮNG CỨNG */}
              <div className="relative z-10 w-40 sm:w-52 md:w-56">
                {/* Đường chỉ mảnh uốn cong bọc mềm mại quanh góc trên-trái (cách mép ảnh 7px) */}
                <div
                  className="pointer-events-none absolute -inset-2 rounded-tl-[52px] rounded-tr-lg rounded-bl-lg rounded-br-lg border-t-2 border-l-2 border-white/70"
                  aria-hidden="true"
                />

                {/* Thân ảnh bo cong sắc nét, đổ bóng tự nhiên không viền */}
                <div className="overflow-hidden rounded-br-sm rounded-tr-sm rounded-bl-sm rounded-tl-[44px] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                  <img
                    key={`frame1-${slide}`}
                    src={current.image || "/images/ha_noi.jpg"}
                    alt={current.title}
                    className="h-64 w-full scale-125 object-cover object-center brightness-115 contrast-110 saturate-110 transition-all duration-700 sm:h-80 md:h-[350px]"
                  />
                </div>
              </div>

              {/* KHUNG 2: Cắt từ slide kế tiếp - ĐẶT SO LE XUỐNG DƯỚI */}
              <div className="relative z-20 -ml-6 mt-12 w-40 sm:-ml-8 sm:mt-16 sm:w-52 md:w-56">
                {/* Đường chỉ mảnh uốn cong bọc mềm mại quanh góc dưới-phải (cách mép ảnh 7px) */}
                <div
                  className="pointer-events-none absolute -inset-2 rounded-br-[52px] rounded-tl-lg rounded-tr-lg rounded-bl-lg border-b-2 border-r-2 border-white/70"
                  aria-hidden="true"
                />

                {/* Thân ảnh bo cong sắc nét, đổ bóng tự nhiên không viền */}
                <div className="overflow-hidden rounded-tl-sm rounded-tr-sm rounded-bl-sm rounded-br-[44px] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                  <img
                    key={`frame2-${slide}`}
                    src={
                      nextSlide.image || current.image || "/images/ha_noi.jpg"
                    }
                    alt={nextSlide.title}
                    className="h-64 w-full scale-125 object-cover object-bottom brightness-115 contrast-110 saturate-110 transition-all duration-700 sm:h-80 md:h-[350px]"
                  />
                </div>
              </div>
            </div>

            {/* NÚT "XEM DỰ ÁN →" PHÍA DƯỚI CỤM ẢNH */}
            <div className="mt-8 flex justify-center lg:justify-end w-full pr-4 sm:pr-8">
              <Link
                to={current.cta ? current.cta[1] : "/projects"}
                className="group inline-flex items-center gap-2 rounded-full bg-[#F3D7A4] px-7 py-2.5 text-sm font-bold text-slate-900 shadow-xl transition-all duration-300 hover:bg-[#E8C585] hover:shadow-2xl"
              >
                <span>{current.cta ? current.cta[0] : "Xem dự án"}</span>
                <span className="text-base font-bold transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. CÁC CHẤM CHUYỂN SLIDE Ở ĐÁY */}
        <div className="mt-8 flex justify-center gap-2">
          {heroSlides.map((item, index) => (
            <button
              key={item.title || index}
              type="button"
              aria-label={`Chuyển tới slide ${index + 1}`}
              onClick={() => setSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === slide
                  ? "w-8 bg-[#C5A880]"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
