import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fold, parseSearchQuery, suggestLocations, suggestTypes } from '../../utils/searchParser';
import { listingService } from '../../services/listingService';
import { projectService } from '../../services/projectService';

const POPULAR = {
  listing: ['căn hộ quận 7 dưới 5 tỷ', 'nhà riêng Hà Nội', 'cho thuê văn phòng quận 1', 'đất nền Bình Dương', 'biệt thự Thủ Đức'],
  project: ['Vinhomes', 'Hà Nội', 'Masterise Homes', 'Thủ Đức'],
};

// Danh sách dự án (ít, chỉ tải một lần) để gợi ý theo tên/chủ đầu tư.
let projectsPromise = null;
function loadProjects() {
  if (!projectsPromise) {
    projectsPromise = projectService.search({ pageSize: 50 }).then((data) => data.items).catch(() => {
      projectsPromise = null;
      return [];
    });
  }
  return projectsPromise;
}

/** Thay `n` từ cuối của câu bằng `replacement`. */
function replaceTail(text, tail, replacement) {
  const words = text.trim().split(/\s+/);
  const n = tail.split(' ').length;
  return [...words.slice(0, Math.max(0, words.length - n)), replacement].join(' ');
}

function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * Ô tìm kiếm có gợi ý: hiểu câu tự do (loại BĐS, khu vực, giá, diện tích), gợi ý địa danh, loại BĐS, dự án và tin đăng.
 * mode = 'listing' (tìm tin đăng) | 'project' (tìm dự án).
 */
export default function SmartSearchBox({
  id,
  value,
  onChange,
  onSubmit,
  mode = 'listing',
  transactionType = '',
  placeholder,
  inputClassName = '',
}) {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [projects, setProjects] = useState([]);
  const [listingHits, setListingHits] = useState({ items: [], total: 0, query: '' });
  const debounced = useDebounced(value, 300);

  useEffect(() => {
    if (open) loadProjects().then(setProjects);
  }, [open]);

  useEffect(() => {
    const close = (event) => wrapperRef.current && !wrapperRef.current.contains(event.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const parsed = useMemo(() => parseSearchQuery(value, { transactionType }), [value, transactionType]);

  // Tin đăng khớp câu tìm (chỉ ở chế độ listing)
  useEffect(() => {
    const text = debounced.trim();
    if (mode !== 'listing' || !open || text.length < 2) {
      setListingHits({ items: [], total: 0, query: '' });
      return undefined;
    }
    let alive = true;
    const { labels, ...filters } = parseSearchQuery(text, { transactionType });
    listingService
      .search({ ...filters, page: 1, pageSize: 4 })
      .then((data) => alive && setListingHits({ items: data.items || [], total: data.total || 0, query: text }))
      .catch(() => alive && setListingHits({ items: [], total: 0, query: text }));
    return () => {
      alive = false;
    };
  }, [debounced, mode, open, transactionType]);

  const groups = useMemo(() => {
    const text = value.trim();
    if (!text) {
      return [{ title: 'Tìm kiếm phổ biến', items: POPULAR[mode].map((q) => ({ kind: 'popular', label: q, value: q })) }];
    }
    const result = [];
    if (mode === 'listing') {
      result.push({
        title: 'Tìm kiếm',
        items: [{ kind: 'search', label: `Tìm “${text}”`, detail: parsed.labels.length ? parsed.labels.join(' · ') : '' }],
      });
      const types = suggestTypes(text, parsed.transactionType || transactionType).map((item) => ({
        kind: 'type', label: item.label, tail: fold(text).split(' ').slice(-1)[0],
      }));
      if (types.length) result.push({ title: 'Loại bất động sản', items: types });
    }
    const locations = suggestLocations(text, 5).map((item) => ({ kind: 'location', label: item.label, tail: item.tail, name: item.name, code: item.code, locationKind: item.kind }));
    if (locations.length) result.push({ title: 'Khu vực', items: locations });

    const key = fold(text);
    const projectItems = projects
      .filter((p) => fold(`${p.name} ${p.developer}`).includes(key) || key.split(' ').some((w) => w.length >= 3 && fold(p.name).includes(w)))
      .slice(0, 4)
      .map((p) => ({ kind: 'project', label: p.name, detail: `${p.developer} · ${p.provinceName}`, id: p.id }));
    if (projectItems.length) result.push({ title: 'Dự án', items: projectItems });

    if (mode === 'listing' && listingHits.query === debounced.trim() && listingHits.items.length) {
      result.push({
        title: `Tin đăng phù hợp (${listingHits.total})`,
        items: [
          ...listingHits.items.map((l) => ({ kind: 'listing', label: l.title, detail: [l.districtName, l.provinceName].filter(Boolean).join(', '), id: l.id })),
          ...(listingHits.total > listingHits.items.length ? [{ kind: 'search', label: `Xem tất cả ${listingHits.total} tin`, detail: '' }] : []),
        ],
      });
    }
    return result;
  }, [value, mode, parsed, transactionType, projects, listingHits, debounced]);

  const flat = groups.flatMap((group) => group.items);

  const choose = (item) => {
    setOpen(false);
    setActive(-1);
    if (!item) return onSubmit(value);
    switch (item.kind) {
      case 'project':
        return navigate(`/projects/${item.id}`);
      case 'listing':
        return navigate(`/listings/${item.id}`);
      case 'popular':
        onChange(item.value);
        return onSubmit(item.value);
      case 'location': {
        const next = replaceTail(value, item.tail, item.name);
        onChange(next);
        return onSubmit(next);
      }
      case 'type': {
        const next = replaceTail(value, item.tail, item.label.split(',')[0].toLocaleLowerCase('vi'));
        onChange(next);
        return onSubmit(next);
      }
      default:
        return onSubmit(value);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % Math.max(flat.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (index <= 0 ? flat.length - 1 : index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(active >= 0 ? flat[active] : null);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  let position = -1;
  const listId = `${id}-suggestions`;

  return (
    <div ref={wrapperRef} className="relative min-w-0 flex-1">
      <input
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className={inputClassName}
      />
      {open && flat.length > 0 && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 top-full z-40 mt-2 max-h-[420px] w-full min-w-[300px] overflow-y-auto rounded-2xl border border-slate-100 bg-white py-2 text-left shadow-search sm:min-w-[440px]"
        >
          {groups.map((group) => (
            <div key={group.title} className="py-1">
              <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{group.title}</p>
              {group.items.map((item) => {
                position += 1;
                const index = position;
                return (
                  <button
                    key={`${item.kind}-${item.label}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={index === active}
                    onMouseEnter={() => setActive(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(item)}
                    className={`mx-2 block w-[calc(100%-1rem)] rounded-xl px-3 py-2 text-left ${index === active ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                  >
                    <span className={`block truncate text-sm ${item.kind === 'search' ? 'font-semibold text-brand-700' : 'text-ink'}`}>{item.label}</span>
                    {item.detail && <span className="block truncate text-xs text-slate-500">{item.detail}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
