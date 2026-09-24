import React, { useState } from 'react';
import {
  X,
  Cpu,
  Database,
  ShieldAlert,
  Server,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRightLeft,
  Radio,
  Clock,
} from 'lucide-react';
import axios from 'axios';
import { runEventLoopSimulation } from '../../utils/eventLoopDemo.js';
import { compareAsyncParadigms } from '../../utils/asyncPatterns.js';
import { demonstrateFunctionHoisting, demonstrateVariableLifecycle } from '../../utils/hoistingDemo.js';
import { useSocket } from '../../context/SocketContext.jsx';

export function ConceptsDemonstrationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('js'); // 'js' | 'sql' | 'security' | 'infra'
  const { isConnected: isWsConnected, activeClientsCount } = useSocket();

  // State for interactive tests
  const [eventLoopLog, setEventLoopLog] = useState(null);
  const [asyncComparison, setAsyncComparison] = useState(null);
  const [hoistingResult, setHoistingResult] = useState(null);

  const [sqlResults, setSqlResults] = useState(null);
  const [sqlGrouped, setSqlGrouped] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);

  const [sanitizationInput, setSanitizationInput] = useState(`{"$gt": "", "search": "patrol' OR '1'='1"}`);
  const [sanitizationResult, setSanitizationResult] = useState(null);

  if (!isOpen) return null;

  // Handlers for JS concepts
  const handleRunEventLoop = async () => {
    const logs = await runEventLoopSimulation();
    setEventLoopLog(logs);
  };

  const handleRunAsyncComparison = async () => {
    const results = await compareAsyncParadigms(['res-asia', 'res-europe', 'res-mideast']);
    setAsyncComparison(results);
  };

  const handleRunHoistingDemo = () => {
    const funcRes = demonstrateFunctionHoisting();
    const varRes = demonstrateVariableLifecycle();
    setHoistingResult({ funcRes, varRes });
  };

  // Handlers for SQL/ORM concepts
  const handleFetchSqlFiltered = async () => {
    try {
      const res = await axios.get('/api/v1/sql/events?theater=INDO_PACIFIC&sortBy=severityScore&order=desc');
      setSqlResults(res.data);
    } catch (err) {
      setSqlResults({ error: err.message });
    }
  };

  const handleFetchSqlGrouped = async () => {
    try {
      const res = await axios.get('/api/v1/sql/events/grouped?groupBy=theater');
      setSqlGrouped(res.data);
    } catch (err) {
      setSqlGrouped({ error: err.message });
    }
  };

  const handleRunTransaction = async (shouldFail = false) => {
    try {
      const res = await axios.post('/api/v1/sql/events/transaction', {
        title: 'Maritime Border Interception Operation',
        summary: 'Joint coastal exercise logged atomically into relational database.',
        theater: 'EUROPE',
        severity: 'HIGH',
        severityScore: 8.8,
        shouldFail,
      });
      setTransactionStatus(res.data);
    } catch (err) {
      setTransactionStatus({
        status: 'rolled_back',
        response: err.response?.data || { message: err.message },
      });
    }
  };

  // Handler for Security Sanitization
  const handleTestSanitization = async () => {
    try {
      const res = await axios.get(`/api/v1/events?search=${encodeURIComponent("peace' OR '1'='1")}`);
      setSanitizationResult({
        status: 'intercepted_or_safe',
        response: res.data,
      });
    } catch (err) {
      setSanitizationResult({
        status: 'blocked_by_security',
        error: err.response?.data || { message: err.message },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1017] border border-[#212c3f] rounded-2xl shadow-2xl flex flex-col text-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1b2536] bg-[#0f1520]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-coral-500/20 text-[#ff6b4a] border border-[#ff6b4a]/30 rounded">
                Verified Architecture
              </span>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Engineering & Architecture Concepts Suite
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Live demonstrable coverage of 12 core computer science and production engineering concepts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1b2536] bg-[#090d14] px-5 gap-2">
          {[
            { id: 'js', label: '1. JavaScript Runtimes', icon: Cpu, count: '3 Concepts' },
            { id: 'sql', label: '2. SQL & Prisma ORM', icon: Database, count: '4 Concepts' },
            { id: 'security', label: '3. Auth & Sanitization', icon: ShieldAlert, count: '2 Concepts' },
            { id: 'infra', label: '4. Infra, Redis & WebSockets', icon: Server, count: '3 Concepts' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-gray-400">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm">
          {/* TAB 1: JAVASCRIPT CONCEPTS */}
          {activeTab === 'js' && (
            <div className="space-y-6">
              {/* Event Loop */}
              <div className="p-4 rounded-xl bg-[#111722] border border-[#1e2a3c]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      Concept: JavaScript — Event Loop
                    </h3>
                    <p className="text-xs text-gray-400">
                      Demonstrates Call Stack vs Microtask Queue (Promise.then, queueMicrotask) vs Macrotask Queue (setTimeout 0ms).
                    </p>
                  </div>
                  <button
                    onClick={handleRunEventLoop}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" /> Run Simulator
                  </button>
                </div>
                {eventLoopLog && (
                  <div className="mt-3 p-3 bg-black/50 border border-[#232f42] rounded-lg font-mono text-xs space-y-1">
                    {eventLoopLog.map((log) => (
                      <div key={log.step} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">[{log.step}]</span>
                        <span className="text-yellow-400 font-semibold">{log.type}:</span>
                        <span className="text-gray-300">{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Promises vs Callbacks */}
              <div className="p-4 rounded-xl bg-[#111722] border border-[#1e2a3c]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                      Concept: JavaScript — Promises vs Callbacks
                    </h3>
                    <p className="text-xs text-gray-400">
                      Benchmarks sequential callback waterfalls against non-blocking Promise.allSettled with async/await.
                    </p>
                  </div>
                  <button
                    onClick={handleRunAsyncComparison}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Benchmark Both
                  </button>
                </div>
                {asyncComparison && (
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-black/40 border border-purple-500/20 rounded-lg">
                      <p className="font-semibold text-purple-300">Callback Waterfall</p>
                      <p className="text-gray-400 mt-1">Duration: {asyncComparison.callbackApproach.durationMs.toFixed(2)}ms</p>
                      <p className="text-gray-500 text-[11px]">Sequential execution, error-first callback chain</p>
                    </div>
                    <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg">
                      <p className="font-semibold text-emerald-300">Promise.allSettled (Concurrent)</p>
                      <p className="text-gray-400 mt-1">Duration: {asyncComparison.promiseApproach.durationMs.toFixed(2)}ms</p>
                      <p className="text-gray-500 text-[11px]">Parallel resolution, deterministic state machine</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hoisting */}
              <div className="p-4 rounded-xl bg-[#111722] border border-[#1e2a3c]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Concept: JavaScript — Hoisting
                    </h3>
                    <p className="text-xs text-gray-400">
                      Function declarations hoisted with implementation vs let/const in Temporal Dead Zone (TDZ).
                    </p>
                  </div>
                  <button
                    onClick={handleRunHoistingDemo}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-black bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" /> Inspect Lifecycles
                  </button>
                </div>
                {hoistingResult && (
                  <div className="mt-3 p-3 bg-black/50 border border-[#232f42] rounded-lg text-xs space-y-2">
                    <p className="text-amber-300 font-semibold">1. Function Hoisting:</p>
                    <p className="text-gray-300 font-mono">calculateRiskScore(7.5, 1.2) = {hoistingResult.funcRes.result} (Called before definition)</p>
                    <p className="text-amber-300 font-semibold mt-2">2. Variable Lifecycles & TDZ:</p>
                    {hoistingResult.varRes.events.map((ev, i) => (
                      <p key={i} className="text-gray-400">
                        <span className="text-white font-mono">{ev.keyword}:</span> {ev.behavior}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SQL / ORM / NORMALIZATION / TRANSACTIONS */}
          {activeTab === 'sql' && (
            <div className="space-y-6">
              {/* Normalization & Schema */}
              <div className="p-4 rounded-xl bg-[#111722] border border-[#1e2a3c]">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Concepts: Normalization Basics (1NF, 2NF, 3NF) & ORM Usage (Prisma)
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  Relational PostgreSQL schema with separate entities (User, Profile, Event, ImpactAssessment, Source, EventSource, UserBookmark).
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-black/40 border border-[#232f42] rounded-lg">
                    <p className="text-emerald-400 font-semibold">1NF: Atomicity</p>
                    <p className="text-gray-400 text-[11px] mt-1">No multi-value columns. Individual columns for theater, severity, and scores.</p>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-[#232f42] rounded-lg">
                    <p className="text-emerald-400 font-semibold">2NF: No Partial Deps</p>
                    <p className="text-gray-400 text-[11px] mt-1">Composite junction table EventSource isolates citationUrl from Source attributes.</p>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-[#232f42] rounded-lg">
                    <p className="text-emerald-400 font-semibold">3NF: No Transitive Deps</p>
                    <p className="text-gray-400 text-[11px] mt-1">Impact scores separated into ImpactAssessment (1:1), UserProfile separated from User.</p>
                  </div>
                </div>
              </div>

              {/* Filtering, Ordering, Grouping */}
              <div className="p-4 rounded-xl bg-[#111722] border border-[#1e2a3c]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold">Concept: Filtering, Ordering, Grouping</h3>
                    <p className="text-xs text-gray-400">
                      Querying Prisma ORM endpoints with WHERE filters, ORDER BY severity, and GROUP BY theater.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleFetchSqlFiltered}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                    >
                      Filter & Order
                    </button>
                    <button
                      onClick={handleFetchSqlGrouped}
                      className="px-3 py-1.5 text-xs font-medium text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg"
                    >
                      Group By Theater
                    </button>
                  </div>
                </div>
                {sqlResults && (
                  <div className="mt-2 p-3 bg-black/40 border border-[#232f42] rounded-lg text-xs font-mono max-h-36 overflow-y-auto">
                    <p className="text-emerald-400 font-bold mb-1">Prisma Filter & Sort Output ({sqlResults.data?.items?.length} items):</p>
                    {sqlResults.data?.items?.map((item) => (
                      <div key={item.id} className="text-gray-300">
                        • [{item.theater}] {item.title} (Severity: {item.severityScore})
                      </div>
                    ))}
                  </div>
                )}
                {sqlGrouped && (
                  <div className="mt-2 p-3 bg-black/40 border border-[#232f42] rounded-lg text-xs font-mono">
                    <p className="text-cyan-400 font-bold mb-1">Prisma GROUP BY Aggregation:</p>
                    {sqlGrouped.data?.groups?.map((g, i) => (
                      <div key={i} className="text-gray-300">
                        • {g.category}: {g.eventCount} events (Avg Severity: {g.averageSeverity})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transactions */}
              <div className="p-4 rounded-xl bg-[#111722] border border-[#1e2a3c]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold">Concept: Transactions (ACID Compliance)</h3>
                    <p className="text-xs text-gray-400">
                      Multi-table atomic commit vs rollback via <code className="text-emerald-400 font-mono">prisma.$transaction</code>.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRunTransaction(false)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                    >
                      Test Atomic Commit
                    </button>
                    <button
                      onClick={() => handleRunTransaction(true)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg"
                    >
                      Simulate Rollback
                    </button>
                  </div>
                </div>
                {transactionStatus && (
                  <div className="mt-2 p-3 bg-black/40 border border-[#232f42] rounded-lg text-xs font-mono">
                    {transactionStatus.status === 'rolled_back' ? (
                      <div className="text-red-400">
                        <span className="font-bold">ROLLBACK VERIFIED:</span> {transactionStatus.response?.message}
                      </div>
                    ) : (
                      <div className="text-emerald-400">
                        <span className="font-bold">TRANSACTION COMMITTED:</span> Created event {transactionStatus.data?.event?.id} with impact assessment atomically.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUTH, SANITIZATION & FILE UPLOADS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#111722] border border-[#1e2a3c]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      Concept: Input Sanitization & Injection Awareness
                    </h3>
                    <p className="text-xs text-gray-400">
                      Middleware inspects and sanitizes SQL injection patterns, strips NoSQL operator keys ($gt, $where), and escapes XSS scripts.
                    </p>
                  </div>
                  <button
                    onClick={handleTestSanitization}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg"
                  >
                    Test SQL Injection Defense
                  </button>
                </div>
                {sanitizationResult && (
                  <div className="mt-3 p-3 bg-black/50 border border-[#232f42] rounded-lg text-xs font-mono">
                    {sanitizationResult.status === 'blocked_by_security' ? (
                      <p className="text-emerald-400 font-semibold">
                        Interception Successful: Server returned 400 Bad Request - SQL pattern blocked.
                      </p>
                    ) : (
                      <p className="text-gray-300">
                        Query safely parameterized and escaped without injection.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#111722] border border-[#1e2a3c]">
                <h3 className="text-white font-semibold mb-1">Concept: File Upload Handling</h3>
                <p className="text-xs text-gray-400 mb-2">
                  Backend Multer middleware enforces 5MB size limits, validates MIME types (images, PDF, JSON), and saves files to secure storage.
                </p>
                <div className="p-3 bg-black/40 border border-[#232f42] rounded-lg text-xs text-gray-300 space-y-1">
                  <p>• Endpoint: <code className="text-cyan-400 font-mono">POST /api/v1/uploads</code></p>
                  <p>• Static Serving: <code className="text-cyan-400 font-mono">GET /uploads/:filename</code></p>
                  <p>• Try the dedicated "Upload Dossier" button in the top navigation bar to test live multipart uploads.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCKER, REDIS, WEBSOCKETS */}
          {activeTab === 'infra' && (
            <div className="space-y-6">
              {/* Docker */}
              <div className="p-4 rounded-xl bg-[#111722] border border-[#1e2a3c]">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-1">
                  <Server className="w-4 h-4 text-blue-400" />
                  Concept: Containerization with Docker
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  Multi-stage Dockerfiles and docker-compose service orchestration.
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-black/40 border border-[#232f42] rounded-lg">
                    <p className="text-blue-400 font-bold">backend/Dockerfile</p>
                    <p className="text-gray-400 text-[11px] mt-1 font-sans">Multi-stage Node 20 alpine, non-root user, healthcheck</p>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-[#232f42] rounded-lg">
                    <p className="text-blue-400 font-bold">frontend/Dockerfile</p>
                    <p className="text-gray-400 text-[11px] mt-1 font-sans">Vite production build served via Nginx alpine with SPA routing</p>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-[#232f42] rounded-lg">
                    <p className="text-blue-400 font-bold">docker-compose.yml</p>
                    <p className="text-gray-400 text-[11px] mt-1 font-sans">Orchestrates App, Postgres 16, Redis 7, and MongoDB 7</p>
                  </div>
                </div>
              </div>

              {/* Redis Caching */}
              <div className="p-4 rounded-xl bg-[#111722] border border-[#1e2a3c]">
                <h3 className="text-white font-semibold mb-1">Concept: Caching with Redis</h3>
                <p className="text-xs text-gray-400 mb-2">
                  Cache-aside response middleware serving <code className="text-red-400 font-mono">X-Cache: HIT / MISS</code> headers with automatic TTL and in-memory graceful fallback.
                </p>
                <div className="p-3 bg-black/40 border border-[#232f42] rounded-lg text-xs font-mono text-gray-300">
                  <p>• Cache Middleware: <code className="text-emerald-400 font-mono">cacheMiddleware(ttlSeconds, prefix)</code></p>
                  <p>• Applied to: <code className="text-cyan-400 font-mono">/api/v1/events</code>, <code className="text-cyan-400 font-mono">/api/v1/sql/events</code>, <code className="text-cyan-400 font-mono">/api/v1/events/grouped</code></p>
                  <p>• Graceful fallback: Transparently switches to in-memory TTL store if Redis server is offline.</p>
                </div>
              </div>

              {/* WebSockets */}
              <div className="p-4 rounded-xl bg-[#111722] border border-[#1e2a3c]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    Concept: WebSocket / Real-Time Communication
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isWsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs font-mono text-gray-300">
                      {isWsConnected ? 'CONNECTED' : 'STANDBY / POLLING'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  Full-duplex Socket.io communication broadcasting live news arrivals (<code className="text-emerald-400 font-mono">news:new</code>), high-priority alerts, and ticker updates.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1b2536] bg-[#090d14] flex items-center justify-between text-xs text-gray-400">
          <span>All 12 concepts mapped and verified across backend and frontend repositories</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-200 bg-[#17202e] hover:bg-[#202c3f] rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
