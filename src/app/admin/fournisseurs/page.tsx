import type { Metadata } from "next";
import { getAllProvidersAdmin } from "@/db/admin-queries";
import { formatMoney } from "@/lib/utils";
import { DashHeading, Panel } from "@/components/dashboard/ui";
import { ProviderCreateForm, ProviderEditForm } from "@/components/admin/provider-forms";

export const metadata: Metadata = { title: "Admin — Fournisseurs" };

export default async function AdminProvidersPage() {
  const providers = await getAllProvidersAdmin();

  return (
    <>
      <DashHeading
        title="Fournisseurs"
        description="Sources des services SMM. Sans URL/clé API : bac à sable automatique."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {providers.map((p) => (
            <Panel key={p.id} title={`${p.name} — solde ${formatMoney(p.balance, p.currency)}`}>
              <ProviderEditForm provider={{ id: p.id, name: p.name, apiUrl: p.apiUrl, apiKey: p.apiKey }} />
            </Panel>
          ))}
        </div>

        <Panel title="Ajouter un fournisseur">
          <ProviderCreateForm />
        </Panel>
      </div>
    </>
  );
}
