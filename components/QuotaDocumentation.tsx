import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

const QuotaDocumentation: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    concepts: false,
    unified: false,
    account: false,
    department: false,
    member: false,
    hierarchy: false,
    monitoring: false,
    faq: false,
    bestPractices: false,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CollapsibleSection: React.FC<{
    id: string;
    title: string;
    children: React.ReactNode;
  }> = ({ id, title, children }) => {
    const isExpanded = expandedSections[id];
    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors">
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-6 py-4 flex items-center gap-3 hover:bg-slate-50/50 transition-colors"
        >
          <div className={`text-slate-600 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          <h3 className="font-bold text-slate-900 text-lg text-left flex-1">{title}</h3>
        </button>
        {isExpanded && (
          <div className="px-6 py-6 border-t border-slate-200 bg-slate-50/30 space-y-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  const CodeBlock: React.FC<{ code: string; language?: string; id?: string }> = ({ code, language = 'json', id = '' }) => (
    <div className="relative group">
      <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => id && copyToClipboard(code, id)}
        className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors opacity-0 group-hover:opacity-100"
        title="复制代码"
      >
        {copiedId === id ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-slate-300" />
        )}
      </button>
    </div>
  );

  const Table: React.FC<{
    headers: string[];
    rows: (string | React.ReactNode)[][];
  }> = ({ headers, rows }) => (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-bold text-slate-900">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">配额管理完全指南</h1>
        <p className="text-lg text-slate-600">
          了解如何通过精细化配额管理，有效控制 Token 消费成本，保障企业预算健康。
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '配额维度', value: '4 层级' },
          { label: '预警机制', value: '实时监控' },
          { label: '配额应用', value: '立即生效' },
          { label: '支持部门级', value: '无限深度' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 font-medium mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        {/* Overview */}
        <CollapsibleSection id="overview" title="概述">
          <div className="space-y-4 text-slate-700 leading-relaxed">
            <p>
              配额管理功能提供了一套完整的 Token 消费控制体系，帮助企业组织在不同层级（账户、部门、成员）进行精细化预算管理。通过灵活的配额设置和实时预警机制，确保企业成本可控，资源配置科学合理。
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-semibold text-blue-900 mb-2">核心特性</div>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                  <span><strong>多层级配额管理</strong>：支持账户、部门、成员三个维度的灵活配置</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                  <span><strong>智能优先级判断</strong>：自动应用最严格的配额限制</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                  <span><strong>实时监控预警</strong>：使用率达到阈值时即时通知</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                  <span><strong>即时生效</strong>：配额修改立即应用于新的 Token 消费</span>
                </li>
              </ul>
            </div>
          </div>
        </CollapsibleSection>

        {/* Core Concepts */}
        <CollapsibleSection id="concepts" title="核心概念">
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">价格计算标准</h4>
              <p className="text-slate-700">
                配额系统中的价格展示遵循以下计算逻辑：
              </p>
              <div className="bg-slate-100 p-4 rounded-lg font-mono text-sm text-slate-900">
                配额展示价格 = Token 官网列表价格 × 配额消费折扣
              </div>
              <p className="text-sm text-slate-600 mt-3">
                <strong>重要说明：</strong> 此价格仅用于配额额度显示，不代表实际账单价格。账单结算价格以合同约定为准。
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">关键术语</h4>
              <Table
                headers={['术语', '含义', '说明']}
                rows={[
                  ['月度配额', '企业在一个自然月内的最大 Token 消费预算', '用元（¥）表示'],
                  ['使用率', '已消费金额 / 月度配额', '超过 80% 时触发预警'],
                  ['预警阈值', '使用率达到此百分比时触发通知', '默认 80%，范围 50%-95%'],
                  ['配额消费折扣', '官网列表价计算配额展示价的系数', '例：4.5 表示 4.5 折'],
                  ['结算周期', '账单统计周期', '影响使用量准确性，可能轻微超出'],
                ]}
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="font-semibold text-orange-900 mb-2">重要提示</div>
              <ul className="space-y-2 text-sm text-orange-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">⚠</span>
                  <span>受结算周期影响，使用量可能会出现轻微超出配额的情况，但不会强制停止服务。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">⚠</span>
                  <span>修改配额后立即生效，仅对新增的 Token 消费计数生效。</span>
                </li>
              </ul>
            </div>
          </div>
        </CollapsibleSection>

        {/* Unified Configuration */}
        <CollapsibleSection id="unified" title="配额管理统一配置">
          <div className="space-y-6">
            <p className="text-slate-700">
              统一配置模块用于全局设置预警规则和通知方式，适用于所有配额维度。这些设置是系统级别的，影响整个账户的配额管理行为。
            </p>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">配置项说明</h4>
              <Table
                headers={['配置项', '说明', '默认值', '范围']}
                rows={[
                  ['预警阈值', '当配额使用率达到此百分比时触发预警', '80%', '50% - 95%'],
                  ['配额消费折扣', '计算配额展示价格时应用的折扣系数', '10 折', '0.1 - 10'],
                  ['预警消息接收人', '接收预警通知的联系人', '无', '可多选'],
                ]}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-base">操作步骤</h4>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                  <div className="font-semibold text-slate-900 mb-2">第 1 步：设置预警阈值</div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• 进入「配额管理统一配置」模块</li>
                    <li>• 在「预警阈值」输入框中输入百分比数值（如 80）</li>
                    <li>• 建议范围：70% - 80%，可根据实际需求调整</li>
                    <li>• 阈值设置后，系统将在使用率达到该比例时自动触发预警</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                  <div className="font-semibold text-slate-900 mb-2">第 2 步：设置配额消费折扣</div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• 在「配额消费折扣」输入框中输入折扣系数</li>
                    <li>• 示例：输入 4.5 表示 4.5 折；输入 10 表示原价</li>
                    <li>• 此折扣仅用于计算配额展示价格</li>
                    <li>• 所有配额都将应用此统一的折扣系数</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                  <div className="font-semibold text-slate-900 mb-2">第 3 步：配置预警接收人</div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• 点击「选择联系人」下拉框</li>
                    <li>• 在弹出的联系人列表中勾选需要接收通知的人员</li>
                    <li>• 支持多选，可添加管理员、财务、部门负责人等</li>
                    <li>• 预警触发时，系统将向所有已选联系人发送通知</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-600 bg-green-50 px-4 py-3 rounded">
                  <div className="font-semibold text-slate-900 mb-2">第 4 步：保存配置</div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• 完成以上配置后，点击「保存」按钮</li>
                    <li>• 系统将立即应用新配置</li>
                    <li>• 新的预警规则和通知方式生效</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-lg">
              <div className="text-sm font-mono text-slate-900 space-y-2">
                <div><span className="text-slate-600">预警阈值</span> → <span className="font-bold">80%</span></div>
                <div><span className="text-slate-600">配额消费折扣</span> → <span className="font-bold">4.5 折</span></div>
                <div><span className="text-slate-600">接收人</span> → <span className="font-bold">张三, 李四, 王五</span></div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Account Configuration */}
        <CollapsibleSection id="account" title="账号维度配置">
          <div className="space-y-6">
            <p className="text-slate-700">
              账号维度配置为整个企业账户设置 Token 消费总预算，是配额管理的最高层级。所有未在部门或成员级别设置的配额消费都将受此账户总预算约束。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">功能说明</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">启用/禁用</span>
                  <span>通过开关控制是否启用账号级配额限制。禁用后，成员的消费不受账户总预算限制。</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">月度总预算</span>
                  <span>设置账号在一个自然月内的最大消费额度，单位为元（¥）。支持数字输入。</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">使用情况</span>
                  <span>实时显示本月已使用金额、剩余预算和使用率百分比。使用率达到预警阈值时显示橙色警告。</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">操作步骤</h4>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-2">第 1 步：启用账号配额管理</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 定位到「账号维度配置」模块</li>
                  <li>• 点击「启用账号配额管理」开关</li>
                  <li>• 开关变为蓝色表示启用成功</li>
                  <li>• 禁用时，企业所有成员的消费将不受账户总预算限制</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-2">第 2 步：设置月度总预算</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 在「月度总预算」输入框输入预算金额</li>
                  <li>• 只接受数字输入，单位为元（¥）</li>
                  <li>• 示例：输入 50000 表示月度预算为 5 万元</li>
                  <li>• 建议根据企业规模和 Token 消费历史数据设置合理预算</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-2">第 3 步：保存配置</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 点击「保存」按钮确认配置</li>
                  <li>• 系统即时应用新预算设置</li>
                  <li>• 新的配额限制对后续 Token 消费生效</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-600 bg-green-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-2">第 4 步：监控使用情况</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 系统实时显示「本月使用」金额和使用百分比</li>
                  <li>• 使用率 &lt; 80% 时，进度条显示蓝色，状态正常</li>
                  <li>• 使用率 ≥ 80% 时，进度条显示橙色，需要注意预算</li>
                  <li>• 预留足够空间以应对结算周期延迟带来的轻微超额</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-lg space-y-2">
              <div className="text-sm font-mono text-slate-900">
                <div><span className="text-slate-600">账户配额状态</span> → <span className="font-bold">启用</span></div>
                <div><span className="text-slate-600">月度总预算</span> → <span className="font-bold">¥50,000</span></div>
                <div><span className="text-slate-600">本月使用</span> → <span className="font-bold">¥32,500 (65%)</span></div>
                <div><span className="text-slate-600">剩余预算</span> → <span className="font-bold">¥17,500</span></div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Department Configuration */}
        <CollapsibleSection id="department" title="部门维度配置">
          <div className="space-y-6">
            <p className="text-slate-700">
              部门维度配置为组织内各部门设置独立的 Token 消费配额。支持多级部门结构，可以为不同规模和消费水平的部门灵活分配预算。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">部门结构支持</h4>
              <p className="text-sm text-slate-700 mb-3">系统支持三级部门结构，组织灵活性强：</p>
              <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm text-slate-700">
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-fit">一级部门</span>
                  <span>组织最高层级，如「技术中心」、「产品中心」、「市场中心」等</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-fit">二级部门</span>
                  <span>分支部门，如「研发一部」、「研发二部」、「架构部」等</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-fit">三级部门</span>
                  <span>具体工作组，如「前端组」、「后端组」、「测试组」等</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">操作步骤</h4>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-3">添加部门配额</div>
                <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
                  <li>点击「添加部门配置」按钮，打开部门选择对话框</li>
                  <li>在「选择部门」树形菜单中，展开相应部门节点</li>
                  <li>支持一级、二级、三级部门选择，菜单显示各部门的成员数量</li>
                  <li>选中目标部门后，在「月度配额」输入框中输入该部门的消费限额（元）</li>
                  <li>点击「添加」确认，部门配额生效</li>
                </ol>
              </div>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-3">查看部门配额</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 部门配额以表格形式展示，包含以下信息：</li>
                  <li>• <strong>部门名称（全路径）</strong>：显示完整的部门层级关系</li>
                  <li>• <strong>部门成员数</strong>：该部门包含的成员总数</li>
                  <li>• <strong>月度配额金额</strong>：配置的消费限额</li>
                  <li>• <strong>已使用金额</strong>：当月已消费的金额</li>
                  <li>• <strong>使用率进度条</strong>：可视化显示消费进度</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-3">编辑部门配额</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 在部门配额表的操作列，点击编辑图标（铅笔符号）</li>
                  <li>• 在弹出的编辑框中修改配额金额</li>
                  <li>• 修改立即生效，对后续消费计数有效</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-600 bg-red-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-3">删除部门配额</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 点击操作列的删除图标（垃圾桶符号）</li>
                  <li>• 确认删除操作（该操作不可撤销）</li>
                  <li>• 删除后，该部门的成员将改为使用账户级配额或个人配额</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-lg">
              <div className="text-sm font-mono text-slate-900 space-y-1">
                <div><span className="text-slate-600">部门</span> → <span className="font-bold">技术中心 / 研发一部 / 前端组</span></div>
                <div><span className="text-slate-600">成员数</span> → <span className="font-bold">8 人</span></div>
                <div><span className="text-slate-600">月度配额</span> → <span className="font-bold">¥8,000</span></div>
                <div><span className="text-slate-600">已使用</span> → <span className="font-bold">¥5,200 (65%)</span></div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Member Configuration */}
        <CollapsibleSection id="member" title="成员维度配置">
          <div className="space-y-6">
            <p className="text-slate-700">
              成员维度配置为组织内各个成员设置个人的 Token 消费配额。支持对不同角色、不同项目的成员设置差异化的消费限额，实现最精细的预算控制。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">功能说明</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">个人配额</span>
                  <span>限制单个成员的月度 Token 消费额度，优先级最高，即使超出部门和账户配额也会受此限制。</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">灵活管理</span>
                  <span>支持为不同成员设置完全不同的配额，可根据职位、项目重要性等灵活调整。</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">实时监控</span>
                  <span>显示每个成员的使用情况，支持搜索功能，方便快速查找和管理。</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">操作步骤</h4>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-3">添加成员配额</div>
                <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
                  <li>点击「添加成员配置」按钮，打开成员选择对话框</li>
                  <li>在搜索框中输入成员名称或邮箱地址，系统实时过滤匹配结果</li>
                  <li>从列表中点击选择目标成员（支持单选）</li>
                  <li>在「月度配额」输入框中输入该成员的消费限额（元）</li>
                  <li>点击「添加」确认，成员配额生效</li>
                </ol>
              </div>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-3">查看成员配额</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 成员配额以表格形式展示，包含以下信息：</li>
                  <li>• <strong>成员名称和邮箱</strong>：完整的成员身份信息</li>
                  <li>• <strong>所属部门</strong>：成员所在的组织部门</li>
                  <li>• <strong>月度配额金额</strong>：配置的消费限额</li>
                  <li>• <strong>已使用金额</strong>：当月该成员已消费的金额</li>
                  <li>• <strong>使用率进度条</strong>：可视化显示消费进度</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-3">搜索成员配额</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 使用表格上方的搜索框快速查找特定成员</li>
                  <li>• 支持按成员名称搜索（如「张三」）</li>
                  <li>• 支持按邮箱地址搜索（如「zhangsan@company.com」）</li>
                  <li>• 搜索实时生效，无需额外操作</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-3">编辑成员配额</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 在成员配额表的操作列，点击编辑图标（铅笔符号）</li>
                  <li>• 在弹出的编辑框中修改配额金额</li>
                  <li>• 修改立即生效，对该成员的后续消费计数有效</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-600 bg-red-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-3">删除成员配额</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 点击操作列的删除图标（垃圾桶符号）</li>
                  <li>• 确认删除操作（该操作不可撤销）</li>
                  <li>• 删除后，该成员将改为使用其所在部门的配额，或企业账户配额</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-lg">
              <div className="text-sm font-mono text-slate-900 space-y-1">
                <div><span className="text-slate-600">成员</span> → <span className="font-bold">张三</span> / <span className="font-bold">zhangsan@company.com</span></div>
                <div><span className="text-slate-600">部门</span> → <span className="font-bold">技术中心 / 研发一部</span></div>
                <div><span className="text-slate-600">月度配额</span> → <span className="font-bold">¥500</span></div>
                <div><span className="text-slate-600">已使用</span> → <span className="font-bold">¥320 (64%)</span></div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Hierarchy */}
        <CollapsibleSection id="hierarchy" title="配额层级关系与应用规则">
          <div className="space-y-6">
            <p className="text-slate-700">
              系统采用灵活的配额优先级规则。当成员在多个层级都有配额设置时，系统自动应用最严格的限制，确保预算控制的有效性。
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">优先级规则（从高到低）</h4>
              <div className="space-y-3">
                <div className="border-l-4 border-red-600 bg-red-50 px-4 py-3 rounded">
                  <div className="font-bold text-slate-900 mb-1">优先级 1：成员级配额（最高）</div>
                  <p className="text-sm text-slate-700">
                    如果成员有独立设置的个人配额，则直接使用成员配额限制，忽略部门和账户配额。
                  </p>
                </div>
                <div className="border-l-4 border-orange-600 bg-orange-50 px-4 py-3 rounded">
                  <div className="font-bold text-slate-900 mb-1">优先级 2：部门级配额</div>
                  <p className="text-sm text-slate-700">
                    成员无独立配额时，使用其所在部门的配额。部门配额限制整个部门的消费总额。
                  </p>
                </div>
                <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                  <div className="font-bold text-slate-900 mb-1">优先级 3：账户级配额（最低）</div>
                  <p className="text-sm text-slate-700">
                    部门和成员都无独立配额时，使用企业账户总预算。作为最后的安全保障。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">应用规则示例</h4>
              <Table
                headers={['场景', '成员配额', '部门配额', '账户配额', '应用结果']}
                rows={[
                  ['场景 A', '¥500', '¥8,000', '¥50,000', '使用成员配额 ¥500'],
                  ['场景 B', '无', '¥8,000', '¥50,000', '使用部门配额 ¥8,000'],
                  ['场景 C', '无', '无', '¥50,000', '使用账户配额 ¥50,000'],
                  ['场景 D', '无', '无', '禁用', '无配额限制（自由消费）'],
                ]}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-semibold text-blue-900 mb-3">实际应用流程图</div>
              <div className="bg-white p-4 rounded border border-blue-100 font-mono text-sm text-slate-700 space-y-2">
                <div>成员发起 Token 消费</div>
                <div className="text-center text-slate-400">↓</div>
                <div>检查：成员是否有独立配额？</div>
                <div className="ml-4">✓ 是 → 应用成员配额</div>
                <div className="ml-4">✗ 否 → 检查部门配额</div>
                <div className="text-center text-slate-400">↓</div>
                <div>检查：部门是否有配额设置？</div>
                <div className="ml-4">✓ 是 → 应用部门配额</div>
                <div className="ml-4">✗ 否 → 使用账户配额</div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Monitoring */}
        <CollapsibleSection id="monitoring" title="使用情况监控和预警机制">
          <div className="space-y-6">
            <p className="text-slate-700">
              系统提供实时监控和智能预警功能，帮助管理员及时了解配额使用状况，主动采取措施确保预算安全。
            </p>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">使用率显示</h4>
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="font-semibold text-slate-900 mb-2">进度条视觉表示</div>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p>系统采用颜色编码显示不同的使用状态：</p>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
                      </div>
                      <span className="font-mono">60% - 蓝色，状态正常</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: '85%' }} />
                      </div>
                      <span className="font-mono">85% - 橙色，接近上限</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900 mb-2">百分比标签</div>
                  <div className="space-y-1 text-sm text-slate-700">
                    <p>每个配额旁都显示使用百分比：</p>
                    <div className="font-mono">使用率 &lt; 80% → 显示蓝色背景标签「正常使用」</div>
                    <div className="font-mono">使用率 ≥ 80% → 显示橙色背景标签「接近上限」</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">预警通知机制</h4>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="font-semibold text-slate-900 mb-3">预警触发条件</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 当任何配额维度（账户、部门、成员）的使用率达到预设的预警阈值时</li>
                  <li>• 系统自动生成预警通知，包含以下信息：</li>
                  <li className="ml-4">- 预警对象：部门名称或成员名称</li>
                  <li className="ml-4">- 当前使用率：百分比和具体金额</li>
                  <li className="ml-4">- 剩余预算：还可消费的额度</li>
                  <li className="ml-4">- 预警时间：系统记录的通知发送时间</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-semibold text-slate-900 mb-3">预警接收</div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>• 预警消息将自动发送给统一配置中设置的所有接收人</li>
                  <li>• 接收人可以包括管理员、财务负责人、部门负责人等</li>
                  <li>• 支持多通道通知：邮件、短信、系统消息等（根据配置）</li>
                  <li>• 及时的通知确保管理人员能够快速响应，调整预算或优化消费</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">最佳监控实践</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-sm text-slate-700">
                <div className="flex gap-3">
                  <span className="font-bold">1. 定期检查</span>
                  <span>每周查看一次配额使用情况，及时发现异常消费</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold">2. 设置合理阈值</span>
                  <span>根据历史数据设置 70%-80% 的预警阈值，留出缓冲空间</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold">3. 保持通知畅通</span>
                  <span>确保管理人员邮箱和联系方式更新，及时接收预警消息</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold">4. 建立应急机制</span>
                  <span>预警触发后制定应对措施，如调整配额或优化消费</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* FAQ */}
        <CollapsibleSection id="faq" title="常见问题解答">
          <div className="space-y-4">
            <div className="border-l-4 border-slate-300 bg-slate-50 px-4 py-3 rounded">
              <div className="font-bold text-slate-900 mb-2">Q: 配额修改后何时生效？</div>
              <p className="text-sm text-slate-700">
                A: 配额修改后立即生效，仅对新的 Token 消费计数生效。历史消费数据保持不变。如果需要追溯调整历史数据，请联系技术支持。
              </p>
            </div>

            <div className="border-l-4 border-slate-300 bg-slate-50 px-4 py-3 rounded">
              <div className="font-bold text-slate-900 mb-2">Q: 如果使用量超出配额会怎样？</div>
              <p className="text-sm text-slate-700 mb-2">
                A: 配额超出的处理策略如下：
              </p>
              <ul className="text-sm text-slate-700 space-y-1 ml-4">
                <li>• 系统不会强制停止服务，确保业务连续性</li>
                <li>• 出于结算周期等原因可能轻微超出配额</li>
                <li>• 账单结算时按实际使用量和合同约定价格计费</li>
                <li>• 建议预留 10%-15% 的缓冲空间，应对周期延迟</li>
              </ul>
            </div>

            <div className="border-l-4 border-slate-300 bg-slate-50 px-4 py-3 rounded">
              <div className="font-bold text-slate-900 mb-2">Q: 显示的配额价格和账单价格一样吗？</div>
              <p className="text-sm text-slate-700">
                A: 不一样。配额展示价格 = 官网价格 × 折扣，仅用于额度显示。账单价格以合同约定的实际价格为准。两者可能存在差异，请以最终账单为准。
              </p>
            </div>

            <div className="border-l-4 border-slate-300 bg-slate-50 px-4 py-3 rounded">
              <div className="font-bold text-slate-900 mb-2">Q: 可以设置不同的折扣吗？</div>
              <p className="text-sm text-slate-700">
                A: 目前折扣是全局统一设置，对所有配额都适用。如果需要针对不同部门或成员设置差异化折扣，请联系销售团队讨论定制方案。
              </p>
            </div>

            <div className="border-l-4 border-slate-300 bg-slate-50 px-4 py-3 rounded">
              <div className="font-bold text-slate-900 mb-2">Q: 删除部门配额后会怎样？</div>
              <p className="text-sm text-slate-700">
                A: 删除部门配额后的效果：
              </p>
              <ul className="text-sm text-slate-700 space-y-1 ml-4">
                <li>• 该部门的成员将不再受部门级配额限制</li>
                <li>• 成员改为使用自己的个人配额（如果有设置）</li>
                <li>• 如果成员也没有个人配额，则使用企业账户配额</li>
              </ul>
            </div>

            <div className="border-l-4 border-slate-300 bg-slate-50 px-4 py-3 rounded">
              <div className="font-bold text-slate-900 mb-2">Q: 能否为部分成员单独设置更严格的限额？</div>
              <p className="text-sm text-slate-700">
                A: 完全可以。为成员设置的个人配额优先级最高，即使低于部门配额也会被严格执行。这样可以对敏感人员或特定项目进行更严格的控制。
              </p>
            </div>

            <div className="border-l-4 border-slate-300 bg-slate-50 px-4 py-3 rounded">
              <div className="font-bold text-slate-900 mb-2">Q: 删除成员配额后如何恢复？</div>
              <p className="text-sm text-slate-700">
                A: 删除操作不可撤销，但可以重新添加。删除后成员改为使用部门或账户配额。如需恢复具体配额金额，请保存好配额变更记录，或联系技术支持查看历史数据。
              </p>
            </div>

            <div className="border-l-4 border-slate-300 bg-slate-50 px-4 py-3 rounded">
              <div className="font-bold text-slate-900 mb-2">Q: 预警阈值是否可以实时调整？</div>
              <p className="text-sm text-slate-700">
                A: 可以。预警阈值在「配额管理统一配置」中随时修改。修改后立即生效，新的预警规则对后续使用适用。建议不要过于频繁地调整，保持相对稳定的阈值。
              </p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Best Practices */}
        <CollapsibleSection id="bestPractices" title="最佳实践建议">
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">部门配额设置原则</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-fit">1. 合理分配</span>
                  <span className="text-sm text-slate-700">根据各部门的实际需求和 Token 消费历史数据分配配额，避免过高或过低。</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-fit">2. 差异化管理</span>
                  <span className="text-sm text-slate-700">高频使用 AI 的部门（如研发）可设置较高配额；低频使用部门可设置较低配额。</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-fit">3. 定期审查</span>
                  <span className="text-sm text-slate-700">每月末检查部门配额使用情况，根据实际消费趋势调整下月配额。</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600 min-w-fit">4. 留出缓冲</span>
                  <span className="text-sm text-slate-700">设置配额时预留 10%-15% 的空间，应对不可预见的消费增长。</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">成员配额设置原则</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">按职位等级分配</div>
                  <div className="ml-4 space-y-1">
                    <div><strong>技术总监/架构师</strong> → 较高配额（如 ¥1,000-2,000）</div>
                    <div><strong>高级工程师</strong> → 中等配额（如 ¥500-1,000）</div>
                    <div><strong>初级工程师</strong> → 标准配额（如 ¥200-500）</div>
                    <div><strong>实习生</strong> → 较低配额（如 ¥50-200）</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">按项目重要性分配</div>
                  <div className="ml-4 space-y-1">
                    <div>• 核心项目成员 → 增加配额，确保项目进度</div>
                    <div>• 普通项目成员 → 标准配额</div>
                    <div>• 试验项目成员 → 可适当降低以控制成本</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">预警配置最佳实践</h4>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                <div className="flex gap-3">
                  <span className="font-bold text-orange-600 min-w-fit">阈值设置</span>
                  <span className="text-sm text-slate-700">建议设置在 70%-80% 之间，过低会频繁预警，过高则缺乏预警意义。</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-orange-600 min-w-fit">通知人员</span>
                  <span className="text-sm text-slate-700">必须包含：系统管理员、财务负责人；可选：部门负责人、成本中心主任。</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-orange-600 min-w-fit">应急流程</span>
                  <span className="text-sm text-slate-700">建立清晰的预警响应机制，规定谁来判断是否调整配额，以及如何快速决策。</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-orange-600 min-w-fit">通知验证</span>
                  <span className="text-sm text-slate-700">定期测试通知功能，确保接收人收到预警消息，及时调整联系方式。</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">定期维护清单</h4>
              <div className="bg-slate-100 rounded-lg p-4 space-y-2 text-sm font-mono text-slate-900">
                <div className="border-b pb-2">
                  <div className="font-bold mb-1">月末（配额管理周期）</div>
                  <div className="ml-4 space-y-1 text-slate-700">
                    <div>☐ 检查当月配额使用总体情况</div>
                    <div>☐ 分析超额或未充分利用的部门/成员</div>
                    <div>☐ 基于消费趋势规划下月配额</div>
                  </div>
                </div>
                <div className="border-b pb-2">
                  <div className="font-bold mb-1">季度末</div>
                  <div className="ml-4 space-y-1 text-slate-700">
                    <div>☐ 评估配额制度的有效性</div>
                    <div>☐ 检查预警机制是否正常运作</div>
                    <div>☐ 根据趋势调整部门级和成员级配额</div>
                  </div>
                </div>
                <div>
                  <div className="font-bold mb-1">任何时间</div>
                  <div className="ml-4 space-y-1 text-slate-700">
                    <div>☐ 员工离职后立即删除其配额设置</div>
                    <div>☐ 新员工入职后及时配置初始配额</div>
                    <div>☐ 部门调整时更新部门配额</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 rounded-lg p-6 mt-8">
        <div className="text-sm text-slate-600">
          <p className="font-semibold text-slate-900 mb-2">需要帮助？</p>
          <p>
            如有任何关于配额管理的问题或需要调整配额策略，请联系：
          </p>
          <div className="mt-2 space-y-1 ml-4">
            <p>📧 <strong>技术支持</strong>：support@company.com</p>
            <p>💰 <strong>财务管理</strong>：finance@company.com</p>
            <p>⚙️ <strong>系统管理员</strong>：admin@company.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotaDocumentation;
