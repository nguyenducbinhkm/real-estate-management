// Các hàm tính toán cho trang Hỗ trợ tiện ích. Kết quả chỉ mang tính tham khảo.

/* ---------------------------- Tính lãi vay ---------------------------- */

/**
 * Lịch trả nợ theo tháng.
 * method: 'annuity' (trả góp đều: tiền trả mỗi tháng bằng nhau)
 *       | 'declining' (dư nợ giảm dần: gốc trả đều, lãi tính trên dư nợ còn lại)
 */
export function loanSchedule({ principal, annualRate, years, method }) {
  const n = Math.max(1, Math.round(years * 12));
  const r = annualRate / 100 / 12;
  const rows = [];
  let balance = principal;

  if (method === 'annuity') {
    const payment = r === 0 ? principal / n : (principal * r) / (1 - (1 + r) ** -n);
    for (let month = 1; month <= n; month += 1) {
      const interest = balance * r;
      const principalPart = month === n ? balance : payment - interest;
      balance = Math.max(0, balance - principalPart);
      rows.push({ month, principal: principalPart, interest, payment: principalPart + interest, balance });
    }
  } else {
    const principalPart = principal / n;
    for (let month = 1; month <= n; month += 1) {
      const interest = balance * r;
      balance = Math.max(0, balance - principalPart);
      rows.push({ month, principal: principalPart, interest, payment: principalPart + interest, balance });
    }
  }

  const totalInterest = rows.reduce((sum, row) => sum + row.interest, 0);
  return {
    rows,
    months: n,
    firstPayment: rows[0]?.payment ?? 0,
    lastPayment: rows[rows.length - 1]?.payment ?? 0,
    totalInterest,
    totalPayment: principal + totalInterest,
  };
}

/* -------------------------- Dự toán chi phí xây nhà -------------------------- */

export const foundationOptions = [
  ['single', 'Móng đơn', 0.2],
  ['strip', 'Móng băng', 0.5],
  ['pile', 'Móng cọc', 0.3],
];

export const roofOptions = [
  ['tole', 'Mái tôn', 0.3],
  ['concrete', 'Mái bê tông cốt thép', 0.5],
  ['tileSteel', 'Mái ngói khung kèo sắt', 0.7],
  ['tileConcrete', 'Mái ngói đổ bê tông', 1.0],
];

export const basementOptions = [
  ['none', 'Không có tầng hầm', 0],
  ['h13', 'Hầm sâu dưới 1,3 m', 1.5],
  ['h17', 'Hầm sâu 1,3 – 1,7 m', 1.7],
  ['h20', 'Hầm sâu 1,7 – 2,0 m', 2.0],
  ['h20plus', 'Hầm sâu trên 2,0 m', 2.5],
];

export const packageOptions = [
  ['rough', 'Phần thô + nhân công hoàn thiện', 3.6],
  ['basic', 'Trọn gói – mức cơ bản', 5.8],
  ['good', 'Trọn gói – mức khá', 6.8],
];

/**
 * Diện tích quy đổi = sàn các tầng (100%) + móng + mái + hầm + sân (50%), theo hệ số thường dùng.
 * unitPrice tính bằng triệu đồng / m².
 */
export function constructionEstimate({ width, length, floors, foundation, roof, basement, yardArea, unitPrice }) {
  const floorArea = width * length;
  const pick = (options, key) => options.find(([value]) => value === key) || options[0];
  const [, foundationLabel, foundationRate] = pick(foundationOptions, foundation);
  const [, roofLabel, roofRate] = pick(roofOptions, roof);
  const [, basementLabel, basementRate] = pick(basementOptions, basement);

  const items = [
    { label: `Sàn ${floors} tầng (100%)`, area: floorArea * floors },
    { label: `${foundationLabel} (${foundationRate * 100}%)`, area: floorArea * foundationRate },
    { label: `${roofLabel} (${roofRate * 100}%)`, area: floorArea * roofRate },
  ];
  if (basementRate > 0) items.push({ label: `${basementLabel} (${basementRate * 100}%)`, area: floorArea * basementRate });
  if (yardArea > 0) items.push({ label: 'Sân, tường rào (50%)', area: yardArea * 0.5 });

  const totalArea = items.reduce((sum, item) => sum + item.area, 0);
  return {
    floorArea,
    items: items.map((item) => ({ ...item, cost: item.area * unitPrice * 1_000_000 })),
    totalArea,
    totalCost: totalArea * unitPrice * 1_000_000,
  };
}

/* ------------------------------ Can chi ------------------------------ */

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

const mod = (value, base) => ((value % base) + base) % base;
export const chiIndex = (year) => mod(year - 4, 12);
export const canChi = (year) => `${CAN[mod(year - 4, 10)]} ${CHI[chiIndex(year)]}`;

/* ---------------------------- Xem tuổi xây nhà ---------------------------- */

const KIM_LAU = { 1: 'Kim Lâu Thân (ảnh hưởng bản thân)', 3: 'Kim Lâu Thê (ảnh hưởng vợ/chồng)', 6: 'Kim Lâu Tử (ảnh hưởng con cái)', 8: 'Kim Lâu Lục Súc (ảnh hưởng tài sản, vật nuôi)' };
const HOANG_OC = [
  ['Nhất Cát', true],
  ['Nhì Nghi', true],
  ['Tam Địa Sát', false],
  ['Tứ Tấn Tài', true],
  ['Ngũ Thọ Tử', false],
  ['Lục Hoang Ốc', false],
];
// Nhóm tuổi (theo chi năm sinh) → các năm (theo chi) phạm Tam Tai.
const TAM_TAI = [
  [[8, 0, 4], [2, 3, 4]], // Thân, Tý, Thìn → Dần, Mão, Thìn
  [[2, 6, 10], [8, 9, 10]], // Dần, Ngọ, Tuất → Thân, Dậu, Tuất
  [[11, 3, 7], [5, 6, 7]], // Hợi, Mão, Mùi → Tỵ, Ngọ, Mùi
  [[5, 9, 1], [11, 0, 1]], // Tỵ, Dậu, Sửu → Hợi, Tý, Sửu
];

/** Tuổi mụ (tuổi âm) của người sinh năm birthYear vào năm buildYear. */
export const lunarAge = (birthYear, buildYear) => buildYear - birthYear + 1;

export function buildingAgeCheck(birthYear, buildYear) {
  const age = lunarAge(birthYear, buildYear);
  const kimLau = KIM_LAU[age % 9] || null;
  const hoangOcIndex = age >= 10 ? mod(Math.floor(age / 10) - 1 + (age % 10), 6) : null;
  const hoangOc = hoangOcIndex === null ? null : { name: HOANG_OC[hoangOcIndex][0], good: HOANG_OC[hoangOcIndex][1] };
  const group = TAM_TAI.find(([members]) => members.includes(chiIndex(birthYear)));
  const tamTai = group[1].includes(chiIndex(buildYear));

  return {
    age,
    birthCanChi: canChi(birthYear),
    buildCanChi: canChi(buildYear),
    kimLau,
    hoangOc,
    tamTai,
    tamTaiYears: group[1].map((index) => CHI[index]),
    tooYoung: age < 18,
    good: !kimLau && (!hoangOc || hoangOc.good) && !tamTai && age >= 18,
  };
}

/** Các năm tốt để làm nhà trong khoảng [fromYear, fromYear + span). */
export function goodBuildingYears(birthYear, fromYear, span = 15) {
  return Array.from({ length: span }, (_, i) => fromYear + i).filter((year) => buildingAgeCheck(birthYear, year).good);
}

/* ---------------------------- Hướng nhà (Bát trạch) ---------------------------- */

const digitRoot = (value) => {
  let n = value;
  while (n > 9) n = String(n).split('').reduce((sum, d) => sum + Number(d), 0);
  return n;
};

export const CUNG = {
  1: { name: 'Khảm', element: 'Thủy', group: 'Đông tứ mệnh' },
  2: { name: 'Khôn', element: 'Thổ', group: 'Tây tứ mệnh' },
  3: { name: 'Chấn', element: 'Mộc', group: 'Đông tứ mệnh' },
  4: { name: 'Tốn', element: 'Mộc', group: 'Đông tứ mệnh' },
  6: { name: 'Càn', element: 'Kim', group: 'Tây tứ mệnh' },
  7: { name: 'Đoài', element: 'Kim', group: 'Tây tứ mệnh' },
  8: { name: 'Cấn', element: 'Thổ', group: 'Tây tứ mệnh' },
  9: { name: 'Ly', element: 'Hỏa', group: 'Đông tứ mệnh' },
};

/** Quái số (cung mệnh) theo năm sinh âm lịch và giới tính, cho năm 1900–2099. */
export function kuaNumber(year, gender) {
  const r = digitRoot(year % 100) || 0;
  let n;
  if (year < 2000) n = gender === 'male' ? 10 - r : r + 5;
  else n = gender === 'male' ? 9 - r : r + 6;
  n = digitRoot(n === 0 ? 9 : n);
  if (n === 5) n = gender === 'male' ? 2 : 8;
  return n;
}

const DIRECTIONS = { B: 'Bắc', DB: 'Đông Bắc', D: 'Đông', DN: 'Đông Nam', N: 'Nam', TN: 'Tây Nam', T: 'Tây', TB: 'Tây Bắc' };

// Thứ tự: Sinh Khí, Thiên Y, Diên Niên, Phục Vị | Tuyệt Mệnh, Ngũ Quỷ, Lục Sát, Họa Hại
const BAT_TRACH = {
  1: ['DN', 'D', 'N', 'B', 'TN', 'DB', 'TB', 'T'],
  2: ['DB', 'T', 'TB', 'TN', 'B', 'DN', 'N', 'D'],
  3: ['N', 'B', 'DN', 'D', 'T', 'TB', 'DB', 'TN'],
  4: ['B', 'N', 'D', 'DN', 'DB', 'TN', 'T', 'TB'],
  6: ['T', 'DB', 'TN', 'TB', 'N', 'D', 'B', 'DN'],
  7: ['TB', 'TN', 'DB', 'T', 'D', 'N', 'DN', 'B'],
  8: ['TN', 'TB', 'T', 'DB', 'DN', 'B', 'D', 'N'],
  9: ['D', 'DN', 'B', 'N', 'TB', 'T', 'TN', 'DB'],
};

const STAR_INFO = [
  ['Sinh Khí', 'Tốt nhất – thu hút tài lộc, danh tiếng'],
  ['Thiên Y', 'Tốt cho sức khỏe, có quý nhân giúp đỡ'],
  ['Diên Niên', 'Củng cố các mối quan hệ, gia đạo hòa thuận'],
  ['Phục Vị', 'Bình yên, vững vàng tinh thần'],
  ['Tuyệt Mệnh', 'Xấu nhất – nên tránh đặt cửa chính, phòng ngủ'],
  ['Ngũ Quỷ', 'Dễ gặp thị phi, mất mát'],
  ['Lục Sát', 'Ảnh hưởng quan hệ, tình cảm'],
  ['Họa Hại', 'Dễ gặp chuyện không may nhỏ'],
];

const LUCKY_COLORS = {
  'Thủy': 'Đen, xanh dương (bản mệnh); trắng, xám, ghi (Kim sinh Thủy)',
  'Mộc': 'Xanh lá (bản mệnh); đen, xanh dương (Thủy sinh Mộc)',
  'Hỏa': 'Đỏ, hồng, tím (bản mệnh); xanh lá (Mộc sinh Hỏa)',
  'Thổ': 'Vàng, nâu đất (bản mệnh); đỏ, hồng, tím (Hỏa sinh Thổ)',
  'Kim': 'Trắng, xám, ghi (bản mệnh); vàng, nâu đất (Thổ sinh Kim)',
};

export function houseDirections(year, gender) {
  const kua = kuaNumber(year, gender);
  const cung = CUNG[kua];
  const list = BAT_TRACH[kua].map((code, index) => ({
    code,
    direction: DIRECTIONS[code],
    star: STAR_INFO[index][0],
    meaning: STAR_INFO[index][1],
    good: index < 4,
  }));
  return {
    kua,
    canChi: canChi(year),
    ...cung,
    colors: LUCKY_COLORS[cung.element],
    good: list.filter((item) => item.good),
    bad: list.filter((item) => !item.good),
    byCode: Object.fromEntries(list.map((item) => [item.code, item])),
  };
}

/* ------------------------------ Định dạng ------------------------------ */

export function formatVnd(value) {
  return `${Math.round(value).toLocaleString('vi-VN')} đ`;
}

export function formatShortVnd(value) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu`;
  return formatVnd(value);
}
