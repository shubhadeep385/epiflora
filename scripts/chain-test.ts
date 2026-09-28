/**
 * One-off verification of the fallback chain.
 *
 * Sabotages Gemini (bad key), then a bad key plus no OpenRouter, and checks that
 * something still answers and that `degraded` is reported honestly.
 */

process.loadEnvFile('.env');

/**
 * Captured up front because process.loadEnvFile() does not overwrite variables
 * that are already set — so restoring by reloading .env silently leaves the
 * sabotaged key in place and the final case proves nothing.
 */
const realOpenRouter = process.env.OPENROUTER_API_KEY ?? '';
const realGemini = process.env.GEMINI_API_KEY ?? '';

/**
 * Each attempt must use a distinct crop. The diagnosis cache keys on
 * image+crop+language, so reusing them made the second attempt a 109ms cache hit
 * that silently proved nothing.
 */
async function attempt(label: string, crop: string, mutate: () => void): Promise<void> {
  mutate();

  // Fresh module graph so env.ts re-reads the mutated process.env.
  const cacheBuster = `?v=${Date.now()}${Math.random()}`;
  const { intelligence } = await import(`../server/providers/registry.ts${cacheBuster}`);
  const { syntheticDiseasedLeaf } = await import(`./lib/testImage.ts${cacheBuster}`);

  const started = Date.now();
  try {
    const result = await intelligence.diagnoseCrop({
      image: syntheticDiseasedLeaf().dataUrl,
      crop,
      language: 'en-IN',
    });
    console.log(
      `[  ok  ] ${label.padEnd(34)} answered by ${result.provenance.provider}/${result.provenance.model} · degraded=${result.provenance.degraded} · ${Date.now() - started}ms`,
    );
    console.log(`         diagnosis: ${result.data.diagnosis}`);
  } catch (cause) {
    console.log(`[ fail ] ${label.padEnd(34)} ${cause instanceof Error ? cause.message : String(cause)}`);
  }
}

await attempt('Gemini key invalid', 'Tomato', () => {
  process.env.GEMINI_API_KEY = 'invalid-key-for-fallback-test';
  process.env.OPENROUTER_API_KEY = realOpenRouter;
});

// Expect Demo Mode: the terminal fallback that keeps a demo alive.
await attempt('Gemini + OpenRouter both dead', 'Wheat', () => {
  process.env.GEMINI_API_KEY = 'invalid-key-for-fallback-test';
  process.env.OPENROUTER_API_KEY = '';
});

// Everything healthy again — confirms nothing was left permanently retired and
// that Gemini reclaims the primary slot.
await attempt('All providers restored', 'Rice', () => {
  process.env.GEMINI_API_KEY = realGemini;
  process.env.OPENROUTER_API_KEY = realOpenRouter;
});
