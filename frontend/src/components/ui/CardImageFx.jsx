// Hiệu ứng dùng chung cho ảnh trên thẻ (tin đăng, dự án). Phần tử cha cần có class `group` và `relative overflow-hidden`.
import { ArrowIcon, CameraIcon } from '../property/PropertyIcons';

/** Lớp tối dần ở đáy ảnh + vệt sáng lướt chéo qua ảnh khi rê chuột. */
export function ImageShade() {
  return (
    <>
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/55 via-transparent to-ink-900/10 opacity-70 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
      <span
        className="pointer-events-none absolute -inset-y-4 left-0 w-1/3 -translate-x-[160%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[420%]"
        aria-hidden="true"
      />
    </>
  );
}

/** Góc phải dưới: nhãn ghi chú ảnh (vd. "Ảnh minh họa"); khi rê chuột đổi thành nút tròn mũi tên ↗. */
export function HoverCorner({ note = 'Ảnh minh họa' }) {
  return (
    <>
      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[10px] text-white/90 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-2 group-hover:opacity-0">
        <CameraIcon className="h-3 w-3" />
        {note}
      </span>
      <span
        className="absolute bottom-2.5 right-2.5 grid h-9 w-9 translate-y-3 scale-75 place-items-center rounded-full bg-brand-600 text-white opacity-0 shadow-lg shadow-brand-900/30 ring-4 ring-white/30 transition-all duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
        aria-hidden="true"
      >
        <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
      </span>
    </>
  );
}

/** Lớp ảnh phóng to chậm khi rê chuột (dùng cho className của ảnh). */
export const zoomImageClass = 'transition-transform duration-700 ease-out group-hover:scale-110';
