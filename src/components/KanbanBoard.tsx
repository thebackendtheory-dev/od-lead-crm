/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Lead, LeadStage, User, STAGE_LABELS, STAGE_COLORS, SERVICE_LABELS, SERVICE_COLORS } from '../types';
import { 
  IndianRupee, 
  User as UserIcon, 
  AlertCircle, 
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  ArrowRightLeft
} from 'lucide-react';
import { motion } from 'motion/react';

interface KanbanBoardProps {
  leads: Lead[];
  currentUser: User;
  onSelectLead: (leadId: string) => void;
  onUpdateLeadStage: (leadId: string, nextStage: LeadStage) => void;
}

const STAGES: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost'];

export default function KanbanBoard({ 
  leads, 
  currentUser, 
  onSelectLead, 
  onUpdateLeadStage 
}: KanbanBoardProps) {

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // For native HTML5 drag-and-drop: store the dragged card ID
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      onUpdateLeadStage(id, targetStage);
    }
  };

  // Group leads by stage for efficient render
  const leadsByStage = useMemo(() => {
    const map = STAGES.reduce((acc, stage) => {
      acc[stage] = [];
      return acc;
    }, {} as Record<LeadStage, Lead[]>);

    leads.forEach(lead => {
      if (map[lead.stage]) {
        map[lead.stage].push(lead);
      }
    });

    return map;
  }, [leads]);

  // Compute column properties (lead counts, financial values)
  const columnSummary = useMemo(() => {
    const summary = {} as Record<LeadStage, { totalBudget: number; count: number }>;
    
    STAGES.forEach(stage => {
      const list = leadsByStage[stage] || [];
      const totalBudget = list.reduce((sum, lead) => sum + lead.budget, 0);
      summary[stage] = {
        totalBudget,
        count: list.length
      };
    });

    return summary;
  }, [leadsByStage]);

  // Format budget currency
  const formatCompactINR = (val: number) => {
    if (val >= 1000) {
      return `₹${(val / 1000).toFixed(0)}k`;
    }
    return `₹${val}`;
  };

  return (
    <div className="space-y-4">
      {/* Dynamic guidance header */}
      <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-xxs text-slate-500 font-medium flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-600" />
          <span>
            Pipeline Board: Drag cards horizontally to advance deal stages, or tap cards for internal actions.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" /> Won</span>
          <span className="text-slate-350">|</span>
          <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-sm inline-block" /> Lost</span>
        </div>
      </div>

      {/* Board horizontal container */}
      <div 
        ref={scrollContainerRef}
        className={`overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-200 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="flex gap-4 min-w-[1240px] items-stretch">
          
          {STAGES.map((stage) => {
            const list = leadsByStage[stage] || [];
            const summary = columnSummary[stage];
            const isWonStage = stage === 'won';
            const isLostStage = stage === 'lost';
            
            return (
              <div 
                key={stage}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
                className={`w-80 shrink-0 rounded-2xl flex flex-col p-3 transition-colors ${
                  isWonStage 
                    ? 'bg-emerald-50/40 border border-emerald-100' 
                    : isLostStage 
                    ? 'bg-rose-50/40 border border-rose-100'
                    : 'bg-slate-50/65 border border-slate-100'
                }`}
                style={{ minHeight: '520px' }}
              >
                {/* Column top heading */}
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`p-1 px-2 text-[10px] font-extrabold rounded-md uppercase border ${STAGE_COLORS[stage]}`}>
                      {STAGE_LABELS[stage]}
                    </span>
                    <span className="text-xxs font-bold text-slate-400">
                      {summary.count}
                    </span>
                  </div>
                  <span className="text-xxs font-extrabold text-slate-500">
                    {formatCompactINR(summary.totalBudget)}
                  </span>
                </div>

                {/* Column Body - cards */}
                <div className="flex-1 overflow-y-auto space-y-3 max-h-[580px] pr-0.5">
                  {list.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-350 flex flex-col items-center justify-center text-[10px] bg-white/20">
                      <span>Empty column</span>
                      <span className="text-[9px] mt-0.5">Drop leads here</span>
                    </div>
                  ) : (
                    list.map((lead) => {
                      // Warning indicators
                      const hasOverdueTasks = lead.tasks.some(t => !t.completed && new Date(t.dueDate) < new Date('2026-06-23'));
                      const hasUpcomingMeeting = lead.meetingDate && new Date(lead.meetingDate) > new Date('2026-06-22');
                      
                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onClick={() => onSelectLead(lead.id)}
                          className="p-3.5 bg-white border border-slate-150 rounded-xl hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow group relative overflow-hidden"
                        >
                          {/* Left priority visual track */}
                          <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                            lead.priority === 'high' 
                              ? 'bg-rose-500' 
                              : lead.priority === 'medium'
                              ? 'bg-amber-400'
                              : 'bg-slate-300'
                          }`} />

                          {/* Company / Client block */}
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[130px]">
                              {lead.companyName}
                            </span>
                            
                            {/* Action-indicator labels */}
                            <div className="flex gap-1">
                              {hasOverdueTasks && (
                                <span className="p-0.5 bg-rose-100 text-rose-700 rounded-md" title="Overdue follow-ups">
                                  <ShieldAlert className="w-3 h-3" />
                                </span>
                              )}
                              {hasUpcomingMeeting && (
                                <span className="p-0.5 bg-blue-100 text-blue-700 rounded-md animate-pulse" title="Meeting tomorrow/soon">
                                  <Calendar className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>

                          <h4 className="text-s font-semibold text-slate-850 mt-1 truncate">
                            {lead.clientName}
                          </h4>

                          {/* Service Type badge */}
                          <div className="mt-2.5">
                            <span className={`inline-block text-[9px] font-extrabold p-0.5 px-2 rounded-sm border truncate max-w-full ${SERVICE_COLORS[lead.service]}`}>
                              {lead.service === 'custom' && lead.customService ? lead.customService : SERVICE_LABELS[lead.service]}
                            </span>
                          </div>

                          {/* Footer with budget and staff avatar */}
                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-50 text-xxs">
                            <span className="font-extrabold text-slate-900 flex items-center">
                              <IndianRupee className="w-3.5 h-3.5 -mr-0.5 text-slate-400" />
                              {lead.budget.toLocaleString('en-IN')}
                            </span>

                            <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-1 px-2 rounded-full border border-slate-100">
                              <UserIcon className="w-3 h-3 text-slate-400" />
                              <span className="text-[9px] text-slate-600 font-semibold truncate max-w-[80px]">
                                {lead.assignedTo.split(' ')[0]}
                              </span>
                            </div>
                          </div>

                          {/* Drag indicator show on card hover */}
                          <div className="absolute right-2 top-11 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <ArrowRightLeft className="w-3 h-3 text-slate-305 text-slate-300" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
