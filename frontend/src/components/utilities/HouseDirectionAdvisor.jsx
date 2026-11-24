import { useState } from 'react';
import { houseDirections } from '../../utils/utilityCalc';
import { Disclaimer, NumberField, ToggleGroup } from './Fields';

// Bố cục la bàn 3x3 (Bắc ở trên).
const GRID = [
  ['TB', 'B', 'DB'],
  ['T', null, 'D'],
  ['TN', 'N', 'DN'],
];

export default function HouseDirectionAdvisor() {
  const [year, setYear] = useState(1990);
  const [gender, setGender] = useState('male');

  const valid = year >= 1900 && year <= 2099;
  const result = valid ? houseDirections(year, gender) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <form className="h-fit space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-card" onSubmit={(e) => e.preventDefault()}>
        <NumberField label="Năm sinh (âm lịch)" value={year} onChange={setYear} step={1} min={1900} max={2099} hint="Áp dụng cho năm 1900 – 2099" />
        <ToggleGroup label="Giới tính" value={gender} onChange={setGender} options={[['male', 'Nam'], ['female', 'Nữ']]} />
      </form>

      <section>
        {!result ? (
          <p className="rounded-3xl border border-dashed border-brand-200 bg-white py-12 text-center text-sm text-slate-500">Nhập năm sinh từ 1900 đến 2099.</p>
        ) : (
          <>
            <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-ink p-5 text-white">
              <p className="text-sm text-white/80">{gender === 'male' ? 'Nam' : 'Nữ'} sinh năm {year} ({result.canChi})</p>
              <p className="mt-1 text-2xl font-extrabold">
                Cung <span className="text-brand-300">{result.name}</span> – {result.group}
              </p>
              <p className="mt-1 text-sm text-white/80">Ngũ hành của cung: {result.element}. Màu hợp: {result.colors}.</p>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
              <div className="grid aspect-square grid-cols-3 gap-1.5" aria-label="La bàn hướng nhà">
                {GRID.flat().map((code, index) => {
                  if (!code) {
                    return (
                      <div key="center" className="grid place-items-center rounded-lg bg-slate-100 text-center text-xs font-bold text-slate-500">
                        {result.name}
                      </div>
                    );
                  }
                  const item = result.byCode[code];
                  return (
                    <div
                      key={code + index}
                      className={`grid place-items-center rounded-xl p-1 text-center ${item.good ? 'bg-brand-600 text-white' : 'bg-red-100 text-red-800'}`}
                    >
                      <span className="text-xs font-bold">{item.direction}</span>
                      <span className="text-[11px]">{item.star}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-emerald-700">4 hướng tốt</h3>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {result.good.map((item) => (
                      <li key={item.code}><strong className="text-ink">{item.direction}</strong> – {item.star}: {item.meaning}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-extrabold text-red-700">4 hướng xấu</h3>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {result.bad.map((item) => (
                      <li key={item.code}><strong className="text-ink">{item.direction}</strong> – {item.star}: {item.meaning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Hướng nhà tính theo hướng nhìn ra của cửa chính. Nên ưu tiên đặt cửa chính, bếp, giường ngủ, bàn làm việc về các hướng tốt.
            </p>
          </>
        )}
        <Disclaimer>
          Kết quả tính theo phương pháp Bát trạch phổ biến, chỉ mang tính tham khảo văn hóa. Khi chọn nhà, hãy ưu tiên các yếu tố thực tế như
          ánh sáng, gió, pháp lý và hạ tầng xung quanh.
        </Disclaimer>
      </section>
    </div>
  );
}
