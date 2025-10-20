import { BurnWidget } from '@/components/tokenomics/BurnWidget';
import { EpochWidget } from '@/components/tokenomics/EpochWidget';
import { SupplyWidget } from '@/components/tokenomics/SupplyWidget';
import { getBurnStats, getEpoch, getSupply } from '@/services/tokenomics';

const markdownSections = [
  {
    title: '1. Oferta dinámica',
    body:
      'WFANS inicia con una oferta limitada y libera nuevas unidades en cada epoch segun la actividad del feed.',
  },
  {
    title: '2. Burn de fees',
    body:
      'Cada suscripción y tip genera fees que se queman parcialmente, reduciendo la oferta circulante.',
  },
  {
    title: '3. Recompensas diarias',
    body:
      'Los fans verificados reclaman WFANS diarios que incentivan la participación sin inflar la economía.',
  },
];

export default async function TokenomicsPage() {
  const [supply, epoch, burn] = await Promise.all([
    getSupply(),
    getEpoch(),
    getBurnStats(),
  ]);

  return (
    <main className="min-h-dvh bg-gray-50">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Tokenomics WFANS
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Economía deflacionaria centrada en creadores
          </h1>
          <p className="text-sm text-gray-600">
            Datos en vivo desde la Mini App. Todos los valores se actualizan en
            tiempo real cuando existe backend disponible.
          </p>
        </header>

        <SupplyWidget data={supply} />
        <EpochWidget data={epoch} />
        <BurnWidget data={burn} />

        <article className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
          {markdownSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-gray-900">
                {section.title}
              </h2>
              <p className="mt-1 text-sm text-gray-600">{section.body}</p>
            </section>
          ))}
        </article>
      </section>
    </main>
  );
}
