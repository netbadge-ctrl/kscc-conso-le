import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from './ui/Icons';
import { AIModel, Member, UsageMetric } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line, ComposedChart, ReferenceLine } from 'recharts';
import { formatTokens, formatCredits, formatNumber } from '../utils/chartUtils';
import UsageOrgView from './UsageOrgView';
import { generateTimePoints, getGranularityLabel, createInitialTimeRange } from '../utils/chartUtils';
import TimeRangePicker, { type TimeRangeValue } from './ui/TimeRangePicker';
import { usePlanMode } from '../context/PlanModeContext';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
  onDataPoint?: (time: string | null) => void;
}

const CustomTooltipComponent: React.FC<CustomTooltipProps> = ({ active, label, onDataPoint }) => {
  React.useEffect(() => {
    if (active && label) {
      onDataPoint?.(label as string);
    } else if (!active) {
      onDataPoint?.(null);
    }
  }, [active, label, onDataPoint]);

  return null;
};

// --- Dashboard Overview ---
export const DashboardOverview: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const { planMode, setPlanMode } = usePlanMode();
  const isExclusive = planMode === 'exclusive';
  const [timeRange, setTimeRange] = useState<TimeRangeValue>(() => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    return { start: startOfDay, end: now };
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const trendData = useMemo(() => {
    const timePoints = generateTimePoints(timeRange.start, timeRange.end);
    const fixedData = [
      { activeUsers: 12, tokenVolume: 45, requests: 38 },
      { activeUsers: 14, tokenVolume: 52, requests: 42 },
      { activeUsers: 16, tokenVolume: 58, requests: 45 },
      { activeUsers: 18, tokenVolume: 65, requests: 48 },
      { activeUsers: 20, tokenVolume: 72, requests: 52 },
      { activeUsers: 22, tokenVolume: 78, requests: 55 },
      { activeUsers: 24, tokenVolume: 85, requests: 58 },
      { activeUsers: 26, tokenVolume: 92, requests: 62 },
      { activeUsers: 28, tokenVolume: 88, requests: 60 },
      { activeUsers: 30, tokenVolume: 95, requests: 65 },
      { activeUsers: 32, tokenVolume: 98, requests: 68 },
      { activeUsers: 30, tokenVolume: 92, requests: 64 },
      { activeUsers: 28, tokenVolume: 85, requests: 60 },
      { activeUsers: 25, tokenVolume: 78, requests: 55 },
      { activeUsers: 22, tokenVolume: 72, requests: 52 },
      { activeUsers: 20, tokenVolume: 68, requests: 50 },
    ];
    return timePoints.map((time, idx) => ({
      time,
      activeUsers: fixedData[idx % fixedData.length].activeUsers,
      tokenVolume: fixedData[idx % fixedData.length].tokenVolume,
      requests: fixedData[idx % fixedData.length].requests,
    }));
  }, [timeRange]);

  const selectedData = useMemo(() => {
    if (!selectedTime) return null;
    return trendData.find(item => item.time === selectedTime) || null;
  }, [selectedTime, trendData]);

  const granularityLabel = useMemo(() => {
    return getGranularityLabel(timeRange.start, timeRange.end);
  }, [timeRange]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* 1. Subscription Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {/* Single row: company info + version badges + seats/credits + button */}
        <div className="flex items-center gap-6 px-6 py-4">
          {/* Company and version info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">{isExclusive ? 'TechFlow Inc.' : 'XX科技有限责任公司'}</h2>
              {isExclusive ? (
                <>
                  <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded border border-blue-100 font-medium">专享版</span>
                  <span className="bg-orange-50 text-orange-600 text-xs px-2 py-0.5 rounded border border-orange-100 font-medium">试用中</span>
                </>
              ) : (
                <>
                  <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded border border-blue-100 font-medium">共享版 LITE</span>
                  <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded border border-green-100 font-medium">正式</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">企业识别码: {isExclusive ? 'techflow' : 'camelotkit'}</p>
          </div>

          {/* Credits section - only for shared plan */}
          {!isExclusive && (
          <>
            {/* 套餐积分 */}
            <div className="flex-shrink-0 border-l border-slate-100 pl-6">
              <div className="text-xs text-slate-400 mb-1">套餐积分</div>
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-slate-900">6,270</span>
                    <span className="text-xs text-slate-400">剩余</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-slate-400">已用 53,730 / 60,000 分</span>
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded text-orange-500 bg-orange-50">90%</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 whitespace-nowrap">
                  05-18 重置
                </div>
              </div>
            </div>
            {/* 增量包积分 */}
            <div className="flex-shrink-0 border-l border-slate-100 pl-6">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <span>增量包积分</span>
                <span className="text-[10px] text-teal-600 bg-teal-50 border border-teal-100 px-1 rounded">不过期</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-900">8,500</span>
                <span className="text-xs text-slate-400">分</span>
              </div>
              <div className="mt-1">
                <button
                  onClick={() => onNavigate?.('subscription-addon')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap"
                >
                  购买增量包
                </button>
              </div>
            </div>
          </>
          )}

          {/* Seats section - for both plans */}
          {isExclusive && (
          <div className="flex-shrink-0 border-l border-slate-100 pl-6">
            <div className="text-xs text-slate-400 mb-1">席位余量</div>
            <div className="flex items-center gap-2">
              <Icons.Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-base font-bold text-slate-900">5</span>
              <span className="text-xs text-slate-400">剩余 / 50 席</span>
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded text-blue-600 bg-blue-50">10%</span>
            </div>
          </div>
          )}

          {/* Seats section - shared plan */}
          {!isExclusive && (
          <div className="flex-shrink-0 border-l border-slate-100 pl-6">
            <div className="text-xs text-slate-400 mb-1">席位余量</div>
            <div className="flex items-center gap-2">
              <Icons.Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-base font-bold text-slate-900">6</span>
              <span className="text-xs text-slate-400">剩余 / 20 席</span>
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded text-red-500 bg-red-50">70%</span>
            </div>
          </div>
          )}

          {/* Subscribe button */}
          <div className="flex-shrink-0 border-l border-slate-100 pl-6">
            <button
              onClick={() => onNavigate?.('subscription')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap"
            >
              订阅管理/扩容
            </button>
          </div>
        </div>

      </div>

      {/* 2. Command Lines */}
      <div className="space-y-3">
        {/* Row 1 */}
        <div className="bg-[#111827] rounded-lg overflow-hidden flex flex-col md:flex-row border border-slate-800">
           <div className="flex-1 p-5 font-mono text-sm relative group">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                 KSGC 终端安装命令 (Mac/Linux)
              </div>
              <div className="text-slate-300 break-all leading-relaxed">
                 <span className="text-yellow-400">curl</span> -fsSL https://get.ksgc.io/install.sh | <span className="text-yellow-400">bash</span> -s -- <span className="text-blue-400">--org=techflow --auth=wecom</span>
              </div>
           </div>
           <div className="hidden md:block w-px bg-slate-800 my-4"></div>
           <div className="md:w-64 p-5 flex items-center justify-between bg-[#111827] md:bg-inherit border-t md:border-t-0 border-slate-800">
              <div className="text-xs text-slate-400">
                 <div className="mb-1 text-slate-500">说明</div>
                 <div>标准 KSGC AI Coding 工具</div>
              </div>
              <button className="text-slate-500 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors">
                <Icons.Copy className="w-5 h-5"/>
              </button>
           </div>
        </div>
        {/* Row 2 */}
        <div className="bg-[#111827] rounded-lg overflow-hidden flex flex-col md:flex-row border border-slate-800">
           <div className="flex-1 p-5 font-mono text-sm relative group">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                 自定义终端安装命令 (Mac/Linux)
              </div>
              <div className="text-slate-300 break-all leading-relaxed">
                 <span className="text-blue-400">curl</span> -fsSL https://cli.techflow.io/install.sh | <span className="text-blue-400">bash</span> -s -- <span className="text-blue-400">--auth=wecom</span>
              </div>
           </div>
           <div className="hidden md:block w-px bg-slate-800 my-4"></div>
           <div className="md:w-64 p-5 flex items-center justify-between bg-[#111827] md:bg-inherit border-t md:border-t-0 border-slate-800">
              <div className="text-xs text-slate-400">
                 <div className="mb-1 text-slate-500">说明</div>
                 <div>企业自定义 CLI 工具</div>
              </div>
              <button className="text-slate-500 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors">
                <Icons.Copy className="w-5 h-5"/>
              </button>
           </div>
        </div>
      </div>


      {/* 4. Charts */}
      <div className="space-y-6">
         <div className="grid grid-cols-1 gap-6">
               {/* Token / Credits Chart */}
               <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{isExclusive ? 'Token 消耗量' : '积分消耗量'}</h4>
                    <span className="text-xs text-slate-400">{granularityLabel}</span>
                  </div>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="time"
                          axisLine={false}
                          tickLine={false}
                          tick={{fill: '#94a3b8', fontSize: 10}}
                          dy={10}
                          interval={Math.max(0, Math.floor(trendData.length / 6))}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(val) => isExclusive ? (val === 0 ? '0' : `${(val/1000).toFixed(1)}K`) : `${(val/1000).toFixed(0)}`} width={45} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: any) => isExclusive ? [`${formatTokens(val/1000)}`, 'Token'] : [`${formatCredits(val/1000)}`, '积分']}
                          cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                        />
                        <Line type="monotone" dataKey="tokenVolume" stroke={isExclusive ? '#22c55e' : '#0d9488'} dot={false} strokeWidth={2} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Requests Chart */}
               <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="font-semibold text-slate-900 text-sm">请求次数</h4>
                    <span className="text-xs text-slate-400">{granularityLabel}</span>
                  </div>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="time"
                          axisLine={false}
                          tickLine={false}
                          tick={{fill: '#94a3b8', fontSize: 10}}
                          dy={10}
                          interval={Math.max(0, Math.floor(trendData.length / 6))}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} width={35} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: 'rgba(251, 146, 60, 0.05)' }}
                        />
                        <Line type="monotone" dataKey="requests" stroke="#fb923c" dot={false} strokeWidth={2} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Active Users Chart */}
               <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="font-semibold text-slate-900 text-sm">活跃用户</h4>
                    <span className="text-xs text-slate-400">{granularityLabel}</span>
                  </div>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="time"
                          axisLine={false}
                          tickLine={false}
                          tick={{fill: '#94a3b8', fontSize: 10}}
                          dy={10}
                          interval={Math.max(0, Math.floor(trendData.length / 6))}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} width={35} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                        />
                        <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" dot={false} strokeWidth={2} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
               </div>
         </div>
      </div>
    </div>
  );
};

export const UsageAnalytics: React.FC = () => {
  const { planMode } = usePlanMode();
  const isExclusive = planMode === 'exclusive';
  const [timeRange, setTimeRange] = useState<TimeRangeValue>(() => createInitialTimeRange('7d'));
  const [activeTab, setActiveTab] = useState('org');

  const trendData = useMemo(() => {
    const timePoints = generateTimePoints(timeRange.start, timeRange.end);
    return timePoints.map((time) => ({
      date: time,
      token: Math.floor(Math.random() * 150000) + 340000,
      requests: Math.floor(Math.random() * 800) + 1500,
      users: Math.floor(Math.random() * 8) + 18,
    }));
  }, [timeRange]);

  const granularityLabel = useMemo(() => {
    return getGranularityLabel(timeRange.start, timeRange.end);
  }, [timeRange]);

  const modelCostDataExclusive = [
    { name: 'Kimi', value: 980 },
    { name: 'Qwen 2.5', value: 850 },
    { name: 'DeepSeek V3', value: 520 },
    { name: '其他', value: 230 },
  ];

  const modelCostDataShared = [
    { name: 'Kimi', value: 420 },
    { name: 'Qwen 2.5', value: 360 },
    { name: 'DeepSeek V3', value: 280 },
    { name: '其他', value: 180 },
  ];

  const modelCostData = isExclusive ? modelCostDataExclusive : modelCostDataShared;

  const metrics = isExclusive
    ? [
        { title: 'Token 消耗', value: 2580000, unit: '', change: '+12.5%', isPositive: true, type: 'token' },
        { title: '请求数', value: 12450, unit: '次', change: '+8.2%', isPositive: true, type: 'number' },
        { title: '活跃用户', value: 38, unit: '人', change: '+3', isPositive: true, type: 'number' },
      ]
    : [
        { title: '积分消耗', value: 1240.50, unit: 'Credits', change: '+8.3%', isPositive: true, type: 'credits' },
        { title: '请求数', value: 12450, unit: '次', change: '+8.2%', isPositive: true, type: 'number' },
        { title: '活跃用户', value: 38, unit: '人', change: '+3', isPositive: true, type: 'number' },
      ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
       {/* Top Controls */}
       <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <Icons.Calendar className="w-4 h-4 text-slate-500" />
            <TimeRangePicker
              presets={['24h', '3d', '7d', '30d']}
              value={timeRange}
              onChange={setTimeRange}
            />
          </div>
          
          <div className="flex gap-6 border-b border-slate-200">
             <button
               onClick={() => setActiveTab('org')}
               className={`pb-3 text-sm font-bold border-b-2 transition-all px-2 cursor-default ${activeTab === 'org' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600'}`}
             >
               组织
             </button>
             <button
               onClick={() => setActiveTab('global')}
               className={`pb-3 text-sm font-bold border-b-2 transition-all px-2 cursor-default ${activeTab === 'global' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600'}`}
             >
               全局
             </button>
          </div>
       </div>

       {activeTab === 'org' && <UsageOrgView />}

       {activeTab === 'global' && <>
       {/* Metrics Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m: any, i) => (
             <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                   <div className="text-slate-500 text-xs mb-2">{m.title}</div>
                   <div className="text-2xl font-bold text-slate-900">
                      {m.type === 'token' ? formatTokens(m.value) : m.type === 'credits' ? formatCredits(m.value) : formatNumber(m.value)} <span className="text-xs font-normal text-slate-500">{m.unit}</span>
                   </div>
                </div>
             </div>
          ))}
       </div>

       {/* Trend Charts */}
       <div className="space-y-6">
          {/* Credits / Token Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
               <h3 className="font-semibold text-slate-900 text-sm">{isExclusive ? 'Token 消耗' : '积分消耗'}</h3>
               <span className="text-xs text-slate-400">{granularityLabel}</span>
             </div>
             <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={trendData} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} interval={Math.max(0, Math.floor(trendData.length / 8))} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(val) => formatNumber(val)} width={45} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} formatter={(val: any) => [`${formatNumber(val)}`, '调用次数']} cursor={{fill: 'rgba(37,99,235,0.05)'}} />
                      <Bar dataKey="token" fill={isExclusive ? '#3b82f6' : '#0d9488'} radius={[3, 3, 0, 0]} maxBarSize={20} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Requests Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
               <h3 className="font-semibold text-slate-900 text-sm">调用次数</h3>
               <span className="text-xs text-slate-400">{granularityLabel}</span>
             </div>
             <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={trendData} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} interval={Math.max(0, Math.floor(trendData.length / 8))} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} width={45} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} formatter={(val: any) => [`${formatNumber(val)}`, '调用次数']} cursor={{fill: 'rgba(34,197,94,0.05)'}} />
                      <Bar dataKey="requests" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={20} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Active Users Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
               <h3 className="font-semibold text-slate-900 text-sm">活跃用户</h3>
               <span className="text-xs text-slate-400">{granularityLabel}</span>
             </div>
             <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={trendData} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} interval={Math.max(0, Math.floor(trendData.length / 8))} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} width={35} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} formatter={(val: any) => [`${val}`, '活跃用户']} cursor={{fill: 'rgba(249,115,22,0.05)'}} />
                      <Bar dataKey="users" fill="#f97316" radius={[3, 3, 0, 0]} maxBarSize={20} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>

       {/* Bottom Charts - Model Consumption only */}
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-6">{isExclusive ? '模型 Token 消耗' : '模型积分消耗'}</h3>
          <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelCostData} layout="vertical" barCategoryGap={15} margin={{ left: 20, right: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                   {isExclusive ? (
                     <XAxis type="number" axisLine={true} tickLine={true} tick={{fill: '#94a3b8', fontSize: 10}} domain={[0, 1000]} ticks={[0, 250, 500, 750, 1000]} tickFormatter={(val) => `${val}K`} />
                   ) : (
                     <XAxis type="number" axisLine={true} tickLine={true} tick={{fill: '#94a3b8', fontSize: 10}} domain={[0, 500]} ticks={[0, 125, 250, 375, 500]} tickFormatter={(val) => `${val}`} />
                   )}
                   <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={80} />
                   <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} formatter={(val: any) => isExclusive ? [`${val}K Tokens`] : [`${val} Credits`]} />
                   <Bar dataKey="value" fill={isExclusive ? '#1d77ff' : '#0d9488'} radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
             </ResponsiveContainer>
          </div>
       </div>
       </>}
    </div>
  );
};

export const ModelManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('management');
  const [searchTerm, setSearchTerm] = useState('');
  const [metricAnomalyEnabled, setMetricAnomalyEnabled] = useState(false);
  const [permissionModel, setPermissionModel] = useState<null | { id: string; name: string; customName: string }>(null);

  // Mock Data from screenshot
  const [models, setModels] = useState([
    {
      id: 'deepseek-v3.2',
      name: 'deepseek-v3.2',
      customName: '',
      type: 'text', // displayed as 文本模型
      context: '128k',
      rpm: 850,
      maxRpm: 1500,
      tpm: 188.0, // K
      maxTpm: 250, // K
      ttft: 245,
      errorRate: 0.8,
      desc: 'DeepSeek-V3.2 的核心是平衡推理能力与输出长度，适合日常对话。',
      enabled: true
    },
    {
      id: 'kimi-k2-ksyun',
      name: 'kimi-k2-ksyun',
      customName: '',
      type: 'text',
      context: '256k',
      rpm: 0,
      maxRpm: 1000,
      tpm: 0.0,
      maxTpm: 150,
      ttft: 312,
      errorRate: 1.2,
      desc: '由 Moonshot AI 发布的国内首个开源万亿参数模型。',
      enabled: true
    },
    {
      id: 'kimi-k2-thinking-turbo',
      name: 'kimi-k2-thinking-turbo',
      customName: '',
      type: 'text',
      context: '256k',
      rpm: 45,
      maxRpm: 1000,
      tpm: 25.8,
      maxTpm: 150,
      ttft: 198,
      errorRate: 0.6,
      desc: '是 kimi-k2-thinking 模型的高速版，适用于需要深度推理能力和快速响应的场景。',
      enabled: true
    },
    {
      id: 'kimi-k2-turbo-preview',
      name: 'kimi-k2-turbo-preview',
      customName: '',
      type: 'text',
      context: '256k',
      rpm: 0,
      maxRpm: 1200,
      tpm: 0.0,
      maxTpm: 200,
      ttft: 156,
      errorRate: 0.5,
      desc: 'Kimi-K2-Turbo-Preview 是基于 Kimi K2 的高速版本，主要面向长文本处理。',
      enabled: true
    },
    {
      id: 'qwen3-coder-480b-a35b-instruct',
      name: 'qwen3-coder-480b-a35b-instruct',
      customName: '',
      type: 'text',
      context: '256k',
      rpm: 120,
      maxRpm: 800,
      tpm: 98.0,
      maxTpm: 120,
      ttft: 287,
      errorRate: 1.1,
      desc: 'Qwen3-Coder-480B-A35B-Instruct 是 Qwen 团队近期超大规模代码模型。',
      enabled: true
    },
    {
      id: 'glm-4v-plus',
      name: 'glm-4v-plus',
      customName: '',
      type: 'vision', // displayed as 视觉理解模型
      context: '128k',
      rpm: 0,
      maxRpm: 500,
      tpm: 0.0,
      maxTpm: 80,
      ttft: 421,
      errorRate: 1.5,
      desc: 'GLM-4V Plus 智谱新一代多模态大模型，视觉能力大幅提升。',
      enabled: true
    },
    {
      id: 'minimax_m2',
      name: 'minimax_m2',
      customName: '',
      type: 'vision',
      context: '128k',
      rpm: 0,
      maxRpm: 600,
      tpm: 0.0,
      maxTpm: 100,
      ttft: 356,
      errorRate: 0.9,
      desc: 'MiniMax M2 拥有强大的多模态处理能力，适合复杂杂务场景。',
      enabled: false
    },
    {
      id: 'yi-vision-v2',
      name: 'yi-vision-v2',
      customName: '',
      type: 'vision',
      context: '128k',
      rpm: 15,
      maxRpm: 500,
      tpm: 5.8,
      maxTpm: 80,
      ttft: 289,
      errorRate: 0.7,
      desc: 'Yi Vision V2 具有卓越的图像理解能力，支持复杂场景识别。',
      enabled: true
    },
  ]);

  // Alert Contacts State
  const [selectedContacts, setSelectedContacts] = useState(['陈楠 (chennan@techflow.io)']);
  const availableContacts = [
      '陈楠 (chennan@techflow.io)', 
      '张明 (zhangming@techflow.io)', 
      '李华 (lihua@techflow.io)',
      '王强 (wangqiang@techflow.io)'
  ];

  // Manual Switch Selection State
  const [manualSource, setManualSource] = useState('');
  const [manualTarget, setManualTarget] = useState('');

  // Incidents/Abnormal Models Mock Data
  const [incidents, setIncidents] = useState([
     {
         id: 1,
         modelId: 'deepseek-v3.2',
         modelName: 'deepseek-v3.2',
         issue: '平均响应耗时 > 3000ms',
         timestamp: '2024-02-06 10:23:00',
         status: 'warning', // warning, executing, paused
         type: 'automated',
         backupModel: '',
         switched: false
     }
  ]);

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [editingCustomNameId, setEditingCustomNameId] = useState<string | null>(null);
  const [editingCustomNameValue, setEditingCustomNameValue] = useState('');

  const toggleModel = (id: string) => {
    setModels(models.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const enableAll = () => {
    setModels(models.map(m => ({ ...m, enabled: true })));
  };

  const startEditCustomName = (id: string, current: string) => {
    setEditingCustomNameId(id);
    setEditingCustomNameValue(current);
  };

  const saveCustomName = (id: string) => {
    setModels(models.map(m => m.id === id ? { ...m, customName: editingCustomNameValue.trim() } : m));
    setEditingCustomNameId(null);
  };

  const cancelEditCustomName = () => {
    setEditingCustomNameId(null);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val && !selectedContacts.includes(val)) {
          setSelectedContacts([...selectedContacts, val]);
      }
      e.target.value = ''; // Reset select
  };

  const removeContact = (contact: string) => {
      setSelectedContacts(selectedContacts.filter(c => c !== contact));
  };

  const handleIncidentBackupChange = (id: number, val: string) => {
      setIncidents(incidents.map(i => i.id === id ? { ...i, backupModel: val } : i));
  };

  const handleSwitch = (id: number) => {
      setIncidents(incidents.map(i => i.id === id ? { ...i, switched: true, status: 'executing' } : i));
  };

  const handlePauseSchedule = (id: number) => {
      setIncidents(incidents.map(i => i.id === id ? { ...i, status: 'paused' } : i));
  };

  const handleResumeSchedule = (id: number) => {
      setIncidents(incidents.map(i => i.id === id ? { ...i, status: 'executing' } : i));
  };

  const handleConfirmDelete = (id: number) => {
      setIncidents(incidents.filter(i => i.id !== id));
      setPendingDeleteId(null);
  };

  const handleExecuteManualSwitch = () => {
      if (!manualSource || !manualTarget) return;
      const newSwitch = {
          id: Date.now(),
          modelId: manualSource,
          modelName: manualSource,
          issue: '人工自定义流量调度',
          timestamp: new Date().toLocaleString(),
          status: 'switched',
          type: 'automated',
          backupModel: manualTarget,
          switched: true
      };
      setIncidents([newSwitch, ...incidents]);
      setManualSource('');
      setManualTarget('');
  };

  const textEnabled = models.filter(m => m.type === 'text' && m.enabled).length;
  const visionEnabled = models.filter(m => m.type === 'vision' && m.enabled).length;
  const totalText = models.filter(m => m.type === 'text').length;
  const totalVision = models.filter(m => m.type === 'vision').length;

  // Filter enabled models for selection
  const activeModels = models.filter(m => m.enabled);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
        
        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-200 mb-6">
           <button 
             onClick={() => setActiveTab('management')}
             className={`pb-3 text-sm font-semibold border-b-2 transition-all px-1 ${activeTab === 'management' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
           >
             模型开通管理
           </button>
           <button 
             onClick={() => setActiveTab('switching')}
             className={`pb-3 text-sm font-semibold border-b-2 transition-all px-1 ${activeTab === 'switching' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
           >
             模型切换
           </button>
        </div>

        {activeTab === 'management' ? (
          <>
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-blue-700">
                <Icons.Info className="w-4 h-4 shrink-0" />
                <span>启用的模型可以在 CLI 工具中通过 <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 font-mono">\model</code> 命令切换</span>
            </div>
            <Icons.Copy className="w-4 h-4 text-blue-400 hover:text-blue-600 cursor-pointer" />
            </div>

            {/* Warning Banner */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 text-sm">
                <div className="text-slate-700">为了保障 KSGC 产品正常运行，系统要求 <span className="text-blue-600 font-medium">文本大模型</span> 和 <span className="text-blue-600 font-medium">视觉理解模型</span> 各至少开启一个。</div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600">文本大模型</span>
                    <span className={`px-2 py-0.5 rounded text-white ${textEnabled > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                        {textEnabled > 0 ? '已启用' : '未启用'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600">视觉理解模型</span>
                    <span className={`px-2 py-0.5 rounded text-white ${visionEnabled > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                        {visionEnabled > 0 ? '已启用' : '未启用'}
                    </span>
                </div>
            </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-t-xl border border-slate-200 border-b-0 flex flex-wrap gap-4 justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                    type="text" 
                    placeholder="搜索模型名称或自定义名称..."
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                        <option>全部类型</option>
                        <option>文本模型</option>
                        <option>视觉理解模型</option>
                    </select>
                    <Icons.ChevronDown className="absolute right-3 top-3 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                        <option>全部状态</option>
                        <option>已启用</option>
                        <option>未启用</option>
                    </select>
                    <Icons.ChevronDown className="absolute right-3 top-3 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button onClick={enableAll} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    全部开启
                </button>
                <div className="text-xs text-slate-400">
                    文本模型启用 {textEnabled}/{totalText}, 视觉理解模型启用 {visionEnabled}/{totalVision}
                </div>
            </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 overflow-hidden shadow-sm -mt-6">
            <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-medium text-slate-500 w-[16%]">模型名称</th>
                        <th className="px-6 py-4 text-xs font-medium text-slate-500 w-[16%]">自定义名称</th>
                        <th className="px-6 py-4 text-xs font-medium text-slate-500 w-[8%]">上下文限制</th>
                        <th className="px-6 py-4 text-xs font-medium text-slate-500 w-[13%]">每分钟请求数</th>
                        <th className="px-6 py-4 text-xs font-medium text-slate-500 w-[13%]">每分钟token数</th>
                        <th className="px-6 py-4 text-xs font-medium text-slate-500 w-[24%]">模型详情</th>
                        <th className="px-6 py-4 text-xs font-medium text-slate-500 w-[10%] text-right">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {models.filter(m => {
                        const q = searchTerm.toLowerCase();
                        return m.name.toLowerCase().includes(q) || m.customName.toLowerCase().includes(q);
                    }).map((model) => (
                        <tr key={model.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 align-top">
                            <div className="font-medium text-slate-900 text-sm mb-1.5">{model.name}</div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${
                                model.type === 'text'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                                {model.type === 'text' ? '文本模型' : '视觉理解模型'}
                            </span>
                        </td>
                        <td className="px-6 py-4 align-top pt-3">
                            {editingCustomNameId === model.id ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editingCustomNameValue}
                                        onChange={(e) => setEditingCustomNameValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveCustomName(model.id);
                                            if (e.key === 'Escape') cancelEditCustomName();
                                        }}
                                        placeholder={model.name}
                                        className="w-full px-2 py-1 text-sm border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <button onClick={() => saveCustomName(model.id)} className="shrink-0 text-blue-600 hover:text-blue-700 text-xs font-medium px-1.5 py-1 rounded hover:bg-blue-50">确认</button>
                                    <button onClick={cancelEditCustomName} className="shrink-0 text-slate-400 hover:text-slate-600 text-xs px-1 py-1 rounded hover:bg-slate-50">取消</button>
                                </div>
                            ) : (
                                <div
                                    className="group flex items-center gap-1.5 cursor-pointer"
                                    onClick={() => startEditCustomName(model.id, model.customName)}
                                >
                                    <span className={`text-sm font-medium ${model.customName ? 'text-slate-800' : 'text-slate-500'}`}>
                                        {model.customName || model.name}
                                    </span>
                                    <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                                    </svg>
                                </div>
                            )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 align-top pt-5">
                            {model.context}
                        </td>
                        <td className="px-6 py-4 align-top pt-5">
                            <span className="text-sm text-slate-700 font-mono">{model.maxRpm}</span>
                        </td>
                        <td className="px-6 py-4 align-top pt-5">
                            <span className="text-sm text-slate-700 font-mono">{formatNumber(model.maxTpm)}K</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 leading-relaxed align-top pt-5">
                            {model.desc}
                        </td>
                        <td className="px-6 py-4 text-right align-top pt-5">
                            <div className="flex items-center gap-3 justify-end">
                                <button
                                    onClick={() => setPermissionModel({ id: model.id, name: model.name, customName: model.customName })}
                                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    查看权限
                                </button>
                                <div
                                    onClick={() => toggleModel(model.id)}
                                    className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer inline-block ${model.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${model.enabled ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </div>
                        </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
          </>
        ) : (
          <div className="space-y-6">

            {/* Information Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Icons.Alert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                    <p className="text-slate-600 leading-relaxed">
                        系统实时监控模型健康状态。当检测到模型异常时（如高延迟、错误率飙升），请手动切换至备用模型以保障业务连续性。
                    </p>
                    <p className="text-slate-800">
                        <span className="font-bold text-red-600 mr-1">注意：</span>
                        通过模型切换的请求token消耗量将按实际使用的备用模型消耗量进行计算和计费。备用模型使用权限不受用户模型使用权限限制。
                    </p>
                </div>
            </div>

            {/* Region 1: Alert Notification Contacts Configuration */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-2">告警联系人</h3>

                <p className="text-xs text-slate-500 mb-3">当模型出现指标异常或恢复正常时，将发送消息通知给联系人。如需创建联系人，请到 <span className="underline cursor-pointer hover:text-blue-600">控制台-消息接收管理-联系人管理</span> 中进行配置</p>

                <div className="flex items-center gap-2 mb-3">
                    <div className="relative w-48 flex-shrink-0">
                        <select
                            className="appearance-none w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                            onChange={handleContactChange}
                            defaultValue=""
                        >
                            <option value="" disabled>选择联系人...</option>
                            {availableContacts.filter(c => !selectedContacts.includes(c)).map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <Icons.ChevronDown className="absolute right-2 top-2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors flex-shrink-0" title="刷新列表">
                        <Icons.Refresh className="w-4 h-4" />
                    </button>
                    <div className="flex flex-wrap gap-2 items-center flex-1">
                        {selectedContacts.length > 0 ? (
                            <>
                                {selectedContacts.map(contact => (
                                    <div key={contact} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 border border-blue-300 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors group">
                                        <span>{contact}</span>
                                        <Icons.Close className="w-3 h-3 cursor-pointer opacity-60 group-hover:opacity-100" onClick={() => removeContact(contact)} />
                                    </div>
                                ))}
                            </>
                        ) : (
                            <span className="text-xs text-slate-400">未配置联系人</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Region 2: Metric Anomaly Model Dispatch Configuration */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-bold text-slate-900 text-sm">指标异常模型调度</h3>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMetricAnomalyEnabled(!metricAnomalyEnabled)}>
                        <div className={`w-10 h-6 rounded-full transition-colors ${metricAnomalyEnabled ? 'bg-blue-600' : 'bg-slate-300'} flex items-center p-0.5`}>
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${metricAnomalyEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-xs text-slate-600">启用</span>
                    </div>
                </div>
                <div className="space-y-6">
                    {/* Metric Thresholds Configuration */}
                    <div className="pb-4 border-b border-slate-200">
                        <label className="text-xs text-slate-600 font-medium mb-3 block">异常指标配置<span className="text-slate-400 font-normal ml-2">（1分钟内模型平均指标满足设置阈值，将会出现在指标异常清单中）</span></label>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-600">TTFT大于</span>
                                <input type="number" defaultValue="3000" disabled={!metricAnomalyEnabled} className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed" />
                                <span className="text-xs text-slate-600">(ms)</span>
                            </div>
                            <span className="text-xs text-slate-600">或</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-600">错误率大于</span>
                                <input type="number" defaultValue="5" disabled={!metricAnomalyEnabled} className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed" />
                                <span className="text-xs text-slate-600">(%)</span>
                            </div>
                            <button disabled={!metricAnomalyEnabled} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap disabled:bg-slate-300 disabled:cursor-not-allowed">
                                应用
                            </button>
                        </div>
                    </div>

                    {/* Anomaly Models List */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <label className="text-xs text-slate-600 font-medium">满足异常指标的模型清单</label>
                            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900" title="刷新">
                                <Icons.Refresh className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {incidents.filter(i => !i.switched && i.type !== 'manual').length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <p className="text-sm">暂无异常指标</p>
                                </div>
                            ) : (
                                incidents.filter(i => !i.switched && i.type !== 'manual').map(incident => (
                                    <div key={incident.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                                        <div className="flex items-center justify-between gap-4">
                                            {/* Model Info */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div>
                                                    <p className="font-semibold text-sm text-slate-900">{incident.modelName}</p>
                                                </div>
                                                <div className="flex items-center gap-2 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs border border-red-200">
                                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                                        {incident.issue}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Backup Model Selection */}
                                            <div className="flex items-end gap-2">
                                                <div className="relative">
                                                    <select
                                                        className="w-48 appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                        value={incident.backupModel || ''}
                                                        onChange={(e) => {
                                                            setIncidents(incidents.map(i =>
                                                                i.id === incident.id ? {...i, backupModel: e.target.value} : i
                                                            ));
                                                        }}
                                                    >
                                                        <option value="">请选择备用模型...</option>
                                                        {activeModels.filter(m => m.name !== incident.modelName).map(m => (
                                                            <option key={m.id} value={m.name}>{m.name} (TTFT: {m.ttft}ms, 错误率: {m.errorRate}%)</option>
                                                        ))}
                                                    </select>
                                                    <Icons.ChevronDown className="absolute right-3 top-3 w-3 h-3 text-slate-400 pointer-events-none" />
                                                </div>
                                                <button
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                                                        incident.backupModel
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    }`}
                                                    disabled={!incident.backupModel}
                                                    onClick={() => handleSwitch(incident.id)}
                                                >
                                                    启用调度
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Region 3: Manual Traffic Dispatch Configuration */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-4">手动模型备用配置</h3>
                <div className="flex items-end gap-3">
                    <div className="relative">
                        <select
                            className="w-48 appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={manualSource}
                            onChange={(e) => setManualSource(e.target.value)}
                        >
                            <option value="" disabled>请选择主模型...</option>
                            {activeModels.map(m => (
                                <option key={m.id} value={m.name}>{m.name} (TTFT: {m.ttft}ms, 错误率: {m.errorRate}%)</option>
                            ))}
                        </select>
                        <Icons.ChevronDown className="absolute right-3 top-3 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            className="w-48 appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={manualTarget}
                            onChange={(e) => setManualTarget(e.target.value)}
                            disabled={!manualSource}
                        >
                            <option value="" disabled>请选择备用模型...</option>
                            {activeModels.filter(m => m.name !== manualSource).map(m => (
                                <option key={m.id} value={m.name}>{m.name} (TTFT: {m.ttft}ms, 错误率: {m.errorRate}%)</option>
                            ))}
                        </select>
                        <Icons.ChevronDown className="absolute right-3 top-3 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                        onClick={handleExecuteManualSwitch}
                        disabled={!manualSource || !manualTarget}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2 whitespace-nowrap ${
                            manualSource && manualTarget
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        启用调度
                    </button>
                </div>
            </div>

            {/* Region 4: Configured Scheduling Rules (Only Active Rules) */}
            <div>
                {(() => {
                    const activeRules = incidents.filter(i => i.switched && i.type === 'automated');
                    return (
                        <>
                            <h3 className="font-bold text-slate-900 mb-4">已配置的调度规则 ({activeRules.length})</h3>

                            {activeRules.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                                    <p className="text-slate-900 font-medium text-sm mb-1">暂无调度规则</p>
                                    <p className="text-slate-500 text-sm">还未创建任何调度规则，请在上方创建新规则。</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-5 py-3 text-xs font-medium text-slate-500 w-[20%]">模型</th>
                                                <th className="px-5 py-3 text-xs font-medium text-slate-500 w-[25%]">异常指标</th>
                                                <th className="px-5 py-3 text-xs font-medium text-slate-500 w-[20%]">备用模型</th>
                                                <th className="px-5 py-3 text-xs font-medium text-slate-500 w-[12%]">状态</th>
                                                <th className="px-5 py-3 text-xs font-medium text-slate-500 w-[23%] text-right">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {activeRules.map(incident => (
                                                <tr key={incident.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <p className="font-medium text-slate-900">{incident.modelName}</p>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">{incident.issue}</td>
                                                    <td className="px-5 py-4 text-slate-600">{incident.backupModel}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-block px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap ${
                                                            incident.status === 'executing'
                                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                        }`}>
                                                            {incident.status === 'executing' ? '执行中' : '暂停'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2 justify-end">
                                                            {incident.status === 'paused' ? (
                                                                <button
                                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                                                                    onClick={() => handleResumeSchedule(incident.id)}
                                                                >
                                                                    恢复调度
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                                                                    onClick={() => handlePauseSchedule(incident.id)}
                                                                >
                                                                    暂停调度
                                                                </button>
                                                            )}
                                                            <button
                                                                className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded text-xs font-medium hover:bg-red-50 transition-colors whitespace-nowrap"
                                                                onClick={() => setPendingDeleteId(incident.id)}
                                                            >
                                                                删除
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Delete Confirmation Modal */}
                                    {pendingDeleteId !== null && createPortal(
                                        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999] rounded-lg">
                                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-sm mx-4">
                                                <h3 className="font-bold text-slate-900 mb-2">确认删除规则</h3>
                                                <p className="text-slate-600 text-sm mb-6">
                                                    确认删除此调度规则吗？删除后无法恢复。
                                                </p>
                                                <div className="flex gap-3 justify-end">
                                                    <button
                                                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                                                        onClick={() => setPendingDeleteId(null)}
                                                    >
                                                        取消
                                                    </button>
                                                    <button
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                                        onClick={() => handleConfirmDelete(pendingDeleteId)}
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            </div>
                                        </div>,
                                        document.body
                                    )}
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>

          </div>
        )}

        {permissionModel && createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setPermissionModel(null)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
              <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">模型权限详情</h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    <span className="font-mono">{permissionModel.name}</span>
                    {permissionModel.customName && <span className="ml-2 text-slate-400">（{permissionModel.customName}）</span>}
                  </p>
                </div>
                <button onClick={() => setPermissionModel(null)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors">
                  <Icons.Close className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-sm">授权组织 / 部门</h4>
                    <span className="text-xs text-slate-400">共 3 个</span>
                  </div>
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                    {[
                      { name: '技术中心', path: '根组织 / 技术中心', members: 45 },
                      { name: '前端开发组', path: '技术中心 / 前端开发组', members: 12 },
                      { name: '产品设计部', path: '根组织 / 产品设计部', members: 20 },
                    ].map((org, i) => (
                      <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-medium">组</span>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{org.name}</div>
                            <div className="text-xs text-slate-400">{org.path}</div>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">{org.members} 人</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-sm">授权成员</h4>
                    <span className="text-xs text-slate-400">共 4 人</span>
                  </div>
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                    {[
                      { name: '张明', email: 'zhangming@company.com', dept: '前端开发组' },
                      { name: '李华', email: 'lihua@company.com', dept: '产品经理组' },
                      { name: '王芳', email: 'wangfang@external.com', dept: '外部成员' },
                      { name: '陈强', email: 'chenqiang@company.com', dept: '研发部' },
                    ].map((m, i) => (
                      <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">{m.name[0]}</span>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{m.name}</div>
                            <div className="text-xs text-blue-500">{m.email}</div>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">{m.dept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setPermissionModel(null)}
                  className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export { default as MembersManagement } from './MembersView';

export { default as QuotaManagement } from './QuotaView';

export { default as SecuritySettings } from './IpWhitelistView';

export const SystemSettings: React.FC = () => {
  const [dingTalkAppKey, setDingTalkAppKey] = useState('');
  const [dingTalkAppSecret, setDingTalkAppSecret] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // 身份认证源
  const [authSource, setAuthSource] = useState('internal');
  const [ldapServer, setLdapServer] = useState('');
  const [ldapBaseDn, setLdapBaseDn] = useState('');
  const [ldapBindUser, setLdapBindUser] = useState('');
  const [ldapBindPassword, setLdapBindPassword] = useState('');

  // 自定义系统安装包
  const [uploadedPackage, setUploadedPackage] = useState<{ name: string; size: number; uploadTime: string } | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSaveAuthSource = async () => {
    setSaveStatus('saving');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handlePackageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUploadedPackage({
        name: file.name,
        size: Math.round(file.size / 1024 / 1024 * 100) / 100,
        uploadTime: new Date().toLocaleString('zh-CN'),
      });
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (error) {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 企业集成配置 */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-6">企业集成配置</h3>

        {/* 钉钉配置 */}
        <div className="mb-8 pb-8 border-b border-slate-200 last:border-b-0 last:mb-0 last:pb-0">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">钉</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900">钉钉集成</h4>
          </div>

          <div className="space-y-4">
            {/* AppKey */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                AppKey
              </label>
              <input
                type="text"
                value={dingTalkAppKey}
                onChange={(e) => setDingTalkAppKey(e.target.value)}
                placeholder="请输入钉钉应用的 AppKey"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-2">
                从钉钉开发者后台应用详情页面获取
              </p>
            </div>

            {/* AppSecret */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                AppSecret
              </label>
              <input
                type="password"
                value={dingTalkAppSecret}
                onChange={(e) => setDingTalkAppSecret(e.target.value)}
                placeholder="请输入钉钉应用的 AppSecret"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-2">
                AppSecret 是应用的安全密钥，请妥善保管
              </p>
            </div>

            {/* 保存按钮 */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  saveStatus === 'saving'
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : saveStatus === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {saveStatus === 'saving' && '保存中...'}
                {saveStatus === 'success' && '✓ 保存成功'}
                {saveStatus === 'error' && '保存失败'}
                {saveStatus === 'idle' && '保存配置'}
              </button>
              <button
                onClick={() => {
                  setDingTalkAppKey('');
                  setDingTalkAppSecret('');
                }}
                className="px-6 py-2 rounded-lg text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                重置
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 身份认证源配置 */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-6">身份认证源</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              认证方式
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors" style={{ borderColor: authSource === 'internal' ? '#3b82f6' : undefined, backgroundColor: authSource === 'internal' ? '#eff6ff' : undefined }}>
                <input
                  type="radio"
                  name="authSource"
                  value="internal"
                  checked={authSource === 'internal'}
                  onChange={(e) => setAuthSource(e.target.value)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <div>
                  <div className="font-medium text-slate-900">内部认证</div>
                  <div className="text-xs text-slate-500">使用系统内置的用户认证机制</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors" style={{ borderColor: authSource === 'ldap' ? '#3b82f6' : undefined, backgroundColor: authSource === 'ldap' ? '#eff6ff' : undefined }}>
                <input
                  type="radio"
                  name="authSource"
                  value="ldap"
                  checked={authSource === 'ldap'}
                  onChange={(e) => setAuthSource(e.target.value)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <div>
                  <div className="font-medium text-slate-900">LDAP</div>
                  <div className="text-xs text-slate-500">连接到企业 LDAP 目录服务</div>
                </div>
              </label>
            </div>
          </div>

          {authSource === 'ldap' && (
            <div className="space-y-4 mt-6 pt-6 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  LDAP 服务器地址
                </label>
                <input
                  type="text"
                  value={ldapServer}
                  onChange={(e) => setLdapServer(e.target.value)}
                  placeholder="例如：ldap://ldap.example.com:389"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Base DN
                </label>
                <input
                  type="text"
                  value={ldapBaseDn}
                  onChange={(e) => setLdapBaseDn(e.target.value)}
                  placeholder="例如：dc=example,dc=com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  绑定用户
                </label>
                <input
                  type="text"
                  value={ldapBindUser}
                  onChange={(e) => setLdapBindUser(e.target.value)}
                  placeholder="例如：cn=admin,dc=example,dc=com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  绑定密码
                </label>
                <input
                  type="password"
                  value={ldapBindPassword}
                  onChange={(e) => setLdapBindPassword(e.target.value)}
                  placeholder="请输入绑定密码"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveAuthSource}
              disabled={saveStatus === 'saving'}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                saveStatus === 'saving'
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : saveStatus === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {saveStatus === 'saving' && '保存中...'}
              {saveStatus === 'success' && '✓ 保存成功'}
              {saveStatus === 'error' && '保存失败'}
              {saveStatus === 'idle' && '保存配置'}
            </button>
          </div>
        </div>
      </div>

      {/* 自定义系统安装包 */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-6">自定义系统安装包</h3>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            上传自定义的系统安装包文件。支持的格式：.tar.gz、.zip、.tar.bz2
          </p>

          <div>
            <label className="flex items-center justify-center px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
              <input
                type="file"
                accept=".tar.gz,.tar.bz2,.zip"
                onChange={handlePackageUpload}
                disabled={uploadStatus === 'uploading'}
                className="hidden"
              />
              <div className="text-center">
                <Icons.Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-sm text-slate-600 font-medium">点击选择文件或拖拽上传</div>
                <div className="text-xs text-slate-400 mt-1">支持 .tar.gz、.zip、.tar.bz2 格式</div>
              </div>
            </label>
          </div>

          {uploadedPackage && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Icons.Package className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{uploadedPackage.name}</div>
                    <div className="text-xs text-slate-500 mt-1">大小: {uploadedPackage.size} MB</div>
                    <div className="text-xs text-slate-500">上传时间: {uploadedPackage.uploadTime}</div>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedPackage(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <Icons.Close className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {uploadStatus === 'uploading' && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              上传中...
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              ✓ 上传成功，安装包已保存
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              上传失败，请重试
            </div>
          )}

          {uploadedPackage && (
            <div className="flex gap-3 pt-4">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                部署安装包
              </button>
              <button
                onClick={() => {
                  setUploadedPackage(null);
                  setUploadStatus('idle');
                }}
                className="px-6 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                清除文件
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Model Metrics ---
export const ModelMetrics: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('GPT-4 Turbo');
  const [timeRange, setTimeRange] = useState('24h');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const tpmData = Array.from({ length: 24 }, (_, i) => ({
    time: `2/2 ${String(i).padStart(2, '0')}:00`,
    tpm: Math.floor(Math.random() * 8000) + 4000,
  }));

  const ttftData = Array.from({ length: 24 }, (_, i) => ({
    time: `2/2 ${String(i).padStart(2, '0')}:00`,
    ttft: Math.random() * 0.3 + 0.2,
  }));

  const tpotData = Array.from({ length: 24 }, (_, i) => ({
    time: `2/2 ${String(i).padStart(2, '0')}:00`,
    tpot: Math.random() * 0.08 + 0.02,
  }));

  const modelData = [
    { model: 'GPT-4 Turbo', rpm: 99.2, availabilityRate: '99.2', rpm2: 42, tpm: '84.5K', workTpm: '186.4K', stdTpm: '130.2K', ttft: '350 ms', p98Ttft: '720 ms', tps: '28.2', errRate: 41, tokenIn: '10,800K (3,000K/2,000K)' },
    { model: 'DeepSeek V3', rpm: 99.5, availabilityRate: '99.55', rpm2: 35, tpm: '111.4K', workTpm: '182.1K', stdTpm: '232.3K', ttft: '510 ms', p98Ttft: '720 ms', tps: '28.7', errRate: 22, tokenIn: '10,400K (3,300K/2,000K)' },
    { model: 'Kimi K2', rpm: 98.6, availabilityRate: '98.65', rpm2: 30, tpm: '125.1K', workTpm: '145.2K', stdTpm: '192.3K', ttft: '408 ms', p98Ttft: '1168 ms', tps: '32.7', errRate: 48, tokenIn: '9,900K (3,100K/8,000K)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Control Bar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm px-6 py-4">
        <div className="flex gap-2 flex-wrap items-center justify-between">
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => { setTimeRange('15m'); setShowDatePicker(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                timeRange === '15m'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              最近15分钟
            </button>
            <button
              onClick={() => { setTimeRange('1h'); setShowDatePicker(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                timeRange === '1h'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              最近1小时
            </button>
            <button
              onClick={() => { setTimeRange('6h'); setShowDatePicker(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                timeRange === '6h'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              最近6小时
            </button>
            <button
              onClick={() => { setTimeRange('12h'); setShowDatePicker(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                timeRange === '12h'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              最近12小时
            </button>
            <button
              onClick={() => { setTimeRange('24h'); setShowDatePicker(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                timeRange === '24h'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              最近24小时
            </button>
            <button
              onClick={() => { setTimeRange('7d'); setShowDatePicker(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                timeRange === '7d'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              最近7天
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  timeRange === 'custom'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                自定义
              </button>
              {showDatePicker && (
                <div className="absolute top-10 left-0 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-10 w-48">
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1">开始日期</label>
                      <input type="date" className="w-full px-2 py-1 border border-slate-300 rounded text-slate-600" />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">结束日期</label>
                      <input type="date" className="w-full px-2 py-1 border border-slate-300 rounded text-slate-600" />
                    </div>
                    <button
                      onClick={() => {
                        setTimeRange('custom');
                        setShowDatePicker(false);
                      }}
                      className="w-full bg-primary text-white py-1.5 rounded font-medium text-xs"
                    >
                      确认
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-xs rounded text-slate-600 hover:border-slate-300"
          >
            <option>GPT-4 Turbo</option>
            <option>DeepSeek V3</option>
            <option>Kimi K2</option>
          </select>
        </div>
      </div>

      {/* Model Performance Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h4 className="font-semibold text-slate-900 text-sm">模型性能指标</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">模型名称</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">RPM</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">TPM</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">TTFT</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">可用性</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">错误数</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">总 Token (入/出)</th>
              </tr>
            </thead>
            <tbody>
              {modelData
                .filter((row) => row.model === selectedModel)
                .map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.model}</td>
                    <td className="px-4 py-3 text-slate-600">{row.rpm}</td>
                    <td className="px-4 py-3 text-slate-600">{row.tpm}</td>
                    <td className="px-4 py-3 text-slate-600">{row.ttft}</td>
                    <td className="px-4 py-3 text-slate-600">{row.availabilityRate}%</td>
                    <td className="px-4 py-3 text-slate-600">{row.errRate}</td>
                    <td className="px-4 py-3 text-slate-600">{row.tokenIn}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* TPM Chart */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="mb-4">
            <h4 className="font-semibold text-slate-900 text-sm">TPM (每分钟Token数) 趋势</h4>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tpmData} margin={{ top: 5, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} width={40} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
              <Line type="monotone" dataKey="tpm" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* TTFT Chart */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="mb-4">
            <h4 className="font-semibold text-slate-900 text-sm">TTFT (首字符时间) 趋势</h4>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ttftData} margin={{ top: 5, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} width={40} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
              <Line type="monotone" dataKey="ttft" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* TPOT Chart */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="mb-4">
            <h4 className="font-semibold text-slate-900 text-sm">TPOT (每个Token的时间) 趋势</h4>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tpotData} margin={{ top: 5, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} width={40} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
              <Line type="monotone" dataKey="tpot" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


export const SubscriptionManagement: React.FC<{ showAddonTab?: boolean }> = ({ showAddonTab = false }) => {
  const { planMode } = usePlanMode();
  const serviceType: 'shared' | 'exclusive' = planMode === 'exclusive' ? 'exclusive' : 'shared';
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [addSeatsValue, setAddSeatsValue] = useState(10);
  const [upgradeSeatsValue, setUpgradeSeatsValue] = useState(100);
  const [activeTab, setActiveTab] = useState<'upgrade' | 'seats' | 'addon'>(showAddonTab ? 'addon' : 'upgrade');
  const [autoOurchaseEnabled, setAutoPurchaseEnabled] = useState(false);
  const [thresholdCredits, setThresholdCredits] = useState(1000);
  const [savedThresholdCredits, setSavedThresholdCredits] = useState<number | null>(null);
  const [addonQuantity, setAddonQuantity] = useState(1);
  const [showAutoConfigModal, setShowAutoConfigModal] = useState(false);
  const [autoConfigStatus, setAutoConfigStatus] = useState<'need-purchase' | 'success' | null>(null);
  const [isSavingAutoConfig, setIsSavingAutoConfig] = useState(false);
  const currentAddonRemaining = 800;

  const ADDON_UNIT_PRICE = 1000;
  const ADDON_UNIT_CREDITS = 10000;

  const [addonStatusFilter, setAddonStatusFilter] = useState<'all' | '已生效' | '已用完'>('all');
  const [selectedSharedPlanId, setSelectedSharedPlanId] = useState<string | null>(null);
  const [selectedExclusivePlanId, setSelectedExclusivePlanId] = useState<string | null>(null);
  const [creditDetailType, setCreditDetailType] = useState<'plan' | 'addon' | null>(null);

  const addonPurchaseHistory = [
    { id: 'ADO20260418001', date: '2026-04-18 14:32:05', quantity: 2, credits: 10000, consumed: 1550, remaining: 8450, operator: '张明', status: '已生效' },
    { id: 'ADO20260402002', date: '2026-04-02 09:15:48', quantity: 1, credits: 10000, consumed: 10000, remaining: 0, operator: '自动购买', status: '已用完' },
    { id: 'ADO20260315003', date: '2026-03-15 16:48:22', quantity: 1, credits: 10000, consumed: 10000, remaining: 0, operator: '李华', status: '已用完' },
    { id: 'ADO20260228004', date: '2026-02-28 10:05:17', quantity: 1, credits: 10000, consumed: 10000, remaining: 0, operator: '张明', status: '已用完' },
    { id: 'ADO20260210005', date: '2026-02-10 11:22:40', quantity: 1, credits: 10000, consumed: 10000, remaining: 0, operator: '自动购买', status: '已用完' },
  ];


  const filteredAddonHistory = addonStatusFilter === 'all'
    ? addonPurchaseHistory
    : addonPurchaseHistory.filter(r => r.status === addonStatusFilter);

  const handleSaveAutoConfig = async () => {
    setIsSavingAutoConfig(true);

    // 检查是否需要自动购买
    if (currentAddonRemaining < thresholdCredits) {
      setAutoConfigStatus('need-purchase');
      setIsSavingAutoConfig(false);
    } else {
      setAutoConfigStatus('success');
      setSavedThresholdCredits(thresholdCredits);
      setTimeout(() => {
        setShowAutoConfigModal(false);
        setAutoConfigStatus(null);
        setIsSavingAutoConfig(false);
      }, 2000);
    }
  };

  const handleConfirmAutoConfig = async () => {
    // 同意自动购买
    setIsSavingAutoConfig(true);
    // 模拟保存配置和购买增量包
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSavedThresholdCredits(thresholdCredits);
    setAutoConfigStatus('success');
    setTimeout(() => {
      setShowAutoConfigModal(false);
      setAutoConfigStatus(null);
      setIsSavingAutoConfig(false);
    }, 2000);
  };

  const handleCancelAutoConfig = () => {
    // 取消不保存配置
    setShowAutoConfigModal(false);
    setAutoConfigStatus(null);
    setIsSavingAutoConfig(false);
  };

  const isConfigChanged = savedThresholdCredits === null || savedThresholdCredits !== thresholdCredits;

  const sharedSubscription = {
    type: 'shared',
    planName: 'Lite 套餐',
    seats: 50,
    usedSeats: 5,
    monthlyPrice: 7800,
    pricePerSeat: 156,
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: 'active'
  };

  const exclusiveSubscription = {
    type: 'exclusive',
    planName: '专业版',
    seats: 50,
    usedSeats: 5,
    monthlyPrice: 9800,
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: 'active'
  };

  const currentSub = serviceType === 'shared' ? sharedSubscription : exclusiveSubscription;

  const sharedPlans = [
    {
      id: 'lite',
      name: 'Lite 套餐',
      price: 78,
      priceUnit: '/人/月',
      minSeats: 5,
      credits: 2000,
      features: ['2000Credits/席/月（按月刷新不累积）', '1000 Credits席位保底消耗，剩余Credits可团队内共享使用', '更高的模型请求频率'],
      current: true,
      disabled: true
    },
    {
      id: 'pro',
      name: 'Pro 套餐',
      price: 156,
      priceUnit: '/人/月',
      minSeats: 5,
      credits: 4000,
      features: ['4000Credits/席/月（按月刷新不累积）', '2000 Credits席位保底消耗，剩余Credits可团队内共享使用', '更高的模型请求频率']
    }
  ];

  const exclusivePlans = [
    {
      id: 'basic',
      name: '基础版',
      price: 3000,
      priceUnit: '/月',
      minSeats: 20,
      features: ['基础模型支持', '20 人席位', '数据物理隔离'],
      disabled: true
    },
    {
      id: 'pro',
      name: '专业版',
      price: 5000,
      priceUnit: '/月',
      minSeats: 50,
      features: ['完整模型支持', '50 人席位', '数据物理隔离', '优先技术支持'],
      current: true
    }
  ];

  const exclusiveSeatsOptions = [20, 50, 100, 200, 500, 1000];

  const calcExclusivePrice = (basePrice: number, seats: number) => {
    return basePrice + (seats - 50) * 100;
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* 当前订阅 通栏卡片 */}
      {serviceType === 'shared' && (
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-200">
            <div>
              <p className="text-xs text-slate-500 mb-1">当前订阅</p>
              <h2 className="text-2xl font-bold text-slate-900">{currentSub.planName}</h2>
            </div>

            <div className="flex items-start gap-8 flex-shrink-0">
              <div>
                <p className="text-xs text-slate-500 mb-2">席位信息</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-slate-900">{formatNumber(currentSub.usedSeats)}</span>
                  <span className="text-sm text-slate-600">/ {formatNumber(currentSub.seats)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowTerminateModal(true)}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                终止订阅
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setCreditDetailType('plan')}
              className="group text-left bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-5 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-600 mb-1">套餐内剩余积分</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-600">{formatCredits(6270)}</span>
                    <span className="text-xs text-slate-500">/ {formatCredits(60000)} 分</span>
                  </div>
                  <div className="text-xs text-slate-500 whitespace-nowrap mt-1">05-18 重置</div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                  查看明细
                  <Icons.ChevronRight className="w-3 h-3" strokeWidth={2.5} />
                </span>
              </div>
              <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '10.4%' }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">已用 53,730 分</p>
            </button>

            <button
              type="button"
              onClick={() => setCreditDetailType('addon')}
              className="group text-left bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-lg p-5 hover:border-teal-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-600 mb-1">增量包剩余积分</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-teal-600">{formatCredits(8500)}</span>
                    <span className="text-xs text-slate-500">分</span>
                  </div>
                  <div className="text-xs text-slate-500 whitespace-nowrap mt-1">不过期</div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 bg-teal-100 px-2 py-1 rounded-md group-hover:bg-teal-600 group-hover:text-white transition-colors flex-shrink-0">
                  查看明细
                  <Icons.ChevronRight className="w-3 h-3" strokeWidth={2.5} />
                </span>
              </div>
              <div className="w-full h-1.5 bg-teal-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '42.5%' }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">共购 3 个包 · 已消耗 11,500 分</p>
            </button>
          </div>
        </div>
      )}

      {/* 版本升级/席位扩容/增量包 + 预览 左右布局 */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          {serviceType === 'shared' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-slate-200">
                <div className="flex gap-8 border-b border-slate-200 px-8">
                  <button
                    onClick={() => setActiveTab('upgrade')}
                    className={`py-4 px-0 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'upgrade'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    版本升级
                  </button>
                  <button
                    onClick={() => setActiveTab('seats')}
                    className={`py-4 px-0 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'seats'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    席位扩容
                  </button>
                  <button
                    onClick={() => setActiveTab('addon')}
                    className={`py-4 px-0 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'addon'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    增量包
                  </button>
                </div>

                <div className="p-8">
                  {activeTab === 'upgrade' ? (
                    <div>
                      <div className="grid grid-cols-2 gap-6 mb-8">
                        {sharedPlans.map(plan => {
                          const isSelected = selectedSharedPlanId === plan.id;
                          const selectable = !plan.current && !plan.disabled;
                          return (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() => selectable && setSelectedSharedPlanId(plan.id)}
                              disabled={!selectable}
                              className={`text-left rounded-lg border-2 p-6 transition-all ${
                                plan.current
                                  ? 'border-blue-600 bg-blue-50 cursor-default'
                                  : isSelected
                                  ? 'border-blue-600 ring-2 ring-blue-100 bg-white'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              } ${plan.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {plan.current ? (
                                <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded mb-3">
                                  当前版本
                                </span>
                              ) : isSelected ? (
                                <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded mb-3">
                                  已选择
                                </span>
                              ) : null}
                              <h4 className="text-base font-bold text-slate-900 mb-3">{plan.name}</h4>
                              <p className="text-2xl font-bold text-slate-900 mb-1">
                                ¥{plan.price}
                                <span className="text-sm font-normal text-slate-600 ml-1">{plan.priceUnit}</span>
                              </p>
                              <p className="text-xs text-slate-500 mb-4">{plan.minSeats} 个席位起购</p>
                              <ul className="space-y-2">
                                {plan.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                                    <span className="text-blue-600 mt-0.5">✓</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : activeTab === 'seats' ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-4">
                          当前价格：¥{sharedSubscription.pricePerSeat}/人/月
                        </label>
                        <p className="text-xs text-slate-500">已购买 {formatNumber(currentSub.seats)} 个席位，已使用 {formatNumber(currentSub.usedSeats)} 个</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">新增订阅席位</label>
                        <input
                          type="number"
                          value={addSeatsValue}
                          onChange={(e) => setAddSeatsValue(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                          min="1"
                        />
                      </div>
                    </div>
                  ) : activeTab === 'addon' ? (
                    <div className="space-y-6">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
                        增量包为一次性积分补充，购买后立即生效，用完为止，不随月度周期刷新。
                      </div>

                      <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="mb-5">
                          <h4 className="text-sm font-bold text-slate-900 mb-1">积分增量包</h4>
                          <p className="text-xs text-slate-500">每包 {formatNumber(ADDON_UNIT_CREDITS)} 积分，购买后立即到账，用完为止</p>
                        </div>

                        <label className="block text-sm font-medium text-slate-700 mb-3">购买数量</label>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() => setAddonQuantity(Math.max(1, addonQuantity - 1))}
                              className="px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={addonQuantity}
                              onChange={(e) => setAddonQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-16 text-center text-sm font-medium text-slate-900 border-x border-slate-300 py-2 focus:outline-none"
                              min="1"
                            />
                            <button
                              onClick={() => setAddonQuantity(addonQuantity + 1)}
                              className="px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs text-slate-500">包</span>
                          <div className="flex gap-2">
                            {[1, 5, 10, 20].map(q => (
                              <button
                                key={q}
                                onClick={() => setAddonQuantity(q)}
                                className={`px-3 py-1 text-xs rounded border transition-colors ${
                                  addonQuantity === q
                                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                                    : 'border-slate-300 text-slate-600 hover:border-slate-400'
                                }`}
                              >
                                {q} 包
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-6">
                        <h4 className="text-sm font-bold text-slate-900 mb-4">自动购买配置</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900">启用自动购买</p>
                              <p className="text-xs text-slate-500 mt-1">当增量包余量低于设定值时，自动购买 1 个包</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={autoOurchaseEnabled}
                                onChange={(e) => setAutoPurchaseEnabled(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          {autoOurchaseEnabled && (
                            <div className="space-y-4 bg-blue-50 rounded-lg p-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">
                                  余量触发阈值
                                </label>
                                <p className="text-xs text-slate-500 mb-3">
                                  当增量包余量小于此值时，自动购买 1 个包
                                </p>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={thresholdCredits}
                                    onChange={(e) => setThresholdCredits(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-40 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                                  />
                                  <span className="text-sm text-slate-600">分</span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setShowAutoConfigModal(true);
                                  handleSaveAutoConfig();
                                }}
                                disabled={isSavingAutoConfig || !isConfigChanged}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                              >
                                {isSavingAutoConfig ? '保存中...' : !isConfigChanged ? '已保存' : '保存配置'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Price Summary (shared) */}
        {serviceType === 'shared' && (
          <div className="w-80 flex-shrink-0 sticky top-24 h-fit">
            <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
              <h3 className="font-bold text-slate-900">
                {activeTab === 'upgrade' ? '版本升级预览' : activeTab === 'addon' ? '增量包购买预览' : '席位扩容预览'}
              </h3>

              {activeTab === 'addon' ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm whitespace-nowrap">
                    <span className="text-slate-600">单价</span>
                    <span className="font-medium text-slate-900">¥{formatNumber(ADDON_UNIT_PRICE)} / 包</span>
                  </div>
                  <div className="flex justify-between text-sm whitespace-nowrap">
                    <span className="text-slate-600">购买数量</span>
                    <span className="font-medium text-slate-900">{addonQuantity} 包</span>
                  </div>
                  <div className="flex justify-between text-sm whitespace-nowrap">
                    <span className="text-slate-600">获得积分</span>
                    <span className="font-medium text-blue-600">{formatNumber(addonQuantity * ADDON_UNIT_CREDITS)} 积分</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 mt-3 whitespace-nowrap">
                    <span className="text-slate-900 font-semibold">合计</span>
                    <span className="text-orange-600 text-lg font-bold">¥{formatNumber(addonQuantity * ADDON_UNIT_PRICE)}</span>
                  </div>
                  <p className="text-xs text-slate-500 pt-2">
                    增量包一次性收费，积分立即生效，用完为止，不累计至下月。
                  </p>
                  <button className="w-full mt-3 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    立即购买
                  </button>
                </div>
              ) : activeTab === 'upgrade' ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm whitespace-nowrap">
                    <span className="text-slate-600">升级费用</span>
                    <span className="font-medium text-slate-900">¥{sharedSubscription.seats * 156}</span>
                  </div>
                  <div className="flex justify-between text-sm whitespace-nowrap">
                    <span className="text-slate-600">原套餐抵扣</span>
                    <span className="font-medium text-slate-900">-¥{Math.round(sharedSubscription.monthlyPrice * 15 / 30)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 whitespace-nowrap">
                    <span className="text-slate-900 font-semibold">合计</span>
                    <span className="text-orange-600 text-lg font-bold">¥{Math.round(sharedSubscription.seats * 156 - sharedSubscription.monthlyPrice * 15 / 30)}</span>
                  </div>
                  <p className="text-xs text-slate-500 pt-2">
                    此费用为按官网列表价格计算的预计金额，实际费用以账单为准。
                  </p>
                  <button className="w-full mt-3 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    立即升级
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm whitespace-nowrap">
                    <span className="text-slate-600">新增席位</span>
                    <span className="font-medium text-slate-900">{addSeatsValue} 人</span>
                  </div>
                  <div className="flex justify-between text-sm whitespace-nowrap">
                    <span className="text-slate-600">升级费用</span>
                    <span className="font-medium text-slate-900">¥{addSeatsValue * sharedSubscription.pricePerSeat}</span>
                  </div>
                  <div className="flex justify-between text-sm whitespace-nowrap">
                    <span className="text-slate-600">原套餐抵扣</span>
                    <span className="font-medium text-slate-900">-¥{Math.round(addSeatsValue * sharedSubscription.pricePerSeat * 15 / 30)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 whitespace-nowrap">
                    <span className="text-slate-900 font-semibold">合计</span>
                    <span className="text-orange-600 text-lg font-bold">¥{Math.round(addSeatsValue * sharedSubscription.pricePerSeat * 15 / 30)}</span>
                  </div>
                  <p className="text-xs text-slate-500 pt-2">
                    此费用为按官网列表价格计算的预计金额，实际费用以账单为准。
                  </p>
                  <button className="w-full mt-3 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    立即升级
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {serviceType === 'exclusive' && (
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">当前订阅</p>
              <h2 className="text-2xl font-bold text-slate-900">{currentSub.planName}</h2>
            </div>

            <div className="flex items-start gap-16 flex-shrink-0">
              <div>
                <p className="text-xs text-slate-500 mb-2">席位信息</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-slate-900">{formatNumber(currentSub.usedSeats)}</span>
                  <span className="text-sm text-slate-600">/ {formatNumber(currentSub.seats)}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">服务到期日期</p>
                <p className="text-lg font-semibold text-slate-900">{currentSub.endDate}</p>
              </div>

              <button
                onClick={() => setShowTerminateModal(true)}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                终止订阅
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          {serviceType === 'exclusive' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-slate-200">
                <div className="flex gap-8 border-b border-slate-200 px-8 pt-0">
                  <button
                    onClick={() => setActiveTab('upgrade')}
                    className={`py-4 px-0 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'upgrade'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    版本升级
                  </button>
                  <button
                    onClick={() => setActiveTab('seats')}
                    className={`py-4 px-0 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'seats'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    席位扩容
                  </button>
                </div>

                <div className="p-8">
                  {activeTab === 'upgrade' ? (
                    <div>
                      <div className="grid grid-cols-2 gap-6 mb-8">
                        {exclusivePlans.map(plan => {
                          const isSelected = selectedExclusivePlanId === plan.id;
                          const selectable = !plan.current && !plan.disabled;
                          return (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() => selectable && setSelectedExclusivePlanId(plan.id)}
                              disabled={!selectable}
                              className={`text-left rounded-lg border-2 p-6 transition-all ${
                                plan.current
                                  ? 'border-blue-600 bg-blue-50 cursor-default'
                                  : isSelected
                                  ? 'border-blue-600 ring-2 ring-blue-100 bg-white'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              } ${plan.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {plan.current ? (
                                <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded mb-3">
                                  当前版本
                                </span>
                              ) : isSelected ? (
                                <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded mb-3">
                                  已选择
                                </span>
                              ) : null}
                              <h4 className="text-base font-bold text-slate-900 mb-3">{plan.name}</h4>
                              <p className="text-2xl font-bold text-slate-900 mb-1">
                                ¥{plan.price}
                                <span className="text-sm font-normal text-slate-600 ml-1">{plan.priceUnit}</span>
                              </p>
                              <p className="text-xs text-slate-500 mb-4">起购 {plan.minSeats} 人</p>
                              <ul className="space-y-2">
                                {plan.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                                    <span className="text-blue-600 mt-0.5">✓</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-4">选择升级后的席位数</label>
                        <div className="flex gap-3 flex-wrap">
                          {exclusiveSeatsOptions.map(seats => (
                            <button
                              key={seats}
                              onClick={() => setUpgradeSeatsValue(seats)}
                              disabled={seats <= formatNumber(currentSub.seats)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                upgradeSeatsValue === seats
                                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                                  : seats <= currentSub.seats
                                  ? 'opacity-50 cursor-not-allowed border-slate-300 text-slate-500'
                                  : 'border-slate-300 text-slate-700 hover:border-slate-400'
                              }`}
                            >
                              {seats}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Price Summary (exclusive only) */}
        {serviceType === 'exclusive' && (
          <div className="w-80 flex-shrink-0 sticky top-24 h-fit">
            <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
              <h3 className="font-bold text-slate-900">
                {activeTab === 'upgrade' ? '版本升级预览' : '席位扩容预览'}
              </h3>

              {activeTab === 'upgrade' ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    选择目标版本后，系统会根据新版本席位数和剩余周期计算升级费用。
                  </p>
                  <button className="w-full mt-3 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    立即升级
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm whitespace-nowrap">
                    <span className="text-slate-600">升级费用</span>
                    <span className="font-medium text-slate-900">¥{calcExclusivePrice(5000, upgradeSeatsValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm whitespace-nowrap">
                    <span className="text-slate-600">原套餐抵扣</span>
                    <span className="font-medium text-slate-900">-¥{Math.round(exclusiveSubscription.monthlyPrice * 15 / 30)}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 whitespace-nowrap">
                    <span className="text-slate-900 font-semibold">合计</span>
                    <span className="text-orange-600 text-lg font-bold">¥{Math.round((calcExclusivePrice(5000, upgradeSeatsValue) - exclusiveSubscription.monthlyPrice) * 15 / 30)}</span>
                  </div>
                  <p className="text-xs text-slate-500 pt-2">
                    此费用为按官网列表价格计算的预计金额，实际费用以账单为准。
                  </p>
                  <button className="w-full mt-3 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    立即扩容
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {creditDetailType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setCreditDetailType(null)}>
          <div className="bg-white rounded-lg w-[1000px] max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {creditDetailType === 'plan' ? '套餐内积分明细' : '增量包积分明细'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {creditDetailType === 'plan' ? '当前计费周期内套餐积分的消耗情况' : '所有增量包的积分使用情况'}
                </p>
              </div>
              <button onClick={() => setCreditDetailType(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>

            {creditDetailType === 'plan' ? (
              <>
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">套餐总额</p>
                    <p className="text-sm font-semibold text-slate-900">60,000 分</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">已消耗</p>
                    <p className="text-sm font-semibold text-slate-700">53,730 分</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">剩余</p>
                    <p className="text-sm font-bold text-blue-600">6,270 分</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">下次重置</p>
                    <p className="text-sm font-semibold text-slate-900">2026-05-18</p>
                  </div>
                </div>
                <div className="overflow-auto flex-1 p-6">
                  <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                        <th className="text-left font-medium px-5 py-3">积分类型</th>
                        <th className="text-right font-medium px-5 py-3">总量</th>
                        <th className="text-right font-medium px-5 py-3">已用</th>
                        <th className="text-right font-medium px-5 py-3">余量</th>
                        <th className="text-left font-medium px-5 py-3 min-w-[200px]">使用进度</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { type: '个人积分', desc: '仅限本人使用', total: 20000, used: 18920, color: 'blue' },
                        { type: '共享积分', desc: '团队所有成员共享', total: 40000, used: 34810, color: 'teal' },
                      ].map((row) => {
                        const remaining = row.total - row.used;
                        const pct = Math.round((row.used / row.total) * 100);
                        return (
                          <tr key={row.type} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-slate-900">{row.type}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{row.desc}</p>
                            </td>
                            <td className="px-5 py-4 text-right text-slate-700 font-medium">{formatNumber(row.total)}</td>
                            <td className="px-5 py-4 text-right text-slate-700">{formatNumber(row.used)}</td>
                            <td className={`px-5 py-4 text-right font-bold ${remaining > 0 ? (row.color === 'blue' ? 'text-blue-600' : 'text-teal-600') : 'text-slate-400'}`}>
                              {formatNumber(remaining)}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${row.color === 'blue' ? 'bg-blue-500' : 'bg-teal-500'}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">增量包明细</span>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                    {([{ value: 'all', label: '全部' }, { value: '已生效', label: '已生效' }, { value: '已用完', label: '已用完' }] as const).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setAddonStatusFilter(opt.value)}
                        className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                          addonStatusFilter === opt.value
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                        <th className="text-left font-medium px-5 py-3">订单编号</th>
                        <th className="text-left font-medium px-5 py-3">购买时间</th>
                        <th className="text-right font-medium px-5 py-3">数量</th>
                        <th className="text-left font-medium px-5 py-3 min-w-[240px]">积分余量</th>
                        <th className="text-left font-medium px-5 py-3">操作人</th>
                        <th className="text-left font-medium px-5 py-3">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAddonHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">暂无匹配数据</td>
                        </tr>
                      ) : filteredAddonHistory.map(record => {
                        const remainPct = Math.round((record.remaining / record.credits) * 100);
                        return (
                        <tr key={record.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 text-slate-700 font-mono text-xs">{record.id}</td>
                          <td className="px-5 py-3 text-slate-600 text-xs">{record.date}</td>
                          <td className="px-5 py-3 text-right text-slate-900 font-medium">{record.quantity} 包</td>
                          <td className="px-5 py-3">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-baseline justify-between gap-3">
                                <div className="flex items-baseline gap-1.5">
                                  <span className={`text-base font-bold ${record.remaining > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {formatNumber(record.remaining)}
                                  </span>
                                  <span className="text-xs text-slate-400">/ {formatNumber(record.credits)}</span>
                                </div>
                                <span className={`text-xs font-medium ${record.remaining > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                  剩余 {remainPct}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${record.remaining > 0 ? 'bg-blue-500' : 'bg-slate-300'}`}
                                  style={{ width: `${remainPct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-600 text-xs">{record.operator}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                              record.status === '已生效'
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setCreditDetailType(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showTerminateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">终止订阅</h3>
            <p className="text-sm text-slate-600 mb-6">
              终止订阅后，将在到期日期（{currentSub.endDate}）后停止服务。此操作无法撤销。
            </p>

            <div className="bg-orange-50 rounded-lg p-4 mb-6 border border-orange-200">
              <p className="text-xs text-orange-700">
                <span className="font-semibold">注意：</span> 您的数据将在停止服务后保留 30 天，之后将被永久删除。
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTerminateModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                确认终止
              </button>
            </div>
          </div>
        </div>
      )}

      {showAutoConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => !isSavingAutoConfig && handleCancelAutoConfig()}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            {autoConfigStatus === 'need-purchase' ? (
              <>
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900">确认自动购买增量包</h3>
                </div>
                <div className="px-6 py-4">
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      当前账户内的增量包余量已低于要求，系统将自动下单购买一个增量包（10,000 积分）。
                    </p>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">当前增量包余量：</span>
                      <span className="font-semibold text-slate-900">{formatNumber(currentAddonRemaining)} 分</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">触发阈值：</span>
                      <span className="font-semibold text-slate-900">{thresholdCredits} 分</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                      <span className="text-slate-600">购买增量包数量：</span>
                      <span className="font-semibold text-blue-600">1 个</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">购买价格：</span>
                      <span className="font-semibold text-orange-600">¥1,000</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 flex gap-3 rounded-b-xl">
                  <button
                    onClick={handleCancelAutoConfig}
                    disabled={isSavingAutoConfig}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirmAutoConfig}
                    disabled={isSavingAutoConfig}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingAutoConfig ? '处理中...' : '同意并保存'}
                  </button>
                </div>
              </>
            ) : autoConfigStatus === 'success' ? (
              <>
                <div className="px-6 py-8 text-center">
                  <div className="mb-4 w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xl text-green-600">✓</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {autoConfigStatus === 'need-purchase' ? '配置保存成功' : '保存成功'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    自动购买配置已保存{autoConfigStatus === 'need-purchase' ? '，增量包已下单' : ''}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

