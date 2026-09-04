"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { syncMyOrdersAction } from "@/actions/orders";
import { Button } from "@/components/ui/button";

export function RefreshOrdersButton() {
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
          await syncMyOrdersAction();
          router.refresh();
        })
      }
    >
      {pending ? "Actualisation…" : "Actualiser les statuts"}
    </Button>
  );
}
