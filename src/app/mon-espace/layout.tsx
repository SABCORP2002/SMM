import type { ReactNode } from "react";
import { DashboardChrome } from "@/components/dashboard/dashboard-chrome";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <DashboardChrome
      user={{
        name: user.name,
        role: user.role,
        balance: formatMoney(user.balance, user.currency),
      }}
    >
      {children}
    </DashboardChrome>
  );
}
