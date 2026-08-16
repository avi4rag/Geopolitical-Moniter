// ─── Comprehensive Impact Rules Library ───────────────────────────────────────
// Defines deterministic, multi-domain causal impact rules for all geopolitical event types.
// Covers both upside opportunities (POSITIVE / RISK_DECREASE) and downside shocks (NEGATIVE / RISK_INCREASE).
//
// MATCHING LOGIC:
//   - eventTypes: event.eventType must be in this list (omit = match all)
//   - severity:   event.severity must be in this list  (omit = match all)
//   - sectors:    event.sectors must intersect this list (case-insensitive)
//   - countries:  event.countries must intersect this list
// ─────────────────────────────────────────────────────────────────────────────

export const IMPACT_RULES = Object.freeze([

  // ═════════════════════════════════════════════════════════════════════════════
  // 1. DIPLOMATIC & TREATY AGREEMENTS (POSITIVE OPPORTUNITIES & DE-ESCALATION)
  // ═════════════════════════════════════════════════════════════════════════════

  {
    id: 'diplomatic-agreement-diplomacy-positive',
    name: 'Diplomatic accord enhances international cooperation',
    description: 'Formal agreements establish bilateral dispute-resolution mechanisms and de-escalate tensions.',
    eventTypes: ['DIPLOMATIC_AGREEMENT', 'TREATY'],
    domain: 'DIPLOMACY',
    direction: 'POSITIVE',
    baseConfidence: 0.88,
  },
  {
    id: 'diplomatic-agreement-trade-positive',
    name: 'Bilateral agreement expands cross-border trade',
    description: 'Removal of regulatory and tariff barriers expands bilateral merchandise and services trade.',
    eventTypes: ['DIPLOMATIC_AGREEMENT', 'TREATY'],
    sectors: ['Trade', 'Finance', 'Transportation'],
    domain: 'TRADE',
    direction: 'POSITIVE',
    baseConfidence: 0.85,
  },
  {
    id: 'diplomatic-agreement-stability-positive',
    name: 'Peace accords strengthen regional stability',
    description: 'De-escalation agreements reduce armed conflict risks and restore investor confidence.',
    eventTypes: ['DIPLOMATIC_AGREEMENT', 'TREATY'],
    domain: 'GLOBAL_STABILITY',
    direction: 'POSITIVE',
    baseConfidence: 0.84,
  },
  {
    id: 'diplomatic-agreement-financial-risk-decrease',
    name: 'Geopolitical rapprochement reduces market risk premiums',
    description: 'Diplomatic breakthroughs lower sovereign CDS spreads and stimulate capital inflows.',
    eventTypes: ['DIPLOMATIC_AGREEMENT', 'TREATY'],
    domain: 'FINANCIAL_MARKETS',
    direction: 'RISK_DECREASE',
    baseConfidence: 0.80,
  },
  {
    id: 'diplomatic-agreement-supply-chain-positive',
    name: 'Trade accords secure critical transport corridors',
    description: 'Transit and border agreements reduce customs clearance delays and shipping frictions.',
    eventTypes: ['DIPLOMATIC_AGREEMENT', 'TREATY'],
    sectors: ['Transportation', 'Trade', 'Energy'],
    domain: 'SUPPLY_CHAIN',
    direction: 'POSITIVE',
    baseConfidence: 0.82,
  },
  {
    id: 'diplomatic-agreement-tech-cooperation-positive',
    name: 'Technology partnership accelerates joint innovation',
    description: 'Bilateral tech agreements enable cross-border R&D, talent exchange, and research standards.',
    eventTypes: ['DIPLOMATIC_AGREEMENT', 'TREATY', 'POLICY_CHANGE'],
    sectors: ['Technology', 'Defense'],
    domain: 'TECHNOLOGY',
    direction: 'POSITIVE',
    baseConfidence: 0.83,
  },
  {
    id: 'diplomatic-agreement-energy-security-positive',
    name: 'Energy pacts guarantee long-term supply stability',
    description: 'Long-term bilateral energy agreements secure pipeline flows and LNG supply contracts.',
    eventTypes: ['DIPLOMATIC_AGREEMENT', 'TREATY'],
    sectors: ['Energy'],
    domain: 'ENERGY',
    direction: 'POSITIVE',
    baseConfidence: 0.86,
  },
  {
    id: 'diplomatic-agreement-food-security-positive',
    name: 'Agricultural corridor agreements ease food inflation',
    description: 'Safe-transit food agreements ensure grain and fertilizer flows to import-dependent nations.',
    eventTypes: ['DIPLOMATIC_AGREEMENT', 'TREATY'],
    sectors: ['Agriculture', 'Food & Agriculture'],
    domain: 'FOOD_AGRICULTURE',
    direction: 'POSITIVE',
    baseConfidence: 0.87,
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // 2. RESOURCE DISCOVERY & INFRASTRUCTURE EXPANSION (POSITIVE SUPPLY EXPANSION)
  // ═════════════════════════════════════════════════════════════════════════════

  {
    id: 'resource-discovery-energy-positive',
    name: 'New energy discovery enhances domestic supply independence',
    description: 'Discoveries of oil, natural gas, or geothermal reserves expand long-term production capacity.',
    eventTypes: ['RESOURCE_DISCOVERY', 'GEOPOLITICAL_ANNOUNCEMENT'],
    sectors: ['Energy'],
    domain: 'ENERGY',
    direction: 'POSITIVE',
    baseConfidence: 0.90,
  },
  {
    id: 'resource-discovery-oilgas-positive',
    name: 'Hydrocarbon discoveries reduce global supply tightness',
    description: 'Proven hydrocarbon reserves improve long-term supply outlook and moderate future price spikes.',
    eventTypes: ['RESOURCE_DISCOVERY', 'GEOPOLITICAL_ANNOUNCEMENT'],
    sectors: ['Energy'],
    domain: 'OIL_AND_GAS',
    direction: 'POSITIVE',
    baseConfidence: 0.88,
  },
  {
    id: 'resource-discovery-critical-minerals-tech-positive',
    name: 'Critical mineral discovery strengthens semiconductor supply chain',
    description: 'Deposits of lithium, rare earth elements, or silicon reduce vulnerability to foreign export monopolies.',
    eventTypes: ['RESOURCE_DISCOVERY', 'POLICY_CHANGE'],
    sectors: ['Technology', 'Mining', 'Energy'],
    domain: 'SEMICONDUCTORS',
    direction: 'POSITIVE',
    baseConfidence: 0.85,
  },
  {
    id: 'resource-discovery-inflation-risk-decrease',
    name: 'Expanded commodity output relieves inflationary pressures',
    description: 'Increased supply of primary industrial inputs dampens structural production cost inflation.',
    eventTypes: ['RESOURCE_DISCOVERY'],
    domain: 'INFLATION',
    direction: 'RISK_DECREASE',
    baseConfidence: 0.78,
  },
  {
    id: 'resource-discovery-currency-positive',
    name: 'Resource wealth strengthens sovereign currency and balance of payments',
    description: 'Export revenues and foreign direct investment inflows support the domestic exchange rate.',
    eventTypes: ['RESOURCE_DISCOVERY'],
    domain: 'CURRENCY',
    direction: 'POSITIVE',
    baseConfidence: 0.80,
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // 3. PRO-TRADE & STRATEGIC INDUSTRIAL POLICIES (POSITIVE OPPORTUNITIES)
  // ═════════════════════════════════════════════════════════════════════════════

  {
    id: 'policy-tech-subsidy-positive',
    name: 'Strategic tech investments accelerate semiconductor self-sufficiency',
    description: 'Targeted capital subsidies and tax incentives expand domestic wafer fabrication capacity.',
    eventTypes: ['POLICY_CHANGE', 'GEOPOLITICAL_ANNOUNCEMENT'],
    sectors: ['Technology'],
    domain: 'SEMICONDUCTORS',
    direction: 'POSITIVE',
    baseConfidence: 0.84,
  },
  {
    id: 'policy-trade-liberalization-positive',
    name: 'Tariff reductions stimulate export volumes',
    description: 'Lower customs duties reduce input costs for manufacturers and enhance export competitiveness.',
    eventTypes: ['POLICY_CHANGE', 'DIPLOMATIC_AGREEMENT'],
    sectors: ['Trade'],
    domain: 'TRADE',
    direction: 'POSITIVE',
    baseConfidence: 0.83,
  },
  {
    id: 'policy-energy-transition-positive',
    name: 'Grid and renewables investments improve energy resilience',
    description: 'Diversification into nuclear, wind, and solar insulates national economies from fossil fuel price volatility.',
    eventTypes: ['POLICY_CHANGE'],
    sectors: ['Energy'],
    domain: 'ENERGY',
    direction: 'POSITIVE',
    baseConfidence: 0.81,
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // 4. SANCTIONS & ECONOMIC COERCION (DOWNSIDE SHOCKS)
  // ═════════════════════════════════════════════════════════════════════════════

  {
    id: 'sanction-trade-negative',
    name: 'Sanctions reduce bilateral commerce',
    description: 'Sanctions restrict import/export licenses and trigger reciprocal retaliatory measures.',
    eventTypes: ['SANCTION'],
    severity: ['MEDIUM', 'HIGH', 'CRITICAL'],
    domain: 'TRADE',
    direction: 'NEGATIVE',
    baseConfidence: 0.82,
  },
  {
    id: 'sanction-financial-negative',
    name: 'Financial sanctions restrict capital access and payment clearing',
    description: 'Asset freezes and banking cut-offs restrict sovereign credit and heighten market volatility.',
    eventTypes: ['SANCTION'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'FINANCIAL_MARKETS',
    direction: 'NEGATIVE',
    baseConfidence: 0.86,
  },
  {
    id: 'sanction-currency-negative',
    name: 'Sanctions trigger currency depreciation and capital flight',
    description: 'Restrictions on reserve assets and dollar-clearing access put downward pressure on target currencies.',
    eventTypes: ['SANCTION'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'CURRENCY',
    direction: 'NEGATIVE',
    baseConfidence: 0.82,
  },
  {
    id: 'sanction-energy-negative',
    name: 'Energy sanctions curtail global oil and gas supply',
    description: 'Embargoes on major oil and gas exporters tighten global balance and raise global fuel costs.',
    eventTypes: ['SANCTION'],
    sectors: ['Energy'],
    domain: 'ENERGY',
    direction: 'NEGATIVE',
    baseConfidence: 0.88,
  },
  {
    id: 'sanction-oilgas-negative',
    name: 'Sanctions on energy producers spike benchmark oil prices',
    description: 'Disruptions to tanker logistics and crude sales trigger price spikes in Brent and WTI benchmarks.',
    eventTypes: ['SANCTION'],
    sectors: ['Energy'],
    domain: 'OIL_AND_GAS',
    direction: 'NEGATIVE',
    baseConfidence: 0.85,
  },
  {
    id: 'sanction-tech-semiconductor-negative',
    name: 'Export restrictions block advanced semiconductor tools',
    description: 'Controls on lithography equipment and EDA software disrupt chip fabrication pipelines.',
    eventTypes: ['SANCTION', 'EXPORT_RESTRICTION'],
    sectors: ['Technology'],
    domain: 'SEMICONDUCTORS',
    direction: 'NEGATIVE',
    baseConfidence: 0.86,
  },
  {
    id: 'sanction-tech-technology-negative',
    name: 'Technology controls restrict enterprise software and cloud access',
    description: 'Bans on tech transfers force targeted industries to operate without official software updates.',
    eventTypes: ['SANCTION', 'EXPORT_RESTRICTION'],
    sectors: ['Technology'],
    domain: 'TECHNOLOGY',
    direction: 'NEGATIVE',
    baseConfidence: 0.81,
  },
  {
    id: 'sanction-diplomacy-negative',
    name: 'Sanctions signal severe diplomatic deterioration',
    description: 'Coercive economic measures undermine bilateral treaties and hinder diplomatic dialogue.',
    eventTypes: ['SANCTION'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'DIPLOMACY',
    direction: 'NEGATIVE',
    baseConfidence: 0.78,
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // 5. MILITARY CONFLICT & ARMED ESCALATION (CRITICAL RISKS)
  // ═════════════════════════════════════════════════════════════════════════════

  {
    id: 'military-global-stability-negative',
    name: 'Armed hostilities destabilize regional security architectures',
    description: 'Active military clashes trigger refugee flows, border militarization, and heightened alliance tensions.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['MEDIUM', 'HIGH', 'CRITICAL'],
    domain: 'GLOBAL_STABILITY',
    direction: 'NEGATIVE',
    baseConfidence: 0.94,
  },
  {
    id: 'military-energy-risk',
    name: 'Conflict near critical transit chokepoints raises energy security risks',
    description: 'Hostilities in vicinity of straits, pipelines, or refineries create severe supply interruption risks.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'ENERGY',
    direction: 'RISK_INCREASE',
    baseConfidence: 0.85,
  },
  {
    id: 'military-oilgas-risk',
    name: 'War risks pipeline damage and spikes maritime tanker insurance',
    description: 'Attacks on energy infrastructure impose war-risk premiums and force vessel rerouting.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'OIL_AND_GAS',
    direction: 'RISK_INCREASE',
    baseConfidence: 0.82,
  },
  {
    id: 'military-supply-chain-negative',
    name: 'Conflict closes airspace, ports, and critical freight corridors',
    description: 'Commercial shipping diversions around conflict zones add substantial transit times and container costs.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['MEDIUM', 'HIGH', 'CRITICAL'],
    domain: 'SUPPLY_CHAIN',
    direction: 'NEGATIVE',
    baseConfidence: 0.84,
  },
  {
    id: 'military-trade-negative',
    name: 'War contracts regional and international commerce',
    description: 'Wartime devastation, payment blockages, and physical risks render normal commercial trade impossible.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'TRADE',
    direction: 'NEGATIVE',
    baseConfidence: 0.80,
  },
  {
    id: 'military-inflation-negative',
    name: 'War fuels imported commodity and shipping inflation',
    description: 'Simultaneous disruptions to grain, fertilizer, and crude supplies feed through to global retail inflation.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'INFLATION',
    direction: 'NEGATIVE',
    baseConfidence: 0.83,
  },
  {
    id: 'military-financial-negative',
    name: 'Military conflict triggers safe-haven flows and equity market sell-offs',
    description: 'Heightened geopolitical risk prompts flights to gold, treasury bonds, and safe-haven reserve currencies.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'FINANCIAL_MARKETS',
    direction: 'NEGATIVE',
    baseConfidence: 0.85,
  },
  {
    id: 'military-defense-spending-risk',
    name: 'Conflict escalates national defense expenditures and arms procurement',
    description: 'Governments reallocate fiscal budgets toward military readiness, air defense, and munition stockpiles.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'DEFENSE',
    direction: 'RISK_INCREASE',
    baseConfidence: 0.89,
  },
  {
    id: 'military-diplomacy-negative',
    name: 'Armed escalation freezes multilateral diplomatic negotiations',
    description: 'Active hostilities sever formal ambassadorial ties and stall ongoing peace frameworks.',
    eventTypes: ['MILITARY_CONFLICT'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'DIPLOMACY',
    direction: 'NEGATIVE',
    baseConfidence: 0.90,
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // 6. TRADE RESTRICTIONS & TARIFF BARRIERS
  // ═════════════════════════════════════════════════════════════════════════════

  {
    id: 'trade-restriction-trade-negative',
    name: 'Tariffs and trade quotas contract commercial exchange',
    description: 'Punitive import tariffs distort competitive dynamics and lower overall bilateral trade turnover.',
    eventTypes: ['TRADE_RESTRICTION', 'IMPORT_RESTRICTION', 'EXPORT_RESTRICTION'],
    domain: 'TRADE',
    direction: 'NEGATIVE',
    baseConfidence: 0.86,
  },
  {
    id: 'trade-restriction-supply-chain-negative',
    name: 'Trade barriers disrupt intermediate manufacturing supply chains',
    description: 'Restrictions on raw inputs force manufacturers to scramble for more expensive alternative suppliers.',
    eventTypes: ['TRADE_RESTRICTION', 'EXPORT_RESTRICTION'],
    domain: 'SUPPLY_CHAIN',
    direction: 'NEGATIVE',
    baseConfidence: 0.82,
  },
  {
    id: 'trade-restriction-inflation-negative',
    name: 'Tariffs pass direct costs onto consumers and producers',
    description: 'Import levies raise landed product prices and feed directly into producer and consumer price indices.',
    eventTypes: ['TRADE_RESTRICTION', 'IMPORT_RESTRICTION'],
    domain: 'INFLATION',
    direction: 'NEGATIVE',
    baseConfidence: 0.79,
  },
  {
    id: 'export-restriction-agriculture-negative',
    name: 'Agricultural export bans spike global food prices',
    description: 'National export restrictions on wheat, rice, or fertilizers restrict global food supplies.',
    eventTypes: ['EXPORT_RESTRICTION'],
    sectors: ['Agriculture', 'Food & Agriculture'],
    domain: 'FOOD_AGRICULTURE',
    direction: 'NEGATIVE',
    baseConfidence: 0.89,
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // 7. POLITICAL CRISIS & ELECTIONS
  // ═════════════════════════════════════════════════════════════════════════════

  {
    id: 'political-crisis-stability-negative',
    name: 'Internal political crisis elevates sovereign instability',
    description: 'Governance vacuums and civil unrest reduce policy predictability and increase sovereign risk.',
    eventTypes: ['POLITICAL_CRISIS', 'CIVIL_UNREST'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'GLOBAL_STABILITY',
    direction: 'NEGATIVE',
    baseConfidence: 0.85,
  },
  {
    id: 'political-crisis-diplomacy-negative',
    name: 'Regime instability complicates foreign treaty obligations',
    description: 'Political turmoil undermines the credibility and enforcement of international agreements.',
    eventTypes: ['POLITICAL_CRISIS'],
    severity: ['HIGH', 'CRITICAL'],
    domain: 'DIPLOMACY',
    direction: 'NEGATIVE',
    baseConfidence: 0.79,
  },
  {
    id: 'election-diplomacy-risk',
    name: 'Electoral shifts introduce foreign-policy realignment risks',
    description: 'New political administrations may renegotiate trade pacts, defense alignments, or environmental treaties.',
    eventTypes: ['ELECTION'],
    domain: 'DIPLOMACY',
    direction: 'RISK_INCREASE',
    baseConfidence: 0.68,
  },
  {
    id: 'election-market-risk',
    name: 'Elections induce short-term equity and FX market volatility',
    description: 'Uncertainty over corporate taxation and fiscal policies creates asset-price fluctuations.',
    eventTypes: ['ELECTION'],
    domain: 'FINANCIAL_MARKETS',
    direction: 'RISK_INCREASE',
    baseConfidence: 0.67,
  },
]);
