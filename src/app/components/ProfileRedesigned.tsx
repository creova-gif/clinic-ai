/**
 * Profile Screen - Control & Privacy
 *
 * PURPOSE: User dignity, data control, safe on shared devices
 *
 * CRITICAL REQUIREMENTS:
 * - AfyaID prominent with QR code
 * - PIN/biometric device security
 * - Auto-lock after 2 min inactivity
 * - Quick logout (<2 taps)
 * - Dependent profiles (caregiver mode)
 * - Data access log (PDPA compliance)
 * - Clear privacy controls
 * - Language toggle (immediate effect)
 * - No hidden settings
 *
 * USER GROUPS:
 * - Patient (personal data control)
 * - Caregiver (manage dependents)
 * - CHW (professional profile)
 * - Clinic staff (facility profile)
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, LogOut, Globe, Lock, Bell, Shield } from 'lucide-react';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { AnimatedButton } from '@/app/components/ui/AnimatedButton';
import {
  EmergencyIcon,
  LogOutIcon,
} from './icons/MedicalIcons';
import { MedicalButton } from './ui/medical-button';

interface Dependent {
  id: string;
  name: string;
  relationship: string;
  age: number;
  afyaId: string;
}

interface AccessLog {
  id: string;
  accessor: string;
  accessType: string;
  timestamp: string;
  facility: string;
}

interface ProfileProps {
  language: 'sw' | 'en';
  onBack: () => void;
  onNavigate: (route: string) => void;
  onLanguageChange: (lang: 'sw' | 'en') => void;
  onLogout: () => void;
  userData: {
    name: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email?: string;
    afyaId: string;
    bloodType?: string;
    allergies: string[];
    chronicConditions: string[];
    emergencyContacts: Array<{
      name: string;
      relationship: string;
      phone: string;
    }>;
  };
  userRole: 'patient' | 'caregiver' | 'chw' | 'clinic';
  dependents?: Dependent[];
  linkedFacilities?: string[];
  primaryClinic?: string;
  assignedCHW?: string;
}

export function Profile({
  language,
  onBack,
  onNavigate,
  onLanguageChange,
  onLogout,
  userData,
  userRole,
  dependents = [],
  linkedFacilities = [],
  primaryClinic,
  assignedCHW,
}: ProfileProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showAccessLog, setShowAccessLog] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // accessLogs: empty state — no mock data
  const [accessLogs] = useState<AccessLog[]>([]);

  const content = {
    sw: {
      title: 'Profaili Yangu',
      subtitle: 'Taarifa binafsi na udhibiti wa data',
      sections: {
        afyaId: 'Nambari ya AfyaID',
        afyaIdDesc: 'Nambari yako ya kitaifa ya afya. Tumia katika vituo vyote.',
        showQR: 'Onyesha QR Code',
        hideQR: 'Ficha QR Code',
        personalInfo: 'Taarifa Binafsi',
        healthBasics: 'Taarifa za Afya',
        emergencyContacts: 'Wasiliani wa Dharura',
        careNetwork: 'Mtandao wa Huduma',
        dependents: 'Wategemezi',
        privacy: 'Faragha na Data',
        settings: 'Mipangilio',
        security: 'Usalama',
      },
      fields: {
        name: 'Jina',
        dateOfBirth: 'Tarehe ya Kuzaliwa',
        age: 'Umri',
        years: 'miaka',
        gender: 'Jinsia',
        phone: 'Simu',
        email: 'Barua Pepe',
        bloodType: 'Aina ya Damu',
        allergies: 'Mzio',
        noAllergies: 'Hakuna mzio',
        chronicConditions: 'Magonjwa ya Muda Mrefu',
        noConditions: 'Hakuna',
      },
      emergencyContact: {
        relationship: 'Uhusiano',
        addContact: 'Ongeza Mtu wa Kuwasiliana',
      },
      careNetwork: {
        primaryClinic: 'Kituo cha Msingi',
        assignedCHW: 'Mhudumu wa Afya Jamii',
        linkedFacilities: 'Vituo Vilivyounganishwa',
        noFacilities: 'Hakuna vituo',
      },
      dependents: {
        manage: 'Dhibiti Wategemezi',
        add: 'Ongeza Mtegemezi',
        noDependents: 'Hakuna wategemezi',
        viewProfile: 'Angalia Profaili',
      },
      privacy: {
        consentHistory: 'Historia ya Idhini',
        dataSharing: 'Shiriki Data',
        accessLog: 'Logi ya Upatikanaji',
        viewLog: 'Angalia Logi',
        exportData: 'Pakua Data Yako',
        lastAccessed: 'Ilipatikana Mwisho',
        by: 'na',
        noActivity: 'Hakuna shughuli za hivi karibuni',
      },
      settings: {
        language: 'Lugha',
        kiswahili: 'Kiswahili',
        english: 'English',
        notifications: 'Taarifa',
        accessibility: 'Upatikanaji',
        fontSize: 'Ukubwa wa Herufi',
        highContrast: 'Mabadiliko Makubwa',
        voiceNav: 'Urambazaji wa Sauti',
      },
      security: {
        changePIN: 'Badilisha PIN',
        biometric: 'Kitambulisho cha Kibiolojia',
        enabled: 'Imewashwa',
        disabled: 'Imezimwa',
        autoLock: 'Kufunga Kiotomatiki',
        lockAfter: 'Funga baada ya',
        minutes: 'dakika',
      },
      logout: {
        button: 'Toka',
        title: 'Je, una uhakika unataka kutoka?',
        consequences: 'Utahitaji kuingia tena. Data yako ya nje ya mtandao itakaa salama.',
        clearData: 'Futa data ya ndani',
        keepData: 'Weka data ya nje ya mtandao',
        cancel: 'Ghairi',
        confirm: 'Thibitisha Kutoka',
      },
      healthStats: {
        bp: 'Shinikizo la Damu',
        weight: 'Uzito',
        bloodType: 'Aina ya Damu',
        unknown: 'Haijulikani',
      },
    },
    en: {
      title: 'My Profile',
      subtitle: 'Personal information and data control',
      sections: {
        afyaId: 'AfyaID Number',
        afyaIdDesc: 'Your national health ID. Use at all facilities.',
        showQR: 'Show QR Code',
        hideQR: 'Hide QR Code',
        personalInfo: 'Personal Information',
        healthBasics: 'Health Basics',
        emergencyContacts: 'Emergency Contacts',
        careNetwork: 'Care Network',
        dependents: 'Dependents',
        privacy: 'Privacy & Data',
        settings: 'Settings',
        security: 'Security',
      },
      fields: {
        name: 'Name',
        dateOfBirth: 'Date of Birth',
        age: 'Age',
        years: 'years',
        gender: 'Gender',
        phone: 'Phone',
        email: 'Email',
        bloodType: 'Blood Type',
        allergies: 'Allergies',
        noAllergies: 'No known allergies',
        chronicConditions: 'Chronic Conditions',
        noConditions: 'None',
      },
      emergencyContact: {
        relationship: 'Relationship',
        addContact: 'Add Contact',
      },
      careNetwork: {
        primaryClinic: 'Primary Clinic',
        assignedCHW: 'Community Health Worker',
        linkedFacilities: 'Linked Facilities',
        noFacilities: 'No facilities linked',
      },
      dependents: {
        manage: 'Manage Dependents',
        add: 'Add Dependent',
        noDependents: 'No dependents',
        viewProfile: 'View Profile',
      },
      privacy: {
        consentHistory: 'Consent History',
        dataSharing: 'Data Sharing',
        accessLog: 'Access Log',
        viewLog: 'View Log',
        exportData: 'Export Your Data',
        lastAccessed: 'Last Accessed',
        by: 'by',
        noActivity: 'Hakuna shughuli za hivi karibuni',
      },
      settings: {
        language: 'Language',
        kiswahili: 'Kiswahili',
        english: 'English',
        notifications: 'Notifications',
        accessibility: 'Accessibility',
        fontSize: 'Font Size',
        highContrast: 'High Contrast',
        voiceNav: 'Voice Navigation',
      },
      security: {
        changePIN: 'Change PIN',
        biometric: 'Biometric',
        enabled: 'Enabled',
        disabled: 'Disabled',
        autoLock: 'Auto-Lock',
        lockAfter: 'Lock after',
        minutes: 'minutes',
      },
      logout: {
        button: 'Log Out',
        title: 'Are you sure you want to log out?',
        consequences: 'You will need to log in again. Your offline data will remain safe.',
        clearData: 'Clear local data',
        keepData: 'Keep offline data',
        cancel: 'Cancel',
        confirm: 'Confirm Logout',
      },
      healthStats: {
        bp: 'Blood Pressure',
        weight: 'Weight',
        bloodType: 'Blood Type',
        unknown: 'Unknown',
      },
    },
  };

  const t = content[language];

  // Calculate age
  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(userData.dateOfBirth);

  const userRoleLabel: Record<string, string> = {
    patient: language === 'sw' ? 'Mgonjwa' : 'Patient',
    caregiver: language === 'sw' ? 'Mlezi' : 'Caregiver',
    chw: language === 'sw' ? 'Mhudumu wa Afya' : 'Community Health Worker',
    clinic: language === 'sw' ? 'Kliniki' : 'Clinic Staff',
  };

  // Logout Confirmation Modal
  if (showLogoutConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl max-w-md w-full p-6"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOutIcon size={32} color="#DC2626" />
            </div>
            <h2 className="text-xl font-semibold text-[#1E1E1E] mb-2">
              {t.logout.title}
            </h2>
            <p className="text-sm text-gray-500">{t.logout.consequences}</p>
          </div>

          <div className="space-y-3 mb-6">
            <button
              type="button"
              aria-label={t.logout.keepData}
              className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-[#1e1b4b] transition-colors text-left min-h-[48px]"
            >
              <p className="text-sm font-medium text-[#1E1E1E]">{t.logout.keepData}</p>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'sw' ? 'Kwa ajili ya simu binafsi' : 'For personal device'}
              </p>
            </button>
            <button
              type="button"
              aria-label={t.logout.clearData}
              className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-[#ef4444] transition-colors text-left min-h-[48px]"
            >
              <p className="text-sm font-medium text-[#ef4444]">{t.logout.clearData}</p>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'sw' ? 'Kwa ajili ya simu inayoshirikiwa' : 'For shared device'}
              </p>
            </button>
          </div>

          <div className="flex gap-3">
            <MedicalButton
              variant="secondary"
              size="md"
              onClick={() => setShowLogoutConfirm(false)}
              fullWidth
            >
              {t.logout.cancel}
            </MedicalButton>
            <MedicalButton
              variant="danger"
              size="md"
              onClick={() => {
                setShowLogoutConfirm(false);
                onLogout();
              }}
              fullWidth
            >
              {t.logout.confirm}
            </MedicalButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <main role="main" className="min-h-screen bg-[#FFF9F5] pb-20">
      {/* Emergency shortcut */}
      <div className="fixed top-4 right-4 z-50">
        <MedicalButton
          variant="danger"
          size="sm"
          onClick={() => onNavigate('emergency')}
          icon={<EmergencyIcon size={20} color="#FFFFFF" />}
        >
          {language === 'sw' ? 'Dharura' : 'Emergency'}
        </MedicalButton>
      </div>

      {/* Hero Header */}
      <HeroHeader name={userData.name} subtitle={userRoleLabel[userRole]} />

      <div className="px-4 py-5 space-y-5">
        {/* Health Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">{t.healthStats.bp}</p>
            <p className="text-base font-bold text-[#1e1b4b]">120/80</p>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">{t.healthStats.weight}</p>
            <p className="text-base font-bold text-[#1e1b4b]">
              {language === 'sw' ? 'Hj.' : 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">{t.healthStats.bloodType}</p>
            <p className="text-base font-bold text-[#1e1b4b]">
              {userData.bloodType ?? t.healthStats.unknown}
            </p>
          </div>
        </motion.div>

        {/* AfyaID Card */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.06 }}
          className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          <div
            className="p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #f97316 100%)' }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase opacity-70 mb-1">
              {t.sections.afyaId}
            </p>
            <p className="text-2xl font-black tracking-wide">{userData.afyaId}</p>
            <p className="text-xs opacity-60 mt-1">{t.sections.afyaIdDesc}</p>
            <button
              type="button"
              aria-label={showQRCode ? t.sections.hideQR : t.sections.showQR}
              onClick={() => setShowQRCode(!showQRCode)}
              className="mt-3 text-sm underline opacity-80 hover:opacity-100 transition-opacity"
            >
              {showQRCode ? t.sections.hideQR : t.sections.showQR}
            </button>
            {showQRCode && (
              <div className="mt-3 p-3 bg-white rounded-xl inline-block">
                <div className="w-28 h-28 bg-gray-100 flex items-center justify-center rounded">
                  <p className="text-xs text-gray-400">QR</p>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* Personal Information */}
        <SectionCard title={t.sections.personalInfo} delay={0.12}>
          <InfoRow label={t.fields.name} value={userData.name} />
          <InfoRow
            label={t.fields.dateOfBirth}
            value={`${new Date(userData.dateOfBirth).toLocaleDateString(
              language === 'sw' ? 'sw-TZ' : 'en-US'
            )} · ${age} ${t.fields.years}`}
          />
          <InfoRow label={t.fields.gender} value={userData.gender} />
          <InfoRow label={t.fields.phone} value={userData.phone} />
          {userData.email && <InfoRow label={t.fields.email} value={userData.email} />}
        </SectionCard>

        {/* Health Basics */}
        <SectionCard title={t.sections.healthBasics} delay={0.18}>
          {userData.bloodType && (
            <InfoRow label={t.fields.bloodType} value={userData.bloodType} />
          )}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5">{t.fields.allergies}</p>
            {userData.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {userData.allergies.map((allergy, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-lg"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t.fields.noAllergies}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5">
              {t.fields.chronicConditions}
            </p>
            {userData.chronicConditions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {userData.chronicConditions.map((condition, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t.fields.noConditions}</p>
            )}
          </div>
        </SectionCard>

        {/* Emergency Contacts */}
        <SectionCard title={t.sections.emergencyContacts} delay={0.24}>
          {userData.emergencyContacts.map((contact, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1"
            >
              <div>
                <p className="text-sm font-medium text-[#1e1b4b]">{contact.name}</p>
                <p className="text-xs text-gray-400">{contact.relationship}</p>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="text-sm font-semibold text-[#6366f1]"
                aria-label={`${language === 'sw' ? 'Piga simu' : 'Call'} ${contact.name}`}
              >
                {contact.phone}
              </a>
            </div>
          ))}
          <button
            type="button"
            aria-label={t.emergencyContact.addContact}
            className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-[#6366f1] hover:text-[#6366f1] transition-colors min-h-[48px]"
          >
            + {t.emergencyContact.addContact}
          </button>
        </SectionCard>

        {/* Care Network */}
        <SectionCard title={t.sections.careNetwork} delay={0.30}>
          {primaryClinic && (
            <InfoRow label={t.careNetwork.primaryClinic} value={primaryClinic} />
          )}
          {assignedCHW && (
            <InfoRow label={t.careNetwork.assignedCHW} value={assignedCHW} />
          )}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5">
              {t.careNetwork.linkedFacilities}
            </p>
            {linkedFacilities.length > 0 ? (
              <div className="space-y-1">
                {linkedFacilities.map((facility, i) => (
                  <p key={i} className="text-sm text-[#1e1b4b]">· {facility}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t.careNetwork.noFacilities}</p>
            )}
          </div>
        </SectionCard>

        {/* Dependents (Caregiver only) */}
        {userRole === 'caregiver' && (
          <SectionCard title={t.sections.dependents} delay={0.36}>
            {dependents.length > 0 ? (
              <div className="space-y-2">
                {dependents.map((dependent) => (
                  <button
                    key={dependent.id}
                    type="button"
                    aria-label={`${dependent.name} - ${t.dependents.viewProfile}`}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors min-h-[48px]"
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold text-[#1e1b4b]">{dependent.name}</p>
                      <p className="text-xs text-gray-400">
                        {dependent.relationship} · {dependent.age} {t.fields.years}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t.dependents.noDependents}</p>
            )}
            <button
              type="button"
              aria-label={t.dependents.add}
              className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-[#6366f1] hover:text-[#6366f1] transition-colors min-h-[48px]"
            >
              + {t.dependents.add}
            </button>
          </SectionCard>
        )}

        {/* Privacy & Data */}
        <SectionCard title={t.sections.privacy} delay={0.42}>
          <MenuRow
            icon={<Shield className="w-4 h-4 text-[#6366f1]" />}
            label={t.privacy.accessLog}
            description={t.privacy.viewLog}
            onClick={() => setShowAccessLog(true)}
          />
          <MenuRow
            icon={<Shield className="w-4 h-4 text-[#6366f1]" />}
            label={t.privacy.exportData}
            description="PDPA Compliance"
            onClick={() => alert('Export data functionality')}
          />
        </SectionCard>

        {/* Settings */}
        <SectionCard title={t.sections.settings} delay={0.48}>
          {/* Language Toggle */}
          <div className="pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              <Globe className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
              {t.settings.language}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label={`${t.settings.language}: Kiswahili`}
                onClick={() => onLanguageChange('sw')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                  language === 'sw'
                    ? 'bg-[#6366f1] text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {t.settings.kiswahili}
              </button>
              <button
                type="button"
                aria-label={`${t.settings.language}: English`}
                onClick={() => onLanguageChange('en')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                  language === 'en'
                    ? 'bg-[#6366f1] text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {t.settings.english}
              </button>
            </div>
          </div>
          <MenuRow
            icon={<Bell className="w-4 h-4 text-[#6366f1]" />}
            label={t.settings.notifications}
            description={language === 'sw' ? 'Dhibiti taarifa' : 'Manage notification preferences'}
            onClick={() => {}}
          />
          <MenuRow
            icon={<Lock className="w-4 h-4 text-[#6366f1]" />}
            label={t.settings.accessibility}
            description={`${t.settings.fontSize}, ${t.settings.highContrast}`}
            onClick={() => {}}
          />
        </SectionCard>

        {/* Security */}
        <SectionCard title={t.sections.security} delay={0.54}>
          <MenuRow
            icon={<Lock className="w-4 h-4 text-[#6366f1]" />}
            label={t.security.changePIN}
            description={language === 'sw' ? 'Usalama wa kifaa' : 'Device security'}
            onClick={() => {}}
          />
          <div className="flex items-center justify-between py-2 min-h-[48px]">
            <div>
              <p className="text-sm font-medium text-[#1e1b4b]">{t.security.biometric}</p>
              <p className="text-xs text-gray-400">{t.security.disabled}</p>
            </div>
            <button
              type="button"
              aria-label={`${t.security.biometric}: ${t.security.disabled}`}
              className="w-12 h-6 bg-gray-200 rounded-full transition-colors"
            />
          </div>
          <div className="py-1">
            <p className="text-sm font-medium text-[#1e1b4b]">{t.security.autoLock}</p>
            <p className="text-xs text-gray-400">
              {t.security.lockAfter} 2 {t.security.minutes}
            </p>
          </div>
        </SectionCard>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.60 }}
        >
          <AnimatedButton
            type="button"
            aria-label={t.logout.button}
            variant="danger"
            size="lg"
            fullWidth
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            {t.logout.button}
          </AnimatedButton>
        </motion.div>
      </div>

      {/* Access Log Modal */}
      {showAccessLog && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1e1b4b]">{t.privacy.accessLog}</h3>
              <button
                type="button"
                aria-label={language === 'sw' ? 'Funga' : 'Close'}
                onClick={() => setShowAccessLog(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {accessLogs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  {t.privacy.noActivity}
                </p>
              ) : (
                <div className="space-y-3">
                  {accessLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <p className="text-sm font-medium text-[#1e1b4b]">{log.accessType}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t.privacy.by} {log.accessor} · {log.facility}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString(
                          language === 'sw' ? 'sw-TZ' : 'en-US'
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

// Helper Components

function SectionCard({
  title,
  delay,
  children,
}: {
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#1e1b4b] uppercase tracking-wide">
          {title}
        </h2>
      </div>
      <div className="px-4 py-3 space-y-3">{children}</div>
    </motion.section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm text-gray-400 flex-shrink-0">{label}</p>
      <p className="text-sm font-medium text-[#1e1b4b] text-right">{value}</p>
    </div>
  );
}

function MenuRow({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors min-h-[48px] px-1"
    >
      <span className="flex-shrink-0">{icon}</span>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-[#1e1b4b]">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" aria-hidden="true" />
    </button>
  );
}
