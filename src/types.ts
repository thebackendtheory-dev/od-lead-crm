/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'manager' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'won' | 'lost';

export type ServiceType = 
  | 'website_development'
  | 'app_development'
  | 'ecommerce_website'
  | 'custom_website_development'
  | 'custom_software_development'
  | 'digital_marketing'
  | 'seo_optimization';

export interface Note {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Activity {
  id: string;
  type: 'creation' | 'stage_change' | 'note_added' | 'task_added' | 'task_completed' | 'meeting_scheduled' | 'assignment';
  description: string;
  timestamp: string;
  user: string;
}

export interface Lead {
  id: string;
  clientName: string;
  companyName: string;
  email: string;
  phone: string;
  service: ServiceType;
  budget: number;
  stage: LeadStage;
  assignedTo: string; // references User.id or User.name
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  meetingDate?: string | null; // Date and time of upcoming meeting
  notes: Note[];
  tasks: Task[];
  activities: Activity[];
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  website_development: 'Website Development',
  app_development: 'App Development',
  ecommerce_website: 'E-commerce Website',
  custom_website_development: 'Custom Website Development',
  custom_software_development: 'Custom Software Development',
  digital_marketing: 'Digital Marketing',
  seo_optimization: 'SEO Optimization',
};

export const SERVICE_COLORS: Record<ServiceType, string> = {
  website_development: 'bg-blue-50 text-blue-700 border-blue-200',
  app_development: 'bg-purple-50 text-purple-700 border-purple-200',
  ecommerce_website: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  custom_website_development: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  custom_software_development: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  digital_marketing: 'bg-pink-50 text-pink-700 border-pink-200',
  seo_optimization: 'bg-amber-50 text-amber-700 border-amber-200',
};

export const STAGE_LABELS: Record<LeadStage, string> = {
  new: 'New Lead',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal_sent: 'Proposal Sent',
  negotiating: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

export const STAGE_COLORS: Record<LeadStage, string> = {
  new: 'bg-slate-100 text-slate-800 border-slate-200',
  contacted: 'bg-blue-100 text-blue-800 border-blue-200',
  qualified: 'bg-amber-100 text-amber-800 border-amber-200',
  proposal_sent: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  negotiating: 'bg-purple-100 text-purple-800 border-purple-200',
  won: 'bg-emerald-100 text-emerald-850 border-emerald-200',
  lost: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const PRIORITY_COLORS = {
  low: 'bg-slate-50 text-slate-600 border-slate-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
};
