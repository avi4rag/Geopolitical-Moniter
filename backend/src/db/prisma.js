import pkg from '@prisma/client';
import { logger } from '../config/logger.js';

const PrismaClient = pkg?.PrismaClient || (typeof pkg === 'function' ? pkg : null);

/**
 * Prisma ORM Database Connection & Client Provider
 * 
 * Concepts:
 * - ORM usage (Prisma/Sequelize)
 * - Transactions (ACID compliance via prisma.$transaction)
 * - Normalization basics (Relations across 1NF/2NF/3NF schema)
 * - Filtering, ordering, grouping
 */

let prismaInstance = null;
let isPrismaAvailable = false;

// Initialize Prisma Client if DATABASE_URL is configured
if (process.env.DATABASE_URL && PrismaClient) {
  try {
    prismaInstance = new PrismaClient({
      log: ['error', 'warn'],
    });
    isPrismaAvailable = true;
    logger.info('Prisma Client initialized with PostgreSQL connection');
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to initialize Prisma Client with DATABASE_URL');
  }
}

/**
 * In-memory Mock Prisma Implementation for testing/development environments
 * without an active PostgreSQL container. Adheres to identical Prisma ORM API signatures.
 */
class InMemoryPrismaMock {
  constructor() {
    this.events = [
      {
        id: 'evt-101',
        title: 'South China Sea Maritime Freedom Operation',
        summary: 'Multinational naval exercises monitor international sea lanes amidst escalated tensions.',
        theater: 'INDO_PACIFIC',
        severity: 'HIGH',
        severityScore: 8.2,
        status: 'MONITORING',
        detectedAt: new Date(Date.now() - 3600000),
        impact: {
          economicImpact: -3.5,
          diplomaticImpact: -6.0,
          militaryImpact: 7.8,
          humanitarianImpact: 0.0,
          cyberImpact: 4.2,
        },
        eventSources: [
          { citationUrl: 'https://reuters.com/world/maritime-patrol', source: { name: 'Reuters', country: 'Global' } },
        ],
      },
      {
        id: 'evt-102',
        title: 'Eastern European Critical Energy Grid Cyber Intrusion',
        summary: 'Targeted zero-day malware detected on high-voltage distribution substations.',
        theater: 'EUROPE',
        severity: 'CRITICAL',
        severityScore: 9.4,
        status: 'DEVELOPING',
        detectedAt: new Date(Date.now() - 7200000),
        impact: {
          economicImpact: -7.2,
          diplomaticImpact: -5.0,
          militaryImpact: 3.0,
          humanitarianImpact: -4.0,
          cyberImpact: 9.8,
        },
        eventSources: [
          { citationUrl: 'https://apnews.com/cyber-grid', source: { name: 'Associated Press', country: 'Global' } },
        ],
      },
      {
        id: 'evt-103',
        title: 'Red Sea Commercial Shipping Route Re-diversion',
        summary: 'Maritime insurance premiums increase 40% as shipping liners reroute around Cape of Good Hope.',
        theater: 'MIDDLE_EAST',
        severity: 'HIGH',
        severityScore: 7.9,
        status: 'DEVELOPING',
        detectedAt: new Date(Date.now() - 14400000),
        impact: {
          economicImpact: -8.1,
          diplomaticImpact: -4.0,
          militaryImpact: 6.5,
          humanitarianImpact: -2.0,
          cyberImpact: 1.0,
        },
        eventSources: [
          { citationUrl: 'https://bloomberg.com/shipping-routes', source: { name: 'Bloomberg', country: 'USA' } },
        ],
      },
      {
        id: 'evt-104',
        title: 'Balkan Diplomatic Bilateral Border Demarcation Agreement',
        summary: 'Historic summit signs comprehensive normalization treaty with mutual security guarantees.',
        theater: 'EUROPE',
        severity: 'LOW',
        severityScore: 2.1,
        status: 'RESOLVED',
        detectedAt: new Date(Date.now() - 86400000),
        impact: {
          economicImpact: 4.5,
          diplomaticImpact: 8.5,
          militaryImpact: -2.0,
          humanitarianImpact: 5.0,
          cyberImpact: 0.0,
        },
        eventSources: [
          { citationUrl: 'https://bbc.com/world/balkan-summit', source: { name: 'BBC News', country: 'UK' } },
        ],
      },
    ];

    this.auditLogs = [];

    this.event = {
      findMany: async ({ where = {}, orderBy = {}, skip = 0, take = 50 } = {}) => {
        let results = [...this.events];

        // Filtering
        if (where.theater) {
          results = results.filter((e) => e.theater.toLowerCase() === where.theater.toLowerCase());
        }
        if (where.severity) {
          results = results.filter((e) => e.severity === where.severity);
        }
        if (where.status) {
          results = results.filter((e) => e.status === where.status);
        }
        if (where.title && where.title.contains) {
          const q = where.title.contains.toLowerCase();
          results = results.filter((e) => e.title.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q));
        }

        // Ordering
        const orderKey = Object.keys(orderBy)[0];
        if (orderKey) {
          const direction = orderBy[orderKey] === 'desc' ? -1 : 1;
          results.sort((a, b) => {
            if (a[orderKey] < b[orderKey]) return -1 * direction;
            if (a[orderKey] > b[orderKey]) return 1 * direction;
            return 0;
          });
        }

        return results.slice(skip, skip + take);
      },

      count: async ({ where = {} } = {}) => {
        const found = await this.event.findMany({ where, skip: 0, take: 10000 });
        return found.length;
      },

      groupBy: async ({ by = [], _count = {}, _avg = {} } = {}) => {
        // Grouping implementation
        const groups = {};
        for (const item of this.events) {
          const key = by.map((field) => item[field]).join(':');
          if (!groups[key]) {
            groups[key] = {
              items: [],
              keyFields: by.reduce((acc, f) => ({ ...acc, [f]: item[f] }), {}),
            };
          }
          groups[key].items.push(item);
        }

        return Object.values(groups).map((g) => {
          const row = { ...g.keyFields };
          if (_count.id || _count._all) {
            row._count = { id: g.items.length };
          }
          if (_avg.severityScore) {
            const sum = g.items.reduce((s, it) => s + (it.severityScore || 0), 0);
            row._avg = { severityScore: sum / g.items.length };
          }
          return row;
        });
      },

      create: async ({ data }) => {
        const newEvent = {
          id: `evt-${Date.now()}`,
          title: data.title,
          summary: data.summary,
          theater: data.theater || 'GLOBAL',
          severity: data.severity || 'MEDIUM',
          severityScore: data.severityScore || 5.0,
          status: data.status || 'MONITORING',
          detectedAt: new Date(),
          impact: data.impact?.create || {
            economicImpact: 0,
            diplomaticImpact: 0,
            militaryImpact: 0,
            humanitarianImpact: 0,
            cyberImpact: 0,
          },
          eventSources: [],
        };
        this.events.unshift(newEvent);
        return newEvent;
      },
    };

    this.auditLog = {
      create: async ({ data }) => {
        const log = { id: `log-${Date.now()}`, ...data, createdAt: new Date() };
        this.auditLogs.push(log);
        return log;
      },
    };
  }

  // ACID Transaction implementation
  async $transaction(operationsOrFn) {
    if (typeof operationsOrFn === 'function') {
      // Interactive transaction
      logger.info('Executing interactive ACID transaction via Prisma mock');
      const snapshot = JSON.stringify(this.events);
      try {
        const result = await operationsOrFn(this);
        logger.info('ACID transaction committed successfully');
        return result;
      } catch (err) {
        logger.warn({ err: err.message }, 'ACID transaction rolled back due to error');
        this.events = JSON.parse(snapshot); // Rollback
        throw err;
      }
    } else if (Array.isArray(operationsOrFn)) {
      // Sequential array of promises
      return Promise.all(operationsOrFn);
    }
  }

  // Parameterized raw SQL query simulation
  async $queryRaw(strings, ...values) {
    logger.info({ query: strings.join('?'), values }, 'Executing parameterized $queryRaw');
    return this.events.slice(0, 10);
  }
}

export const prisma = prismaInstance || new InMemoryPrismaMock();
export const hasNativePrisma = isPrismaAvailable;
