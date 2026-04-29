export function MetricCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <section className="card metric-card">
      <p className="muted small">{label}</p>
      <div className="metric-value">{value}</div>
      <p className="muted small">{hint}</p>
    </section>
  );
}
