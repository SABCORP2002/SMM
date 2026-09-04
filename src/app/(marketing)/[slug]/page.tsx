import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPageSlugs, getPage } from "@/db/queries";
import { Markdown } from "@/components/ui/markdown";
import { PageHeader } from "@/components/ui/page-header";

/** Pages éditoriales / légales servies depuis la table `pages`
    (conditions, confidentialite, remboursement, a-propos…). */

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  return page ? { title: page.title } : {};
}

export default async function EditorialPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

  return (
    <>
      <PageHeader title={page.title} />
      <section className="container-page max-w-3xl py-12">
        <Markdown>{page.body}</Markdown>
        <p className="mt-10 text-xs text-muted">
          Dernière mise à jour : {dateFmt.format(page.updatedAt)}
        </p>
      </section>
    </>
  );
}
