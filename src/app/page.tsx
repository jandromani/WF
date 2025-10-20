import Link from 'next/link';

import { Page } from '@/components/PageLayout';

export default function Home() {
  return (
    <Page>
      <Page.Main className="mx-auto flex max-w-xl flex-col items-start justify-center gap-6 py-20">
        <div className="grid gap-3">
          <h1 className="text-3xl font-bold">World Feed Mini-app</h1>
          <p className="text-base text-slate-600">
            Descubre cómo integrar pagos, claims y acciones rápidas dentro de tu experiencia en World App.
            Esta web pública funciona como punto de información para creadores y equipos técnicos.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          <p>
            Para usar la mini-app completa abre este proyecto dentro de World App o accede directamente a la versión protegida utilizando el parámetro{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5">?world_app=1</code>.
          </p>
          <p>
            Asegúrate de configurar tus credenciales en <code className="rounded bg-slate-100 px-1 py-0.5">.env.local</code> y ejecutar las pruebas end-to-end antes de desplegar.
          </p>
        </div>
        <Link
          href="/(protected)/home?world_app=1"
          className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white"
        >
          Abrir mini-app demo
        </Link>
      </Page.Main>
    </Page>
  );
}
