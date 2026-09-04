"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrderAction, type OrderFormState } from "@/actions/orders";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { computeCharge, formatMoney } from "@/lib/utils";

export type CatalogService = {
  id: string;
  name: string;
  description: string | null;
  rate: number;
  minQuantity: number;
  maxQuantity: number;
  averageTime: string | null;
  refill: boolean;
};

export type CatalogCategory = {
  id: string;
  name: string;
  services: CatalogService[];
};

export function NewOrderForm({
  categories,
  initialServiceId,
  balance,
  currency,
}: {
  categories: CatalogCategory[];
  initialServiceId?: string;
  balance: number;
  currency: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<OrderFormState>({});

  const initialCategory =
    categories.find((c) => c.services.some((s) => s.id === initialServiceId))
      ?.id ??
    categories[0]?.id ??
    "";

  const [categoryId, setCategoryId] = useState(initialCategory);
  const [serviceId, setServiceId] = useState(
    initialServiceId ??
      categories.find((c) => c.id === initialCategory)?.services[0]?.id ??
      "",
  );
  const [quantity, setQuantity] = useState<string>("");
  const [link, setLink] = useState("");

  const category = categories.find((c) => c.id === categoryId);
  const service = useMemo(
    () =>
      categories
        .flatMap((c) => c.services)
        .find((s) => s.id === serviceId) ?? null,
    [categories, serviceId],
  );

  const qty = Number(quantity);
  const qtyValid =
    service &&
    Number.isFinite(qty) &&
    qty >= service.minQuantity &&
    qty <= service.maxQuantity;
  const price = service && qty > 0 ? computeCharge(service.rate, qty) : 0;
  const tooExpensive = price > balance;

  function onCategoryChange(id: string) {
    setCategoryId(id);
    const first = categories.find((c) => c.id === id)?.services[0]?.id ?? "";
    setServiceId(first);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createOrderAction({}, fd);
      setState(res);
      if (res.ok && !res.warning) {
        router.push("/mon-espace/commandes");
      }
    });
  }

  const selectCls =
    "mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.warning && (
        <p className="rounded-xl border border-gold-500/40 bg-gold-400/10 px-3 py-2 text-sm text-ink-800">
          {state.warning}{" "}
          <Link href="/mon-espace/commandes" className="font-semibold underline">
            Voir mes commandes
          </Link>
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-ink-800">
          Catégorie
        </label>
        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={selectCls}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-800">Service</label>
        <select
          name="serviceId"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className={selectCls}
        >
          {category?.services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatMoney(s.rate, currency)}/1000
            </option>
          ))}
        </select>
        {service?.description && (
          <p className="mt-1 text-xs text-muted">{service.description}</p>
        )}
      </div>

      <TextField
        label="Lien"
        name="link"
        placeholder="https://tiktok.com/@ton-compte  ou  lien de la publication"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        required
      />

      <TextField
        label="Quantité"
        name="quantity"
        type="number"
        inputMode="numeric"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
        hint={
          service
            ? `Entre ${service.minQuantity.toLocaleString(
                "fr-FR",
              )} et ${service.maxQuantity.toLocaleString("fr-FR")}${
                service.averageTime ? ` · délai moyen ${service.averageTime}` : ""
              }`
            : undefined
        }
        error={
          quantity && !qtyValid ? "Quantité hors limites pour ce service" : undefined
        }
      />

      <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
        <span className="text-sm text-muted">Prix</span>
        <span className="text-lg font-bold text-brand-700">
          {formatMoney(price, currency)}
        </span>
      </div>
      {tooExpensive && (
        <p className="text-sm text-red-600">
          Solde insuffisant.{" "}
          <Link href="/mon-espace/recharger" className="font-semibold underline">
            Recharger
          </Link>
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        aria-busy={pending}
        disabled={pending || !qtyValid || tooExpensive || !link}
      >
        {pending ? "Envoi…" : `Commander pour ${formatMoney(price, currency)}`}
      </Button>
    </form>
  );
}
