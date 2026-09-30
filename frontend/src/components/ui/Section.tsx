import type { ComponentProps, ReactNode } from "react";

function join(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Contenedor de 1200 px con 16 px de margen lateral en móvil. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={join("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

export type SectionTone = "light" | "surface" | "dark";

const tones: Record<SectionTone, string> = {
  light: "bg-white",
  surface: "bg-surface",
  dark: "on-dark relative overflow-hidden bg-navy-950 text-white",
};

/** Sección de página: `py-14` en móvil y `py-20` en escritorio. */
export function Section({
  tone = "light",
  className,
  containerClassName,
  children,
  ...props
}: ComponentProps<"section"> & { tone?: SectionTone; containerClassName?: string }) {
  return (
    <section className={join("py-14 md:py-20", tones[tone], className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

/** Sobretítulo en mayúsculas: aqua-700 sobre claro, aqua-500 sobre oscuro. */
export function Eyebrow({ tone = "light", children }: { tone?: "light" | "dark"; children: ReactNode }) {
  return <p className={join("eyebrow", tone === "dark" ? "text-aqua-500" : "text-aqua-700")}>{children}</p>;
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
    <div className={join("flex max-w-3xl flex-col gap-3", align === "center" && "mx-auto items-center text-center", className)}>
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <Heading
        id={id}
        className={join(
          "font-extrabold tracking-tight",
          Heading === "h1" ? "text-h1" : "text-h2 font-bold",
          dark && "text-white",
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p className={join("text-lead", dark ? "text-navy-300" : "text-muted")}>{description}</p>
      ) : null}
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
    <div className="on-dark relative overflow-hidden bg-navy-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_24rem_at_85%_-20%,rgb(76_190_216/0.18),transparent_65%)]"
      />
      <div aria-hidden="true" className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <Container className="relative py-14 md:py-20">
        <SectionHeader as="h1" tone="dark" eyebrow={eyebrow} title={title} description={description} />
        {children}
      </Container>
    </div>
  );
}
