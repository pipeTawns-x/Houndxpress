import type { ComponentProps } from "react";
import { Link } from "react-router";
import { cx } from "../../lib/bem.ts";
import { buttonClasses } from "./buttonStyles.ts";
import type { ButtonStyleOptions } from "./buttonStyles.ts";

function classesFor({ variant, size, tone, fullWidth, className }: ButtonStyleOptions & { className?: string }) {
  return cx(buttonClasses({ variant, size, tone, fullWidth }), className);
}

/** Enlace interno con aspecto de botón. */
export function ButtonLink({
  variant,
  size,
  tone,
  fullWidth,
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonStyleOptions) {
  return <Link className={classesFor({ variant, size, tone, fullWidth, className })} {...props} />;
}

/** Enlace externo (tel:, mailto:, https:) con aspecto de botón. */
export function ButtonAnchor({
  variant,
  size,
  tone,
  fullWidth,
  className,
  children,
  ...props
}: ComponentProps<"a"> & ButtonStyleOptions) {
  return (
    <a className={classesFor({ variant, size, tone, fullWidth, className })} {...props}>
      {children}
    </a>
  );
}
