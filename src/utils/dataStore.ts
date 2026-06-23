/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead, User, UserRole, Activity, Note, Task } from '../types';

// Anchor point relative to the local time provided in metadata: 2026-06-23
const BASE_DATE = '2026-06-23';

export const SEED_USERS: User[] = [
  { id: '1', name: 'One Devs', email: 'depriya306@gmail.com', role: 'admin' },
  { id: '2', name: 'Sarah Connor', email: 'sarah.connor@agency.com', role: 'manager' },
  { id: '3', name: 'Alex Mercer', email: 'alex.mercer@agency.com', role: 'agent' }
];

export const SEED_LEADS: Lead[] = [
  {
    id: 'lead-1',
    clientName: 'Sarah Jenkins',
    companyName: 'Apex Healthtech',
    email: 'sjenkins@apexhealth.com',
    phone: '+1 (555) 234-5678',
    service: 'app_development',
    budget: 45000,
    stage: 'negotiating',
    assignedTo: 'Sarah Connor',
    priority: 'high',
    createdAt: '2026-06-15T10:00:00.000Z',
    updatedAt: '2026-06-22T14:30:00.000Z',
    meetingDate: '2026-06-24T11:00:00-07:00', // Upcoming Tomorrow
    notes: [
      {
        id: 'n-1',
        author: 'Sarah Connor',
        content: 'Client requested an HIPAA-compliant patient communication app with custom video consultation. Proposal presented; they are reviewing legal clauses in our SLA.',
        createdAt: '2026-06-20T16:00:00.000Z'
      },
      {
        id: 'n-2',
        author: 'Sarah Connor',
        content: 'Revised the pricing slightly to include ongoing maintenance SLA. Response pending.',
        createdAt: '2026-06-22T14:30:00.000Z'
      }
    ],
    tasks: [
      { id: 't-1', title: 'Prepare final pricing breakdown', dueDate: '2026-06-21', completed: true },
      { id: 't-2', title: 'Review legal feedback on SLA clauses', dueDate: '2026-06-24', completed: false }
    ],
    activities: [
      {
        id: 'act-1',
        type: 'creation',
        description: 'Lead uploaded initially from contact form',
        timestamp: '2026-06-15T10:00:00.000Z',
        user: 'System'
      },
      {
        id: 'act-2',
        type: 'stage_change',
        description: 'Stage updated from "New" to "Negotiating"',
        timestamp: '2026-06-20T16:05:00.000Z',
        user: 'Sarah Connor'
      }
    ]
  },
  {
    id: 'lead-2',
    clientName: 'Marcus Aurelius',
    companyName: 'Stoic Digital Solutions',
    email: 'marcus@stoicdigital.io',
    phone: '+1 (555) 987-6543',
    service: 'ecommerce_website',
    budget: 28000,
    stage: 'proposal_sent',
    assignedTo: 'Alex Mercer',
    priority: 'medium',
    createdAt: '2026-06-18T08:30:00.000Z',
    updatedAt: '2026-06-21T09:00:00.000Z',
    meetingDate: '2026-06-25T15:00:00-07:00', // Upcoming soon
    notes: [
      {
        id: 'n-3',
        author: 'Alex Mercer',
        content: 'Wants to replatform from Shopify to a custom Next.js/Tailwind headless setup. Looking for superior page loading speeds and SEO indexability.',
        createdAt: '2026-06-18T09:15:00.000Z'
      }
    ],
    tasks: [
      { id: 't-3', title: 'Draft technical spec proposal doc', dueDate: '2026-06-20', completed: true },
      { id: 't-4', title: 'Send proposal document over email', dueDate: '2026-06-21', completed: true },
      { id: 't-5', title: 'Follow-up call on headless proposal feedback', dueDate: '2026-06-22', completed: false } // Overdue!
    ],
    activities: [
      {
        id: 'act-3',
        type: 'task_completed',
        description: 'Completed task: "Draft technical spec proposal doc"',
        timestamp: '2026-06-20T15:30:00.000Z',
        user: 'Alex Mercer'
      }
    ]
  },
  {
    id: 'lead-3',
    clientName: 'Clara Oswald',
    companyName: 'Chronology Labs',
    email: 'clara@chronolabs.com',
    phone: '+44 20 7946 0192',
    service: 'custom_software_development',
    budget: 95000,
    stage: 'new',
    assignedTo: 'One Devs',
    priority: 'high',
    createdAt: '2026-06-22T19:00:00.000Z',
    updatedAt: '2026-06-22T19:00:00.000Z',
    meetingDate: '2026-06-23T10:00:00-07:00', // Extremely busy, upcoming right now/today!
    notes: [
      {
        id: 'n-4',
        author: 'One Devs',
        content: 'High priority lead. Complex database sync required with proprietary time-series engine. Budget matches enterprise expectations.',
        createdAt: '2026-06-22T19:05:00.000Z'
      }
    ],
    tasks: [
      { id: 't-6', title: 'Pre-meeting introductory sync preparation', dueDate: '2026-06-23', completed: false } // Due Today
    ],
    activities: [
      {
        id: 'act-4',
        type: 'creation',
        description: 'Inbound high-budget software development inquiry added',
        timestamp: '2026-06-22T19:00:00.000Z',
        user: 'One Devs'
      }
    ]
  },
  {
    id: 'lead-4',
    clientName: 'David Attenborough',
    companyName: 'Biosphere Media',
    email: 'david@biosphere.org',
    phone: '+44 116 123 4567',
    service: 'seo_optimization',
    budget: 12000,
    stage: 'won',
    assignedTo: 'Alex Mercer',
    priority: 'low',
    createdAt: '2026-06-10T11:00:00.000Z',
    updatedAt: '2026-06-19T16:00:00.000Z',
    meetingDate: null,
    notes: [
      {
        id: 'n-5',
        author: 'Alex Mercer',
        content: 'Deal closed! Retainer signed for a 6-month continuous organic optimization campaign covering biodiversity keywords. First invoice paid.',
        createdAt: '2026-06-19T16:00:00.000Z'
      }
    ],
    tasks: [
      { id: 't-7', title: 'Set up Google Search Console and Analytics', dueDate: '2026-06-15', completed: true },
      { id: 't-8', title: 'Sitemap audit and technical fixes', dueDate: '2026-06-22', completed: true }
    ],
    activities: [
      {
        id: 'act-5',
        type: 'stage_change',
        description: 'Stage closed-won! Contract fully signed',
        timestamp: '2026-06-19T16:00:00.000Z',
        user: 'Alex Mercer'
      }
    ]
  },
  {
    id: 'lead-5',
    clientName: 'Bruce Wayne',
    companyName: 'Wayne Enterprises Tech',
    email: 'bwayne@waynecorp.com',
    phone: '+1 (555) 777-8888',
    service: 'custom_website_development',
    budget: 110000,
    stage: 'qualified',
    assignedTo: 'Sarah Connor',
    priority: 'high',
    createdAt: '2026-05-25T14:00:00.000Z',
    updatedAt: '2026-06-20T10:00:00.000Z',
    notes: [
      {
        id: 'n-6',
        author: 'Sarah Connor',
        content: 'Understands custom requirements. Will need high redundancy, server clustering, and top-tier security standards.',
        createdAt: '2026-06-19T12:00:00.000Z'
      }
    ],
    tasks: [
      { id: 't-9', title: 'Compliance questionnaire review', dueDate: '2026-06-18', completed: false } // Overdue!
    ],
    activities: [
      {
        id: 'act-6',
        type: 'note_added',
        description: 'Compliance & high security requirements note added',
        timestamp: '2026-06-19T12:00:00.000Z',
        user: 'Sarah Connor'
      }
    ]
  },
  {
    id: 'lead-6',
    clientName: 'Lily Potter',
    companyName: 'Lily Floral Designs',
    email: 'lily@lilydesigns.co',
    phone: '+1 (310) 938-1283',
    service: 'digital_marketing',
    budget: 3500,
    stage: 'contacted',
    assignedTo: 'Alex Mercer',
    priority: 'low',
    createdAt: '2026-06-21T09:00:00.000Z',
    updatedAt: '2026-06-22T10:00:00.000Z',
    meetingDate: '2026-06-22T09:00:00-07:00', // Past meeting date
    notes: [
      {
        id: 'n-7',
        author: 'Alex Mercer',
        content: 'Brief chat on Instagram ads setup. She wants to run ads during wedding seasons. Low budget, but good recurring retainer potential.',
        createdAt: '2026-06-22T10:00:00.000Z'
      }
    ],
    tasks: [
      { id: 't-10', title: 'Draft basic digital marketing plan overview', dueDate: '2026-06-25', completed: false }
    ],
    activities: [
      {
        id: 'act-7',
        type: 'meeting_scheduled',
        description: 'Meeting conducted initially',
        timestamp: '2026-06-22T09:00:00.000Z',
        user: 'Alex Mercer'
      }
    ]
  },
  {
    id: 'lead-7',
    clientName: 'Sherlock Holmes',
    companyName: '221B Consulting',
    email: 'sherlock@bakerstreet.com',
    phone: '+44 79 1112 3344',
    service: 'website_development',
    budget: 15000,
    stage: 'lost',
    assignedTo: 'Sarah Connor',
    priority: 'medium',
    createdAt: '2026-06-05T10:00:00.000Z',
    updatedAt: '2026-06-10T16:00:00.000Z',
    meetingDate: null,
    notes: [
      {
        id: 'n-8',
        author: 'Sarah Connor',
        content: 'Client went silent. Decided they don\'t need a full website rewrite and can continue utilizing standard blogs.',
        createdAt: '2026-06-10T16:00:00.000Z'
      }
    ],
    tasks: [],
    activities: [
      {
        id: 'act-8',
        type: 'stage_change',
        description: 'Lead marked as Lost (Closed)',
        timestamp: '2026-06-10T16:00:00.000Z',
        user: 'Sarah Connor'
      }
    ]
  }
];

// Helper to load leads from LocalStorage
export async function fetchLeadsAsync(): Promise<Lead[]> {
  try {
    const response = await fetch('/api/leads');
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data) && data.length > 0) {
        saveLeadsToStore(data);
        return data; // using API data
      }
    }
  } catch (error) {
    console.error('Failed to fetch from API, falling back to localstore:', error);
  }

  return getLeadsFromStore();
}

export function getLeadsFromStore(): Lead[] {
  try {
    const data = localStorage.getItem('agency_leads_data_v1');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to parse leads from localstorage', error);
  }
  
  saveLeadsToStore(SEED_LEADS);
  return SEED_LEADS;
}

export async function saveLeadsToStoreAsync(leads: Lead[]): Promise<void> {
  saveLeadsToStore(leads);
  // Optional full sync array, but mostly we mutate single records via REST if we rewrite App.tsx.
  // For the sake of simplicity, we just sync to localstore in bulk and in background to API.
  try {
    // We can do a mass API sync here if we implement /api/leads/sync
    // Or just let individual methods update API
  } catch (err) {
    console.error('API sync error', err);
  }
}

// Helper to save leads to LocalStorage
export function saveLeadsToStore(leads: Lead[]): void {
  try {
    localStorage.setItem('agency_leads_data_v1', JSON.stringify(leads));
  } catch (error) {
    console.error('Failed to save leads to localstorage', error);
  }
}

// User context tools
export function getLoggedInUser(): User {
  const defaultUser = SEED_USERS[0]; // One Devs (Admin)
  try {
    const data = localStorage.getItem('agency_current_user_v1');
    if (data) {
      const parsed = JSON.parse(data) as User;
      // Ensure it matches one of our actual seed users for consistency
      const match = SEED_USERS.find(u => u.id === parsed.id);
      if (match) return match;
    }
  } catch (error) {
    console.error('Failed to load logged in user', error);
  }
  return defaultUser;
}

export function saveLoggedInUser(user: User): void {
  try {
    localStorage.setItem('agency_current_user_v1', JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save current user', error);
  }
}

// Filter utilities
export function filterLeadsByRole(leads: Lead[], user: User): Lead[] {
  // If user is Admin or Manager, they see EVERYTHING
  if (user.role === 'admin' || user.role === 'manager') {
    return leads;
  }
  // If user is Agent, they see only leads assigned specifically to them
  return leads.filter(lead => lead.assignedTo.toLowerCase() === user.name.toLowerCase());
}

// Core stats builder
export interface DashboardStats {
  totalLeads: number;
  totalPipelineValue: number;
  conversionRate: number; // Won leads / (Won + Lost + Active)
  projectedRevenue: number; // Sum(Won) + Sum(Weighted potential of active pipeline based on probability)
  stageCounts: Record<string, number>;
  serviceValue: Record<string, number>;
  monthlyTrend: { name: string; value: number }[];
}

// Probability weighting of sales stages
export const STAGE_PROBABILITIES: Record<string, number> = {
  new: 0.1,         // 10%
  contacted: 0.2,   // 20%
  qualified: 0.4,   // 40%
  proposal_sent: 0.65, // 65%
  negotiating: 0.8, // 80%
  won: 1.0,         // 100%
  lost: 0.0,        // 0%
};

export function calculateStats(leads: Lead[]): DashboardStats {
  const totalLeads = leads.length;
  
  // Calculate pipeline values
  let totalPipelineValue = 0;
  let closedWonCount = 0;
  let closedLostCount = 0;
  let projectedRevenue = 0;
  
  const stageCounts: Record<string, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal_sent: 0,
    negotiating: 0,
    won: 0,
    lost: 0
  };

  const serviceValue: Record<string, number> = {
    website_development: 0,
    app_development: 0,
    ecommerce_website: 0,
    custom_website_development: 0,
    custom_software_development: 0,
    digital_marketing: 0,
    seo_optimization: 0
  };

  leads.forEach(lead => {
    const value = lead.budget;
    stageCounts[lead.stage] = (stageCounts[lead.stage] || 0) + 1;
    
    // Sum pipe value (unclosed/active)
    if (lead.stage !== 'lost') {
      totalPipelineValue += value;
    }
    
    if (lead.stage === 'won') {
      closedWonCount++;
      projectedRevenue += value; // 100% of won
    } else if (lead.stage === 'lost') {
      closedLostCount++;
    } else {
      // Weighted projection: value * probability
      const probability = STAGE_PROBABILITIES[lead.stage] || 0.1;
      projectedRevenue += Math.round(value * probability);
    }

    if (lead.stage !== 'lost') {
      serviceValue[lead.service] = (serviceValue[lead.service] || 0) + value;
    }
  });

  const totalClosed = closedWonCount + closedLostCount;
  const conversionRate = totalClosed > 0 ? (closedWonCount / totalClosed) * 100 : 0;

  // Monthly trend mock
  const monthlyTrend = [
    { name: 'Jan', value: 34000 },
    { name: 'Feb', value: 48000 },
    { name: 'Mar', value: 65000 },
    { name: 'Apr', value: 82000 },
    { name: 'May', value: 110000 },
    { name: 'Jun (YTD)', value: projectedRevenue }
  ];

  return {
    totalLeads,
    totalPipelineValue,
    conversionRate,
    projectedRevenue,
    stageCounts,
    serviceValue,
    monthlyTrend
  };
}

// Deadlines & Alerting Core Logic
export interface AlertNotification {
  id: string;
  leadId: string;
  leadName: string;
  companyName: string;
  type: 'meeting_deadline' | 'overdue_task';
  title: string;
  description: string;
  timeDiffString: string;
  isUrgent: boolean;
}

export function generateAlerts(leads: Lead[]): AlertNotification[] {
  const alerts: AlertNotification[] = [];
  const now = new Date(BASE_DATE); // Anchoring to local base date

  leads.forEach(lead => {
    // 1. Check for upcoming meetings in the next 48 hours or overdue today
    if (lead.meetingDate) {
      const meet = new Date(lead.meetingDate);
      const diffMs = meet.getTime() - now.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);

      if (diffHrs >= -24 && diffHrs <= 48) {
        let text = '';
        let isUrgent = false;
        
        if (diffHrs < 0) {
          text = `Conducted/Past meeting (${Math.round(Math.abs(diffHrs))} hrs ago)`;
        } else if (diffHrs <= 2) {
          text = `Meeting commencing VERY soon (within 2 hours)!`;
          isUrgent = true;
        } else {
          text = `Scheduled in ${Math.round(diffHrs)} hours`;
          isUrgent = diffHrs <= 24;
        }

        alerts.push({
          id: `alert-meet-${lead.id}`,
          leadId: lead.id,
          leadName: lead.clientName,
          companyName: lead.companyName,
          type: 'meeting_deadline',
          title: `Upcoming Client Meeting`,
          description: `Discussions on ${lead.service.replace(/_/g, ' ')} budget allocation.`,
          timeDiffString: text,
          isUrgent
        });
      }
    }

    // 2. Overdue tasks: uncompleted tasks with due date strictly before 2026-06-23
    lead.tasks.forEach(task => {
      if (!task.completed) {
        const taskDue = new Date(task.dueDate);
        const diffMs = now.getTime() - taskDue.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays >= 0) { // Due today or in the past
          let text = '';
          if (diffDays === 0) {
            text = 'DUE TODAY';
          } else {
            text = `OVERDUE BY ${diffDays} DAY${diffDays > 1 ? 'S' : ''}`;
          }

          alerts.push({
            id: `alert-task-${task.id}`,
            leadId: lead.id,
            leadName: lead.clientName,
            companyName: lead.companyName,
            type: 'overdue_task',
            title: `Overdue Followup: ${task.title}`,
            description: `Assigned task backlog under ${lead.companyName}.`,
            timeDiffString: text,
            isUrgent: diffDays > 0
          });
        }
      }
    });
  });

  return alerts;
}
