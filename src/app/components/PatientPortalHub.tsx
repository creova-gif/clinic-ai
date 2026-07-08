import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  CreditCard,
  TestTube,
  Video,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Phone,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { useAppStore } from '@/app/store/useAppStore';

interface PatientPortalHubProps {
  onNavigate: (route: string) => void;
  onClose: () => void;
}

const translations = {
  sw: {
    title: 'Huduma za Wagonjwa',
    subtitle: 'Huduma zako za afya 24/7',
    quickActions: 'Vitendo vya Haraka',
    registration: 'Usajili wa Mgonjwa',
    registrationDesc: 'Jaza fomu za usajili',
    appointments: 'Miadi',
    appointmentsDesc: 'Tenga, badilisha, ghairi',
    payments: 'Malipo & NHIF',
    paymentsDesc: 'Hali ya malipo yako',
    labResults: 'Matokeo ya Maabara',
    labResultsDesc: 'Angalia matokeo yako',
    prescriptions: 'Dawa',
    prescriptionsDesc: 'Orodha ya dawa',
    telemedicine: 'Mazungumzo na Daktari',
    telemedicineDesc: 'Video au simu',
    healthEducation: 'Elimu ya Afya',
    healthEducationDesc: 'Jifunze kuhusu afya',
    recentActivity: 'Shughuli za Hivi Karibuni',
    upcomingAppointment: 'Miadi Inayokuja',
    pendingTasks: 'Kazi Zinazongoja',
    completeRegistration: 'Kamilisha usajili',
    viewHistory: 'Historia ya Daktari',
    payBill: 'Lipia bili',
    tasksComplete: 'kazi zimekamilika',
    viewAll: 'Angalia yote',
    close: 'Funga',
    steps: 'hatua',
    emergency: 'Dharura? Piga: 112',
  },
  en: {
    title: 'Patient Services',
    subtitle: 'Your healthcare hub 24/7',
    quickActions: 'Quick Actions',
    registration: 'Patient Registration',
    registrationDesc: 'Complete registration forms',
    appointments: 'Appointments',
    appointmentsDesc: 'Book, reschedule, cancel',
    payments: 'Payments & NHIF',
    paymentsDesc: 'Your payment status',
    labResults: 'Lab Results',
    labResultsDesc: 'View your results',
    prescriptions: 'Prescriptions',
    prescriptionsDesc: 'Medication list',
    telemedicine: 'Talk to Doctor',
    telemedicineDesc: 'Video or phone call',
    healthEducation: 'Health Education',
    healthEducationDesc: 'Learn about health',
    recentActivity: 'Recent Activity',
    upcomingAppointment: 'Upcoming Appointment',
    pendingTasks: 'Pending Tasks',
    completeRegistration: 'Complete registration',
    viewHistory: 'View medical history',
    payBill: 'Pay bill',
    tasksComplete: 'tasks complete',
    viewAll: 'View all',
    close: 'Close',
    steps: 'steps',
    emergency: 'Emergency? Call: 112',
  },
};

export function PatientPortalHub({ onNavigate, onClose }: PatientPortalHubProps) {
  const { language } = useAppStore();
  const t = translations[language];

  // Mock data - in production this would come from backend
  const [portalData] = useState({
    registrationComplete: 75,
    upcomingAppointments: [
      { date: '2026-01-20', time: '10:00', doctor: 'Dr. Mwangi', type: 'Check-up' },
    ],
    pendingTasks: 3,
    recentActivity: [
      { action: 'Lab results available', date: '2026-01-14', status: 'new' },
      { action: 'Prescription filled', date: '2026-01-12', status: 'complete' },
    ],
  });

  const quickActions = [
    {
      icon: FileText,
      title: t.registration,
      desc: t.registrationDesc,
      color: 'bg-blue-50 text-blue-600',
      route: 'registration',
      steps: 2,
    },
    {
      icon: Calendar,
      title: t.appointments,
      desc: t.appointmentsDesc,
      color: 'bg-green-50 text-green-600',
      route: 'appointments',
      steps: 3,
    },
    {
      icon: CreditCard,
      title: t.payments,
      desc: t.paymentsDesc,
      color: 'bg-amber-50 text-amber-600',
      route: 'payments',
      steps: 2,
    },
    {
      icon: TestTube,
      title: t.labResults,
      desc: t.labResultsDesc,
      color: 'bg-purple-50 text-purple-600',
      route: 'lab-results',
      steps: 1,
    },
    {
      icon: FileText,
      title: t.prescriptions,
      desc: t.prescriptionsDesc,
      color: 'bg-indigo-50 text-indigo-600',
      route: 'prescriptions',
      steps: 1,
    },
    {
      icon: Video,
      title: t.telemedicine,
      desc: t.telemedicineDesc,
      color: 'bg-teal-50 text-teal-600',
      route: 'telemedicine',
      steps: 2,
    },
    {
      icon: BookOpen,
      title: t.healthEducation,
      desc: t.healthEducationDesc,
      color: 'bg-rose-50 text-rose-600',
      route: 'health-education',
      steps: 1,
    },
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E88E5] to-[#43A047] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 mb-4"
          >
            ← {t.close}
          </Button>
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-white/90">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Registration Progress */}
        {portalData.registrationComplete < 100 && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-amber-900">
                  {t.completeRegistration}
                </h3>
                <span className="text-sm text-amber-700">
                  {portalData.registrationComplete}%
                </span>
              </div>
              <Progress value={portalData.registrationComplete} className="mb-2" />
              <Button
                size="sm"
                onClick={() => onNavigate('registration')}
                className="bg-[#FFB300] hover:bg-[#FFA000] text-black"
              >
                {t.viewAll} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Grid - Each action ≤3 steps */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">{t.quickActions}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate(action.route)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg ${action.color} mr-4`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{action.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {action.steps} {t.steps}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{action.desc}</p>
                      <ChevronRight className="h-5 w-5 text-gray-400 mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">{t.recentActivity}</h2>
          <Card>
            <CardContent className="p-4">
              {portalData.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center">
                    {activity.status === 'new' ? (
                      <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    )}
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointment */}
        {portalData.upcomingAppointments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">{t.upcomingAppointment}</h2>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <p className="font-semibold">
                        {portalData.upcomingAppointments[0].date}
                      </p>
                      <p className="text-sm text-gray-600">
                        {portalData.upcomingAppointments[0].time} •{' '}
                        {portalData.upcomingAppointments[0].doctor}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    {t.viewAll}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Emergency Contact */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-center">
              <Phone className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-semibold text-red-900">{t.emergency}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
