/**
 * CREOVA Health OS - Patient Timeline
 * 
 * Chronological view of all patient events:
 * - Consultations
 * - Prescriptions
 * - Lab results
 * - Vitals
 * - Triage
 * - Pharmacy dispenses
 * 
 * Replaces separate tabs with unified history view
 */

import { useState } from 'react';
import { Activity, Pill, Beaker as Flask, Heart, Stethoscope, Package, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const COLORS = {
  primary: '#0F3D56',
  teal: '#1B998B',
  tealLight: '#E8F5F3',
  red: '#DC2626',
  redLight: '#FEE2E2',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  green: '#059669',
  greenLight: '#D1FAE5',
  blue: '#2563EB',
  blueLight: '#DBEAFE',
  neutral50: '#F9FAFB',
  neutral100: '#F3F4F6',
  neutral200: '#E5E7EB',
  neutral400: '#9CA3AF',
  neutral600: '#4B5563',
  neutral700: '#374151',
  neutral900: '#111827',
  white: '#FFFFFF',
};

interface TimelineEvent {
  id: string;
  type: 'consultation' | 'prescription' | 'lab' | 'vitals' | 'triage' | 'pharmacy';
  date: string;
  time: string;
  title: string;
  titleSw: string;
  provider: string;
  summary: string;
  summarySw: string;
  details?: any;
  urgent?: boolean;
}

const MOCK_TIMELINE: TimelineEvent[] = [
  {
    id: '1',
    type: 'consultation',
    date: '2026-03-15',
    time: '10:45',
    title: 'Consultation - Severe Pre-eclampsia',
    titleSw: 'Mazungumzo - Pre-eclampsia Kali',
    provider: 'Dr. Kamau',
    summary: 'BP 165/110, headache, blurred vision. Started methyldopa, referred to obstetrician.',
    summarySw: 'Shinikizo 165/110, maumivu ya kichwa, kuona vibaya. Ameanza methyldopa, anapelekwa kwa daktari wa uzazi.',
    urgent: true,
    details: {
      complaint: 'Severe headache and blurred vision',
      diagnosis: 'Severe pre-eclampsia, 32 weeks gestation',
      plan: 'Admit for observation. Start methyldopa 250mg TDS.',
    },
  },
  {
    id: '2',
    type: 'prescription',
    date: '2026-03-15',
    time: '10:50',
    title: 'Prescription - Methyldopa',
    titleSw: 'Dawa - Methyldopa',
    provider: 'Dr. Kamau',
    summary: 'Methyldopa 250mg, three times daily for 30 days',
    summarySw: 'Methyldopa 250mg, mara tatu kwa siku kwa siku 30',
    details: {
      drugs: [
        { name: 'Methyldopa 250mg', dose: '250mg', frequency: 'Three times daily', duration: '30 days' },
      ],
    },
  },
  {
    id: '3',
    type: 'vitals',
    date: '2026-03-15',
    time: '10:30',
    title: 'Vitals Recorded',
    titleSw: 'Dalili Zilizoandikwa',
    provider: 'Nurse Jane',
    summary: 'BP: 165/110 (High), HR: 98, Temp: 37.2°C, Weight: 75kg',
    summarySw: 'Shinikizo: 165/110 (Juu), Mapigo: 98, Joto: 37.2°C, Uzito: 75kg',
    urgent: true,
    details: {
      bp: '165/110',
      hr: 98,
      temp: 37.2,
      spo2: 98,
      weight: 75,
    },
  },
  {
    id: '4',
    type: 'consultation',
    date: '2026-03-10',
    time: '09:15',
    title: 'ANC Visit - Routine',
    titleSw: 'Ziara ya Mama na Mtoto - Kawaida',
    provider: 'Dr. Musa',
    summary: 'Routine antenatal check. BP 135/85, weight 73kg. All normal.',
    summarySw: 'Uchunguzi wa kawaida. Shinikizo 135/85, uzito 73kg. Yote sawa.',
    details: {
      complaint: 'Routine ANC visit',
      diagnosis: 'Healthy pregnancy, 28 weeks',
      plan: 'Continue prenatal vitamins. Return in 2 weeks.',
    },
  },
  {
    id: '5',
    type: 'lab',
    date: '2026-02-24',
    time: '14:30',
    title: 'Lab Results - Urinalysis',
    titleSw: 'Matokeo ya Maabara - Mkojo',
    provider: 'Lab Tech Sarah',
    summary: 'Proteinuria 1+, glucose negative',
    summarySw: 'Protini kwenye mkojo 1+, sukari hasi',
    details: {
      tests: [
        { name: 'Protein', result: '1+', normal: 'Negative', flag: true },
        { name: 'Glucose', result: 'Negative', normal: 'Negative', flag: false },
        { name: 'WBC', result: '2-4', normal: '0-5', flag: false },
      ],
    },
  },
  {
    id: '6',
    type: 'pharmacy',
    date: '2026-02-24',
    time: '15:00',
    title: 'Medication Dispensed',
    titleSw: 'Dawa Zimetozwa',
    provider: 'Pharmacist John',
    summary: 'Ferrous sulfate 200mg × 90 tablets',
    summarySw: 'Ferrous sulfate 200mg × vidonge 90',
    details: {
      drugs: [
        { name: 'Ferrous Sulfate 200mg', quantity: '90 tablets', batch: 'FS-2024-03' },
      ],
    },
  },
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'consultation': return Stethoscope;
    case 'prescription': return Pill;
    case 'lab': return Flask;
    case 'vitals': return Heart;
    case 'triage': return Activity;
    case 'pharmacy': return Package;
    default: return FileText;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'consultation': return COLORS.blue;
    case 'prescription': return COLORS.teal;
    case 'lab': return COLORS.amber;
    case 'vitals': return COLORS.red;
    case 'triage': return COLORS.green;
    case 'pharmacy': return COLORS.primary;
    default: return COLORS.neutral600;
  }
};

const getEventBg = (type: string) => {
  switch (type) {
    case 'consultation': return COLORS.blueLight;
    case 'prescription': return COLORS.tealLight;
    case 'lab': return COLORS.amberLight;
    case 'vitals': return COLORS.redLight;
    case 'triage': return COLORS.greenLight;
    case 'pharmacy': return COLORS.neutral100;
    default: return COLORS.neutral50;
  }
};

export default function PatientTimeline() {
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const groupEventsByDate = (events: TimelineEvent[]) => {
    const grouped: { [key: string]: TimelineEvent[] } = {};
    events.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByDate(MOCK_TIMELINE);
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return language === 'en' ? 'Today' : 'Leo';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return language === 'en' ? 'Yesterday' : 'Jana';
    } else {
      return date.toLocaleDateString('en-TZ', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: COLORS.neutral50,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Top Bar */}
      <div style={{
        height: 56,
        background: COLORS.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <div>
          <h1 style={{ margin: 0, color: COLORS.white, fontSize: 18, fontWeight: 600 }}>
            {language === 'en' ? 'Patient Timeline' : 'Historia ya Mgonjwa'}
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            Amina Juma • P-0012
          </p>
        </div>

        <button
          onClick={() => setLanguage(lang => lang === 'en' ? 'sw' : 'en')}
          style={{
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 6,
            color: COLORS.white,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {language === 'en' ? '🇬🇧 English' : '🇹🇿 Kiswahili'}
        </button>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, padding: 24, maxWidth: 900, margin: '0 auto', width: '100%' }}>
        {sortedDates.map(date => (
          <div key={date} style={{ marginBottom: 32 }}>
            {/* Date Header */}
            <div style={{
              padding: '8px 16px',
              background: COLORS.white,
              borderRadius: 8,
              marginBottom: 16,
              display: 'inline-block',
              border: `1px solid ${COLORS.neutral200}`,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.neutral900 }}>
                {formatDate(date)}
              </span>
            </div>

            {/* Events for this date */}
            <div style={{ position: 'relative', paddingLeft: 40 }}>
              {/* Timeline Line */}
              <div style={{
                position: 'absolute',
                left: 11,
                top: 0,
                bottom: 0,
                width: 2,
                background: COLORS.neutral200,
              }} />

              {groupedEvents[date].map((event, index) => {
                const Icon = getEventIcon(event.type);
                const isExpanded = expandedEvent === event.id;

                return (
                  <div key={event.id} style={{ marginBottom: 16, position: 'relative' }}>
                    {/* Timeline Dot */}
                    <div style={{
                      position: 'absolute',
                      left: -36,
                      top: 8,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: getEventColor(event.type),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `3px solid ${COLORS.white}`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                      <Icon size={12} color={COLORS.white} />
                    </div>

                    {/* Event Card */}
                    <div style={{
                      padding: 16,
                      background: COLORS.white,
                      border: event.urgent ? `2px solid ${COLORS.red}` : `1px solid ${COLORS.neutral200}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                              padding: '2px 8px',
                              background: getEventBg(event.type),
                              color: getEventColor(event.type),
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}>
                              {event.type}
                            </span>
                            <span style={{ fontSize: 11, color: COLORS.neutral600 }}>
                              {event.time}
                            </span>
                            {event.urgent && (
                              <span style={{
                                padding: '2px 6px',
                                background: COLORS.redLight,
                                color: COLORS.red,
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 600,
                              }}>
                                URGENT
                              </span>
                            )}
                          </div>
                          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: COLORS.neutral900 }}>
                            {language === 'en' ? event.title : event.titleSw}
                          </h3>
                          <p style={{ margin: '0 0 4px', fontSize: 13, color: COLORS.neutral700, lineHeight: 1.5 }}>
                            {language === 'en' ? event.summary : event.summarySw}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: COLORS.neutral600 }}>
                            {language === 'en' ? 'By' : 'Na'} {event.provider}
                          </p>
                        </div>

                        {isExpanded ? <ChevronUp size={20} color={COLORS.neutral400} /> : <ChevronDown size={20} color={COLORS.neutral400} />}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && event.details && (
                        <div style={{
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: `1px solid ${COLORS.neutral200}`,
                        }}>
                          {event.type === 'consultation' && (
                            <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                              <p style={{ margin: '0 0 8px' }}>
                                <strong style={{ color: COLORS.neutral700 }}>Complaint:</strong> {event.details.complaint}
                              </p>
                              <p style={{ margin: '0 0 8px' }}>
                                <strong style={{ color: COLORS.neutral700 }}>Diagnosis:</strong> {event.details.diagnosis}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong style={{ color: COLORS.neutral700 }}>Plan:</strong> {event.details.plan}
                              </p>
                            </div>
                          )}

                          {event.type === 'prescription' && event.details.drugs && (
                            <div>
                              {event.details.drugs.map((drug: any, i: number) => (
                                <div key={i} style={{
                                  padding: 8,
                                  background: COLORS.neutral50,
                                  borderRadius: 6,
                                  marginBottom: 6,
                                  fontSize: 12,
                                }}>
                                  <strong>{drug.name}</strong><br />
                                  {drug.dose} • {drug.frequency} • {drug.duration}
                                </div>
                              ))}
                            </div>
                          )}

                          {event.type === 'vitals' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12 }}>
                              <div>
                                <strong style={{ color: COLORS.neutral700 }}>BP:</strong> {event.details.bp}
                              </div>
                              <div>
                                <strong style={{ color: COLORS.neutral700 }}>HR:</strong> {event.details.hr} bpm
                              </div>
                              <div>
                                <strong style={{ color: COLORS.neutral700 }}>Temp:</strong> {event.details.temp}°C
                              </div>
                              <div>
                                <strong style={{ color: COLORS.neutral700 }}>SpO₂:</strong> {event.details.spo2}%
                              </div>
                              <div>
                                <strong style={{ color: COLORS.neutral700 }}>Weight:</strong> {event.details.weight}kg
                              </div>
                            </div>
                          )}

                          {event.type === 'lab' && event.details.tests && (
                            <table style={{ width: '100%', fontSize: 12 }}>
                              <thead>
                                <tr style={{ borderBottom: `1px solid ${COLORS.neutral200}` }}>
                                  <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>Test</th>
                                  <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>Result</th>
                                  <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>Normal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {event.details.tests.map((test: any, i: number) => (
                                  <tr key={i}>
                                    <td style={{ padding: '6px 0' }}>{test.name}</td>
                                    <td style={{
                                      padding: '6px 0',
                                      color: test.flag ? COLORS.red : COLORS.neutral900,
                                      fontWeight: test.flag ? 600 : 400,
                                    }}>
                                      {test.result}
                                    </td>
                                    <td style={{ padding: '6px 0', color: COLORS.neutral600 }}>{test.normal}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
