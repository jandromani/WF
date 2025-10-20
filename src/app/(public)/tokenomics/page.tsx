import { BurnWidget, EpochWidget, SupplyWidget } from '@/components/Tokenomics';
import { Page } from '@/components/PageLayout';
import { getTokenomics } from '@/services/tokenomics';

export default async function TokenomicsPage() {
  const data = await getTokenomics();

  return (
    <Page className="bg-slate-100">
      <Page.Main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tokenomics v2
          </p>
          <h1 className="text-3xl font-bold text-slate-900">WorldFans Tokenomics</h1>
          <p className="text-sm text-slate-600">
            Real-time supply insights with dynamic burn modelling powered by World Chain Sepolia.
          </p>
        </header>
        <SupplyWidget
          total={data.supply.total}
          circulating={data.supply.circulating}
          burned={data.supply.burned}
        />
        <EpochWidget
          epochNumber={data.epoch.number}
          emission={data.epoch.emission}
          nextHalvingBlock={data.epoch.nextHalvingBlock}
        />
        <BurnWidget
          rate={data.burn.rate}
          pending={data.burn.pending}
          lastEpoch={data.burn.lastEpoch}
        />
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Emissions Soft Halving
          </h2>
          <p className="text-sm text-slate-600">
            Emissions reduce 20% each epoch to align incentives with creator growth.
          </p>
          <table className="mt-4 w-full table-auto text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2">Epoch</th>
                <th className="pb-2">Emission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {data.emissionsSchedule.map((row) => (
                <tr key={row.epoch}>
                  <td className="py-2 font-medium">{row.epoch}</td>
                  <td className="py-2">{row.emission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Dynamic Burns</h2>
          <p className="text-sm text-slate-600">
            Burn rates flex based on activity from subscriptions, tips, and premium unlocks.
          </p>
          <table className="mt-4 w-full table-auto text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2">Trigger</th>
                <th className="pb-2">Burn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {data.dynamicBurns.map((row) => (
                <tr key={row.trigger}>
                  <td className="py-2 font-medium">{row.trigger}</td>
                  <td className="py-2">{row.burnRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </Page.Main>
    </Page>
  );
}
