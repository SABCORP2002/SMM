import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/db/queries";
import { Markdown } from "@/components/ui/markdown";
import { ButtonLink } from "@/components/ui/button";
import { fr } from "@/i18n/fr";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tutoriels/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function TutorialPage({
  params,
}: PageProps<"/tutoriels/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="container-page max-w-3xl py-12">
      <Link
        href="/tutoriels"
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        {fr.tutorials.backToList}
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
          {fr.tutorials.categories[post.category] ?? post.category}
        </span>
        {post.publishedAt && (
          <span className="text-xs text-muted">
            {dateFmt.format(post.publishedAt)}
          </span>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-extrabold text-ink-900">{post.title}</h1>
      {post.excerpt && (
        <p className="mt-3 text-lg leading-7 text-muted">{post.excerpt}</p>
      )}

      <hr className="my-8 border-border" />

      <Markdown>{post.body}</Markdown>

      <div className="mt-12 rounded-2xl bg-ink-gradient px-6 py-8 text-center text-white">
        <h2 className="text-lg font-bold">Passe à la pratique</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-200">
          Crée ton compte et lance ta première commande en quelques minutes.
        </p>
        <div className="mt-5">
          <ButtonLink href="/inscription" variant="gold">
            {fr.common.getStarted}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
