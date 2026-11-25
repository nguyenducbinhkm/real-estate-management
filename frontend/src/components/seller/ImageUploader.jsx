import { useRef, useState } from 'react';
import { postingService } from '../../services/postingService';
import { readApiError } from '../../services/accountService';
import { mediaUrl } from '../../services/api';
import { Icon, icons } from './SellerShell';

/* Tải ảnh tin đăng: kéo-thả hoặc chọn nhiều ảnh, xem trước, đổi thứ tự, chọn ảnh đại diện (ảnh đầu tiên). */

export const MAX_IMAGES = 10;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

let nextKey = 0;
/** Ảnh đã có (khi sửa tin) → phần tử của danh sách ảnh. */
export const toImageItem = (url) => ({ key: `img-${nextKey++}`, url, preview: mediaUrl(url), status: 'done', progress: 100 });

export default function ImageUploader({ images, onChange, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState('');

  // Luôn cập nhật trên danh sách mới nhất (các ảnh tải song song).
  const latest = useRef(images);
  latest.current = images;
  const update = (key, patch) => onChange(latest.current.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const addFiles = (fileList) => {
    setNotice('');
    const files = [...fileList];
    const room = MAX_IMAGES - latest.current.length;
    const problems = [];
    const accepted = files.filter((file) => {
      if (!ACCEPT.includes(file.type)) return problems.push(`${file.name}: chỉ nhận JPG, PNG, WEBP`) && false;
      if (file.size > MAX_BYTES) return problems.push(`${file.name}: lớn hơn 5 MB`) && false;
      return true;
    }).slice(0, Math.max(room, 0));
    if (files.length - problems.length > room) problems.push(`Chỉ được tối đa ${MAX_IMAGES} ảnh.`);
    if (problems.length) setNotice(problems.join(' · '));
    if (!accepted.length) return;

    const items = accepted.map((file) => ({
      key: `img-${nextKey++}`,
      url: '',
      preview: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0,
      file,
    }));
    onChange([...latest.current, ...items]);

    items.forEach((item) => {
      postingService
        .uploadImage(item.file, (progress) => update(item.key, { progress }))
        .then(({ url }) => update(item.key, { url, status: 'done', progress: 100, file: undefined }))
        .catch((err) => update(item.key, { status: 'error', message: readApiError(err, 'Tải ảnh thất bại.').message }));
    });
  };

  const remove = (key) => onChange(latest.current.filter((item) => item.key !== key));
  const move = (index, delta) => {
    const list = [...latest.current];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    onChange(list);
  };
  const makeCover = (index) => {
    const list = [...latest.current];
    const [item] = list.splice(index, 1);
    onChange([item, ...list]);
  };
  const retry = (item) => {
    if (!item.file) return remove(item.key);
    update(item.key, { status: 'uploading', progress: 0, message: '' });
    postingService
      .uploadImage(item.file, (progress) => update(item.key, { progress }))
      .then(({ url }) => update(item.key, { url, status: 'done', progress: 100, file: undefined }))
      .catch((err) => update(item.key, { status: 'error', message: readApiError(err, 'Tải ảnh thất bại.').message }));
    return undefined;
  };

  return (
    <div>
      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}
        className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging ? 'border-brand-500 bg-brand-50' : error ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-slate-50 hover:border-brand-300'
        }`}
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-sm">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 8" />
          </svg>
        </span>
        <p className="mt-3 font-semibold text-ink">Kéo thả ảnh vào đây</p>
        <p className="mt-1 text-sm text-slate-500">hoặc</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={images.length >= MAX_IMAGES}
          className="mt-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Chọn ảnh từ máy
        </button>
        <p className="mt-3 text-xs text-slate-500">JPG, PNG, WEBP · tối đa 5 MB/ảnh · tối đa {MAX_IMAGES} ảnh ({images.length}/{MAX_IMAGES})</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(',')}
          multiple
          className="hidden"
          onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }}
        />
      </div>

      {(notice || error) && <p role="alert" className="mt-2 text-sm text-red-600">{notice || error}</p>}

      {images.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((item, index) => (
            <li key={item.key} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
              <img src={item.preview} alt={`Ảnh ${index + 1}`} className={`h-full w-full object-cover ${item.status !== 'done' ? 'opacity-60' : ''}`} />
              {index === 0 && item.status === 'done' && (
                <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">Ảnh đại diện</span>
              )}
              {item.status === 'uploading' && (
                <div className="absolute inset-x-3 bottom-3 h-1.5 overflow-hidden rounded-full bg-white/70">
                  <div className="h-full bg-brand-600 transition-all" style={{ width: `${item.progress}%` }} />
                </div>
              )}
              {item.status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-900/60 p-2 text-center text-xs text-white">
                  <span>{item.message}</span>
                  <button type="button" onClick={() => retry(item)} className="rounded-full bg-white px-3 py-1 font-semibold text-red-700">Thử lại</button>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Đưa ảnh lên trước" className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink disabled:opacity-40">‹</button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === images.length - 1} aria-label="Đưa ảnh ra sau" className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink disabled:opacity-40">›</button>
                </div>
                {index > 0 && item.status === 'done' && (
                  <button type="button" onClick={() => makeCover(index)} className="truncate rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-ink">Làm ảnh đại diện</button>
                )}
                <button type="button" onClick={() => remove(item.key)} aria-label="Xoá ảnh" className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-red-600">
                  <Icon d={icons.trash} className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
