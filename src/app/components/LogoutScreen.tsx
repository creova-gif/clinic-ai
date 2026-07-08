import React from 'react';
import { Shield, Heart, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAppStore } from '@/app/store/useAppStore';

const translations = {
  sw: {
    title: 'Asante kwa Kutumia AfyaAI',
    dataSaved: 'Taarifa zako zimehifadhiwa salama',
    reminder: 'Kumbusho',
    medication: 'Dawa za jioni saa 2',
    appointment: 'Miadi ya kliniki Jumatatu',
    emergency: 'Dharura: 112',
    emergencyInfo: 'Ikiwa una hali ya dharura, piga simu 112',
    return: 'Rudi kwa AfyaAI',
    logout: 'Ondoka',
    confirmLogout: 'Je, una uhakika unataka kutoka?',
    cancel: 'Hapana, Endelea',
    confirm: 'Ndiyo, Ondoka',
    takecare: 'Tunakutakia afya njema!',
  },
  en: {
    title: 'Thank You for Using AfyaAI',
    dataSaved: 'Your data is saved securely',
    reminder: 'Reminders',
    medication: 'Evening medication at 8pm',
    appointment: 'Clinic appointment on Monday',
    emergency: 'Emergency: 112',
    emergencyInfo: 'If you have an emergency, call 112',
    return: 'Return to AfyaAI',
    logout: 'Logout',
    confirmLogout: 'Are you sure you want to logout?',
    cancel: 'No, Continue',
    confirm: 'Yes, Logout',
    takecare: 'Wishing you good health!',
  },
};

interface LogoutScreenProps {
  onReturn: () => void;
  onConfirmLogout: () => void;
  showConfirmation?: boolean;
}

export function LogoutScreen({ onReturn, onConfirmLogout, showConfirmation }: LogoutScreenProps) {
  const { language } = useAppStore();
  const t = translations[language];
  const [confirm, setConfirm] = React.useState(showConfirmation || false);

  if (confirm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <Shield className="h-16 w-16 mx-auto mb-6" style={{ color: '#0F9D58' }} />
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t.confirmLogout}</h2>
          
          <Card className="my-6 border-2" style={{ borderColor: '#0F9D58' }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#0F9D58' }} />
                <p className="text-base text-gray-700">{t.dataSaved}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">{t.reminder}:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {t.medication}</li>
                  <li>• {t.appointment}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={onReturn}
              className="w-full py-6 text-lg"
              style={{ backgroundColor: '#0F9D58' }}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={onConfirmLogout}
              variant="outline"
              className="w-full py-6 text-lg"
            >
              {t.confirm}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Thank you screen after logout
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Heart
            className="h-20 w-20 mx-auto mb-4 animate-pulse"
            style={{ color: '#DC2626' }}
            fill="currentColor"
          />
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#0F9D58' }}>
            {t.title}
          </h1>
          <p className="text-lg text-gray-600">{t.takecare}</p>
        </div>

        <Card className="mb-6 border-2" style={{ borderColor: '#0F9D58' }}>
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#0F9D58' }} />
              <p className="text-base text-gray-700">{t.dataSaved}</p>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">{t.reminder}:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t.medication}</li>
                <li>• {t.appointment}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="text-left flex-1">
                <p className="font-semibold text-red-900">{t.emergency}</p>
                <p className="text-sm text-red-700 mt-1">{t.emergencyInfo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={onReturn}
          className="w-full py-6 text-lg"
          style={{ backgroundColor: '#0F9D58' }}
        >
          {t.return}
        </Button>
      </div>
    </div>
  );
}
