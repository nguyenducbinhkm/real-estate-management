// Ảnh MINH HỌA KHU VỰC cho dự án (database chưa có ảnh dự án).
// Ảnh lấy từ Wikimedia Commons theo tỉnh/thành, KHÔNG phải ảnh thật của dự án;
// giấy phép Creative Commons yêu cầu ghi tác giả và giấy phép (xem ImageCredit).

const thumb = (path, width = 1280) => {
  const file = path.split('/').pop();
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${width}px-${file}`;
};

const images = {
  hanoiSunset: {
    url: thumb('2/20/Sunset_over_Hanoi_After_the_Rain.jpg'),
    alt: 'Toàn cảnh Hà Nội sau mưa (ảnh minh họa khu vực)',
    author: 'Christopher Crouzet',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sunset_over_Hanoi_After_the_Rain.jpg',
  },
  hanoiKeangnam: {
    url: thumb('9/99/Keangnam_Hanoi_Landmark_Tower_misty_01.jpg'),
    alt: 'Khu Mễ Trì – Nam Từ Liêm, Hà Nội (ảnh minh họa khu vực)',
    author: 'Vuong Tri Binh',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Keangnam_Hanoi_Landmark_Tower_misty_01.jpg',
  },
  hcmAerial: {
    url: thumb('c/c4/Ho_Chi_Minh_City_-_DJI_0124-HDR.jpg'),
    alt: 'TP. Hồ Chí Minh nhìn từ trên cao (ảnh minh họa khu vực)',
    author: 'Lê Minh Phát',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ho_Chi_Minh_City_-_DJI_0124-HDR.jpg',
  },
  hcmRiver: {
    url: thumb('7/7a/Saigon_at_Blue_Hour.jpg'),
    alt: 'Sài Gòn ven sông lúc hoàng hôn (ảnh minh họa khu vực)',
    author: 'Radek Kucharski',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Saigon_at_Blue_Hour.jpg',
  },
  dongNai: {
    url: thumb('4/41/Dong_Nai_River_in_Bien_Hoa_%2815286968737%29.jpg'),
    alt: 'Sông Đồng Nai tại Biên Hòa (ảnh minh họa khu vực)',
    author: 'Gary Todd',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dong_Nai_River_in_Bien_Hoa_(15286968737).jpg',
  },
  hungYen: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Ecopark_Hung_Yen.jpg',
    alt: 'Khu đô thị Ecopark, Hưng Yên (ảnh minh họa khu vực)',
    author: 'Nguyễn Văn Thành 1992',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ecopark_Hung_Yen.jpg',
  },
};

export const projectImageList = Object.values(images);

// Mã tỉnh → danh sách ảnh có thể dùng.
const byProvince = {
  '01': [images.hanoiSunset, images.hanoiKeangnam],
  '79': [images.hcmAerial, images.hcmRiver],
  '75': [images.dongNai],
  '33': [images.hungYen],
};

const fallback = [images.hcmAerial, images.hanoiSunset];

/** Chọn ảnh minh họa theo tỉnh của dự án; cùng một dự án luôn ra cùng một ảnh. */
export function getProjectImage(project) {
  const list = byProvince[project?.provinceCode] || fallback;
  const seed = [...String(project?.id || project?.name || '')].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return list[seed % list.length];
}
