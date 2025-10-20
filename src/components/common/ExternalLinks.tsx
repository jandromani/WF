import Link from 'next/link';

interface ExternalLink {
  label: string;
  href: string;
}

interface ExternalLinksProps {
  title?: string;
  links: ExternalLink[];
}

export function ExternalLinks({ title, links }: ExternalLinksProps) {
  if (!links.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4">
      {title ? <h3 className="text-sm font-semibold text-gray-900">{title}</h3> : null}
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
