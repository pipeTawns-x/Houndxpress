import { Link } from "react-router";
import type { FaqEntry } from "../../content/faq.ts";

/** Cuerpo de una respuesta de las preguntas frecuentes: párrafos, lista y enlace. */
export function FaqAnswer({ entry }: { entry: FaqEntry }) {
  return (
    <>
      {entry.paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
      {entry.bullets ? (
        <ul className="flex list-disc flex-col gap-1 pl-5 marker:text-aqua-700">
          {entry.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
      {entry.afterBullets ? <p>{entry.afterBullets}</p> : null}
      {entry.link ? (
        <p>
          <Link
            to={entry.link.to}
            className="font-semibold text-aqua-700 underline underline-offset-2 hover:text-navy-800"
          >
            {entry.link.label}
          </Link>
        </p>
      ) : null}
    </>
  );
}
