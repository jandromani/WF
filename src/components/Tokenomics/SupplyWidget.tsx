'use client';

interface Props {
  total: string;
  circulating: string;
  burned: string;
}

export const SupplyWidget = ({ total, circulating, burned }: Props) => {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Supply overview
        </p>
        <h3 className="text-xl font-semibold text-slate-900">WLDY Supply</h3>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <SupplyStat label="Total" value={`${total} WLDY`} />
        <SupplyStat label="Circulating" value={`${circulating} WLDY`} />
        <SupplyStat label="Burned" value={`${burned} WLDY`} />
      </div>
    </div>
  );
};

interface SupplyStatProps {
  label: string;
  value: string;
}

const SupplyStat = ({ label, value }: SupplyStatProps) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
  </div>
);
