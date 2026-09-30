import type { ComponentProps, ReactNode } from "react";
import { bem, cx } from "../../lib/bem.ts";

/** Contenedor de 1200 px con 16 px de margen lateral en móvil. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("container", className)} {...props} />;
}

export type SectionTone = "light" | "surface" | "dark";

/** Sección de página: `py-14` en móvil y `py-20` en escritorio. */
export function Section({
  tone = "light",
  className,
  containerClassName,
  children,
  ...props
}: ComponentProps<"section"> & { tone?: SectionTone; containerClassName?: string }) {
  return (
    <section className={cx(bem("section", tone), className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

/** Sobretítulo en mayúsculas: aqua-700 sobre claro, aqua-500 sobre oscuro. */
export function Eyebrow({ tone = "light", children }: { tone?: "light" | "dark"; children: ReactNode }) {
  return <p className={bem("eyebrow", { dark: tone === "dark" })}>{children}</p>;
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  /** Nivel del título: "h2" en secciones, "h1" en el encabezado de página. */
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  tone = "light",
  align = "left",
  as: Heading = "h2",
  id,
  className,
}: SectionHeaderProps) {
  const dark = tone === "dark";
  return (
    <div className={cx(bem("section-header", { center: align === "center" }), className)}>
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <Heading id={id} className={bem("section-header__title", Heading === "h1" ? "page" : "section", { dark })}>
        {title}
      </Heading>
      {description ? <p className={bem("section-header__description", { dark })}>{description}</p> : null}
    </div>
  );
}

/** Encabezado de las páginas interiores: banda marino con un brillo aqua tenue. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div aria-hidden="true" className="page-header__glow" />
      <div aria-hidden="true" className="page-header__dots" />
      <Container className="page-header__inner">
        <SectionHeader as="h1" tone="dark" eyebrow={eyebrow} title={title} description={description} />
        {children}
      </Container>
    </div>
  );
}
