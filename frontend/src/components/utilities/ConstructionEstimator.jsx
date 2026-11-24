import { useMemo, useState } from 'react';
import {
  basementOptions,
  constructionEstimate,
  formatShortVnd,
  formatVnd,
  foundationOptions,
  packageOptions,
  roofOptions,
} from '../../utils/utilityCalc';
import { Disclaimer, NumberField, SelectField, Stat, num } from './Fields';

const toOptions = (list) => list.map(([value, label]) => [value, label]);

export default function ConstructionEstimator() {
  const [width, setWidth] = useState(5);
  const [length, setLength] = useState(20);
  const [floors, setFloors] = useState(3);
  const [foundation, setFoundation] = useState('strip');
  const [roof, setRoof] = useState('concrete');
  const [basement, setBasement] = useState('none');
  const [yardArea, setYardArea] = useState(0);
  const [pack, setPack] = useState('basic');
  const [unitPrice, setUnitPrice] = useState(5.8);

  const choosePackage = (value) => {
    setPack(value);
    const preset = packageOptions.find(([key]) => key === value);
    if (preset) setUnitPrice(preset[2]);
  };

  const result = useMemo(
    () => (num(width) && num(length) && num(floors) && num(unitPrice)
      ? constructionEstimate({ width: num(width), length: num(length), floors: Math.round(num(floors)), foundation, roof, basement, yardArea: num(yardArea), unitPrice: num(unitPrice) })
      : null),
    [width, length, floors, foundation, roof, basement, yardArea, unitPrice],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form className="h-fit space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-card" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Chiều rộng" value={width} onChange={setWidth} suffix="m" />
          <NumberField label="Chiều dài" value={length} onChange={setLength} suffix="m" />
        </div>
        <NumberField label="Số tầng (kể cả tầng trệt)" value={floors} onChange={setFloors} step={1} max={10} suffix="tầng" />
        <SelectField label="Loại móng" value={foundation} onChange={setFoundation} options={toOptions(foundationOptions)} />
        <SelectField label="Loại mái" value={roof} onChange={setRoof} options={toOptions(roofOptions)} />
        <SelectField label="Tầng hầm" value={basement} onChange={setBasement} options={toOptions(basementOptions)} />
        <NumberField label="Diện tích sân, tường rào" value={yardArea} onChange={setYardArea} suffix="m²" />
        <SelectField
          label="Gói xây dựng"
          value={pack}
          onChange={choosePackage}
          options={packageOptions.map(([value, label, price]) => [value, `${label} (~${price.toLocaleString('vi-VN')} tr/m²)`])}
        />
        <NumberField label="Đơn giá áp dụng" value={unitPrice} onChange={setUnitPrice} step={0.1} suffix="triệu/m²" hint="Có thể sửa theo báo giá của nhà thầu" />
      </form>

      <section>
        {!result ? (
          <p className="rounded-3xl border border-dashed border-brand-200 bg-white py-12 text-center text-sm text-slate-500">Nhập kích thước, số tầng và đơn giá để xem dự toán.</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat highlight label="Tổng chi phí ước tính" value={formatShortVnd(result.totalCost)} />
              <Stat label="Diện tích xây dựng quy đổi" value={`${result.totalArea.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} m²`} />
              <Stat label="Diện tích mỗi sàn" value={`${result.floorArea.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} m²`} />
            </div>

            <h3 className="mt-6 font-extrabold text-ink">Chi tiết diện tích quy đổi</h3>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Hạng mục</th>
                    <th className="px-3 py-2 text-right">Diện tích (m²)</th>
                    <th className="px-3 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.label} className="border-t border-slate-100">
                      <td className="px-3 py-2">{item.label}</td>
                      <td className="px-3 py-2 text-right">{item.area.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</td>
                      <td className="px-3 py-2 text-right">{formatVnd(item.cost)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-200 bg-slate-50 font-bold text-ink">
                    <td className="px-3 py-2">Tổng</td>
                    <td className="px-3 py-2 text-right">{result.totalArea.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</td>
                    <td className="px-3 py-2 text-right">{formatVnd(result.totalCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Diện tích quy đổi = diện tích sàn các tầng + phần móng, mái, hầm, sân tính theo hệ số. Đây là cách các nhà thầu dân dụng thường dùng để báo giá theo m².
            </p>
          </>
        )}
        <Disclaimer>
          Hệ số quy đổi và đơn giá chỉ là mức tham khảo phổ biến; chi phí thực tế phụ thuộc vào địa phương, thời điểm, vật liệu, thiết kế và nhà thầu.
          Chưa gồm chi phí thiết kế, xin phép xây dựng, ép cọc, nội thất rời.
        </Disclaimer>
      </section>
    </div>
  );
}
