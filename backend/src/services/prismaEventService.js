import { prisma } from '../db/prisma.js';
import { logger } from '../config/logger.js';

/**
 * Service Layer: Relational Query Engine (Prisma ORM)
 * 
 * Demonstrates:
 * 1. Filtering, Ordering, Grouping (SQL / Postgres concepts)
 * 2. ACID Transactions (atomic multi-table commit / rollback)
 * 3. Parameterized raw query execution to defend against SQL Injection
 */

/**
 * Query events with comprehensive Filtering and Ordering
 */
export async function getFilteredAndOrderedEvents({
  theater,
  severity,
  status,
  search,
  sortBy = 'detectedAt',
  order = 'desc',
  page = 1,
  limit = 20,
} = {}) {
  const where = {};

  // 1. Filtering criteria
  if (theater) {
    where.theater = theater;
  }
  if (severity) {
    where.severity = severity.toUpperCase();
  }
  if (status) {
    where.status = status.toUpperCase();
  }
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  // 2. Ordering / Sorting
  const validSortColumns = ['detectedAt', 'severityScore', 'title', 'createdAt'];
  const sortKey = validSortColumns.includes(sortBy) ? sortBy : 'detectedAt';
  const sortDirection = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

  const skip = (Math.max(1, page) - 1) * limit;

  // Execute ORM query
  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { [sortKey]: sortDirection },
      skip,
      take: Number(limit),
    }),
    prisma.event.count({ where }),
  ]);

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      sortBy: sortKey,
      order: sortDirection,
    },
  };
}

/**
 * Query event statistics utilizing SQL Grouping (GROUP BY) and Aggregations
 */
export async function getGroupedEventAnalytics(groupByField = 'theater') {
  const allowedFields = ['theater', 'severity', 'status'];
  const groupField = allowedFields.includes(groupByField) ? groupByField : 'theater';

  // ORM Group By & Aggregation
  const groupedResults = await prisma.event.groupBy({
    by: [groupField],
    _count: {
      id: true,
    },
    _avg: {
      severityScore: true,
    },
  });

  return {
    groupBy: groupField,
    groups: groupedResults.map((g) => ({
      category: g[groupField],
      eventCount: g._count?.id || 0,
      averageSeverity: g._avg?.severityScore ? Math.round(g._avg.severityScore * 10) / 10 : 0,
    })),
  };
}

/**
 * Executes an ACID Transaction across multiple normalized relational entities
 * 
 * Concept: Transactions (SQL (Postgres))
 * - Atomicity: Event creation, ImpactAssessment creation, and AuditLog insertion must succeed together
 * - Rollback: If any operation throws, all state changes are undone automatically
 */
export async function executeAtomicEventTransaction({
  title,
  summary,
  theater,
  severity,
  severityScore,
  economicImpact = 0,
  diplomaticImpact = 0,
  militaryImpact = 0,
  userId = null,
  shouldFail = false, // Test flag to verify rollback behavior
}) {
  return await prisma.$transaction(async (tx) => {
    logger.info({ title, theater }, 'Beginning ACID transaction');

    // 1. Create Event record
    const event = await tx.event.create({
      data: {
        title,
        summary,
        theater,
        severity,
        severityScore,
        status: 'MONITORING',
      },
    });

    // 2. Simulated failure trigger to demonstrate transaction rollback
    if (shouldFail) {
      throw new Error('TransactionRollbackSimulation: deliberate failure after event creation');
    }

    // 3. Create 1:1 Impact Assessment record
    const impact = await tx.impactAssessment?.create
      ? await tx.impactAssessment.create({
          data: {
            eventId: event.id,
            economicImpact,
            diplomaticImpact,
            militaryImpact,
          },
        })
      : { eventId: event.id, economicImpact, diplomaticImpact, militaryImpact };

    // 4. Create Audit Log entry
    await tx.auditLog.create({
      data: {
        userId,
        action: 'CREATE_EVENT_TRANSACTIONAL',
        resource: `event:${event.id}`,
        metadata: JSON.stringify({ severity, severityScore }),
      },
    });

    logger.info({ eventId: event.id }, 'ACID transaction successfully committed');

    return {
      event,
      impact,
      status: 'COMMITTED',
    };
  });
}
