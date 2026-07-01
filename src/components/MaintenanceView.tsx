import React, { useState } from 'react';
import { MaintenanceRecord, MAINTENANCE_SERVICE_LABELS } from '../types';
import { Plus, CheckCircle, Clock } from 'lucide-react';
import MaintenanceFormModal from './MaintenanceFormModal.tsx';

interface MaintenanceViewProps {
  records: MaintenanceRecord[];
  onSaveRecord: (record: MaintenanceRecord) => void;
  onMarkPaid: (recordId: string) => void;
}

export default function MaintenanceView({ records, onSaveRecord, onMarkPaid }: MaintenanceViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

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

  // Sort by date (newest start date first) or pending first
  const sortedRecords = [...records].sort((a, b) => {
    if (a.paymentStatus === 'pending' && b.paymentStatus === 'paid') return -1;
    if (a.paymentStatus === 'paid' && b.paymentStatus === 'pending') return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative p-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
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
                {sortedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No maintenance records found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  sortedRecords.map((record) => (
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
                        {record.paymentFrequency}
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
