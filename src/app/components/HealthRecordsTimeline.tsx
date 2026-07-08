/**
 * HealthRecordsTimeline - Unified Health History
 * 
 * REFACTORED: Now uses AfyaCare Design System components
 * - PageHeader for consistent header
 * - NativeDropdownFilter for record type filtering
 * - StatusBadge for record status
 * - UrgencyCard for follow-up needed items
 * - Design system colors and spacing
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  FileText,
  Activity,
  Pill,
  Calendar,
  Download,
  Share2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  PageHeader,
  NativeDropdownFilter,
  StatusBadge,
  UrgencyCard,
  colors,
} from '@/app/design-system';

interface HealthRecordsTimelineProps {
  language: 'sw' | 'en';
  onBack: () => void;
}

interface HealthRecord {
  id: string;
  type: 'visit' | 'test' | 'medication' | 'procedure';
  date: Date;
  title: { sw: string; en: string };
  summary: { sw: string; en: string };
  details: { sw: string; en: string };
  provider?: { sw: string; en: string };
  facility?: { sw: string; en: string };
  status?: 'completed' | 'pending' | 'follow-up-needed';
  attachments?: number;
}

export function HealthRecordsTimeline({
  language,
  onBack,
}: HealthRecordsTimelineProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'visit' | 'test' | 'medication' | 'procedure'>('all');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  const content = {
    sw: {
      title: 'Rekodi za Afya',
      subtitle: 'Historia yako ya kliniki na matokeo',
      filter: 'Onyesha:',
      filters: {
        all: 'Zote',
        visit: 'Ziara',
        test: 'Vipimo',
        medication: 'Dawa',
        procedure: 'Taratibu',
      },
      emptyState: 'Hakuna rekodi bado',
      emptyDescription: 'Rekodi zako za afya zitaonekana hapa',
      viewDetails: 'Angalia Maelezo',
      hideDetails: 'Ficha Maelezo',
      download: 'Pakua',
      share: 'Shiriki',
      status: {
        completed: 'Imekamilika',
        pending: 'Inasubiri',
        'follow-up-needed': 'Inahitaji Ufuatiliaji',
      },
      provider: 'Mtoa Huduma:',
      facility: 'Kituo:',
      attachments: 'Viambatisho',
    },
    en: {
      title: 'Health Records',
      subtitle: 'Your clinical history and results',
      filter: 'Show:',
      filters: {
        all: 'All',
        visit: 'Visits',
        test: 'Tests',
        medication: 'Medications',
        procedure: 'Procedures',
      },
      emptyState: 'No records yet',
      emptyDescription: 'Your health records will appear here',
      viewDetails: 'View Details',
      hideDetails: 'Hide Details',
      download: 'Download',
      share: 'Share',
      status: {
        completed: 'Completed',
        pending: 'Pending',
        'follow-up-needed': 'Follow-up Needed',
      },
      provider: 'Provider:',
      facility: 'Facility:',
      attachments: 'Attachments',
    },
  };

  const t = content[language];

  // Mock data - in production, this comes from API
  const mockRecords: HealthRecord[] = [
    {
      id: '1',
      type: 'test',
      date: new Date('2026-02-05'),
      title: { sw: 'Vipimo vya Damu', en: 'Blood Test Results' },
      summary: {
        sw: 'Matokeo yako yote yanaonekana kuwa ya kawaida',
        en: 'All your results appear normal',
      },
      details: {
        sw: 'Vipimo vya damu vinaonyesha kiwango cha hemoglobini ni 14.2 g/dL (kawaida), WBC ni 7,500/μL (kawaida). Hakuna ishara ya ugonjwa.',
        en: 'Blood tests show hemoglobin level at 14.2 g/dL (normal), WBC at 7,500/μL (normal). No signs of infection.',
      },
      provider: { sw: 'Dkt. Mwangi', en: 'Dr. Mwangi' },
      facility: { sw: 'Kituo cha Afya Kariakoo', en: 'Kariakoo Health Centre' },
      status: 'completed',
      attachments: 2,
    },
    {
      id: '2',
      type: 'visit',
      date: new Date('2026-02-03'),
      title: { sw: 'Ziara ya Kliniki', en: 'Clinic Visit' },
      summary: {
        sw: 'Uchunguzi wa kawaida - dalili za homa',
        en: 'Routine checkup - fever symptoms',
      },
      details: {
        sw: 'Mgonjwa alikuja na malalamiko ya homa na maumivu ya kichwa. Uchunguzi ulionyesha joto la 38.5°C. Vipimo vya malaria viliagizwa.',
        en: 'Patient presented with complaints of fever and headache. Examination showed temperature of 38.5°C. Malaria tests ordered.',
      },
      provider: { sw: 'Dkt. Mwangi', en: 'Dr. Mwangi' },
      facility: { sw: 'Kituo cha Afya Kariakoo', en: 'Kariakoo Health Centre' },
      status: 'follow-up-needed',
      attachments: 0,
    },
    {
      id: '3',
      type: 'medication',
      date: new Date('2026-02-03'),
      title: { sw: 'Dawa Iliyoandikwa', en: 'Prescribed Medication' },
      summary: {
        sw: 'Paracetamol 500mg - mara 3 kwa siku',
        en: 'Paracetamol 500mg - 3 times daily',
      },
      details: {
        sw: 'Meza vidonge 2 kila baada ya saa 8. Endelea kwa siku 5. Kunywa na maji mengi. Usitumie tumbo tupu.',
        en: 'Take 2 tablets every 8 hours. Continue for 5 days. Take with plenty of water. Do not take on empty stomach.',
      },
      provider: { sw: 'Dkt. Mwangi', en: 'Dr. Mwangi' },
      facility: { sw: 'Kituo cha Afya Kariakoo', en: 'Kariakoo Health Centre' },
      status: 'completed',
      attachments: 0,
    },
    {
      id: '4',
      type: 'visit',
      date: new Date('2026-01-15'),
      title: { sw: 'Uchunguzi wa Afya', en: 'Health Screening' },
      summary: {
        sw: 'Uchunguzi wa kila mwaka - matokeo mazuri',
        en: 'Annual screening - good results',
      },
      details: {
        sw: 'Shinikizo la damu: 120/80 (kawaida), Uzito: 68kg, BMI: 22.5 (kawaida). Hali ya afya nzuri kwa ujumla.',
        en: 'Blood pressure: 120/80 (normal), Weight: 68kg, BMI: 22.5 (normal). Overall good health status.',
      },
      provider: { sw: 'Muuguzi Patel', en: 'Nurse Patel' },
      facility: { sw: 'Kituo cha Afya Kariakoo', en: 'Kariakoo Health Centre' },
      status: 'completed',
      attachments: 1,
    },
  ];

  const filteredRecords =
    selectedFilter === 'all'
      ? mockRecords
      : mockRecords.filter((r) => r.type === selectedFilter);

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'visit':
        return Calendar;
      case 'test':
        return Activity;
      case 'medication':
        return Pill;
      case 'procedure':
        return FileText;
      default:
        return FileText;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'visit':
        return { bg: '#EFF6FF', text: '#1E88E5' };
      case 'test':
        return { bg: '#F5F3FF', text: '#8B5CF6' };
      case 'medication':
        return { bg: '#ECFDF5', text: '#10B981' };
      case 'procedure':
        return { bg: '#FFFBEB', text: '#F59E0B' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#ECFDF5', text: '#10B981', icon: CheckCircle };
      case 'pending':
        return { bg: '#FFFBEB', text: '#F59E0B', icon: Clock };
      case 'follow-up-needed':
        return { bg: '#FEF2F2', text: '#EF4444', icon: AlertCircle };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', icon: CheckCircle };
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return language === 'sw' ? 'Leo' : 'Today';
    } else if (diffDays === 1) {
      return language === 'sw' ? 'Jana' : 'Yesterday';
    } else if (diffDays < 7) {
      return language === 'sw'
        ? `Siku ${diffDays} zilizopita`
        : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-24">
      {/* Header */}
      <PageHeader
        onBack={onBack}
        title={t.title}
        subtitle={t.subtitle}
      />

      {/* Filters - Fixed: Dropdown instead of horizontal scroll */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#6B7280]">
              {t.filter}
            </span>
            <NativeDropdownFilter
              label={t.filter}
              value={selectedFilter}
              onChange={(val) => setSelectedFilter(val as any)}
              options={[
                { value: 'all', label: t.filters.all },
                { value: 'visit', label: t.filters.visit },
                { value: 'test', label: t.filters.test },
                { value: 'medication', label: t.filters.medication },
                { value: 'procedure', label: t.filters.procedure },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Records Timeline */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
            <FileText className="w-16 h-16 text-[#D1D5DB] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1A1D23] mb-2">
              {t.emptyState}
            </h3>
            <p className="text-[#6B7280]">{t.emptyDescription}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record, index) => {
              const RecordIcon = getRecordIcon(record.type);
              const colors = getRecordColor(record.type);
              const statusInfo = record.status
                ? getStatusColor(record.status)
                : null;
              const StatusIcon = statusInfo?.icon;
              const isExpanded = expandedRecord === record.id;

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Record Header */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: colors.bg }}
                      >
                        <RecordIcon
                          className="w-6 h-6"
                          style={{ color: colors.text }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title and Date */}
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-[#1A1D23]">
                            {record.title[language]}
                          </h3>
                          <span className="text-sm text-[#6B7280] whitespace-nowrap">
                            {formatDate(record.date)}
                          </span>
                        </div>

                        {/* Summary */}
                        <p className="text-[#6B7280] mb-3">
                          {record.summary[language]}
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
                          {record.provider && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-4 h-4" />
                              <span>{record.provider[language]}</span>
                            </div>
                          )}
                          {record.facility && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              <span>{record.facility[language]}</span>
                            </div>
                          )}
                          {record.attachments && record.attachments > 0 && (
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4" />
                              <span>
                                {record.attachments} {t.attachments}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        {statusInfo && StatusIcon && (
                          <div
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mt-3"
                            style={{ backgroundColor: statusInfo.bg }}
                          >
                            <StatusIcon
                              className="w-4 h-4"
                              style={{ color: statusInfo.text }}
                            />
                            <span
                              className="text-xs font-medium"
                              style={{ color: statusInfo.text }}
                            >
                              {record.status && t.status[record.status]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4">
                      <Button
                        onClick={() =>
                          setExpandedRecord(isExpanded ? null : record.id)
                        }
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            {t.hideDetails}
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            {t.viewDetails}
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#E5E7EB] bg-[#FAFBFC] px-6 py-6"
                    >
                      <h4 className="text-sm font-semibold text-[#1A1D23] mb-3">
                        {language === 'sw' ? 'Maelezo Kamili:' : 'Full Details:'}
                      </h4>
                      <p className="text-[#6B7280] leading-relaxed">
                        {record.details[language]}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="max-w-4xl mx-auto px-6 mt-6">
        <div className="bg-[#EFF6FF] rounded-xl border border-[#DBEAFE] p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-[#1E88E5] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#1E40AF] leading-relaxed">
              {language === 'sw'
                ? 'Rekodi zako zinafikiwa nje ya mtandao na zinaweza kupakuliwa au kushirikiwa na watoa huduma wa afya.'
                : 'Your records are available offline and can be downloaded or shared with healthcare providers.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}