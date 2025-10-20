import { notFound } from 'next/navigation';

import { CreatorProfileView } from './profile-view';

interface CreatorPageProps {
  params: { id: string };
}

export default function CreatorPage({ params }: CreatorPageProps) {
  if (!params.id) {
    notFound();
  }
  return <CreatorProfileView id={params.id} />;
}
