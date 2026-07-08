/**
 * ModernLogOff - Secure Session End with Shared Device Protection
 * PDPA Compliant: Forces data clear on shared devices
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, CheckCircle2, Calendar, Phone, Heart, ChevronRight, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useSharedDeviceStore } from '../store/useSharedDeviceStore';

interface ModernLogOffProps {
  language: 'sw' | 'en';
  userName?: string;
  nextAppointment?: {
    date: string;
    time: string;
    type: string;
  };
  onConfirmLogout: () => void;
  onCancel: () => void;
}

export function ModernLogOff({
  language,
  userName = 'User',
  nextAppointment,
  onConfirmLogout,
  onCancel,
}: ModernLogOffProps) {
  const { isSharedDevice, logActivity } = useSharedDeviceStore();
  const [clearData, setClearData] = useState(isSharedDevice); // Force true on shared devices

  const content = {
    sw: {
      title: 'Kwaheri, ' + userName,
      subtitle: 'Tutaonana tena hivi karibuni',
      securityMessage: 'Taarifa zako zimehifadhiwa salama',
      securityPoints: [
        'Data yako imefungwa kwa usalama',
        'Haujasahau chochote',
        'Unaweza kurudi wakati wowote',
      ],
      sharedDeviceWarning: {
        title: 'Kifaa Kinachoshirikiwa',
        message: 'Data yako itafutwa kiotomatiki kwa usalama',
        points: [
          'Historia ya afya itafutwa',
          'Ujumbe utafutwa',
          'Picha na hati zitafutwa',
        ],
      },
      dataOptions: {
        title: 'Ni aina gani ya kifaa hiki?',
        personal: {
          title: 'Kifaa Binafsi',
          description: 'Weka data ya nje ya mtandao',
          note: 'Kwa ajili ya simu yangu binafsi',
        },
        shared: {
          title: 'Kifaa Kinachoshirikiwa',
          description: 'Futa data yote kwa usalama',
          note: 'Kwa ajili ya simu inayoshirikiwa',
        },
      },
      nextSteps: 'Hatua Zinazofuata',
      noAppointment: 'Hakuna miadi ya baadaye iliyopangwa',
      emergency: 'Kwa Dharura',
      emergencyNumber: '112',
      emergencyText: 'Piga nambari hii mara moja kwa dharura',
      logout: 'Toka',
      cancel: 'Endelea Kutumia',
      reminder: 'Kumbuka kutembelea daktari ikiwa dalili zinaendelea',
    },
    en: {
      title: 'Goodbye, ' + userName,
      subtitle: 'See you again soon',
      securityMessage: 'Your information is saved securely',
      securityPoints: [
        'Your data is encrypted and secure',
        'You haven\'t forgotten anything',
        'You can return anytime',
      ],
      sharedDeviceWarning: {
        title: 'Shared Device Detected',
        message: 'Your data will be automatically cleared for security',
        points: [
          'Health history will be cleared',
          'Messages will be cleared',
          'Photos and documents will be cleared',
        ],
      },
      dataOptions: {
        title: 'What type of device is this?',
        personal: {
          title: 'Personal Device',
          description: 'Keep offline data',
          note: 'For my personal phone',
        },
        shared: {
          title: 'Shared Device',
          description: 'Clear all data securely',
          note: 'For family/clinic/public device',
        },
      },
      nextSteps: 'Next Steps',
      noAppointment: 'No upcoming appointments scheduled',
      emergency: 'For Emergencies',
      emergencyNumber: '112',
      emergencyText: 'Call this number immediately for emergencies',
      logout: 'Log Out',
      cancel: 'Stay Signed In',
      reminder: 'Remember to see a doctor if symptoms persist',
    },
  };

  const t = content[language];

  const handleLogout = () => {
    if (clearData) {
      // Clear all sensitive data
      const keysToKeep = ['device_mode', 'device_fingerprint', 'world_class_mode'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      logActivity('LOGOUT_WITH_DATA_CLEAR', 'All user data cleared');
    } else {
      logActivity('LOGOUT_WITHOUT_DATA_CLEAR', 'Offline data retained');
    }
    
    onConfirmLogout();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-[#1E88E5] to-[#1976D2] p-8 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Heart className="w-10 h-10" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
          <p className="text-white/90">{t.subtitle}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Shared Device Warning (if applicable) */}
          {isSharedDevice && (
            <div className="p-4 bg-[#FEF2F2] border-2 border-[#FCA5A5] rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#991B1B] mb-1">
                    {t.sharedDeviceWarning.title}
                  </p>
                  <p className="text-xs text-[#991B1B]">
                    {t.sharedDeviceWarning.message}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                {t.sharedDeviceWarning.points.map((point, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-[#991B1B]">
                    <Trash2 className="w-3 h-3 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Options (only on personal devices) */}
          {!isSharedDevice && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#1A1D23]">
                {t.dataOptions.title}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setClearData(false)}
                  className={`p-3 border-2 rounded-xl text-left transition-colors ${
                    !clearData
                      ? 'border-[#1E88E5] bg-[#EFF6FF]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                >
                  <p className="text-xs font-semibold text-[#1A1D23] mb-1">
                    {t.dataOptions.personal.title}
                  </p>
                  <p className="text-[10px] text-[#6B7280]">
                    {t.dataOptions.personal.description}
                  </p>
                </button>

                <button
                  onClick={() => setClearData(true)}
                  className={`p-3 border-2 rounded-xl text-left transition-colors ${
                    clearData
                      ? 'border-[#DC2626] bg-[#FEF2F2]'
                      : 'border-[#E5E7EB] bg-white'
                  }`}
                >
                  <p className="text-xs font-semibold text-[#1A1D23] mb-1">
                    {t.dataOptions.shared.title}
                  </p>
                  <p className="text-[10px] text-[#6B7280]">
                    {t.dataOptions.shared.description}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Security assurance */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-[#ECFDF5] rounded-xl">
              <div className="w-10 h-10 bg-[#43A047] rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <p className="font-medium text-[#065F46]">{t.securityMessage}</p>
            </div>

            <div className="space-y-2">
              {t.securityPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-[#6B7280]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#43A047] flex-shrink-0" />
                  <span>{point}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Next appointment */}
          <div className="p-4 bg-[#EFF6FF] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-[#1E88E5]" />
              <span className="text-sm font-medium text-[#1E88E5]">{t.nextSteps}</span>
            </div>
            {nextAppointment ? (
              <div>
                <p className="text-sm text-[#1A1D23] font-medium">
                  {nextAppointment.type}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {nextAppointment.date} • {nextAppointment.time}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">{t.noAppointment}</p>
            )}
          </div>

          {/* Emergency contact */}
          <div className="p-4 bg-[#FEF2F2] rounded-xl border-2 border-[#FEE2E2]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#EF4444] rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#991B1B] mb-1">
                  {t.emergency}
                </p>
                <p className="text-2xl font-bold text-[#EF4444] mb-1">
                  {t.emergencyNumber}
                </p>
                <p className="text-xs text-[#991B1B]">{t.emergencyText}</p>
              </div>
            </div>
          </div>

          {/* Health reminder */}
          <div className="p-3 bg-[#FFF7ED] rounded-xl">
            <p className="text-xs text-center text-[#92400E]">{t.reminder}</p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleLogout}
              className="w-full h-12 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-xl"
            >
              {t.logout}
              {clearData && <Trash2 className="w-4 h-4 ml-2" />}
              {!clearData && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full h-12 rounded-xl"
            >
              {t.cancel}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}