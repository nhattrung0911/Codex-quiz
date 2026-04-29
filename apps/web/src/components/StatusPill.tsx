export function StatusPill({ label, tone = 'blue' }: { label: string; tone?: 'blue' | 'green' | 'orange' | 'red' | 'slate' }) {
  return <span className={`pill pill-${tone}`}>{label}</span>;
}
