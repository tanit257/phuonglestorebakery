import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollText,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader,
  Filter,
  Trash2,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { fetchLogs, fetchLogSources } from '../services/appLogger';
import { supabase } from '../services/supabase';
import { formatDateTime } from '../utils/formatters';

const LEVEL_CONFIG = {
  info: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  warn: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
};

const PAGE_SIZE = 30;

const LogRow = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const config = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
  const Icon = config.icon;

  const parsedDetails = (() => {
    if (!log.details) return null;
    try {
      return typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
    } catch {
      return log.details;
    }
  })();

  const hasDetails = parsedDetails !== null;

  return (
    <div className={`border rounded-xl ${config.border} ${config.bg} transition-all`}>
      <button
        onClick={() => hasDetails && setExpanded((prev) => !prev)}
        className={`w-full flex items-start gap-3 p-3 text-left ${hasDetails ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <Icon size={18} className={`${config.color} mt-0.5 shrink-0`} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
              {log.level.toUpperCase()}
            </span>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {log.source}
            </span>
            <span className="text-xs text-gray-400 ml-auto shrink-0">
              {formatDateTime(log.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-800 break-words">{log.message}</p>
        </div>

        {hasDetails && (
          <div className="shrink-0 mt-0.5">
            {expanded
              ? <ChevronUp size={16} className="text-gray-400" />
              : <ChevronDown size={16} className="text-gray-400" />
            }
          </div>
        )}
      </button>

      {expanded && hasDetails && (
        <div className="px-4 pb-3 pt-0">
          <pre className="text-xs bg-gray-900 text-green-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-words max-h-64">
            {typeof parsedDetails === 'string'
              ? parsedDetails
              : JSON.stringify(parsedDetails, null, 2)
            }
          </pre>
        </div>
      )}
    </div>
  );
};

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [sources, setSources] = useState([]);

  // Filters
  const [level, setLevel] = useState('all');
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Cleanup dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    const result = await fetchLogs({
      level,
      source,
      search,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    });
    setLogs(result.logs);
    setTotal(result.total);
    setLoading(false);
  }, [level, source, search, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    fetchLogSources().then(setSources);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(0);
  };

  const handleCleanup = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xoa log cu',
      message: 'Xoa tat ca log cu hon 30 ngay? Hanh dong nay khong the hoan tac.',
      onConfirm: async () => {
        try {
          const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          await supabase.from('app_logs').delete().lt('created_at', cutoff);
          await loadLogs();
        } catch (err) {
          console.error('Cleanup failed:', err);
        }
      },
    });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Stats
  const levelCounts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Nhat ky he thong" icon={ScrollText} showModeToggle={false} />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(LEVEL_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Card key={key} className="!p-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 capitalize">{key}</p>
                    <p className="text-lg font-bold text-gray-800">
                      {levelCounts[key] || 0}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Toolbar */}
        <Card>
          <div className="flex flex-col gap-3">
            {/* Top row: search + actions */}
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tim kiem log..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters((p) => !p)}
              >
                <Filter size={16} />
              </Button>

              <Button variant="secondary" size="sm" onClick={loadLogs}>
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </Button>

              <Button variant="danger" size="sm" onClick={handleCleanup}>
                <Trash2 size={16} />
              </Button>
            </div>

            {/* Filters row */}
            {showFilters && (
              <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-500">Level:</label>
                  <select
                    value={level}
                    onChange={handleFilterChange(setLevel)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tat ca</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                    <option value="success">Success</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-500">Nguon:</label>
                  <select
                    value={source}
                    onChange={handleFilterChange(setSource)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tat ca</option>
                    {sources.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-gray-400 self-center ml-auto">
                  {total} log{total !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Log list */}
        <div className="space-y-2">
          {loading && logs.length === 0 ? (
            <Card>
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500">Dang tai...</span>
              </div>
            </Card>
          ) : logs.length === 0 ? (
            <Card>
              <div className="text-center py-12 text-gray-400">
                <ScrollText size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">Khong co log nao</p>
                <p className="text-sm mt-1">Log se xuat hien khi cron job chay hoac co event quan trong</p>
              </div>
            </Card>
          ) : (
            logs.map((log) => <LogRow key={log.id} log={log} />)
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Truoc
            </Button>
            <span className="text-sm text-gray-500 px-3">
              Trang {page + 1} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Sau
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        confirmText="Xac nhan"
        variant="danger"
      />
    </div>
  );
};

export default LogsPage;
