import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, User, ChevronRight, ChevronDown, Building2, RefreshCw, ChevronLeft, Check, Download } from 'lucide-react';
import { usePlanMode } from '../context/PlanModeContext';
import { formatTokens, formatCredits, formatNumber, formatDuration } from '../utils/chartUtils';

interface OrgNode {
  id: string;
  name: string;
  children?: OrgNode[];
}

const orgTree: OrgNode[] = [
  {
    id: 'root',
    name: 'XX科技有限责任公司',
    children: [
      { id: 'hq', name: '本部' },
      { id: 'jd', name: '京东业务部' },
      { id: 'ks', name: '金山云' },
      { id: 'partner', name: '合作伙伴' },
      { id: 'mi', name: '小米事业部' },
      { id: 'overseas', name: '海外业务部' },
    ],
  },
];

interface OrgStats {
  name: string;
  personalCredits: string;
  sharedCredits: string;
  requests: string;
  members: number;
  active: number;
}

interface MemberRow {
  id: string;
  name: string;
  dept: string;
  personalCredits: number;
  sharedCredits: number;
  requests: number;
  avgLatency: number;
  activeDays: number;
  activeDaysTotal: number;
  profile?: {
    email: string;
    lastActive: string;
    terminal: string;
    modelPrefs: Array<{ name: string; usage: string; pct: number }>;
  };
}

const orgStatsMap: Record<string, OrgStats> = {
  root: { name: 'XX科技有限责任公司', personalCredits: '12580.458321', sharedCredits: '18465.23586', requests: '9832', members: 48, active: 35 },
  hq: { name: '本部', personalCredits: '4520.325612', sharedCredits: '6832.12548', requests: '3521', members: 18, active: 15 },
  jd: { name: '京东业务部', personalCredits: '3087.208258', sharedCredits: '4643.37588', requests: '2893', members: 7, active: 7 },
  ks: { name: '金山云', personalCredits: '2152.458963', sharedCredits: '3521.85214', requests: '1586', members: 10, active: 8 },
  partner: { name: '合作伙伴', personalCredits: '1258.362541', sharedCredits: '1852.14258', requests: '892', members: 6, active: 3 },
  mi: { name: '小米事业部', personalCredits: '1052.258741', sharedCredits: '1125.3651', requests: '620', members: 4, active: 1 },
  overseas: { name: '海外业务部', personalCredits: '509.842256', sharedCredits: '490.39678', requests: '320', members: 3, active: 1 },
};

const jdMembers: MemberRow[] = [
  { id: '01473308661723735821', name: '崔春松', dept: '系统研发部', personalCredits: 1500, sharedCredits: 4643.37588, requests: 1909, avgLatency: 15322.75, activeDays: 5, activeDaysTotal: 8 },
  { id: '27621324042004455389', name: '侯文超', dept: '系统研发部', personalCredits: 227.56633, sharedCredits: 0, requests: 290, avgLatency: 14409.89, activeDays: 2, activeDaysTotal: 8 },
  { id: '47431366492910301', name: '王兴科', dept: '解决方案部', personalCredits: 502.29835, sharedCredits: 0, requests: 223, avgLatency: 10636.25, activeDays: 2, activeDaysTotal: 8 },
  { id: '03575935353929261701', name: '王明月', dept: '解决方案部', personalCredits: 133.33607, sharedCredits: 0, requests: 385, avgLatency: 11975.83, activeDays: 4, activeDaysTotal: 8 },
  { id: '01241528072836292866', name: '郝俊凯', dept: '系统研发部', personalCredits: 661.1328, sharedCredits: 0, requests: 58, avgLatency: 6886.33, activeDays: 1, activeDaysTotal: 8 },
  { id: '01655455492084319', name: '刘亚威', dept: '解决方案部', personalCredits: 57.880758, sharedCredits: 0, requests: 21, avgLatency: 9792.8, activeDays: 4, activeDaysTotal: 8 },
  { id: '18416148472080659', name: '侯铠峰', dept: '系统研发部', personalCredits: 4.99395, sharedCredits: 0, requests: 7, avgLatency: 38232, activeDays: 1, activeDaysTotal: 8 },
];

const hqMembers: MemberRow[] = [
  { id: '10234568790123456780', name: '张伟', dept: '技术中心', personalCredits: 1245.56, sharedCredits: 2580.3, requests: 1520, avgLatency: 12450.25, activeDays: 7, activeDaysTotal: 8 },
  { id: '20345678901234567890', name: '李强', dept: '产品设计部', personalCredits: 985.25, sharedCredits: 1820.45, requests: 1280, avgLatency: 11820.5, activeDays: 6, activeDaysTotal: 8 },
  { id: '30456789012345678901', name: '王芳', dept: '市场运营部', personalCredits: 725.82, sharedCredits: 1254.18, requests: 980, avgLatency: 10825.75, activeDays: 5, activeDaysTotal: 8 },
  { id: '40567890123456789012', name: '陈明', dept: '技术中心', personalCredits: 658.34, sharedCredits: 892.56, requests: 785, avgLatency: 9520.45, activeDays: 5, activeDaysTotal: 8 },
  { id: '50678901234567890123', name: '赵洁', dept: '行政人事部', personalCredits: 423.21, sharedCredits: 285.33, requests: 425, avgLatency: 8620.25, activeDays: 4, activeDaysTotal: 8 },
];

const membersMap: Record<string, MemberRow[]> = {
  root: [...hqMembers, ...jdMembers],
  hq: hqMembers,
  jd: jdMembers,
  ks: [],
  partner: [],
  mi: [],
  overseas: [],
};


const ActiveDaysBar: React.FC<{ days: number; total: number }> = ({ days, total }) => {
  const pct = total > 0 ? (days / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 whitespace-nowrap">{days}/{total}</span>
    </div>
  );
};

const OrgTreeNode: React.FC<{
  node: OrgNode;
  selectedId: string;
  onSelect: (id: string) => void;
  level?: number;
}> = ({ node, selectedId, onSelect, level = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.id === selectedId;

  return (
    <div>
      <div
        onClick={() => onSelect(node.id)}
        className="flex items-center gap-1 px-2 py-1.5 rounded cursor-default text-sm text-slate-700 hover:bg-slate-100/50"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex-shrink-0"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        ) : (
          <span className="w-3.5" />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children!.map(child => (
            <OrgTreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-white rounded-lg border border-slate-200 px-5 py-4">
    <div className="text-xs text-slate-500 mb-2">{label}</div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className="text-xs text-slate-500">{unit}</span>
    </div>
  </div>
);

const MemberDetailView: React.FC<{ member: MemberRow; onBack: () => void }> = ({ member, onBack }) => {
  const { planMode } = usePlanMode();
  const isShared = planMode === 'shared';

  const lastActive = '2026-04-21 21:20:26';
  const terminal = 'ksgc-cli';
  const addonUsed = 7250;
  const totalConsumed = member.personalCredits + member.sharedCredits + (isShared ? addonUsed : 0);

  const modelPrefs = [
    { name: 'kimi-k2.5', pct: 60.78 },
    { name: 'glm-5', pct: 26.96 },
    { name: 'glm-5.1', pct: 12.26 },
    { name: 'qwen3-vl-235b-a22b-thinking', pct: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="mt-3 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="返回"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-slate-300" />
          </div>
          <div className="pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xl font-bold text-slate-900">
                {member.id} [{member.name}]
              </span>
              <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded border border-blue-100">
                {member.dept}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-6">
              <span>最近活跃 <span className="text-slate-700">{lastActive}</span></span>
              <span>最常使用终端 <span className="text-slate-700">{terminal}</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 pt-2">
        <div>
          <div className="text-xs text-slate-500 mb-3">{isShared ? '消耗积分' : 'Token消耗'}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">
              {isShared ? formatCredits(totalConsumed) : formatTokens(totalConsumed)}
            </span>
            <span className="text-xs text-slate-500">{isShared ? '分' : ''}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-3">活跃天数</div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">{formatNumber(member.activeDays)}/{formatNumber(member.activeDaysTotal)}</span>
            <span className="text-xs text-slate-500">天</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-3">请求次数</div>
          <div className="text-3xl font-bold text-slate-900">{formatNumber(member.requests)}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h4 className="text-sm font-semibold text-slate-900 mb-4">{isShared ? '消耗积分构成' : 'Token消耗构成'}</h4>

        {isShared ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-xs text-slate-500 mb-2">个人积分</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-green-600">{formatCredits(member.personalCredits)}</span>
                <span className="text-xs text-slate-500">分</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-xs text-slate-500 mb-2">共享积分</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-600">{formatCredits(member.sharedCredits)}</span>
                <span className="text-xs text-slate-500">分</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-xs text-slate-500 mb-2">增量包积分</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-orange-600">{formatCredits(addonUsed)}</span>
                <span className="text-xs text-slate-500">分</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-xs text-slate-500 mb-2">输入Token</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-green-600">{formatTokens(member.personalCredits)}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-xs text-slate-500 mb-2">输出Token</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-600">{formatTokens(member.sharedCredits)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-5">模型偏好分布</h4>
        <div className="space-y-5">
          {modelPrefs.map((mp, idx) => (
            <div key={idx}>
              <div className="text-sm text-slate-700 mb-2">{mp.name}</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${mp.pct}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-14 text-right">{mp.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UsageOrgView: React.FC = () => {
  const { planMode } = usePlanMode();
  const isShared = planMode === 'shared';
  const [selectedOrgId, setSelectedOrgId] = useState<string>('root');
  const [orgSearch, setOrgSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberTab, setMemberTab] = useState<'all' | 'personal' | 'shared' | 'addon'>('all');
  const [selectedMemberIdx, setSelectedMemberIdx] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const stats = orgStatsMap[selectedOrgId] || orgStatsMap.root;
  const members = membersMap[selectedOrgId] || [];

  const filteredMembers = useMemo(() => {
    let list = members;
    if (memberTab === 'personal') {
      list = list.filter(m => m.personalCredits > 0);
    } else if (memberTab === 'shared') {
      list = list.filter(m => m.sharedCredits > 0);
    } else if (memberTab === 'addon') {
      list = list.filter(m => m.personalCredits > 100);
    }
    if (memberSearch) {
      list = list.filter(m => m.name.includes(memberSearch) || m.id.includes(memberSearch));
    }
    return list;
  }, [members, memberTab, memberSearch]);

  const totalCount = filteredMembers.length;
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportToCSV = () => {
    const headers = isShared
      ? ['排名', '姓名', '部门', '个人积分', '共享积分', '增量包积分', '请求数', '平均耗时(ms)', '活跃天数']
      : ['排名', '姓名', '部门', 'Token消耗(输入+输出)', '请求数', '平均耗时(ms)', '活跃天数'];
    const rows = filteredMembers.map((m, idx) => {
      const addonUsage = m.personalCredits > 100 ? Math.round(m.personalCredits * 0.3) : 0;
      return isShared
        ? [
            idx + 1,
            m.name,
            m.dept,
            formatNumber(m.personalCredits),
            formatNumber(m.sharedCredits),
            addonUsage > 0 ? formatNumber(addonUsage) : 0,
            formatNumber(parseInt(m.requests)),
            formatDuration(m.avgLatency / 1000) + 's',
            `${m.activeDays}/${m.activeDaysTotal}`,
          ]
        : [
            idx + 1,
            m.name,
            m.dept,
            `${formatTokens(m.personalCredits)} / ${formatTokens(m.sharedCredits)}`,
            formatNumber(parseInt(m.requests)),
            formatDuration(m.avgLatency / 1000) + 's',
            `${m.activeDays}/${m.activeDaysTotal}`,
          ];
    });

    const csv = [headers, ...rows].map(row => row.map(cell => {
      const str = String(cell);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${stats.name}_成员用量_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-0 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-[600px]">
      <aside className="w-64 border-r border-slate-200 bg-slate-50/30 flex-shrink-0">
        <div className="px-4 py-3 border-b border-slate-200">
          <h4 className="text-sm font-medium text-slate-900">组织分类</h4>
        </div>
        <div className="p-3">
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="请输入组织关键词搜索"
              value={orgSearch}
              onChange={(e) => setOrgSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="space-y-0.5">
            {orgTree.map(node => (
              <OrgTreeNode
                key={node.id}
                node={node}
                selectedId={selectedOrgId}
                onSelect={(id) => {
                  setSelectedOrgId(id);
                  setSelectedMemberIdx(null);
                  setCurrentPage(1);
                }}
              />
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-5 overflow-hidden">
        {selectedMemberIdx !== null && paginatedMembers[selectedMemberIdx] ? (
          <MemberDetailView
            member={paginatedMembers[selectedMemberIdx]}
            onBack={() => setSelectedMemberIdx(null)}
          />
        ) : (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-900">{stats.name}</h3>

            <div className={`grid ${isShared ? 'grid-cols-5' : 'grid-cols-3'} gap-4`}>
              {isShared ? (
                <>
                  <StatCard label="个人积分" value={formatCredits(parseFloat(stats.personalCredits))} unit="分" />
                  <StatCard label="共享积分" value={formatCredits(parseFloat(stats.sharedCredits))} unit="分" />
                  <StatCard label="增量包积分" value={formatCredits(12580)} unit="分" />
                  <StatCard label="请求数" value={formatNumber(parseInt(stats.requests))} unit="次" />
                  <StatCard label="活跃用户" value={formatNumber(stats.active)} unit="人" />
                </>
              ) : (
                <>
                  <StatCard label="Token 消耗" value={formatTokens((parseFloat(stats.personalCredits) + parseFloat(stats.sharedCredits)) * 1000)} unit="" />
                  <StatCard label="请求数" value={formatNumber(parseInt(stats.requests))} unit="次" />
                  <StatCard label="活跃用户" value={formatNumber(stats.active)} unit="人" />
                </>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h4 className="text-sm font-medium text-slate-900">成员用量</h4>
                  {!isShared && (
                  <div className="flex items-center gap-1 bg-slate-100 rounded p-0.5">
                    {([
                      { id: 'all', label: '全部' },
                      { id: 'personal', label: '个人积分' },
                      { id: 'shared', label: '共享积分' },
                      ...(isShared ? [{ id: 'addon', label: '增量包积分' }] : []),
                    ] as Array<{ id: typeof memberTab; label: string }>).map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setMemberTab(tab.id as typeof memberTab)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          memberTab === tab.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="请输入成员姓名进行搜索"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded w-56 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <button className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                    title="导出为 CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    导出
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500">
                      <th className="text-left font-medium px-4 py-3 w-16">排名</th>
                      <th className="text-left font-medium px-4 py-3">姓名</th>
                      <th className="text-left font-medium px-4 py-3">部门</th>
                      {isShared ? (
                        <>
                          <th className="text-right font-medium px-4 py-3">个人积分</th>
                          <th className="text-right font-medium px-4 py-3">共享积分</th>
                          <th className="text-right font-medium px-4 py-3">增量包积分</th>
                        </>
                      ) : (
                        <th className="text-right font-medium px-4 py-3">Token消耗(输入+输出)</th>
                      )}
                      <th className="text-right font-medium px-4 py-3">请求数</th>
                      <th className="text-left font-medium px-4 py-3">活跃天数</th>
                      <th className="text-center font-medium px-4 py-3 w-16">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.length === 0 ? (
                      <tr>
                        <td colSpan={isShared ? 9 : 7} className="text-center py-12 text-sm text-slate-400">
                          暂无数据
                        </td>
                      </tr>
                    ) : (
                      paginatedMembers.map((m, idx) => {
                        const addonUsage = m.personalCredits > 100 ? Math.round(m.personalCredits * 0.3) : 0;
                        return (
                        <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 text-slate-600">{(currentPage - 1) * pageSize + idx + 1}</td>
                          <td className="px-4 py-3 text-slate-700 text-xs">
                            {m.id} [{m.name}]
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{m.dept}</td>
                          {isShared ? (
                            <>
                              <td className="px-4 py-3 text-right text-slate-700">{formatNumber(m.personalCredits)}</td>
                              <td className="px-4 py-3 text-right text-slate-700">{formatNumber(m.sharedCredits)}</td>
                              <td className="px-4 py-3 text-right text-slate-700">
                                {addonUsage > 0 ? formatNumber(addonUsage) : <span className="text-slate-300">0</span>}
                              </td>
                            </>
                          ) : (
                            <td className="px-4 py-3 text-right text-slate-700">{formatTokens(m.personalCredits)} / {formatTokens(m.sharedCredits)}</td>
                          )}
                          <td className="px-4 py-3 text-right text-slate-700">{formatNumber(parseInt(m.requests))}</td>
                          <td className="px-4 py-3">
                            <ActiveDaysBar days={m.activeDays} total={m.activeDaysTotal} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setSelectedMemberIdx(idx)}
                              className="text-blue-600 hover:text-blue-700 text-xs transition-colors"
                            >
                              详情
                            </button>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                <span>共 {totalCount} 条</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-3 h-3 rotate-180" />
                    </button>
                    <button
                      className={`w-7 h-7 rounded flex items-center justify-center text-xs ${
                        currentPage === 1
                          ? 'border border-blue-500 text-blue-600'
                          : 'border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      1
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage * pageSize >= totalCount}
                      className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                  >
                    <option value={10}>10 条/页</option>
                    <option value={20}>20 条/页</option>
                    <option value={50}>50 条/页</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <span>前往</span>
                    <input
                      type="number"
                      defaultValue={1}
                      min={1}
                      className="w-10 border border-slate-200 rounded px-1.5 py-1 text-center text-xs focus:outline-none focus:border-blue-400"
                    />
                    <span>页</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UsageOrgView;
