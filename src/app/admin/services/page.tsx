import type { Metadata } from "next";
import { getAllCategoriesAdmin, getAllServicesAdmin } from "@/db/admin-queries";
import { DashHeading, Panel } from "@/components/dashboard/ui";
import { ServiceEditForm } from "@/components/admin/service-edit-form";
import { ServiceCreateForm } from "@/components/admin/service-create-form";

export const metadata: Metadata = { title: "Admin — Services" };

export default async function AdminServicesPage() {
  const [services, categories] = await Promise.all([
    getAllServicesAdmin(),
    getAllCategoriesAdmin(),
  ]);

  const byCategory = new Map<string, typeof services>();
  for (const s of services) {
    const list = byCategory.get(s.categoryName) ?? [];
    list.push(s);
    byCategory.set(s.categoryName, list);
  }

  return (
    <>
      <DashHeading title="Services" description={`${services.length} service(s) au catalogue.`} />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {[...byCategory.entries()].map(([categoryName, list]) => (
            <Panel key={categoryName} title={categoryName}>
              <ul className="divide-y divide-border">
                {list.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-medium text-ink-900">
                        {s.name}
                        {!s.isActive && (
                          <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink-500">
                            inactif
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted">
                        {s.minQuantity.toLocaleString("fr-FR")}–{s.maxQuantity.toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <ServiceEditForm service={s} />
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>

        <Panel title="Ajouter un service">
          <ServiceCreateForm categories={categories} />
        </Panel>
      </div>
    </>
  );
}
