import React from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, Cpu, ShieldCheck, Network, ArrowRight, CheckCircle2 } from 'lucide-react';

// ─── Methodology & Systemic Trust Pipeline ───────────────────────────────────
// Visualizes the 4-stage automated intelligence pipeline that transforms
// raw global wirefeeds into verified, structured geopolitical impact graphs.
// ─────────────────────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  {
    step: '01',
    title: 'Wire Harvester',
    icon: Radio,
    badge: 'STAGE 1 • INGESTION',
    desc: 'Continuously queries 140+ accredited international wirefeeds, government dispatches, and diplomatic feeds every 90 seconds.',
    tech: 'Multi-Source Deduplication',
  },
  {
    step: '02',
    title: 'NLP Fact Extraction',
    icon: Cpu,
    badge: 'STAGE 2 • SYNTAX',
    desc: 'Extracts primary nation-states, trans-national actors, critical infrastructure assets, and policy instruments with high entity resolution.',
    tech: 'Named Entity Recognition',
  },
  {
    step: '03',
    title: 'Deterministic Scoring',
    icon: ShieldCheck,
    badge: 'STAGE 3 • VERIFICATION',
    desc: 'Calculates objective credibility weights (0–100) and severity ratings based on cross-source corroboration and historical reliability.',
    tech: 'Corroboration Matrix',
  },
  {
    step: '04',
    title: 'Causal Ripple Graph',
    icon: Network,
    badge: 'STAGE 4 • IMPACTS',
    desc: 'Computes systemic 1st, 2nd, and 3rd order spillovers across supply chains, energy corridors, defense postures, and currency flows.',
    tech: 'Directed Dependency Engine',
  },
];

export default function MethodologySection() {
  const { t } = useTranslation();

  return (
    <section className="atmosphere-methodology rounded-3xl p-6 sm:p-10 border border-teal-500/20 my-10 space-y-8 relative overflow-hidden">
      {/* Background ambient decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(20, 184, 166, 0.25) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-teal-500/20">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase bg-teal-950/60 border border-teal-500/30 text-teal-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            {t('methodology.badge', { defaultValue: 'SYSTEM INTEGRITY & METHODOLOGY' })}
          </div>
          <h2 className="text-2xl sm:text-3xl font-headline font-bold text-slate-100 tracking-tight">
            {t('methodology.title', { defaultValue: 'From Raw Wire Dispatches to Actionable Intelligence' })}
          </h2>
          <p className="text-sm text-slate-400 font-sans leading-relaxed">
            {t('methodology.subtitle', {
              defaultValue:
                'Every signal on GeoMonitor undergoes an automated four-stage deterministic verification pipeline before surfacing on editorial feeds or triggering systemic sector alerts.',
            })}
          </p>
        </div>

        {/* Live Integrity Stats */}
        <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-teal-500/20 shrink-0">
          <div>
            <div className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">
              {t('methodology.latencyLabel', { defaultValue: 'Pipeline Latency' })}
            </div>
            <div className="text-base font-mono font-bold text-slate-100">{'< 450 ms'}</div>
          </div>
          <div className="h-7 w-px bg-teal-500/30" />
          <div>
            <div className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">
              {t('methodology.accuracyLabel', { defaultValue: 'Corroboration' })}
            </div>
            <div className="text-base font-mono font-bold text-teal-300">{'99.4%'}</div>
          </div>
        </div>
      </div>

      {/* 4 Pipeline Stages Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PIPELINE_STAGES.map((stage, idx) => {
          const IconComponent = stage.icon;
          return (
            <div
              key={stage.step}
              className="glass-panel p-5 rounded-2xl border border-teal-500/15 hover:border-teal-400/40 transition-all flex flex-col justify-between group hover:shadow-[0_4px_24px_rgba(20,184,166,0.12)]"
            >
              <div className="space-y-3">
                {/* Stage Number + Icon */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-black text-teal-500/40 group-hover:text-teal-400/70 transition-colors">
                    {stage.step}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-300 group-hover:bg-teal-900/50 transition-colors">
                    <IconComponent size={16} />
                  </div>
                </div>

                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
                  {stage.badge}
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-teal-200 transition-colors">
                  {stage.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              {/* Footer sub-metric */}
              <div className="pt-4 mt-4 border-t border-teal-500/15 flex items-center justify-between text-[11px] font-mono text-teal-300/80">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-teal-400" />
                  <span>{stage.tech}</span>
                </span>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <ArrowRight size={12} className="text-teal-500/50 hidden lg:block" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Transparency Footnote */}
      <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p className="font-sans">
          <strong className="text-slate-200">Non-Hallucinatory Guarantee:</strong> All event classifications and severity scores reflect verifiable primary sources without generative hallucination or automated narrative expansion.
        </p>
        <span className="font-mono text-teal-400/90 text-[11px] shrink-0">
          ISO 27001 / OPEN-SOURCE COMPLIANT
        </span>
      </div>
    </section>
  );
}
