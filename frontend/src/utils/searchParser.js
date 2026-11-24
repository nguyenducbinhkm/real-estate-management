// Phân tích câu tìm kiếm tiếng Việt tự do thành bộ lọc của API /api/listings.
// Ví dụ: "cho thuê căn hộ quận 7 dưới 15 triệu" → { transactionType: ForRent, propertyType: RentalApartment,
//          provinceCode: 79, districtCode: 778, maxPrice: 15_000_000 }.
import { districtList, provinceList } from '../data/locations.js';

/* ------------------------------ Chuẩn hóa ------------------------------ */

/** Bỏ dấu + chữ thường, GIỮ NGUYÊN độ dài chuỗi (mỗi ký tự gốc ↔ một ký tự chuẩn hóa). */
export function foldChars(text) {
  return [...(text || '')]
    .map((ch) => {
      const lower = ch.toLocaleLowerCase('vi');
      if (lower === 'đ') return 'd';
      return lower.normalize('NFD').replace(/[̀-ͯ]/g, '')[0] || ' ';
    })
    .join('');
}

export const fold = (text) => foldChars(text).replace(/\s+/g, ' ').trim();

const stripAdminPrefix = (name) =>
  fold(name).replace(/^(thanh pho|tinh|quan|huyen|thi xa|thi tran)\s+/, '');

/* ------------------------------ Từ điển ------------------------------ */

// [cụm từ (đã bỏ dấu), loại khi bán, loại khi thuê, nhãn]
const TYPE_WORDS = [
  ['can ho chung cu', 'Apartment', 'RentalApartment', 'Căn hộ chung cư'],
  ['chung cu', 'Apartment', 'RentalApartment', 'Căn hộ chung cư'],
  ['can ho', 'Apartment', 'RentalApartment', 'Căn hộ chung cư'],
  ['studio', 'Apartment', 'RentalApartment', 'Căn hộ chung cư'],
  ['apartment', 'Apartment', 'RentalApartment', 'Căn hộ chung cư'],
  ['nha pho thuong mai', 'Shophouse', null, 'Shophouse, nhà phố thương mại'],
  ['shophouse', 'Shophouse', null, 'Shophouse, nhà phố thương mại'],
  ['biet thu', 'Villa', null, 'Biệt thự, liền kề'],
  ['lien ke', 'Villa', null, 'Biệt thự, liền kề'],
  ['villa', 'Villa', null, 'Biệt thự, liền kề'],
  ['nha rieng', 'House', 'RentalHouse', 'Nhà riêng'],
  ['nha nguyen can', 'House', 'RentalHouse', 'Nhà riêng'],
  ['nha pho', 'House', 'RentalHouse', 'Nhà riêng'],
  ['nha mat pho', 'House', 'RentalHouse', 'Nhà riêng'],
  ['dat nen', 'Land', null, 'Đất, đất nền'],
  ['lo dat', 'Land', null, 'Đất, đất nền'],
  ['dat tho cu', 'Land', null, 'Đất, đất nền'],
  ['dat', 'Land', null, 'Đất, đất nền'],
  ['van phong', null, 'Office', 'Văn phòng'],
  ['office', null, 'Office', 'Văn phòng'],
  ['nha xuong', null, 'Warehouse', 'Kho, nhà xưởng'],
  ['kho xuong', null, 'Warehouse', 'Kho, nhà xưởng'],
  ['kho', null, 'Warehouse', 'Kho, nhà xưởng'],
  ['xuong', null, 'Warehouse', 'Kho, nhà xưởng'],
  ['warehouse', null, 'Warehouse', 'Kho, nhà xưởng'],
];

export const TYPE_LABELS = {
  Apartment: 'Căn hộ chung cư', House: 'Nhà riêng', Villa: 'Biệt thự, liền kề', Shophouse: 'Shophouse', Land: 'Đất, đất nền',
  RentalApartment: 'Căn hộ cho thuê', RentalHouse: 'Nhà riêng cho thuê', Office: 'Văn phòng', Warehouse: 'Kho, nhà xưởng',
};

const RENT_WORDS = ['cho thue', 'can thue', 'thue'];
const SALE_WORDS = ['mua ban', 'can ban', 'can mua', 'ban', 'mua'];
const FILLER = new Set(['tai', 'o', 'gan', 'khu', 'vuc', 'can', 'tim', 'cac', 'nhung', 'gia', 're', 'dep', 'moi', 'va', 'co', 'nha', 'khu vuc', 'tp', 'tinh', 'quan', 'huyen']);

const PROVINCE_ALIASES = {
  '01': ['ha noi', 'hn'],
  '79': ['ho chi minh', 'hcm', 'tphcm', 'tp hcm', 'sai gon', 'sg'],
  '48': ['da nang', 'dn'],
  '31': ['hai phong', 'hp'],
  '92': ['can tho'],
  '74': ['binh duong', 'bd'],
  '75': ['dong nai'],
  '33': ['hung yen'],
};

// Chỉ mục tên địa danh (đã bỏ dấu, bỏ tiền tố hành chính) → mục.
const provinceIndex = provinceList.map(([code, name]) => ({
  kind: 'province',
  code,
  name,
  keys: [stripAdminPrefix(name), ...(PROVINCE_ALIASES[code] || [])],
}));

const districtIndex = districtList.map(([code, name, provinceCode]) => {
  const core = stripAdminPrefix(name);
  const folded = fold(name);
  // Quận số (Quận 1, Quận 7…) chỉ khớp khi có chữ "quận"/"q": "quan 7", "q7", "q.7".
  const keys = /^\d+$/.test(core) ? [folded, `q${core}`, `q.${core}`, `q ${core}`] : [core, folded];
  return { kind: 'district', code, name, provinceCode, keys };
});

const provinceName = (code) => provinceList.find(([c]) => c === code)?.[1] || '';

/* ------------------------------ Tìm cụm từ ------------------------------ */

/** Tìm cụm `phrase` (đã bỏ dấu) trong chuỗi chuẩn hóa, đúng ranh giới từ, chưa bị dùng. */
function findPhrase(folded, phrase, used) {
  const pattern = new RegExp(`(^|[^a-z0-9.])(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?=$|[^a-z0-9])`, 'g');
  let match;
  while ((match = pattern.exec(folded))) {
    const start = match.index + match[1].length;
    const end = start + match[2].length;
    if (!used.slice(start, end).some(Boolean)) return [start, end];
  }
  return null;
}

const markUsed = (used, [start, end]) => { for (let i = start; i < end; i += 1) used[i] = true; };

const UNIT = { ty: 1e9, ti: 1e9, trieu: 1e6, tr: 1e6, nghin: 1e3, k: 1e3 };
const toNumber = (text) => Number(String(text).replace(',', '.'));

/* ------------------------------ Phân tích ------------------------------ */

/**
 * @param {string} text câu người dùng gõ
 * @param {{ transactionType?: string }} hints loại giao dịch mặc định (vd. tab Mua bán / Cho thuê)
 */
export function parseSearchQuery(text, hints = {}) {
  const original = text || '';
  const folded = foldChars(original);
  const used = new Array(folded.length).fill(false);
  const result = { transactionType: hints.transactionType || '', propertyType: '', provinceCode: '', districtCode: '', minPrice: '', maxPrice: '', minArea: '', maxArea: '', keyword: '' };
  const labels = [];

  // Giá: "dưới 5 tỷ", "trên 800 triệu", "từ 2 đến 3 tỷ", "2-3 tỷ", "2 tỷ - 3 tỷ"
  const num = '(\\d+(?:[.,]\\d+)?)';
  const unit = '(ty|ti|trieu|tr|nghin|k)\\b';
  const priceRange = new RegExp(`(?:tu\\s+)?${num}\\s*(?:${unit})?\\s*(?:-|den|toi|~)\\s*${num}\\s*${unit}`);
  const priceBound = new RegExp(`(duoi|toi da|nho hon|<|tren|toi thieu|hon|>|tu)\\s*${num}\\s*${unit}`);
  let m = priceRange.exec(folded);
  if (m) {
    const high = toNumber(m[3]) * UNIT[m[4]];
    const low = toNumber(m[1]) * UNIT[m[2] || m[4]];
    result.minPrice = Math.min(low, high);
    result.maxPrice = Math.max(low, high);
    markUsed(used, [m.index, m.index + m[0].length]);
  } else if ((m = priceBound.exec(folded))) {
    const value = toNumber(m[2]) * UNIT[m[3]];
    if (['duoi', 'toi da', 'nho hon', '<'].includes(m[1])) result.maxPrice = value;
    else result.minPrice = value;
    markUsed(used, [m.index, m.index + m[0].length]);
  }

  // Diện tích: "trên 60m2", "50-80 m²", "70m2"
  const areaUnit = '(?:m2|m²|m\\s*vuong|met vuong)';
  const areaRange = new RegExp(`${num}\\s*(?:-|den|toi)\\s*${num}\\s*${areaUnit}`);
  const areaBound = new RegExp(`(duoi|tren|tu|hon)?\\s*${num}\\s*${areaUnit}`);
  if ((m = areaRange.exec(folded))) {
    result.minArea = Math.min(toNumber(m[1]), toNumber(m[2]));
    result.maxArea = Math.max(toNumber(m[1]), toNumber(m[2]));
    markUsed(used, [m.index, m.index + m[0].length]);
  } else if ((m = areaBound.exec(folded))) {
    const value = toNumber(m[2]);
    if (m[1] === 'duoi') result.maxArea = value;
    else if (m[1]) result.minArea = value;
    else { result.minArea = Math.floor(value * 0.9); result.maxArea = Math.ceil(value * 1.1); }
    markUsed(used, [m.index, m.index + m[0].length]);
  }

  // Số phòng ngủ: "2pn", "2 phòng ngủ" → từ khóa "2PN" (tiêu đề tin dùng dạng này)
  let roomKeyword = '';
  if ((m = /(\d)\s*(?:pn|phong ngu)\b/.exec(folded))) {
    roomKeyword = `${m[1]}PN`;
    markUsed(used, [m.index, m.index + m[0].length]);
  }

  // Giao dịch
  for (const word of RENT_WORDS) {
    const span = findPhrase(folded, word, used);
    if (span) { result.transactionType = 'ForRent'; markUsed(used, span); break; }
  }
  if (!result.transactionType || result.transactionType === hints.transactionType) {
    for (const word of SALE_WORDS) {
      const span = findPhrase(folded, word, used);
      if (span) { result.transactionType = result.transactionType === 'ForRent' && hints.transactionType !== 'ForRent' ? 'ForRent' : 'ForSale'; markUsed(used, span); break; }
    }
  }

  // Loại BĐS (cụm dài trước)
  for (const [phrase, saleType, rentType] of [...TYPE_WORDS].sort((a, b) => b[0].length - a[0].length)) {
    const span = findPhrase(folded, phrase, used);
    if (!span) continue;
    markUsed(used, span);
    if (result.transactionType === 'ForRent' && rentType) result.propertyType = rentType;
    else if (result.transactionType === 'ForSale' && saleType) result.propertyType = saleType;
    else if (saleType && !rentType) { result.propertyType = saleType; result.transactionType = 'ForSale'; }
    else if (rentType && !saleType) { result.propertyType = rentType; result.transactionType = 'ForRent'; }
    else result.propertyType = saleType;
    break;
  }

  // Địa điểm: tỉnh trước, rồi quận/huyện (ưu tiên quận thuộc tỉnh đã tìm thấy)
  const tryLocations = (index, filter) => {
    const candidates = index.filter(filter).flatMap((item) => item.keys.map((key) => ({ item, key })))
      .sort((a, b) => b.key.length - a.key.length);
    for (const { item, key } of candidates) {
      if (key.length < 2) continue;
      const span = findPhrase(folded, key, used);
      if (span) { markUsed(used, span); return item; }
    }
    return null;
  };
  const province = tryLocations(provinceIndex, () => true);
  if (province) result.provinceCode = province.code;
  const district = tryLocations(districtIndex, (d) => !province || d.provinceCode === province.code);
  if (district) {
    result.districtCode = district.code;
    result.provinceCode = district.provinceCode;
  }

  // Phần còn lại → từ khóa (giữ nguyên chữ người dùng gõ)
  const leftover = [...original].map((ch, i) => (used[i] ? ' ' : ch)).join('')
    .split(/\s+/)
    .filter((word) => word && !FILLER.has(fold(word)) && !/^[,.;:!?\-–]+$/.test(word))
    .join(' ')
    .trim();
  result.keyword = leftover || roomKeyword;

  // Nhãn mô tả những gì đã hiểu
  if (result.transactionType) labels.push(result.transactionType === 'ForRent' ? 'Cho thuê' : 'Mua bán');
  if (result.propertyType) labels.push(TYPE_LABELS[result.propertyType]);
  if (district) labels.push(`${district.name}, ${provinceName(district.provinceCode)}`);
  else if (province) labels.push(province.name);
  if (result.minPrice || result.maxPrice) labels.push(priceLabel(result.minPrice, result.maxPrice));
  if (result.minArea || result.maxArea) labels.push(areaLabel(result.minArea, result.maxArea));
  if (result.keyword) labels.push(`“${result.keyword}”`);

  return { ...result, labels };
}

function money(value) {
  return value >= 1e9 ? `${+(value / 1e9).toFixed(2)} tỷ` : `${+(value / 1e6).toFixed(1)} triệu`;
}

export function priceLabel(min, max) {
  if (min && max) return `${money(min)} – ${money(max)}`;
  if (max) return `Dưới ${money(max)}`;
  return `Trên ${money(min)}`;
}

export function areaLabel(min, max) {
  if (min && max) return `${min} – ${max} m²`;
  if (max) return `Dưới ${max} m²`;
  return `Trên ${min} m²`;
}

/* ------------------------------ Gợi ý địa danh ------------------------------ */

/** Gợi ý tỉnh/quận khớp với đoạn cuối người dùng đang gõ. */
export function suggestLocations(text, limit = 5) {
  const words = fold(text).split(' ').filter(Boolean);
  if (words.length === 0) return [];
  const results = [];
  const seen = new Set();
  // Thử 3, 2, 1 từ cuối làm tiền tố
  for (let take = Math.min(3, words.length); take >= 1 && results.length < limit; take -= 1) {
    const tail = words.slice(-take).join(' ');
    if (tail.length < 2) continue;
    const match = (item) => item.keys.some((key) => key.startsWith(tail) || key.includes(` ${tail}`));
    for (const item of [...provinceIndex.filter(match), ...districtIndex.filter(match)]) {
      const id = `${item.kind}-${item.code}`;
      if (seen.has(id)) continue;
      seen.add(id);
      results.push({
        ...item,
        tail,
        label: item.kind === 'district' ? `${item.name}, ${provinceName(item.provinceCode)}` : item.name,
      });
      if (results.length >= limit) break;
    }
  }
  return results;
}

/** Gợi ý loại BĐS khớp với đoạn cuối. */
export function suggestTypes(text, transactionType, limit = 3) {
  const tail = fold(text).split(' ').slice(-2).join(' ');
  if (tail.length < 2) return [];
  const seen = new Set();
  return TYPE_WORDS.filter(([phrase]) => phrase.startsWith(tail) || phrase.includes(` ${tail}`) || tail.endsWith(phrase))
    .map(([, saleType, rentType, label]) => ({ type: transactionType === 'ForRent' ? rentType || saleType : saleType || rentType, label }))
    .filter((item) => item.type && !seen.has(item.type) && seen.add(item.type))
    .slice(0, limit);
}
