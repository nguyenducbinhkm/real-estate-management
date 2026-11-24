import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import SmartSearchBox from './SmartSearchBox';

/** Thanh tìm kiếm trang danh sách: có gợi ý và hiểu câu tìm tự do (xem SmartSearchBox). */
export default function SearchBar({ value, onSearch, transactionType = '' }) {
  const [text, setText] = useState(value || '');

  useEffect(() => setText(value || ''), [value]);

  const submit = (event) => {
    event.preventDefault();
    onSearch(text);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-3xl border border-slate-100 bg-white p-2 shadow-card sm:flex-row sm:rounded-full">
      <label className="sr-only" htmlFor="listing-search">Từ khóa tìm kiếm</label>
      <SmartSearchBox
        id="listing-search"
        value={text}
        onChange={setText}
        onSubmit={onSearch}
        transactionType={transactionType}
        placeholder="VD: căn hộ quận 7 dưới 5 tỷ, cho thuê văn phòng quận 1…"
        inputClassName="h-11 w-full min-w-0 rounded-full border-0 bg-slate-50 px-5 text-sm outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-300"
      />
      <Button type="submit" size="md" className="rounded-full sm:min-w-32">Tìm kiếm</Button>
    </form>
  );
}
