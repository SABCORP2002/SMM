"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTopUpAction, syncMyPaymentsAction, type TopUpFormState } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { MOBILE_MONEY_OPERATORS } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const PRESETS = [500, 1000, 2500, 5000, 10000, 25000];

export function TopUpForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<TopUpFormState>({});
  const [amount, setAmount] = useState<number | "">(1000);
  const [operator, setOperator] = useState<string>(MOBILE_MONEY_OPERATORS[0].key);
  const [waiting, setWaiting] = useState(false);

  // En mode bac à sable, on revérifie automatiquement après le délai simulé.
  useEffect(() => {
    if (!waiting) return;
    const t = setTimeout(() => {
      startTransition(async () => {
        await syncMyPaymentsAction();
        router.refresh();
      });
    }, 9000);
    return () => clearTimeout(t);
  }, [waiting, router]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createTopUpAction({}, fd);
      setState(res);
      if (res.ok) {
        if (res.redirectUrl) {
          window.location.href = res.redirectUrl;
        } else if (res.isMock) {
          setWaiting(true);
        }
      }
    });
  }

  if (waiting) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center">
        <p className="font-semibold text-brand-800">
          Paiement en cours de confirmation…
        </p>
        <p className="mt-2 text-sm text-ink-700">
          Mode bac à sable : la confirmation Mobile Money est simulée
          automatiquement dans quelques secondes. Ton solde se mettra à jour
          tout seul.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-busy={pending}
            onClick={() =>
              startTransition(async () => {
                await syncMyPaymentsAction();
                router.refresh();
              })
            }
          >
            {pending ? "Vérification…" : "Vérifier maintenant"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setWaiting(false)}
          >
            Nouvelle recharge
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-ink-800">Montant</label>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(p)}
              className={`h-11 rounded-xl border text-sm font-semibold transition-colors ${
                amount === p
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border bg-white text-ink-700 hover:border-brand-300"
              }`}
            >
              {formatMoney(p)}
            </button>
          ))}
        </div>
        <input
          type="number"
          name="amount"
          min={siteConfig.minDeposit}
          step={100}
          value={amount}
          onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
          className="mt-2 h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          placeholder={`Montant personnalisé (min. ${siteConfig.minDeposit} F)`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-800">
          Opérateur Mobile Money
        </label>
        <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MOBILE_MONEY_OPERATORS.map((op) => (
            <button
              key={op.key}
              type="button"
              onClick={() => setOperator(op.key)}
              className={`h-11 rounded-xl border text-sm font-medium transition-colors ${
                operator === op.key
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border bg-white text-ink-700 hover:border-brand-300"
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="operator" value={operator} />
      </div>

      <TextField
        label="Numéro Mobile Money"
        name="phone"
        type="tel"
        placeholder="+225 07 00 00 00 00"
        required
      />

      <Button type="submit" size="lg" className="w-full" aria-busy={pending} disabled={pending}>
        {pending
          ? "Envoi…"
          : `Recharger ${amount ? formatMoney(amount) : ""}`}
      </Button>
      <p className="text-center text-xs text-muted">
        Mode bac à sable : aucun vrai débit n&apos;est effectué tant que les clés
        FedaPay/CinetPay ne sont pas configurées.
      </p>
    </form>
  );
}
