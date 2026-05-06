import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pill,
  X,
  Phone,
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useApp } from '@/app/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationSystemProps {
  enabled?: boolean;
}

interface Notification {
  id: string;
  type: 'appointment' | 'form' | 'medication' | 'followup' | 'missed';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  actionLabel?: string;
  action?: () => void;
  dismissed: boolean;
  sentChannels: ('in-app' | 'sms' | 'chw')[];
}

const translations = {
  sw: {
    notifications: 'Arifa',
    markAllRead: 'Weka yote imesomwa',
    noNotifications: 'Hakuna arifa',
    dismiss: 'Ondoa',
    viewDetails: 'Angalia maelezo',
    
    // Notification types
    appointmentReminder: 'Kumbusho la Miadi',
    formIncomplete: 'Fomu haijakamilika',
    medicationReminder: 'Kumbusho la Dawa',
    followupNeeded: 'Ufuatiliaji unahitajika',
    missedAppointment: 'Miadi iliyokosekana',
    
    // Messages
    appointmentIn24: 'Miadi yako ni kesho saa {{time}}',
    completeRegistration: 'Kamilisha fomu zako za usajili',
    takeMedication: 'Wakati wa kuchukua dawa yako: {{medication}}',
    scheduleFollowup: 'Panga miadi ya ufuatiliaji na daktari',
    missedAppointmentMsg: 'Umekosa miadi yako. Tafadhali panga upya.',
    
    // Actions
    reschedule: 'Panga upya',
    complete: 'Kamilisha',
    remind: 'Nikumbushe baadaye',
    call: 'Piga simu',
    
    // Priority labels
    urgent: 'Dharura',
    important: 'Muhimu',
    normal: 'Kawaida',
    
    // Channel labels
    sentViaSMS: 'Imetumwa kupitia SMS',
    sentToCHW: 'Imetumwa kwa CHW',
    inApp: 'Ndani ya programu',
  },
  en: {
    notifications: 'Notifications',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications',
    dismiss: 'Dismiss',
    viewDetails: 'View details',
    
    // Notification types
    appointmentReminder: 'Appointment Reminder',
    formIncomplete: 'Form Incomplete',
    medicationReminder: 'Medication Reminder',
    followupNeeded: 'Follow-up Needed',
    missedAppointment: 'Missed Appointment',
    
    // Messages
    appointmentIn24: 'Your appointment is tomorrow at {{time}}',
    completeRegistration: 'Complete your registration forms',
    takeMedication: 'Time to take your medication: {{medication}}',
    scheduleFollowup: 'Schedule follow-up appointment with doctor',
    missedAppointmentMsg: 'You missed your appointment. Please reschedule.',
    
    // Actions
    reschedule: 'Reschedule',
    complete: 'Complete',
    remind: 'Remind me later',
    call: 'Call',
    
    // Priority labels
    urgent: 'Urgent',
    important: 'Important',
    normal: 'Normal',
    
    // Channel labels
    sentViaSMS: 'Sent via SMS',
    sentToCHW: 'Sent to CHW',
    inApp: 'In-app',
  },
};

export function NotificationSystem({ enabled = true }: NotificationSystemProps) {
  const { language, userRole } = useApp();
  const t = translations[language];
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Load notifications from localStorage (offline-first)
  useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })));
      } catch (e) {
      }
    } else {
      // Initialize with mock notifications
      initializeMockNotifications();
    }
  }, []);
  
  // Calculate unread count
  useEffect(() => {
    const unread = notifications.filter((n) => !n.dismissed).length;
    setUnreadCount(unread);
  }, [notifications]);
  
  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);
  
  const initializeMockNotifications = () => {
    const mock: Notification[] = [
      {
        id: '1',
        type: 'appointment',
        title: t.appointmentReminder,
        message: t.appointmentIn24.replace('{{time}}', '10:00 AM'),
        priority: 'high',
        timestamp: new Date(),
        actionLabel: t.reschedule,
        action: () => {},
        dismissed: false,
        sentChannels: ['in-app', 'sms'],
      },
      {
        id: '2',
        type: 'form',
        title: t.formIncomplete,
        message: t.completeRegistration,
        priority: 'medium',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        actionLabel: t.complete,
        action: () => {},
        dismissed: false,
        sentChannels: ['in-app'],
      },
      {
        id: '3',
        type: 'medication',
        title: t.medicationReminder,
        message: t.takeMedication.replace('{{medication}}', 'Aspirin'),
        priority: 'medium',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        actionLabel: t.remind,
        action: () => {},
        dismissed: false,
        sentChannels: ['in-app', 'sms'],
      },
    ];
    setNotifications(mock);
  };
  
  const dismissNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n))
    );
  };
  
  const dismissAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, dismissed: true })));
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return t.urgent;
      case 'medium':
        return t.important;
      default:
        return t.normal;
    }
  };
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-5 w-5" />;
      case 'form':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medication':
        return <Pill className="h-5 w-5" />;
      case 'followup':
        return <Clock className="h-5 w-5" />;
      case 'missed':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  const activeNotifications = notifications.filter((n) => !n.dismissed);
  
  if (!enabled) return null;
  
  return (
    <>
      {/* Floating Notification Bell */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed top-20 right-4 z-40"
      >
        <Button
          size="lg"
          onClick={() => setShowNotificationPanel(true)}
          className="relative rounded-full w-14 h-14 bg-white border-2 border-[#1E88E5] text-[#1E88E5] hover:bg-blue-50"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </motion.div>

      {/* In-app notification toasts (for new notifications) */}
      <div className="fixed top-24 right-4 left-4 md:left-auto md:w-96 z-50 space-y-2">
        <AnimatePresence>
          {activeNotifications.slice(0, 3).map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`${getPriorityColor(notification.priority)} border rounded-lg shadow-lg`}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className="mr-3">{getIcon(notification.type)}</div>
                      <div>
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {getPriorityLabel(notification.priority)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm mb-3">{notification.message}</p>
                  
                  {notification.actionLabel && (
                    <Button
                      size="sm"
                      onClick={notification.action}
                      className="bg-[#1E88E5] hover:bg-[#1976D2]"
                    >
                      {notification.actionLabel}
                    </Button>
                  )}
                  
                  {/* Channel indicators */}
                  <div className="flex gap-2 mt-2">
                    {notification.sentChannels.map((channel) => (
                      <Badge key={channel} variant="secondary" className="text-xs">
                        {channel === 'sms' && t.sentViaSMS}
                        {channel === 'chw' && t.sentToCHW}
                        {channel === 'in-app' && t.inApp}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Notification Panel (Side drawer) */}
      <AnimatePresence>
        {showNotificationPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotificationPanel(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white shadow-xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#1E88E5] to-[#43A047] text-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold">{t.notifications}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotificationPanel(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {activeNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissAll}
                    className="text-white hover:bg-white/20"
                  >
                    {t.markAllRead}
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <div className="p-4 space-y-3">
                {activeNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">{t.noNotifications}</p>
                  </div>
                ) : (
                  activeNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`${getPriorityColor(notification.priority)} border`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start flex-1">
                            <div className="mr-3 mt-1">{getIcon(notification.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm">
                                  {notification.title}
                                </h4>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {getPriorityLabel(notification.priority)}
                                </Badge>
                              </div>
                              <p className="text-sm mb-2">{notification.message}</p>
                              <p className="text-xs text-gray-500">
                                {notification.timestamp.toLocaleString()}
                              </p>
                              
                              {/* Channel indicators */}
                              <div className="flex gap-1 mt-2">
                                {notification.sentChannels.map((channel) => (
                                  <Badge key={channel} variant="secondary" className="text-xs">
                                    {channel === 'sms' && '📱'}
                                    {channel === 'chw' && '👨‍⚕️'}
                                    {channel === 'in-app' && '📲'}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                            className="h-6 w-6 p-0 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {notification.actionLabel && (
                          <Button
                            size="sm"
                            onClick={notification.action}
                            className="w-full mt-2 bg-[#1E88E5] hover:bg-[#1976D2]"
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
