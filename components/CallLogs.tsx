import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Calendar, Download, X, Copy, Zap, FileText, ChevronDown, Info } from 'lucide-react';
import { usePlanMode } from '../context/PlanModeContext';
import { formatCredits, formatNumber, formatDuration } from '../utils/chartUtils';
import DateRangeCalendar from './ui/DateRangeCalendar';

interface CallRecord {
  id: number;
  time: string;
  user: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  personalCredits: number;
  sharedCredits: number;
  addonCredits: number;
  duration: number;
  status: 'success' | 'timeout';
  client: string;
  input: string;
  output: string;
}

const callData: CallRecord[] = [
  {
    id: 1, time: '2026-04-23 10:45:12', user: '张伟', model: 'DeepSeek-V3',
    inputTokens: 450, outputTokens: 1200, personalCredits: 3, sharedCredits: 0, addonCredits: 0,
    duration: 2.3, status: 'success', client: 'VS Code',
    input: '为以下 React 组件编写一个防抖 (debounce) 自定义 Hook：\n\n```tsx\nfunction SearchInput() {\n  const [query, setQuery] = useState(\'\');\n  // ...\n}\n```',
    output: '好的，这是一个标准的 `useDebounce` Hook 实现：\n\n```tsx\nimport { useState, useEffect } from \'react\';\n\nfunction useDebounce<T>(value: T, delay: number): T {\n  const [debouncedValue, setDebouncedValue] = useState<T>(value);\n\n  useEffect(() => {\n    const timer = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delay);\n\n    return () => {\n      clearTimeout(timer);\n    };\n  }, [value, delay]);\n\n  return debouncedValue;\n}\n\nexport default useDebounce;\n```',
  },
  {
    id: 2, time: '2026-04-23 10:30:45', user: '李华', model: 'Claude-3.5-Sonnet',
    inputTokens: 2100, outputTokens: 1560, personalCredits: 0, sharedCredits: 12, addonCredits: 0,
    duration: 3.8, status: 'success', client: 'JetBrains IDE',
    input: '请帮我优化这段 SQL 查询的性能...',
    output: '以下是优化后的 SQL 查询方案...',
  },
  {
    id: 3, time: '2026-04-23 10:28:12', user: '王芳', model: 'GPT-4o',
    inputTokens: 890, outputTokens: 0, personalCredits: 0, sharedCredits: 0, addonCredits: 0,
    duration: 30.0, status: 'timeout', client: 'VS Code',
    input: '分析项目中所有的依赖关系并生成依赖图...',
    output: '',
  },
  {
    id: 4, time: '2026-04-23 10:25:33', user: '张伟', model: 'DeepSeek-V3',
    inputTokens: 3200, outputTokens: 2100, personalCredits: 0, sharedCredits: 0, addonCredits: 18,
    duration: 4.2, status: 'success', client: 'VS Code',
    input: '请为以下 Go 服务编写单元测试...',
    output: '以下是完整的单元测试代码...',
  },
  {
    id: 5, time: '2026-04-23 10:18:55', user: '陈刚', model: 'GPT-4o',
    inputTokens: 980, outputTokens: 720, personalCredits: 0, sharedCredits: 6, addonCredits: 0,
    duration: 1.9, status: 'success', client: 'JetBrains IDE',
    input: '解释这段正则表达式的含义...',
    output: '这段正则表达式用于匹配...',
  },
  {
    id: 6, time: '2026-04-22 17:15:22', user: '王芳', model: 'DeepSeek-V3',
    inputTokens: 4500, outputTokens: 3200, personalCredits: 0, sharedCredits: 0, addonCredits: 26,
    duration: 5.6, status: 'success', client: 'VS Code',
    input: '请帮我实现一个基于 WebSocket 的实时通信模块...',
    output: '以下是基于 WebSocket 的实时通信模块实现...',
  },
  {
    id: 7, time: '2026-04-22 16:12:10', user: '张伟', model: 'GPT-4o',
    inputTokens: 780, outputTokens: 540, personalCredits: 5, sharedCredits: 0, addonCredits: 0,
    duration: 1.5, status: 'success', client: 'VS Code',
    input: '将这段 JavaScript 代码转换为 TypeScript...',
    output: '以下是转换后的 TypeScript 代码...',
  },
  {
    id: 8, time: '2026-04-22 14:08:44', user: '李华', model: 'Claude-3.7-Sonnet',
    inputTokens: 1200, outputTokens: 900, personalCredits: 0, sharedCredits: 8, addonCredits: 0,
    duration: 2.8, status: 'success', client: 'JetBrains IDE',
    input: '请帮我生成接口文档...',
    output: '以下是接口文档...',
  },
  {
    id: 9, time: '2026-04-22 11:30:05', user: '陈刚', model: 'DeepSeek-V3',
    inputTokens: 650, outputTokens: 0, personalCredits: 0, sharedCredits: 0, addonCredits: 0,
    duration: 30.0, status: 'timeout', client: 'VS Code',
    input: '帮我分析整个代码库的架构...',
    output: '',
  },
  {
    id: 10, time: '2026-04-21 15:22:18', user: '李华', model: 'GPT-4o',
    inputTokens: 2400, outputTokens: 1800, personalCredits: 0, sharedCredits: 0, addonCredits: 15,
    duration: 3.5, status: 'success', client: 'VS Code',
    input: '请重构以下代码以提高可维护性...',
    output: '以下是重构后的代码...',
  },
];

const MODELS = [...new Set(callData.map(r => r.model))];

const formatTokenK = (n: number) => {
  if (n === 0) return '0';
  const k = n / 1000;
  return k >= 1 ? `${k.toFixed(1)}K` : `${n}`;
};

const formatTokenDetail = (input: number, output: number) => {
  const total = input + output;
  const toK = (n: number) => {
    const k = n / 1000;
    return `${k.toFixed(2)}K`;
  };
  return `${toK(total)} (${toK(input)} + ${toK(output)})`;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  success: { label: '成功', className: 'bg-green-50 text-green-700 border-green-200' },
  timeout: { label: '超时', className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const DetailModal: React.FC<{ record: CallRecord; onClose: () => void; isExclusive: boolean }> = ({ record, onClose, isExclusive }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const totalCredits = record.personalCredits + record.sharedCredits + record.addonCredits;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h3 className="font-bold text-slate-900">调用详情</h3>
            <p className="text-xs text-slate-400 mt-1">ID: {record.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-slate-400 mb-1">调用时间</div>
              <div className="text-sm font-medium text-slate-900">{record.time}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">执行用户</div>
              <div className="text-sm font-medium text-slate-900">{record.user}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">模型 / 客户端</div>
              <div className="text-sm font-medium text-slate-900">{record.model} | {record.client}</div>
            </div>
            <div>
              {isExclusive ? (
                <>
                  <div className="text-xs text-slate-400 mb-1">TOKEN 统计</div>
                  <div className="text-sm font-medium text-slate-900">Input: {formatTokenK(record.inputTokens)} / Output: {formatTokenK(record.outputTokens)}</div>
                </>
              ) : (
                <>
                  <div className="text-xs text-slate-400 mb-1">合计消耗积分</div>
                  <div className="text-sm font-bold text-slate-900">{totalCredits > 0 ? totalCredits : '-'}</div>
                </>
              )}
            </div>
          </div>

          {!isExclusive && totalCredits > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '个人积分消耗', value: record.personalCredits, color: 'blue' },
                { label: '共享积分消耗', value: record.sharedCredits, color: 'teal' },
                { label: '增量包积分消耗', value: record.addonCredits, color: 'orange' },
              ].map(item => (
                <div key={item.label} className={`rounded-lg p-3 border ${
                  item.color === 'blue' ? 'bg-blue-50 border-blue-100' :
                  item.color === 'teal' ? 'bg-teal-50 border-teal-100' :
                  'bg-orange-50 border-orange-100'
                }`}>
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div className={`text-base font-bold ${
                    item.color === 'blue' ? 'text-blue-700' :
                    item.color === 'teal' ? 'text-teal-700' :
                    'text-orange-700'
                  }`}>{item.value > 0 ? item.value : '-'}</div>
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900">模型输入</span>
              <button
                onClick={() => handleCopy(record.input, 'input')}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                {copiedField === 'input' ? '已复制' : '复制内容'}
              </button>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {record.input}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-900">模型输出</span>
              <button
                onClick={() => handleCopy(record.output, 'output')}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                {copiedField === 'output' ? '已复制' : '复制内容'}
              </button>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {record.output || '（无输出内容）'}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const DropdownSelect: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  allLabel?: string;
}> = ({ label, value, options, onChange, allLabel = '全部' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors bg-white whitespace-nowrap"
      >
        <span className="max-w-[100px] truncate">{value || label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[160px]">
          <button
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${value === '' ? 'text-blue-600 font-medium' : 'text-slate-700'}`}
          >
            {allLabel}
          </button>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 truncate ${value === opt ? 'text-blue-600 font-medium' : 'text-slate-700'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CallLogs: React.FC = () => {
  const { planMode } = usePlanMode();
  const isExclusive = planMode === 'exclusive';

  const [search, setSearch] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CallRecord | null>(null);
  const [sortCol, setSortCol] = useState<'personal' | 'shared' | 'addon' | 'duration' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setShowCalendar(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  let filtered = callData.filter(r => {
    if (r.status !== 'success') return false;
    if (search && !r.user.includes(search)) return false;
    if (filterModel && r.model !== filterModel) return false;
    if (dateRange.start && dateRange.end) {
      const t = new Date(r.time);
      if (t < dateRange.start || t > dateRange.end) return false;
    }
    return true;
  });

  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      let aVal: number, bVal: number;
      if (sortCol === 'personal') {
        aVal = a.personalCredits;
        bVal = b.personalCredits;
      } else if (sortCol === 'shared') {
        aVal = a.sharedCredits;
        bVal = b.sharedCredits;
      } else if (sortCol === 'addon') {
        aVal = a.addonCredits;
        bVal = b.addonCredits;
      } else {
        aVal = a.duration;
        bVal = b.duration;
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  const totals = filtered.reduce(
    (acc, r) => ({
      personal: acc.personal + r.personalCredits,
      shared: acc.shared + r.sharedCredits,
      addon: acc.addon + r.addonCredits,
    }),
    { personal: 0, shared: 0, addon: 0 }
  );
  const totalCredits = totals.personal + totals.shared + totals.addon;

  const dateLabel = dateRange.start && dateRange.end
    ? `${dateRange.start.toLocaleDateString('zh-CN')} ~ ${dateRange.end.toLocaleDateString('zh-CN')}`
    : '选择日期';

  const hasFilter = filterModel || dateRange.start;

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900">调用明细</h3>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <div className="relative w-56">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索用户姓名..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          <div className="relative" ref={calendarRef}>
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
              <input
                type="text"
                value={dateLabel}
                readOnly
                className="px-3 py-1.5 text-sm text-slate-700 bg-white outline-none cursor-pointer flex-1 min-w-0"
                onClick={() => setShowCalendar(o => !o)}
              />
              <button
                onClick={() => setShowCalendar(o => !o)}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-600 transition-colors border-l border-slate-200 flex-shrink-0"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
            {showCalendar && (
              <div className="absolute top-full left-0 mt-1 z-50 shadow-xl rounded-xl overflow-hidden border border-slate-200">
                <DateRangeCalendar
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onSelect={(s, e) => { setDateRange({ start: s, end: e }); setShowCalendar(false); }}
                  onCancel={() => setShowCalendar(false)}
                />
              </div>
            )}
          </div>

          <DropdownSelect label="模型" value={filterModel} options={MODELS} onChange={setFilterModel} />

          {hasFilter && (
            <button
              onClick={() => { setFilterModel(''); setDateRange({ start: null, end: null }); }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              清除筛选
            </button>
          )}
        </div>

        {!isExclusive && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                积分消耗按优先级扣减：<span className="font-semibold">个人积分</span> → <span className="font-semibold">企业共享积分</span> → <span className="font-semibold">增量包积分</span>。超时调用不消耗积分。
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs ml-4 flex-shrink-0 whitespace-nowrap">
              <div>
                <span className="text-blue-600">总计：</span>
                <span className="font-bold text-blue-900 ml-1">{formatCredits(totalCredits)}</span>
              </div>
              <div>
                <span className="text-blue-600">个人：</span>
                <span className="font-bold text-blue-700 ml-1">{formatCredits(totals.personal)}</span>
              </div>
              <div>
                <span className="text-blue-600">共享：</span>
                <span className="font-bold text-teal-700 ml-1">{formatCredits(totals.shared)}</span>
              </div>
              <div>
                <span className="text-blue-600">增量包：</span>
                <span className="font-bold text-orange-600 ml-1">{formatCredits(totals.addon)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 text-xs font-medium text-slate-500">用户</th>
                <th className="text-left py-3 text-xs font-medium text-slate-500">时间</th>
                <th className="text-left py-3 text-xs font-medium text-slate-500">模型</th>
                <th className="text-left py-3 text-xs font-medium text-slate-500">客户端</th>
                {isExclusive ? (
                  <>
                    <th className="text-right py-3 text-xs font-medium text-slate-500">Token消耗(输入+输出)</th>
                  </>
                ) : (
                  <>
                    <th
                      className="text-right py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700 select-none"
                      onClick={() => {
                        if (sortCol === 'personal') {
                          setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortCol('personal');
                          setSortDir('asc');
                        }
                      }}
                    >
                      个人消耗积分 {sortCol === 'personal' && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="text-right py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700 select-none"
                      onClick={() => {
                        if (sortCol === 'shared') {
                          setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortCol('shared');
                          setSortDir('asc');
                        }
                      }}
                    >
                      共享消耗积分 {sortCol === 'shared' && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="text-right py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700 select-none"
                      onClick={() => {
                        if (sortCol === 'addon') {
                          setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortCol('addon');
                          setSortDir('asc');
                        }
                      }}
                    >
                      增量包消耗积分 {sortCol === 'addon' && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                  </>
                )}
                <th
                  className="text-right py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => {
                    if (sortCol === 'duration') {
                      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortCol('duration');
                      setSortDir('asc');
                    }
                  }}
                >
                  耗时(秒) {sortCol === 'duration' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                {isExclusive && <th className="text-right py-3 text-xs font-medium text-slate-500">操作</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isExclusive ? 7 : 8} className="py-12 text-center text-sm text-slate-400">暂无匹配记录</td>
                </tr>
              ) : filtered.map((r) => {
                return (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 text-slate-700 cursor-pointer" onClick={() => !isExclusive && setSelectedRecord(r)}>{r.user}</td>
                    <td className="py-3.5 text-slate-600 font-mono text-xs cursor-pointer" onClick={() => !isExclusive && setSelectedRecord(r)}>{r.time}</td>
                    <td className="py-3.5 font-medium text-slate-900 cursor-pointer" onClick={() => !isExclusive && setSelectedRecord(r)}>{r.model}</td>
                    <td className="py-3.5 text-slate-600 text-xs cursor-pointer" onClick={() => !isExclusive && setSelectedRecord(r)}>{r.client}</td>
                    {isExclusive ? (
                      <>
                        <td className="py-3.5 text-right text-slate-600 tabular-nums">{formatTokenDetail(r.inputTokens, r.outputTokens)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-3.5 text-right tabular-nums cursor-pointer" onClick={() => setSelectedRecord(r)}>
                          {r.personalCredits > 0 ? <span className="font-medium text-blue-700">{r.personalCredits}</span> : <span className="text-slate-300">-</span>}
                        </td>
                        <td className="py-3.5 text-right tabular-nums cursor-pointer" onClick={() => setSelectedRecord(r)}>
                          {r.sharedCredits > 0 ? <span className="font-medium text-teal-700">{r.sharedCredits}</span> : <span className="text-slate-300">-</span>}
                        </td>
                        <td className="py-3.5 text-right tabular-nums cursor-pointer" onClick={() => setSelectedRecord(r)}>
                          {r.addonCredits > 0 ? <span className="font-medium text-orange-600">{r.addonCredits}</span> : <span className="text-slate-300">-</span>}
                        </td>
                      </>
                    )}
                    <td className="py-3.5 text-right text-slate-600 tabular-nums cursor-pointer" onClick={() => !isExclusive && setSelectedRecord(r)}>{formatDuration(r.duration)}s</td>
                    {isExclusive && (
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
                        >
                          查看详情
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400">共 {filtered.length} 条记录</span>
          <div className="flex items-center gap-2 text-sm">
            <button className="px-3 py-1 border border-slate-200 rounded text-slate-400 text-xs cursor-not-allowed">上一页</button>
            <span className="text-xs text-slate-500">1 / 1</span>
            <button className="px-3 py-1 border border-slate-200 rounded text-slate-400 text-xs cursor-not-allowed">下一页</button>
          </div>
        </div>
      </div>

      {selectedRecord && (
        <DetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} isExclusive={isExclusive} />
      )}
    </div>
  );
};

export default CallLogs;
