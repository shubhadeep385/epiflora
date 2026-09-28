import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Elevated panels are for hero and result surfaces, not every box. */
  elevated?: boolean;
  as?: 'div' | 'section' | 'article';
}

export function Card({ children, className, elevated = false, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={[
        elevated
          ? 'rounded-2xl md:rounded-3xl shadow-md dark:shadow-2xl'
          : 'rounded-xl md:rounded-2xl shadow-sm',
        'border border-[#0F3D2E]/10 dark:border-white/10 bg-white dark:bg-[#0E221A] text-[#0F3D2E] dark:text-[#FAF8F3] transition-colors',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
}

interface SectionHeadingProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Right-aligned slot for filters or actions. */
  action?: ReactNode;
  /** Heading level. Keeps the document outline correct per page. */
  as?: 'h1' | 'h2' | 'h3';
}

export function SectionHeading({
  icon: Icon,
  title,
  description,
  action,
  as: Tag = 'h2',
}: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-start gap-3">
      {Icon && (
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[#E9FFEC] dark:bg-emerald-950/70 text-[#0F3D2E] dark:text-[#2AD58B]">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <Tag
          className={
            Tag === 'h1'
              ? 'text-2xl font-semibold text-[#0F3D2E] dark:text-[#FAF8F3] sm:text-3xl'
              : 'text-lg font-semibold text-[#0F3D2E] dark:text-[#FAF8F3]'
          }
        >
          {title}
        </Tag>
        {description && <p className="mt-1 text-sm text-[#5C6B64] dark:text-emerald-100/70">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface DataLabelProps {
  /** Provenance is rendered, never hidden — modelled data must not read as measured. */
  source: 'user' | 'sensor' | 'model' | 'demo';
}

const SOURCE_COPY: Record<DataLabelProps['source'], { text: string; className: string }> = {
  user: { text: 'You entered this', className: 'bg-[#E9FFEC] dark:bg-emerald-950/70 text-[#0F3D2E] dark:text-emerald-300' },
  sensor: { text: 'Sensor reading', className: 'bg-[#E9FFEC] dark:bg-emerald-950/70 text-[#0F3D2E] dark:text-emerald-300' },
  model: { text: 'AI estimate', className: 'bg-[#FEF3C7] dark:bg-amber-950/70 text-[#92400E] dark:text-amber-300' },
  demo: { text: 'Illustrative demo data', className: 'bg-[#FEF3C7] dark:bg-amber-950/70 text-[#92400E] dark:text-amber-300' },
};

export function DataLabel({ source }: DataLabelProps) {
  const { text, className } = SOURCE_COPY[source];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium font-mono ${className}`}
    >
      {text}
    </span>
  );
}
