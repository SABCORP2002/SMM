"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { loginAction, signupAction, type AuthState } from "@/actions/auth";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

/** Soumission via useTransition : fiable sur re-soumission après erreur. */
function useAuthSubmit(action: (prev: AuthState, fd: FormData) => Promise<AuthState>) {
  const [state, setState] = useState<AuthState>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      // En cas de succès, l'action fait un redirect() (elle ne renvoie rien).
      const result = await action({}, formData);
      setState(result ?? {});
    });
  }

  return { state, pending, onSubmit };
}

export function LoginForm() {
  const { state, pending, onSubmit } = useAuthSubmit(loginAction);
  const fe = state.fieldErrors ?? {};

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormError message={state.error} />
      <TextField
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={fe.email}
      />
      <TextField
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={fe.password}
      />
      <Button type="submit" aria-busy={pending} className="w-full" size="lg">
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
      <p className="text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-brand-700 hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ referralCode }: { referralCode?: string }) {
  const { state, pending, onSubmit } = useAuthSubmit(signupAction);
  const fe = state.fieldErrors ?? {};

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormError message={state.error} />
      <TextField label="Nom complet" name="name" autoComplete="name" required error={fe.name} />
      <TextField
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={fe.email}
      />
      <TextField
        label="Numéro WhatsApp"
        name="whatsapp"
        type="tel"
        inputMode="tel"
        placeholder="+225 07 00 00 00 00"
        autoComplete="tel"
        required
        error={fe.whatsapp}
        hint="Pour le support et les notifications de commande."
      />
      <TextField
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={fe.password}
        hint="8 caractères minimum."
      />
      <TextField
        label="Code de parrainage (facultatif)"
        name="referralCode"
        defaultValue={referralCode}
        error={fe.referralCode}
      />
      <Button type="submit" aria-busy={pending} className="w-full" size="lg">
        {pending ? "Création…" : "Créer mon compte"}
      </Button>
      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-700 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
