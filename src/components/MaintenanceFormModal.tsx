import React, { useState, useEffect } from 'react';
import { MaintenanceRecord, MaintenanceServiceType, PaymentFrequency, MAINTENANCE_SERVICE_LABELS } from '../types';
import { X } from 'lucide-react';

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: MaintenanceRecord) => void;
  recordToEdit?: MaintenanceRecord | null;
}

export default function MaintenanceFormModal({ isOpen, onClose, onSave, recordToEdit }: MaintenanceFormModalProps) {
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceType, setServiceType] = useState<MaintenanceServiceType>('website_maintenance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('monthly');

  useEffect(() => {
    if (recordToEdit) {
      setClientName(recordToEdit.clientName);
      setCompanyName(recordToEdit.companyName);
      setServiceType(recordToEdit.serviceType);
      setStartDate(recordToEdit.startDate.split('T')[0]);
      setEndDate(recordToEdit.endDate.split('T')[0]);
      setAmount(recordToEdit.amount);
      setPaymentFrequency(recordToEdit.paymentFrequency);
    } else {
      setClientName('');
      setCompanyName('');
      setServiceType('website_maintenance');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setAmount(0);
      setPaymentFrequency('monthly');
    }
  }, [recordToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: MaintenanceRecord = {
      id: recordToEdit?.id || `maint-${Date.now()}`,
      clientName,
      companyName,
      serviceType,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      amount,
      paymentFrequency,
      paymentStatus: recordToEdit?.paymentStatus || 'pending',
      createdAt: recordToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {recordToEdit ? 'Edit Maintenance Record' : 'New Maintenance Record'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Service Type</label>
            <select
              value={serviceType}
              onChange={e => setServiceType(e.target.value as MaintenanceServiceType)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-colors"
            >
              {Object.entries(MAINTENANCE_SERVICE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Frequency</label>
              <select
                value={paymentFrequency}
                onChange={e => setPaymentFrequency(e.target.value as PaymentFrequency)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-colors"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Duration From</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Duration To</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
