import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/db/queries";
import { PageHeader } from "@/components/ui/page-header";
import { fr } from "@/i18n/fr";

export const metadata: Metadata = {
  title: fr.tutorials.title,
  description: fr.tutorials.description,
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

export default async function TutorialsPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHeader
        eyebrow="Apprendre"
        title={fr.tutorials.title}
        description={fr.tutorials.description}
      />

      <section className="container-page py-12">
        {posts.length === 0 ? (
          <p className="text-muted">{fr.tutorials.empty}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/tutoriels/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-white p-5 transition-colors hover:border-brand-300"
              >
                <span className="inline-flex w-fit rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  {fr.tutorials.categories[post.category] ?? post.category}
                </span>
                <h2 className="mt-3 text-base font-bold text-ink-900 group-hover:text-brand-700">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                    {post.excerpt}
                  </p>
                )}
                <span className="mt-4 text-xs text-muted">
                  {post.publishedAt ? dateFmt.format(post.publishedAt) : ""}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
