import type { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { BurnWidget } from '@/components/tokenomics/BurnWidget';
import { EpochWidget } from '@/components/tokenomics/EpochWidget';
import { SupplyWidget } from '@/components/tokenomics/SupplyWidget';

const tokenomicsPath = path.join(process.cwd(), 'public', 'tokenomics.md');

type TokenomicsDocument = {
  html: string;
  data: { title?: string; summary?: string };
};

async function loadTokenomicsDocument(): Promise<TokenomicsDocument> {
  const file = await fs.readFile(tokenomicsPath, 'utf8');
  const parsed = matter(file);
  const processed = await remark().use(html).process(parsed.content);

  return {
    html: processed.toString(),
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
    },
  };
}

export async function generateStaticParams() {
  await loadTokenomicsDocument();
  return [];
}

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await loadTokenomicsDocument();

  return {
    title: data.title ?? 'Tokenomics',
    description: data.summary ?? 'Detalles del modelo económico de WFANS.',
  };
}

export default async function TokenomicsPage() {
  const { html: tokenomicsHtml } = await loadTokenomicsDocument();

  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 py-12">
      <article
        className="space-y-6 text-sm leading-6 text-white [&>h1]:text-3xl [&>h1]:font-semibold [&>h2]:mt-8 [&>h2]:text-2xl [&>h2]:font-semibold [&>p]:text-base [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: tokenomicsHtml }}
      />
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <SupplyWidget />
        <EpochWidget />
        <BurnWidget />
      </section>
    </main>
  );
}
