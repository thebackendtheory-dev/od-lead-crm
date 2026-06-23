/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Lead, User, SERVICE_LABELS, STAGE_LABELS } from '../types';
import { calculateStats, STAGE_PROBABILITIES } from '../utils/dataStore';
import { 
  TrendingUp, 
  Percent, 
  Briefcase, 
  Lock, 
  HelpCircle,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface DashboardProps {
  leads: Lead[];
  currentUser: User;
  onSelectLead: (leadId: string) => void;
}

export default function Dashboard({ leads, currentUser, onSelectLead }: DashboardProps) {
  // Compute analytics safely using utility
  const stats = useMemo(() => calculateStats(leads), [leads]);

  // Format currency
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Check role authorization limit. Let's enforce some gentle constraints:
  // Admin & Manager see full organization statistics.
  // Agents see their personal stats (computed only from leads assigned to them).
  const isAgent = currentUser.role === 'agent';
  
  const filteredLeadsForDashboard = useMemo(() => {
    if (!isAgent) return leads;
    return leads.filter(lead => lead.assignedTo.toLowerCase() === currentUser.name.toLowerCase());
  }, [leads, currentUser, isAgent]);

  const viewStats = useMemo(() => {
    return calculateStats(filteredLeadsForDashboard);
  }, [filteredLeadsForDashboard]);

  // Data preps for Recharts
  const serviceChartData = useMemo(() => {
    return Object.entries(viewStats.serviceValue)
      .map(([key, value]) => ({
        name: SERVICE_LABELS[key as keyof typeof SERVICE_LABELS] || key,
        value: Number(value),
        key
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [viewStats.serviceValue]);

  const stageChartData = useMemo(() => {
    return Object.entries(STAGE_LABELS).map(([key, label]) => ({
      stage: label,
      count: viewStats.stageCounts[key] || 0,
      probability: `${(STAGE_PROBABILITIES[key] * 100)}%`
    }));
  }, [viewStats.stageCounts]);

  // Modern pastel tone cell colors for services
  const SERVICE_COLOR_PALETTE = [
    '#2563eb', // Blue (website)
    '#a855f7', // Purple (app)
    '#10b981', // Emerald (ecommerce)
    '#6366f1', // Indigo (custom website)
    '#06b6d4', // Cyan (custom software)
    '#ec4899', // Pink (digital marketing)
    '#f59e0b'  // Amber (seo)
  ];

  // Won vs active priority leads list
  const priorityLeads = useMemo(() => {
    return filteredLeadsForDashboard
      .filter(lead => lead.priority === 'high' && lead.stage !== 'won' && lead.stage !== 'lost')
      .slice(0, 4);
  }, [filteredLeadsForDashboard]);

  return (
    <div className="space-y-6">
      
      {/* Scope banner & RBAC label */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-full text-xxs font-extrabold bg-blue-50 text-blue-700 uppercase tracking-wider flex items-center gap-1.5 border border-blue-150">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentUser.role} Security Tier Active
            </span>
            <span className="text-xxs text-slate-400">
              Logged in as <strong className="text-slate-600 font-medium">{currentUser.name}</strong>
            </span>
          </div>
          <h2 className="text-sm text-slate-500 mt-1">
            {isAgent 
              ? 'Showing tracking parameters of client accounts assigned directly to you.'
              : 'Viewing aggregate organization pipeline metrics, sales trajectories, and conversion ratios.'
            }
          </h2>
        </div>
        
        {!isAgent && (
          <div className="flex items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-medium">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Enterprise Export Enabled</span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {/* KPI 1 - Active Pipeline */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-slate-100 group-hover:text-slate-150 transition-colors">
            <Briefcase className="w-16 h-16 pointer-events-none" />
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span>Active Pipeline Value</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2 stat-number">
            {formatINR(viewStats.totalPipelineValue)}
          </div>
          <p className="text-xxs text-slate-400 mt-2.5 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold flex items-center">&uarr; 12.4%</span>
            <span>vs previous fiscal quarter</span>
          </p>
        </div>

        {/* KPI 3 - Conversion Rate */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-slate-100 group-hover:text-slate-150 transition-colors">
            <Percent className="w-16 h-16 pointer-events-none" />
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span>Acquisition Conversion Rate</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2 stat-number">
            {viewStats.conversionRate.toFixed(1)}%
          </div>
          <p className="text-xxs text-slate-400 mt-2.5 flex items-center gap-1">
            <span>Calculated from (Won / Closed Leads)</span>
          </p>
        </div>

        {/* KPI 4 - Total Active Leads */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-slate-100 group-hover:text-slate-150 transition-colors">
            <TrendingUp className="w-16 h-16 pointer-events-none" />
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span>Total Lead Inflow</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2 stat-number">
            {viewStats.totalLeads} accounts
          </div>
          <p className="text-xxs text-slate-400 mt-2.5 flex items-center gap-1">
            <span>Includes lost & dormant opportunities</span>
          </p>
        </div>
      </div>

      {/* Main Charts Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Service Distribution Pie Card */}
        <div className="lg:col-span-1 p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm font-sans tracking-tight">
              Pipeline Spread by Services
            </h3>
            <p className="text-xxs text-slate-400 mt-0.5">Budget allocations for website design, SEO, apps, and digital marketing.</p>
          </div>
          
          <div className="h-64 mt-4 flex items-center justify-center">
            {serviceChartData.length === 0 ? (
              <div className="text-center text-xs text-slate-400">No active service value to show. Create leads with values first.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {serviceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SERVICE_COLOR_PALETTE[index % SERVICE_COLOR_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatINR(Number(value)), 'Value']}
                    contentStyle={{ fontSize: '11px', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {serviceChartData.map((item, index) => (
              <div key={item.key} className="flex items-center justify-between text-xxs">
                <div className="flex items-center gap-1.5 text-slate-600 truncate max-w-[170px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SERVICE_COLOR_PALETTE[index % SERVICE_COLOR_PALETTE.length] }} />
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{formatINR(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel chart Card */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm font-sans tracking-tight">
                  Lead Acquisition Pipeline Stages
                </h3>
                <p className="text-xxs text-slate-400 mt-0.5">Volume count across different stages & conversion dropoffs.</p>
              </div>
              <div className="text-xxs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                Funnel Breakdown
              </div>
            </div>
          </div>

          <div className="h-72 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="stage" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                  contentStyle={{ fontSize: '11px', borderRadius: '12px' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-950 text-white rounded-xl shadow-lg border border-slate-800 text-xxs space-y-1">
                          <p className="font-bold">{data.stage}</p>
                          <p>Total Leads: <strong className="text-emerald-400">{data.count}</strong></p>
                          <p>CRM Win Weight: <strong className="text-blue-400">{data.probability}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#7c3aed" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                >
                  {stageChartData.map((entry, index) => {
                    // Accent Won/Lost slightly differently
                    let color = '#a855f7'; // regular purple
                    if (entry.stage === 'Won') color = '#10b981'; // emerald
                    if (entry.stage === 'Lost') color = '#f43f5e'; // rose
                    if (entry.stage === 'New Lead') color = '#94a3b8'; // slate
                    return <Cell key={`stage-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-between items-center text-xxs text-slate-400 pt-3 border-t border-slate-50 mt-2 gap-2">
            <span>&bull; Status labels and pipelines automatically refresh live.</span>
            <span>Total active leads: <strong className="text-slate-700">{filteredLeadsForDashboard.length}</strong></span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Line Chart of Monthly Revenue projections */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-100 rounded-2xl shadow-xs">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm font-sans tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Weighted Projection Growth trajectory (2026 YTD)
            </h3>
            <p className="text-xxs text-slate-400 mt-0.5">Historical monthly trends integrated with currently forecasted pipeline expectations.</p>
          </div>

          <div className="h-60 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewStats.monthlyTrend} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 10 }} 
                  tickFormatter={(val) => `₹${Math.round(val/1000)}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [formatINR(Number(value)), 'Cumulative Projection']}
                  contentStyle={{ fontSize: '11px', borderRadius: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, strokeWidth: 1.5, fill: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Priority Active Leads List */}
        <div className="lg:col-span-1 p-5 bg-white border border-slate-100 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 text-sm font-sans tracking-tight">
              Flagged Priority Hotlist
            </h3>
            <span className="p-0.5 px-2 text-xxs font-semibold bg-rose-50 text-rose-700 rounded-md border border-rose-100">
              High Priority
            </span>
          </div>
          <p className="text-xxs text-slate-400 mt-0.5">Hot leads that require continuous engagement to close.</p>

          <div className="mt-4 space-y-3">
            {priorityLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-xxs text-slate-400 space-y-1">
                <Lock className="w-6 h-6 text-slate-350" />
                <p>No non-won high priority leads active.</p>
                <p className="text-slate-350 shrink-0">Modify priority parameters to display items here.</p>
              </div>
            ) : (
              priorityLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  onClick={() => onSelectLead(lead.id)}
                  className="p-3 border border-slate-100 font-sans hover:border-slate-200 hover:shadow-xs rounded-xl cursor-pointer transition-all flex justify-between items-center bg-slate-50/50"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-800 truncate">{lead.companyName}</h4>
                    <p className="text-xxs text-slate-500 truncate mt-0.5">{lead.clientName} &bull; {SERVICE_LABELS[lead.service]}</p>
                    <span className="inline-block px-1.5 py-0.5 font-bold text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-sm mt-1.5 uppercase">
                      {STAGE_LABELS[lead.stage]}
                    </span>
                  </div>

                  <div className="text-right ml-2 shrink-0">
                    <span className="text-xs font-extrabold text-slate-900 block">{formatINR(lead.budget)}</span>
                    <button className="text-[10px] text-blue-600 hover:underline inline-flex items-center gap-0.5 bg-white p-1 px-2 rounded-md shadow-xxs border border-slate-150 mt-1">
                      Manage <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
