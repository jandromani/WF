import { auth } from '@/auth';
import { ProtectedShell } from './ProtectedShell';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/landing');
  }

  return <ProtectedShell>{children}</ProtectedShell>;
}
