import { useEffect, useState } from 'react';
import Button from '../ui/Button';

export default function SearchBar({ value, onSearch }) {
  const [keyword, setKeyword] = useState(value || '');

  useEffect(() => setKeyword(value || ''), [value]);

  const submit = (event) => {
    event.preventDefault();
    onSearch(keyword);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-card sm:flex-row">
      <label className="sr-only" htmlFor="listing-search">Từ khóa tìm kiếm</label>
      <input
        id="listing-search"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="Tìm theo địa điểm, dự án hoặc tên bất động sản"
        className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      <Button type="submit" size="md" className="sm:min-w-28">Tìm kiếm</Button>
    </form>
  );
}
