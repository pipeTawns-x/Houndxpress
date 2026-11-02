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
    <details open={defaultOpen} className="accordion__item">
      <summary className="accordion__summary">
        <span>{question}</span>
        <ChevronDown className="accordion__icon" aria-hidden="true" />
      </summary>
      <div className="accordion__body">{children}</div>
    </details>
  );
}

/** Lista de preguntas con `<details>`/`<summary>`. */
export function Accordion({ children }: { children: ReactNode }) {
  return <div className="accordion">{children}</div>;
}
