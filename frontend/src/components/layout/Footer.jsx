import { useState } from "react";
import { Link } from "react-router-dom";
import { site } from "../../config/site";

const columns = [
  {
    title: "HƯỚNG DẪN",
    links: [
      ["Về chúng tôi", "/about"],
      ["Báo giá & hỗ trợ", "/support/pricing"],
      ["Câu hỏi thường gặp", "/support/faq"],
      ["Góp ý báo lỗi", "/support/feedback"],
      ["Sitemap", "/sitemap"],
      ["Nguồn ảnh minh họa", "/image-credits"],
    ],
  },
  {
    title: "QUY ĐỊNH",
    links: [
      ["Quy định đăng tin", "/policy/posting"],
      ["Quy chế hoạt động", "/policy/operation"],
      ["Điều khoản thỏa thuận", "/policy/terms"],
      ["Chính sách bảo mật", "/policy/privacy"],
      ["Giải quyết khiếu nại", "/policy/complaints"],
    ],
  },
  {
    title: "KHÁM PHÁ",
    links: [
      ["Nhà đất bán", "/listings?transactionType=ForSale"],
      ["Nhà đất cho thuê", "/listings?transactionType=ForRent"],
      ["Dự án", "/projects"],
      ["Tin tức", "/news"],
      ["Wiki BĐS", "/wiki"],
    ],
  },
];

const branches = [
  {
    name: "Chi nhánh Hà Nội",
    address: "Đang cập nhật địa chỉ chi nhánh Hà Nội",
    phone: "Điện thoại: đang cập nhật",
  },
  {
    name: "Chi nhánh TP. Hồ Chí Minh",
    address: "Đang cập nhật địa chỉ chi nhánh TP. HCM",
    phone: "Điện thoại: đang cập nhật",
  },
  {
    name: "Chi nhánh Đà Nẵng",
    address: "Đang cập nhật địa chỉ chi nhánh Đà Nẵng",
    phone: "Điện thoại: đang cập nhật",
  },
];

function PhoneIcon() {
  return (
    <svg
      className="h-6 w-6 shrink-0 text-gold-300"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg
      className="h-6 w-6 shrink-0 text-gold-300"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
      />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg
      className="h-6 w-6 shrink-0 text-gold-300"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3a9 9 0 0 0-9 9v5.25A2.25 2.25 0 0 0 5.25 19.5H7.5v-6.75H5.25A2.237 2.237 0 0 0 4.5 12.9V12a7.5 7.5 0 0 1 15 0v.9c0 .05-.005.1-.015.15H16.5v6.75h2.25A2.25 2.25 0 0 0 21 17.25V12a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-gold-300"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}

export default function Footer() {
  const [showBranches, setShowBranches] = useState(false);
  const [region, setRegion] = useState("Việt Nam");

  return (
    <footer className="mt-auto bg-[#282924] text-sm text-slate-300">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-8">
        {/* Hàng đầu: Logo + 3 cụm liên hệ ngang */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-3"
            aria-label={`${site.name} - Trang chủ`}
          >
            <img src="/images/logo-mark.png" alt="" className="h-14 w-auto" />
            <span className="leading-tight">
              <span className="block text-xl font-extrabold tracking-wide text-gold-300">
                {site.name.toUpperCase()}
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-300/80">
                {site.tagline}
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-7 sm:gap-10">
            <div className="flex items-center gap-3">
              <PhoneIcon />
              <div>
                <p className="text-xs text-slate-400">Hotline</p>
                <p className="font-semibold text-gold-300">{site.hotline}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <SupportIcon />
              <div>
                <p className="text-xs text-slate-400">Hỗ trợ khách hàng</p>
                <p className="font-semibold text-gold-300">
                  {site.supportEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <HeadsetIcon />
              <div>
                <p className="text-xs text-slate-400">Chăm sóc khách hàng</p>
                <p className="font-semibold text-gold-300">
                  {site.careEmail || site.supportEmail}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Khối giữa: Công ty + App badges bên trái | 3 cột liên kết & khu vực bên phải */}
        <div className="grid gap-10 py-9 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr]">
          <div>
            <p className="font-semibold uppercase tracking-wide text-white">
              {site.companyName}
            </p>
            <ul className="mt-3.5 space-y-2.5 text-slate-400">
              <li className="flex items-start gap-2.5">
                <PinIcon />
                <span>{site.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-gold-300">
                  ☎
                </span>
                <span>{site.phone}</span>
              </li>
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="#google-play"
                className="inline-flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-left transition hover:border-gold-300/60 hover:bg-white/10"
              >
                <span className="text-base leading-none text-gold-300">▶</span>
                <span className="leading-tight">
                  <span className="block text-[10px] text-slate-400">
                    Tải ứng dụng trên
                  </span>
                  <span className="block text-xs font-semibold text-white">
                    Google Play
                  </span>
                </span>
              </a>

              <a
                href="#app-store"
                className="inline-flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-left transition hover:border-gold-300/60 hover:bg-white/10"
              >
                <span className="text-base leading-none text-white"></span>
                <span className="leading-tight">
                  <span className="block text-[10px] text-slate-400">
                    Tải trên
                  </span>
                  <span className="block text-xs font-semibold text-white">
                    App Store
                  </span>
                </span>
              </a>
            </div>
          </div>

          {columns.slice(0, 2).map((column) => (
            <div key={column.title}>
              <p className="font-semibold uppercase tracking-wide text-white">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map(([label, to]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-slate-400 transition-colors hover:text-gold-300"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="font-semibold uppercase tracking-wide text-white">
              {columns[2].title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {columns[2].links.map(([label, to]) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-slate-400 transition-colors hover:text-gold-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <label
                htmlFor="footer-region"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                Quốc gia & Ngôn ngữ
              </label>
              <select
                id="footer-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="mt-2 h-9 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-xs font-medium text-white outline-none focus:border-gold-300"
              >
                <option value="Việt Nam" className="bg-[#282924] text-white">
                  🌐 Việt Nam
                </option>
                <option value="English" className="bg-[#282924] text-white">
                  🌐 English
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Phần mở rộng chi nhánh */}
        <div className="border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() => setShowBranches((prev) => !prev)}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 transition-colors hover:text-gold-300"
          >
            <span
              className={`transition-transform ${showBranches ? "rotate-180" : ""}`}
            >
              ⌄
            </span>
            <span>Xem chi nhánh của {site.name}</span>
          </button>

          {showBranches && (
            <div className="mt-4 grid gap-6 rounded-xl border border-white/10 bg-white/5 p-5 sm:grid-cols-3">
              {branches.map((branch) => (
                <div key={branch.name} className="space-y-1 text-xs">
                  <p className="font-semibold text-gold-300">{branch.name}</p>
                  <p className="text-slate-300">{branch.address}</p>
                  <p className="text-slate-400">{branch.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chân bản quyền + Mạng xã hội */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p>
              Copyright © {site.foundedYear} - {new Date().getFullYear()}{" "}
              {site.name}. {site.businessLicense}
            </p>
            <p>
              Ghi rõ nguồn “{site.name}” khi phát hành lại thông tin từ website
              này.
            </p>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <a
              href="#facebook"
              aria-label="Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-bold transition hover:border-gold-300 hover:text-gold-300"
            >
              f
            </a>
            <a
              href="#youtube"
              aria-label="YouTube"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-bold transition hover:border-gold-300 hover:text-gold-300"
            >
              ▶
            </a>
            <a
              href="#zalo"
              aria-label="Zalo"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[10px] font-bold transition hover:border-gold-300 hover:text-gold-300"
            >
              Zalo
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
