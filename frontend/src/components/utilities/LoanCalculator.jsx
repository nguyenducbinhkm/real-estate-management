import { useMemo, useState } from 'react';
import { loanSchedule, formatShortVnd, formatVnd } from '../../utils/utilityCalc';
import { Disclaimer, NumberField, Stat, ToggleGroup, num } from './Fields';

export default function LoanCalculator() {
  const [price, setPrice] = useState(3000);
  const [ratio, setRatio] = useState(70);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(9.5);
  const [method, setMethod] = useState('declining');
  const [showAll, setShowAll] = useState(false);

  const principal = num(price) * 1_000_000 * Math.min(num(ratio), 100) / 100;
  const result = useMemo(
    () => (principal > 0 && num(years) > 0 ? loanSchedule({ principal, annualRate: num(rate), years: num(years), method }) : null),
    [principal, years, rate, method],
  );
  const rows = result ? (showAll ? result.rows : result.rows.slice(0, 12)) : [];

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form className="h-fit space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-card" onSubmit={(e) => e.preventDefault()}>
        <NumberField label="Giá trị bất động sản" value={price} onChange={setPrice} suffix="triệu đ" hint={price ? formatShortVnd(num(price) * 1_000_000) : ''} />
        <NumberField label="Tỷ lệ vay" value={ratio} onChange={setRatio} max={100} suffix="%" hint={`Số tiền vay: ${formatShortVnd(principal)}`} />
        <NumberField label="Thời hạn vay" value={years} onChange={setYears} max={35} suffix="năm" />
        <NumberField label="Lãi suất" value={rate} onChange={setRate} max={30} step={0.1} suffix="%/năm" />
        <ToggleGroup
          label="Phương thức trả nợ"
          value={method}
          onChange={setMethod}
          options={[['declining', 'Dư nợ giảm dần'], ['annuity', 'Trả góp đều']]}
        />
      </form>

      <section>
        {!result ? (
          <p className="rounded-3xl border border-dashed border-brand-200 bg-white py-12 text-center text-sm text-slate-500">Nhập giá trị nhà, tỷ lệ vay và thời hạn để xem kết quả.</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat highlight label={method === 'declining' ? 'Trả tháng đầu' : 'Trả mỗi tháng'} value={formatShortVnd(result.firstPayment)} />
              {method === 'declining' && <Stat label="Trả tháng cuối" value={formatShortVnd(result.lastPayment)} />}
              <Stat label="Tổng tiền lãi" value={formatShortVnd(result.totalInterest)} />
              <Stat label="Tổng gốc + lãi" value={formatShortVnd(result.totalPayment)} />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {method === 'declining'
                ? 'Dư nợ giảm dần: tiền gốc trả đều mỗi tháng, tiền lãi tính trên số dư còn lại nên số tiền trả giảm dần theo thời gian.'
                : 'Trả góp đều: số tiền trả mỗi tháng bằng nhau; giai đoạn đầu phần lớn là lãi, càng về sau phần gốc càng lớn.'}
            </p>

            <h3 className="mt-6 font-extrabold text-ink">Lịch trả nợ {showAll ? `(${result.months} tháng)` : '(12 tháng đầu)'}</h3>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <table className="w-full min-w-[560px] text-right text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Tháng</th>
                    <th className="px-3 py-2">Gốc</th>
                    <th className="px-3 py-2">Lãi</th>
                    <th className="px-3 py-2">Tổng trả</th>
                    <th className="px-3 py-2">Dư nợ còn lại</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.month} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-left">{row.month}</td>
                      <td className="px-3 py-2">{formatVnd(row.principal)}</td>
                      <td className="px-3 py-2">{formatVnd(row.interest)}</td>
                      <td className="px-3 py-2 font-semibold text-ink">{formatVnd(row.payment)}</td>
                      <td className="px-3 py-2">{formatVnd(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.months > 12 && (
              <button type="button" onClick={() => setShowAll((v) => !v)} className="mt-3 text-sm font-semibold text-brand-600">
                {showAll ? 'Thu gọn' : `Xem toàn bộ ${result.months} tháng`}
              </button>
            )}
          </>
        )}
        <Disclaimer>
          Kết quả chỉ mang tính tham khảo, giả định lãi suất cố định trong suốt thời hạn vay. Lãi suất thực tế thường thả nổi sau thời gian ưu đãi
          và có thể kèm phí trả nợ trước hạn – hãy hỏi ngân hàng trước khi quyết định.
        </Disclaimer>
      </section>
    </div>
  );
}
