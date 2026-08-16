import { GuardianProvider } from './GuardianProvider.js';
import { NewsApiProvider } from './NewsApiProvider.js';
import { Source } from '../models/index.js';
import { logger } from '../config/logger.js';

// ─── Provider Registry ────────────────────────────────────────────────────────
// Maps source domains to their provider classes.
// Returns instantiated providers with their DB source IDs injected.
//
// Adding a new provider:
//   1. Create a new class extending BaseProvider
//   2. Add it to PROVIDER_MAP below
//   3. Add the source to seedSources.js
// ─────────────────────────────────────────────────────────────────────────────

const PROVIDER_MAP = {
  'theguardian.com': GuardianProvider,
  'newsapi.org': NewsApiProvider,
};

/**
 * Build and return all active providers with their DB source IDs.
 * Only returns providers for sources that are active in the DB.
 *
 * @returns {Promise<BaseProvider[]>}
 */
export async function getActiveProviders() {
  // Find all active sources that have a provider implementation
  const activeDomains = Object.keys(PROVIDER_MAP);
  const sources = await Source.find({
    domain: { $in: activeDomains },
    active: true,
  }).lean();

  if (sources.length === 0) {
    logger.warn('No active sources with providers found in DB. Run npm run seed:sources first.');
    return [];
  }

  const providers = sources.map((source) => {
    const ProviderClass = PROVIDER_MAP[source.domain];
    const provider = new ProviderClass(source._id);
    logger.debug({ name: source.name, domain: source.domain }, 'Provider ready');
    return provider;
  });

  logger.info({ count: providers.length }, 'Active providers loaded');
  return providers;
}

/**
 * Get a single provider by domain name.
 * @param {string} domain
 * @returns {Promise<BaseProvider|null>}
 */
export async function getProviderByDomain(domain) {
  const source = await Source.findOne({ domain, active: true }).lean();
  if (!source) return null;

  const ProviderClass = PROVIDER_MAP[domain];
  if (!ProviderClass) return null;

  return new ProviderClass(source._id);
}
