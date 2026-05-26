import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Icons } from './components/ui/Icons';
import { DashboardOverview, UsageAnalytics, ModelManagement, MembersManagement, QuotaManagement, SecuritySettings, SystemSettings, ModelMetrics, SubscriptionManagement } from './components/ConsoleViews';
import CallLogs from './components/CallLogs';
import CliPageComponent from './components/CliPage';
import QuotaDocumentation from './components/QuotaDocumentation';
import { PlanModeProvider, usePlanMode, type PlanMode } from './context/PlanModeContext';

// --- Layout Components ---

const Sidebar: React.FC<{ collapsed: boolean, setCollapsed: (v: boolean) => void, currentView: string, setView: (v: string) => void }> = ({ collapsed, setCollapsed, currentView, setView }) => {
  const navigate = useNavigate();
  const { planMode } = usePlanMode();

  const allMenuItems = [
    { id: 'dashboard', label: '概览' },
    { type: 'divider', label: '数据统计' },
    { id: 'usage', label: '用量看板' },
    { id: 'logs', label: '调用明细' },
    { id: 'metrics', label: '模型指标' },
    { type: 'divider', label: '服务管理' },
    { id: 'subscription', label: '订阅管理/扩容' },
    { id: 'models', label: '模型管理' },
    { id: 'members', label: '组织成员' },
    { id: 'quota', label: '配额管理', exclusiveOnly: true },
    { id: 'security', label: 'IP 白名单' },
    { id: 'settings', label: '系统设置' },
  ];

  const menuItems = allMenuItems.filter(item => {
    if ('exclusiveOnly' in item && item.exclusiveOnly) {
      return planMode === 'exclusive';
    }
    return true;
  });

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="h-16 flex items-center justify-center border-b border-border/50 relative">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary no-underline hover:text-primary">
           {!collapsed && <span className="tracking-tight text-slate-900">KSGC <span className="text-xs font-normal text-slate-500 ml-1">智码云</span></span>}
        </Link>
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 bg-white border shadow-sm rounded-full p-0.5 text-slate-500 hover:text-primary transition-colors"
        >
          {collapsed ? <Icons.ChevronRight className="w-3 h-3" /> : <Icons.ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-1 scrollbar-hide">
        {menuItems.map((item, idx) => {
          if (item.type === 'divider') {
            return !collapsed ? (
              <div key={idx} className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase mt-2">
                {item.label}
              </div>
            ) : <div key={idx} className="h-4"></div>;
          }

          const isActive = currentView === item.id;
          return (
            <div key={item.id || idx} className="px-2">
              <button
                onClick={() => item.id && setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : ''}
              >
                {!collapsed && <span>{item.label}</span>}
              </button>
            </div>
          );
        })}
      </div>

    </aside>
  );
};

const PlanModeSwitch: React.FC = () => {
  const { planMode, setPlanMode } = usePlanMode();
  return (
    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
      <button
        onClick={() => setPlanMode('exclusive')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          planMode === 'exclusive'
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        专享版
      </button>
      <button
        onClick={() => setPlanMode('shared')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          planMode === 'shared'
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        共享版
      </button>
    </div>
  );
};

const Header: React.FC<{ title: string }> = ({ title }) => {
  return (
    <header className="h-16 bg-white border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden md:block group">
           <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
           <input
             type="text"
             placeholder="搜索"
             className="pl-9 pr-4 py-1.5 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
           />
        </div>

        {/* Plan Mode Switch */}
        <PlanModeSwitch />

        {/* Right Actions */}
        <div className="flex items-center gap-5 text-slate-500">
           <Link to="/quota-docs" className="hover:text-slate-800 transition-colors" title="配额管理文档"><Icons.Book className="w-5 h-5" /></Link>
           <button className="relative hover:text-slate-800 transition-colors" title="通知">
              <Icons.Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
           </button>
           <button className="hover:text-slate-800 transition-colors" title="帮助"><Icons.Help className="w-5 h-5" /></button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-6 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
           <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              陈
           </div>
           <span className="text-sm font-medium text-slate-700 hidden lg:block">chennan 陈楠</span>
        </div>
      </div>
    </header>
  );
};

// --- Pages ---

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-2xl text-primary">
             KSGC
          </div>
          <div className="flex gap-4">
            <Link to="/cli" className="text-slate-600 hover:text-primary font-medium px-4 py-2 transition-colors">我的CLI</Link>
            <Link to="/console" className="text-slate-600 hover:text-primary font-medium px-4 py-2 transition-colors">登录控制台</Link>
            <Link to="/onboarding" className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all hover:shadow-md">
              开通试用
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
           <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              全新企业级 2.0 版本发布
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
             企业级 AI 编程<br/>
             <span className="text-blue-600">智能中枢平台</span>
           </h1>
           <p className="text-lg text-slate-600 max-w-2xl mb-8">
             为企业提供安全、可控、高效的 AI 编程辅助服务。统一管理模型接入，精细化配额控制，全链路审计监控。
           </p>
           <div className="flex gap-3">
              <Link to="/onboarding" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                 立即开始
              </Link>
              <Link to="/help" className="bg-white text-slate-700 border border-slate-300 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                 查看文档
              </Link>
           </div>
        </div>

        {/* Feature Grid */}
        <div className="bg-slate-50 py-16 border-t border-slate-200">
           <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { title: "企业级安全", desc: "私有化部署支持，敏感数据过滤，完备的审计日志。" },
                   { title: "多模型聚合", desc: "统一接入 GPT-4, Claude, Llama 等主流模型，一键切换。" },
                   { title: "精细化管控", desc: "部门/成员级配额管理，实时用量监控与预算预警。" }
                 ].map((f, i) => (
                   <div key={i} className="bg-white p-6 rounded-lg border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p>© 2025 KSGC 智码云. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const OnboardingPage = () => {
  const [serviceType, setServiceType] = useState('shared');
  const [chargeType, setChargeType] = useState('trial');
  const [selectedEdition, setSelectedEdition] = useState('pro');
  const [selectedSeats, setSelectedSeats] = useState(20);
  const [selectedRegion, setSelectedRegion] = useState('cn-north1');
  const [selectedIdp, setSelectedIdp] = useState('');
  const [appId, setAppId] = useState('');
  const [appKey, setAppKey] = useState('');
  const [corpId, setCorpId] = useState('');
  const [encryptTransport, setEncryptTransport] = useState(true);
  const [copiedCallbackUrl, setCopiedCallbackUrl] = useState(false);
  const [selectedSharedPlan, setSelectedSharedPlan] = useState('lite');
  const [sharedSeats, setSharedSeats] = useState(5);
  const navigate = useNavigate();

  const calculatePrice = () => {
    let basePrice = selectedSeats * 0.05;
    if (selectedEdition === 'pro') basePrice *= 1.5;
    return basePrice.toFixed(2);
  };

  const isFormComplete = () => {
    if (serviceType === 'exclusive' && selectedIdp) {
      if (!appId.trim() || !appKey.trim()) return false;
      if ((selectedIdp === 'dingtalk' || selectedIdp === 'feishu') && !corpId.trim()) return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header with Tabs */}
      <div className="sticky top-0 bg-white border-b border-slate-200 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">金山云码服务开通</h1>
          <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            帮助文档
          </a>
        </div>

        {/* Service Type Tabs */}
        <div className="max-w-7xl mx-auto px-8 flex gap-8 border-t border-slate-100">
          <button
            onClick={() => setServiceType('shared')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              serviceType === 'shared'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            共享版
          </button>
          <button
            onClick={() => setServiceType('exclusive')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              serviceType === 'exclusive'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            专享版
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 flex gap-8 pb-32">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {serviceType === 'exclusive' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-slate-700">专享版有更高的数据安全性，服务端部署在账号下专属服务器，网络、数据物理隔离</p>
            </div>
          )}

          {serviceType === 'shared' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-slate-700">共享版以更低的成本获取完整的AI 开发体验</p>
            </div>
          )}

          {/* Section 1: 专享版基础配置 */}
          {serviceType === 'exclusive' && (
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-base font-bold text-slate-900 mb-6">基础配置</h2>

            <div className="space-y-6">
              {/* 计费方式 */}
              <div>
                <div className="mb-4">
                  <span className="text-sm font-medium text-slate-700">计费方式</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setChargeType('trial');
                      setSelectedEdition('pro');
                      setSelectedSeats(20);
                    }}
                    className={`rounded-lg p-4 text-left transition-colors border-2 ${
                      chargeType === 'trial'
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className={`text-sm font-bold mb-1 ${chargeType === 'trial' ? 'text-blue-700' : 'text-slate-900'}`}>
                      试用
                    </div>
                    <p className={`text-xs ${chargeType === 'trial' ? 'text-blue-600' : 'text-slate-600'}`}>
                      专业套餐 20个席位 试用30天
                    </p>
                  </button>

                  <button
                    onClick={() => setChargeType('formal')}
                    className={`rounded-lg p-4 text-left transition-colors border-2 ${
                      chargeType === 'formal'
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className={`text-sm font-bold mb-1 ${chargeType === 'formal' ? 'text-blue-700' : 'text-slate-900'}`}>
                      正式服务
                    </div>
                    <p className={`text-xs ${chargeType === 'formal' ? 'text-blue-600' : 'text-slate-600'}`}>
                      按实际配置计费
                    </p>
                  </button>
                </div>
              </div>

              {/* 套餐 */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-slate-700">套餐</span>
                  <div className="group relative">
                    <Icons.Info className="w-4 h-4 text-slate-400 cursor-help hover:text-slate-600" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs py-2 px-3 rounded whitespace-normal z-10 w-72">
                      <p className="mb-1">不同的订阅套餐，支持的产品力不同，详见</p>
                      <a href="https://docs.ksyun.com/documents/45165" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">官网文档介绍</a>
                      <p>。</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {[
                    { value: 'basic', label: '基础套餐' },
                    { value: 'pro', label: '专业套餐' }
                  ].map(edition => (
                    <button
                      key={edition.value}
                      onClick={() => chargeType === 'formal' && setSelectedEdition(edition.value)}
                      disabled={chargeType === 'trial'}
                      className={`px-6 py-2 rounded-lg text-sm transition-colors border ${
                        selectedEdition === edition.value
                          ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                      } ${chargeType === 'trial' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {edition.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 开通席位数 */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-slate-700">开通席位数</span>
                  <div className="group relative">
                    <Icons.Info className="w-4 h-4 text-slate-400 cursor-help hover:text-slate-600" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs py-2 px-3 rounded whitespace-nowrap z-10">
                      席位数为账号最大可用用户数，不是同时在线用户数。
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  {[5, 20, 50, 100, 200, 300, 500, 1000, 2000].map(num => (
                    <button
                      key={num}
                      onClick={() => chargeType === 'formal' && setSelectedSeats(num)}
                      disabled={chargeType === 'trial'}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                        selectedSeats === num
                          ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                      } ${chargeType === 'trial' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* 企业识别码 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-slate-700">企业识别码</label>
                  <div className="group relative">
                    <Icons.Info className="w-4 h-4 text-slate-400 cursor-help hover:text-slate-600" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs py-2 px-3 rounded whitespace-normal z-10 w-64">
                      <p className="mb-2">企业识别码为金山云码系统对您企业的识别编码，在注册时自定义，注册完整后不支持修改。</p>
                      <p>填写由字母、数字、- 组成，2-50个字符，首字符必须是字母。</p>
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  value={corpId}
                  onChange={(e) => setCorpId(e.target.value)}
                  placeholder="请输入企业识别码"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
          )}

          {/* Section 1: 共享版基础配置 */}
          {serviceType === 'shared' && (
          <>
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-base font-bold text-slate-900 mb-6">基础配置</h2>

            <div className="space-y-6">
              {/* 套餐选择 */}
              <div>
                <div className="mb-4">
                  <span className="text-sm font-medium text-slate-700">套餐</span>
                </div>

                <div className="grid grid-cols-3 gap-6">
            {/* Trial Card */}
            <button
              onClick={() => {
                setSelectedSharedPlan('trial');
                setSharedSeats(5);
              }}
              className={`bg-white rounded-lg border-2 p-8 flex flex-col text-left transition-all cursor-pointer ${
                selectedSharedPlan === 'trial'
                  ? 'border-blue-600 ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="mb-2">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">试用</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">¥0</h3>
              <p className="text-xs text-slate-500 mb-6">5个席位</p>

              <div className="space-y-3 flex-1">
                <div className="text-sm text-slate-700">
                  <p className="font-semibold mb-1">包含内容</p>
                </div>
                <div className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>免费试用14天</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>100Credits/席免费积分</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>模型请求频率限制</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Lite Card */}
            <button
              onClick={() => {
                setSelectedSharedPlan('lite');
                setSharedSeats(5);
              }}
              className={`bg-white rounded-lg border-2 p-8 flex flex-col text-left transition-all cursor-pointer ${
                selectedSharedPlan === 'lite'
                  ? 'border-blue-600 ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="mb-2">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">lite</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">¥78<span className="text-sm font-normal text-slate-600">/人/月</span></h3>
              <p className="text-xs text-slate-500 mb-6">5个席位起购</p>

              <div className="space-y-3 flex-1">
                <div className="text-sm text-slate-700">
                  <p className="font-semibold mb-1">包含内容</p>
                </div>
                <div className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>2000Credits/席/月（按月刷新不累积）</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>1000 Credits席位保底消耗，剩余Credits可团队内共享使用</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>更高的模型请求频率</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Pro Card */}
            <button
              onClick={() => {
                setSelectedSharedPlan('pro');
                setSharedSeats(5);
              }}
              className={`bg-white rounded-lg border-2 p-8 flex flex-col text-left transition-all cursor-pointer ${
                selectedSharedPlan === 'pro'
                  ? 'border-blue-600 ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="mb-2">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">pro</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">¥156<span className="text-sm font-normal text-slate-600">/人/月</span></h3>
              <p className="text-xs text-slate-500 mb-6">5个席位起购</p>

              <div className="space-y-3 flex-1">
                <div className="text-sm text-slate-700">
                  <p className="font-semibold mb-1">包含内容</p>
                </div>
                <div className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>4000Credits/席/月（按月刷新不累积）</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>2000 Credits席位保底消耗，剩余Credits可团队内共享使用</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>更高的模型请求频率</span>
                  </div>
                </div>
              </div>
            </button>
                </div>
              </div>

              {/* 购买席位数 */}
              {selectedSharedPlan && (
                <div>
                  <div className="mb-4">
                    <span className="text-sm font-medium text-slate-700">购买席位数</span>
                  </div>

                  {selectedSharedPlan === 'trial' ? (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-lg font-semibold text-slate-900">5 人</p>
                      <p className="text-xs text-slate-500 mt-1">试用版不可修改</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={sharedSeats}
                        onChange={(e) => {
                          const val = Math.max(5, parseInt(e.target.value) || 0);
                          setSharedSeats(val);
                        }}
                        className="w-20 text-center px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        min={5}
                      />
                      <span className="text-sm text-slate-700">
                        席位数（5 个席位起购）
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 企业识别码 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-slate-700">企业识别码</label>
                  <div className="group relative">
                    <Icons.Info className="w-4 h-4 text-slate-400 cursor-help hover:text-slate-600" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs py-2 px-3 rounded whitespace-normal z-10 w-64">
                      <p className="mb-2">企业识别码为金山云码系统对您企业的识别编码，在注册时自定义，注册完整后不支持修改。</p>
                      <p>填写由字母、数字、- 组成，2-50个字符，首字符必须是字母。</p>
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  value={corpId}
                  onChange={(e) => setCorpId(e.target.value)}
                  placeholder="请输入企业识别码"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

            {/* Section 2: 共享版企业集成配置 */}
            <div className="bg-white rounded-lg border border-slate-200 p-8">
              <h2 className="text-base font-bold text-slate-900 mb-4">企业集成配置</h2>

            <p className="text-sm text-slate-600 mb-6">配置企业身份源，实现SSO单点登录和组织架构同步</p>

            {/* Verified Company */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-xs text-slate-600 mb-1">已认证企业</p>
              <p className="font-medium text-slate-900">北京金山云网络技术有限公司</p>
            </div>

            {/* IDP Selection */}
            <label className="block text-sm font-medium text-slate-700 mb-4">选择连接身份源</label>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setSelectedIdp('wps')}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedIdp === 'wps'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="font-bold text-slate-900">WPS 365</div>
                <div className="text-xs text-slate-500">金山办公集成</div>
              </button>

              <button
                onClick={() => setSelectedIdp('dingtalk')}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedIdp === 'dingtalk'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="font-bold text-slate-900">钉钉</div>
                <div className="text-xs text-slate-500">钉钉办公集成</div>
              </button>

              <button
                onClick={() => setSelectedIdp('feishu')}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedIdp === 'feishu'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="font-bold text-slate-900">飞书</div>
                <div className="text-xs text-slate-500">飞书办公集成</div>
              </button>
            </div>

            {/* IDP Config Fields */}
            {selectedIdp && (
              <div className="space-y-4 pt-6 border-t">
                {/* Warning */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
                  <Icons.AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-orange-800">
                      <strong>系统将进行企业身份验证，请确保在开设平台已授予相应权限。身份认证源的信息获取、权限配置方法见</strong>
                    </p>
                    <a href="#" className="text-orange-600 text-sm font-medium hover:underline">查看操作文档</a>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {selectedIdp === 'wps' ? '应用ID' : selectedIdp === 'dingtalk' ? 'Client ID' : 'App ID'}
                    </label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder={selectedIdp === 'wps' ? '请输入 WPS 应用 ID' : selectedIdp === 'dingtalk' ? '请输入钉钉 Client ID' : '请输入飞书 App ID'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {selectedIdp === 'wps' ? '应用密钥' : selectedIdp === 'dingtalk' ? 'Client Secret' : 'App Secret'}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={appKey}
                        onChange={(e) => setAppKey(e.target.value)}
                        placeholder={selectedIdp === 'wps' ? '请输入 WPS 应用密钥' : selectedIdp === 'dingtalk' ? '请输入钉钉 Client Secret' : '请输入飞书 App Secret'}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                      <Icons.Eye className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 cursor-pointer" />
                    </div>
                  </div>


                  {selectedIdp === 'feishu' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Encrypt Key</label>
                      <input
                        type="text"
                        value={corpId}
                        onChange={(e) => setCorpId(e.target.value)}
                        placeholder="请输入飞书加密密钥"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Callback URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">回调地址</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedIdp === 'wps' ? 'https://api.ksgc.io/auth/wps/callback' : selectedIdp === 'dingtalk' ? 'https://api.ksgc.io/auth/dingtalk/callback' : 'https://api.ksgc.io/auth/feishu/callback'}
                      readOnly
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 text-sm"
                    />
                    <button
                      onClick={() => {
                        const url = selectedIdp === 'wps' ? 'https://api.ksgc.io/auth/wps/callback' : selectedIdp === 'dingtalk' ? 'https://api.ksgc.io/auth/dingtalk/callback' : 'https://api.ksgc.io/auth/feishu/callback';
                        navigator.clipboard.writeText(url);
                        setCopiedCallbackUrl(true);
                        setTimeout(() => setCopiedCallbackUrl(false), 2000);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                    >
                      {copiedCallbackUrl ? '已复制' : '复制'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">将此地址配置到对应的身份源工具后台，作为回调地址</p>
                </div>
              </div>
            )}
            </div>
          </>
          )}

          {serviceType === 'exclusive' && (
          <>
          {/* Section 2: 基础云服务 - Cloud Services */}
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-base font-bold text-slate-900 mb-6">基础云服务</h2>

            <div className="space-y-4">
              {/* 地域选择 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">地域</label>
                <div className="flex gap-3">
                  {[
                    { code: 'cn-north1', name: '华北1（北京）' },
                    { code: 'cn-east1', name: '华东1（上海）' }
                  ].map(region => (
                    <button
                      key={region.code}
                      onClick={() => setSelectedRegion(region.code)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        selectedRegion === region.code
                          ? 'bg-blue-50 border-blue-400 text-blue-700'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services Grid */}
              <div className="space-y-3 mt-6">
                {/* KEC Service */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-slate-900">云服务器</h4>
                      <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded">KEC</span>
                    </div>
                    <p className="text-sm text-slate-600">S6.8C | 8核 | 32G | 3台</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-500 mb-1">参考价格</p>
                    <p className="text-lg font-bold text-orange-600">¥806.4/月</p>
                  </div>
                </div>

                {/* SLB Service */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-slate-900">负载均衡</h4>
                      <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded">SLB</span>
                    </div>
                    <p className="text-sm text-slate-600">四层负载均衡 | 1个</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-500 mb-1">参考价格</p>
                    <p className="text-lg font-bold text-orange-600">¥75/月</p>
                  </div>
                </div>

                {/* KRDS Service */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-slate-900">关系型数据库</h4>
                      <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded">KRDS</span>
                    </div>
                    <p className="text-sm text-slate-600">高可用RDS_16G_PL0 | 15GB | 1GB | 1个</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-500 mb-1">参考价格</p>
                    <p className="text-lg font-bold text-orange-600">¥96/月</p>
                  </div>
                </div>
              </div>

              {/* 加密传输配置 */}
              <div className="pt-6 border-t mt-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="encrypt"
                    checked={encryptTransport}
                    onChange={(e) => setEncryptTransport(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="encrypt" className="text-sm text-slate-700 font-medium">是否加密传输</label>
                  <div className="relative group">
                    <Icons.Info className="w-4 h-4 text-slate-400 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 z-10">
                      <div className="bg-slate-800 text-white text-xs rounded-lg p-3 shadow-lg">
                        开启后，所有业务请求均通过 TLS/SSL 加密传输，保障传输链路安全加密。防篡改、加密路发生产生 10-20ms 的延时问题，不影响核心业务正常使用。
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 企业集成配置 */}
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-base font-bold text-slate-900 mb-4">企业集成配置</h2>

            <p className="text-sm text-slate-600 mb-6">配置企业身份源，实现SSO单点登录和组织架构同步</p>

            {/* Verified Company */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-xs text-slate-600 mb-1">已认证企业</p>
              <p className="font-medium text-slate-900">北京金山云网络技术有限公司</p>
            </div>

            {/* IDP Selection */}
            <label className="block text-sm font-medium text-slate-700 mb-4">选择连接身份源</label>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setSelectedIdp('wps')}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedIdp === 'wps'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="font-bold text-slate-900">WPS 365</div>
                <div className="text-xs text-slate-500">金山办公集成</div>
              </button>

              <button
                onClick={() => setSelectedIdp('dingtalk')}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedIdp === 'dingtalk'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="font-bold text-slate-900">钉钉</div>
                <div className="text-xs text-slate-500">钉钉办公集成</div>
              </button>

              <button
                onClick={() => setSelectedIdp('feishu')}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedIdp === 'feishu'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="font-bold text-slate-900">飞书</div>
                <div className="text-xs text-slate-500">飞书办公集成</div>
              </button>
            </div>

            {/* IDP Config Fields */}
            {selectedIdp && (
              <div className="space-y-4 pt-6 border-t">
                {/* Warning */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
                  <Icons.AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-orange-800">
                      <strong>系统将进行企业身份验证，请确保在开设平台已授予相应权限。身份认证源的信息获取、权限配置方法见</strong>
                    </p>
                    <a href="#" className="text-orange-600 text-sm font-medium hover:underline">查看操作文档</a>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {selectedIdp === 'wps' ? '应用ID' : selectedIdp === 'dingtalk' ? 'Client ID' : 'App ID'}
                    </label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder={selectedIdp === 'wps' ? '请输入 WPS 应用 ID' : selectedIdp === 'dingtalk' ? '请输入钉钉 Client ID' : '请输入飞书 App ID'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {selectedIdp === 'wps' ? '应用密钥' : selectedIdp === 'dingtalk' ? 'Client Secret' : 'App Secret'}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={appKey}
                        onChange={(e) => setAppKey(e.target.value)}
                        placeholder={selectedIdp === 'wps' ? '请输入 WPS 应用密钥' : selectedIdp === 'dingtalk' ? '请输入钉钉 Client Secret' : '请输入飞书 App Secret'}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                      <Icons.Eye className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 cursor-pointer" />
                    </div>
                  </div>


                  {selectedIdp === 'feishu' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Encrypt Key</label>
                      <input
                        type="text"
                        value={corpId}
                        onChange={(e) => setCorpId(e.target.value)}
                        placeholder="请输入飞书加密密钥"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Callback URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">回调地址</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedIdp === 'wps' ? 'https://api.ksgc.io/auth/wps/callback' : selectedIdp === 'dingtalk' ? 'https://api.ksgc.io/auth/dingtalk/callback' : 'https://api.ksgc.io/auth/feishu/callback'}
                      readOnly
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 text-sm"
                    />
                    <button
                      onClick={() => {
                        const url = selectedIdp === 'wps' ? 'https://api.ksgc.io/auth/wps/callback' : selectedIdp === 'dingtalk' ? 'https://api.ksgc.io/auth/dingtalk/callback' : 'https://api.ksgc.io/auth/feishu/callback';
                        navigator.clipboard.writeText(url);
                        setCopiedCallbackUrl(true);
                        setTimeout(() => setCopiedCallbackUrl(false), 2000);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                    >
                      {copiedCallbackUrl ? '已复制' : '复制'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">将此地址配置到对应的身份源工具后台，作为回调地址</p>
                </div>
              </div>
            )}
          </div>
          </>
          )}

          {/* Submit Button */}
          {(serviceType === 'exclusive' || serviceType === 'shared') && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-8 py-4">
            <div className="max-w-7xl mx-auto">
              <button
                onClick={() => navigate('/console')}
                disabled={serviceType === 'exclusive' && !isFormComplete()}
                className={`px-12 py-3 rounded-lg font-medium transition-colors ${
                  serviceType === 'shared' || isFormComplete()
                    ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                立即开通
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Right Sidebar - Price Summary */}
        <div className="w-96 sticky top-24 h-fit">
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-1">服务开通价格预览</h3>
              <p className="text-xs text-slate-500 mb-4">此费用为按官网列表价格计算的预计金额，实际费用以账单为准。</p>

              {serviceType === 'exclusive' ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">席位费用</span>
                  <span className="font-medium text-slate-900">¥400/月</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">基础云服务费用</span>
                  <span className="font-medium text-slate-900">约¥977.4/月</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Token费用</span>
                  <span className="font-medium text-slate-900">按实际模型用量计费</span>
                </div>
              </div>
              ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">席位数</span>
                    <span className="font-medium text-slate-900">{sharedSeats} 人</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">单价</span>
                    <span className="font-medium text-slate-900">
                      {selectedSharedPlan === 'trial' ? '免费' : selectedSharedPlan === 'lite' ? '¥78/人/月' : '¥156/人/月'}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-900 font-semibold">合计</span>
                    <span className="text-orange-600 text-lg font-bold">
                      {selectedSharedPlan === 'trial' ? '免费' : selectedSharedPlan === 'lite' ? `¥${78 * sharedSeats}/月` : `¥${156 * sharedSeats}/月`}
                    </span>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ConsolePage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentView, setView] = useState('dashboard');
  const [addonView, setAddonView] = useState(false);

  const renderContent = () => {
    switch(currentView) {
      case 'dashboard': return <DashboardOverview onNavigate={(view) => {
        if (view === 'subscription-addon') {
          setAddonView(true);
          setView('subscription');
        } else {
          setAddonView(false);
          setView(view);
        }
      }} />;
      case 'usage': return <UsageAnalytics />;
      case 'logs': return <CallLogs />;
      case 'metrics': return <ModelMetrics />;
      case 'models': return <ModelManagement />;
      case 'members': return <MembersManagement />;
      case 'quota': return <QuotaManagement />;
      case 'subscription': return <SubscriptionManagement showAddonTab={addonView} />;
      case 'security': return <SecuritySettings />;
      case 'settings': return <SystemSettings />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
           <p>该模块功能正在开发中...</p>
        </div>
      );
    }
  };

  const getTitle = () => {
    const titles: Record<string, string> = {
      dashboard: '概览',
      usage: '用量看板',
      logs: '调用明细',
      metrics: '模型指标',
      models: '模型管理',
      members: '组织成员管理',
      quota: '配额管理',
      subscription: '订阅管理/扩容',
      security: 'IP 白名单',
      settings: '系统设置'
    };
    return titles[currentView] || '控制台';
  }

  return (
    <PlanModeProvider>
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentView={currentView} setView={setView} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
          <Header title={getTitle()} />
          <main className="flex-1 p-8 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </PlanModeProvider>
  );
};

// --- Help Center Mock ---
const HelpCenterPage = () => {
  const [activeSection, setActiveSection] = useState('quickstart');

  const renderContent = () => {
    switch(activeSection) {
      case 'quickstart':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">快速入门指南</h1>
            <p className="text-slate-600 leading-relaxed mb-4">
              欢迎使用 KSGC 智码云。本文档将指导您完成初始配置，并开始在您的开发工作流中使用 AI 辅助能力。
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-1">前置条件</h4>
              <p className="text-sm text-blue-700">您需要拥有企业管理员权限才能获取 API Key。</p>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. 安装 CLI</h3>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
              <code>npm install -g @ksgc/cli</code>
            </pre>
            <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. 登录认证</h3>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
              <code>ksgc login</code>
            </pre>
          </div>
        );

      case 'quota':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">配额管理详解</h1>
            <p className="text-lg text-slate-600">精细化预算控制，有效管理 Token 消费成本</p>

            <div className="grid grid-cols-3 gap-4 my-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-slate-600 mb-1">配额维度</div>
                <div className="text-2xl font-bold text-slate-900">4 层级</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-slate-600 mb-1">预警机制</div>
                <div className="text-2xl font-bold text-slate-900">实时监控</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-sm text-slate-600 mb-1">应用时间</div>
                <div className="text-2xl font-bold text-slate-900">立即生效</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">核心概念</h3>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-2">月度配额</div>
                <p className="text-sm text-slate-700">企业或部门在一个自然月内的最大 Token 消费预算，以元（¥）为单位。</p>
              </div>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-2">使用率</div>
                <p className="text-sm text-slate-700">已消费金额与月度配额的比例。使用率达到 80% 时默认触发预警通知。</p>
              </div>

              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-2">配额消费折扣</div>
                <p className="text-sm text-slate-700">在计算配额展示价格时应用的折扣系数。例如：4.5 表示 4.5 折。</p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-orange-900 mb-2">重要说明</h4>
              <ul className="space-y-2 text-sm text-orange-800">
                <li>• 配额展示价格仅用于额度显示，账单结算价格以合同为准</li>
                <li>• 修改配额后立即生效，仅对新增消费计数有效</li>
                <li>• 受结算周期影响，使用量可能轻微超出配额</li>
              </ul>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-8">配额层级关系</h3>
            <div className="space-y-3">
              <div className="border-l-4 border-red-600 bg-red-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-1">优先级 1：成员级配额（最高）</div>
                <p className="text-sm text-slate-700">如果成员有独立配额设置，直接应用成员配额，忽略部门和账户配额。</p>
              </div>
              <div className="border-l-4 border-orange-600 bg-orange-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-1">优先级 2：部门级配额</div>
                <p className="text-sm text-slate-700">成员无独立配额时，使用其所在部门的配额限制。</p>
              </div>
              <div className="border-l-4 border-blue-600 bg-blue-50 px-4 py-3 rounded">
                <div className="font-semibold text-slate-900 mb-1">优先级 3：账户级配额（最低）</div>
                <p className="text-sm text-slate-700">部门和成员都无独立配额时，使用企业账户总预算。</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-8">配额管理四个维度</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="font-semibold text-slate-900 mb-2">1. 统一配置</div>
                <p className="text-sm text-slate-700">设置全局预警阈值（如 80%）、配额消费折扣和预警接收人。这些设置适用于所有配额维度。</p>
              </div>
              <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="font-semibold text-slate-900 mb-2">2. 账号维度</div>
                <p className="text-sm text-slate-700">为整个企业账户设置月度总预算。所有未在部门或成员级别设置的消费都受此限制。</p>
              </div>
              <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="font-semibold text-slate-900 mb-2">3. 部门维度</div>
                <p className="text-sm text-slate-700">为各部门设置独立配额。支持多级部门结构，可为不同规模部门灵活分配预算。</p>
              </div>
              <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="font-semibold text-slate-900 mb-2">4. 成员维度</div>
                <p className="text-sm text-slate-700">为个人成员设置配额限制。优先级最高，可对特定成员进行更严格的消费控制。</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-8">最佳实践</h3>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">1</span>
                <span><strong>合理规划：</strong>根据历史消费数据和团队规模制定年度预算，再分解到部门和个人。</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">2</span>
                <span><strong>差异化管理：</strong>根据部门性质和成员角色设置不同的配额，如研发部门配额高于管理部门。</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">3</span>
                <span><strong>预警阈值：</strong>建议设置在 70%-80%，留出缓冲空间应对周期延迟。</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">4</span>
                <span><strong>定期审查：</strong>每月末检查使用情况，根据趋势调整下月配额。</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">5</span>
                <span><strong>及时通知：</strong>确保管理员和财务人员实时接收预警消息，快速响应。</span>
              </li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
              <p className="text-sm text-blue-800">
                更详细的操作指南，请查看 <Link to="/quota-docs" className="font-semibold text-blue-600 hover:underline">配额管理完全指南</Link>
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
       <nav className="border-b px-8 h-16 flex items-center justify-between flex-shrink-0">
          <div className="font-bold text-xl text-slate-800">
             帮助中心
          </div>
          <Link to="/console" className="text-sm font-medium text-primary hover:underline">返回控制台</Link>
       </nav>
       <div className="flex flex-1 max-w-7xl mx-auto w-full overflow-hidden">
          <aside className="w-64 py-8 pr-8 border-r overflow-y-auto flex-shrink-0">
             <div className="space-y-6">
                <div>
                  <div className="font-semibold text-slate-900 px-2 mb-3">快速开始</div>
                  {[
                    { id: 'quickstart', label: '快速入门指南' }
                  ].map(i => (
                    <button
                      key={i.id}
                      onClick={() => setActiveSection(i.id)}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                        activeSection === i.id
                          ? 'bg-blue-50 text-primary font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                      }`}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 px-2 mb-3">功能指南</div>
                  {[
                    { id: 'quota', label: '配额管理' }
                  ].map(i => (
                    <button
                      key={i.id}
                      onClick={() => setActiveSection(i.id)}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                        activeSection === i.id
                          ? 'bg-blue-50 text-primary font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                      }`}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
             </div>
          </aside>
          <main className="flex-1 px-12 py-8 max-w-4xl overflow-y-auto">
             {renderContent()}
          </main>
       </div>
    </div>
  )
}

const CliPage = CliPageComponent;

const QuotaDocumentationPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <header className="border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/console" className="text-slate-600 hover:text-slate-900 font-bold text-lg transition-colors">
            ← 返回控制台
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">配额管理文档</h1>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto max-w-6xl mx-auto w-full px-8 py-8">
        <QuotaDocumentation />
      </main>
    </div>
  );
};


// --- Main App & Routing ---

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/console" element={<ConsolePage />} />
        <Route path="/cli" element={<CliPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/quota-docs" element={<QuotaDocumentationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;