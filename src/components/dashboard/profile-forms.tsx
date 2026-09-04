"use client";

import { useState, useTransition } from "react";
import {
  changePasswordAction,
  updateProfileAction,
  type FormResult,
} from "@/actions/profile";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";

function Notice({ result }: { result: FormResult }) {
  if (result.ok && result.message) {
    return (
      <p className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">
        {result.message}
      </p>
    );
  }
  if (result.message) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {result.message}
      </p>
    );
  }
  return null;
}

/** Soumission via useTransition — fiable en re-soumission (cf. auth-forms). */
function useFormSubmit(
  action: (prev: FormResult, fd: FormData) => Promise<FormResult>,
) {
  const [state, setState] = useState<FormResult>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      setState((await action({}, formData)) ?? {});
    });
  }

  return { state, pending, onSubmit };
}

export function ProfileForm({
  defaults,
}: {
  defaults: { name: string; phone: string; whatsapp: string; email: string };
}) {
  const { state, pending, onSubmit } = useFormSubmit(updateProfileAction);
  const fe = state.fieldErrors ?? {};

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Notice result={state} />
      <TextField
        label="Adresse e-mail"
        name="email"
        defaultValue={defaults.email}
        disabled
        hint="L'e-mail ne peut pas être modifié depuis ici."
      />
      <TextField
        label="Nom complet"
        name="name"
        defaultValue={defaults.name}
        required
        error={fe.name}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Téléphone"
          name="phone"
          type="tel"
          defaultValue={defaults.phone}
          error={fe.phone}
        />
        <TextField
          label="WhatsApp"
          name="whatsapp"
          type="tel"
          defaultValue={defaults.whatsapp}
          error={fe.whatsapp}
        />
      </div>
      <Button type="submit" aria-busy={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const { state, pending, onSubmit } = useFormSubmit(changePasswordAction);
  const fe = state.fieldErrors ?? {};

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Notice result={state} />
      <TextField
        label="Mot de passe actuel"
        name="current"
        type="password"
        autoComplete="current-password"
        required
        error={fe.current}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nouveau mot de passe"
          name="next"
          type="password"
          autoComplete="new-password"
          required
          error={fe.next}
        />
        <TextField
          label="Confirmer"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          error={fe.confirm}
        />
      </div>
      <Button type="submit" aria-busy={pending} variant="secondary">
        {pending ? "Modification…" : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
