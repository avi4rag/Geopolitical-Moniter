// ─── Impact Rules Library ─────────────────────────────────────────────────────
// Defines the domain-impact rules for every geopolitical event type.
//
// HOW RULES WORK:
//   Each rule describes a causal relationship:
//   "IF an event of type X occurs with severity Y affecting sector Z
//    THEN domain D is impacted with direction V at confidence C"
//
// MATCHING LOGIC (AND conditions):
//   - eventTypes:  event.eventType must be in this list  (omit = match all)
//   - severity:    event.severity must be in this list   (omit = match all)
//   - sectors:     event.sectors must intersect this list (omit = match all)
//   - countries:   event.countries must intersect this  (omit = match all)
//
// CONFIDENCE:
//   baseConfidence is adjusted ±0.05 by severity in the engine.
//   Final score is clamped to [0.40, 0.98].
//
// ADDING NEW RULES:
//   1. Add a rule object here with a unique `id`
//   2. Rules are picked up automatically — no code changes needed
// ─────────────────────────────────────────────────────────────────────────────

export const IMPACT_RULES = Object.freeze([

  // ── SANCTION RULES ─────────────────────────────────────────────────────────

  {
    id: 'sanction-trade-negative',
    name: 'Sanctions reduce bilateral trade',
    description: 'Sanctions restrict imports/exports and trigger retaliatory trade measures.',
    eventTypes: ['SANCTION'],
    severity: ['MEDIUM', 'HIGH', 'CRITICAL'],
    // No sector filter — all sanctions affect trade
    domain: 'TRADE',
    direction: 'NEGATIVE',
    baseConfidence: 0.80,
  },
  {
    id: 'sanction-financial-negative',
    name: 'Sanctions freeze assets and restrict dollar clearing',
    description: 'Financial sanctions cut off SWIFT access, freeze reserves, and spike CDS spreads.',
    eventTypes: ['SANCTION'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'FINANCIAL_MARKETS',
    direction: 'NEGATIVE',
    baseConfidence: 0.86,
  },
  {
    id: 'sanction-currency-negative',
    name: 'Sanctions cause currency depreciation',
    description: 'Loss of dollar-clearing access and reserve freezes pressure the targeted currency.',
    eventTypes: ['SANCTION'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'CURRENCY',
    direction: 'NEGATIVE',
    baseConfidence: 0.82,
  },
  {
    id: 'sanction-energy-negative',
    name: 'Energy-targeted sanctions cause supply disruption',
    description: 'Sanctions on energy producers reduce global supply and increase oil/gas prices.',
    eventTypes: ['SANCTION'],
    sectors: ['Energy'],
    domain: 'ENERGY',
    direction: 'NEGATIVE',
    baseConfidence: 0.88,
  },
  {
    id: 'sanction-oilgas-negative',
    name: 'Energy sanctions spike oil prices',
    description: 'Removal of a major producer from global markets raises oil prices.',
    eventTypes: ['SANCTION'],
    sectors: ['Energy'],
    domain: 'OIL_AND_GAS',
    direction: 'NEGATIVE',
    baseConfidence: 0.85,
  },
  {
    id: 'sanction-tech-semiconductor-negative',
    name: 'Technology sanctions restrict chip access',
    description: 'Chip export controls cut off advanced semiconductor supply chains.',
    eventTypes: ['SANCTION', 'EXPORT_RESTRICTION'],
    sectors: ['Technology'],
    domain: 'SEMICONDUCTORS',
    direction: 'NEGATIVE',
    baseConfidence: 0.84,
  },
  {
    id: 'sanction-tech-technology-negative',
    name: 'Tech sanctions limit software and hardware access',
    description: 'Sanctions block enterprise software licences and hardware imports.',
    eventTypes: ['SANCTION', 'EXPORT_RESTRICTION'],
    sectors: ['Technology'],
    domain: 'TECHNOLOGY',
    direction: 'NEGATIVE',
    baseConfidence: 0.80,
  },
  {
    id: 'sanction-diplomacy-negative',
    name: 'Sanctions signal diplomatic deterioration',
    description: 'Imposing sanctions represents a significant diplomatic escalation.',
    eventTypes: ['SANCTION'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'DIPLOMACY',
    direction: 'NEGATIVE',
    baseConfidence: 0.75,
  },

  // ── MILITARY CONFLICT RULES ─────────────────────────────────────────────────

  {
    id: 'military-global-stability-negative',
    name: 'Military conflict destabilises the region',
    description: 'Active armed conflict increases regional instability and refugee flows.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['MEDIUM', 'HIGH', 'CRITICAL'],
    domain: 'GLOBAL_STABILITY',
    direction: 'NEGATIVE',
    baseConfidence: 0.92,
  },
  {
    id: 'military-energy-risk',
    name: 'Conflict near producing regions raises energy supply risk',
    description: 'Fighting near oil/gas infrastructure or shipping lanes creates supply risk.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'ENERGY',
    direction: 'RISK_INCREASE',
    baseConfidence: 0.82,
  },
  {
    id: 'military-oilgas-risk',
    name: 'War threatens oil production and tanker routes',
    description: 'Armed conflict risks pipeline/port damage and Strait passage disruption.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'OIL_AND_GAS',
    direction: 'RISK_INCREASE',
    baseConfidence: 0.78,
  },
  {
    id: 'military-supply-chain-negative',
    name: 'Military conflict disrupts logistics and supply chains',
    description: 'Conflict closes ports, damages roads, and reroutes shipping.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['MEDIUM', 'HIGH', 'CRITICAL'],
    domain: 'SUPPLY_CHAIN',
    direction: 'NEGATIVE',
    baseConfidence: 0.78,
  },
  {
    id: 'military-trade-negative',
    name: 'War reduces trade with the affected region',
    description: 'Active conflict makes commerce with and through the region impractical.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'TRADE',
    direction: 'NEGATIVE',
    baseConfidence: 0.75,
  },
  {
    id: 'military-inflation-negative',
    name: 'War drives commodity-price inflation',
    description: 'Conflict disrupts food and fuel supply, pushing consumer prices higher globally.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'INFLATION',
    direction: 'NEGATIVE',
    baseConfidence: 0.80,
  },
  {
    id: 'military-financial-negative',
    name: 'War creates financial-market risk-off sentiment',
    description: 'Conflict triggers safe-haven flows, equity sell-offs, and bond volatility.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'FINANCIAL_MARKETS',
    direction: 'NEGATIVE',
    baseConfidence: 0.82,
  },
  {
    id: 'military-diplomacy-negative',
    name: 'Military escalation breaks down diplomatic channels',
    description: 'Armed conflict destroys bilateral relations and blocks multilateral negotiation.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'DIPLOMACY',
    direction: 'NEGATIVE',
    baseConfidence: 0.88,
  },

  // ── TRADE RESTRICTION RULES ─────────────────────────────────────────────────

  {
    id: 'trade-restriction-trade-negative',
    name: 'Trade restrictions reduce commerce',
    description: 'Tariffs and non-tariff barriers reduce trade volumes and raise costs.',
    eventTypes: ['TRADE_RESTRICTION', 'IMPORT_RESTRICTION', 'EXPORT_RESTRICTION'],
    domain: 'TRADE',
    direction: 'NEGATIVE',
    baseConfidence: 0.85,
  },
  {
    id: 'trade-restriction-supply-chain-negative',
    name: 'Trade restrictions disrupt supply chains',
    description: 'Restrictions on inputs or components cascade through manufacturing supply chains.',
    eventTypes: ['TRADE_RESTRICTION', 'EXPORT_RESTRICTION'],
    domain: 'SUPPLY_CHAIN',
    direction: 'NEGATIVE',
    baseConfidence: 0.80,
  },
  {
    id: 'trade-restriction-inflation-negative',
    name: 'Import restrictions raise consumer prices',
    description: 'Import barriers reduce supply options and pass tariff costs to consumers.',
    eventTypes: ['TRADE_RESTRICTION', 'IMPORT_RESTRICTION'],
    domain: 'INFLATION',
    direction: 'NEGATIVE',
    baseConfidence: 0.75,
  },
  {
    id: 'export-restriction-semiconductor-negative',
    name: 'Export controls restrict semiconductor supply',
    description: 'Controls on chip exports create shortages in downstream electronics.',
    eventTypes: ['EXPORT_RESTRICTION'],
    sectors: ['Technology'],
    domain: 'SEMICONDUCTORS',
    direction: 'NEGATIVE',
    baseConfidence: 0.88,
  },
  {
    id: 'export-restriction-agriculture-negative',
    name: 'Agricultural export bans raise global food prices',
    description: 'Blocking grain/fertiliser exports tightens global supply and spikes prices.',
    eventTypes: ['EXPORT_RESTRICTION'],
    sectors: ['Agriculture'],
    domain: 'FOOD_AGRICULTURE',
    direction: 'NEGATIVE',
    baseConfidence: 0.88,
  },

  // ── DIPLOMATIC RULES ─────────────────────────────────────────────────────────

  {
    id: 'diplomatic-agreement-diplomacy-positive',
    name: 'Diplomatic agreements strengthen bilateral relations',
    description: 'Formal agreements create cooperation frameworks and reduce tensions.',
    eventTypes: ['DIPLOMATIC_AGREEMENT', 'TREATY'],
    domain: 'DIPLOMACY',
    direction: 'POSITIVE',
    baseConfidence: 0.82,
  },
  {
    id: 'diplomatic-agreement-trade-positive',
    name: 'Trade agreements expand commerce',
    description: 'Agreements removing barriers increase bilateral trade and investment.',
    eventTypes: ['DIPLOMATIC_AGREEMENT', 'TREATY'],
    sectors: ['Trade'],
    domain: 'TRADE',
    direction: 'POSITIVE',
    baseConfidence: 0.78,
  },
  {
    id: 'diplomatic-agreement-stability-positive',
    name: 'Agreements improve regional stability',
    description: 'Peace deals and cooperation agreements reduce geopolitical risk.',
    eventTypes: ['DIPLOMATIC_AGREEMENT', 'TREATY'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'GLOBAL_STABILITY',
    direction: 'POSITIVE',
    baseConfidence: 0.75,
  },
  {
    id: 'political-crisis-diplomacy-negative',
    name: 'Political crises strain diplomatic relations',
    description: 'Instability in key countries disrupts diplomatic engagement.',
    eventTypes: ['POLITICAL_CRISIS'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'DIPLOMACY',
    direction: 'NEGATIVE',
    baseConfidence: 0.76,
  },
  {
    id: 'political-crisis-stability-negative',
    name: 'Political crises destabilise the region',
    description: 'Regime instability increases geopolitical risk for neighbours and investors.',
    eventTypes: ['POLITICAL_CRISIS'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'GLOBAL_STABILITY',
    direction: 'NEGATIVE',
    baseConfidence: 0.80,
  },
  {
    id: 'election-diplomacy-risk',
    name: 'Elections create foreign-policy uncertainty',
    description: 'Leadership change may shift trade, alliance, and sanctions policy.',
    eventTypes: ['ELECTION'],
    domain: 'DIPLOMACY',
    direction: 'RISK_INCREASE',
    baseConfidence: 0.65,
  },

  // ── RESOURCE DISRUPTION RULES ─────────────────────────────────────────────

  {
    id: 'resource-disruption-energy-negative',
    name: 'Resource disruptions reduce energy supply',
    description: 'Supply-side shocks in energy resources drive immediate price spikes.',
    eventTypes: ['RESOURCE_DISRUPTION'],
    domain: 'ENERGY',
    direction: 'NEGATIVE',
    baseConfidence: 0.87,
  },
  {
    id: 'resource-disruption-oilgas-negative',
    name: 'Oil and gas supply disruptions raise prices',
    description: 'Disruptions to oil production or gas pipelines directly raise energy costs.',
    eventTypes: ['RESOURCE_DISRUPTION'],
    sectors: ['Energy'],
    domain: 'OIL_AND_GAS',
    direction: 'NEGATIVE',
    baseConfidence: 0.90,
  },
  {
    id: 'resource-disruption-food-agriculture',
    name: 'Agricultural disruptions increase food insecurity',
    description: 'Crop failures or supply disruptions drive food price inflation globally.',
    eventTypes: ['RESOURCE_DISRUPTION'],
    sectors: ['Agriculture'],
    domain: 'FOOD_AGRICULTURE',
    direction: 'NEGATIVE',
    baseConfidence: 0.88,
  },
  {
    id: 'resource-disruption-inflation',
    name: 'Resource disruptions feed through to broad inflation',
    description: 'Energy and food supply shocks are the primary drivers of imported inflation.',
    eventTypes: ['RESOURCE_DISRUPTION'],
    domain: 'INFLATION',
    direction: 'NEGATIVE',
    baseConfidence: 0.82,
  },

  // ── POLICY CHANGE RULES ───────────────────────────────────────────────────

  {
    id: 'policy-change-diplomacy-neutral',
    name: 'Policy changes alter foreign relations',
    description: 'Significant policy shifts may improve or worsen bilateral relations.',
    eventTypes: ['POLICY_CHANGE', 'GEOPOLITICAL_ANNOUNCEMENT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'DIPLOMACY',
    direction: 'RISK_INCREASE',
    baseConfidence: 0.60,
  },
  {
    id: 'policy-change-defense-risk',
    name: 'Defense policy changes affect regional balance',
    description: 'Military spending or doctrine shifts alter the regional security environment.',
    eventTypes: ['POLICY_CHANGE'],
    sectors: ['Defense'],
    domain: 'DEFENSE',
    direction: 'RISK_INCREASE',
    baseConfidence: 0.68,
  },
]);
