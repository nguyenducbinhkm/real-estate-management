// Sinh docs/test-matrix.md từ danh sách test thật của 4 bộ test.
// Chạy từ thư mục gốc repo:  node tests/generate-test-matrix.mjs
import fs from 'fs';
import { execSync } from 'child_process';

const out = 'docs/test-matrix.md';
const run = (cmd, cwd = '.') => execSync(cmd, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
const dotnetList = (project) => {
  const text = run(`dotnet test tests/${project} --list-tests --nologo`);
  const start = text.indexOf('The following Tests are available');
  return text.slice(start).split('\n').slice(1).map((s) => s.trim()).filter(Boolean);
};
const lists = {
  unit: dotnetList('RealEstateHub.UnitTests'),
  integration: dotnetList('RealEstateHub.IntegrationTests'),
  api: dotnetList('RealEstateHub.ApiTests'),
  frontend: JSON.parse(run('npx vitest list --json', 'frontend')),
};

// Phân hệ: TV1 = Tin đăng, tìm kiếm & kiểm duyệt; TV2 = Tài khoản, khách hàng & quản trị người dùng.
const TV1 = /ListingPosting|ListingContact|SearchAndFactory|ProjectService|DatabaseMapping|PublicSearch|Deleting|ListingWith|PostApprove|Locations|SeedData|BuyerCannotPost|InvalidListing|SellerQuota|FullFlow|ContactEndpoint|listingForm|ContactButtons|ImageUploader|SellerShell/;
const owner = (s) => (TV1.test(s) ? 'TV1' : 'TV2');

function technique(name) {
  const n = name.toLowerCase();
  if (/rolls?back|notsaved|atomic|commitsboth/.test(n)) return 'ACID / Rollback (tiêm lỗi)';
  if (/matches.*sql|handcount|đối chiếu/.test(n)) return 'Đối chiếu báo cáo với SQL tính tay';
  if (/fullflow|reaches|becomespublic|postapprove/.test(n)) return 'Luồng liên phân hệ (end-to-end)';
  if (/forbidden|unauthorized|401|403|cannot|admin.*(seller|open)|role|session|chỉ admin|người bán thấy|hash|redirect|chuyển hướng|chưa đăng nhập|requireslogin|untilsignedin|zalo/.test(n)) return 'Phân quyền / Bảo mật (RBAC)';
  if (/status|approve|reject|pending|expired|draft|takedown|state|edit|review|sold|rented|hết hạn/.test(n)) return 'Chuyển trạng thái (State)';
  if (/invalid|validator|validation|limit|quota|toomany|large|fake|non|short|bad|biên|sai|> 5|lớn hơn|trống|bắt buộc|requires|ngắn|<\s?\d/.test(n)) return 'Phân hoạch tương đương + giá trị biên (EP/BVA)';
  return 'Phân hoạch tương đương (EP)';
}

const short = (full) => full.replace(/^RealEstateHub\.(UnitTests|IntegrationTests|ApiTests)\./, '').replace(/\(.*$/, '');
const rows = [];
const add = (suite, prefix, items) => {
  const seen = new Set();
  for (const full of items) {
    const name = short(full);
    if (seen.has(name)) continue; // Theory: gộp các bộ dữ liệu của cùng 1 ca
    seen.add(name);
    rows.push({ id: `${prefix}-${String(seen.size).padStart(3, '0')}`, suite, name, owner: owner(name), tech: technique(name) });
  }
};
add('Unit', 'UT', lists.unit);
add('Integration', 'IT', lists.integration);
add('API', 'AT', lists.api);
add('Frontend', 'FT', lists.frontend.map((t) => `${t.file.split('/src/')[1]} › ${t.name}`));

const count = (pred) => rows.filter(pred).length;
const bySuite = (suite, who) => count((r) => r.suite === suite && (!who || r.owner === who));
const suites = [
  ['Unit', 'xUnit, Fake/Stub tự viết', 'không cần DB'],
  ['Integration', 'xUnit + PostgreSQL thật', 'DB test tự dựng từ `database/*.sql`'],
  ['API', 'xUnit + WebApplicationFactory', 'DB test tự dựng'],
  ['Frontend', 'Vitest + React Testing Library (jsdom)', 'không cần backend'],
];

let md = `# Ma trận ca kiểm thử – RealEstateHub

> Sinh tự động bằng \`node tests/generate-test-matrix.mjs\` từ danh sách test thật – chạy lại sau khi thêm/sửa test.
> **Phân hệ:** TV1 = Tin đăng, tìm kiếm & kiểm duyệt · TV2 = Tài khoản, khách hàng & quản trị người dùng.
> Cột *Kỹ thuật* được gán theo tên ca – nhóm nên rà lại và bổ sung mã yêu cầu/biểu mẫu tương ứng khi viết báo cáo.

## Tổng hợp

| Bộ test | Công cụ | Cần gì để chạy | Số ca | TV1 | TV2 |
|---|---|---|---:|---:|---:|
${suites.map(([s, tool, need]) => `| ${s} | ${tool} | ${need} | ${bySuite(s)} | ${bySuite(s, 'TV1')} | ${bySuite(s, 'TV2')} |`).join('\n')}
| **Tổng** | | | **${rows.length}** | **${count((r) => r.owner === 'TV1')}** | **${count((r) => r.owner === 'TV2')}** |

(Số ca đếm theo tên; một ca \`[Theory]\` có thể chạy với nhiều bộ dữ liệu.)

## Theo kỹ thuật kiểm thử

| Kỹ thuật | Số ca |
|---|---:|
${[...new Set(rows.map((r) => r.tech))].sort().map((t) => `| ${t} | ${count((r) => r.tech === t)} |`).join('\n')}
`;
for (const [suite] of suites) {
  md += `\n## ${suite} test\n\n| Mã TC | Ca kiểm thử | Kỹ thuật | Phụ trách |\n|---|---|---|---|\n`;
  md += rows.filter((r) => r.suite === suite).map((r) => `| ${r.id} | \`${r.name}\` | ${r.tech} | ${r.owner} |`).join('\n') + '\n';
}
fs.writeFileSync(out, md);
console.log(`${rows.length} ca → ${out}`);
