const TONE_STYLES: Record<string, { bg: string; color: string }> = {
  success: { bg: 'var(--color-success-soft)', color: 'var(--color-success)' },
  danger: { bg: 'var(--color-danger-soft)', color: 'var(--color-danger)' },
  warning: { bg: 'var(--color-warning-soft)', color: 'var(--color-warning)' },
  info: { bg: 'var(--color-info-soft)', color: 'var(--color-info)' },
  brand: { bg: 'var(--color-primary-soft)', color: 'var(--color-primary-2)' },
  neutral: { bg: 'var(--color-surface-2)', color: 'var(--color-ink-2)' },
};

export default function Badge({ tone = 'neutral', children }: { tone?: keyof typeof TONE_STYLES; children: React.ReactNode }) {
  const style = TONE_STYLES[tone] ?? TONE_STYLES.neutral;
  return (
    <span className="badge" style={{ background: style.bg, color: style.color }}>
      {children}
    </span>
  );
}
