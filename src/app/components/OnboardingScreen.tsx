import React, { useState } from 'react';
import { Shield, Smartphone, Check, Globe, AlertCircle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { useAppStore } from '@/app/store/useAppStore';

const translations = {
  sw: {
    title: 'Karibu AfyaAI Tanzania',
    subtitle: 'Huduma ya Afya kwa Ajili ya Wote',
    endorsed: 'Imethibitishwa na:',
    moh: 'Wizara ya Afya',
    tmda: 'Mamlaka ya Dawa na Vifaa vya Tiba Tanzania',
    disclaimer: 'AI Haisahau Madaktari',
    disclaimerText: 'Mfumo huu wa AI unasaidia tu. Ushauri wa madaktari ni muhimu daima.',
    offlineCapable: 'Inafanya kazi Bila Mtandao',
    selectRole: 'Chagua Aina Yako:',
    patient: 'Mgonjwa / Raia',
    chw: 'Mhudumu wa Afya Jamii',
    clinician: 'Daktari / Muuguzi',
    admin: 'Msimamizi wa Wizara',
    dataNotice: 'Ilani ya Data',
    dataText: 'Data yako italindwa kulingana na Sheria ya Ulinzi wa Data ya Tanzania (PDPA). Tutashiriki tu habari zinazohitajika kwa huduma yako ya afya.',
    consent: 'Nakubali masharti na ulinzi wa data',
    continue: 'Endelea',
    needConsent: 'Tafadhali kubali ili kuendelea',
  },
  en: {
    title: 'Welcome to AfyaAI Tanzania',
    subtitle: 'Healthcare for Everyone',
    endorsed: 'Endorsed by:',
    moh: 'Ministry of Health',
    tmda: 'Tanzania Medicines and Medical Devices Authority',
    disclaimer: 'AI Does Not Replace Doctors',
    disclaimerText: 'This AI system assists only. Doctor advice is always essential.',
    offlineCapable: 'Works Offline',
    selectRole: 'Select Your Role:',
    patient: 'Patient / Citizen',
    chw: 'Community Health Worker',
    clinician: 'Doctor / Nurse',
    admin: 'Ministry Administrator',
    dataNotice: 'Data Notice',
    dataText: 'Your data will be protected according to Tanzania Personal Data Protection Act (PDPA). We will only share information necessary for your healthcare.',
    consent: 'I agree to the terms and data protection',
    continue: 'Continue',
    needConsent: 'Please agree to continue',
  },
};

export function OnboardingScreen() {
  const { language, setUserRole } = useAppStore();
  const t = translations[language];
  const [hasConsented, setHasConsented] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleContinue = () => {
    if (!hasConsented) {
      setShowConsentError(true);
      return;
    }
    if (selectedRole) {
      setUserRole(selectedRole as any);
    }
  };

  const roles = [
    { id: 'patient', label: t.patient, icon: '🏥', color: 'bg-blue-50 border-blue-200' },
    { id: 'chw', label: t.chw, icon: '👨‍⚕️', color: 'bg-green-50 border-green-200' },
    { id: 'clinician', label: t.clinician, icon: '⚕️', color: 'bg-purple-50 border-purple-200' },
    { id: 'admin', label: t.admin, icon: '📊', color: 'bg-orange-50 border-orange-200' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Government Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Shield className="h-16 w-16" style={{ color: '#0F9D58' }} />
            <div>
              <h1 className="text-4xl md:text-5xl text-gray-900 mb-2">{t.title}</h1>
              <p className="text-xl" style={{ color: '#6B7280' }}>{t.subtitle}</p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <Badge variant="outline" className="text-base px-4 py-2 bg-white">
              <Shield className="h-4 w-4 mr-2" style={{ color: '#0F9D58' }} />
              {t.endorsed}
            </Badge>
            <Badge className="text-base px-4 py-2" style={{ backgroundColor: '#0F9D58' }}>
              {t.moh}
            </Badge>
            <Badge className="text-base px-4 py-2" style={{ backgroundColor: '#1C4ED8' }}>
              {t.tmda}
            </Badge>
          </div>
        </div>

        {/* AI Disclaimer */}
        <Alert className="mb-6 bg-yellow-50 border-yellow-300">
          <AlertCircle className="h-5 w-5" style={{ color: '#F59E0B' }} />
          <AlertDescription className="text-lg">
            <strong>{t.disclaimer}</strong>
            <p className="mt-1">{t.disclaimerText}</p>
          </AlertDescription>
        </Alert>

        {/* Offline Capability Notice */}
        <div className="flex items-center justify-center gap-2 mb-6" style={{ color: '#0F9D58' }}>
          <Smartphone className="h-5 w-5" />
          <Check className="h-5 w-5" />
          <span className="text-lg">{t.offlineCapable}</span>
        </div>

        {/* Role Selection */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl mb-4">{t.selectRole}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  setShowConsentError(false);
                }}
                className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-lg ${
                  role.color
                } ${selectedRole === role.id ? 'ring-4' : ''}`}
                style={selectedRole === role.id ? { '--tw-ring-color': '#0F9D58' } as React.CSSProperties : {}}
              >
                <div className="text-4xl mb-2">{role.icon}</div>
                <div className="text-xl">{role.label}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Data Protection Notice */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t.dataNotice}
          </h3>
          <p className="text-lg leading-relaxed mb-4" style={{ color: '#6B7280' }}>{t.dataText}</p>
          
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={hasConsented}
              onCheckedChange={(checked) => {
                setHasConsented(checked as boolean);
                setShowConsentError(false);
              }}
              className="mt-1"
            />
            <Label htmlFor="consent" className="text-base cursor-pointer">
              {t.consent}
            </Label>
          </div>

          {showConsentError && (
            <p className="mt-2 text-base" style={{ color: '#DC2626' }}>{t.needConsent}</p>
          )}
        </Card>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full text-xl py-6"
          style={{ backgroundColor: '#0F9D58' }}
          disabled={!selectedRole}
        >
          {t.continue}
        </Button>
      </div>
    </div>
  );
}