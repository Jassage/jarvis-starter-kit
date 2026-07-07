'use client';

import { useState } from 'react';

export function CopyableField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-2">
      <code className="max-w-md truncate rounded bg-neutral-100 px-2 py-1 text-xs">{value}</code>
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-900"
      >
        {copied ? 'Copié' : 'Copier'}
      </button>
    </div>
  );
}
