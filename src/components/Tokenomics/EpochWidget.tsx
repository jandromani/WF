'use client';

interface Props {
  epochNumber: number;
  emission: string;
  nextHalvingBlock?: number;
}

export const EpochWidget = ({ epochNumber, emission, nextHalvingBlock }: Props) => {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Emissions
        </p>
        <h3 className="text-xl font-semibold text-slate-900">
          Epoch {epochNumber}
        </h3>
      </header>
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Current emission rate
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-900">{emission} WLDY</p>
      </div>
      {nextHalvingBlock ? (
        <p className="text-sm text-slate-600">
          Next soft halving at block <span className="font-semibold">{nextHalvingBlock}</span>.
        </p>
      ) : (
        <p className="text-sm text-slate-500">
          Halving schedule loading from on-chain data.
        </p>
      )}
    </div>
  );
};
