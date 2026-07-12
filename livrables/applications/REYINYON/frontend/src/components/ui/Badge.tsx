const TONE_STYLE: Record<string, { bg: string; fg: string }> = {
  success: { bg: 'var(--color-success-soft)', fg: 'var(--color-success)' },
  danger: { bg: 'var(--color-danger-soft)', fg: 'var(--color-danger)' },
  warning: { bg: 'var(--color-warning-soft)', fg: 'var(--color-warning)' },
  info: { bg: 'var(--color-info-soft)', fg: 'var(--color-info)' },
  violet: { bg: 'var(--color-violet-soft)', fg: 'var(--color-violet)' },
  brand: { bg: 'var(--color-primary-soft)', fg: 'var(--color-primary-2)' },
  mint: { bg: 'var(--color-accent-soft)', fg: 'var(--color-accent)' },
  audioSeul: { bg: 'var(--color-audio-seul-soft)', fg: 'var(--color-audio-seul)' },
  neutral: { bg: 'var(--color-neutral-soft)', fg: 'var(--color-ink-2)' },
};

export type BadgeTone = keyof typeof TONE_STYLE;

export default function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: React.ReactNode }) {
  const t = TONE_STYLE[tone];
  return (
    <span className="badge" style={{ background: t.bg, color: t.fg }}>
      {children}
    </span>
  );
}
