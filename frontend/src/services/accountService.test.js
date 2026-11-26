import { describe, expect, it } from 'vitest';
import { readApiError } from './accountService';

describe('readApiError – đọc lỗi API thành thông báo + lỗi từng ô', () => {
  it('lỗi validation: tên trường viết thường chữ đầu, lấy thông báo đầu tiên', () => {
    const error = { response: { data: { code: 'VALIDATION_ERROR', message: 'x', details: { FullName: ['Vui lòng nhập họ tên.', 'khác'], Phone: ['Sai'] } } } };
    const result = readApiError(error);
    expect(result.fields).toEqual({ fullName: 'Vui lòng nhập họ tên.', phone: 'Sai' });
    expect(result.message).toBe('Vui lòng kiểm tra lại các thông tin bên dưới.');
  });

  it('lỗi nghiệp vụ: dùng message và code của server', () => {
    const result = readApiError({ response: { data: { code: 'LISTING_LIMIT', message: 'Hết suất' } } });
    expect(result).toMatchObject({ message: 'Hết suất', code: 'LISTING_LIMIT', fields: {} });
  });

  it('không kết nối được máy chủ', () => expect(readApiError(new Error('Network Error')).message).toMatch(/Không kết nối được máy chủ/));
});
