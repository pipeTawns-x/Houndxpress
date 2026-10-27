import { bem } from "../../lib/bem.ts";

export function StatCard({
  value,
  label,
  description,
  tone = "light",
}: {
  value: string;
  label: string;
  description?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={bem("stat-card", tone)}>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__label">{label}</p>
      {description ? <p className="stat-card__description">{description}</p> : null}
    </div>
  );
}
