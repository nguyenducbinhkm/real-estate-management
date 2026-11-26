import json
import os
import random
import re
import unicodedata
import uuid
from datetime import datetime, timedelta

import pandas as pd
from faker import Faker

# ==========================================
# CẤU HÌNH ĐƯỜNG DẪN & SỐ LƯỢNG DỮ LIỆU
# ==========================================
VN_UNITS_PATH = "vn_only_simplified_json_generated_data_vn_units_minified.json"
HOUSING_CSV_PATH = "vietnam_housing_dataset.csv"
IMAGES_TXT_PATH = "images.txt"
OUTPUT_SQL_PATH = "seed_data_pg.sql"
NUM_USERS = 60
MAX_PROPERTIES = 300
NUM_SAVED = 150
NUM_ALERTS = 60
NUM_CONTACTS = 120
NUM_REPORTS = 40
NUM_PAYMENTS = 100
NUM_NOTIFICATIONS = 180

fake = Faker("vi_VN")
random.seed(42)
Faker.seed(42)


# ==========================================
# HÀM TIỆN ÍCH CHUẨN POSTGRESQL
# ==========================================
def strip_accents(text: str) -> str:
    if not text:
        return ""
    text = text.replace("đ", "d").replace("Đ", "D")
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower().strip()


def pg_val(v):
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, datetime):
        return f"'{v.strftime('%Y-%m-%d %H:%M:%S')}'"
    s = str(v).replace("'", "''")
    return f"'{s}'"


def write_inserts_pg(f, table, columns, rows, chunk_size=500):
    """Xuất multi-row INSERT chuẩn PostgreSQL để chạy cực nhanh."""
    if not rows:
        return
    f.write(f'\n-- ==================== {table} ({len(rows)} rows) ====================\n')
    col_str = ", ".join(f'"{c}"' for c in columns)
    for i in range(0, len(rows), chunk_size):
        chunk = rows[i : i + chunk_size]
        values_block = ",\n".join(f"({', '.join(r)})" for r in chunk)
        f.write(f'INSERT INTO "{table}" ({col_str}) VALUES\n{values_block};\n')


def clean_num(val, default=None):
    if pd.isna(val):
        return default
    try:
        return float(str(val).replace(",", "").strip())
    except ValueError:
        return default


# ==========================================
# 1. ĐỌC ĐỊA GIỚI HÀNH CHÍNH
# ==========================================
print("1. Đang đọc dữ liệu địa giới hành chính...")
with open(VN_UNITS_PATH, "r", encoding="utf-8") as fp:
    vn_data = json.load(fp)

provinces_rows, districts_rows, wards_rows = [], [], []
province_ids, district_ids, ward_ids = [], [], []

ward_lookup = {}
dist_wards_map = {}
prov_wards_map = {}

for p in vn_data:
    p_id = str(uuid.uuid4())
    p_code = str(p.get("Code") or p.get("code") or "")
    p_name = p.get("FullName") or p.get("Name") or p.get("name") or ""
    p_short = strip_accents(re.sub(r"^(thành phố|tỉnh)\s+", "", p_name, flags=re.I))

    province_ids.append(p_id)
    prov_wards_map[p_short] = []
    provinces_rows.append([pg_val(p_id), pg_val(p_code), pg_val(p_name)])

    districts = p.get("District") or p.get("Districts") or p.get("districts") or []
    for d in districts:
        d_id = str(uuid.uuid4())
        d_code = str(d.get("Code") or d.get("code") or "")
        d_name = d.get("FullName") or d.get("Name") or d.get("name") or ""
        d_short = strip_accents(re.sub(r"^(quận|huyện|thị xã|thành phố)\s+", "", d_name, flags=re.I))

        district_ids.append(d_id)
        dist_wards_map[(p_short, d_short)] = []
        districts_rows.append([pg_val(d_id), pg_val(p_id), pg_val(d_code), pg_val(d_name)])

        wards = d.get("Ward") or d.get("Wards") or d.get("wards") or []
        for w in wards:
            w_id = str(uuid.uuid4())
            w_code = str(w.get("Code") or w.get("code") or "")
            w_name = w.get("FullName") or w.get("Name") or w.get("name") or ""
            w_short = strip_accents(re.sub(r"^(phường|xã|thị trấn)\s+", "", w_name, flags=re.I))

            ward_ids.append(w_id)
            ward_lookup[(p_short, d_short, w_short)] = w_id
            dist_wards_map[(p_short, d_short)].append(w_id)
            prov_wards_map[p_short].append(w_id)
            wards_rows.append([pg_val(w_id), pg_val(d_id), pg_val(w_code), pg_val(w_name)])


def match_ward_id(address_str: str) -> str:
    norm = strip_accents(str(address_str))
    norm = norm.replace("tp.hcm", "ho chi minh").replace("hcm", "ho chi minh")
    parts = [x.strip() for x in norm.split(",") if x.strip()]

    matched_prov = next((pk for pk in prov_wards_map if pk and pk in norm), None)
    if matched_prov:
        for (pk, dk), w_list in dist_wards_map.items():
            if pk == matched_prov and dk and dk in norm and w_list:
                for part in parts:
                    w_clean = re.sub(r"^(phuong|xa|thi tran)\s+", "", part).strip()
                    if (pk, dk, w_clean) in ward_lookup:
                        return ward_lookup[(pk, dk, w_clean)]
                return random.choice(w_list)
        if prov_wards_map[matched_prov]:
            return random.choice(prov_wards_map[matched_prov])
    return random.choice(ward_ids)


# ==========================================
# 2. SINH USERS & REFRESH TOKENS
# ==========================================
print("2. Đang sinh dữ liệu Users và RefreshTokens...")
users_rows, refresh_tokens_rows = [], []
buyers, sellers_agents, admins = [], [], []
now = datetime.now()
DEMO_HASH = "$2a$11$KIXQ4v9Z8b9m8F6Z7k9l0u7Q2r1t5y8u9i0o1p2a3s4d5f6g7h8j9"

role_weights = ["Buyer"] * 25 + ["Seller"] * 18 + ["Agent"] * 13 + ["Admin"] * 4
used_emails = set()

for i in range(NUM_USERS):
    u_id = str(uuid.uuid4())
    role = role_weights[i % len(role_weights)]
    full_name = fake.name()
    email = f"{strip_accents(full_name).replace(' ', '.')}.{i+1}@realestatehub.vn"
    while email in used_emails:
        email = f"user{i}_{random.randint(100,999)}@realestatehub.vn"
    used_emails.add(email)

    phone = f"09{random.randint(10000000, 99999999)}"
    is_verified = True if role in ("Agent", "Admin") else random.choice([True, False])
    sub_pkg = random.choice(["Free", "VipSilver", "VipGold", "VipDiamond"]) if role in ("Seller", "Agent") else None
    agent_lic = f"MGBDS-{random.randint(10000, 99999)}" if role == "Agent" else None
    agency = random.choice(["CenLand", "Đất Xanh", "Vinhomes Sales", "OneHousing", "Savills VN"]) if role == "Agent" else None
    rating = round(random.uniform(3.8, 5.0), 2) if role == "Agent" else None
    total_tx = random.randint(2, 85) if role == "Agent" else None
    admin_lvl = random.choice([1, 2]) if role == "Admin" else None
    created = now - timedelta(days=random.randint(30, 365))

    if role == "Buyer":
        buyers.append(u_id)
    elif role in ("Seller", "Agent"):
        sellers_agents.append(u_id)
    else:
        admins.append(u_id)

    users_rows.append([
        pg_val(u_id), pg_val(email), pg_val(phone), pg_val(full_name), pg_val(DEMO_HASH),
        pg_val(f"https://i.pravatar.cc/150?u={i+1}"), pg_val(is_verified), pg_val(role),
        pg_val(sub_pkg), pg_val(agent_lic), pg_val(agency), pg_val(rating),
        pg_val(total_tx), pg_val(admin_lvl), pg_val(created), pg_val(created)
    ])

    for _ in range(random.randint(1, 2)):
        rt_id = str(uuid.uuid4())
        tok = uuid.uuid4().hex + uuid.uuid4().hex
        exp = now + timedelta(days=random.randint(7, 30))
        rev = (now - timedelta(days=random.randint(1, 5))) if random.random() < 0.2 else None
        refresh_tokens_rows.append([pg_val(rt_id), pg_val(u_id), pg_val(tok), pg_val(exp), pg_val(rev)])

all_users = buyers + sellers_agents + admins


# ==========================================
# 3. TẠO PROJECTS & PROJECT PHASES
# ==========================================
print("3. Đang tạo dữ liệu Projects và ProjectPhases...")
sample_projects = [
    ("Vinhomes Smart City", "Vingroup", "Đại lộ Thăng Long", "ha noi", "nam tu liem", 280.0, 2.5e9, 7.5e9),
    ("Vinhomes Ocean Park", "Vingroup", "Đường Lý Thánh Tông", "ha noi", "gia lam", 420.0, 2.2e9, 15.0e9),
    ("Ecopark Grand The Island", "Tập đoàn Ecopark", "KĐT Ecopark", "hung yen", "van giang", 500.0, 3.0e9, 25.0e9),
    ("Vinhomes Grand Park", "Vingroup", "Nguyễn Xiển", "ho chi minh", "thu duc", 271.0, 2.8e9, 18.0e9),
    ("Masteri West Heights", "Masterise Homes", "Tây Mỗ", "ha noi", "nam tu liem", 3.1, 3.2e9, 6.8e9),
    ("The Global City", "Masterise Homes", "Đỗ Xuân Hợp", "ho chi minh", "thu duc", 117.4, 8.0e9, 45.0e9),
    ("Sun Grand City Ancora", "Sun Group", "Số 3 Lương Yên", "ha noi", "hai ba trung", 2.2, 4.5e9, 12.0e9),
    ("Ciputra Hanoi", "Ciputra Group", "Phạm Văn Đồng", "ha noi", "bac tu liem", 301.0, 6.0e9, 40.0e9),
    ("Mizuki Park", "Nam Long Group", "Nguyễn Văn Linh", "ho chi minh", "binh chanh", 26.0, 2.9e9, 9.5e9),
    ("Aqua City", "Novaland", "Hương Lộ 2", "dong nai", "bien hoa", 1000.0, 5.5e9, 22.0e9),
]

projects_rows, phases_rows, project_ids = [], [], []

for name, dev, street, p_key, d_key, area, min_p, max_p in sample_projects:
    pr_id = str(uuid.uuid4())
    project_ids.append(pr_id)
    w_id = match_ward_id(f"{street}, {d_key}, {p_key}")
    launch = now - timedelta(days=random.randint(180, 900))
    handover = launch + timedelta(days=random.randint(365, 1000))
    created = launch - timedelta(days=30)

    projects_rows.append([
        pg_val(pr_id), pg_val(w_id), pg_val(name), pg_val(dev),
        pg_val(f"Dự án {name} do {dev} phát triển với hệ thống tiện ích đồng bộ chuẩn quốc tế."),
        pg_val(street), pg_val(random.choice(["Selling", "Upcoming", "HandedOver"])),
        pg_val(min_p), pg_val("VND"), pg_val(max_p), pg_val("VND"),
        pg_val(area), pg_val(launch), pg_val(handover),
        pg_val(random.choice([True, False])), pg_val(created), pg_val(now)
    ])

    for order in range(1, random.randint(2, 4) + 1):
        phases_rows.append([
            pg_val(str(uuid.uuid4())), pg_val(pr_id),
            pg_val(f"Phân khu {order} - {name}"),
            pg_val(f"Giai đoạn mở bán thứ {order} với chính sách ưu đãi lãi suất."),
            pg_val(round(min_p * (1 + 0.1 * (order - 1)), 2)),
            pg_val(order)
        ])


# ==========================================
# 4. ĐỌC CSV KAGGLE -> PROPERTIES & PROPERTY IMAGES
# ==========================================
print("4. Đang đọc CSV bất động sản và tạo Properties + PropertyImages...")
if os.path.exists(IMAGES_TXT_PATH):
    with open(IMAGES_TXT_PATH, "r", encoding="utf-8") as f_img:
        image_pool = [line.strip() for line in f_img if line.strip().startswith("http")]
else:
    image_pool = []

if len(image_pool) < 5:
    image_pool = [f"https://picsum.photos/seed/bds{i}/800/600" for i in range(1, 26)]

df = pd.read_csv(HOUSING_CSV_PATH)
df = df.dropna(subset=["Address", "Area", "Price"]).head(MAX_PROPERTIES)

properties_rows, images_rows, property_ids = [], [], []
property_owner_map = {}

prop_types = ["Apartment", "House", "Villa", "Shophouse", "Land", "RentalApartment", "RentalHouse", "Office", "Warehouse"]
packages = ["Free", "VipSilver", "VipGold", "VipDiamond"]
statuses = ["Active", "Active", "Active", "Pending", "Sold", "Expired"]

for _, row in df.iterrows():
    prop_id = str(uuid.uuid4())
    owner_id = random.choice(sellers_agents)
    proj_id = random.choice(project_ids) if random.random() < 0.35 else None
    addr = str(row.get("Address", ""))
    w_id = match_ward_id(addr)
    street = addr.split(",")[0].strip()[:240] if addr else None

    raw_price = clean_num(row.get("Price"), 3.5)
    price_vnd = round(raw_price * 1_000_000_000, 2) if raw_price < 1000 else round(raw_price, 2)
    area = clean_num(row.get("Area"), 60.0)
    bedrooms = int(clean_num(row.get("Bedrooms"), random.randint(1, 5)))
    bathrooms = int(clean_num(row.get("Bathrooms"), random.randint(1, 4)))
    floors = int(clean_num(row.get("Floors"), random.randint(1, 5)))
    legal = str(row.get("Legal status")) if pd.notna(row.get("Legal status")) else "Sổ đỏ/Sổ hồng"
    furniture = str(row.get("Furniture state")) if pd.notna(row.get("Furniture state")) else "Cơ bản"

    p_type = random.choice(prop_types)
    pkg = random.choice(packages)
    boost = {"Free": 0, "VipSilver": 10, "VipGold": 30, "VipDiamond": 100}[pkg]
    is_featured = pkg in ("VipGold", "VipDiamond")
    status = random.choice(statuses)
    created = now - timedelta(days=random.randint(1, 90))
    expires = created + timedelta(days=30)

    title = f"Bán {p_type} {int(area)}m² - {bedrooms}PN tại {street or 'trung tâm'}"[:245]
    desc = f"Bất động sản vị trí đẹp tại {addr}. Diện tích {area}m², {floors} tầng, {bedrooms} phòng ngủ, {bathrooms} WC. Pháp lý: {legal}. Nội thất: {furniture}."

    property_ids.append(prop_id)
    property_owner_map[prop_id] = owner_id

    properties_rows.append([
        pg_val(prop_id), pg_val(owner_id), pg_val(proj_id), pg_val(w_id),
        pg_val(p_type), pg_val(title), pg_val(desc),
        pg_val(price_vnd), pg_val(area), pg_val(street),
        pg_val(status), pg_val(pkg), pg_val(boost), pg_val(is_featured),
        pg_val(bedrooms), pg_val(bathrooms), pg_val(floors), pg_val(legal), pg_val(furniture),
        pg_val(created), pg_val(created), pg_val(expires)
    ])

    chosen_imgs = random.sample(image_pool, k=min(random.randint(3, 5), len(image_pool)))
    for sort_order, img_url in enumerate(chosen_imgs):
        images_rows.append([
            pg_val(str(uuid.uuid4())), pg_val(prop_id),
            pg_val(img_url), pg_val(f"Ảnh thực tế #{sort_order + 1}"), pg_val(sort_order)
        ])


# ==========================================
# 5. SINH 6 BẢNG NGHIỆP VỤ CÒN LẠI
# ==========================================
print("5. Đang sinh dữ liệu cho 6 bảng nghiệp vụ...")

saved_rows, saved_pairs = [], set()
while len(saved_rows) < NUM_SAVED:
    b_id = random.choice(buyers)
    p_id = random.choice(property_ids)
    if (b_id, p_id) not in saved_pairs:
        saved_pairs.add((b_id, p_id))
        saved_rows.append([
            pg_val(str(uuid.uuid4())), pg_val(b_id),
            pg_val(p_id), pg_val(now - timedelta(days=random.randint(0, 45)))
        ])

alerts_rows = []
for _ in range(NUM_ALERTS):
    b_id = random.choice(buyers)
    p_id = random.choice(province_ids)
    d_id = random.choice(district_ids) if random.random() < 0.7 else None
    w_id = random.choice(ward_ids) if (d_id and random.random() < 0.4) else None
    min_p = random.choice([1e9, 2e9, 3e9, 5e9])
    alerts_rows.append([
        pg_val(str(uuid.uuid4())), pg_val(b_id),
        pg_val(p_id), pg_val(d_id), pg_val(w_id),
        pg_val(random.choice(["chung cư", "nhà phố", "biệt thự", "đất nền", None])),
        pg_val(min_p), pg_val(min_p + random.choice([2e9, 4e9, 8e9])),
        pg_val(random.choice(["Instant", "Daily", "Weekly"])),
        pg_val(random.choice([True, True, False]))
    ])

contacts_rows = []
for _ in range(NUM_CONTACTS):
    is_prop = random.random() < 0.75
    p_id = random.choice(property_ids) if is_prop else None
    pr_id = None if is_prop else random.choice(project_ids)
    sender_id = random.choice(buyers) if random.random() < 0.7 else None
    receiver_id = property_owner_map[p_id] if p_id else random.choice(sellers_agents)
    contacts_rows.append([
        pg_val(str(uuid.uuid4())), pg_val(p_id), pg_val(pr_id),
        pg_val(sender_id), pg_val(receiver_id),
        pg_val(fake.name()), pg_val(f"09{random.randint(10000000, 99999999)}"),
        pg_val(fake.email()),
        pg_val("Tôi quan tâm bất động sản này, vui lòng liên hệ lại để hẹn lịch xem nhà."),
        pg_val(random.choice(["New", "Contacted", "Closed"])),
        pg_val(now - timedelta(days=random.randint(0, 30)))
    ])

reports_rows = []
reasons = ["Sai giá bán thực tế", "Ảnh không đúng thực tế", "Bất động sản đã bán", "Nghi ngờ lừa đảo", "Trùng lặp tin đăng"]
for _ in range(NUM_REPORTS):
    st = random.choice(["Pending", "Resolved", "Dismissed"])
    rev_id = random.choice(admins) if st != "Pending" else None
    reports_rows.append([
        pg_val(str(uuid.uuid4())), pg_val(random.choice(property_ids)),
        pg_val(random.choice(buyers)), pg_val(rev_id),
        pg_val(random.choice(reasons)),
        pg_val("Người dùng phản ánh thông tin tin đăng chưa chính xác, đề nghị quản trị viên kiểm tra."),
        pg_val(st), pg_val(now - timedelta(days=random.randint(0, 40)))
    ])

payments_rows = []
tx_prices = {"VipSilver": 200000, "VipGold": 500000, "VipDiamond": 1200000}
for i in range(NUM_PAYMENTS):
    tx_type = random.choice(["PostVip", "UpgradeVip", "BoostListing", "Subscription"])
    pkg = random.choice(["VipSilver", "VipGold", "VipDiamond"])
    p_id = random.choice(property_ids) if tx_type != "Subscription" else None
    u_id = property_owner_map[p_id] if p_id else random.choice(sellers_agents)
    payments_rows.append([
        pg_val(str(uuid.uuid4())), pg_val(u_id), pg_val(p_id),
        pg_val(tx_type), pg_val(pkg), pg_val(tx_prices[pkg]),
        pg_val(random.choice(["VNPay", "MoMo", "BankTransfer"])),
        pg_val(f"TXN{now.strftime('%Y%m%d')}{i+10000}"),
        pg_val(random.choice(["Success", "Success", "Success", "Pending", "Failed"])),
        pg_val(now - timedelta(days=random.randint(0, 60)))
    ])

notifs_rows = []
notif_templates = [
    ("ListingApproved", "Tin đăng đã được duyệt", "Tin đăng của bạn đã hiển thị công khai trên hệ thống."),
    ("NewContact", "Bạn có yêu cầu liên hệ mới", "Có khách hàng vừa để lại thông tin hẹn xem nhà."),
    ("SearchAlertMatch", "Có bất động sản mới phù hợp", "Hệ thống tìm thấy tin đăng mới khớp với bộ lọc của bạn."),
    ("PaymentSuccess", "Thanh toán thành công", "Gói VIP/đẩy tin của bạn đã được kích hoạt."),
    ("ReportResolved", "Đã xử lý báo cáo", "Quản trị viên đã hoàn tất kiểm tra báo cáo của bạn."),
]
for _ in range(NUM_NOTIFICATIONS):
    n_type, title, msg = random.choice(notif_templates)
    notifs_rows.append([
        pg_val(str(uuid.uuid4())), pg_val(random.choice(all_users)),
        pg_val(title), pg_val(msg), pg_val(n_type),
        pg_val(random.choice(property_ids)),
        pg_val(random.choice([True, False])),
        pg_val(now - timedelta(days=random.randint(0, 30)))
    ])


# ==========================================
# 6. XUẤT FILE SQL CHUẨN POSTGRESQL
# ==========================================
print(f"6. Đang xuất file {OUTPUT_SQL_PATH}...")
with open(OUTPUT_SQL_PATH, "w", encoding="utf-8") as f:
    f.write("BEGIN;\n")

    # Tầng 1
    write_inserts_pg(f, "Provinces", ["ProvinceId", "ProvinceCode", "ProvinceName"], provinces_rows)
    write_inserts_pg(f, "Users", [
        "UserId", "Email", "Phone", "FullName", "PasswordHash", "AvatarUrl",
        "IsVerified", "UserRole", "SubscriptionPackage", "AgentLicense",
        "AgencyName", "Rating", "TotalTransactions", "AdminLevel", "CreatedAt", "UpdatedAt"
    ], users_rows)

    # Tầng 2
    write_inserts_pg(f, "Districts", ["DistrictId", "ProvinceId", "DistrictCode", "DistrictName"], districts_rows)
    write_inserts_pg(f, "RefreshTokens", ["RefreshTokenId", "UserId", "Token", "ExpiresAt", "RevokedAt"], refresh_tokens_rows)

    # Tầng 3
    write_inserts_pg(f, "Wards", ["WardId", "DistrictId", "WardCode", "WardName"], wards_rows)

    # Tầng 4
    write_inserts_pg(f, "Projects", [
        "ProjectId", "WardId", "Name", "Developer", "Description", "StreetAddress",
        "Status", "MinPrice_Amount", "MinPrice_Currency", "MaxPrice_Amount", "MaxPrice_Currency",
        "TotalArea", "LaunchDate", "HandoverDate", "IsFeatured", "CreatedAt", "UpdatedAt"
    ], projects_rows)
    write_inserts_pg(f, "SearchAlerts", [
        "SearchAlertId", "BuyerId", "ProvinceId", "DistrictId", "WardId",
        "Keyword", "MinPrice", "MaxPrice", "Frequency", "IsActive"
    ], alerts_rows)

    # Tầng 5
    write_inserts_pg(f, "ProjectPhases", [
        "ProjectPhaseId", "ProjectId", "Name", "Description", "StartingPrice", "SortOrder"
    ], phases_rows)
    write_inserts_pg(f, "Properties", [
        "PropertyId", "OwnerId", "ProjectId", "WardId", "PropertyType", "Title", "Description",
        "Price", "Area", "StreetAddress", "Status", "PackageType", "BoostScore", "IsFeatured",
        "Bedrooms", "Bathrooms", "Floors", "LegalStatus", "FurnitureState",
        "CreatedAt", "UpdatedAt", "ExpiresAt"
    ], properties_rows)

    # Tầng 6
    write_inserts_pg(f, "PropertyImages", ["PropertyImageId", "PropertyId", "Url", "Caption", "SortOrder"], images_rows)
    write_inserts_pg(f, "SavedListings", ["SavedListingId", "BuyerId", "PropertyId", "SavedAt"], saved_rows)
    write_inserts_pg(f, "ContactRequests", [
        "ContactRequestId", "PropertyId", "ProjectId", "SenderId", "ReceiverId",
        "SenderName", "SenderPhone", "SenderEmail", "Message", "Status", "CreatedAt"
    ], contacts_rows)
    write_inserts_pg(f, "ListingReports", [
        "ListingReportId", "PropertyId", "ReporterId", "ReviewedById",
        "Reason", "Details", "Status", "CreatedAt"
    ], reports_rows)
    write_inserts_pg(f, "PaymentTransactions", [
        "PaymentTransactionId", "UserId", "PropertyId", "TransactionType", "PackageType",
        "Amount", "PaymentMethod", "TransactionRef", "Status", "CreatedAt"
    ], payments_rows)
    write_inserts_pg(f, "Notifications", [
        "NotificationId", "UserId", "Title", "Message", "Type", "ReferenceId", "IsRead", "CreatedAt"
    ], notifs_rows)

    f.write("\nCOMMIT;\n")

print("Hoàn tất! Đã tạo file:", OUTPUT_SQL_PATH)