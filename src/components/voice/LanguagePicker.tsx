import { Languages, Info } from 'lucide-react';
import { LANGUAGES } from '../../lib/reference.ts';
import { useAppStore } from '../../store/appStore.ts';

/**
 * Language selection.
 *
 * Names are shown in their own script, because a farmer looking for Marathi is
 * looking for "मराठी", not the word "Marathi".
 *
 * Saaras v3 understands 23 languages but Bulbul v3 speaks 11, so a language with
 * no voice is labelled honestly as text-only rather than quietly producing silence.
 */
export function LanguagePicker() {
  const language = useAppStore((store) => store.language);
  const setLanguage = useAppStore((store) => store.setLanguage);

  const selected = LANGUAGES.find((option) => option.tag === language);
  const textOnly = selected && !selected.tts;

  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-medium text-forest-800">
        <Languages className="size-4" aria-hidden="true" />
        Your language
      </p>

      <div
        role="radiogroup"
        aria-label="Choose your language"
        className="mt-3 flex flex-wrap gap-2"
      >
        {LANGUAGES.map((option) => {
          const active = option.tag === language;
          return (
            <button
              key={option.tag}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setLanguage(option.tag)}
              className={[
                'min-h-11 rounded-xl px-4 text-sm transition-colors',
                active
                  ? 'bg-forest-700 font-medium text-white'
                  : 'bg-surface text-ink-muted ring-1 ring-inset ring-hairline hover:bg-forest-50 hover:text-forest-700',
              ].join(' ')}
            >
              {option.nativeName}
            </button>
          );
        })}
      </div>

      {textOnly && (
        <p className="mt-3 flex items-start gap-2 text-xs text-clay-700">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {selected?.englishName} is understood when you speak, but has no natural voice yet. Answers
          will be shown as text and read by your device's own voice.
        </p>
      )}
    </div>
  );
}
