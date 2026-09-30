import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function AccordionItem({
  question,
  defaultOpen = false,
  children,
}: {
  question: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl bg-white ring-1 ring-line transition-shadow duration-200 open:shadow-soft"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-2xl p-5 text-left font-display text-lg font-bold text-navy-800">
        <span>{question}</span>
        <ChevronDown
          className="mt-1 size-5 shrink-0 text-aqua-700 transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="flex flex-col gap-3 px-5 pb-5 text-base text-muted">{children}</div>
    </details>
  );
}

/** Lista de preguntas con `<details>`/`<summary>`. */
export function Accordion({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}
