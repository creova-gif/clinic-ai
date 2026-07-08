/**
 * Messages Screen - Trusted Communication
 * 
 * PURPOSE: Official, traceable communication with care team
 * 
 * CRITICAL REQUIREMENTS:
 * - Clear sender identity (Clinic name + role)
 * - Message categories (Appointment | Medication | Follow-up)
 * - Emergency messages pinned at top
 * - SMS fallback indicator
 * - Offline queueing
 * - Read/unread clarity
 * - No chat-style ambiguity
 * 
 * USER GROUPS:
 * - Patient (receive from care team)
 * - Caregiver (manage for dependents)
 * - CHW (coordinate with patients + facilities)
 * - Clinic staff (send to patients)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import {
  MessagesIcon,
  EmergencyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon,
  CheckIcon,
  InfoIcon,
} from './icons/MedicalIcons';
import { MedicalButton } from './ui/medical-button';
import { LoadingState, EmptyState } from './ui/SystemStates';
import {
  LIST_ITEM,
  prefersReducedMotion,
} from '@/app/styles/motion-tokens';

interface Message {
  id: string;
  sender: {
    name: string; // Clinic name or "System"
    role: 'clinic' | 'chw' | 'system';
    phone?: string;
  };
  category: 'appointment' | 'medication' | 'follow-up' | 'emergency';
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  viaSSMS?: boolean; // Sent via SMS fallback
  attachments?: string[];
  replyable?: boolean;
}

interface MessagesProps {
  language: 'sw' | 'en';
  onBack: () => void;
  onNavigate: (route: string) => void;
  userRole?: 'patient' | 'caregiver' | 'chw' | 'clinic';
  unreadCount?: number;
}

export function Messages({
  language,
  onBack,
  onNavigate,
  userRole = 'patient',
  unreadCount = 0,
}: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [replyText, setReplyText] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const content = {
    sw: {
      title: 'Ujumbe',
      subtitle: 'Mawasiliano rasmi na timu yako ya afya',
      categories: {
        all: 'Yote',
        emergency: 'Dharura',
        appointment: 'Miadi',
        medication: 'Dawa',
        followUp: 'Ufuatiliaji',
      },
      senderRoles: {
        clinic: 'Kituo cha Afya',
        chw: 'Mhudumu wa Afya Jamii',
        system: 'Mfumo',
      },
      empty: {
        title: 'Hakuna Ujumbe',
        description: 'Ujumbe kutoka kwa timu yako ya afya utaonekana hapa',
      },
      read: 'Umesoma',
      unread: 'Haujasoma',
      viaSMS: 'Kupitia SMS',
      reply: 'Jibu',
      call: 'Piga simu',
      close: 'Funga',
      send: 'Tuma',
      typeMessage: 'Andika ujumbe...',
      offline: 'Ujumbe utajituma mnapotoka mtandaoni',
      emergency: 'Dharura',
      disclaimer: 'Usitumie ujumbe kwa hali za dharura. Piga simu mara moja.',
    },
    en: {
      title: 'Messages',
      subtitle: 'Official communication with your care team',
      categories: {
        all: 'All',
        emergency: 'Emergency',
        appointment: 'Appointments',
        medication: 'Medications',
        followUp: 'Follow-ups',
      },
      senderRoles: {
        clinic: 'Health Facility',
        chw: 'Community Health Worker',
        system: 'System',
      },
      empty: {
        title: 'No Messages',
        description: 'Messages from your care team will appear here',
      },
      read: 'Read',
      unread: 'Unread',
      viaSMS: 'Via SMS',
      reply: 'Reply',
      call: 'Call',
      close: 'Close',
      send: 'Send',
      typeMessage: 'Type message...',
      offline: 'Message will send when you are online',
      emergency: 'Emergency',
      disclaimer: 'Do not use messages for emergencies. Call immediately.',
    },
  };

  const t = content[language];
  const reducedMotion = prefersReducedMotion();

  // Monitor connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load messages
  useEffect(() => {
    setLoading(true);
    // Mock data
    setTimeout(() => {
      const mockMessages: Message[] = [
        {
          id: '1',
          sender: {
            name: 'Mwananyamala Hospital',
            role: 'clinic',
            phone: '+255222150608',
          },
          category: 'emergency',
          subject: 'Urgent: Test Results Require Follow-up',
          body: 'Your recent blood test shows results that need immediate attention. Please come to the clinic tomorrow morning.',
          timestamp: '2026-02-07T09:00:00',
          read: false,
          viaSSMS: false,
          replyable: true,
        },
        {
          id: '2',
          sender: {
            name: 'Nurse Amina - Temeke Health Center',
            role: 'clinic',
            phone: '+255222334455',
          },
          category: 'appointment',
          subject: 'Appointment Reminder',
          body: 'Your appointment is tomorrow, February 8th at 10:00 AM. Please bring your AfyaID and any medications you are currently taking.',
          timestamp: '2026-02-06T14:00:00',
          read: false,
          viaSSMS: true,
          replyable: true,
        },
        {
          id: '3',
          sender: {
            name: 'CHW John - Kinondoni',
            role: 'chw',
            phone: '+255712345678',
          },
          category: 'medication',
          subject: 'Medication Reminder',
          body: 'Remember to take your blood pressure medication every morning. I will visit you next week to check on you.',
          timestamp: '2026-02-05T08:00:00',
          read: true,
          viaSSMS: false,
          replyable: true,
        },
        {
          id: '4',
          sender: {
            name: 'System',
            role: 'system',
          },
          category: 'follow-up',
          subject: 'Health Tip: Stay Hydrated',
          body: 'Drinking 6-8 glasses of water daily helps your body function properly. This is especially important if you are taking medications.',
          timestamp: '2026-02-04T06:00:00',
          read: true,
          viaSSMS: false,
          replyable: false,
        },
      ];

      setMessages(mockMessages);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredMessages =
    filterCategory === 'all'
      ? messages
      : messages.filter((m) => m.category === filterCategory);

  // Separate emergency messages
  const emergencyMessages = filteredMessages.filter(
    (m) => m.category === 'emergency'
  );
  const regularMessages = filteredMessages.filter(
    (m) => m.category !== 'emergency'
  );

  const handleReply = () => {
    if (!replyText.trim() || !selectedMessage) return;

    // Queue message for sending

    setReplyText('');
    alert(
      isOnline
        ? language === 'sw'
          ? 'Ujumbe umetumwa'
          : 'Message sent'
        : t.offline
    );
  };

  if (loading) {
    return <LoadingState message={language === 'sw' ? 'Inapakia' : 'Loading'} />;
  }

  // Message Detail View
  if (selectedMessage) {
    return (
      <div className="min-h-screen bg-[#F7F9FB]">
        {/* Emergency Button */}
        <div className="fixed top-4 right-4 z-50">
          <MedicalButton
            variant="danger"
            size="sm"
            onClick={() => onNavigate('emergency')}
            icon={<EmergencyIcon size={20} color="#FFFFFF" />}
          >
            {t.emergency}
          </MedicalButton>
        </div>

        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] pt-4 pb-4 px-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedMessage(null)}
              className="flex items-center gap-2 text-[#6B7280] mb-3"
            >
              <ChevronLeftIcon size={20} color="#6B7280" />
              <span className="text-sm">{t.close}</span>
            </button>

            {/* Sender Info */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-semibold text-[#1E1E1E]">
                  {selectedMessage.sender.name}
                </h1>
                <p className="text-sm text-[#6B7280]">
                  {t.senderRoles[selectedMessage.sender.role]}
                </p>
                {selectedMessage.viaSSMS && (
                  <p className="text-xs text-[#8B5CF6] mt-1">{t.viaSMS}</p>
                )}
              </div>

              {selectedMessage.sender.phone && (
                <a
                  href={`tel:${selectedMessage.sender.phone}`}
                  className="p-3 bg-[#0F3D56] rounded-xl"
                  aria-label="Call"
                >
                  <PhoneIcon size={20} color="#FFFFFF" />
                </a>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-32">
          {/* Emergency Disclaimer */}
          {selectedMessage.category === 'emergency' && (
            <div className="p-4 bg-[#FEF2F2] border-2 border-[#FEE2E2] rounded-xl">
              <p className="text-sm text-[#991B1B] font-medium">
                {t.disclaimer}
              </p>
            </div>
          )}

          {/* Message Content */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            {/* Category Badge */}
            <div
              className={`p-3 border-b ${
                selectedMessage.category === 'emergency'
                  ? 'bg-[#FEF2F2] border-[#FEE2E2]'
                  : selectedMessage.category === 'appointment'
                  ? 'bg-[#DBEAFE] border-[#BFDBFE]'
                  : selectedMessage.category === 'medication'
                  ? 'bg-[#EDE9FE] border-[#DDD6FE]'
                  : 'bg-[#F7F9FB] border-[#E5E7EB]'
              }`}
            >
              <p
                className={`text-xs font-medium ${
                  selectedMessage.category === 'emergency'
                    ? 'text-[#991B1B]'
                    : selectedMessage.category === 'appointment'
                    ? 'text-[#1E40AF]'
                    : selectedMessage.category === 'medication'
                    ? 'text-[#6B21A8]'
                    : 'text-[#6B7280]'
                }`}
              >
                {
                  t.categories[
                    selectedMessage.category === 'follow-up'
                      ? 'followUp'
                      : selectedMessage.category
                  ]
                }
              </p>
            </div>

            {/* Subject */}
            <div className="p-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-semibold text-[#1E1E1E]">
                {selectedMessage.subject}
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                {new Date(selectedMessage.timestamp).toLocaleString(
                  language === 'sw' ? 'sw-TZ' : 'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}
              </p>
            </div>

            {/* Body */}
            <div className="p-4">
              <p className="text-base text-[#1E1E1E] leading-relaxed">
                {selectedMessage.body}
              </p>
            </div>
          </div>

          {/* Reply Section */}
          {selectedMessage.replyable && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <label className="block text-sm font-medium text-[#6B7280] mb-2">
                {t.reply}
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t.typeMessage}
                className="w-full p-3 border border-[#E5E7EB] rounded-lg text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#0F3D56]"
                rows={4}
              />

              {!isOnline && (
                <p className="text-xs text-[#F59E0B] mt-2">{t.offline}</p>
              )}

              <MedicalButton
                variant="primary"
                size="md"
                onClick={handleReply}
                icon={<Send size={20} color="#FFFFFF" />}
                fullWidth
                className="mt-3"
                disabled={!replyText.trim()}
              >
                {t.send}
              </MedicalButton>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Message List View
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {/* Emergency Button */}
      <div className="fixed top-4 right-4 z-50">
        <MedicalButton
          variant="danger"
          size="sm"
          onClick={() => onNavigate('emergency')}
          icon={<EmergencyIcon size={20} color="#FFFFFF" />}
        >
          {t.emergency}
        </MedicalButton>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] pt-4 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#6B7280] mb-3"
          >
            <ChevronLeftIcon size={20} color="#6B7280" />
            <span className="text-sm">{language === 'sw' ? 'Rudi' : 'Back'}</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#1E1E1E]">{t.title}</h1>
              <p className="text-sm text-[#6B7280] mt-1">{t.subtitle}</p>
            </div>

            {unreadCount > 0 && (
              <div className="w-10 h-10 bg-[#EF4444] rounded-full flex items-center justify-center">
                <span className="text-base font-semibold text-white">
                  {unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Emergency Disclaimer */}
        <div className="p-4 bg-[#FEF2F2] border-2 border-[#FEE2E2] rounded-xl">
          <p className="text-sm text-[#991B1B]">{t.disclaimer}</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(t.categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterCategory === key
                  ? 'bg-[#0F3D56] text-white'
                  : 'bg-white text-[#6B7280] border border-[#E5E7EB]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Emergency Messages (Pinned) */}
        {emergencyMessages.length > 0 && (
          <section>
            <div className="space-y-3">
              {emergencyMessages.map((message, index) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onClick={() => setSelectedMessage(message)}
                  language={language}
                  t={t}
                  index={index}
                  isPinned
                />
              ))}
            </div>
          </section>
        )}

        {/* Regular Messages */}
        {regularMessages.length === 0 && emergencyMessages.length === 0 ? (
          <EmptyState title={t.empty.title} description={t.empty.description} />
        ) : (
          <section>
            <div className="space-y-3">
              {regularMessages.map((message, index) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onClick={() => setSelectedMessage(message)}
                  language={language}
                  t={t}
                  index={index + emergencyMessages.length}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// Message Card Component
function MessageCard({
  message,
  onClick,
  language,
  t,
  index,
  isPinned = false,
}: {
  message: Message;
  onClick: () => void;
  language: 'sw' | 'en';
  t: any;
  index: number;
  isPinned?: boolean;
}) {
  const reducedMotion = prefersReducedMotion();

  return (
    <motion.button
      {...(reducedMotion ? {} : LIST_ITEM(index))}
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
        message.category === 'emergency'
          ? 'bg-[#FEF2F2] border-[#FEE2E2] hover:border-[#FCA5A5]'
          : !message.read
          ? 'bg-white border-[#0F3D56] hover:bg-[#F7F9FB]'
          : 'bg-white border-[#E5E7EB] hover:bg-[#F7F9FB]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            message.category === 'emergency'
              ? 'bg-[#DC2626]'
              : message.category === 'appointment'
              ? 'bg-[#1E88E5]'
              : message.category === 'medication'
              ? 'bg-[#8B5CF6]'
              : 'bg-[#10B981]'
          }`}
        >
          <MessagesIcon size={20} color="#FFFFFF" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Sender & Timestamp */}
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-[#1E1E1E]">
              {message.sender.name}
            </p>
            {!message.read && (
              <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
            )}
          </div>

          {/* Category & Role */}
          <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-2">
            <span>
              {
                t.categories[
                  message.category === 'follow-up' ? 'followUp' : message.category
                ]
              }
            </span>
            <span>•</span>
            <span>{t.senderRoles[message.sender.role]}</span>
            {message.viaSSMS && (
              <>
                <span>•</span>
                <span className="text-[#8B5CF6]">{t.viaSMS}</span>
              </>
            )}
          </div>

          {/* Subject */}
          <p className="text-base font-medium text-[#1E1E1E] mb-1">
            {message.subject}
          </p>

          {/* Body Preview */}
          <p className="text-sm text-[#6B7280] line-clamp-2">{message.body}</p>

          {/* Timestamp */}
          <p className="text-xs text-[#6B7280] mt-2">
            {new Date(message.timestamp).toLocaleString(
              language === 'sw' ? 'sw-TZ' : 'en-US',
              {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }
            )}
          </p>
        </div>

        <ChevronRightIcon size={20} color="#6B7280" />
      </div>
    </motion.button>
  );
}
