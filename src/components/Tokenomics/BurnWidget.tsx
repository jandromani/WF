'use client';

interface Props {
  rate: string;
  pending: string;
  lastEpoch: number;
}

export const BurnWidget = ({ rate, pending, lastEpoch }: Props) => {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Burns
        </p>
        <h3 className="text-xl font-semibold text-slate-900">
          Dynamic burn engine
        </h3>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <BurnStat label="Active rate" value={rate} />
        <BurnStat label="Pending burn" value={`${pending} WLDY`} />
        <BurnStat label="Last burn epoch" value={`#${lastEpoch}`} />
      </div>
      <p className="text-sm text-slate-600">
        Burns are sourced from the 5% treasury share of MiniKit payments. When on-chain,
        the burn executes automatically with treasury payouts.
      </p>
    </div>
  );
};

interface BurnStatProps {
  label: string;
  value: string;
}

const BurnStat = ({ label, value }: BurnStatProps) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
  </div>
);
