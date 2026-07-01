/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Lead, LeadStage, ServiceType, User, SERVICE_LABELS, STAGE_LABELS, PRIORITY_COLORS, SERVICE_COLORS, MaintenanceRecord } from './types';
import { 
  fetchLeadsAsync,
  getLeadsFromStore, 
  saveLeadsToStore, 
  getLoggedInUser, 
  saveLoggedInUser, 
  generateAlerts, 
  SEED_USERS,
  filterLeadsByRole,
  getMaintenanceFromStore,
  saveMaintenanceToStore,
  fetchMaintenanceAsync,
  createMaintenanceAsync,
  updateMaintenanceAsync
} from './utils/dataStore';

// Components
import Dashboard from './components/Dashboard.tsx';
import KanbanBoard from './components/KanbanBoard.tsx';
import LeadDetailModal from './components/LeadDetailModal.tsx';
import LeadFormModal from './components/LeadFormModal.tsx';
import NotificationAlerts from './components/NotificationAlerts.tsx';
import MaintenanceView from './components/MaintenanceView.tsx';
import Login from './components/Login.tsx';

// Icons
import {
  LayoutDashboard,
  KanbanSquare,
  List,
  Plus,
  Bell,
  Search,
  Users,
  ShieldCheck,
  Building,
  IndianRupee,
  Layers,
  Sparkles,
  Phone,
  Mail,
  HelpCircle,
  Clock,
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  // 1. Core State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]); // One Devs (Admin) By Default

  // UI state
  const [activeView, setActiveView] = useState<'leads' | 'maintenance'>('leads');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kanban' | 'list'>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Search and filters
  const [query, setQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // 2. Initialize
  useEffect(() => {
    // Check auth first
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
        setIsLoadingAuth(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
      });

    // Read from localStorage synchronously first for fast render
    const savedLeads = getLeadsFromStore();
    setLeads(savedLeads);
    setMaintenanceRecords(getMaintenanceFromStore());
    
    // Then attempt to fetch from API in background
    fetchLeadsAsync().then((serverLeads) => {
      setLeads(serverLeads);
    });
    fetchMaintenanceAsync().then((serverRecords) => {
      setMaintenanceRecords(serverRecords);
    });

    const savedUser = getLoggedInUser();
    setCurrentUser(savedUser);
  }, []);

  // Sync to database store
  const syncStore = async (updatedLeads: Lead[], leadToUpdate?: Lead) => {
    setLeads(updatedLeads);
    saveLeadsToStore(updatedLeads);
    
    // Also push change to API
    if (leadToUpdate) {
      if (updatedLeads.some(l => l.id === leadToUpdate.id)) {
        // It's an update or create
        const isNew = !leads.some(l => l.id === leadToUpdate.id);
        if (isNew) {
          try { await fetch('/api/leads', { method: 'POST', body: JSON.stringify(leadToUpdate), headers: { 'Content-Type': 'application/json' }}); } catch (e) {}
        } else {
          try { await fetch(`/api/leads/${leadToUpdate.id}`, { method: 'PUT', body: JSON.stringify(leadToUpdate), headers: { 'Content-Type': 'application/json' }}); } catch (e) {}
        }
      } else {
        // It's a delete
        try { await fetch(`/api/leads/${leadToUpdate.id}`, { method: 'DELETE' }); } catch (e) {}
      }
    }
  };

  const syncMaintenanceStore = async (updatedRecords: MaintenanceRecord[], recordToUpdate?: MaintenanceRecord) => {
    setMaintenanceRecords(updatedRecords);
    saveMaintenanceToStore(updatedRecords);
    
    // Also push change to API
    if (recordToUpdate) {
      if (updatedRecords.some(r => r.id === recordToUpdate.id)) {
        // It's an update or create
        const isNew = !maintenanceRecords.some(r => r.id === recordToUpdate.id);
        if (isNew) {
          try { await fetch('/api/maintenance', { method: 'POST', body: JSON.stringify(recordToUpdate), headers: { 'Content-Type': 'application/json' }}); } catch (e) {}
        } else {
          try { await fetch(`/api/maintenance/${recordToUpdate.id}`, { method: 'PUT', body: JSON.stringify(recordToUpdate), headers: { 'Content-Type': 'application/json' }}); } catch (e) {}
        }
      } else {
        // It's a delete
        try { await fetch(`/api/maintenance/${recordToUpdate.id}`, { method: 'DELETE' }); } catch (e) {}
      }
    }
  };

  const handleSaveMaintenanceRecord = (record: MaintenanceRecord) => {
    const isNew = !maintenanceRecords.some(r => r.id === record.id);
    const updated = isNew
      ? [...maintenanceRecords, record]
      : maintenanceRecords.map(r => r.id === record.id ? record : r);
    syncMaintenanceStore(updated, record);
  };

  const handleMarkPaidMaintenance = async (recordId: string) => {
    const record = maintenanceRecords.find(r => r.id === recordId);
    if (!record) return;

    // 1. Mark current as paid
    const updatedCurrent = { ...record, paymentStatus: 'paid' as const, updatedAt: new Date().toISOString() };
    
    // 2. Generate next duration
    const currentEnd = new Date(record.endDate);
    const nextStart = new Date(currentEnd);
    nextStart.setDate(nextStart.getDate() + 1); // Start next day after current ends

    const nextEnd = new Date(nextStart);
    if (record.paymentFrequency === 'monthly') {
      nextEnd.setMonth(nextEnd.getMonth() + 1);
    } else if (record.paymentFrequency === 'quarterly') {
      nextEnd.setMonth(nextEnd.getMonth() + 3);
    } else if (record.paymentFrequency === 'yearly') {
      nextEnd.setFullYear(nextEnd.getFullYear() + 1);
    }

    const nextRecord: MaintenanceRecord = {
      ...record,
      id: `maint-${Date.now()}`,
      startDate: nextStart.toISOString(),
      endDate: nextEnd.toISOString(),
      paymentStatus: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = maintenanceRecords.map(r => r.id === recordId ? updatedCurrent : r).concat(nextRecord);
    syncMaintenanceStore(updated);
    
    // Background API sync
    try { await fetch(`/api/maintenance/${updatedCurrent.id}`, { method: 'PUT', body: JSON.stringify(updatedCurrent), headers: { 'Content-Type': 'application/json' }}); } catch (e) {}
    try { await fetch('/api/maintenance', { method: 'POST', body: JSON.stringify(nextRecord), headers: { 'Content-Type': 'application/json' }}); } catch (e) {}
  };

  // 3. Filtered Leads List based on access control (RBAC):
  // Agents only see details of leads assigned directly to them!
  const scopedLeads = useMemo(() => {
    return filterLeadsByRole(leads, currentUser);
  }, [leads, currentUser]);

  // Apply visual search/priority query filters
  const processedLeads = useMemo(() => {
    return scopedLeads.filter(lead => {
      // Search matches
      const term = query.toLowerCase();
      const matchesSearch = 
        lead.clientName.toLowerCase().includes(term) ||
        lead.companyName.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        lead.phone.toLowerCase().includes(term) ||
        SERVICE_LABELS[lead.service].toLowerCase().includes(term);

      const matchesService = serviceFilter === 'all' || lead.service === serviceFilter;
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;

      return matchesSearch && matchesService && matchesPriority;
    });
  }, [scopedLeads, query, serviceFilter, priorityFilter]);

  // Compute pending notification alerts
  const notificationsList = useMemo(() => {
    return generateAlerts(leads); // evaluate full list so staff know what's overdue across their items
  }, [leads]);

  const urgentAlertsCount = useMemo(() => {
    return notificationsList.filter(a => a.isUrgent).length;
  }, [notificationsList]);

  // 4. Client Operations
  const handleUserRoleChange = (userId: string) => {
    const match = SEED_USERS.find(user => user.id === userId);
    if (match) {
      setCurrentUser(match);
      saveLoggedInUser(match);
      // Close open leads if role switch restricts them
      if (match.role === 'agent' && selectedLeadId) {
        const lead = leads.find(l => l.id === selectedLeadId);
        if (lead && lead.assignedTo.toLowerCase() !== match.name.toLowerCase()) {
          setSelectedLeadId(null);
        }
      }
    }
  };

  const handleUpdateLeadStage = (leadId: string, nextStage: LeadStage) => {
    const matchedLead = leads.find(l => l.id === leadId);
    if (!matchedLead) return;

    const labelBefore = STAGE_LABELS[matchedLead.stage];
    const labelAfter = STAGE_LABELS[nextStage];

    // Build fresh activity block
    const freshAct: Lead['activities'][0] = {
      id: `act-${Date.now()}`,
      type: 'stage_change',
      description: `Stage updated from "${labelBefore}" to "${labelAfter}" via Kanban Board`,
      timestamp: new Date().toISOString(),
      user: currentUser.name
    };

    const updatedLead = leads.find(l => l.id === leadId);
    let fullyUpdatedLead: Lead | undefined;
    
    const updated = leads.map(l => {
      if (l.id === leadId) {
        fullyUpdatedLead = {
          ...l,
          stage: nextStage,
          updatedAt: new Date().toISOString(),
          activities: [freshAct, ...l.activities]
        };
        return fullyUpdatedLead;
      }
      return l;
    });

    syncStore(updated, fullyUpdatedLead);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    const updated = leads.map(l => {
      if (l.id === updatedLead.id) {
        return updatedLead;
      }
      return l;
    });
    syncStore(updated, updatedLead);
  };

  const handleCreateLead = (payload: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'tasks' | 'activities'>) => {
    const newId = `lead-${Date.now()}`;
    
    const freshAct: Lead['activities'][0] = {
      id: `act-${Date.now()}`,
      type: 'creation',
      description: `Lead profile initially registered in CRM system`,
      timestamp: new Date().toISOString(),
      user: currentUser.name
    };

    const newLead: Lead = {
      ...payload,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: payload.meetingDate ? [
        {
          id: `note-init-${Date.now()}`,
          author: currentUser.name,
          content: `Initial client consultation meeting booked for ${new Date(payload.meetingDate).toLocaleString()}`,
          createdAt: new Date().toISOString()
        }
      ] : [],
      tasks: [
        {
          id: `task-init-${Date.now()}`,
          title: 'Conduct initial technical requirements call',
          dueDate: payload.meetingDate ? payload.meetingDate.split('T')[0] : '2026-06-25',
          completed: false
        }
      ],
      activities: [freshAct]
    };

    const updated = [newLead, ...leads];
    syncStore(updated, newLead);
    setSelectedLeadId(newId); // auto open profile
  };

  const handleDeleteLead = (leadId: string) => {
    const leadToDelete = leads.find(l => l.id === leadId);
    if (!leadToDelete) return;
    const updated = leads.filter(l => l.id !== leadId);
    syncStore(updated, leadToDelete); // Will delete API-side? Let's assume we need to delete.
    fetch(`/api/leads/${leadId}`, { method: 'DELETE' }).catch(e => console.error(e));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
    } catch (e) {
      console.error('Logout failed');
    }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      
      {/* GLOBAL HEADER/NAVBAR */}
      <header className="sticky top-0 bg-slate-950 border-b border-slate-900 shadow-lg z-25 shrink-0 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand Brandings */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[0.75rem] overflow-hidden shrink-0 shadow-md">
              <img src="/od-icon.png" alt="One Devs Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-white tracking-tight text-sm">
                  One Devs CRM System
                </h1>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">v1.4</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Enterprise Acquisition & Lead Management Suite</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveView('leads')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeView === 'leads' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveView('maintenance')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeView === 'maintenance' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Maintenance
            </button>
          </div>

          {/* Action Tools (Role picker, alerts notification, add opportunity) */}
          <div className="flex items-center gap-3.5 flex-wrap">
            
            {/* RBAC Role Switcher widgets */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1.5 px-3">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Access Role:</label>
              <select
                value={currentUser.id}
                onChange={(e) => handleUserRoleChange(e.target.value)}
                className="bg-transparent text-xxs font-bold text-white outline-none cursor-pointer border-none"
              >
                {SEED_USERS.map((user) => (
                  <option key={user.id} value={user.id} className="bg-slate-950 text-white">
                    {user.name} ({user.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Notification alert bell */}
            <button 
              type="button"
              onClick={() => setIsAlertsOpen(true)}
              className="relative p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all text-slate-300 hover:text-white cursor-pointer group"
              title="View deadelines & task exceptions"
            >
              <Bell className="w-4 h-4" />
              {notificationsList.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-extrabold text-white animate-pulse">
                  {notificationsList.length}
                </span>
              )}
            </button>

            {/* Register lead btn */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xxs p-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer transition-all hover:translate-y-[-1px]"
            >
              <Plus className="w-4 h-4" />
              <span>New Lead</span>
            </button>

            {/* Logout btn */}
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xxs p-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>Logout</span>
            </button>

          </div>

        </div>
      </header>

      {activeView === 'leads' && (
        <>
          {/* SUB CONTROLLER MODULE: TABS, SEARCH, FILTERS */}
          <section className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 shrink-0 z-10 shadow-xxs">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              
              {/* Section 1: Dashboard navigation tab list */}
              <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl self-start">
            {[
              { id: 'dashboard', label: 'CRM Dashboard', icon: LayoutDashboard },
              { id: 'kanban', label: 'Pipeline Stage Board', icon: KanbanSquare },
              { id: 'list', label: 'Detailed Leads List', icon: List }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 p-1.5 px-3.5 text-xxs font-semibold rounded-lg transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/55'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section 2: Core search filtration parameters */}
          {activeTab !== 'dashboard' && (
            <div className="flex flex-wrap items-center gap-2.5 flex-1 md:justify-end">
              
              {/* Search query input */}
              <div className="relative flex-1 max-w-sm min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Query brand, name, emails..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 pl-8 outline-none text-xxs focus:bg-white focus:border-blue-500 transition-all font-medium"
                />
              </div>

              {/* Service filtering select */}
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xxs p-1.5 rounded-lg outline-none max-w-[150px] font-medium text-slate-800"
              >
                <option value="all">Any Service</option>
                {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              {/* Priority filtering select */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xxs p-1.5 rounded-lg outline-none font-medium text-slate-800"
              >
                <option value="all">Any Priority</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>

            </div>
          )}

        </div>
      </section>

      {/* CORE ACTIVE WORKSPACE LAYOUT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 z-0">
        
        {/* Conditional Tab Rendering */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            leads={leads} 
            currentUser={currentUser} 
            onSelectLead={(id) => setSelectedLeadId(id)}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard 
            leads={processedLeads} 
            currentUser={currentUser} 
            onSelectLead={(id) => setSelectedLeadId(id)}
            onUpdateLeadStage={handleUpdateLeadStage}
          />
        )}

        {activeTab === 'list' && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            {/* Table Header / Action details */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-xxs text-slate-500">
              <span className="font-semibold text-slate-700">Client Accounts Portfolio ({processedLeads.length} total)</span>
              <span>Sorted by Creation Date</span>
            </div>

            {/* List Table wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xxs">
                <thead>
                  <tr className="bg-slate-100/50 text-slate-450 border-b border-slate-100">
                    <th className="p-4 font-semibold uppercase tracking-wider">Company & Brand</th>
                    <th className="p-4 font-semibold uppercase tracking-wider">Contact Name</th>
                    <th className="p-4 font-semibold uppercase tracking-wider">Consulting Scope</th>
                    <th className="p-4 font-semibold uppercase tracking-wider">Acquisition Stage</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-right">Deal Budget</th>
                    <th className="p-4 font-semibold uppercase tracking-wider">Location</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-center">Priority</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">No matching client leads found in selected parameters.</td>
                    </tr>
                  ) : (
                    processedLeads.map((lead) => {
                      const hasOverdue = lead.tasks.some(t => !t.completed && new Date(t.dueDate) < new Date('2026-06-23'));

                      return (
                        <tr 
                          key={lead.id} 
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {lead.companyName}
                              {hasOverdue && (
                                <span className="inline-block w-2 h-2 rounded-full bg-rose-500" title="Overdue tasks present!" />
                              )}
                            </div>
                            <span className="text-slate-400 font-mono text-[9px] mt-0.5 block">{lead.id}</span>
                          </td>

                          <td className="p-4">
                            <div className="font-semibold text-slate-800">{lead.clientName}</div>
                            <div className="text-slate-400 mt-0.5 flex flex-col gap-0.5">
                              <span className="truncate max-w-[150px]">{lead.email}</span>
                              <span>{lead.phone}</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-sm border ${SERVICE_COLORS[lead.service]}`}>
                              {lead.service === 'custom' && lead.customService ? lead.customService : SERVICE_LABELS[lead.service]}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="inline-block p-1 px-2 font-bold text-[9px] bg-slate-100 text-slate-700 rounded-md uppercase border tracking-wider">
                              {STAGE_LABELS[lead.stage]}
                            </span>
                          </td>

                          <td className="p-4 font-extrabold text-slate-900 text-right">
                            ₹{lead.budget.toLocaleString('en-IN')}
                          </td>

                          <td className="p-4 font-medium text-slate-600">
                            {lead.location || '-'}
                          </td>

                          <td className="p-4 text-center">
                            <span className={`p-0.5 px-2 text-[9px] font-bold rounded-md border uppercase ${PRIORITY_COLORS[lead.priority]}`}>
                              {lead.priority}
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedLeadId(lead.id)}
                              className="bg-white hover:bg-slate-50 border border-slate-200 text-[10px] text-blue-600 font-semibold p-1 px-3 rounded-lg shadow-xxs transition-all cursor-pointer"
                            >
                              Manage Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
      </>
      )}

      {activeView === 'maintenance' && (
        <MaintenanceView 
          records={maintenanceRecords} 
          onSaveRecord={handleSaveMaintenanceRecord}
          onMarkPaid={handleMarkPaidMaintenance}
        />
      )}

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xxs p-4 shrink-0 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>&copy; One Devs CRM System &bull; Internal Workspace Portal.</p>
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span>Database Synchronized:</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" /> Offline Local storage Persistence (active fallback)
            </span>
          </div>
        </div>
      </footer>

      {/* DYNAMIC MODALS & DRAWERS OVERLAYS */}
      
      {/* Alert deadliness panel */}
      <NotificationAlerts 
        alerts={notificationsList}
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onSelectLead={(id) => {
          setSelectedLeadId(id);
          setActiveTab('kanban'); // slide over directly to board
        }}
      />

      {/* Lead details slider drawer */}
      {selectedLeadId && (
        <LeadDetailModal 
          leadId={selectedLeadId}
          leads={leads}
          currentUser={currentUser}
          onClose={() => setSelectedLeadId(null)}
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
        />
      )}

      {/* Register lead modal screen */}
      <LeadFormModal 
        isOpen={isFormOpen}
        currentUser={currentUser}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateLead}
        leads={leads}
      />

    </div>
  );
}
