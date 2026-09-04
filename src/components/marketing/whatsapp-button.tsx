import { siteConfig } from "@/config/site";

/** Bouton flottant WhatsApp — canal de support n°1 du public visé. */
export function WhatsAppButton() {
  const number = siteConfig.contact.whatsapp.replace(/[^\d]/g, "");
  const href = `https://wa.me/${number}?text=${encodeURIComponent(
    "Bonjour JAL SMM, j'ai une question.",
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter le support sur WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
        <path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.65.14-.19.29-.74.94-.9 1.13-.17.19-.33.22-.62.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.44-1.71-1.6-2-.17-.29-.02-.45.12-.6.13-.13.29-.34.44-.5.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.65-1.57-.9-2.15-.24-.56-.48-.48-.65-.49l-.56-.01c-.19 0-.5.07-.77.36-.26.29-1 .98-1 2.38 0 1.41 1.02 2.77 1.17 2.96.15.19 2.02 3.08 4.9 4.32.68.29 1.22.47 1.63.6.69.22 1.31.19 1.8.12.55-.08 1.7-.7 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34zM12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.77.46 3.42 1.28 4.86L2 22l5.27-1.38A9.96 9.96 0 0 0 12.02 22c5.52 0 10-4.48 10-10S17.54 2 12.02 2z" />
      </svg>
      <span className="hidden sm:inline">Besoin d&apos;aide ?</span>
    </a>
  );
}
