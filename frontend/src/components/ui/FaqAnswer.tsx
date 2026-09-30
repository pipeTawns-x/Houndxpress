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
        <ul className="faq-answer__list">
          {entry.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
      {entry.afterBullets ? <p>{entry.afterBullets}</p> : null}
      {entry.link ? (
        <p>
          <Link to={entry.link.to} className="text-link">
            {entry.link.label}
          </Link>
        </p>
      ) : null}
    </>
  );
}
