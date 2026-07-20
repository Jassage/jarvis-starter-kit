import { Children, isValidElement, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

function Label({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
      {label} {required && <span className="text-[var(--color-danger)]">*</span>}
    </label>
  );
}

const fieldClass =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]';

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <Label label={label} required={required} />
      {children}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ''}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} ${props.className ?? ''}`} />;
}

/**
 * Select personnalisé (Headless UI) au rendu cohérent avec le reste de l'app — les listes
 * déroulantes natives du navigateur ne sont pas stylables cross-browser. Garde volontairement
 * l'API d'un <select> natif (value / onChange(e) / <option>) pour ne rien casser aux appelants.
 */
export function Select({
  value,
  onChange,
  children,
  className = '',
  disabled,
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const props = child.props as { value?: string | number; children?: ReactNode };
      return { value: String(props.value ?? ''), label: props.children };
    });
  const selected = options.find((o) => o.value === String(value)) ?? options[0];

  return (
    <Listbox
      value={String(value ?? '')}
      onChange={(v: string) => onChange?.({ target: { value: v } } as unknown as React.ChangeEvent<HTMLSelectElement>)}
      disabled={disabled}
    >
      <div className={`relative ${className}`}>
        <Listbox.Button
          className={`${fieldClass} flex items-center justify-between gap-2 text-left ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <span className="truncate">{selected?.label}</span>
          <ChevronDown size={16} className="shrink-0 text-[var(--color-muted)]" />
        </Listbox.Button>
        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-in"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Listbox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 text-sm shadow-[var(--shadow-card)] focus:outline-none">
            {options.map((opt) => (
              <Listbox.Option key={opt.value} value={opt.value} className="outline-none">
                {({ active, selected: isSelected }) => (
                  <div
                    className={`flex items-center justify-between px-3 py-2 ${
                      active ? 'bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]' : 'text-[var(--color-ink)]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={14} className="shrink-0 text-[var(--color-brand)]" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
