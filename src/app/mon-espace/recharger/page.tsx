import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";
import { DashHeading, Panel, StatCard } from "@/components/dashboard/ui";
import { TopUpForm } from "@/components/dashboard/topup-form";

export const metadata: Metadata = { title: "Recharger" };

export default async function TopUpPage() {
  const user = await requireUser();

  return (
    <>
      <DashHeading
        title="Recharger mon compte"
        description="Par Mobile Money : Orange Money, MTN MoMo, Moov Money, Wave, Airtel Money."
      />

      <div className="mx-auto max-w-xl space-y-4">
        <StatCard
          label="Solde actuel"
          value={formatMoney(user.balance, user.currency)}
        />
        <Panel>
          <TopUpForm />
        </Panel>
      </div>
    </>
  );
}
