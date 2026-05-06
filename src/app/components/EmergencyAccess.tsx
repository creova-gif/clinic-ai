/**
 * Emergency Access Screen
 * 
 * CRITICAL REQUIREMENTS:
 * - NO authentication required (public access)
 * - NO animation (immediate display, 0ms)
 * - Works offline (cached emergency numbers)
 * - One-tap emergency call
 * - Location sharing
 * - Danger signs education
 * 
 * SAFETY:
 * - Red color scheme (urgent attention)
 * - Large touch targets (min 44px)
 * - High contrast (WCAG AAA)
 * - No complex navigation
 */

import React, { useState, useEffect } from 'react';
import {
  EmergencyIcon,
  PhoneIcon,
  LocationIcon,
  ChevronLeftIcon,
  InfoIcon,
} from './icons/MedicalIcons';
import { MedicalButton } from './ui/medical-button';

interface EmergencyAccessProps {
  language: 'sw' | 'en';
  onBack?: () => void;
  userLocation?: {
    lat: number;
    lng: number;
  };
}

interface EmergencyFacility {
  name: string;
  distance: string;
  phone: string;
  type: 'hospital' | 'clinic' | 'ambulance';
}

export function EmergencyAccess({
  language,
  onBack,
  userLocation,
}: EmergencyAccessProps) {
  const [facilities, setFacilities] = useState<EmergencyFacility[]>([]);
  const [showDangerSigns, setShowDangerSigns] = useState(false);

  const content = {
    sw: {
      title: 'Hali ya Dharura',
      subtitle: 'Hali ya hatari? Piga simu mara moja',
      callEmergency: 'Piga 112',
      emergencyNumber: '112',
      nearestFacilities: 'Vituo vya karibu',
      dangerSigns: {
        title: 'Dalili za Hatari',
        button: 'Angalia dalili za hatari',
        signs: [
          {
            title: 'Pumzi',
            description: 'Shida kubwa ya kupumua au kuchoka sana',
          },
          {
            title: 'Kifua',
            description: 'Maumivu makali ya kifua au mkono wa kushoto',
          },
          {
            title: 'Kichwani',
            description: 'Maumivu makali sana ya kichwa ya ghafla',
          },
          {
            title: 'Kuzirai',
            description: 'Kuzirai, kuzunguka, au kuanguka',
          },
          {
            title: 'Damu',
            description: 'Damu nyingi kutoka popote mwilini',
          },
          {
            title: 'Mimba',
            description: 'Maumivu makali wakati wa ujauzito au baada ya kujifungua',
          },
          {
            title: 'Mtoto',
            description: 'Mtoto asiyeweza kuamka au ana homa kali sana',
          },
          {
            title: 'Ajali',
            description: 'Ajali kubwa au jeraha kubwa',
          },
        ],
        action: 'Ukiona dalili hizi, piga simu 112 mara moja',
      },
      disclaimer: 'Huduma hii ni ya dharura tu. Usisubiri - piga simu mara moja ukiona haja.',
      shareLocation: 'Tuma mahali ulipo',
    },
    en: {
      title: 'Emergency Access',
      subtitle: 'Life-threatening emergency? Call immediately',
      callEmergency: 'Call 112',
      emergencyNumber: '112',
      nearestFacilities: 'Nearest emergency facilities',
      dangerSigns: {
        title: 'Danger Signs',
        button: 'View danger signs',
        signs: [
          {
            title: 'Breathing',
            description: 'Severe difficulty breathing or extreme tiredness',
          },
          {
            title: 'Chest',
            description: 'Severe chest pain or left arm pain',
          },
          {
            title: 'Head',
            description: 'Sudden severe headache',
          },
          {
            title: 'Consciousness',
            description: 'Fainting, dizziness, or falling',
          },
          {
            title: 'Bleeding',
            description: 'Heavy bleeding from anywhere',
          },
          {
            title: 'Pregnancy',
            description: 'Severe pain during pregnancy or after delivery',
          },
          {
            title: 'Child',
            description: 'Child cannot wake up or has very high fever',
          },
          {
            title: 'Accident',
            description: 'Major accident or severe injury',
          },
        ],
        action: 'If you see these signs, call 112 immediately',
      },
      disclaimer: 'This is for emergencies only. Do not wait - call immediately if needed.',
      shareLocation: 'Share your location',
    },
  };

  const t = content[language];

  // Mock emergency facilities (would come from API/local cache)
  useEffect(() => {
    const mockFacilities: EmergencyFacility[] = [
      {
        name: 'Muhimbili National Hospital',
        distance: '2.3 km',
        phone: '+255222150608',
        type: 'hospital',
      },
      {
        name: 'Aga Khan Hospital',
        distance: '3.1 km',
        phone: '+255222115151',
        type: 'hospital',
      },
      {
        name: 'Tanzania Red Cross Ambulance',
        distance: 'Available',
        phone: '114',
        type: 'ambulance',
      },
    ];
    setFacilities(mockFacilities);
  }, []);

  const handleEmergencyCall = () => {
    window.location.href = 'tel:112';
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // Would share location with emergency services
        const locationMessage = `Emergency location: ${position.coords.latitude}, ${position.coords.longitude}`;
        // Could send via SMS to emergency contact
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF2F2]">
      {/* Header - High contrast red */}
      <header className="bg-[#DC2626] text-white pt-4 pb-6 px-4">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-white"
            aria-label="Back"
          >
            <ChevronLeftIcon size={24} color="#FFFFFF" />
            <span>Back</span>
          </button>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <EmergencyIcon size={28} color="#FFFFFF" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-sm opacity-90">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Emergency Call Button - LARGEST, MOST VISIBLE */}
        <MedicalButton
          variant="danger"
          size="lg"
          onClick={handleEmergencyCall}
          icon={<PhoneIcon size={32} color="#FFFFFF" />}
          fullWidth
          className="h-20 text-xl font-bold shadow-lg"
        >
          {t.callEmergency}
        </MedicalButton>

        {/* Share Location */}
        <MedicalButton
          variant="secondary"
          size="md"
          onClick={handleShareLocation}
          icon={<LocationIcon size={20} color="#DC2626" />}
          fullWidth
        >
          {t.shareLocation}
        </MedicalButton>

        {/* Danger Signs */}
        <div className="bg-white rounded-xl border-2 border-[#DC2626] overflow-hidden">
          <button
            onClick={() => setShowDangerSigns(!showDangerSigns)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <InfoIcon size={24} color="#DC2626" />
              <span className="font-semibold text-[#1E1E1E]">
                {t.dangerSigns.button}
              </span>
            </div>
            <ChevronRightIcon
              size={20}
              color="#6B7280"
              className={showDangerSigns ? 'rotate-90' : ''}
            />
          </button>

          {showDangerSigns && (
            <div className="border-t border-[#FEE2E2] p-4 space-y-4">
              <p className="text-sm font-medium text-[#DC2626] mb-3">
                {t.dangerSigns.action}
              </p>

              {t.dangerSigns.signs.map((sign, index) => (
                <div
                  key={index}
                  className="p-3 bg-[#FEF2F2] rounded-lg border border-[#FEE2E2]"
                >
                  <p className="font-semibold text-[#DC2626] mb-1">
                    {sign.title}
                  </p>
                  <p className="text-sm text-[#6B7280]">{sign.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nearest Facilities */}
        <section className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#1E1E1E]">
              {t.nearestFacilities}
            </h2>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {facilities.map((facility, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-[#1E1E1E]">{facility.name}</p>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {facility.distance}
                  </p>
                </div>

                <a
                  href={`tel:${facility.phone}`}
                  className="ml-4 p-3 bg-[#DC2626] rounded-xl"
                  aria-label={`Call ${facility.name}`}
                >
                  <PhoneIcon size={20} color="#FFFFFF" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="p-4 bg-[#FEF2F2] border-2 border-[#FEE2E2] rounded-xl">
          <p className="text-sm text-[#991B1B] leading-relaxed">
            {t.disclaimer}
          </p>
        </div>
      </main>
    </div>
  );
}
