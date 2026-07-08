/**
 * ConsentManagement - PDPA-Compliant Data Sharing
 * 
 * PURPOSE: Granular, revocable consent for federated health records
 * 
 * TANZANIA PDPA REQUIREMENTS:
 * - Explicit consent (not implied)
 * - Granular control (by record type, facility, duration)
 * - Revocable at any time
 * - Audit trail (who accessed what, when)
 * - Clear language (no legalese)
 * - Preview before confirmation
 * 
 * USER SCENARIOS:
 * - Patient visiting new hospital (share records)
 * - Specialist consultation (share specific records)
 * - Research participation (separate consent)
 * - Family member access (dependent consent)
 * - Data export request (PDPA right to portability)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  AlertCircle,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  Hospital,
  Calendar,
  User,
  Download,
} from 'lucide-react';
import { Button } from './ui/button';

// Types
interface ConsentRequest {
  id: string;
  facilityName: string;
  facilityId: string;
  requestDate: string;
  purpose: string;
  status: 'pending' | 'approved' | 'denied' | 'revoked';
}

interface RecordCategory {
  id: string;
  name: string;
  nameSwahili: string;
  description: string;
  descriptionSwahili: string;
  recordCount: number;
  sensitive: boolean;
  icon: React.ReactNode;
}

interface ConsentDecision {
  categories: string[];
  duration: 'session' | '1week' | '1month' | '3months' | 'permanent';
  purpose: string;
  facilityId: string;
  facilityName: string;
}

interface ConsentLog {
  id: string;
  timestamp: string;
  action: 'GRANTED' | 'REVOKED' | 'ACCESSED' | 'DENIED';
  facility: string;
  categories: string[];
  accessor?: string;
}

// Main Component
export function ConsentManagement({
  language,
  onClose,
  initialRequest,
  userRecords,
}: {
  language: 'sw' | 'en';
  onClose: () => void;
  initialRequest?: ConsentRequest;
  userRecords: any[];
}) {
  const [step, setStep] = useState<'request' | 'categories' | 'duration' | 'preview' | 'confirm'>(
    'request'
  );
  const [decision, setDecision] = useState<Partial<ConsentDecision>>({
    categories: [],
    duration: '1month',
  });

  const content = {
    sw: {
      title: 'Shiriki Kumbukumbu za Afya',
      subtitle: 'Wewe una udhibiti kamili wa data yako',
      steps: {
        request: {
          title: 'Ombi la Kuitaka Data',
          subtitle: 'Kituo cha afya kinaomba ruhusa ya kuona kumbukumbu zako',
          facilityLabel: 'Kituo',
          purposeLabel: 'Sababu',
          requestedDate: 'Tarehe ya Ombi',
          whatThisMeans: 'Hii inamaanisha nini?',
          explanation: 'Kituo hiki kinahitaji kuona baadhi ya kumbukumbu zako za afya ili kukupa huduma bora. Utachagua ni kumbukumbu zipi na kwa muda gani.',
          pdpaNotice: 'Unaweza kuondoa ruhusa wakati wowote. Data yako haitauzwa wala kutumika kwa utafiti bila idhini yako tofauti.',
          continueButton: 'Endelea',
          denyButton: 'Kataa',
        },
        categories: {
          title: 'Chagua Ni Kumbukumbu Zipi',
          subtitle: 'Ni aina gani za kumbukumbu ungependa kushiriki?',
          allRecords: 'Kumbukumbu Zote',
          selectSpecific: 'Chagua Maalum',
          recordCount: 'kumbukumbu',
          sensitive: 'Nyeti',
          selected: 'Imechaguliwa',
          backButton: 'Rudi',
          continueButton: 'Endelea',
        },
        duration: {
          title: 'Kwa Muda Gani?',
          subtitle: 'Ni kwa muda gani kituo kinaweza kuona kumbukumbu hizi?',
          options: {
            session: {
              title: 'Ziara Hii Tu',
              description: 'Ruhusa itaisha baada ya ziara',
            },
            '1week': {
              title: 'Wiki 1',
              description: 'Kwa ufuatiliaji wa karibu',
            },
            '1month': {
              title: 'Mwezi 1',
              description: 'Mipango ya kawaida ya huduma',
            },
            '3months': {
              title: 'Miezi 3',
              description: 'Matibabu ya muda mrefu',
            },
            permanent: {
              title: 'Kudumu',
              description: 'Hadi utakapoondoa ruhusa',
            },
          },
          backButton: 'Rudi',
          continueButton: 'Endelea',
        },
        preview: {
          title: 'Thibitisha Uamuzi Wako',
          subtitle: 'Angalia unavyokaribia kushiriki kabla ya kuthibitisha',
          sharingWith: 'Unashiriki na',
          categories: 'Aina za Kumbukumbu',
          duration: 'Muda',
          expiresOn: 'Itaisha',
          willShare: 'Utashiriki',
          records: 'kumbukumbu',
          canRevoke: 'Unaweza kuondoa ruhusa wakati wowote',
          backButton: 'Rudi',
          confirmButton: 'Thibitisha na Shiriki',
        },
        confirm: {
          title: 'Idhini Imetolewa',
          subtitle: 'Kumbukumbu zako zinaweza kuonekana na kituo',
          grantedTo: 'Ruhusa imetolewa kwa',
          validUntil: 'Halali hadi',
          whatNext: 'Ni nini kifuatacho?',
          nextSteps: [
            'Kituo kitaona kumbukumbu ulizoshiriki tu',
            'Unaweza kuondoa ruhusa wakati wowote',
            'Utapata taarifa zikiwataka kuona data yako',
          ],
          viewLog: 'Angalia Logi ya Upatikanaji',
          done: 'Imekamilika',
        },
      },
      recordCategories: {
        visits: 'Ziara za Kliniki',
        medications: 'Dawa',
        diagnostics: 'Vipimo',
        imaging: 'Picha za Kitibabu',
        pregnancy: 'Ujauzito',
        immunizations: 'Chanjo',
        allergies: 'Mzio',
        conditions: 'Magonjwa',
      },
      pdpaRights: {
        title: 'Haki Zako',
        rights: [
          'Haki ya kujua ni data gani imeshirikiwa',
          'Haki ya kuondoa ruhusa wakati wowote',
          'Haki ya kupakua nakala ya data yako',
          'Haki ya kusahihisha taarifa zisizo sahihi',
          'Haki ya kufuta data yako',
        ],
      },
    },
    en: {
      title: 'Share Health Records',
      subtitle: 'You have full control of your data',
      steps: {
        request: {
          title: 'Data Access Request',
          subtitle: 'A healthcare facility is requesting access to your records',
          facilityLabel: 'Facility',
          purposeLabel: 'Purpose',
          requestedDate: 'Requested',
          whatThisMeans: 'What does this mean?',
          explanation: 'This facility needs to see some of your health records to provide you with better care. You will choose which records and for how long.',
          pdpaNotice: 'You can revoke access at any time. Your data will not be sold or used for research without separate consent.',
          continueButton: 'Continue',
          denyButton: 'Deny',
        },
        categories: {
          title: 'Choose Which Records',
          subtitle: 'What types of records would you like to share?',
          allRecords: 'All Records',
          selectSpecific: 'Select Specific',
          recordCount: 'records',
          sensitive: 'Sensitive',
          selected: 'Selected',
          backButton: 'Back',
          continueButton: 'Continue',
        },
        duration: {
          title: 'For How Long?',
          subtitle: 'How long can the facility access these records?',
          options: {
            session: {
              title: 'This Visit Only',
              description: 'Access expires after visit',
            },
            '1week': {
              title: '1 Week',
              description: 'For close follow-up',
            },
            '1month': {
              title: '1 Month',
              description: 'Standard care plan',
            },
            '3months': {
              title: '3 Months',
              description: 'Long-term treatment',
            },
            permanent: {
              title: 'Permanent',
              description: 'Until you revoke access',
            },
          },
          backButton: 'Back',
          continueButton: 'Continue',
        },
        preview: {
          title: 'Confirm Your Decision',
          subtitle: 'Review what you are about to share before confirming',
          sharingWith: 'Sharing with',
          categories: 'Record Categories',
          duration: 'Duration',
          expiresOn: 'Expires on',
          willShare: 'Will share',
          records: 'records',
          canRevoke: 'You can revoke access at any time',
          backButton: 'Back',
          confirmButton: 'Confirm and Share',
        },
        confirm: {
          title: 'Consent Granted',
          subtitle: 'Your records are now accessible to the facility',
          grantedTo: 'Access granted to',
          validUntil: 'Valid until',
          whatNext: 'What happens next?',
          nextSteps: [
            'The facility will only see the records you shared',
            'You can revoke access at any time',
            'You will be notified when they access your data',
          ],
          viewLog: 'View Access Log',
          done: 'Done',
        },
      },
      recordCategories: {
        visits: 'Clinical Visits',
        medications: 'Medications',
        diagnostics: 'Lab Tests',
        imaging: 'Medical Imaging',
        pregnancy: 'Pregnancy Care',
        immunizations: 'Immunizations',
        allergies: 'Allergies',
        conditions: 'Conditions',
      },
      pdpaRights: {
        title: 'Your Rights',
        rights: [
          'Right to know what data is shared',
          'Right to revoke consent at any time',
          'Right to download a copy of your data',
          'Right to correct inaccurate information',
          'Right to delete your data',
        ],
      },
    },
  };

  const t = content[language];

  // Mock record categories
  const categories: RecordCategory[] = [
    {
      id: 'visits',
      name: 'Clinical Visits',
      nameSwahili: 'Ziara za Kliniki',
      description: 'Doctor visits, consultations, examinations',
      descriptionSwahili: 'Ziara za daktari, ushauri, uchunguzi',
      recordCount: 12,
      sensitive: false,
      icon: <Hospital className="w-5 h-5" />,
    },
    {
      id: 'medications',
      name: 'Medications',
      nameSwahili: 'Dawa',
      description: 'Prescriptions, current medications, history',
      descriptionSwahili: 'Dawa zilizoandikiwa, dawa za sasa, historia',
      recordCount: 5,
      sensitive: false,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'diagnostics',
      name: 'Lab Tests',
      nameSwahili: 'Vipimo',
      description: 'Blood tests, urine tests, other diagnostics',
      descriptionSwahili: 'Vipimo vya damu, mkojo, vingine',
      recordCount: 8,
      sensitive: true,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'pregnancy',
      name: 'Pregnancy Care',
      nameSwahili: 'Ujauzito',
      description: 'Antenatal care, delivery records',
      descriptionSwahili: 'Huduma ya kabla ya kuzaa, kumbukumbu za kuzaa',
      recordCount: 3,
      sensitive: true,
      icon: <User className="w-5 h-5" />,
    },
  ];

  const renderStep = () => {
    switch (step) {
      case 'request':
        return (
          <RequestStep
            content={t.steps.request}
            request={initialRequest || {
              id: '1',
              facilityName: 'Mwananyamala Hospital',
              facilityId: 'F001',
              requestDate: new Date().toISOString(),
              purpose: 'Emergency care consultation',
              status: 'pending',
            }}
            onContinue={() => setStep('categories')}
            onDeny={() => {
              // Log denial
              onClose();
            }}
            language={language}
          />
        );

      case 'categories':
        return (
          <CategoriesStep
            content={t.steps.categories}
            categories={categories}
            selectedCategories={decision.categories || []}
            onSelect={(cats: string[]) => setDecision({ ...decision, categories: cats })}
            onBack={() => setStep('request')}
            onContinue={() => setStep('duration')}
            language={language}
          />
        );

      case 'duration':
        return (
          <DurationStep
            content={t.steps.duration}
            selectedDuration={decision.duration || '1month'}
            onSelect={(dur: string) => setDecision({ ...decision, duration: dur as "session" | "1week" | "1month" | "3months" | "permanent" })}
            onBack={() => setStep('categories')}
            onContinue={() => setStep('preview')}
          />
        );

      case 'preview':
        return (
          <PreviewStep
            content={t.steps.preview}
            decision={decision as ConsentDecision}
            categories={categories}
            onBack={() => setStep('duration')}
            onConfirm={() => {
              // Save consent
              saveConsent(decision as ConsentDecision);
              setStep('confirm');
            }}
            language={language}
          />
        );

      case 'confirm':
        return (
          <ConfirmStep
            content={t.steps.confirm}
            decision={decision as ConsentDecision}
            onViewLog={() => {
              // Navigate to access log
            }}
            onDone={onClose}
          />
        );

      default:
        return null;
    }
  };

  const saveConsent = (decision: ConsentDecision) => {
    // In production: API call to backend
    const consent = {
      id: Date.now().toString(),
      ...decision,
      grantedAt: new Date().toISOString(),
      status: 'active',
    };

    const existingConsents = JSON.parse(localStorage.getItem('consents') || '[]');
    localStorage.setItem('consents', JSON.stringify([...existingConsents, consent]));

    // Log activity
    const log: ConsentLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action: 'GRANTED',
      facility: decision.facilityName,
      categories: decision.categories,
    };

    const existingLogs = JSON.parse(localStorage.getItem('consent_logs') || '[]');
    localStorage.setItem('consent_logs', JSON.stringify([log, ...existingLogs]));
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-[#1A1D23]">{t.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F7F9FB] rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
          <p className="text-sm text-[#6B7280]">{t.subtitle}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// Step Components
function RequestStep({ content, request, onContinue, onDeny, language }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold text-[#1A1D23] mb-2">{content.title}</h3>
        <p className="text-sm text-[#6B7280]">{content.subtitle}</p>
      </div>

      {/* Request Details */}
      <div className="p-5 bg-[#F7F9FB] border border-[#E5E7EB] rounded-xl space-y-4">
        <div>
          <p className="text-xs font-medium text-[#6B7280] mb-1">{content.facilityLabel}</p>
          <p className="text-base font-semibold text-[#1A1D23]">{request.facilityName}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-[#6B7280] mb-1">{content.purposeLabel}</p>
          <p className="text-sm text-[#1A1D23]">{request.purpose}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-[#6B7280] mb-1">{content.requestedDate}</p>
          <p className="text-sm text-[#1A1D23]">
            {new Date(request.requestDate).toLocaleDateString(
              language === 'sw' ? 'sw-TZ' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
            )}
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="p-4 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#1E88E5] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#1E40AF] mb-2">{content.whatThisMeans}</p>
            <p className="text-sm text-[#1E40AF]">{content.explanation}</p>
          </div>
        </div>
      </div>

      {/* PDPA Notice */}
      <div className="p-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl">
        <p className="text-xs text-[#92400E]">{content.pdpaNotice}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={onDeny}
          variant="outline"
          className="flex-1 h-12"
        >
          {content.denyButton}
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 h-12 bg-[#1E88E5] hover:bg-[#1976D2]"
        >
          {content.continueButton}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function CategoriesStep({ content, categories, selectedCategories, onSelect, onBack, onContinue, language }: any) {
  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      onSelect(selectedCategories.filter((id: string) => id !== catId));
    } else {
      onSelect([...selectedCategories, catId]);
    }
  };

  const selectAll = () => {
    onSelect(categories.map((c: RecordCategory) => c.id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold text-[#1A1D23] mb-2">{content.title}</h3>
        <p className="text-sm text-[#6B7280]">{content.subtitle}</p>
      </div>

      {/* Select All */}
      <button
        onClick={selectAll}
        className="w-full p-3 border-2 border-[#E5E7EB] rounded-xl hover:border-[#1E88E5] transition-colors text-left"
      >
        <p className="text-sm font-medium text-[#1A1D23]">{content.allRecords}</p>
        <p className="text-xs text-[#6B7280]">
          {categories.length} {content.recordCount}
        </p>
      </button>

      {/* Categories */}
      <div className="space-y-3">
        {categories.map((category: RecordCategory) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`w-full p-4 border-2 rounded-xl transition-colors text-left ${
                isSelected
                  ? 'border-[#1E88E5] bg-[#EFF6FF]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#9CA3AF]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-[#1E88E5] text-white' : 'bg-[#F7F9FB] text-[#6B7280]'
                  }`}>
                    {category.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1D23] mb-1">
                      {language === 'sw' ? category.nameSwahili : category.name}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {language === 'sw' ? category.descriptionSwahili : category.description}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-1">
                      {category.recordCount} {content.recordCount}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-[#1E88E5]" />
                )}
              </div>
              {category.sensitive && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-[#FEE2E2] rounded text-xs font-medium text-[#991B1B]">
                  <AlertCircle className="w-3 h-3" />
                  {content.sensitive}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {content.backButton}
        </Button>
        <Button
          onClick={onContinue}
          disabled={selectedCategories.length === 0}
          className="flex-1 h-12 bg-[#1E88E5] hover:bg-[#1976D2]"
        >
          {content.continueButton}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function DurationStep({ content, selectedDuration, onSelect, onBack, onContinue }: any) {
  const durations = ['session', '1week', '1month', '3months', 'permanent'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold text-[#1A1D23] mb-2">{content.title}</h3>
        <p className="text-sm text-[#6B7280]">{content.subtitle}</p>
      </div>

      {/* Duration Options */}
      <div className="space-y-3">
        {durations.map((duration) => {
          const isSelected = selectedDuration === duration;
          const option = content.options[duration];

          return (
            <button
              key={duration}
              onClick={() => onSelect(duration)}
              className={`w-full p-4 border-2 rounded-xl transition-colors text-left ${
                isSelected
                  ? 'border-[#1E88E5] bg-[#EFF6FF]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#9CA3AF]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-[#1A1D23] mb-1">
                    {option.title}
                  </p>
                  <p className="text-sm text-[#6B7280]">{option.description}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-[#1E88E5]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {content.backButton}
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 h-12 bg-[#1E88E5] hover:bg-[#1976D2]"
        >
          {content.continueButton}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function PreviewStep({ content, decision, categories, onBack, onConfirm, language }: any) {
  const selectedCats = categories.filter((c: RecordCategory) =>
    decision.categories.includes(c.id)
  );
  const totalRecords = selectedCats.reduce(
    (sum: number, c: RecordCategory) => sum + c.recordCount,
    0
  );

  const expiresOn = calculateExpiryDate(decision.duration);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold text-[#1A1D23] mb-2">{content.title}</h3>
        <p className="text-sm text-[#6B7280]">{content.subtitle}</p>
      </div>

      {/* Preview Card */}
      <div className="p-5 bg-[#F7F9FB] border-2 border-[#E5E7EB] rounded-xl space-y-4">
        {/* Facility */}
        <div>
          <p className="text-xs font-medium text-[#6B7280] mb-1">{content.sharingWith}</p>
          <p className="text-base font-semibold text-[#1A1D23]">{decision.facilityName}</p>
        </div>

        {/* Categories */}
        <div>
          <p className="text-xs font-medium text-[#6B7280] mb-2">{content.categories}</p>
          <div className="flex flex-wrap gap-2">
            {selectedCats.map((cat: RecordCategory) => (
              <span
                key={cat.id}
                className="px-3 py-1 bg-[#DBEAFE] text-[#1E40AF] text-sm font-medium rounded-lg"
              >
                {language === 'sw' ? cat.nameSwahili : cat.name}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#6B7280] mt-2">
            {content.willShare} {totalRecords} {content.records}
          </p>
        </div>

        {/* Duration */}
        <div>
          <p className="text-xs font-medium text-[#6B7280] mb-1">{content.duration}</p>
          <p className="text-sm text-[#1A1D23]">{decision.duration}</p>
          <p className="text-xs text-[#6B7280] mt-1">
            {content.expiresOn}: {expiresOn}
          </p>
        </div>
      </div>

      {/* Revocation Notice */}
      <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#065F46]">{content.canRevoke}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {content.backButton}
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-1 h-12 bg-[#10B981] hover:bg-[#059669]"
        >
          {content.confirmButton}
          <CheckCircle2 className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

function ConfirmStep({ content, decision, onViewLog, onDone }: any) {
  const expiresOn = calculateExpiryDate(decision.duration);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 text-center"
    >
      {/* Success Icon */}
      <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[#1A1D23] mb-2">{content.title}</h3>
        <p className="text-sm text-[#6B7280]">{content.subtitle}</p>
      </div>

      {/* Details */}
      <div className="p-5 bg-[#F7F9FB] border border-[#E5E7EB] rounded-xl text-left space-y-3">
        <div>
          <p className="text-xs font-medium text-[#6B7280] mb-1">{content.grantedTo}</p>
          <p className="text-base font-semibold text-[#1A1D23]">{decision.facilityName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#6B7280] mb-1">{content.validUntil}</p>
          <p className="text-sm text-[#1A1D23]">{expiresOn}</p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="text-left">
        <p className="text-sm font-semibold text-[#1A1D23] mb-3">{content.whatNext}</p>
        <div className="space-y-2">
          {content.nextSteps.map((step: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-sm text-[#6B7280]">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={onViewLog}
          variant="outline"
          className="w-full h-12"
        >
          <Eye className="w-4 h-4 mr-2" />
          {content.viewLog}
        </Button>
        <Button
          onClick={onDone}
          className="w-full h-12 bg-[#1E88E5] hover:bg-[#1976D2]"
        >
          {content.done}
        </Button>
      </div>
    </motion.div>
  );
}

// Utility Functions
function calculateExpiryDate(duration: string): string {
  const now = new Date();
  switch (duration) {
    case 'session':
      return 'End of visit';
    case '1week':
      now.setDate(now.getDate() + 7);
      break;
    case '1month':
      now.setMonth(now.getMonth() + 1);
      break;
    case '3months':
      now.setMonth(now.getMonth() + 3);
      break;
    case 'permanent':
      return 'Until revoked';
    default:
      return 'Unknown';
  }
  return now.toLocaleDateString();
}
