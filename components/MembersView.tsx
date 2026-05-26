import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, ChevronDown, ChevronRight, Building2, Users, RefreshCw, Mail, Lock, UserPlus, RotateCcw, Settings } from 'lucide-react';
import { usePlanMode } from '../context/PlanModeContext';

interface MemberData {
  id: number;
  name: string;
  surname: string;
  email: string;
  dept: string;
  status: 'active' | 'disabled' | 'inactive';
  isExternal: boolean;
  models: string[];
  quota: number;
}

const availableModels = [
  { id: 'kimi-k2-thinking-turbo', name: 'kimi-k2-thinking-turbo', type: '文本' },
  { id: 'qwen3-coder-480b-a35b-instruct', name: 'qwen3-coder-480b-a35b-instruct', type: '文本' },
  { id: 'kimi-k2-turbo-preview', name: 'kimi-k2-turbo-preview', type: '文本' },
  { id: 'deepseek-v3.2', name: 'deepseek-v3.2', type: '文本' },
  { id: 'gpt-4o', name: 'GPT-4o', type: '文本' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', type: '文本' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', type: '文本' },
  { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', type: '文本' },
  { id: 'mistral-large', name: 'Mistral Large', type: '文本' },
  { id: 'nova-pro', name: 'Nova Pro', type: '文本' },
  { id: 'qwen-vl-max', name: 'Qwen VL Max', type: '多模态' },
  { id: 'gpt-4-vision', name: 'GPT-4 Vision', type: '多模态' },
  { id: 'claude-3.5-vision', name: 'Claude 3.5 Vision', type: '多模态' },
  { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', type: '多模态' },
  { id: 'llava-next-vision', name: 'LLaVA Next Vision', type: '多模态' },
];

const orgInheritedModels = ['kimi-k2-thinking-turbo', 'qwen3-coder-480b-a35b-instruct'];

const initialMembers: MemberData[] = [
  { id: 1, name: '张明', surname: '张', email: 'zhangming@company.com', dept: '前端开发组', status: 'active', isExternal: false, models: ['kimi-k2-thinking-turbo', 'qwen3-coder-480b-a35b-instruct', 'deepseek-v3.2'], quota: 500 },
  { id: 2, name: '李华', surname: '李', email: 'lihua@company.com', dept: '产品经理组', status: 'active', isExternal: false, models: ['kimi-k2-thinking-turbo', 'qwen3-coder-480b-a35b-instruct'], quota: 300 },
  { id: 3, name: '王芳', surname: '王', email: 'wangfang@external.com', dept: '', status: 'active', isExternal: true, models: ['kimi-k2-thinking-turbo', 'qwen3-coder-480b-a35b-instruct'], quota: 200 },
  { id: 4, name: '陈强', surname: '陈', email: 'chenqiang@company.com', dept: '研发部', status: 'disabled', isExternal: false, models: ['kimi-k2-thinking-turbo', 'qwen3-coder-480b-a35b-instruct'], quota: 0 },
  { id: 5, name: '刘洋', surname: '刘', email: 'liuyang@external.com', dept: '', status: 'inactive', isExternal: true, models: [], quota: 100 },
];

const avatarColors: Record<string, string> = {
  '张': 'bg-blue-500',
  '李': 'bg-emerald-500',
  '王': 'bg-blue-600',
  '陈': 'bg-blue-500',
  '刘': 'bg-amber-500',
};

const statusConfig = {
  active: { label: '正常', className: 'bg-green-50 text-green-600 border-green-200' },
  disabled: { label: '禁用', className: 'bg-red-50 text-red-600 border-red-200' },
  inactive: { label: '未激活', className: 'bg-orange-50 text-orange-600 border-orange-200' },
};

interface OrgNode {
  id: string;
  name: string;
  members: number;
  models: string[];
  quota: number;
  children?: OrgNode[];
}

const initialOrgTree: OrgNode[] = [
  {
    id: 'tech', name: '技术中心', members: 45, models: ['kimi-k2-thinking-turbo', 'qwen3-coder-480b-a35b-instruct', 'deepseek-v3.2'], quota: 20000, children: [
      { id: 'frontend', name: '前端开发组', members: 12, models: ['kimi-k2-thinking-turbo', 'qwen3-coder-480b-a35b-instruct'], quota: 5000 },
      {
        id: 'backend', name: '后端开发组', members: 18, models: ['kimi-k2-thinking-turbo', 'qwen3-coder-480b-a35b-instruct', 'deepseek-v3.2'], quota: 8000, children: [
          { id: 'java', name: 'Java 小组', members: 8, models: ['kimi-k2-thinking-turbo'], quota: 3000 },
          { id: 'go', name: 'Go 小组', members: 10, models: ['qwen3-coder-480b-a35b-instruct', 'deepseek-v3.2'], quota: 4000 },
        ]
      },
      { id: 'devops', name: 'DevOps 组', members: 8, models: ['kimi-k2-thinking-turbo'], quota: 3000 },
    ]
  },
  { id: 'product', name: '产品设计部', members: 20, models: ['gpt-4o', 'claude-3.5-sonnet'], quota: 8000 },
  { id: 'market', name: '市场运营部', members: 15, models: ['kimi-k2-turbo-preview'], quota: 5000 },
];

const orgModels = [
  { id: 'kimi', name: 'Kimi', provider: 'Moonshot' },
  { id: 'qwen', name: 'Qwen 2.5', provider: 'Alibaba' },
  { id: 'deepseek', name: 'DeepSeek V3', provider: 'DeepSeek' },
];

interface BatchMember {
  name: string;
  email: string;
  status: 'success' | 'error';
  error?: string;
}

const AddMemberModal: React.FC<{ onClose: () => void; onAdd: (name: string, email: string, models: string[], quota: number) => void; existingMembers: MemberData[] }> = ({ onClose, onAdd, existingMembers }) => {
  const { planMode } = usePlanMode();
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quota, setQuota] = useState<string>('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modelSearch, setModelSearch] = useState('');
  const [modelTypeFilter, setModelTypeFilter] = useState<string>('');
  const [batchMembers, setBatchMembers] = useState<BatchMember[]>([]);
  const [batchError, setBatchError] = useState('');

  const toggleModel = (id: string) => {
    setSelectedModels(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const downloadTemplate = () => {
    const csv = 'Name,Email\n示例姓名,example@example.com';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '成员导入模板.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateAndProcessBatch = (rawMembers: Array<{ name: string; email: string }>) => {
    const results: BatchMember[] = [];
    const seenEmails = new Set<string>();
    const existingEmails = new Set(existingMembers.map(m => m.email.toLowerCase()));

    rawMembers.forEach((member) => {
      const emailLower = member.email.toLowerCase();

      if (!member.name || !member.email) {
        results.push({ name: member.name || 'N/A', email: member.email || 'N/A', status: 'error', error: '姓名或邮箱为空' });
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
        results.push({ name: member.name, email: member.email, status: 'error', error: '邮箱格式无效' });
        return;
      }

      if (seenEmails.has(emailLower)) {
        results.push({ name: member.name, email: member.email, status: 'error', error: '本次导入中邮箱重复' });
        return;
      }

      if (existingEmails.has(emailLower)) {
        results.push({ name: member.name, email: member.email, status: 'error', error: '系统中已存在该邮箱成员' });
        return;
      }

      seenEmails.add(emailLower);
      results.push({ name: member.name, email: member.email, status: 'success' });
    });

    return results;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split('\n');

        if (lines.length < 2) {
          setBatchError('CSV 文件至少需要包含标题行和一条数据行');
          return;
        }

        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIdx = header.indexOf('name');
        const emailIdx = header.indexOf('email');

        if (nameIdx === -1 || emailIdx === -1) {
          setBatchError('CSV 文件必须包含 Name 和 Email 列');
          return;
        }

        const rawData: Array<{ name: string; email: string }> = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const fields = line.split(',');
          const memberName = fields[nameIdx]?.trim();
          const memberEmail = fields[emailIdx]?.trim();

          if (memberName && memberEmail) {
            rawData.push({ name: memberName, email: memberEmail });
          }
        }

        if (rawData.length === 0) {
          setBatchError('未找到有效的成员数据');
          return;
        }

        const validatedMembers = validateAndProcessBatch(rawData);
        setBatchMembers(validatedMembers);
        setBatchError('');
      } catch (err) {
        setBatchError('文件解析失败，请确保是标准 CSV 格式');
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const handleBatchAdd = () => {
    const successMembers = batchMembers.filter(m => m.status === 'success');
    if (successMembers.length === 0) return;
    const quotaNum = Number(quota) || 0;
    successMembers.forEach(item => onAdd(item.name, item.email, selectedModels, quotaNum));
    setBatchMembers([]);
    onClose();
  };

  const modelTypes = Array.from(new Set(availableModels.map(m => m.type)));
  const filteredModels = availableModels.filter(m =>
    (!modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase())) &&
    (!modelTypeFilter || m.type === modelTypeFilter)
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-5 border-b border-slate-200 z-10 rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">添加外部成员</h3>
              <p className="text-sm text-slate-500 mt-0.5">添加后，系统将自动发送访问密钥至成员邮箱</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 border-b border-slate-200 -mx-6 px-6">
            <button
              onClick={() => { setMode('single'); setBatchError(''); setBatchMembers([]); }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'single' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              单个添加
            </button>
            <button
              onClick={() => { setMode('batch'); setBatchError(''); }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'batch' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              批量导入
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {mode === 'single' ? (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入成员姓名"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入成员邮箱"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </>
          ) : (
            <div>
              <div className="space-y-3 mb-4">
                <div>
                  <button
                    onClick={downloadTemplate}
                    className="text-sm text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    下载导入模板
                  </button>
                </div>
                <label className="flex items-center justify-center px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className="text-sm text-slate-600 font-medium">点击选择 CSV 文件或拖拽上传</div>
                    <div className="text-xs text-slate-400 mt-1">支持 CSV 格式，包含姓名和邮箱列</div>
                  </div>
                </label>
                {batchError && (
                  <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {batchError}
                  </div>
                )}
                {batchMembers.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <div className="text-sm font-medium text-slate-900">
                        导入结果：
                        <span className="text-green-600 ml-2">成功 {batchMembers.filter(m => m.status === 'success').length}</span>
                        {batchMembers.filter(m => m.status === 'error').length > 0 && (
                          <span className="text-red-600 ml-2">失败 {batchMembers.filter(m => m.status === 'error').length}</span>
                        )}
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                      {batchMembers.map((item, idx) => (
                        <div key={idx} className={`px-4 py-3 flex items-start justify-between ${item.status === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
                          <div className="text-sm flex-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-green-600' : 'bg-red-600'}`} />
                              <span className="font-medium text-slate-900">{item.name}</span>
                            </div>
                            <div className="text-xs text-slate-500 ml-4">{item.email}</div>
                            {item.error && (
                              <div className="text-xs text-red-600 ml-4 mt-1">{item.error}</div>
                            )}
                          </div>
                          {item.status === 'error' && (
                            <button
                              onClick={() => setBatchMembers(batchMembers.filter((_, i) => i !== idx))}
                              className="text-red-400 hover:text-red-600 ml-2 shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              月度配额 <span className="text-xs text-slate-400 font-normal">{getQuotaPlaceholder(planMode).split('（')[1]}</span>
            </label>
            <input
              type="number"
              min="0"
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              placeholder={getQuotaPlaceholder(planMode)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-900">可用模型</span>
              <span className="text-xs text-slate-400">（留空表示使用默认配置）</span>
            </div>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder="按模型名称筛选..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <select
                value={modelTypeFilter}
                onChange={(e) => setModelTypeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 cursor-pointer appearance-none bg-white"
              >
                <option value="">全部类型</option>
                {modelTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {filteredModels.map(m => (
                <label key={m.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(m.id)}
                      onChange={() => toggleModel(m.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                    />
                    <span className="text-sm text-slate-700">{m.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 border border-slate-200 px-2 py-0.5 rounded">{m.type}</span>
                </label>
              ))}
              {filteredModels.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-400">
                  未找到匹配的模型
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            取消
          </button>
          {mode === 'single' ? (
            <button
              onClick={() => { if (name && email) onAdd(name, email, selectedModels, Number(quota) || 0); onClose(); }}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              发送邀请
            </button>
          ) : (
            <button
              onClick={handleBatchAdd}
              disabled={batchMembers.filter(m => m.status === 'success').length === 0}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              批量发送邀请 ({batchMembers.filter(m => m.status === 'success').length})
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const EditMemberModal: React.FC<{ member: MemberData; onClose: () => void; onSave: (m: MemberData) => void }> = ({ member, onClose, onSave }) => {
  const { planMode } = usePlanMode();
  const [name, setName] = useState(member.name);
  const [email] = useState(member.email);
  const [quota, setQuota] = useState<string>(String(member.quota ?? 0));
  const [selectedModels, setSelectedModels] = useState<string[]>(member.models);
  const [modelSearch, setModelSearch] = useState('');
  const [modelTypeFilter, setModelTypeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const modelsPerPage = 10;

  const toggleModel = (id: string) => {
    if (orgInheritedModels.includes(id)) return;
    setSelectedModels(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const modelTypes = Array.from(new Set(availableModels.map(m => m.type)));
  const filteredModels = availableModels.filter(m =>
    (!modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase())) &&
    (!modelTypeFilter || m.type === modelTypeFilter)
  );

  const totalPages = Math.ceil(filteredModels.length / modelsPerPage);
  const startIdx = (currentPage - 1) * modelsPerPage;
  const endIdx = startIdx + modelsPerPage;
  const paginatedModels = filteredModels.slice(startIdx, endIdx);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-5 border-b border-slate-200 flex items-center justify-between z-10 rounded-t-xl">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">编辑成员信息</h3>
            <p className="text-sm text-slate-500 mt-0.5">修改成员的基本信息和可用模型配置</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">邮箱</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              月度配额 <span className="text-xs text-slate-400 font-normal">{getQuotaPlaceholder(planMode).split('（')[1]}</span>
            </label>
            <input
              type="number"
              min="0"
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex flex-col h-96">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-900">可用模型</span>
            </div>

            <div className="flex items-start gap-1.5 mb-4">
              <Lock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <span className="text-xs text-slate-500">带有"组织继承"标记的模型由组织统一配置，无法在成员管理中取消</span>
            </div>

            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => {
                  setModelSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="按模型名称筛选..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <select
                value={modelTypeFilter}
                onChange={(e) => {
                  setModelTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 cursor-pointer appearance-none bg-white"
              >
                <option value="">全部类型</option>
                {modelTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-y-auto flex-1 mb-3">
              {paginatedModels.map(m => {
                const isInherited = orgInheritedModels.includes(m.id);
                const isChecked = selectedModels.includes(m.id);
                return (
                  <label key={m.id} className={`flex items-center justify-between px-4 py-3 transition-colors ${isInherited ? 'bg-slate-50/50' : 'hover:bg-slate-50 cursor-pointer'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleModel(m.id)}
                        disabled={isInherited}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 disabled:opacity-50"
                      />
                      <span className={`text-sm ${isInherited ? 'text-slate-400' : 'text-slate-700'}`}>{m.name}</span>
                      {isInherited && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium border border-blue-200">
                          <Lock className="w-2.5 h-2.5" />
                          组织继承
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 border border-slate-200 px-2 py-0.5 rounded">{m.type}</span>
                  </label>
                );
              })}
              {filteredModels.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-400">
                  未找到匹配的模型
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-1">
                <div className="text-xs text-slate-500">
                  共 {filteredModels.length} 个模型，第 {currentPage}/{totalPages} 页
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            取消
          </button>
          <button
            onClick={() => onSave({ ...member, name, models: selectedModels, quota: Number(quota) || 0 })}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const OrgTreeNode: React.FC<{ node: OrgNode; depth: number; selected: string | null; onSelect: (id: string) => void; searchTerm: string; planMode: 'exclusive' | 'shared' }> = ({ node, depth, selected, onSelect, searchTerm, planMode }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selected === node.id;

  if (searchTerm && !node.name.includes(searchTerm)) {
    const childMatch = node.children?.some(c => c.name.includes(searchTerm) || c.children?.some(gc => gc.name.includes(searchTerm)));
    if (!childMatch) return null;
  }

  const modelNames = node.models.map(id => availableModels.find(am => am.id === id)?.name || id);

  return (
    <div>
      <div
        className={`flex items-center justify-between py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hasChildren ? (
            <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="text-slate-400 hover:text-slate-600 shrink-0">
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}
          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 shrink-0" onClick={(e) => e.stopPropagation()} />
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className={`text-sm shrink-0 ${isSelected ? 'text-blue-600 font-medium' : 'text-slate-700'}`}>{node.name}</span>
          {modelNames.length > 0 && (
            <div className="relative group flex items-center gap-1 ml-2 overflow-hidden">
              {modelNames.slice(0, 2).map((n, i) => (
                <span key={i} className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded border border-slate-200 whitespace-nowrap">{n}</span>
              ))}
              {modelNames.length > 2 && (
                <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[11px] rounded border border-slate-200 cursor-help">+{modelNames.length - 2}</span>
              )}
              {modelNames.length > 2 && (
                <div className="invisible group-hover:visible absolute top-full left-0 mt-1 bg-slate-900 text-white text-xs rounded py-1.5 px-2.5 whitespace-nowrap z-50 pointer-events-none">
                  {modelNames.join('、')}
                  <div className="absolute bottom-full left-2 -mb-1 w-0 h-0 border-3 border-transparent border-b-slate-900" />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
          <span className="text-slate-600">
            {node.quota > 0 ? (
              <>
                {node.quota.toLocaleString()} {planMode === 'exclusive' ? '元' : '积分'}/月
              </>
            ) : (
              '不限'
            )}
          </span>
          <div className="flex items-center gap-1 text-slate-400">
            <Users className="w-3.5 h-3.5" />
            {node.members}人
          </div>
        </div>
      </div>
      {expanded && hasChildren && node.children!.map(child => (
        <OrgTreeNode key={child.id} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} searchTerm={searchTerm} planMode={planMode} />
      ))}
    </div>
  );
};

const MembersTab: React.FC = () => {
  const { planMode } = usePlanMode();
  const [members, setMembers] = useState(initialMembers);
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberData | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null);
  const [modelFilter, setModelFilter] = useState('all');

  const filtered = members.filter(m => {
    const nameMatch = !nameFilter || m.name.includes(nameFilter);
    const statusMatch = statusFilter === 'all' || m.status === statusFilter;
    const modelMatch = modelFilter === 'all' || m.models.includes(modelFilter);
    return nameMatch && statusMatch && modelMatch;
  });

  const handleAdd = (name: string, email: string, models: string[], quota: number) => {
    const newMember: MemberData = {
      id: Date.now(),
      name,
      surname: name[0],
      email,
      dept: '',
      status: 'inactive',
      isExternal: true,
      models: models.length > 0 ? models : [...orgInheritedModels],
      quota,
    };
    setMembers([...members, newMember]);
    setShowAddModal(false);
  };

  const handleSave = (updated: MemberData) => {
    setMembers(members.map(m => m.id === updated.id ? updated : m));
    setEditingMember(null);
  };

  const handleDelete = (id: number) => {
    setMembers(members.filter(m => m.id !== id));
    setDeletingMemberId(null);
  };

  const toggleStatus = (id: number) => {
    setMembers(members.map(m => {
      if (m.id !== id) return m;
      return { ...m, status: m.status === 'disabled' ? 'active' : 'disabled' } as MemberData;
    }));
  };

  const resetFilters = () => {
    setNameFilter('');
    setStatusFilter('all');
    setModelFilter('all');
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">姓名:</span>
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="输入姓名"
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">状态:</span>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
            >
              <option value="all">全部</option>
              <option value="active">正常</option>
              <option value="disabled">禁用</option>
              <option value="inactive">未激活</option>
            </select>
            <ChevronDown className="absolute right-2 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">可用模型:</span>
          <div className="relative">
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer min-w-[180px]"
            >
              <option value="all">全部模型</option>
              {availableModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex-1" />
        <button onClick={resetFilters} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <RotateCcw className="w-3.5 h-3.5" />
          重置
        </button>
        <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <UserPlus className="w-3.5 h-3.5" />
          添加成员
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 text-xs font-medium text-slate-500">用户</th>
            <th className="text-left py-3 text-xs font-medium text-slate-500">部门</th>
            <th className="text-left py-3 text-xs font-medium text-slate-500">可用模型</th>
            <th className="text-right py-3 text-xs font-medium text-slate-500 pr-4">月度配额</th>
            <th className="text-center py-3 text-xs font-medium text-slate-500">状态</th>
            <th className="text-right py-3 text-xs font-medium text-slate-500">操作</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(m => {
            const sc = statusConfig[m.status];
            const modelNames = m.models.map(id => availableModels.find(am => am.id === id)?.name || id);
            return (
              <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-full ${avatarColors[m.surname] || 'bg-blue-500'} text-white text-sm flex items-center justify-center font-medium`}>
                      {m.surname}
                    </span>
                    <div>
                      <div className="font-medium text-slate-900">{m.name}</div>
                      <div className="text-xs text-blue-500">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-slate-600">{m.dept || '-'}</td>
                <td className="py-4 text-slate-600">
                  {modelNames.length === 0 ? (
                    <span className="text-xs text-slate-400">使用默认配置</span>
                  ) : (
                    <div className="relative group inline-block">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {modelNames.slice(0, 2).map((n, i) => (
                          <span key={i} className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">{n}</span>
                        ))}
                        {modelNames.length > 2 && (
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200 cursor-help">+{modelNames.length - 2}</span>
                        )}
                      </div>
                      {modelNames.length > 2 && (
                        <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 bg-slate-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-50 pointer-events-none">
                          {modelNames.join('、')}
                          <div className="absolute top-full left-2 -mt-1 w-0 h-0 border-4 border-transparent border-t-slate-900" />
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="py-4 text-right pr-4 text-slate-700">
                  {getQuotaLabel(m.quota, planMode) === '不限' ? (
                    <span className="text-xs text-slate-400">不限</span>
                  ) : (
                    <span className="font-medium">{getQuotaLabel(m.quota, planMode)}</span>
                  )}
                </td>
                <td className="py-4 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.className}`}>
                    {sc.label}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center gap-3 justify-end text-xs">
                    <button
                      onClick={() => toggleStatus(m.id)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {m.status === 'disabled' ? '启用' : '禁用'}
                    </button>
                    <span className="text-slate-200">|</span>
                    <button onClick={() => setEditingMember(m)} className="text-blue-600 hover:text-blue-700 transition-colors">
                      编辑
                    </button>
                    {m.isExternal && (
                      <>
                        <span className="text-slate-200">|</span>
                        <button className="text-blue-600 hover:text-blue-700 transition-colors">重发秘钥</button>
                        <span className="text-slate-200">|</span>
                        <button
                          onClick={() => setDeletingMemberId(m.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          删除
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} existingMembers={members} />}
      {editingMember && <EditMemberModal member={editingMember} onClose={() => setEditingMember(null)} onSave={handleSave} />}
      {deletingMemberId !== null && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeletingMemberId(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">删除成员</h3>
              <button onClick={() => setDeletingMemberId(null)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600">
                确定要删除成员 <span className="font-semibold text-slate-900">{members.find(m => m.id === deletingMemberId)?.name}</span> 吗？此操作不可撤销。
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setDeletingMemberId(null)}
                className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deletingMemberId)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const getQuotaLabel = (quota: number, planMode: 'exclusive' | 'shared'): string => {
  if (quota <= 0) return '不限';
  const unit = planMode === 'exclusive' ? '元' : '积分';
  return `${quota} ${unit}`;
};

const getQuotaPlaceholder = (planMode: 'exclusive' | 'shared'): string => {
  const unit = planMode === 'exclusive' ? '元' : '积分';
  return `请输入月度配额（单位：${unit}，0 表示不限）`;
};

const findOrgNode = (nodes: OrgNode[], id: string): OrgNode | null => {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findOrgNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
};

const updateOrgNode = (nodes: OrgNode[], id: string, updater: (n: OrgNode) => OrgNode): OrgNode[] => {
  return nodes.map(n => {
    if (n.id === id) return updater(n);
    if (n.children) return { ...n, children: updateOrgNode(n.children, id, updater) };
    return n;
  });
};

const OrgTab: React.FC = () => {
  const { planMode } = usePlanMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [orgTree, setOrgTree] = useState<OrgNode[]>(initialOrgTree);
  const [modelSearch, setModelSearch] = useState('');
  const [modelTypeFilter, setModelTypeFilter] = useState<string>('');

  const currentNode = selectedOrg ? findOrgNode(orgTree, selectedOrg) : null;

  const toggleOrgModel = (id: string) => {
    if (!selectedOrg) return;
    setOrgTree(prev => updateOrgNode(prev, selectedOrg, n => ({
      ...n,
      models: n.models.includes(id) ? n.models.filter(m => m !== id) : [...n.models, id],
    })));
  };

  const setOrgQuota = (value: string) => {
    if (!selectedOrg) return;
    const num = Number(value) || 0;
    setOrgTree(prev => updateOrgNode(prev, selectedOrg, n => ({ ...n, quota: num })));
  };

  const modelTypes = Array.from(new Set(availableModels.map(m => m.type)));
  const filteredModels = availableModels.filter(m =>
    (!modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase())) &&
    (!modelTypeFilter || m.type === modelTypeFilter)
  );

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="text-blue-500">上次同步: 2026/1/6 11:18:46 · 每日 0:00、12:00 自动同步</span>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            立即同步
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="按部门名称检索..."
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              全选
            </button>
          </div>

          <div className="flex items-center justify-between px-2 py-2 border-b border-slate-200 mb-1 text-xs font-medium text-slate-500">
            <span>部门名称</span>
            <div className="flex items-center gap-4">
              <span className="w-28 text-right">月度配额</span>
              <span className="w-16 text-right">成员数</span>
            </div>
          </div>

          <div className="space-y-0.5">
            {orgTree.map(node => (
              <OrgTreeNode key={node.id} node={node} depth={0} selected={selectedOrg} onSelect={setSelectedOrg} searchTerm={searchTerm} planMode={planMode} />
            ))}
          </div>
        </div>

        <div className="w-96 bg-white rounded-lg border border-slate-200 p-5 self-start">
          <h4 className="font-bold text-slate-900 text-sm mb-1">部门配置</h4>
          {!currentNode ? (
            <p className="text-xs text-slate-400 mt-1">请在左侧选择要配置的部门</p>
          ) : (
            <div className="mt-4 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">AI 服务</div>
                  <div className="text-xs text-slate-400">{aiEnabled ? '已开通' : '未开通'}</div>
                </div>
                <div
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${aiEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${aiEnabled ? 'left-6' : 'left-1'}`} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  月度配额 <span className="text-xs text-slate-400 font-normal">{getQuotaPlaceholder(planMode).split('（')[1]}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentNode.quota}
                  onChange={(e) => setOrgQuota(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-bold text-slate-900">可用模型</span>
                  <span className="text-xs text-slate-400">已选 {currentNode.models.length}</span>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="搜索模型..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <select
                    value={modelTypeFilter}
                    onChange={(e) => setModelTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 cursor-pointer appearance-none bg-white"
                  >
                    <option value="">全部</option>
                    {modelTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {filteredModels.map(m => (
                    <label key={m.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={currentNode.models.includes(m.id)}
                          onChange={() => toggleOrgModel(m.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                        />
                        <span className="text-sm text-slate-700">{m.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 border border-slate-200 px-2 py-0.5 rounded">{m.type}</span>
                    </label>
                  ))}
                  {filteredModels.length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-400">未找到匹配的模型</div>
                  )}
                </div>
              </div>

              <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                保存配置
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MembersView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'org'>('members');

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="text-xs text-slate-500 mb-2">订阅席位使用情况</div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '10%' }} />
          </div>
          <span className="text-sm font-medium text-slate-700">5 / 50 人</span>
          <button className="px-4 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap">
            订阅管理 / 扩容
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex gap-6 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all px-1 ${activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
          >
            成员管理
          </button>
          <button
            onClick={() => setActiveTab('org')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all px-1 ${activeTab === 'org' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
          >
            组织管理
          </button>
        </div>

        {activeTab === 'members' ? <MembersTab /> : <OrgTab />}
      </div>
    </div>
  );
};

export default MembersView;
