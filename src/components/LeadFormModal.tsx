/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lead, LeadStage, ServiceType, SERVICE_LABELS, User } from '../types';
import { SEED_USERS } from '../utils/dataStore';
import { X, Save, AlertCircle } from 'lucide-react';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'tasks' | 'activities'>) => void;
  currentUser: User;
  leads: Lead[];
}

export default function LeadFormModal({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  leads
}: LeadFormModalProps) {
  // Input states
  const [existingClientId, setExistingClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [service, setService] = useState<ServiceType>('website_development');
  const [customService, setCustomService] = useState('');
  const [budget, setBudget] = useState('');
  const [stage, setStage] = useState<LeadStage>('new');
  const [assignedTo, setAssignedTo] = useState(SEED_USERS[0].name);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [meetingDate, setMeetingDate] = useState('');

  // Local Validation feedback
  const [errorMsg, setErrorMsg] = useState('');

  // Auto set assignedTo to logged in user if they are an agent
  useEffect(() => {
    if (currentUser.role === 'agent') {
      setAssignedTo(currentUser.name);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field checks
    if (!clientName.trim() || !companyName.trim() || !email.trim() || !phone.trim() || !budget) {
      setErrorMsg('All contact fields and estimated deal budgets are mandatory.');
      return;
    }

    if (service === 'custom' && !customService.trim()) {
      setErrorMsg('Please specify the custom service.');
      return;
    }

    // Email pattern check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please specify a valid company email address.');
      return;
    }

    // Budget parse
    const parsedBudget = parseFloat(budget);
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setErrorMsg('Budget allocation must be a strictly positive number format.');
      return;
    }

    // Emit payload
    onSubmit({
      clientName: clientName.trim(),
      companyName: companyName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      service,
      customService: service === 'custom' ? customService.trim() : undefined,
      budget: parsedBudget,
      stage,
      assignedTo,
      priority,
      meetingDate: meetingDate ? new Date(meetingDate).toISOString() : null
    });

    // Reset fields
    setExistingClientId('');
    setClientName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setLocation('');
    setService('website_development');
    setCustomService('');
    setBudget('');
    setStage('new');
    setPriority('medium');
    setMeetingDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-40 flex items-center justify-center p-4 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between shrink-0">
          <h3 className="font-bold text-sm tracking-tight font-sans">
            Add New Client Acquisition Opportunity
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form area scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-xxs text-rose-700 font-semibold flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xxs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Contact Profile
            </h4>
            
            <div className="mb-2">
              <label className="text-xxs text-slate-600 block font-semibold mb-1">Select Existing Client (Optional):</label>
              <select
                value={existingClientId}
                onChange={(e) => {
                  const id = e.target.value;
                  setExistingClientId(id);
                  if (id) {
                    const existing = leads.find(l => l.id === id);
                    if (existing) {
                      setClientName(existing.clientName);
                      setCompanyName(existing.companyName);
                      setEmail(existing.email);
                      setPhone(existing.phone);
                      setLocation(existing.location || '');
                    }
                  } else {
                    setClientName('');
                    setCompanyName('');
                    setEmail('');
                    setPhone('');
                    setLocation('');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-205 border-slate-200 outline-none text-xxs p-2 rounded-lg focus:bg-white focus:border-blue-500 transition-all text-slate-800 font-medium mb-3"
              >
                <option value="">-- Enter New Client --</option>
                {Array.from(new Map(leads.map(lead => [lead.email, lead])).values()).map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.clientName} | {lead.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xxs text-slate-600 block font-semibold mb-1">Company / Brand Name:</label>
                <input
                  type="text"
                  placeholder="e.g., Gotham Enterprises LLC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 border-slate-200 outline-none text-xxs p-2 rounded-lg focus:bg-white focus:border-blue-500 transition-all text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-xxs text-slate-600 block font-semibold mb-1">Contact Person:</label>
                <input
                  type="text"
                  placeholder="e.g., Bruce Wayne"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 border-slate-200 outline-none text-xxs p-2 rounded-lg focus:bg-white focus:border-blue-500 transition-all text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-xxs text-slate-600 block font-semibold mb-1">Corporate Email Address:</label>
                <input
                  type="email"
                  placeholder="e.g., contact@gotham.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 border-slate-200 outline-none text-xxs p-2 rounded-lg focus:bg-white focus:border-blue-500 transition-all text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-xxs text-slate-600 block font-semibold mb-1">Direct Contact Number:</label>
                <input
                  type="text"
                  placeholder="e.g., +1 (555) 0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 border-slate-200 outline-none text-xxs p-2 rounded-lg focus:bg-white focus:border-blue-500 transition-all text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-xxs text-slate-600 block font-semibold mb-1">Location:</label>
                <input
                  type="text"
                  placeholder="e.g., New York, NY"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 border-slate-200 outline-none text-xxs p-2 rounded-lg focus:bg-white focus:border-blue-500 transition-all text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Business particulars */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xxs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Deal Parameters
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xxs text-slate-600 block font-semibold mb-1">Required Service Category:</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value as ServiceType)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xxs p-2 rounded-lg text-slate-800"
                >
                  {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {service === 'custom' && (
                <div>
                  <label className="text-xxs text-slate-600 block font-semibold mb-1">Custom Service Details:</label>
                  <input
                    type="text"
                    placeholder="e.g., Blockchain Integration"
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 border-slate-200 outline-none text-xxs p-2 rounded-lg focus:bg-white focus:border-blue-500 transition-all text-slate-800 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="text-xxs text-slate-600 block font-semibold mb-1">Estimated Budget Amount (INR):</label>
                <input
                  type="number"
                  placeholder="e.g., 25000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 border-slate-200 outline-none text-xxs p-2 rounded-lg focus:bg-white focus:border-blue-500 transition-all text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-xxs text-slate-600 block font-semibold mb-1">Sales Stage Initializer:</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as LeadStage)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xxs p-2 rounded-lg text-slate-800 font-semibold"
                >
                  <option value="new">New Lead</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal_sent">Proposal Sent</option>
                  <option value="negotiating">Negotiating</option>
                </select>
              </div>

              <div>
                <label className="text-xxs text-slate-600 block font-semibold mb-1">Lead Priority Index:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as typeof priority)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xxs p-2 rounded-lg text-slate-800"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="text-xxs text-slate-600 block font-semibold mb-1">CRM Lead Assignee:</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  disabled={currentUser.role === 'agent'}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xxs p-2 rounded-lg text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {SEED_USERS.map((user) => (
                    <option key={user.id} value={user.name}>{user.name} ({user.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xxs text-slate-600 block font-semibold mb-1">Schedule First Consultation Meeting (Optional):</label>
                <input
                  type="datetime-local"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none text-xxs p-2 rounded-lg text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2 px-4 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 font-semibold text-xxs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="p-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xxs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Register Opportunity</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
