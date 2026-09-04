/** Liens de l'espace client. `soon` = page encore en préparation. */
export type DashNavItem = {
  label: string;
  href: string;
  soon?: boolean;
};

export const DASHBOARD_NAV: DashNavItem[] = [
  { label: "Tableau de bord", href: "/mon-espace" },
  { label: "Nouvelle commande", href: "/mon-espace/nouvelle-commande" },
  { label: "Mes commandes", href: "/mon-espace/commandes" },
  { label: "Recharger", href: "/mon-espace/recharger" },
  { label: "Historique", href: "/mon-espace/historique" },
  { label: "Parrainage", href: "/mon-espace/parrainage" },
  { label: "Paramètres", href: "/mon-espace/profil" },
];
