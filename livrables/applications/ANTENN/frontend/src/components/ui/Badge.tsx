const TONE_STYLE: Record<string, { bg: string; fg: string }> = {
  success: { bg: 'var(--color-success-soft)', fg: 'var(--color-success)' },
  danger: { bg: 'var(--color-danger-soft)', fg: 'var(--color-danger)' },
  warning: { bg: 'var(--color-warning-soft)', fg: 'var(--color-warning)' },
  info: { bg: 'var(--color-info-soft)', fg: 'var(--color-info)' },
  violet: { bg: 'var(--color-violet-soft)', fg: 'var(--color-violet)' },
  brand: { bg: 'var(--color-primary-soft)', fg: 'var(--color-primary)' },
  gold: { bg: 'var(--color-accent-soft)', fg: 'var(--color-accent)' },
  live: { bg: 'var(--color-live-soft)', fg: 'var(--color-live)' },
  neutral: { bg: 'var(--color-line-2)', fg: 'var(--color-ink-2)' },
};

export type BadgeTone = keyof typeof TONE_STYLE;

export default function Badge({ tone = 'neutral', pulse = false, children }: { tone?: BadgeTone; pulse?: boolean; children: React.ReactNode }) {
  const t = TONE_STYLE[tone];
  return (
    <span className={`badge${pulse ? ' badge-live' : ''}`} style={{ background: t.bg, color: t.fg }}>
      {children}
    </span>
  );
}
