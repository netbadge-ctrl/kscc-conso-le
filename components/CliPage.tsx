import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartBar as BarChart3, Zap, Clock } from 'lucide-react';
import { Icons } from './ui/Icons';

type TabId = 'token' | 'skills' | 'mcp';

interface CallRecord {
  time: string;
  client: string;
  status: '成功' | '失败';
  model: string;
  input: number;
  output: number;
  token: number;
  cost: number;
}

const callRecords: CallRecord[] = [
  { time: '10:32:15', client: 'Web 客户端', status: '成功', model: 'Claude 3.5 Sonnet', input: 1250, output: 3420, token: 4670, cost: 0.5604 },
  { time: '10:28:03', client: 'CLI 工具', status: '成功', model: 'GPT-4o', input: 890, output: 2150, token: 3040, cost: 0.3040 },
  { time: '10:15:42', client: 'Web 客户端', status: '成功', model: 'Claude 3.5 Sonnet', input: 2100, output: 4800, token: 6900, cost: 0.8280 },
  { time: '09:58:21', client: 'API 调用', status: '失败', model: 'DeepSeek V3', input: 650, output: 0, token: 650, cost: 0.0130 },
  { time: '09:45:33', client: 'Web 客户端', status: '成功', model: 'Claude 3.5 Sonnet', input: 1800, output: 5200, token: 7000, cost: 0.8400 },
  { time: '09:32:18', client: 'CLI 工具', status: '成功', model: 'GPT-4o', input: 720, output: 1650, token: 2370, cost: 0.2370 },
  { time: '09:18:55', client: 'Web 客户端', status: '成功', model: 'Claude 3.5 Sonnet', input: 1450, output: 3800, token: 5250, cost: 0.6300 },
  { time: '09:05:12', client: 'SDK 集成', status: '成功', model: 'DeepSeek V3', input: 980, output: 2250, token: 3230, cost: 0.0646 },
  { time: '08:52:47', client: 'CLI 工具', status: '成功', model: 'GPT-4o', input: 560, output: 1440, token: 2000, cost: 0.2000 },
  { time: '08:38:29', client: 'Web 客户端', status: '成功', model: 'Claude 3.5 Sonnet', input: 1100, output: 2900, token: 4000, cost: 0.4800 },
];

const totalTokens = callRecords.reduce((s, r) => s + r.token, 0);
const totalCost = callRecords.reduce((s, r) => s + r.cost, 0);

const formatNumber = (n: number) => n.toLocaleString();
const formatTokenK = (n: number) => {
  if (n === 0) return '0';
  const k = n / 1000;
  return k >= 1 ? `${k.toFixed(1)}K` : `${n}`;
};

const TokenUsageTab: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  const uniqueStatuses = Array.from(new Set(callRecords.map(r => r.status)));
  const uniqueModels = Array.from(new Set(callRecords.map(r => r.model)));

  const filteredRecords = callRecords.filter(r => {
    if (selectedStatus && r.status !== selectedStatus) return false;
    if (selectedModel && r.model !== selectedModel) return false;
    return true;
  });

  const filteredTokens = filteredRecords.reduce((s, r) => s + r.token, 0);
  const filteredCost = filteredRecords.reduce((s, r) => s + r.cost, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-slate-900">月累计消耗</span>
          </div>
          <div className="flex items-baseline gap-8">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">¥26.82</span>
                <span className="text-sm text-slate-400">/ ¥100.00</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">消费金额</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">328.4K</div>
              <p className="text-xs text-slate-400 mt-0.5">Token 消耗</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">较上月 +12.3%</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-slate-900">当日消耗</span>
          </div>
          <div className="flex items-baseline gap-8">
            <div>
              <div className="text-2xl font-bold text-slate-900">¥{totalCost.toFixed(2)}</div>
              <p className="text-xs text-slate-400 mt-0.5">消费金额</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{(totalTokens / 1000).toFixed(1)}K</div>
              <p className="text-xs text-slate-400 mt-0.5">Token 消耗</p>
            </div>
          </div>
          <p className="text-xs text-orange-500 mt-3">较昨日 -5.1%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-slate-600" />
          <span className="font-bold text-slate-900 text-base">今日调用明细</span>
        </div>

        <div className="mb-5 flex items-end gap-3 flex-wrap">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 mb-1">状态</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">全部</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 mb-1">模型</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="">全部</option>
              {uniqueModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          {(selectedStatus || selectedModel) && (
            <button
              onClick={() => {
                setSelectedStatus('');
                setSelectedModel('');
              }}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              清空筛选
            </button>
          )}

          <div className="flex-1 text-right text-sm text-slate-400">
            筛选结果 {filteredRecords.length} 次调用，消耗 {(filteredTokens / 1000).toFixed(1)}K tokens / ¥{filteredCost.toFixed(2)}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left pb-3 text-xs font-medium text-slate-400 w-24">时间</th>
              <th className="text-left pb-3 text-xs font-medium text-slate-400 w-32">客户端</th>
              <th className="text-left pb-3 text-xs font-medium text-slate-400 w-20">状态</th>
              <th className="text-left pb-3 text-xs font-medium text-slate-400">模型</th>
              <th className="text-right pb-3 text-xs font-medium text-slate-400">输入</th>
              <th className="text-right pb-3 text-xs font-medium text-slate-400">输出</th>
              <th className="text-right pb-3 text-xs font-medium text-slate-400">Token</th>
              <th className="text-right pb-3 text-xs font-medium text-slate-400 w-28">费用（元）</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((r, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 font-mono text-slate-500 text-xs">{r.time}</td>
                  <td className="py-4 text-sm text-slate-600">{r.client}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      r.status === '成功'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="inline-block px-2.5 py-1 border border-slate-200 rounded text-xs font-medium text-slate-700">
                      {r.model}
                    </span>
                  </td>
                  <td className="py-4 text-right text-slate-600 tabular-nums">{formatTokenK(r.input)}</td>
                  <td className="py-4 text-right text-slate-600 tabular-nums">{formatTokenK(r.output)}</td>
                  <td className="py-4 text-right font-medium text-slate-800 tabular-nums">{formatTokenK(r.token)}</td>
                  <td className="py-4 text-right font-medium text-orange-500 tabular-nums">¥{r.cost.toFixed(4)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-slate-400">
                  没有匹配的记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ComingSoonTab: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-12">
    <div className="flex flex-col items-center justify-center text-center">
      <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-400">功能即将推出，敬请期待</p>
    </div>
  </div>
);

const CliPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('token');

  const tabs: { id: TabId; label: string; icon?: React.ReactNode; badge?: string }[] = [
    { id: 'token', label: 'Token 用量', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills 配置', badge: '即将推出' },
    { id: 'mcp', label: 'MCP 管理', badge: '即将推出' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-slate-600 hover:text-slate-900 font-bold text-lg transition-colors">
            KSGC
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden md:block group">
            <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="搜索"
              className="pl-9 pr-4 py-1.5 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-5 text-slate-500">
            <button className="hover:text-slate-800 transition-colors" title="通知"><Icons.Bell className="w-5 h-5" /></button>
            <button className="hover:text-slate-800 transition-colors" title="帮助"><Icons.Help className="w-5 h-5" /></button>
          </div>
          <div className="flex items-center gap-2 pl-6 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">陈</div>
            <span className="text-sm font-medium text-slate-700 hidden lg:block">chennan 陈楠</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">张</div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">张三 的 CLI</h1>
              <p className="text-xs text-slate-400">技术中心 / 前端开发组</p>
            </div>
          </div>

          <div className="border-b border-slate-200 mb-6">
            <div className="flex gap-0">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { if (!tab.badge) setActiveTab(tab.id); }}
                  className={`relative flex items-center gap-1.5 px-4 pb-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600'
                      : tab.badge ? 'text-slate-400 cursor-default' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-1 px-1.5 py-0.5 bg-orange-50 text-orange-500 text-[10px] font-medium rounded">
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'token' && <TokenUsageTab />}
          {activeTab === 'skills' && <ComingSoonTab title="Skills 配置" />}
          {activeTab === 'mcp' && <ComingSoonTab title="MCP 管理" />}
        </div>
      </main>
    </div>
  );
};

export default CliPage;
