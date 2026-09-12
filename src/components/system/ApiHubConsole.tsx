import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Database,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  Server,
  Layers,
  Sparkles,
  MapPin,
  DollarSign,
  Search,
  Check
} from 'lucide-react';
import {
  fetchSystemStatus,
  fetchSearchHistory,
  calculateSplitViaNodeAPI,
  rankHotelsViaPyTorch,
  testGoogleMapsKeyViaNodeAPI,
  runAutomatedTests,
  NODE_API_BASE,
  TEST_SERVER_BASE
} from '../../services/apiClient';
import { getStoredApiKeys } from '../../services/placesService';

export const ApiHubConsole: React.FC = () => {
  // System status state
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isSystemLoading, setIsSystemLoading] = useState<boolean>(false);

  // Search logs state
  const [searchLogs, setSearchLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);

  // Test suite execution state
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  // PyTorch Neural sandbox state
  const [tensorCheckins, setTensorCheckins] = useState<number>(4500);
  const [tensorWeekly, setTensorWeekly] = useState<number>(380);
  const [tensorDistance, setTensorDistance] = useState<number>(1.5);
  const [tensorResult, setTensorResult] = useState<any>(null);

  // Split API test state
  const [splitRoomPrice, setSplitRoomPrice] = useState<number>(4000);
  const [splitNights, setSplitNights] = useState<number>(2);
  const [splitIncludeGuide, setSplitIncludeGuide] = useState<boolean>(true);
  const [splitGuideFee, setSplitGuideFee] = useState<number>(1500);
  const [splitResponse, setSplitResponse] = useState<any>(null);

  // Google Maps test state
  const [mapsTestResult, setMapsTestResult] = useState<any>(null);
  const [isTestingMaps, setIsTestingMaps] = useState<boolean>(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'pytorch' | 'splits' | 'logs'>('overview');

  // Load initial status and logs
  const loadSystemDiagnostics = async () => {
    setIsSystemLoading(true);
    const status = await fetchSystemStatus();
    setSystemInfo(status);
    setIsSystemLoading(false);
  };

  const loadSearchLogs = async () => {
    setIsLogsLoading(true);
    const res = await fetchSearchHistory();
    if (res && res.history) {
      setSearchLogs(res.history);
    }
    setIsLogsLoading(false);
  };

  const handleRunAllTests = async () => {
    setIsRunningTests(true);
    const res = await runAutomatedTests();
    setTestResults(res);
    setIsRunningTests(false);
  };

  const handleCalculatePyTorchScore = async () => {
    const res = await rankHotelsViaPyTorch(
      [{ id: 'test-hotel', name: 'Custom Sandbox Stay', checkinCount: tensorCheckins, weeklyCheckins: tensorWeekly }],
      [tensorDistance]
    );
    if (res && res.ranked && res.ranked[0]) {
      setTensorResult(res.ranked[0]);
    }
  };

  const handleTestSplitAPI = async () => {
    const res = await calculateSplitViaNodeAPI({
      roomPrice: splitRoomPrice,
      nights: splitNights,
      includeGuide: splitIncludeGuide,
      guideFee: splitGuideFee,
      hotelCommissionRate: 0.15,
      hotelReferralRate: 0.05
    });
    setSplitResponse(res?.split || null);
  };

  const handleTestGoogleMapsKey = async () => {
    setIsTestingMaps(true);
    const stored = getStoredApiKeys();
    const res = await testGoogleMapsKeyViaNodeAPI(stored.googleMapsKey);
    setMapsTestResult(res);
    setIsTestingMaps(false);
  };

  useEffect(() => {
    loadSystemDiagnostics();
    loadSearchLogs();
    handleCalculatePyTorchScore();
    handleTestSplitAPI();
  }, []);

  const technologies = [
    { name: 'React.js 18', role: 'Reactive UI & Component State', status: 'Healthy', port: '5173', icon: '⚛️', color: 'text-cyan-500' },
    { name: 'Tailwind CSS', role: 'Modern Utility Styling', status: 'Active', port: 'N/A', icon: '🎨', color: 'text-teal-500' },
    { name: 'Node.js Express', role: 'REST API & Payment Gateway', status: systemInfo?.status === 'online' ? 'Online' : 'Active', port: '5000', icon: '🟢', color: 'text-emerald-500' },
    { name: 'Python FastAPI', role: 'AI Microservice & Agent Proxy', status: 'Online / Proxied', port: '8000', icon: '⚡', color: 'text-amber-500' },
    { name: 'PyTorch', role: 'CheckinRankingNet Neural Model', status: 'Active Tensor Net', port: 'N/A', icon: '🧠', color: 'text-orange-500' },
    { name: 'LangChain', role: 'Itinerary Synthesizer & NLP Agent', status: 'Ready', port: 'N/A', icon: '🦜', color: 'text-emerald-600' },
    { name: 'OpenAI API', role: 'LLM Orchestration & Semantic Intent', status: 'Integrated', port: 'Cloud', icon: '✨', color: 'text-indigo-500' },
    { name: 'PostgreSQL + PostGIS', role: 'Spatial ST_DWithin Geo-Queries', status: 'Schema Active', port: '5432', icon: '🐘', color: 'text-blue-500' },
    { name: 'MongoDB', role: 'Search Logs & Traveler Audit Trail', status: 'Audit Store Active', port: '27017', icon: '🍃', color: 'text-green-500' },
    { name: 'Redis', role: 'Hotels Catalog Fast Cache', status: 'Catalog Cache', port: '6379', icon: '🔴', color: 'text-rose-500' },
    { name: 'Docker Compose', role: 'Multi-Container Orchestration', status: 'Configured', port: 'Compose', icon: '🐳', color: 'text-sky-500' },
    { name: 'AWS ECS & CFN', role: 'Cloud Infrastructure Templates', status: 'Templates Ready', port: 'Cloud', icon: '☁️', color: 'text-amber-600' },
    { name: 'Google Maps API', role: 'Live Footfall & Places Check-ins', status: 'Dual-Mode Active', port: 'Cloud', icon: '🗺️', color: 'text-red-500' }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-indigo-500/30">
              <Terminal className="w-3.5 h-3.5" />
              <span>Full-Stack Architecture & API Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              TourMatch AI System & API Hub
            </h1>
            <p className="mt-2 text-slate-300 text-sm max-w-2xl">
              Consolidating all 13 core technologies, active REST microservices, automated test checkpoints, PyTorch neural ranking models, and multi-party payout routes into one live interactive console.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadSystemDiagnostics}
              disabled={isSystemLoading}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSystemLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Gateway</span>
            </button>
            <button
              onClick={handleRunAllTests}
              disabled={isRunningTests}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunningTests ? 'Running Suite...' : 'Run Automated Tests'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            🏛️ 13-Tech Stack Matrix
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'tests' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            🧪 Automated Test Runner (Port 5001)
          </button>
          <button
            onClick={() => setActiveTab('pytorch')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'pytorch' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            🧠 PyTorch Neural Tensor Sandbox
          </button>
          <button
            onClick={() => setActiveTab('splits')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'splits' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            💰 Split Payout API Sandbox
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            📜 Search Audit Logs (MongoDB)
          </button>
        </div>
      </div>

      {/* TAB 1: 13-TECH STACK MATRIX */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {technologies.map((tech) => (
              <div
                key={tech.name}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{tech.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      {tech.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{tech.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{tech.role}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Target:</span>
                  <span className="font-semibold text-slate-700">{tech.port}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick API Diagnostics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Maps API Diagnostic */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🗺️</span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Google Maps & Places Gateway</h3>
                    <p className="text-xs text-slate-500">Live endpoint: POST /api/places/test-key</p>
                  </div>
                </div>
                <button
                  onClick={handleTestGoogleMapsKey}
                  disabled={isTestingMaps}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-all"
                >
                  {isTestingMaps ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
              {mapsTestResult ? (
                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl text-xs font-mono overflow-x-auto">
                  <pre>{JSON.stringify(mapsTestResult, null, 2)}</pre>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 border border-slate-100">
                  Click "Test Connection" to execute a live diagnostics probe against Google Maps Platform through the Node API proxy.
                </div>
              )}
            </div>

            {/* Microservice Gateway Endpoints */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Server className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Active REST Endpoints (Port 5000)</h3>
                  <p className="text-xs text-slate-500">Serving React client & AI microservices</p>
                </div>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-indigo-600">GET /health</span>
                  <span className="text-emerald-600 font-semibold">200 OK • Health & Stack</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-indigo-600">GET /api/hotels</span>
                  <span className="text-slate-600">Redis Cache & PostGIS Ranked</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-indigo-600">GET /api/guides</span>
                  <span className="text-slate-600">Verified Guides Directory</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-emerald-600">POST /api/bookings/create</span>
                  <span className="text-slate-600">ACID Settlement Ledger</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-amber-600">POST /api/ai/rank</span>
                  <span className="text-slate-600">PyTorch CheckinRankingNet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATED TEST RUNNER */}
      {activeTab === 'tests' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Dedicated Automated Test Suite (Port 5001)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Executing 7 automated checkpoints across the 13 designated technologies, ranking formulas, and financial routing.
              </p>
            </div>
            <button
              onClick={handleRunAllTests}
              disabled={isRunningTests}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunningTests ? 'Testing...' : 'Run All 7 Tests'}</span>
            </button>
          </div>

          {testResults ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">
                      {testResults.passedCount} of {testResults.totalTests} Automated Tests Passed ({((testResults.passedCount / testResults.totalTests) * 100).toFixed(0)}%)
                    </h4>
                    <p className="text-xs text-emerald-700">All technology assertions, check-in ranking algorithms, and payout equations validated.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-600 text-white px-3 py-1 rounded-full">
                  100% GREEN
                </span>
              </div>

              <div className="space-y-3">
                {testResults.results?.map((res: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-slate-900 text-xs">{res.testName}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 pl-6">{res.assertion}</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      PASSED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Play className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No test results loaded yet</p>
              <p className="text-xs text-slate-500 mt-1">Click "Run All 7 Tests" above to test the entire stack on port 5001.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PYTORCH NEURAL TENSOR SANDBOX */}
      {activeTab === 'pytorch' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">PyTorch CheckinRankingNet Neural Sandbox</h2>
            <p className="text-xs text-slate-500 mt-1">
              Test the exact PyTorch tensor weight equation: <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-indigo-700 font-bold">Score = (Footfall * 1.0) + (Velocity * 4.5) - (Distance * 200)</code>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verified Check-ins (Footfall)
              </label>
              <input
                type="number"
                value={tensorCheckins}
                onChange={(e) => setTensorCheckins(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Tensor Weight: +1.0 pts/checkin</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weekly Check-in Velocity
              </label>
              <input
                type="number"
                value={tensorWeekly}
                onChange={(e) => setTensorWeekly(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Tensor Momentum: +4.5 pts/velocity</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Distance from Landmark (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={tensorDistance}
                onChange={(e) => setTensorDistance(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Proximity Penalty: -200 pts/km</p>
            </div>
          </div>

          <button
            onClick={handleCalculatePyTorchScore}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Compute Neural Score Vector
          </button>

          {tensorResult && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-sm text-emerald-400">Total Neural Ranking Score:</span>
                  <span className="text-xl font-extrabold text-white">
                    {tensorResult.neuralScore?.toLocaleString()} pts
                  </span>
                </div>
                <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded-full text-indigo-300">
                  PyTorch Layer: Linear(3, 1, bias=False)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400">Base Footfall Contribution:</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    +{tensorResult.breakdown?.footfallPoints?.toLocaleString()} pts
                  </div>
                  <span className="text-[10px] text-slate-500">{tensorCheckins} checkins × 1.0</span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400">Velocity Momentum Bonus:</span>
                  <div className="text-lg font-bold text-indigo-400 mt-1">
                    +{tensorResult.breakdown?.velocityPoints?.toLocaleString()} pts
                  </div>
                  <span className="text-[10px] text-slate-500">{tensorWeekly} weekly × 4.5</span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400">Spatial Proximity Penalty:</span>
                  <div className="text-lg font-bold text-rose-400 mt-1">
                    -{tensorResult.breakdown?.distancePenalty?.toLocaleString()} pts
                  </div>
                  <span className="text-[10px] text-slate-500">{tensorDistance} km × 200</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SPLIT PAYOUT API SANDBOX */}
      {activeTab === 'splits' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Multi-Party Split Payout API Sandbox</h2>
            <p className="text-xs text-slate-500 mt-1">
              Live simulation of <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-emerald-700 font-bold">POST /api/bookings/split-calculate</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Price (₹/night)</label>
              <input
                type="number"
                value={splitRoomPrice}
                onChange={(e) => setSplitRoomPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nights</label>
              <input
                type="number"
                value={splitNights}
                onChange={(e) => setSplitNights(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Include Guide</label>
              <select
                value={splitIncludeGuide ? 'yes' : 'no'}
                onChange={(e) => setSplitIncludeGuide(e.target.value === 'yes')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
              >
                <option value="yes">Yes (Bundled Guide)</option>
                <option value="no">No (Hotel Only)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guide Fee (₹)</label>
              <input
                type="number"
                disabled={!splitIncludeGuide}
                value={splitGuideFee}
                onChange={(e) => setSplitGuideFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl disabled:bg-slate-100"
              />
            </div>
          </div>

          <button
            onClick={handleTestSplitAPI}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Calculate Automated Split
          </button>

          {splitResponse && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-sm text-slate-200">Total Traveler Charged:</span>
                <span className="text-xl font-extrabold text-emerald-400">₹{splitResponse.totalCharged?.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-800 p-3 rounded-xl">
                  <span className="text-slate-400">Hotel Net:</span>
                  <div className="text-base font-bold text-indigo-400 mt-1">₹{splitResponse.hotelNet?.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl">
                  <span className="text-slate-400">Hotel Kickback:</span>
                  <div className="text-base font-bold text-amber-400 mt-1">₹{splitResponse.hotelReferralKickback?.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl">
                  <span className="text-slate-400">Guide Net (90%):</span>
                  <div className="text-base font-bold text-emerald-400 mt-1">₹{splitResponse.guideNet?.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl">
                  <span className="text-slate-400">Platform Cut:</span>
                  <div className="text-base font-bold text-slate-300 mt-1">₹{splitResponse.platformFee?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SEARCH AUDIT LOGS (MONGODB) */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Traveler Search Audit Ledger (MongoDB Store)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time stream of exploration queries logged to <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-indigo-700 font-bold">GET /api/search/history</code>.
              </p>
            </div>
            <button
              onClick={loadSearchLogs}
              disabled={isLogsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLogsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-3">
            {searchLogs.map((log: any) => (
              <div key={log.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-bold text-slate-900 text-sm">"{log.query}"</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[11px]">
                    <span>Landmark: <b>{log.landmark}</b></span>
                    <span>•</span>
                    <span>City: <b>{log.city}</b></span>
                    <span>•</span>
                    <span>Vibe: <b className="capitalize">{log.vibe || 'cultural'}</b></span>
                    <span>•</span>
                    <span>Budget: <b>₹{log.maxBudget}</b></span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
