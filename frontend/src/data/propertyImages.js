// Ảnh MINH HỌA cho tin đăng theo loại bất động sản.
// Database chưa có ảnh dùng được (PropertyImages đang lưu link trang Unsplash, không phải file ảnh),
// nên mỗi tin hiển thị một ảnh minh họa cùng loại – KHÔNG phải ảnh thật của căn nhà/căn hộ đó.
// Ảnh lấy từ Wikimedia Commons; giấy phép CC yêu cầu ghi tác giả và giấy phép (trang /image-credits).

const W = 'https://upload.wikimedia.org/wikipedia/commons/thumb';
const BY = (v) => ({ license: `CC BY ${v}`, licenseUrl: `https://creativecommons.org/licenses/by/${v}/` });
const BYSA = (v) => ({ license: `CC BY-SA ${v}`, licenseUrl: `https://creativecommons.org/licenses/by-sa/${v}/` });
const CC0 = { license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' };
const PD = { license: 'Public domain', licenseUrl: 'https://commons.wikimedia.org/wiki/Help:Public_domain' };
const commons = (file) => `https://commons.wikimedia.org/wiki/File:${file}`;

export const propertyImageSet = {
  apt1: {
    url: `${W}/a/af/Chung_cu_Hoang_anh_gia_lai%2C_tan_quy%2C_quan_7%2C_tp_Ho_Chi_Minh%2C_Vietnam_-_panoramio.jpg/960px-Chung_cu_Hoang_anh_gia_lai%2C_tan_quy%2C_quan_7%2C_tp_Ho_Chi_Minh%2C_Vietnam_-_panoramio.jpg`,
    alt: 'Chung cư tại Quận 7, TP. Hồ Chí Minh',
    author: 'trungydang', ...BY('3.0'),
    sourceUrl: commons('Chung_cu_Hoang_anh_gia_lai,_tan_quy,_quan_7,_tp_Ho_Chi_Minh,_Vietnam_-_panoramio.jpg'),
  },
  apt2: {
    url: `${W}/0/07/The_Manor_Ho_Chi_Minh_-_panoramio.jpg/960px-The_Manor_Ho_Chi_Minh_-_panoramio.jpg`,
    alt: 'Tòa căn hộ cao tầng tại TP. Hồ Chí Minh',
    author: 'Đặng Quốc Bửu', ...BY('3.0'),
    sourceUrl: commons('The_Manor_Ho_Chi_Minh_-_panoramio.jpg'),
  },
  apt3: {
    url: `${W}/8/8f/Chung_cu_Cappitaland_Vista-_An_phu%2C_q2%2C_tp_Ho_Chi_Minh%2C_vn_-_panoramio.jpg/960px-Chung_cu_Cappitaland_Vista-_An_phu%2C_q2%2C_tp_Ho_Chi_Minh%2C_vn_-_panoramio.jpg`,
    alt: 'Chung cư tại An Phú, TP. Thủ Đức',
    author: 'trungydang', ...BY('3.0'),
    sourceUrl: commons('Chung_cu_Cappitaland_Vista-_An_phu,_q2,_tp_Ho_Chi_Minh,_vn_-_panoramio.jpg'),
  },
  room1: {
    url: `${W}/4/49/Modern_living_room_with_stylish_furniture_and_a_view_of_the_outdoors_in_a_cozy_apartment_setting.jpg/960px-Modern_living_room_with_stylish_furniture_and_a_view_of_the_outdoors_in_a_cozy_apartment_setting.jpg`,
    alt: 'Phòng khách căn hộ có nội thất',
    author: 'Shixart1985', ...BY('2.0'),
    sourceUrl: commons('Modern_living_room_with_stylish_furniture_and_a_view_of_the_outdoors_in_a_cozy_apartment_setting.jpg'),
  },
  room2: {
    url: `${W}/e/ed/The_living_room_that_needs_houseplants.jpg/960px-The_living_room_that_needs_houseplants.jpg`,
    alt: 'Phòng khách căn hộ',
    author: 'Lo', ...CC0,
    sourceUrl: commons('The_living_room_that_needs_houseplants.jpg'),
  },
  house1: {
    url: `${W}/9/9d/Dalat_House%2C_34_Nguyen_Du_Street%2C_Da_Lat.JPG/960px-Dalat_House%2C_34_Nguyen_Du_Street%2C_Da_Lat.JPG`,
    alt: 'Nhà riêng tại Đà Lạt',
    author: 'Diane Selwyn', ...PD,
    sourceUrl: commons('Dalat_House,_34_Nguyen_Du_Street,_Da_Lat.JPG'),
  },
  house2: {
    url: `${W}/e/e8/Moon_House%2C_16_Hung_Vuong_Street%2C_Da_Lat_01.JPG/960px-Moon_House%2C_16_Hung_Vuong_Street%2C_Da_Lat_01.JPG`,
    alt: 'Nhà riêng có sân vườn',
    author: 'Diane Selwyn', ...PD,
    sourceUrl: commons('Moon_House,_16_Hung_Vuong_Street,_Da_Lat_01.JPG'),
  },
  villa1: {
    url: `${W}/3/30/Bach_Ngoc%2C_Tran_Le_Xuan_Villa_01.jpg/960px-Bach_Ngoc%2C_Tran_Le_Xuan_Villa_01.jpg`,
    alt: 'Biệt thự sân vườn',
    author: 'Diane Selwyn', ...BYSA('3.0'),
    sourceUrl: commons('Bach_Ngoc,_Tran_Le_Xuan_Villa_01.jpg'),
  },
  villa2: {
    url: `${W}/b/b8/Swimming_pool%2C_Tran_Le_Xuan_Villa_01.jpg/960px-Swimming_pool%2C_Tran_Le_Xuan_Villa_01.jpg`,
    alt: 'Hồ bơi trong khuôn viên biệt thự',
    author: 'Diane Selwyn', ...BYSA('3.0'),
    sourceUrl: commons('Swimming_pool,_Tran_Le_Xuan_Villa_01.jpg'),
  },
  shop1: {
    url: `${W}/4/47/Hoi_An_Shophouse_05.19_%282%29.jpg/960px-Hoi_An_Shophouse_05.19_%282%29.jpg`,
    alt: 'Nhà phố thương mại (shophouse)',
    author: 'Supanut Arunoprayote', ...BY('4.0'),
    sourceUrl: commons('Hoi_An_Shophouse_05.19_(2).jpg'),
  },
  shop2: {
    url: `${W}/7/76/Hoi_An_Shophouse_05.19_%285%29.jpg/960px-Hoi_An_Shophouse_05.19_%285%29.jpg`,
    alt: 'Nhà phố kinh doanh mặt tiền',
    author: 'Supanut Arunoprayote', ...BY('4.0'),
    sourceUrl: commons('Hoi_An_Shophouse_05.19_(5).jpg'),
  },
  land1: {
    url: `${W}/2/2b/Someone_is_really_serious_about_keeping_his_plot_of_land_empty..._%2819876170725%29.jpg/960px-Someone_is_really_serious_about_keeping_his_plot_of_land_empty..._%2819876170725%29.jpg`,
    alt: 'Lô đất trống',
    author: 'Yun Huang Yong', ...BY('2.0'),
    sourceUrl: commons('Someone_is_really_serious_about_keeping_his_plot_of_land_empty..._(19876170725).jpg'),
  },
  land2: {
    url: `${W}/a/a0/Empty_Land_near_Commonwealth_MRT_Station%2C_June_2026.jpg/960px-Empty_Land_near_Commonwealth_MRT_Station%2C_June_2026.jpg`,
    alt: 'Khu đất trống gần khu dân cư',
    author: 'GoAheadFan95', ...BYSA('4.0'),
    sourceUrl: commons('Empty_Land_near_Commonwealth_MRT_Station,_June_2026.jpg'),
  },
  office1: {
    url: `${W}/e/ec/Saigon_centre_np.jpg/960px-Saigon_centre_np.jpg`,
    alt: 'Cao ốc văn phòng trung tâm TP. Hồ Chí Minh',
    author: 'Nic saigon', ...BYSA('3.0'),
    sourceUrl: commons('Saigon_centre_np.jpg'),
  },
  office2: {
    url: `${W}/e/e2/Keangnam_Hanoi_Landmark_Tower_misty_02.jpg/960px-Keangnam_Hanoi_Landmark_Tower_misty_02.jpg`,
    alt: 'Tòa văn phòng cao tầng tại Hà Nội',
    author: 'Vuong Tri Binh', ...BYSA('4.0'),
    sourceUrl: commons('Keangnam_Hanoi_Landmark_Tower_misty_02.jpg'),
  },
  wh1: {
    url: `${W}/8/8b/Yen_Binh_Industrial_Park_SO.jpg/960px-Yen_Binh_Industrial_Park_SO.jpg`,
    alt: 'Nhà xưởng trong khu công nghiệp',
    author: 'Bacthai20', ...CC0,
    sourceUrl: commons('Yen_Binh_Industrial_Park_SO.jpg'),
  },
  wh2: {
    url: `${W}/b/b4/Yen_Binh_Industrial_Park_TS.jpg/960px-Yen_Binh_Industrial_Park_TS.jpg`,
    alt: 'Kho xưởng khu công nghiệp',
    author: 'Bacthai20', ...CC0,
    sourceUrl: commons('Yen_Binh_Industrial_Park_TS.jpg'),
  },
};

const s = propertyImageSet;
const byType = {
  Apartment: [s.apt1, s.apt2, s.apt3],
  RentalApartment: [s.room1, s.room2, s.apt3],
  House: [s.house1, s.house2],
  RentalHouse: [s.house2, s.house1],
  Villa: [s.villa1, s.villa2],
  Shophouse: [s.shop1, s.shop2],
  Land: [s.land1, s.land2],
  Office: [s.office1, s.office2],
  Warehouse: [s.wh1, s.wh2],
};
const fallback = [s.apt1, s.house1, s.villa1];

/** Ảnh minh họa cho một tin đăng theo loại BĐS; cùng một tin luôn ra cùng một ảnh. */
export function getPropertyImage(listing) {
  const list = byType[listing?.propertyType] || fallback;
  const seed = [...String(listing?.id || listing?.title || '')].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 9973, 7);
  return list[seed % list.length];
}
