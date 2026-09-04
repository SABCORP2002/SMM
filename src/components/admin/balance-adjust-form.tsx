"use client";

import { useState, useTransition } from "react";
import { adjustBalanceAction, type AdminFormState } from "@/actions/admin";
import { useRouter } from "next/navigation";

export function BalanceAdjustForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<AdminFormState>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await adjustBalanceAction({}, fd);
      setState(res);
      if (res.ok) {
        router.refresh();
        setTimeout(() => setOpen(false), 800);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-brand-700 hover:underline"
      >
        Ajuster
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-1.5">
      <input type="hidden" name="userId" value={userId} />
      <input
        type="number"
        name="amount"
        placeholder="+/- F"
        required
        className="h-8 w-24 rounded-lg border border-border px-2 text-xs"
      />
      <input
        type="text"
        name="reason"
        placeholder="Motif"
        className="h-8 w-28 rounded-lg border border-border px-2 text-xs"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded-lg bg-brand-600 px-2 text-xs font-semibold text-white hover:bg-brand-700"
      >
        {pending ? "…" : "OK"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="h-8 rounded-lg px-2 text-xs text-muted hover:bg-ink-50"
      >
        ✕
      </button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
