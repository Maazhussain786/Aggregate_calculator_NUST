'use client';

import { useEffect, useState, useCallback } from 'react';

interface ClickStats {
  linkType: string;
  days: number;
  totalClicks: number;
  allTimeTotal: number;
  bySource: { source: string; clicks: number }[];
  recentClicks: { id: string; source: string; createdAt: string }[];
  error?: string;
}

const SOURCE_LABELS: Record<string, string> = {
  homepage: '🏠 Homepage',
  preparation: '📚 Preparation Page',
  horizon_promo: '🎯 Horizon Promo Section',
};

export default function ClickStatsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<ClickStats | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  // Check if already authenticated this session
  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'malikat aldirama') {
      setAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  if (!authenticated) {
    return (
      <div className="animate-fade-in py-20">
        <div className="max-w-sm mx-auto px-4">
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Admin Access
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Enter password to view click analytics
            </p>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] mb-3"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500 mb-3">{error}</p>
              )}
              <button
                type="submit"
                className="btn btn-primary w-full py-3 text-sm"
              >
                Unlock
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/click-stats?linkType=whatsapp_group&days=${days}`);
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="animate-fade-in py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
            📊 WhatsApp Group Click Tracker
          </h1>
          <p className="text-[var(--text-secondary)]">
            Track how many students click the &quot;Join Free WhatsApp Group&quot; button from your website.
          </p>
        </div>

        {stats?.error && (
          <div className="card p-4 mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ {stats.error}
            </p>
          </div>
        )}

        {/* Time Period Selector */}
        <div className="flex gap-2 mb-6">
          {[7, 30, 90, 365].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                days === d
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {d === 365 ? '1 Year' : `${d} Days`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stats ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-[var(--accent-primary)] mono">
                  {stats.totalClicks}
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Clicks (Last {days} days)
                </p>
              </div>
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-[var(--text-primary)] mono">
                  {stats.allTimeTotal}
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  All-Time Total
                </p>
              </div>
              <div className="card p-6 text-center">
                <p className="text-3xl font-bold text-[var(--text-primary)] mono">
                  {stats.bySource.length}
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Active Sources
                </p>
              </div>
            </div>

            {/* Clicks by Source */}
            <div className="card p-6 mb-8">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Clicks by Page Source
              </h2>
              {stats.bySource.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No clicks recorded yet. Data will appear once students start clicking the WhatsApp Group button.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.bySource.map((s) => {
                    const maxClicks = stats.bySource[0]?.clicks || 1;
                    const pct = Math.round((s.clicks / maxClicks) * 100);
                    return (
                      <div key={s.source}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {SOURCE_LABELS[s.source] || s.source}
                          </span>
                          <span className="text-sm font-bold text-[var(--accent-primary)] mono">
                            {s.clicks}
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Clicks Log */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Recent Clicks
              </h2>
              {stats.recentClicks.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No clicks recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">
                          #
                        </th>
                        <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">
                          Source
                        </th>
                        <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentClicks.map((click, i) => (
                        <tr
                          key={click.id}
                          className="border-b border-[var(--border-color)] last:border-0"
                        >
                          <td className="py-2 px-3 text-[var(--text-muted)]">{i + 1}</td>
                          <td className="py-2 px-3 text-[var(--text-primary)]">
                            {SOURCE_LABELS[click.source] || click.source}
                          </td>
                          <td className="py-2 px-3 text-[var(--text-muted)] mono">
                            {new Date(click.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          
          </>
        ) : (
          <div className="card p-10 text-center">
            <p className="text-[var(--text-muted)]">Failed to load stats. Is the database running?</p>
          </div>
        )}
      </div>
    </div>
  );
}
