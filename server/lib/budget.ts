/**
 * Soft per-provider daily request budget.
 *
 * This is a courtesy guard, not a source of truth. Two honest caveats:
 *   1. Counters live in memory, so a serverless cold start resets them.
 *   2. Google resets requests-per-day at midnight Pacific, not UTC.
 * The authoritative signal is always a 429 from the provider, which the registry
 * treats as an immediate demotion. The budget just lets us demote *before*
 * burning the last few requests, so a demo never dies mid-sentence.
 */

import { env } from './env.ts';
import { log } from './logger.ts';

/** Below this fraction of budget we keep using the preferred provider. */
const PREEMPT_AT = 0.8;

interface Counter {
  /** Pacific calendar day, matching Gemini's RPD reset boundary. */
  day: string;
  count: number;
  /** Set when a provider returned 429 — sticky for the rest of the day. */
  exhausted: boolean;
}

const counters = new Map<string, Counter>();

function pacificDay(now = new Date()): string {
  // en-CA gives YYYY-MM-DD.
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

function counterFor(providerId: string): Counter {
  const day = pacificDay();
  const existing = counters.get(providerId);
  if (existing && existing.day === day) return existing;
  const fresh: Counter = { day, count: 0, exhausted: false };
  counters.set(providerId, fresh);
  return fresh;
}

export const budget = {
  /** False when the provider should be skipped for the rest of the day. */
  allows(providerId: string): boolean {
    const counter = counterFor(providerId);
    if (counter.exhausted) return false;
    return counter.count < Math.floor(env.dailyRequestBudget * PREEMPT_AT);
  },

  record(providerId: string): void {
    counterFor(providerId).count += 1;
  },

  /** Called when a provider reports quota exhaustion (HTTP 429). */
  markExhausted(providerId: string): void {
    const counter = counterFor(providerId);
    if (!counter.exhausted) {
      counter.exhausted = true;
      log.warn('provider marked exhausted for the day', { providerId, used: counter.count });
    }
  },

  snapshot(providerId: string): { used: number; budget: number; exhausted: boolean } {
    const counter = counterFor(providerId);
    return {
      used: counter.count,
      budget: env.dailyRequestBudget,
      exhausted: counter.exhausted || !this.allows(providerId),
    };
  },

  /** Test/rehearsal helper: clear all counters. */
  reset(): void {
    counters.clear();
  },
};
