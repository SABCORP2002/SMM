import type { ReactNode } from "react";
import { AdminChrome } from "@/components/admin/admin-chrome";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  return <AdminChrome name={admin.name}>{children}</AdminChrome>;
}
