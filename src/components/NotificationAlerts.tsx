/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertNotification } from '../utils/dataStore';
import { Calendar, CheckSquare, Bell, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationAlertsProps {
  alerts: AlertNotification[];
  onSelectLead: (leadId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationAlerts({
  alerts,
  onSelectLead,
  isOpen,
  onClose
}: NotificationAlertsProps) {
  const urgentCount = alerts.filter(a => a.isUrgent).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay mask */}
          <div 
            className="fixed inset-0 bg-slate-900/40 z-45 backdrop-blur-xs" 
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, x: 280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl border-l border-slate-150 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bell className="w-5 h-5 text-slate-700" />
                  {alerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm font-sans tracking-tight">
                  Team Alerts & Deadlines
                </h3>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                  {alerts.length}
                </span>
              </div>
              
              <button 
                onClick={onClose}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Summary Badge if any overdue tasks */}
            {urgentCount > 0 && (
              <div className="mx-4 mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-rose-800">Critical Action Required</h4>
                  <p className="text-xxs text-rose-600 mt-0.5">
                    There are {urgentCount} critical action items (past meetings or overdue follow-ups) that require immediate CRM attention.
                  </p>
                </div>
              </div>
            )}

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2.5">
                    <CheckSquare className="w-5 h-5 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-700">All caught up!</h4>
                  <p className="text-xxs text-slate-400 mt-1 max-w-xs">
                    No overdue client deliverables or upcoming meeting deadlines found within the immediate timeline.
                  </p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const isMeeting = alert.type === 'meeting_deadline';
                  return (
                    <motion.div
                      key={alert.id}
                      onClick={() => {
                        onSelectLead(alert.leadId);
                        onClose();
                      }}
                      whileHover={{ scale: 1.01 }}
                      className={`p-3.5 border rounded-xl cursor-pointer transition-shadow hover:shadow-md flex items-start gap-3 bg-white ${
                        alert.isUrgent 
                          ? 'border-rose-150 bg-rose-50/20' 
                          : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {/* Icon container */}
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isMeeting 
                          ? 'bg-blue-55 text-blue-500 bg-blue-50' 
                          : 'bg-amber-50 text-amber-55 text-amber-500'
                      }`}>
                        {isMeeting ? (
                          <Calendar className="w-4 h-4" />
                        ) : (
                          <CheckSquare className="w-4 h-4" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xxs font-bold text-slate-500 truncate max-w-[150px]">
                            {alert.companyName}
                          </span>
                          <span className={`text-xxs font-extrabold tracking-wide px-1.5 py-0.5 rounded-md shrink-0 uppercase ${
                            alert.isUrgent 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {alert.timeDiffString}
                          </span>
                        </div>
                        
                        <h4 className="text-xs font-semibold text-slate-900 mt-1 truncate">
                          {alert.title}
                        </h4>
                        
                        <p className="text-xxs text-slate-500 mt-0.5 leading-relaxed truncate">
                          {alert.description}
                        </p>
                        
                        <div className="text-xxs text-blue-600 font-medium mt-2 flex items-center gap-1 hover:underline">
                          View CRM Lead Account &rarr;
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xxs text-slate-400">
              Database synchronized &bull; Client timezone labels auto-adjusted
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
