import React, { useState, useMemo } from 'react';
import { MaintenanceRecord, MAINTENANCE_SERVICE_LABELS } from '../types';
import { Plus, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import MaintenanceFormModal from './MaintenanceFormModal.tsx';

interface MaintenanceViewProps {
  records: MaintenanceRecord[];
  onSaveRecord: (record: MaintenanceRecord) => void;
  onMarkPaid: (recordId: string) => void;
}

export default function MaintenanceView({ records, onSaveRecord, onMarkPaid }: MaintenanceViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleSave = (record: MaintenanceRecord) => {
    onSaveRecord(record);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];
    
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.clientName.toLowerCase().includes(q) || 
        r.companyName.toLowerCase().includes(q)
      );
    }
    
    // Status
    if (statusFilter !== 'all') {
      result = result.filter(r => r.paymentStatus === statusFilter);
    }
    
    // Service
    if (serviceTypeFilter !== 'all') {
      result = result.filter(r => r.serviceType === serviceTypeFilter);
    }
    
    // Overdue
    if (showOverdueOnly) {
      const today = new Date().getTime();
      result = result.filter(r => r.paymentStatus === 'pending' && new Date(r.endDate).getTime() < today);
    }

    // Sort by date (newest start date first) or pending first
    return result.sort((a, b) => {
      if (a.paymentStatus === 'pending' && b.paymentStatus === 'paid') return -1;
      if (a.paymentStatus === 'paid' && b.paymentStatus === 'pending') return 1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [records, searchQuery, statusFilter, serviceTypeFilter, showOverdueOnly]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative p-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Service Maintenance</h1>
            <p className="text-sm text-slate-500 mt-1">Manage recurring maintenance services and tracking</p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Maintenance
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center flex-1">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white max-w-[200px]"
            >
              <option value="all">All Services</option>
              {Object.entries(MAINTENANCE_SERVICE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showOverdueOnly}
              onChange={(e) => setShowOverdueOnly(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
            />
            <span className="font-medium text-rose-700">Show Overdue</span>
          </label>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Client / Company</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Frequency</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No maintenance records found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{record.clientName}</div>
                        <div className="text-xs text-slate-500">{record.companyName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {MAINTENANCE_SERVICE_LABELS[record.serviceType]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-slate-800">{formatDate(record.startDate)}</div>
                        <div className="text-xs text-slate-500">to {formatDate(record.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        ₹{record.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {record.paymentFrequency.replace('-', ' ')}
                      </td>
                      <td className="px-6 py-4">
                        {record.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors px-2 py-1"
                          >
                            Edit
                          </button>
                          {record.paymentStatus === 'pending' && (
                            <button
                              onClick={() => onMarkPaid(record.id)}
                              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <MaintenanceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        recordToEdit={editingRecord}
      />
    </div>
  );
}
