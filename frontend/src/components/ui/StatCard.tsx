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
  const dark = tone === "dark";
  return (
    <div
      className={[
        "flex h-full flex-col gap-1 rounded-2xl p-6",
        dark ? "border border-navy-700 bg-navy-900" : "bg-white shadow-soft ring-1 ring-line",
      ].join(" ")}
    >
      <p className={["font-display text-4xl font-extrabold tracking-tight tabular-nums", dark ? "text-white" : "text-navy-800"].join(" ")}>
        {value}
      </p>
      <p className={["text-base font-semibold", dark ? "text-aqua-500" : "text-aqua-700"].join(" ")}>{label}</p>
      {description ? <p className={["text-label", dark ? "text-navy-300" : "text-muted"].join(" ")}>{description}</p> : null}
    </div>
  );
}
