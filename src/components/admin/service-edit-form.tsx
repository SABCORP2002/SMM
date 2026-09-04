"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleServiceActiveAction, updateServiceAction, type AdminFormState } from "@/actions/admin";
import { formatMoney } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  rate: number;
  minQuantity: number;
  maxQuantity: number;
  isActive: boolean;
};

export function ServiceEditForm({ service }: { service: Service }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<AdminFormState>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateServiceAction({}, fd);
      setState(res);
      if (res.ok) {
        router.refresh();
        setEditing(false);
      }
    });
  }

  function toggleActive() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("serviceId", service.id);
      fd.set("next", String(!service.isActive));
      await toggleServiceActiveAction(fd);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <form onSubmit={onSubmit} className="space-y-1.5 rounded-lg border border-brand-200 bg-brand-50 p-2">
        <input type="hidden" name="serviceId" value={service.id} />
        <input name="name" defaultValue={service.name} className="h-8 w-full rounded-md border border-border px-2 text-xs" />
        <div className="flex gap-1.5">
          <input name="rate" type="number" step="1" defaultValue={service.rate} className="h-8 w-20 rounded-md border border-border px-2 text-xs" title="Prix / 1000" />
          <input name="minQuantity" type="number" defaultValue={service.minQuantity} className="h-8 w-20 rounded-md border border-border px-2 text-xs" title="Min" />
          <input name="maxQuantity" type="number" defaultValue={service.maxQuantity} className="h-8 w-24 rounded-md border border-border px-2 text-xs" title="Max" />
        </div>
        <input name="averageTime" placeholder="Délai (ex: 0-2 h)" className="h-8 w-full rounded-md border border-border px-2 text-xs" />
        <div className="flex gap-1.5">
          <button type="submit" disabled={pending} className="h-8 rounded-md bg-brand-600 px-2 text-xs font-semibold text-white">
            {pending ? "…" : "Enregistrer"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="h-8 rounded-md px-2 text-xs text-muted">
            Annuler
          </button>
        </div>
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="font-semibold text-brand-700">{formatMoney(service.rate)}</span>
      <button type="button" onClick={() => setEditing(true)} className="font-semibold text-ink-600 hover:underline">
        Modifier
      </button>
      <button type="button" onClick={toggleActive} disabled={pending} className="font-semibold text-ink-600 hover:underline">
        {service.isActive ? "Désactiver" : "Activer"}
      </button>
    </div>
  );
}
