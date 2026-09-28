/**
 * Universal agrochemical dosage & quantity scrubber.
 *
 * An incorrect chemical or fertilizer dosage can severely damage crops, poison soil,
 * or harm farm workers. Because model instruction alone cannot guarantee compliance,
 * all model responses pass through mechanical scrubbing before reaching the UI or TTS.
 */

const DOSAGE_PATTERN =
  /\d+\.?\d*\s*(?:ml|l|litre|liter|litres|liters|g|gm|gms|gram|grams|kg|kgs|kilogram|kilograms|mg|oz|lb|lbs|%|percent|ppm|quintal|ton|tonnes?)\b|\bper\s+(?:litre|liter|l|acre|hectare|ha|plant|tree|tank|spray|m2|sqm|meter|metre)\b|\/\s*(?:l|litre|liter|acre|ha|hectare|sqm|m2)\b|\b(?:ratio|dilution|dilute)\s+(?:of\s+)?\d+:\d+\b|\b\d+\s*:\s*\d+\s*(?:ratio|dilution)?\b|\b\d+\s*(?:to|-)\s*\d+\s*(?:ml|g|kg|l|litres?|grams?)\b/i;

const LABEL_GUIDANCE = 'follow the product label and local agricultural extension advice for quantities';

const TRAILING_CONNECTORS =
  /[\s,;:@–—-]*\b(?:at|of|with|using|to|in|per|every|dose|dosage|rate|rates|amount|amounts|quantity|quantities|a|an|the|around|about|approx|approximately)\b[\s,;:@–—-]*$/i;

/**
 * Scrubs numeric dosages and mixing concentrations from a single string.
 * Retains agronomic concepts, chemical names, and action verbs while replacing quantities.
 */
export function scrubDosageText(text: string): string {
  if (!text || typeof text !== 'string') return text;
  if (!DOSAGE_PATTERN.test(text)) return text;

  const firstDigit = text.search(/\d/);
  let prefix = (firstDigit === -1 ? text : text.slice(0, firstDigit))
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Strip trailing connectors iteratively
  for (let pass = 0; pass < 5 && TRAILING_CONNECTORS.test(prefix); pass += 1) {
    prefix = prefix.replace(TRAILING_CONNECTORS, '').trim();
  }
  prefix = prefix.replace(/[.,;:]$/, '').trim();

  // If prefix meaningfully describes an action/product (at least 8 chars and multiple words)
  const meaningful = prefix.length >= 8 && /\s/.test(prefix);

  return meaningful
    ? `${prefix} — ${LABEL_GUIDANCE}`
    : `A locally approved product or practice may be applied — ${LABEL_GUIDANCE}`;
}

/**
 * Scrubs dosages across an array of string items.
 */
export function scrubDosages(items: string[]): string[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => scrubDosageText(item));
}
