import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { listingService } from "../services/listingService";
import { areaLabel, parseSearchQuery, priceLabel, TYPE_LABELS } from "../utils/searchParser";
import { districtList, provinceList } from "../data/locations";
import { useSearchStore } from "../store/searchStore";
import PropertyCard from "../components/property/PropertyCard";
import Spinner from "../components/ui/Spinner";
import SearchBar from "../components/search/SearchBar";
import FilterBar from "../components/search/FilterBar";
import Button from "../components/ui/Button";

function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-card">
      <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const [retryTick, setRetryTick] = useState(0);
  const {
    criteria,
    setCriteria,
    results,
    total,
    loading,
    error,
    setResults,
    setLoading,
    setError,
    searchText,
    setSearchText,
  } = useSearchStore();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Link từ menu/trang chủ (?transactionType=&propertyType=&provinceCode=) ghi đè các bộ lọc này.
  useEffect(() => {
    const keys = ["transactionType", "propertyType", "provinceCode"];
    if (!keys.some((key) => searchParams.has(key))) return;
    setSearchText("");
    setCriteria({
      keyword: "",
      transactionType: searchParams.get("transactionType") || "",
      propertyType: searchParams.get("propertyType") || "",
      provinceCode: searchParams.get("provinceCode") || "",
      districtCode: "",
      page: 1,
    });
    // location.key đổi mỗi lần bấm link, kể cả khi bấm lại cùng một mục menu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Bộ lọc/trang lưu trong store (không đổi URL) nên ScrollToTop không bắt được:
  // mỗi lần đổi bộ lọc hoặc chuyển trang kết quả thì đưa trang về đầu (bỏ qua lần hiển thị đầu tiên).
  // Dùng nhảy tức thì: cuộn "smooth" bị trình duyệt hủy giữa chừng khi danh sách co lại lúc đang tải.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [criteria]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listingService
      .search(criteria)
      .then((data) => active && setResults(data.items || [], data.total || 0))
      .catch((err) => {
        if (!active) return;
        setResults([], 0);
        setError(
          err.response?.data?.message ||
            "Không thể tải danh sách bất động sản.",
        );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [criteria, retryTick, setLoading, setResults, setError]);

  // Câu tìm tự do → bộ lọc (loại BĐS, khu vực, giá, diện tích) + phần còn lại làm từ khóa.
  const runSearch = (text) => {
    const parsed = parseSearchQuery(text, { transactionType: criteria.transactionType });
    setSearchText(text.trim());
    setCriteria({
      keyword: parsed.keyword,
      transactionType: parsed.transactionType || criteria.transactionType,
      propertyType: parsed.propertyType,
      provinceCode: parsed.provinceCode,
      districtCode: parsed.districtCode,
      minPrice: parsed.minPrice,
      maxPrice: parsed.maxPrice,
      minArea: parsed.minArea,
      maxArea: parsed.maxArea,
      page: 1,
    });
  };

  // Nhãn các bộ lọc đang áp dụng (lấy từ criteria nên luôn khớp với bộ lọc bên trái); bấm × để bỏ từng bộ lọc.
  const provinceName = (code) => (provinceList.find(([value]) => value === code)?.[1] || code).replace(/^(Thành phố|Tỉnh)\s+/, "");
  const districtName = (code) => districtList.find(([value]) => value === code)?.[1] || code;
  const activeFilters = [
    criteria.transactionType && [criteria.transactionType === "ForRent" ? "Cho thuê" : "Mua bán", { transactionType: "" }],
    criteria.propertyType && [TYPE_LABELS[criteria.propertyType] || criteria.propertyType, { propertyType: "" }],
    criteria.provinceCode && [provinceName(criteria.provinceCode), { provinceCode: "", districtCode: "" }],
    criteria.districtCode && [districtName(criteria.districtCode), { districtCode: "" }],
    (criteria.minPrice || criteria.maxPrice) && [priceLabel(criteria.minPrice, criteria.maxPrice), { minPrice: "", maxPrice: "" }],
    (criteria.minArea || criteria.maxArea) && [areaLabel(criteria.minArea, criteria.maxArea), { minArea: "", maxArea: "" }],
    criteria.keyword && [`“${criteria.keyword}”`, { keyword: "" }],
  ].filter(Boolean);

  const resetFilters = () => {
    setSearchText("");
    setCriteria({
      keyword: "",
      propertyType: "",
      transactionType: "",
      provinceCode: "",
      districtCode: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      page: 1,
    });
  };

  const pageCount = Math.max(1, Math.ceil(total / criteria.pageSize));
  const visiblePages = Array.from(
    { length: Math.min(pageCount, 5) },
    (_, index) => {
      const start = Math.max(1, Math.min(criteria.page - 2, pageCount - 4));
      return start + index;
    },
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <SearchBar
        value={searchText}
        transactionType={criteria.transactionType}
        onSearch={runSearch}
      />
      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Đang lọc:</span>
          {activeFilters.map(([label, clear]) => (
            <span key={label} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1 font-medium text-brand-700 ring-1 ring-brand-100">
              {label}
              <button
                type="button"
                onClick={() => setCriteria({ ...clear, page: 1 })}
                aria-label={`Bỏ bộ lọc ${label}`}
                className="grid h-5 w-5 place-items-center rounded-full text-brand-500 transition-colors hover:bg-brand-600 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
          <button type="button" onClick={resetFilters} className="text-sm font-semibold text-slate-500 underline-offset-4 hover:text-brand-700 hover:underline">
            Xóa tất cả
          </button>
        </div>
      )}
      {/* Thanh lọc nằm ngang, dính dưới header khi cuộn (từ máy tính bảng trở lên; điện thoại thanh cao nên để cuộn theo trang). */}
      <div className="z-30 -mx-4 mt-4 bg-[#faf8f4]/95 px-4 py-2 md:sticky md:top-16 md:backdrop-blur xl:top-[72px]">
        <FilterBar criteria={criteria} onChange={setCriteria} onReset={resetFilters} />
      </div>

      <h1 className="mt-6 text-2xl font-extrabold text-ink md:text-3xl">Tin bất động sản</h1>

      <div className="mt-4">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {loading ? "Đang tải..." : <>Tìm thấy <strong className="text-ink">{total.toLocaleString("vi-VN")}</strong> tin đăng</>}
            </span>
            <label className="text-sm text-slate-600">
              Sắp xếp
              <select
                className="ml-2 h-9 rounded-full border border-slate-200 bg-white px-3"
                value="featured"
                onChange={() => setCriteria({ page: 1 })}
              >
                <option value="featured">Nổi bật</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-100 bg-red-50 py-12 text-center">
              <p className="font-bold text-red-700">{error}</p>
              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={() => setRetryTick((value) => value + 1)}
              >
                Thử lại
              </Button>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-brand-200 bg-white py-16 text-center">
              <p className="font-bold text-slate-800">
                Không tìm thấy tin phù hợp
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Thử bỏ một số bộ lọc hoặc thay đổi từ khóa.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-5"
                onClick={resetFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <>
              {/* Lưới tin: 4 tin một hàng trên màn hình rộng. */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((listing) => (
                  <PropertyCard key={listing.id} listing={listing} />
                ))}
              </div>
              {pageCount > 1 && (
                <nav
                  className="mt-8 flex flex-wrap items-center justify-center gap-2"
                  aria-label="Phân trang"
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={criteria.page === 1}
                    onClick={() => setCriteria({ page: criteria.page - 1 })}
                  >
                    Trước
                  </Button>
                  {visiblePages.map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCriteria({ page })}
                      className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition-colors ${page === criteria.page ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30" : "border border-slate-200 bg-white text-slate-700 hover:border-brand-300"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={criteria.page === pageCount}
                    onClick={() => setCriteria({ page: criteria.page + 1 })}
                  >
                    Sau
                  </Button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
