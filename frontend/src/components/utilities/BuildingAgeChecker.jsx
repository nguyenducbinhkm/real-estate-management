import { useState } from 'react';
import { buildingAgeCheck, goodBuildingYears } from '../../utils/utilityCalc';
import { Disclaimer, NumberField } from './Fields';

const THIS_YEAR = new Date().getFullYear();

function Row({ title, bad, children }) {
  return (
    <div className={`rounded-2xl border p-4 ${bad ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
      <p className={`text-sm font-bold ${bad ? 'text-red-700' : 'text-emerald-700'}`}>{bad ? '✕' : '✓'} {title}</p>
      <p className="mt-1 text-sm text-slate-700">{children}</p>
    </div>
  );
}

export default function BuildingAgeChecker() {
  const [birthYear, setBirthYear] = useState(1990);
  const [buildYear, setBuildYear] = useState(THIS_YEAR);

  const valid = birthYear >= 1900 && birthYear <= 2100 && buildYear >= birthYear;
  const result = valid ? buildingAgeCheck(birthYear, buildYear) : null;
  const suggestions = valid ? goodBuildingYears(birthYear, THIS_YEAR, 15) : [];

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <form className="h-fit space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-card" onSubmit={(e) => e.preventDefault()}>
        <NumberField label="Năm sinh của gia chủ (âm lịch)" value={birthYear} onChange={setBirthYear} step={1} min={1900} max={2100} hint="Sinh trước Tết Nguyên đán thì lấy năm trước đó" />
        <NumberField label="Năm dự định xây nhà" value={buildYear} onChange={setBuildYear} step={1} min={1900} max={2100} />
      </form>

      <section>
        {!result ? (
          <p className="rounded-3xl border border-dashed border-brand-200 bg-white py-12 text-center text-sm text-slate-500">Nhập năm sinh và năm xây hợp lệ.</p>
        ) : (
          <>
            <div className={`rounded-3xl p-5 ${result.good ? 'bg-brand-600' : 'bg-ink'} text-white`}>
              <p className="text-sm text-white/80">
                Gia chủ tuổi <strong>{result.birthCanChi}</strong> ({birthYear}), năm {buildYear} ({result.buildCanChi}) – tuổi mụ <strong>{result.age}</strong>
              </p>
              <p className="mt-2 text-2xl font-extrabold">
                {result.tooYoung ? 'Chưa đến tuổi đứng tên làm nhà' : result.good ? 'Năm đẹp để làm nhà' : 'Năm này không thuận để tự đứng tên làm nhà'}
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Row title="Kim Lâu" bad={Boolean(result.kimLau)}>
                {result.kimLau ? `Phạm ${result.kimLau}.` : 'Không phạm Kim Lâu.'}
              </Row>
              <Row title="Hoang Ốc" bad={Boolean(result.hoangOc && !result.hoangOc.good)}>
                {result.hoangOc ? `Rơi vào cung ${result.hoangOc.name}${result.hoangOc.good ? ' (tốt).' : ' (xấu).'}` : 'Chưa tính (dưới 10 tuổi).'}
              </Row>
              <Row title="Tam Tai" bad={result.tamTai}>
                {result.tamTai ? 'Năm này phạm Tam Tai.' : 'Không phạm Tam Tai.'} Tuổi này gặp Tam Tai vào các năm {result.tamTaiYears.join(', ')}.
              </Row>
            </div>

            <h3 className="mt-6 font-extrabold text-ink">Các năm đẹp để làm nhà ({THIS_YEAR} – {THIS_YEAR + 14})</h3>
            {suggestions.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">Không có năm nào tránh được cả ba hạn trong khoảng này.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setBuildYear(year)}
                    className={`h-9 rounded-full border px-4 text-sm font-semibold ${year === buildYear ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-ink hover:border-emerald-500'}`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
            <p className="mt-3 text-sm text-slate-600">
              Nếu năm dự định không đẹp, theo phong tục có thể <strong>mượn tuổi</strong> người thân hợp tuổi đứng ra làm lễ động thổ.
            </p>
          </>
        )}
        <Disclaimer>
          Kim Lâu, Hoang Ốc, Tam Tai là quan niệm dân gian, công cụ chỉ giúp tra cứu nhanh theo cách tính phổ biến và không có giá trị khoa học.
          Tuổi mụ = năm xây − năm sinh + 1.
        </Disclaimer>
      </section>
    </div>
  );
}
