import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Info, Plus, Pencil, Trash2, X, Globe, Monitor, AlertCircle } from 'lucide-react';

type RuleType = 'single' | 'cidr';
type RuleStatus = 'normal' | 'contained';

interface IpRule {
  id: number;
  ip: string;
  type: RuleType;
  desc: string;
  addedAt: string;
}

const initialRules: IpRule[] = [
  { id: 1, ip: '203.119.24.0/24', type: 'cidr', desc: '总部办公网段', addedAt: '2024/1/10' },
  { id: 2, ip: '203.119.24.100', type: 'single', desc: '办公室固定IP（被总部网段包含）', addedAt: '2024/1/12' },
  { id: 3, ip: '58.247.0.0/16', type: 'cidr', desc: '分公司网段', addedAt: '2024/1/13' },
  { id: 4, ip: '58.247.128.0/24', type: 'cidr', desc: '分公司子网段（被分公司网段包含）', addedAt: '2024/1/14' },
  { id: 5, ip: '116.228.89.156', type: 'single', desc: 'VPN 出口 IP', addedAt: '2024/1/15' },
];

function parseCidr(cidr: string): { network: bigint; mask: bigint } | null {
  const parts = cidr.split('/');
  if (parts.length !== 2) return null;
  const ipParts = parts[0].split('.');
  if (ipParts.length !== 4) return null;
  const prefix = parseInt(parts[1], 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null;
  const ip = ipParts.reduce((acc, p) => (acc << BigInt(8)) + BigInt(parseInt(p, 10)), BigInt(0));
  const mask = prefix === 0 ? BigInt(0) : (BigInt(0xFFFFFFFF) << BigInt(32 - prefix)) & BigInt(0xFFFFFFFF);
  return { network: ip & mask, mask };
}

function ipToBigInt(ip: string): bigint | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  return parts.reduce((acc, p) => (acc << BigInt(8)) + BigInt(parseInt(p, 10)), BigInt(0));
}

function isContainedBy(rule: IpRule, other: IpRule): boolean {
  if (rule.id === other.id) return false;
  if (other.type !== 'cidr') return false;

  const otherCidr = parseCidr(other.ip);
  if (!otherCidr) return false;

  if (rule.type === 'single') {
    const ip = ipToBigInt(rule.ip);
    if (ip === null) return false;
    return (ip & otherCidr.mask) === otherCidr.network;
  }

  const ruleCidr = parseCidr(rule.ip);
  if (!ruleCidr) return false;
  return (ruleCidr.network & otherCidr.mask) === otherCidr.network && otherCidr.mask <= ruleCidr.mask;
}

function getContainedByRule(rule: IpRule, allRules: IpRule[]): IpRule | null {
  for (const other of allRules) {
    if (isContainedBy(rule, other)) return other;
  }
  return null;
}

const AddRuleModal: React.FC<{ onClose: () => void; onAdd: (ip: string, type: RuleType, desc: string) => void }> = ({ onClose, onAdd }) => {
  const [ruleType, setRuleType] = useState<RuleType>('single');
  const [ip, setIp] = useState('');
  const [desc, setDesc] = useState('');

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">添加 IP 白名单规则</h3>
            <p className="text-sm text-slate-500 mt-0.5">添加允许访问 API 的 IP 地址或网段</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">规则类型</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="ruleType" checked={ruleType === 'single'} onChange={() => setRuleType('single')} className="text-blue-600 focus:ring-blue-500/20" />
                <span className="text-sm text-slate-700">单个 IP</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="ruleType" checked={ruleType === 'cidr'} onChange={() => setRuleType('cidr')} className="text-blue-600 focus:ring-blue-500/20" />
                <span className="text-sm text-slate-700">CIDR 网段</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">IP 地址</label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder={ruleType === 'single' ? '例如: 116.228.89.156' : '例如: 203.119.24.0/24'}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">描述 (可选)</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="例如: 办公室网络"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            取消
          </button>
          <button
            onClick={() => { if (ip.trim()) onAdd(ip.trim(), ruleType, desc.trim()); }}
            disabled={!ip.trim()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            添加规则
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const EditRuleModal: React.FC<{ rule: IpRule; onClose: () => void; onSave: (r: IpRule) => void }> = ({ rule, onClose, onSave }) => {
  const [ip, setIp] = useState(rule.ip);
  const [ruleType, setRuleType] = useState<RuleType>(rule.type);
  const [desc, setDesc] = useState(rule.desc);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">编辑 IP 白名单规则</h3>
            <p className="text-sm text-slate-500 mt-0.5">修改允许访问 API 的 IP 地址或网段</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">规则类型</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="editRuleType" checked={ruleType === 'single'} onChange={() => setRuleType('single')} className="text-blue-600 focus:ring-blue-500/20" />
                <span className="text-sm text-slate-700">单个 IP</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="editRuleType" checked={ruleType === 'cidr'} onChange={() => setRuleType('cidr')} className="text-blue-600 focus:ring-blue-500/20" />
                <span className="text-sm text-slate-700">CIDR 网段</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">IP 地址</label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">描述 (可选)</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            取消
          </button>
          <button
            onClick={() => { if (ip.trim()) onSave({ ...rule, ip: ip.trim(), type: ruleType, desc: desc.trim() }); }}
            disabled={!ip.trim()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const IpWhitelistView: React.FC = () => {
  const [rules, setRules] = useState(initialRules);
  const [showAdd, setShowAdd] = useState(false);
  const [editingRule, setEditingRule] = useState<IpRule | null>(null);

  const statusMap = useMemo(() => {
    const map = new Map<number, { status: RuleStatus; containedBy?: string }>();
    for (const rule of rules) {
      const parent = getContainedByRule(rule, rules);
      if (parent) {
        map.set(rule.id, { status: 'contained', containedBy: parent.ip });
      } else {
        map.set(rule.id, { status: 'normal' });
      }
    }
    return map;
  }, [rules]);

  const handleAdd = (ip: string, type: RuleType, desc: string) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
    setRules([...rules, { id: Date.now(), ip, type, desc, addedAt: dateStr }]);
    setShowAdd(false);
  };

  const handleSave = (updated: IpRule) => {
    setRules(rules.map(r => r.id === updated.id ? updated : r));
    setEditingRule(null);
  };

  const handleDelete = (id: number) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-slate-900 mb-0.5">IP 白名单说明</div>
          <p className="text-sm text-slate-600">只有来自白名单 IP 的请求才能访问 AI 服务 API。支持单个 IP 地址和 CIDR 网段格式。</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加规则
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">IP / 网段</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">类型</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">描述</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">状态</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">添加时间</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => {
              const info = statusMap.get(rule.id);
              return (
                <tr key={rule.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {rule.type === 'cidr' ? (
                        <Globe className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Monitor className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="font-mono text-slate-900">{rule.ip}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      rule.type === 'cidr'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-green-50 text-green-600'
                    }`}>
                      {rule.type === 'cidr' ? 'CIDR' : '单个IP'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{rule.desc}</td>
                  <td className="px-6 py-4">
                    {info?.status === 'contained' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-orange-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        被 {info.containedBy} 包含
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-green-600">正常</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{rule.addedAt}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditingRule(rule)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(rule.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rules.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">暂无 IP 白名单规则</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && <AddRuleModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {editingRule && <EditRuleModal rule={editingRule} onClose={() => setEditingRule(null)} onSave={handleSave} />}
    </div>
  );
};

export default IpWhitelistView;
