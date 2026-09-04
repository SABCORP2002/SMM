import type { ReactNode } from "react";

/** Bandeau de titre standard des pages internes du site public. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="container-page py-12 lg:py-16">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-extrabold text-ink-900 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-muted">{description}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
