import Image from "next/image";
import { PLATFORMS } from "@/lib/constants";

type Platform = (typeof PLATFORMS)[number];

/**
 * Icône d'une plateforme : le vrai logo SVG (public/logo-*.svg) quand il
 * existe, sinon l'émoji de repli (Telegram, X — aucun fichier fourni).
 */
export function PlatformIcon({
  platform,
  size = 20,
  className,
}: {
  platform: Platform;
  size?: number;
  className?: string;
}) {
  if (platform.icon) {
    return (
      <Image
        src={platform.icon}
        alt=""
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={className}
      style={{ fontSize: size * 0.85, lineHeight: 1 }}
    >
      {platform.emoji}
    </span>
  );
}
