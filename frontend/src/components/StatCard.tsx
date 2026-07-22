interface StatCardProps {
  value: number;
  label: string;
  tone?: 'default' | 'success' | 'danger';
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-ink',
  success: 'text-success',
  danger: 'text-danger',
};

export function StatCard({ value, label, tone = 'default' }: StatCardProps) {
  return (
    <div className="min-w-[92px] rounded-lg border border-border bg-surface px-4 py-2.5 text-center">
      <div className={`font-mono-tab text-2xl font-bold ${toneClasses[tone]}`}>
        {String(value).padStart(2, '0')}
      </div>
      <div className="label-eyebrow text-muted-2">{label}</div>
    </div>
  );
}
