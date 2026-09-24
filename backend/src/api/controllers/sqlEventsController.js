import * as prismaService from '../../services/prismaEventService.js';
import { logger } from '../../config/logger.js';

/**
 * Controller: SQL / Relational / ORM Concept Demonstration Endpoints
 */

export async function getSqlEvents(req, res, next) {
  try {
    const { theater, severity, status, search, sortBy, order, page, limit } = req.query;
    const result = await prismaService.getFilteredAndOrderedEvents({
      theater,
      severity,
      status,
      search,
      sortBy,
      order,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });

    res.json({
      status: 'success',
      engine: 'Prisma ORM (PostgreSQL)',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSqlGroupedAnalytics(req, res, next) {
  try {
    const { groupBy } = req.query;
    const result = await prismaService.getGroupedEventAnalytics(groupBy);

    res.json({
      status: 'success',
      concept: 'Filtering, ordering, grouping (SQL GROUP BY)',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function postSqlTransaction(req, res, next) {
  try {
    const {
      title = 'Autonomous Naval Defense Deployment',
      summary = 'Strategic patrol deployment coordinated under international coalition oversight.',
      theater = 'INDO_PACIFIC',
      severity = 'HIGH',
      severityScore = 8.5,
      economicImpact = -2.5,
      diplomaticImpact = 4.0,
      militaryImpact = 7.5,
      shouldFail = false,
    } = req.body;

    const result = await prismaService.executeAtomicEventTransaction({
      title,
      summary,
      theater,
      severity,
      severityScore,
      economicImpact,
      diplomaticImpact,
      militaryImpact,
      userId: req.user?.id || null,
      shouldFail: Boolean(shouldFail),
    });

    res.status(201).json({
      status: 'success',
      concept: 'ACID Transactions (Atomicity, Consistency, Isolation, Durability)',
      data: result,
    });
  } catch (err) {
    if (err.message.includes('TransactionRollbackSimulation')) {
      return res.status(400).json({
        status: 'error',
        code: 'TRANSACTION_ROLLED_BACK',
        message: 'Transaction successfully aborted and state rolled back on error',
        details: err.message,
      });
    }
    next(err);
  }
}
