

import { log } from './logger.ts';

try {
  process.loadEnvFile('.env');
} catch {
  log.warn('no .env found — provider chain will fall through to Demo Mode');
}
