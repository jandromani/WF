'use client';

import Link from 'next/link';

import { Button } from '@/components/common/Button';
import { ExternalLinks } from '@/components/common/ExternalLinks';

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-gray-100">
      <section className="mx-auto flex w-full max-w-xl flex-col gap-10 px-6 py-16">
        <header className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            WorldFans · Social + Tokenomics
          </p>
          <h1 className="text-4xl font-bold text-gray-900">
            La comunidad premium, impulsada por World App
          </h1>
          <p className="text-base text-gray-600">
            Conecta con tus creadores favoritos, reclama recompensas diarias y
            desbloquea contenido exclusivo dentro de World App.
          </p>
          <Button
            size="lg"
            className="mt-6"
            onClick={() => {
              window.location.href = 'worldapp://open';
            }}
          >
            Abrir en World App
          </Button>
        </header>

        <div className="grid gap-6 rounded-3xl bg-white p-6 shadow-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Experiencia Mini-App</h2>
            <p className="mt-2 text-sm text-gray-600">
              Accede al feed social, recompensas diarias y tokenomics gamificado
              dentro del ecosistema verificado de World ID.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              'Feed social premium',
              'Tips y suscripciones on-chain',
              'Economía deflacionaria de WFANS',
            ].map((feature) => (
              <div key={feature} className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                {feature}
              </div>
            ))}
          </div>
        </div>

        <ExternalLinks
          title="¿Quieres conocer más?"
          links={[
            { label: 'Tokenomics de WFANS', href: '/tokenomics' },
            {
              label: 'Documentación de Mini Apps',
              href: 'https://docs.world.org/mini-apps',
            },
          ]}
        />

        <footer className="text-center text-xs text-gray-400">
          ¿Ya tienes World App?{' '}
          <Link href="/feed" className="font-semibold text-gray-700 hover:underline">
            Entra directo al feed
          </Link>
        </footer>
      </section>
    </main>
  );
}
