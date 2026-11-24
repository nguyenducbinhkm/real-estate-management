import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Mỗi lần bấm link sang trang khác (đổi đường dẫn hoặc tham số ?...), đưa trang về đầu ngay lập tức.
 * - Bỏ qua khi bấm Back/Forward (POP) để trình duyệt tự khôi phục vị trí cũ.
 * - Bỏ qua link có #neo (vd. #tin-dang) để trình duyệt cuộn tới đúng mục.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === 'POP' || hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search, hash, navigationType]);

  return null;
}
