import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Building2, Users, Save, Info, Plus, Pencil, Trash2, X, ChevronDown, ChevronRight, CircleAlert as AlertCircle } from 'lucide-react';
import { formatCredits, formatNumber } from '../utils/chartUtils';

interface DeptQuota {
  id: number;
  name: string;
  fullPath: string;
  members: number;
  quota: number;
  used: number;
}

interface MemberQuota {
  id: number;
  name: string;
  email: string;
  dept: string;
  quota: number;
  used: number;
  source?: 'custom' | 'dept' | 'default'; // 配额来源
}

interface ContactOption {
  id: string;
  name: string;
  email: string;
}

interface DeptNode {
  id: string;
  name: string;
  level: number;
  members: number;
  children?: DeptNode[];
}

const deptTree: DeptNode[] = [
  {
    id: 'tech', name: '技术中心', level: 1, members: 45, children: [
      { id: 'rd1', name: '研发一部', level: 2, members: 20 },
      { id: 'rd2', name: '研发二部', level: 2, members: 15 },
      { id: 'arch', name: '架构部', level: 2, members: 10 },
    ]
  },
  { id: 'product', name: '产品中心', level: 1, members: 20 },
  { id: 'market', name: '市场中心', level: 1, members: 15 },
  { id: 'admin', name: '职能中心', level: 1, members: 18 },
];

const memberOptions = [
  { id: 'm1', name: '张三', email: 'zhangsan@company.com', dept: '技术研发部' },
  { id: 'm2', name: '李四', email: 'lisi@company.com', dept: '技术研发部' },
  { id: 'm3', name: '王五', email: 'wangwu@company.com', dept: '产品设计部' },
  { id: 'm4', name: '赵六', email: 'zhaoliu@company.com', dept: '市场运营部' },
  { id: 'm5', name: '陈七', email: 'chenqi@company.com', dept: '职能中心' },
];

const contactOptions: ContactOption[] = [
  { id: 'c1', name: '张三', email: 'zhangsan@company.com' },
  { id: 'c2', name: '李四', email: 'lisi@company.com' },
  { id: 'c3', name: '王五', email: 'wangwu@company.com' },
  { id: 'c4', name: '赵六', email: 'zhaoliu@company.com' },
  { id: 'c5', name: '陈七', email: 'chenqi@company.com' },
];

const levelColors: Record<number, string> = {
  1: 'bg-blue-50 text-blue-600 border-blue-200',
  2: 'bg-blue-50 text-blue-500 border-blue-200',
  3: 'bg-slate-50 text-slate-500 border-slate-200',
};

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${value ? 'bg-blue-500' : 'bg-slate-200'}`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${value ? 'left-6' : 'left-1'}`} />
  </div>
);

const UsageBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="flex items-center gap-2">
    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pct >= 80 ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
      {pct}%
    </span>
  </div>
);

const DeptTreeSelect: React.FC<{ selected: string | null; onSelect: (id: string) => void }> = ({ selected, onSelect }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ tech: true });

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const renderNode = (node: DeptNode, depth: number) => {
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selected === node.id;
    const isExpanded = expanded[node.id];

    return (
      <div key={node.id}>
        <div
          className={`flex items-center justify-between py-2 px-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => onSelect(node.id)}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }} className="text-slate-400">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-4" />
            )}
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className={`text-sm ${isSelected ? 'text-blue-600 font-medium' : 'text-slate-700'}`}>{node.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${levelColors[node.level]}`}>
              {node.level === 1 ? '一级' : node.level === 2 ? '二级' : '三级'}
            </span>
          </div>
          <span className="text-xs text-slate-400">{formatNumber(node.members)}人</span>
        </div>
        {isExpanded && hasChildren && node.children!.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto p-1">
      {deptTree.map(node => renderNode(node, 0))}
    </div>
  );
};

const AddDeptQuotaModal: React.FC<{ onClose: () => void; onAdd: (deptId: string, quota: number) => void }> = ({ onClose, onAdd }) => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [quota, setQuota] = useState('');

  const findDeptName = (id: string): string => {
    for (const d of deptTree) {
      if (d.id === id) return d.name;
      if (d.children) {
        for (const c of d.children) {
          if (c.id === id) return c.name;
        }
      }
    }
    return '';
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">添加部门自定义配额</h3>
            <p className="text-sm text-slate-500 mt-0.5">选择部门并设置自定义月度配额（支持1级、2级、3级组织）</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">选择部门</label>
            <DeptTreeSelect selected={selectedDept} onSelect={setSelectedDept} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">月度配额（元）</label>
            <input
              type="number"
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              placeholder="填写0表示不限制"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-xs text-slate-400 mt-2">填写0表示该部门无配额限制</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            取消
          </button>
          <button
            onClick={() => { if (selectedDept && quota !== '') onAdd(selectedDept, Number(quota)); }}
            disabled={!selectedDept || quota === ''}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const AddMemberQuotaModal: React.FC<{ onClose: () => void; onAdd: (memberId: string, quota: number) => void; existingIds: number[] }> = ({ onClose, onAdd, existingIds }) => {
  const [selectedMember, setSelectedMember] = useState('');
  const [quota, setQuota] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  const available = memberOptions.filter(m => !existingIds.includes(Number(m.id.replace('m', ''))));
  const filtered = available.filter(m =>
    !memberSearch || m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">添加成员配置</h3>
            <p className="text-sm text-slate-500 mt-0.5">选择成员并设置自定义月度配额</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">成员清单</label>
            <div className="relative mb-3">
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="搜索成员名称或邮箱..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  {available.length === 0 ? '无可用成员' : '未找到匹配的成员'}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filtered.map(m => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMember(m.id)}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedMember === m.id
                          ? 'bg-blue-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{m.name}</div>
                          <div className="text-xs text-slate-500">{m.email}</div>
                          <div className="text-xs text-slate-400 mt-1">部门：{m.dept}</div>
                        </div>
                        {selectedMember === m.id && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">月度配额（元）</label>
            <input
              type="number"
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              placeholder="填写0表示不限制"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-xs text-slate-400 mt-2">填写0表示该成员无配额限制</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            取消
          </button>
          <button
            onClick={() => { if (selectedMember && quota !== '') onAdd(selectedMember, Number(quota)); }}
            disabled={!selectedMember || quota === ''}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const QuotaView: React.FC = () => {
  const [accountEnabled, setAccountEnabled] = useState(true);
  const [accountBudget, setAccountBudget] = useState('50000');
  const [defaultMemberQuota, setDefaultMemberQuota] = useState('500');

  const [deptEnabled, setDeptEnabled] = useState(true);
  const [deptQuotas, setDeptQuotas] = useState<DeptQuota[]>([
    { id: 1, name: '前端组', fullPath: '技术中心 / 研发一部 / 前端组', members: 8, quota: 8000, used: 5200 },
  ]);
  const [showAddDept, setShowAddDept] = useState(false);

  const [memberEnabled, setMemberEnabled] = useState(true);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberQuotas, setMemberQuotas] = useState<MemberQuota[]>([
    { id: 1, name: '张三', email: 'zhangsan@company.com', dept: '技术研发部', quota: 800, used: 320, source: 'custom' },
    { id: 2, name: '赵六', email: 'zhaoliu@company.com', dept: '市场运营部', quota: 300, used: 200, source: 'custom' },
  ]);
  const [showAddMember, setShowAddMember] = useState(false);

  const getQuotaSourceLabel = (source?: 'custom' | 'dept' | 'default') => {
    switch (source) {
      case 'custom': return { text: '自定义', color: 'bg-blue-50 text-blue-600 border-blue-200' };
      case 'dept': return { text: '部门配额', color: 'bg-green-50 text-green-600 border-green-200' };
      case 'default': return { text: '全员默认', color: 'bg-slate-50 text-slate-600 border-slate-200' };
      default: return { text: '全员默认', color: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [threshold, setThreshold] = useState('80');
  const [discount, setDiscount] = useState('10');
  const [notifyContacts, setNotifyContacts] = useState<string[]>(['c1', 'c2']);

  const filteredMembers = memberQuotas.filter(m =>
    !memberSearch || m.name.includes(memberSearch) || m.email.includes(memberSearch)
  );

  const handleAddDept = (deptId: string, quota: number) => {
    const findName = (nodes: typeof deptTree): string => {
      for (const n of nodes) {
        if (n.id === deptId) return n.name;
        if (n.children) { const r = findName(n.children); if (r) return r; }
      }
      return '';
    };

    const findMembers = (nodes: typeof deptTree): number => {
      for (const n of nodes) {
        if (n.id === deptId) return n.members;
        if (n.children) { const r = findMembers(n.children); if (r) return r; }
      }
      return 0;
    };

    const findFullPath = (nodes: typeof deptTree, targetId: string, path: string[] = []): string => {
      for (const n of nodes) {
        const currentPath = [...path, n.name];
        if (n.id === targetId) {
          return currentPath.join(' / ');
        }
        if (n.children) {
          const result = findFullPath(n.children, targetId, currentPath);
          if (result) return result;
        }
      }
      return '';
    };

    const fullPath = findFullPath(deptTree, deptId);
    setDeptQuotas([...deptQuotas, { id: Date.now(), name: findName(deptTree), fullPath, members: findMembers(deptTree), quota, used: 0 }]);
    setShowAddDept(false);
  };

  const handleAddMember = (memberId: string, quota: number) => {
    const m = memberOptions.find(o => o.id === memberId);
    if (!m) return;
    setMemberQuotas([...memberQuotas, { id: Date.now(), name: m.name, email: m.email, dept: m.dept, quota, used: 0, source: 'custom' }]);
    setShowAddMember(false);
  };

  const removeDeptQuota = (id: number) => setDeptQuotas(deptQuotas.filter(d => d.id !== id));
  const removeMemberQuota = (id: number) => setMemberQuotas(memberQuotas.filter(m => m.id !== id));

  return (
    <div className="space-y-6 animate-fade-in font-sans">

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-slate-600" />
          <h3 className="font-bold text-slate-900 text-base">配额管理统一配置</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700 font-medium min-w-fit">预警阈值</span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="px-3 py-1.5 w-24 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700 font-medium min-w-fit">配额消费折扣</span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="如4.5"
                  className="px-3 py-1.5 w-24 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-sm text-slate-500">折</span>
              </div>
            </div>

            <button className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="text-sm font-medium text-slate-700 mb-2">预警消息接收人</div>
            <p className="text-xs text-slate-500 mb-3">当模型由规指标异常或故障正常时，将选送消息通知给联系人。如需创建联系人，请到</p>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                onClick={() => setShowNotifyModal(true)}
                className="px-3 py-2 border border-blue-300 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white cursor-pointer"
              >
                <option>选择联系人...</option>
              </select>
              {contactOptions
                .filter(contact => notifyContacts.includes(contact.id))
                .map(contact => (
                  <div key={contact.id} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 border border-blue-300 rounded text-sm">
                    <span className="text-slate-700">{contact.name}</span>
                    <span className="text-xs text-slate-500">({contact.email})</span>
                    <button
                      onClick={() => setNotifyContacts(notifyContacts.filter(id => id !== contact.id))}
                      className="text-slate-400 hover:text-slate-600 transition-colors ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-slate-600" />
          <h3 className="font-bold text-slate-900 text-base">全局配置</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">设置账号级别的全局配额策略,包括账号总预算和默认成员配额</p>

        <div className="flex items-center gap-3 mb-5">
          <Toggle value={accountEnabled} onChange={setAccountEnabled} />
          <span className="text-sm text-slate-700">启用账号配额管理</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700 font-medium min-w-fit">账号月度总预算</span>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-slate-400">¥</span>
                <input
                  type="text"
                  value={accountBudget}
                  onChange={(e) => setAccountBudget(e.target.value)}
                  placeholder="0表示不限"
                  className="pl-7 pr-3 py-1.5 w-32 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <span className="text-xs text-slate-400">填写0表示不限制</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">本月使用</span>
              <span className="font-medium text-slate-900">¥32,500{Number(accountBudget) > 0 ? ` / ¥${accountBudget}` : ''}</span>
              {Number(accountBudget) > 0 && (
                <>
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((32500 / Number(accountBudget)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-slate-400">{Math.round((32500 / Number(accountBudget)) * 100)}%</span>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-slate-700 font-medium min-w-fit">全员默认配额</span>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-slate-400">¥</span>
                <input
                  type="text"
                  value={defaultMemberQuota}
                  onChange={(e) => setDefaultMemberQuota(e.target.value)}
                  placeholder="0表示不限"
                  className="pl-7 pr-3 py-1.5 w-32 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <span className="text-xs text-slate-400">未单独配置的成员将使用此配额，填写0表示不限制</span>
            </div>
            <button className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4" />
              保存配置
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-slate-600" />
          <h3 className="font-bold text-slate-900 text-base">部门配置</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">为指定部门设置token消费配额，优先级高于全员默认配额</p>

        <div className="flex items-center gap-3 mb-6">
          <Toggle value={deptEnabled} onChange={setDeptEnabled} />
          <span className="text-sm text-slate-700">启用部门配额管理</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-slate-700">部门配额列表</span>
          <button onClick={() => setShowAddDept(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            添加部门配置
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 text-xs font-medium text-slate-500">部门</th>
              <th className="text-left py-3 text-xs font-medium text-slate-500">成员数</th>
              <th className="text-left py-3 text-xs font-medium text-slate-500">月度配额（元）</th>
              <th className="text-left py-3 text-xs font-medium text-slate-500">已使用</th>
              <th className="text-left py-3 text-xs font-medium text-slate-500">使用率</th>
              <th className="text-right py-3 text-xs font-medium text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {deptQuotas.map(d => (
              <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5">
                  <div className="font-medium text-slate-700">{d.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{d.fullPath}</div>
                </td>
                <td className="py-3.5 text-slate-600">{formatNumber(d.members)}</td>
                <td className="py-3.5 text-slate-600">¥{formatNumber(d.quota)}</td>
                <td className="py-3.5 text-slate-600">¥{formatNumber(d.used)}</td>
                <td className="py-3.5">
                  <UsageBar pct={d.quota > 0 ? Math.round((d.used / d.quota) * 100) : 0} />
                </td>
                <td className="py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => removeDeptQuota(d.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {deptQuotas.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-400">暂无自定义部门配额</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-slate-600" />
          <h3 className="font-bold text-slate-900 text-base">成员配置</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">查看所有成员的配额情况，可为指定成员设置自定义配额(优先级最高)</p>

        <div className="flex items-center gap-3 mb-6">
          <Toggle value={memberEnabled} onChange={setMemberEnabled} />
          <span className="text-sm text-slate-700">启用成员配额管理</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm font-bold text-slate-700">成员配额列表</span>
            <p className="text-xs text-slate-400 mt-1">仅显示已配置自定义配额的成员，其他成员将自动使用部门配额或全员默认配额</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="搜索成员..."
                className="pl-3 pr-3 py-1.5 w-40 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            <button onClick={() => setShowAddMember(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              添加成员配置
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 text-xs font-medium text-slate-500">成员</th>
              <th className="text-left py-3 text-xs font-medium text-slate-500">部门</th>
              <th className="text-left py-3 text-xs font-medium text-slate-500">配额来源</th>
              <th className="text-left py-3 text-xs font-medium text-slate-500">月度配额（元）</th>
              <th className="text-left py-3 text-xs font-medium text-slate-500">已使用</th>
              <th className="text-left py-3 text-xs font-medium text-slate-500">使用率</th>
              <th className="text-right py-3 text-xs font-medium text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(m => {
              const sourceInfo = getQuotaSourceLabel(m.source);
              return (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5">
                    <div className="text-slate-700 font-medium">{m.name}</div>
                    <div className="text-xs text-slate-400">{m.email}</div>
                  </td>
                  <td className="py-3.5 text-slate-600">{m.dept}</td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${sourceInfo.color}`}>
                      {sourceInfo.text}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-600">¥{formatNumber(m.quota)}</td>
                  <td className="py-3.5 text-slate-600">¥{formatNumber(m.used)}</td>
                  <td className="py-3.5">
                    <UsageBar pct={m.quota > 0 ? Math.round((m.used / m.quota) * 100) : 0} />
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {m.source === 'custom' && (
                        <>
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => removeMemberQuota(m.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                      {m.source !== 'custom' && (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredMembers.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-sm text-slate-400">暂无成员配额数据</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddDept && <AddDeptQuotaModal onClose={() => setShowAddDept(false)} onAdd={handleAddDept} />}
      {showAddMember && <AddMemberQuotaModal onClose={() => setShowAddMember(false)} onAdd={handleAddMember} existingIds={memberQuotas.map(m => m.id)} />}

      {showNotifyModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowNotifyModal(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">预警消息接收人</h3>
                  <p className="text-sm text-slate-500 mt-0.5">配置接收预算预警消息的联系人</p>
                </div>
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {contactOptions.map((contact) => {
                    const isSelected = notifyContacts.includes(contact.id);
                    return (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {contact.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{contact.name}</div>
                            <div className="text-xs text-slate-500">{contact.email}</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setNotifyContacts(notifyContacts.filter(id => id !== contact.id));
                              } else {
                                setNotifyContacts([...notifyContacts, contact.id]);
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm"
                >
                  取消
                </button>
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  保存设置
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuotaView;
