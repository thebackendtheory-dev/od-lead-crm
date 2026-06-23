/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Lead, Note, Task, User, LeadStage, ServiceType, SERVICE_LABELS, STAGE_LABELS, UserRole } from '../types';
import { SEED_USERS } from '../utils/dataStore';
import { 
  X, 
  Trash2, 
  Calendar, 
  Plus, 
  Check, 
  Clock, 
  MessageSquare, 
  CheckSquare, 
  History, 
  User as UserIcon, 
  FileText,
  IndianRupee,
  Briefcase,
  AlertCircle,
  Edit2,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeadDetailModalProps {
  leadId: string | null;
  currentUser: User;
  onClose: () => void;
  leads: Lead[];
  onUpdateLead: (updatedLead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

export default function LeadDetailModal({
  leadId,
  currentUser,
  onClose,
  leads,
  onUpdateLead,
  onDeleteLead
}: LeadDetailModalProps) {
  // Find lead
  const lead = useMemo(() => {
    return leads.find(l => l.id === leadId) || null;
  }, [leads, leadId]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'details' | 'tasks' | 'notes' | 'history'>('details');

  // Input states for creating objects
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Editing core details
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editForm, setEditForm] = useState({
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    budget: 0,
  });

  // Sync edit form when lead or isEditing changes
  React.useEffect(() => {
    if (lead && isEditing) {
      setEditForm({
        clientName: lead.clientName,
        companyName: lead.companyName,
        email: lead.email,
        phone: lead.phone,
        budget: lead.budget,
      });
    }
  }, [lead, isEditing]);

  if (!lead) return null;

  // Authorization checks
  const canDelete = currentUser.role === 'admin' || currentUser.role === 'manager';
  const canAssign = currentUser.role === 'admin' || currentUser.role === 'manager';

  // Log user activity
  const appendActivity = (leadObj: Lead, type: Lead['activities'][0]['type'], description: string): Lead => {
    const freshAct: Lead['activities'][0] = {
      id: `act-${Date.now()}`,
      type,
      description,
      timestamp: new Date().toISOString(),
      user: currentUser.name
    };
    return {
      ...leadObj,
      updatedAt: new Date().toISOString(),
      activities: [freshAct, ...leadObj.activities]
    };
  };

  // State update handlers
  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement> | string) => {
    const nextStage = typeof e === 'string' ? e : e.target.value;
    if (!nextStage) return;
    
    let updated = { ...lead, stage: nextStage as LeadStage };
    const labelBefore = STAGE_LABELS[lead.stage];
    const labelAfter = STAGE_LABELS[nextStage as LeadStage];
    
    updated = appendActivity(updated, 'stage_change', `Stage updated from "${labelBefore}" to "${labelAfter}"`);
    onUpdateLead(updated);
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assignee = e.target.value;
    let updated = { ...lead, assignedTo: assignee };
    updated = appendActivity(updated, 'assignment', `Lead reassigned to ${assignee}`);
    onUpdateLead(updated);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const priority = e.target.value as 'low' | 'medium' | 'high';
    const updated = { ...lead, priority };
    onUpdateLead(updated);
  };

  const handleMeetingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    let updated = { ...lead, meetingDate: dateStr ? new Date(dateStr).toISOString() : null };
    
    if (dateStr) {
      updated = appendActivity(updated, 'meeting_scheduled', `Meeting scheduled for ${new Date(dateStr).toLocaleString()}`);
    } else {
      updated = appendActivity(updated, 'meeting_scheduled', `Meeting schedule removed`);
    }
    
    onUpdateLead(updated);
  };

  const handleSaveDetails = () => {
    let updated = {
      ...lead,
      clientName: editForm.clientName,
      companyName: editForm.companyName,
      email: editForm.email,
      phone: editForm.phone,
      budget: editForm.budget
    };
    updated = appendActivity(updated, 'stage_change', 'Updated client profile details');
    onUpdateLead(updated);
    setIsEditing(false);
  };

  // Tasks managers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const freshTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate || '2026-06-25', // default
      completed: false
    };

    let updated = {
      ...lead,
      tasks: [...lead.tasks, freshTask]
    };
    updated = appendActivity(updated, 'task_added', `Added follow-up task: "${freshTask.title}" (Due: ${freshTask.dueDate})`);
    onUpdateLead(updated);
    
    setNewTaskTitle('');
    setNewTaskDueDate('');
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = lead.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    const target = lead.tasks.find(t => t.id === taskId);
    const actionDesc = target?.completed ? 'Reopened follow-up task' : 'Completed follow-up task';

    let updated = {
      ...lead,
      tasks: updatedTasks
    };
    updated = appendActivity(updated, 'task_completed', `${actionDesc}: "${target?.title}"`);
    onUpdateLead(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const target = lead.tasks.find(t => t.id === taskId);
    const updated = {
      ...lead,
      tasks: lead.tasks.filter(t => t.id !== taskId)
    };
    onUpdateLead(appendActivity(updated, 'task_completed', `Deleted task: "${target?.title}"`));
  };

  // Notes managers
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const freshNote: Note = {
      id: `note-${Date.now()}`,
      author: currentUser.name,
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString()
    };

    let updated = {
      ...lead,
      notes: [freshNote, ...lead.notes]
    };
    updated = appendActivity(updated, 'note_added', `Added a client acquisition log note.`);
    onUpdateLead(updated);
    setNewNoteContent('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/40 z-30 transition-opacity backdrop-blur-xs flex justify-end" onClick={onClose}>
        
        {/* Draw panel container */}
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="w-full max-w-2xl bg-white h-screen shadow-2xl flex flex-col justify-between draw-panel"
          onClick={(e) => e.stopPropagation()} // retain clicks inside
        >
          {/* Slider Header */}
          <div className="p-4 bg-slate-950 text-white flex items-center justify-between shrink-0">
            <div className="min-w-0">
              <span className="text-xxs font-extrabold text-blue-400 tracking-wider uppercase font-mono block">
                {SERVICE_LABELS[lead.service]}
              </span>
              <h3 className="text-sm font-bold truncate mt-0.5 max-w-[400px]">
                {lead.companyName}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {canDelete && (
                isConfirmingDelete ? (
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="text-xxs text-rose-300 font-semibold">Are you sure?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteLead(lead.id);
                        onClose();
                      }}
                      className="px-2 py-1 bg-rose-600 text-white hover:bg-rose-700 rounded text-xxs font-bold"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-2 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded text-xxs font-bold"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="p-1 px-2.5 text-rose-400 hover:text-white hover:bg-rose-600/20 border border-rose-900/30 rounded-lg text-xxs font-semibold flex items-center gap-1.5 transition-all"
                    title="Delete Client Account Profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Profile</span>
                  </button>
                )
              )}
              
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="bg-slate-50 border-b border-slate-100 p-3 px-5 flex flex-wrap justify-between items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xxs text-slate-401 text-slate-500 font-medium">Deal Value:</span>
              <span className="text-xs font-bold text-slate-900 flex items-center">
                <IndianRupee className="w-3.5 h-3.5 -mr-0.5 text-slate-400" />
                {lead.budget.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xxs text-slate-55 text-slate-500 font-medium">Pipeline:</span>
              <span className="inline-block">
                <select
                  value={lead.stage}
                  onChange={handleStageChange}
                  className="bg-white border border-slate-200 text-xxs font-bold p-1 rounded-md text-slate-700 outline-none"
                >
                  {Object.entries(STAGE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xxs text-slate-55 text-slate-500 font-medium">Priority:</span>
              <select
                value={lead.priority}
                onChange={handlePriorityChange}
                className={`text-xxs font-semibold p-1 border rounded-md outline-none ${
                  lead.priority === 'high' 
                    ? 'border-rose-300 text-rose-700' 
                    : lead.priority === 'medium'
                    ? 'border-amber-300 text-amber-700'
                    : 'border-slate-300 text-slate-700'
                }`}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          {/* Segmented Tab Bar */}
          <div className="flex border-b border-slate-100 px-4 pt-1 bg-slate-55/10 shrink-0">
            {[
              { id: 'details', label: 'Client Details', icon: FileText },
              { id: 'tasks', label: `Followups & Tasks (${lead.tasks.length})`, icon: CheckSquare },
              { id: 'notes', label: `Acquisition Logs (${lead.notes.length})`, icon: MessageSquare },
              { id: 'history', label: 'CRM Timeline', icon: History }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 py-3 px-3 text-xxs font-semibold transition-all border-b-2 -mb-[1px] ${
                    isSelected 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Core Content Body (scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Contact Profiles */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3 relative">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <h4 className="text-xs font-bold text-slate-900">Client Profile Information</h4>
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 text-xxs font-semibold">
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button onClick={handleSaveDetails} className="text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 text-xxs font-semibold">
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xxs">
                      <div>
                        <label className="text-slate-400 block font-semibold mb-0.5">Contact Person:</label>
                        <input
                          type="text"
                          value={editForm.clientName}
                          onChange={e => setEditForm({ ...editForm, clientName: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-slate-700 p-1.5 rounded-md outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block font-semibold mb-0.5">Company Office:</label>
                        <input
                          type="text"
                          value={editForm.companyName}
                          onChange={e => setEditForm({ ...editForm, companyName: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-slate-700 p-1.5 rounded-md outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block font-semibold mb-0.5">Email Identity:</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-slate-700 p-1.5 rounded-md outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block font-semibold mb-0.5">Phone Line:</label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full bg-white border border-slate-200 text-slate-700 p-1.5 rounded-md outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-slate-400 block font-semibold mb-0.5">Deal Value (₹):</label>
                        <input
                          type="number"
                          value={editForm.budget}
                          onChange={e => setEditForm({ ...editForm, budget: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-200 text-slate-700 p-1.5 rounded-md outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xxs">
                      <div>
                        <span className="text-slate-400 block font-semibold mb-0.5">Contact Person:</span>
                        <span className="text-slate-700 font-bold">{lead.clientName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold mb-0.5">Company Office:</span>
                        <span className="text-slate-700 font-bold">{lead.companyName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold mb-0.5">Email Identity:</span>
                        <a href={`mailto:${lead.email}`} className="text-blue-605 text-blue-600 hover:underline font-semibold block">{lead.email}</a>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold mb-0.5">Phone Line:</span>
                        <a href={`tel:${lead.phone}`} className="text-slate-700 block font-semibold hover:underline">{lead.phone}</a>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block font-semibold mb-0.5">Deal Value:</span>
                        <span className="text-slate-700 font-bold flex items-center">
                          <IndianRupee className="w-3 h-3 mr-0.5 text-slate-400" />
                          {lead.budget.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Workflow scheduling and assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Staff Assignment */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5" /> Assign Staff
                    </h4>
                    
                    <div className="mt-3">
                      <label className="text-xxs text-slate-400 block font-semibold mb-1">Lead Owner / PIC:</label>
                      <select
                        value={lead.assignedTo}
                        onChange={handleAssigneeChange}
                        disabled={!canAssign}
                        className="w-full bg-white border border-slate-200 text-xxs p-2 rounded-lg text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {SEED_USERS.map((user) => (
                          <option key={user.id} value={user.name}>{user.name} ({user.role})</option>
                        ))}
                      </select>
                      {!canAssign && (
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-slate-400" />
                          <span>Assigning changes restrict to Managers/Admins.</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CRM Calendar deadline */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Meeting Checklist
                    </h4>

                    <div className="mt-3">
                      <label className="text-xxs text-slate-400 block font-semibold mb-1">Scheduled Date & Time:</label>
                      <input
                        type="datetime-local"
                        value={lead.meetingDate ? lead.meetingDate.substring(0, 16) : ''}
                        onChange={handleMeetingChange}
                        className="w-full bg-white border border-slate-200 text-xxs p-2 rounded-lg text-slate-700 outline-none"
                      />
                      <p className="text-[9px] text-slate-400 mt-1">Triggers auto notification reminders for the team.</p>
                    </div>
                  </div>
                </div>

                {/* Service scope details */}
                <div className="p-3 bg-blue-50 border border-blue-150 rounded-xl mt-2">
                  <h4 className="text-xxs font-bold text-blue-800">IT Consulting Scope</h4>
                  <p className="text-xxs text-blue-700 mt-1 leading-relaxed">
                    Our team provides specific consulting structures to match this <strong>{SERVICE_LABELS[lead.service]}</strong> requirement. 
                    Ensure to log consistent notes during scoping of budget constraints or service timelines.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4">
                {/* Add task bar */}
                <form onSubmit={handleAddTask} className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Create New Followup Action</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="e.g., Email contract rewrite, call John..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg p-2 text-xxs text-slate-700 outline-none w-full sm:col-span-1"
                    />
                    <div className="flex gap-2 sm:col-span-1">
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg p-2 text-xxs text-slate-700 outline-none flex-1"
                      />
                      <button
                        type="submit"
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-750 font-bold text-xxs shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Task loop */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">Action Backlog Checklist</h4>
                  
                  {lead.tasks.length === 0 ? (
                    <p className="text-xxs text-slate-400 italic text-center py-6">No tasks added to this profile yet.</p>
                  ) : (
                    lead.tasks.map((task) => {
                      const isOverdue = !task.completed && new Date(task.dueDate) < new Date('2026-06-23');
                      return (
                        <div key={task.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white transition-colors">
                          <label className="flex items-start gap-2.5 cursor-pointer max-w-[80%] min-w-0">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTask(task.id)}
                              className="mt-0.5 w-3.5 h-3.5 rounded-sm text-blue-600 outline-none accent-blue-600"
                            />
                            <div className="min-w-0">
                              <span className={`text-xxs font-medium block ${task.completed ? 'line-through text-slate-45 text-slate-400' : 'text-slate-800'}`}>
                                {task.title}
                              </span>
                              <span className={`text-[9px] font-bold block mt-0.5 ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
                                Due Date: {task.dueDate} {isOverdue && '(OVERDUE)'}
                              </span>
                            </div>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                {/* Note Log Box */}
                <form onSubmit={handleAddNote} className="space-y-2.5">
                  <textarea
                    placeholder="Log a client phone call, key requirements recap, or notes on pricing negotiations..."
                    rows={3}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xxs text-slate-700 outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newNoteContent.trim()}
                      className="p-2 px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold text-xxs flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 select-none cursor-pointer"
                    >
                      <span>Log Acquisition Note</span>
                    </button>
                  </div>
                </form>

                {/* Timeline display of notes */}
                <div className="space-y-3.5 mt-2">
                  <h4 className="text-xs font-bold text-slate-850 border-b border-slate-100 pb-1.5">Acquisition History Logs</h4>
                  
                  {lead.notes.length === 0 ? (
                    <p className="text-xxs text-slate-400 italic text-center py-6">No historical notes written yet.</p>
                  ) : (
                    lead.notes.map((note) => (
                      <div key={note.id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/50">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span className="font-bold text-slate-700">{note.author}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xxs text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-850 border-b border-slate-100 pb-1.5">Historical Access Logs</h4>
                
                <div className="flow-root">
                  <ul className="-mb-8">
                    {lead.activities.map((act, actIdx) => {
                      return (
                        <li key={act.id}>
                          <div className="relative pb-8">
                            {actIdx !== lead.activities.length - 1 ? (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center ring-8 ring-white shrink-0">
                                  <Clock className="w-3.5 h-3.5" />
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 pt-1.5">
                                <p className="text-xxs text-slate-700">
                                  {act.description}{' '}
                                  <span className="font-semibold text-slate-900">&bull; {act.user}</span>
                                </p>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  {new Date(act.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer stats overview */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 shrink-0">
            <span>Last tracking synced: {new Date(lead.updatedAt).toLocaleTimeString()}</span>
            <span>Lead Ref: {lead.id}</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
