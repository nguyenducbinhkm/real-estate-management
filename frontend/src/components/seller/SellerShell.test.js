import { describe, expect, it } from 'vitest';
import { daysLeft, effectiveStatus, formatPrice } from './SellerShell';

describe('SellerShell – hàm tiện ích', () => {
  it('formatPrice: tỷ / triệu / liên hệ', () => {
    expect(formatPrice(3_500_000_000)).toBe('3.5 tỷ');
    expect(formatPrice(2_000_000_000)).toBe('2 tỷ');
    expect(formatPrice(12_000_000)).toBe('12 triệu');
    expect(formatPrice(0)).toBe('Liên hệ');
  });

  it('effectiveStatus: tin Đang hiển thị đã quá hạn được coi là Hết hạn', () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(effectiveStatus({ status: 'Active', expiresAt: past })).toBe('Expired');
    expect(effectiveStatus({ status: 'Active', expiresAt: future })).toBe('Active');
    expect(effectiveStatus({ status: 'Pending', expiresAt: past })).toBe('Pending');
  });

  it('daysLeft: làm tròn lên, null nếu không có hạn', () => {
    expect(daysLeft(new Date(Date.now() + 2.5 * 86_400_000).toISOString())).toBe(3);
    expect(daysLeft(null)).toBeNull();
  });
});
