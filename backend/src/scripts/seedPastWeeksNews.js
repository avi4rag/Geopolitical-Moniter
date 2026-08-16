import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Article, Event, ImpactAssessment, Source } from '../models/index.js';
import { runImpactAssessment } from '../services/impact/impactService.js';
import crypto from 'crypto';

// ─── Seed Past Weeks News & Comprehensive Impact Intelligence ─────────────────
// Populates MongoDB Atlas with diverse geopolitical stories spanning the past 4 weeks
// with full event dossiers, positive opportunities, and multi-domain impact evaluations.
// ─────────────────────────────────────────────────────────────────────────────

const HISTORICAL_STORIES = [
  {
    title: 'EU and Mercosur Finalize Landmark Clean Trade and Energy Strategic Accord',
    publisher: 'The Guardian',
    domain: 'theguardian.com',
    url: 'https://www.theguardian.com/world/2026/jul/28/eu-mercosur-clean-trade-energy-pact',
    publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
    fullText: 'Brussels and South American trade leaders have finalized a landmark bilateral trade and clean energy framework. The agreement eliminates tariffs on 90% of industrial exports while establishing a guaranteed green hydrogen and lithium supply corridor between South America and European manufacturing hubs.',
    event: {
      eventType: 'TREATY',
      summary: 'EU and Mercosur finalize comprehensive bilateral trade and clean energy corridor agreement eliminating industrial tariffs and securing critical mineral supply chains.',
      severity: 'HIGH',
      countries: ['Germany', 'Brazil', 'Argentina', 'France'],
      regions: ['Europe', 'South America'],
      sectors: ['Trade', 'Energy', 'Transportation'],
      entities: ['European Union', 'Mercosur Trade Bloc', 'European Commission'],
      facts: [
        'Eliminates tariffs on 90% of mutual industrial merchandise trade over 5 years.',
        'Establishes guaranteed green hydrogen and lithium supply corridor.',
        'Includes enforceable environmental compliance standards for deforestation reduction.'
      ],
      uncertainties: [
        'National parliamentary ratification schedules across 4 South American member states.'
      ],
      credibilityScore: 0.94,
      credibilityLabel: 'CONFIRMED',
      processingStatus: 'ANALYZED',
    }
  },
  {
    title: 'Major Natural Gas and Helium Reserve Discovered in Eastern Mediterranean Basin',
    publisher: 'Reuters',
    domain: 'reuters.com',
    url: 'https://www.reuters.com/business/energy/eastern-med-gas-discovery-2026-08-02/',
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    fullText: 'Energy exploration consortia have confirmed a massive 4.2 trillion cubic feet natural gas and industrial helium reservoir off the coast of Cyprus and Greece, significantly bolstering Southern European energy independence and diversifying supplies away from volatile transit routes.',
    event: {
      eventType: 'GEOPOLITICAL_ANNOUNCEMENT',
      summary: 'Confirmation of 4.2 Tcf natural gas and industrial helium reservoir in Eastern Mediterranean bolsters European energy resilience and eases medium-term power generation costs.',
      severity: 'HIGH',
      countries: ['Greece', 'Cyprus', 'Italy'],
      regions: ['Europe', 'Middle East'],
      sectors: ['Energy', 'Technology'],
      entities: ['Eni Energy', 'TotalEnergies', 'Hellenic Hydrocarbons Authority'],
      facts: [
        'Proven recoverable reserves estimated at 4.2 trillion cubic feet of natural gas.',
        'Contains commercially viable concentrations of helium critical for semiconductor manufacturing.',
        'First commercial extraction targeted for late 2027.'
      ],
      uncertainties: [
        'Maritime border delimitation disputes with non-signatory regional neighbors.'
      ],
      credibilityScore: 0.92,
      credibilityLabel: 'CONFIRMED',
      processingStatus: 'ANALYZED',
    }
  },
  {
    title: 'United States and Japan Announce $15 Billion Joint Semiconductor R&D Alliance',
    publisher: 'The Guardian',
    domain: 'theguardian.com',
    url: 'https://www.theguardian.com/technology/2026/aug/05/us-japan-semiconductor-research-alliance',
    publishedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
    fullText: 'The US Department of Commerce and Japan Ministry of Economy have launched a joint $15 billion advanced packaging and 2nm semiconductor research initiative to secure high-performance computing components against geopolitical disruptions.',
    event: {
      eventType: 'POLICY_CHANGE',
      summary: 'United States and Japan establish $15B semiconductor and advanced packaging alliance to accelerate sub-2nm chip fabrication and supply chain resilience.',
      severity: 'MEDIUM',
      countries: ['United States', 'Japan'],
      regions: ['North America', 'East Asia'],
      sectors: ['Technology', 'Trade'],
      entities: ['US Department of Commerce', 'METI Japan', 'Leading-edge Semiconductor Technology Center'],
      facts: [
        '$15B combined capital pool for sub-2nm fabrication R&D and advanced packaging pilot lines.',
        'Includes reciprocal visa access for microelectronics engineers and material scientists.'
      ],
      uncertainties: [
        'Private sector matching fund timelines across participating semiconductor tool manufacturers.'
      ],
      credibilityScore: 0.95,
      credibilityLabel: 'CONFIRMED',
      processingStatus: 'ANALYZED',
    }
  },
  {
    title: 'Red Sea Maritime Security Coalition Reports 45% Drop in Commercial Vessel Diversions',
    publisher: 'The Guardian',
    domain: 'theguardian.com',
    url: 'https://www.theguardian.com/world/2026/aug/08/red-sea-shipping-corridor-restoration-drop-diversions',
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    fullText: 'Commercial maritime traffic through the Bab-el-Mandeb strait has rebounded by 45% over the past fortnight following enhanced multinational escort patrols and naval surveillance pacts, substantially lowering ocean freight spot rates between Asia and European ports.',
    event: {
      eventType: 'DIPLOMATIC_AGREEMENT',
      summary: 'Multinational naval security framework restores commercial container transit in Red Sea, cutting Asia-Europe shipping transit times and container spot freight rates.',
      severity: 'MEDIUM',
      countries: ['Egypt', 'Saudi Arabia', 'United Kingdom', 'United States'],
      regions: ['Middle East', 'Africa'],
      sectors: ['Transportation', 'Trade', 'Energy'],
      entities: ['Combined Maritime Forces', 'International Maritime Organization', 'Suez Canal Authority'],
      facts: [
        'Commercial vessel traffic through Suez/Bab-el-Mandeb increased by 45% in early August.',
        'Average container freight spot rate between Shanghai and Rotterdam fell 18% in two weeks.'
      ],
      uncertainties: [
        'Sustainability of escort operations in the event of new asymmetric shoreline threats.'
      ],
      credibilityScore: 0.90,
      credibilityLabel: 'LIKELY',
      processingStatus: 'ANALYZED',
    }
  },
  {
    title: 'UN and Turkey Brokered Black Sea Agricultural Transit Accord Renewed for 18 Months',
    publisher: 'The Guardian',
    domain: 'theguardian.com',
    url: 'https://www.theguardian.com/world/2026/aug/10/black-sea-grain-corridor-renewed-18-months',
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    fullText: 'Negotiators in Istanbul have secured an 18-month extension of the Black Sea grain and fertilizer transit agreement. The accord guarantees safe navigation for bulk carriers delivering wheat, barley, and ammonia fertilizers to North African and Middle Eastern markets, easing global food commodity price pressures.',
    event: {
      eventType: 'TREATY',
      summary: 'Renewal of Black Sea agricultural safe-passage corridor guarantees grain and fertilizer export flows, significantly easing global food inflation risks.',
      severity: 'HIGH',
      countries: ['Turkey', 'Ukraine', 'Egypt'],
      regions: ['Eastern Europe', 'Middle East', 'Africa'],
      sectors: ['Food & Agriculture', 'Trade', 'Transportation'],
      entities: ['United Nations', 'Joint Coordination Centre Istanbul', 'World Food Programme'],
      facts: [
        '18-month safe navigation guarantee for commercial grain and fertilizer vessels.',
        'UN-inspected cargo handling in designated maritime security zones.',
        'Global wheat futures dropped 4.2% following the formal signing ceremony.'
      ],
      uncertainties: [
        'Port infrastructure maintenance funding in active coastal regions.'
      ],
      credibilityScore: 0.96,
      credibilityLabel: 'CONFIRMED',
      processingStatus: 'ANALYZED',
    }
  },
  {
    title: 'G7 and Partner Nations Implement Harmonized Strategic Critical Mineral Price Floor',
    publisher: 'The Guardian',
    domain: 'theguardian.com',
    url: 'https://www.theguardian.com/business/2026/aug/12/g7-critical-minerals-price-floor-accord',
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    fullText: 'G7 finance ministers have agreed to establish a coordinated price floor mechanism for domestic and allied critical mineral mining (including cobalt, nickel, and gallium), shielding allied producers from predatory export pricing and encouraging long-term private capital investment.',
    event: {
      eventType: 'POLICY_CHANGE',
      summary: 'G7 coordinates strategic price support floor for critical battery and semiconductor minerals to protect domestic mining investments from foreign price manipulation.',
      severity: 'MEDIUM',
      countries: ['United States', 'Canada', 'Australia', 'Japan', 'Germany'],
      regions: ['North America', 'Europe', 'East Asia'],
      sectors: ['Mining', 'Technology', 'Trade'],
      entities: ['G7 Finance Ministers', 'International Energy Agency', 'Critical Minerals Security Alliance'],
      facts: [
        'Establishes minimum purchase price guarantees for battery-grade nickel, lithium, and gallium.',
        'Coordinates strategic national stockpiling reserves across all participating member countries.'
      ],
      uncertainties: [
        'Fiscal budget allocations for stockpile storage management across member nations.'
      ],
      credibilityScore: 0.91,
      credibilityLabel: 'LIKELY',
      processingStatus: 'ANALYZED',
    }
  }
];

async function seedPastWeeks() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(env.mongoUri);
  console.log('Connected.');

  // Find or create primary source
  let guardianSource = await Source.findOne({ domain: 'theguardian.com' });
  if (!guardianSource) {
    guardianSource = await Source.create({
      name: 'The Guardian',
      domain: 'theguardian.com',
      type: 'MAINSTREAM_NEWS',
      reliabilityScore: 0.88,
      active: true,
    });
  }

  let createdCount = 0;

  for (const story of HISTORICAL_STORIES) {
    let article = await Article.findOne({ url: story.url });
    if (!article) {
      const contentHash = crypto.createHash('sha256').update(story.fullText).digest('hex');
      article = await Article.create({
        sourceId: guardianSource._id,
        url: story.url,
        title: story.title,
        contentHash,
        fullText: story.fullText,
        excerpt: story.fullText.slice(0, 160) + '...',
        publishedAt: story.publishedAt,
        relevanceScore: 0.92,
        isRelevant: true,
        processingStatus: 'ANALYZED',
        relevanceExplanation: 'Historical geopolitical story from past weeks.',
      });
    }

    const existingEvent = await Event.findOne({ summary: story.event.summary });
    if (existingEvent) {
      console.log(`- Event already exists: "${story.title.slice(0, 40)}..."`);
      continue;
    }

    // Create event
    const event = await Event.create({
      ...story.event,
      primaryArticleId: article._id,
      articleIds: [article._id],
      createdAt: story.publishedAt,
      extractionMetadata: {
        provider: 'gemini',
        modelName: 'GeoMonitor AI',
        promptVersion: 'v1.0',
        inputTokens: 420,
        outputTokens: 280,
      }
    });

    createdCount++;
    console.log(`+ Seeded event: "${event.summary.slice(0, 50)}..."`);
  }

  console.log('Running deterministic multi-domain impact assessment on all events...');
  const impactResult = await runImpactAssessment({ force: true });

  const totalEvents = await Event.countDocuments();
  const totalImpacts = await ImpactAssessment.countDocuments({ supersededAt: null });

  console.log(`\n========================================`);
  console.log(`Past weeks news seeding complete!`);
  console.log(`Newly seeded events: ${createdCount}`);
  console.log(`Impact assessments generated/active: ${impactResult.assessmentsCreated}`);
  console.log(`Total Events in database: ${totalEvents}`);
  console.log(`Total Active Impacts in database: ${totalImpacts}`);
  console.log(`========================================`);

  await mongoose.disconnect();
}

seedPastWeeks().catch((err) => {
  console.error('Failed to seed past weeks news:', err);
  process.exit(1);
});
