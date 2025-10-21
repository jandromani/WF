import { CreatorCard } from '@/components/creator/CreatorCard';
import { Creator } from '@/services/creators';

interface CreatorShowcaseProps {
  creators: Creator[];
  onSubscribe: (id: string, price: number) => Promise<{ success: boolean }>;
  onTip: (id: string, amount: number) => Promise<{ success: boolean }>;
}

export function CreatorShowcase({ creators, onSubscribe, onTip }: CreatorShowcaseProps) {
  if (!creators.length) {
    return (
      <section className="rounded-3xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        Aún no hay creadores destacados.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {creators.map((creator) => (
        <CreatorCard
          key={creator.id}
          creator={creator}
          onSubscribe={onSubscribe}
          onTip={onTip}
        />
      ))}
    </section>
  );
}
