import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { listingService } from "../services/listingService";
import { useSearchStore } from "../store/searchStore";
import PropertyCard from "../components/property/PropertyCard";
import Spinner from "../components/ui/Spinner";
import SearchBar from "../components/search/SearchBar";
import FilterPanel from "../components/search/FilterPanel";
import FilterModal from "../components/search/FilterModal";
import Button from "../components/ui/Button";

function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="h-48 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
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
  } = useSearchStore();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Link từ menu/trang chủ (?transactionType=&propertyType=&provinceCode=) ghi đè các bộ lọc này.
  useEffect(() => {
    const keys = ["transactionType", "propertyType", "provinceCode"];
    if (!keys.some((key) => searchParams.has(key))) return;
    setCriteria({
      transactionType: searchParams.get("transactionType") || "",
      propertyType: searchParams.get("propertyType") || "",
      provinceCode: searchParams.get("provinceCode") || "",
      districtCode: "",
      page: 1,
    });
    // location.key đổi mỗi lần bấm link, kể cả khi bấm lại cùng một mục menu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

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

  const resetFilters = () =>
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
        value={criteria.keyword}
        onSearch={(keyword) => setCriteria({ keyword, page: 1 })}
      />
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Tin bất động sản</h1>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="lg:hidden"
          onClick={() => setFilterOpen(true)}
        >
          Bộ lọc
        </Button>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-xl border border-slate-200 bg-white p-5 lg:block">
          <FilterPanel
            criteria={criteria}
            onChange={setCriteria}
            onReset={resetFilters}
          />
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {loading ? "Đang tải..." : `${total} kết quả`}
            </span>
            <label className="text-sm text-slate-600">
              Sắp xếp
              <select
                className="ml-2 h-9 rounded-lg border border-slate-300 bg-white px-2"
                value="featured"
                onChange={() => setCriteria({ page: 1 })}
              >
                <option value="featured">Nổi bật</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 py-12 text-center">
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
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
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
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
                      className={`h-9 min-w-9 rounded-lg px-2 text-sm font-bold ${page === criteria.page ? "bg-brand-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
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

      <FilterModal
        open={filterOpen}
        criteria={criteria}
        onChange={setCriteria}
        onReset={resetFilters}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
