import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Rendu Markdown avec une typographie maison (pas de plugin prose externe). */
export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-none text-[15px] leading-7 text-ink-700",
        "[&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink-900",
        "[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink-900",
        "[&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:mt-1",
        "[&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline",
        "[&_strong]:font-semibold [&_strong]:text-ink-900",
        "[&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm",
        "[&_blockquote]:mt-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
