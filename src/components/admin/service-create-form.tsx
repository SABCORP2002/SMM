"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createServiceAction, type AdminFormState } from "@/actions/admin";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { PLATFORMS } from "@/lib/constants";

export function ServiceCreateForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<AdminFormState>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createServiceAction({}, fd);
      setState(res);
      if (res.ok) {
        router.refresh();
        form.reset();
      }
    });
  }

  const selectCls =
    "mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && state.message && <p className="text-sm text-brand-700">{state.message}</p>}

      <div>
        <label className="block text-sm font-medium text-ink-800">Catégorie</label>
        <select name="categoryId" required className={selectCls}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-800">Plateforme</label>
        <select name="platform" className={selectCls}>
          {PLATFORMS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <TextField label="Nom du service" name="name" required />
      <div className="grid grid-cols-3 gap-3">
        <TextField label="Prix / 1000" name="rate" type="number" step="1" required />
        <TextField label="Min" name="minQuantity" type="number" defaultValue={10} required />
        <TextField label="Max" name="maxQuantity" type="number" defaultValue={10000} required />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Création…" : "Créer le service"}
      </Button>
    </form>
  );
}
