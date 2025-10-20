'use client';

import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { useAuthStore } from '@/lib/stores/auth';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
  const { worldIdVerified, reset } = useAuthStore();
  const { showToast } = useToast();

  const handleDisconnect = async () => {
    reset();
    await signOut({ callbackUrl: '/landing' });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Ajustes</h1>
        <p className="text-sm text-gray-500">
          Gestiona tu perfil, permisos y sesiones vinculadas.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">World ID</h2>
        <p className="mt-1 text-sm text-gray-500">
          Estado de verificación: {worldIdVerified ? 'Verificado' : 'Pendiente'}
        </p>
        {!worldIdVerified ? (
          <p className="mt-2 text-xs text-amber-500">
            Completa la verificación desde el feed para acceder a todas las
            funcionalidades.
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">Permisos</h2>
        <p className="mt-1 text-sm text-gray-500">
          Gestionaremos automáticamente los permisos requeridos para comandos
          de World App.
        </p>
        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => showToast('Coming soon: gestión de permisos', 'info')}
        >
          Ver permisos
        </Button>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
        <h2 className="text-base font-semibold">Desvincular cuenta</h2>
        <p className="mt-1 text-sm">
          Cierra sesión y revoca el estado de verificación local.
        </p>
        <Button className="mt-3" onClick={handleDisconnect}>
          Desvincular de World App
        </Button>
      </section>
    </div>
  );
}
