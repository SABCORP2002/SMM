"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createProviderAction,
  updateProviderAction,
  type AdminFormState,
} from "@/actions/admin";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";

type Provider = { id: string; name: string; apiUrl: string; apiKey: string };

export function ProviderEditForm({ provider }: { provider: Provider }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<AdminFormState>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateProviderAction({}, fd);
      setState(res);
      if (res.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input type="hidden" name="providerId" value={provider.id} />
      {state.message && (
        <p className={state.ok ? "text-xs text-brand-700" : "text-xs text-red-600"}>{state.message}</p>
      )}
      <TextField label="Nom" name="name" defaultValue={provider.name} required />
      <TextField label="URL de l'API" name="apiUrl" defaultValue={provider.apiUrl} placeholder="https://…/api/v2" />
      <TextField label="Clé API" name="apiKey" defaultValue={provider.apiKey} type="password" />
      <p className="text-xs text-muted">
        Laisser vide = mode bac à sable (aucune requête réseau, cycle de vie simulé).
      </p>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "Enregistrer"}
      </Button>
    </form>
  );
}

export function ProviderCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<AdminFormState>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createProviderAction({}, fd);
      setState(res);
      if (res.ok) {
        router.refresh();
        form.reset();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {state.message && (
        <p className={state.ok ? "text-xs text-brand-700" : "text-xs text-red-600"}>{state.message}</p>
      )}
      <TextField label="Nom" name="name" required placeholder="Nouveau fournisseur" />
      <TextField label="URL de l'API" name="apiUrl" placeholder="https://…/api/v2" />
      <TextField label="Clé API" name="apiKey" type="password" />
      <Button type="submit" size="sm" disabled={pending} className="w-full">
        {pending ? "Création…" : "Ajouter"}
      </Button>
    </form>
  );
}
