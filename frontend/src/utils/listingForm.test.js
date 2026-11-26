import { describe, expect, it } from 'vitest';
import { EMPTY, fromListing, priceOf, toPayload, validateStep } from './listingForm';

const houseForm = (patch = {}) => ({
  ...EMPTY,
  transactionType: 'ForSale',
  propertyType: 'House',
  title: 'Bán nhà riêng 4 tầng hẻm xe hơi Quận 7',
  description: 'Nhà 4 tầng, hẻm xe hơi, gần chợ và trường học, sổ hồng chính chủ, vào ở ngay.',
  priceValue: '6,8',
  priceUnit: 'ty',
  area: '120',
  landArea: '60',
  contactPhone: '0911 222 333',
  ...patch,
});

describe('priceOf – quy đổi giá theo đơn vị', () => {
  it('bán: "6,8" tỷ → 6.800.000.000', () => expect(priceOf(houseForm())).toBe(6_800_000_000));
  it('bán: đơn vị triệu', () => expect(priceOf(houseForm({ priceValue: '950', priceUnit: 'trieu' }))).toBe(950_000_000));
  it('cho thuê luôn tính theo triệu/tháng', () => expect(priceOf(houseForm({ transactionType: 'ForRent', priceValue: '12', priceUnit: 'ty' }))).toBe(12_000_000));
  it('giá trống hoặc sai → 0', () => {
    expect(priceOf(houseForm({ priceValue: '' }))).toBe(0);
    expect(priceOf(houseForm({ priceValue: 'abc' }))).toBe(0);
  });
});

describe('validateStep – kiểm tra từng bước giống backend', () => {
  it('bước 1: chưa chọn loại BĐS', () => expect(validateStep(0, { ...EMPTY }, [])).toHaveProperty('propertyType'));

  it('bước 3 hợp lệ thì không có lỗi', () => expect(validateStep(2, houseForm(), [])).toEqual({}));

  it('bước 3: tiêu đề < 20 ký tự, mô tả < 50 ký tự (biên)', () => {
    const errors = validateStep(2, houseForm({ title: 'x'.repeat(19), description: 'y'.repeat(49) }), []);
    expect(errors).toHaveProperty('title');
    expect(errors).toHaveProperty('description');
    expect(validateStep(2, houseForm({ title: 'x'.repeat(20), description: 'y'.repeat(50) }), [])).toEqual({});
  });

  it('nhà riêng bắt buộc diện tích đất; căn hộ thì không', () => {
    expect(validateStep(2, houseForm({ landArea: '' }), [])).toHaveProperty('landArea');
    expect(validateStep(2, houseForm({ propertyType: 'Apartment', landArea: '' }), [])).not.toHaveProperty('landArea');
  });

  it('số liên hệ bắt buộc; số Zalo bắt buộc khi bỏ tick "dùng chung"', () => {
    expect(validateStep(2, houseForm({ contactPhone: 'abc' }), [])).toHaveProperty('contactPhone');
    expect(validateStep(2, houseForm({ zaloSame: false, zaloPhone: '' }), [])).toHaveProperty('zaloPhone');
  });

  it('bước 4: còn ảnh đang tải hoặc ảnh lỗi thì chưa gửi được', () => {
    expect(validateStep(3, houseForm(), [{ status: 'uploading' }])).toHaveProperty('images');
    expect(validateStep(3, houseForm(), [{ status: 'error' }])).toHaveProperty('images');
    expect(validateStep(3, houseForm(), [{ status: 'done' }])).toEqual({});
  });
});

describe('toPayload – dữ liệu gửi API', () => {
  it('chỉ gửi trường hợp lệ với loại BĐS, ảnh đã tải xong, Zalo dùng chung số liên hệ', () => {
    const payload = toPayload(houseForm({ bedrooms: '3' }), [
      { status: 'done', url: '/uploads/listings/a.jpg' },
      { status: 'error', url: '' },
    ]);
    expect(payload.price).toBe(6_800_000_000);
    expect(payload.landArea).toBe(60);
    expect(payload.bedroomCount).toBeNull(); // nhà riêng không có ô phòng ngủ
    expect(payload.imageUrls).toEqual(['/uploads/listings/a.jpg']);
    expect(payload.zaloPhone).toBe('0911 222 333');
  });

  it('Zalo riêng khi bỏ tick', () => {
    expect(toPayload(houseForm({ zaloSame: false, zaloPhone: '0988 777 666' }), []).zaloPhone).toBe('0988 777 666');
  });
});

describe('fromListing – nạp tin khi sửa', () => {
  it('giá ≥ 1 tỷ hiển thị theo tỷ, nhỏ hơn theo triệu', () => {
    expect(fromListing({ transactionType: 'ForSale', propertyType: 'House', price: 6_800_000_000, area: 120 })).toMatchObject({ priceValue: '6.8', priceUnit: 'ty' });
    expect(fromListing({ transactionType: 'ForSale', propertyType: 'Land', price: 950_000_000, area: 100 })).toMatchObject({ priceValue: '950', priceUnit: 'trieu' });
  });
});
