"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

/** Bouton générique : relance une Server Action de synchro puis rafraîchit la page. */
export function RefreshButton({
  action,
  label = "Actualiser les statuts",
}: {
  action: () => Promise<void>;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      aria-busy={pending}
      onClick={() =>
        startTransition(async () => {
          await action();
          router.refresh();
        })
      }
    >
      {pending ? "Actualisation…" : label}
    </Button>
  );
}
