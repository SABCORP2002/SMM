"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrderAction, type OrderFormState } from "@/actions/orders";
import { PlatformIcon } from "@/components/brand/platform-icon";
import { Panel } from "@/components/dashboard/ui";
import { TextField } from "@/components/ui/text-field";
import { Button, ButtonLink } from "@/components/ui/button";
import { PLATFORMS } from "@/lib/constants";
import { siteConfig } from "@/config/site";
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
  platform: string | null;
  services: CatalogService[];
};

type Step = "platform" | "service" | "details";

/**
 * Commander en 3 clics, comme sur les panels de référence : on choisit la
 * plateforme par son logo, puis le service dans une liste simple, puis on
 * remplit le lien et la quantité. Pas de menus déroulants.
 */
export function PlatformOrderWizard({
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
  const allServices = useMemo(
    () => categories.flatMap((c) => c.services.map((s) => ({ ...s, categoryId: c.id }))),
    [categories],
  );
  const initialService = initialServiceId
    ? allServices.find((s) => s.id === initialServiceId)
    : undefined;
  const initialCategory = initialService
    ? categories.find((c) => c.id === initialService.categoryId)
    : undefined;

  const [step, setStep] = useState<Step>(initialService ? "details" : "platform");
  const [platform, setPlatform] = useState<string | null>(initialCategory?.platform ?? null);
  const [service, setService] = useState<CatalogService | null>(initialService ?? null);

  const platformTiles = PLATFORMS.filter((p) =>
    categories.some((c) => c.platform === p.key && c.services.length > 0),
  );

  const categoriesForPlatform = categories.filter((c) => c.platform === platform);

  function choosePlatform(key: string) {
    setPlatform(key);
    setStep("service");
  }

  function chooseService(s: CatalogService) {
    setService(s);
    setStep("details");
  }

  if (step === "platform") {
    return (
      <div className="mx-auto max-w-xl">
        <Panel>
          <p className="mb-4 text-sm text-muted">
            Choisis le réseau social sur lequel tu veux commander.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {platformTiles.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => choosePlatform(p.key)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white py-5 transition-colors hover:border-brand-400 hover:bg-brand-50"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-surface">
                  <PlatformIcon platform={p} size={26} />
                </span>
                <span className="text-sm font-semibold text-ink-900">{p.label}</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  if (step === "service") {
    const platformInfo = PLATFORMS.find((p) => p.key === platform);
    return (
      <div className="mx-auto max-w-xl">
        <Panel>
          <button
            type="button"
            onClick={() => setStep("platform")}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900"
          >
            ← Changer de réseau
          </button>

          <div className="mb-4 flex items-center gap-2">
            {platformInfo && <PlatformIcon platform={platformInfo} size={22} />}
            <h2 className="text-lg font-bold text-ink-900">{platformInfo?.label}</h2>
          </div>

          <div className="space-y-5">
            {categoriesForPlatform.map((cat) => (
              <div key={cat.id}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {cat.name}
                </p>
                <div className="space-y-2">
                  {cat.services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => chooseService(s)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-white p-3 text-left transition-colors hover:border-brand-400 hover:bg-brand-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-900">{s.name}</p>
                        <p className="text-xs text-muted">
                          {s.minQuantity.toLocaleString("fr-FR")}–{s.maxQuantity.toLocaleString("fr-FR")}
                          {s.averageTime ? ` · ${s.averageTime}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 font-bold text-brand-700">
                        {formatMoney(s.rate, currency)}
                        <span className="ml-0.5 text-xs font-medium text-muted">/1000</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  // step === "details"
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <Panel>
        <OrderDetails
          service={service!}
          balance={balance}
          currency={currency}
          onBack={
            initialService
              ? undefined
              : () => {
                  setService(null);
                  setStep("service");
                }
          }
          onSuccess={() => router.push("/mon-espace/commandes")}
        />
      </Panel>
      <OrderGuidance />
    </div>
  );
}

function OrderDetails({
  service,
  balance,
  currency,
  onBack,
  onSuccess,
}: {
  service: CatalogService;
  balance: number;
  currency: string;
  onBack?: () => void;
  onSuccess: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<OrderFormState>({});
  const [quantity, setQuantity] = useState("");
  const [link, setLink] = useState("");

  const qty = Number(quantity);
  const qtyValid = Number.isFinite(qty) && qty >= service.minQuantity && qty <= service.maxQuantity;
  const price = qty > 0 ? computeCharge(service.rate, qty) : 0;
  const tooExpensive = price > balance;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createOrderAction({}, fd);
      setState(res);
      if (res.ok && !res.warning) onSuccess();
    });
  }

  return (
    <div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900"
        >
          ← Changer de service
        </button>
      )}

      <div className="mb-4 rounded-xl bg-surface p-3">
        <p className="text-sm font-semibold text-ink-900">{service.name}</p>
        {service.description && <p className="mt-0.5 text-xs text-muted">{service.description}</p>}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" name="serviceId" value={service.id} />

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

        <TextField
          label="Lien"
          name="link"
          placeholder="https://tiktok.com/@ton-compte"
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
          hint={`Entre ${service.minQuantity.toLocaleString("fr-FR")} et ${service.maxQuantity.toLocaleString("fr-FR")}${
            service.averageTime ? ` · délai moyen ${service.averageTime}` : ""
          }`}
          error={quantity && !qtyValid ? "Quantité hors limites pour ce service" : undefined}
        />

        <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
          <span className="text-sm text-muted">Prix</span>
          <span className="text-lg font-bold text-brand-700">{formatMoney(price, currency)}</span>
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
    </div>
  );
}

/** Panneau de réassurance affiché à côté du formulaire — réduit les erreurs et les tickets. */
function OrderGuidance() {
  const wa = `https://wa.me/${siteConfig.contact.whatsapp.replace(/[^\d]/g, "")}`;

  return (
    <div className="space-y-4">
      <Panel title="Quel lien coller ?">
        <ul className="space-y-2 text-xs leading-5 text-muted">
          <li>
            <span className="font-semibold text-ink-800">Abonnés / membres</span> → lien du profil,
            de la page ou du canal
          </li>
          <li>
            <span className="font-semibold text-ink-800">Vues / likes / réactions</span> → lien de
            la publication ou de la vidéo précise
          </li>
          <li>
            <span className="font-semibold text-ink-800">Commentaires</span> → lien de la
            publication concernée
          </li>
        </ul>
      </Panel>

      <Panel title="Après l'envoi">
        <ul className="space-y-2 text-xs leading-5 text-muted">
          <li>
            <span className="font-semibold text-ink-800">En attente</span> — payé, en file
            d&apos;attente
          </li>
          <li>
            <span className="font-semibold text-ink-800">En cours</span> — le compteur avance en
            temps réel
          </li>
          <li>
            <span className="font-semibold text-ink-800">Terminée / Partielle</span> — le reste
            non livré est remboursé automatiquement sur ton solde
          </li>
        </ul>
      </Panel>

      <Panel title="À savoir avant de valider">
        <ul className="space-y-2 text-xs leading-5 text-muted">
          <li>Une fois transmise au fournisseur, une commande ne peut plus être annulée.</li>
          <li>Rendre le compte privé ou supprimer la publication arrête la livraison.</li>
          <li>Une 2ᵉ commande sur le même lien attend derrière la première.</li>
        </ul>
      </Panel>

      <Panel className="border-gold-500/30 bg-gold-400/10 text-center">
        <p className="text-sm font-semibold text-ink-900">Pas sûr du service qu&apos;il te faut ?</p>
        <p className="mt-1 text-xs text-ink-700">
          Envoie-nous ton objectif sur WhatsApp, on te dira lequel choisir.
        </p>
        <ButtonLink
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          variant="gold"
          className="mt-3"
        >
          Demander conseil
        </ButtonLink>
      </Panel>
    </div>
  );
}
