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

  /* ---- Ảnh nội thất / nhiều góc cho thư viện ảnh ở trang chi tiết tin ---- */
  bed1: {
    url: `${W}/e/e3/Modern_bedroom_design_in_a_stylish_hotel_room_featuring_geometric_patterns_and_soft_linens.jpg/960px-Modern_bedroom_design_in_a_stylish_hotel_room_featuring_geometric_patterns_and_soft_linens.jpg`,
    alt: 'Phòng ngủ thiết kế hiện đại',
    author: 'Shixart1985', ...BY('2.0'),
    sourceUrl: commons('Modern_bedroom_design_in_a_stylish_hotel_room_featuring_geometric_patterns_and_soft_linens.jpg'),
  },
  bed2: {
    url: `${W}/5/5d/Cozy_bedroom_with_two_beds_window_and_wall_art_in_a_simple_setting.jpg/960px-Cozy_bedroom_with_two_beds_window_and_wall_art_in_a_simple_setting.jpg`,
    alt: 'Phòng ngủ hai giường sáng sủa',
    author: 'Shixart1985', ...BY('2.0'),
    sourceUrl: commons('Cozy_bedroom_with_two_beds_window_and_wall_art_in_a_simple_setting.jpg'),
  },
  bed3: {
    url: `${W}/2/29/NY_loft_bedroom_%28Unsplash%29.jpg/960px-NY_loft_bedroom_%28Unsplash%29.jpg`,
    alt: 'Phòng ngủ kiêm góc làm việc',
    author: 'Gabriel Beaudry', ...CC0,
    sourceUrl: commons('NY_loft_bedroom_(Unsplash).jpg'),
  },
  bed4: {
    url: `${W}/2/28/Hotel_bedroom_windows_%28Unsplash%29.jpg/960px-Hotel_bedroom_windows_%28Unsplash%29.jpg`,
    alt: 'Phòng ngủ có cửa sổ lớn',
    author: 'Markus Spiske', ...CC0,
    sourceUrl: commons('Hotel_bedroom_windows_(Unsplash).jpg'),
  },
  kitchen1: {
    url: `${W}/f/f5/Modern_kitchen_and_dining_area_with_stylish_furnishings_and_natural_light_in_a_contemporary_home_setting.jpg/960px-Modern_kitchen_and_dining_area_with_stylish_furnishings_and_natural_light_in_a_contemporary_home_setting.jpg`,
    alt: 'Bếp và phòng ăn hiện đại',
    author: 'Shixart1985', ...BY('2.0'),
    sourceUrl: commons('Modern_kitchen_and_dining_area_with_stylish_furnishings_and_natural_light_in_a_contemporary_home_setting.jpg'),
  },
  bath1: {
    url: `${W}/7/7d/Bathroom_of_Khan_Pool_Suite_in_Amantaka_luxury_Resort_%26_Hotel_in_Luang_Prabang_Laos.jpg/960px-Bathroom_of_Khan_Pool_Suite_in_Amantaka_luxury_Resort_%26_Hotel_in_Luang_Prabang_Laos.jpg`,
    alt: 'Phòng tắm hai bồn rửa',
    author: 'Basile Morin', ...BYSA('4.0'),
    sourceUrl: commons('Bathroom_of_Khan_Pool_Suite_in_Amantaka_luxury_Resort_&_Hotel_in_Luang_Prabang_Laos.jpg'),
  },
  bath2: {
    url: `${W}/1/1a/Red_modern_bathroom_interior._%2851528276166%29.jpg/960px-Red_modern_bathroom_interior._%2851528276166%29.jpg`,
    alt: 'Phòng tắm hiện đại có vách kính',
    author: 'Nenad Stojkovic', ...BY('2.0'),
    sourceUrl: commons('Red_modern_bathroom_interior._(51528276166).jpg'),
  },
  officeIn1: {
    url: `${W}/6/60/Clean_minimalist_office_%28Unsplash%29.jpg/960px-Clean_minimalist_office_%28Unsplash%29.jpg`,
    alt: 'Không gian làm việc tối giản',
    author: 'Roman Bozhko', ...CC0,
    sourceUrl: commons('Clean_minimalist_office_(Unsplash).jpg'),
  },
  officeIn2: {
    url: `${W}/4/46/Office_rest_area_%28Unsplash%29.jpg/960px-Office_rest_area_%28Unsplash%29.jpg`,
    alt: 'Khu tiếp khách, nghỉ ngơi trong văn phòng',
    author: 'Breather', ...CC0,
    sourceUrl: commons('Office_rest_area_(Unsplash).jpg'),
  },
  meeting: {
    url: `${W}/d/da/Chairs_in_a_meeting_room_%28Unsplash%29.jpg/960px-Chairs_in_a_meeting_room_%28Unsplash%29.jpg`,
    alt: 'Phòng họp',
    author: 'Breather', ...CC0,
    sourceUrl: commons('Chairs_in_a_meeting_room_(Unsplash).jpg'),
  },
  officeNight: {
    url: `${W}/c/c1/City_office_lights_%28Unsplash%29.jpg/960px-City_office_lights_%28Unsplash%29.jpg`,
    alt: 'Tòa văn phòng về đêm',
    author: 'Vladimir Kudinov', ...CC0,
    sourceUrl: commons('City_office_lights_(Unsplash).jpg'),
  },
  whHall: {
    url: `${W}/b/bd/ChickletsFactoryNOLAMainHallEmpty2010.JPG/960px-ChickletsFactoryNOLAMainHallEmpty2010.JPG`,
    alt: 'Bên trong nhà xưởng trống',
    author: 'Infrogmation of New Orleans', ...BYSA('3.0'),
    sourceUrl: commons('ChickletsFactoryNOLAMainHallEmpty2010.JPG'),
  },
  whDock: {
    url: `${W}/4/4e/DFC_5396_Night_shift_at_the_loading_bay_delivery_trucks_parked_inside_a_dimly_lit_warehouse_in_Pattaya.jpg/960px-DFC_5396_Night_shift_at_the_loading_bay_delivery_trucks_parked_inside_a_dimly_lit_warehouse_in_Pattaya.jpg`,
    alt: 'Khu bốc dỡ hàng trong kho',
    author: 'PattayaPatrol', ...BYSA('4.0'),
    sourceUrl: commons('DFC_5396_Night_shift_at_the_loading_bay_delivery_trucks_parked_inside_a_dimly_lit_warehouse_in_Pattaya.jpg'),
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

import { mediaUrl } from '../services/api';

/** Ảnh thật người đăng tải lên (lưu ở API: /uploads/listings/...), theo thứ tự; ảnh đầu là ảnh đại diện. */
export function getUploadedImages(listing) {
  return (listing?.images || [])
    .filter((image) => image.url?.startsWith('/uploads/'))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image, i) => ({ url: mediaUrl(image.url), alt: listing.title, label: image.caption || `Ảnh ${i + 1}`, uploaded: true }));
}

const seedOf = (listing) => [...String(listing?.id || listing?.title || '')].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 9973, 7);

/** Ảnh minh họa cho một tin đăng theo loại BĐS; cùng một tin luôn ra cùng một ảnh. */
export function getPropertyImage(listing) {
  const uploaded = getUploadedImages(listing);
  if (uploaded.length) return uploaded[0];
  const list = byType[listing?.propertyType] || fallback;
  return list[seedOf(listing) % list.length];
}

// Thư viện ảnh nhiều góc theo loại BĐS.
// - coverLabel: nhãn cho ảnh bìa (ảnh trên thẻ tin – chỉ 1 ảnh mặt ngoài, để không lẫn nhiều tòa nhà khác nhau);
// - angles: các góc còn lại [ảnh, nhãn], chủ yếu là nội thất.
const gallerySets = {
  Apartment: { coverLabel: 'Tòa nhà', angles: [[s.room1, 'Phòng khách'], [s.bed1, 'Phòng ngủ'], [s.kitchen1, 'Bếp & phòng ăn'], [s.bath1, 'Phòng tắm'], [s.bed3, 'Phòng ngủ 2']] },
  RentalApartment: { coverLabel: 'Phòng khách', angles: [[s.room1, 'Phòng khách'], [s.room2, 'Phòng khách'], [s.bed4, 'Phòng ngủ'], [s.kitchen1, 'Bếp & phòng ăn'], [s.bath2, 'Phòng tắm'], [s.bed3, 'Góc làm việc']] },
  House: { coverLabel: 'Mặt tiền', angles: [[s.room2, 'Phòng khách'], [s.bed2, 'Phòng ngủ'], [s.kitchen1, 'Bếp & phòng ăn'], [s.bath1, 'Phòng tắm']] },
  RentalHouse: { coverLabel: 'Mặt tiền', angles: [[s.room1, 'Phòng khách'], [s.bed2, 'Phòng ngủ'], [s.kitchen1, 'Bếp & phòng ăn'], [s.bath2, 'Phòng tắm']] },
  Villa: { coverLabel: 'Mặt tiền', angles: [[s.villa2, 'Hồ bơi'], [s.room1, 'Phòng khách'], [s.bed1, 'Phòng ngủ'], [s.kitchen1, 'Bếp & phòng ăn'], [s.bath1, 'Phòng tắm']] },
  Shophouse: { coverLabel: 'Mặt tiền', angles: [[s.room2, 'Phòng khách'], [s.bed2, 'Phòng ngủ'], [s.kitchen1, 'Bếp & phòng ăn'], [s.bath2, 'Phòng tắm']] },
  Land: { coverLabel: 'Toàn cảnh lô đất', angles: [[s.land1, 'Toàn cảnh lô đất'], [s.land2, 'Khu vực xung quanh']] },
  Office: { coverLabel: 'Tòa nhà', angles: [[s.officeIn1, 'Không gian làm việc'], [s.meeting, 'Phòng họp'], [s.officeIn2, 'Khu tiếp khách']] },
  Warehouse: { coverLabel: 'Toàn cảnh', angles: [[s.wh1, 'Toàn cảnh'], [s.wh2, 'Toàn cảnh'], [s.whHall, 'Bên trong xưởng'], [s.whDock, 'Khu bốc dỡ hàng']] },
};

/**
 * Thư viện ảnh minh họa nhiều góc cho trang chi tiết tin: ảnh đầu tiên trùng ảnh trên thẻ tin,
 * sau đó là các góc khác cùng loại BĐS (mỗi ảnh kèm `label` mô tả góc chụp). Không phải ảnh thật của căn đó.
 */
export function getPropertyGallery(listing) {
  const uploaded = getUploadedImages(listing);
  if (uploaded.length) return uploaded;
  const cover = getPropertyImage(listing);
  const set = gallerySets[listing?.propertyType] || { coverLabel: 'Ảnh minh họa', angles: [] };
  const seen = new Set([cover.url]);
  const rest = set.angles.filter(([image]) => !seen.has(image.url) && seen.add(image.url));
  return [{ ...cover, label: set.coverLabel }, ...rest.map(([image, label]) => ({ ...image, label }))];
}
