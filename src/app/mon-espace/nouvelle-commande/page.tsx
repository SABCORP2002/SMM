import type { Metadata } from "next";
import { getCatalog } from "@/db/queries";
import { requireUser } from "@/lib/auth";
import { DashHeading, Panel } from "@/components/dashboard/ui";
import { NewOrderForm } from "@/components/dashboard/new-order-form";

export const metadata: Metadata = { title: "Nouvelle commande" };

export default async function NewOrderPage({
  searchParams,
}: PageProps<"/mon-espace/nouvelle-commande">) {
  const user = await requireUser();
  const params = await searchParams;
  const initialServiceId =
    typeof params.service === "string" ? params.service : undefined;

  const catalog = await getCatalog();
  const categories = catalog
    .filter((c) => c.services.length > 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      services: c.services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        rate: Number(s.rate),
        minQuantity: s.minQuantity,
        maxQuantity: s.maxQuantity,
        averageTime: s.averageTime,
        refill: s.refill,
      })),
    }));

  return (
    <>
      <DashHeading
        title="Nouvelle commande"
        description="Choisis un service, colle le lien, indique la quantité."
      />
      <div className="mx-auto max-w-xl">
        <Panel>
          {categories.length === 0 ? (
            <p className="text-sm text-muted">
              Aucun service disponible pour le moment.
            </p>
          ) : (
            <NewOrderForm
              categories={categories}
              initialServiceId={initialServiceId}
              balance={Number(user.balance)}
              currency={user.currency}
            />
          )}
        </Panel>
      </div>
    </>
  );
}
