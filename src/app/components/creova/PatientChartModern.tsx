/**
 * KLINIKI - Modern Patient Chart
 * 
 * Redesigned with modern health app aesthetics
 * Inspired by: Health tracking apps with vitals displays
 * 
 * Features:
 * - Clean vitals display with mini charts
 * - Card-based layout
 * - Soft color palette
 * - Mobile-optimized
 */

import { useState } from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Droplet,
  Wind,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  AlertCircle,
  Pill,
  FileText,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';

// Modern pastel color palette
const COLORS = {
  mint: '#5ECFB1',
  mintLight: '#E8F8F4',
  purple: '#8B7FC8',
  purpleLight: '#F3F0FF',
  coral: '#FF8E72',
  coralLight: '#FFE8E3',
  sky: '#61B5E8',
  skyLight: '#E3F2FD',
  cream: '#F5F8FA',
  white: '#FFFFFF',
  gray100: '#F4F6F8',
  gray200: '#E8EBF0',
  gray700: '#334155',
  gray800: '#1E293B',
  gray400: '#99A3B3',
  gray600: '#5C677D',
  gray900: '#1A202C',
  success: '#5ECFB1',
  warning: '#FFB84D',
  error: '#FF6B6B',
};

interface VitalCardProps {
  icon: any;
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  range?: string;
  history?: number[];
}

function VitalCard({ icon: Icon, label, value, unit, status, trend, range, history }: VitalCardProps) {
  const statusColor = 
    status === 'critical' ? COLORS.error :
    status === 'warning' ? COLORS.warning :
    COLORS.success;
    
  const statusBg = 
    status === 'critical' ? `${COLORS.error}15` :
    status === 'warning' ? `${COLORS.warning}15` :
    `${COLORS.success}15`;

  return (
    <div style={{
      background: COLORS.white,
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      border: `1px solid ${COLORS.gray100}`,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}>
        <div>
          <div style={{
            fontSize: '13px',
            color: COLORS.gray600,
            marginBottom: '8px',
            fontWeight: 500,
          }}>
            {label}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '4px',
          }}>
            <span style={{
              fontSize: '32px',
              fontWeight: 700,
              color: COLORS.gray900,
            }}>
              {value}
            </span>
            <span style={{
              fontSize: '14px',
              color: COLORS.gray600,
              fontWeight: 500,
            }}>
              {unit}
            </span>
          </div>
          
          {range && (
            <div style={{
              fontSize: '12px',
              color: COLORS.gray400,
              marginTop: '4px',
            }}>
              {range}
            </div>
          )}
        </div>
        
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: statusBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={24} color={statusColor} strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Mini trend line */}
      {history && history.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <VitalTrendLine data={history} color={statusColor} />
        </div>
      )}
      
      {/* Status badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: statusBg,
        borderRadius: '12px',
        padding: '6px 12px',
        marginTop: '8px',
      }}>
        {trend === 'up' && <TrendingUp size={14} color={statusColor} />}
        {trend === 'down' && <TrendingDown size={14} color={statusColor} />}
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          color: statusColor,
        }}>
          {status === 'normal' ? 'In range' : status === 'warning' ? 'Monitor' : 'Alert'}
        </span>
      </div>
    </div>
  );
}

function VitalTrendLine({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  // Create SVG path for trend line
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = range === 0 ? 50 : 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      height: '32px',
      marginTop: '8px',
    }}>
      <svg width="100%" height="32" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`url(#gradient-${color})`}
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Dots */}
        {data.map((value, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = range === 0 ? 50 : 100 - ((value - min) / range) * 100;
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r="3"
              fill={i === data.length - 1 ? color : COLORS.white}
              stroke={color}
              strokeWidth="2"
            />
          );
        })}
      </svg>
      
      <div style={{
        fontSize: '10px',
        color: COLORS.gray400,
        marginLeft: '4px',
        whiteSpace: 'nowrap',
      }}>
        7d trend
      </div>
    </div>
  );
}

interface PatientHeaderProps {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  location: string;
  photo?: string;
}

function PatientHeader({ patientId, name, age, gender, phone, location, photo }: PatientHeaderProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${COLORS.mintLight} 0%, ${COLORS.skyLight} 100%)`,
      padding: '24px',
      borderBottomLeftRadius: '30px',
      borderBottomRightRadius: '30px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: photo ? `url(${photo})` : COLORS.mint,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `3px solid ${COLORS.white}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {!photo && <User size={36} color={COLORS.white} />}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '11px',
            color: COLORS.gray600,
            marginBottom: '4px',
          }}>
            Patient ID: {patientId}
          </div>
          
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: COLORS.gray900,
            margin: '0 0 8px 0',
          }}>
            {name}
          </h1>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            fontSize: '13px',
            color: COLORS.gray600,
          }}>
            <span>{age} years • {gender}</span>
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
      }}>
        <div style={{
          background: COLORS.white,
          borderRadius: '14px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: COLORS.skyLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Phone size={16} color={COLORS.sky} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: COLORS.gray400 }}>Phone</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.gray900 }}>
              {phone}
            </div>
          </div>
        </div>
        
        <div style={{
          background: COLORS.white,
          borderRadius: '14px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: COLORS.purpleLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MapPin size={16} color={COLORS.purple} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: COLORS.gray400 }}>Location</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.gray900 }}>
              {location}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientChartModern() {
  const [activeTab, setActiveTab] = useState<'vitals' | 'history' | 'medications'>('vitals');
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  // Mock patient data
  const patient = {
    id: 'P-0042',
    name: 'Jean Mwangi',
    age: 34,
    gender: 'Male',
    phone: '+255 712 345 678',
    location: 'Dar es Salaam',
  };

  const vitals = [
    {
      icon: Heart,
      label: language === 'en' ? 'Heart Rate' : 'Mapigo ya Moyo',
      value: '78',
      unit: 'bpm',
      status: 'normal' as const,
      trend: 'stable' as const,
      range: '60-100 bpm',
      history: [72, 75, 78, 76, 80, 78, 78],
    },
    {
      icon: Activity,
      label: language === 'en' ? 'Blood Pressure' : 'Shinikizo la Damu',
      value: '120/80',
      unit: 'mmHg',
      status: 'normal' as const,
      trend: 'stable' as const,
      range: '<120/<80 mmHg',
      history: [118, 122, 120, 119, 121, 120, 120],
    },
    {
      icon: Thermometer,
      label: language === 'en' ? 'Temperature' : 'Joto la Mwili',
      value: '36.8',
      unit: '°C',
      status: 'normal' as const,
      trend: 'stable' as const,
      range: '36.5-37.5 °C',
      history: [36.7, 36.9, 36.8, 36.7, 36.8, 36.9, 36.8],
    },
    {
      icon: Droplet,
      label: language === 'en' ? 'Blood Oxygen' : 'Oksijeni ya Damu',
      value: '98',
      unit: '%',
      status: 'normal' as const,
      trend: 'stable' as const,
      range: '95-100%',
      history: [97, 98, 98, 97, 98, 99, 98],
    },
    {
      icon: Wind,
      label: language === 'en' ? 'Respiratory Rate' : 'Kupumua',
      value: '16',
      unit: '/min',
      status: 'normal' as const,
      trend: 'stable' as const,
      range: '12-20 /min',
      history: [15, 16, 16, 17, 16, 15, 16],
    },
    {
      icon: Activity,
      label: language === 'en' ? 'Weight' : 'Uzito',
      value: '72',
      unit: 'kg',
      status: 'normal' as const,
      trend: 'down' as const,
      range: 'BMI: 22.5',
      history: [74, 73, 73, 72, 72, 72, 72],
    },
  ];

  const recentVisits = [
    {
      date: '2024-03-10',
      type: 'Consultation',
      complaint: 'Headache and fever',
      diagnosis: 'Upper Respiratory Tract Infection',
      doctor: 'Dr. Amina Hassan',
    },
    {
      date: '2024-02-28',
      type: 'Follow-up',
      complaint: 'Malaria treatment follow-up',
      diagnosis: 'Malaria - Recovered',
      doctor: 'Dr. Joseph Kimani',
    },
    {
      date: '2024-02-15',
      type: 'Lab Test',
      complaint: 'Malaria symptoms',
      diagnosis: 'Malaria (confirmed)',
      doctor: 'Dr. Amina Hassan',
    },
  ];

  const medications = [
    {
      name: 'Paracetamol 500mg',
      dosage: '2 tablets',
      frequency: '3 times daily',
      duration: '5 days',
      status: 'active',
    },
    {
      name: 'Amoxicillin 500mg',
      dosage: '1 capsule',
      frequency: '3 times daily',
      duration: '7 days',
      status: 'active',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.cream,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: '24px',
    }}>
      {/* Patient Header */}
      <PatientHeader
        patientId={patient.id}
        name={patient.name}
        age={patient.age}
        gender={patient.gender}
        phone={patient.phone}
        location={patient.location}
      />

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '16px 24px',
        background: COLORS.white,
        borderBottom: `1px solid ${COLORS.gray100}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {[
          { id: 'vitals', label: language === 'en' ? 'Vitals' : 'Dalili' },
          { id: 'history', label: language === 'en' ? 'History' : 'Historia' },
          { id: 'medications', label: language === 'en' ? 'Medications' : 'Dawa' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === tab.id ? COLORS.mint : 'transparent',
              color: activeTab === tab.id ? COLORS.white : COLORS.gray600,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {activeTab === 'vitals' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: COLORS.gray900,
                margin: 0,
              }}>
                {language === 'en' ? 'Latest Vitals' : 'Dalili za Hivi Karibuni'}
              </h2>
              
              <div style={{
                fontSize: '12px',
                color: COLORS.gray400,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Clock size={14} />
                {language === 'en' ? '5 min ago' : 'Dakika 5 zilizopita'}
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }}>
              {vitals.map((vital, i) => (
                <VitalCard key={i} {...vital} />
              ))}
            </div>
            
            {/* Quick Actions */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: COLORS.gray900,
                margin: '0 0 12px 0',
              }}>
                {language === 'en' ? 'Quick Actions' : 'Vitendo vya Haraka'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button style={{
                  background: COLORS.mint,
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px',
                  color: COLORS.white,
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(94, 207, 177, 0.3)',
                }}>
                  <FileText size={20} />
                  {language === 'en' ? 'Complete Consultation' : 'Maliza Shauri'}
                </button>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                }}>
                  <button style={{
                    background: COLORS.white,
                    border: `2px solid ${COLORS.gray100}`,
                    borderRadius: '14px',
                    padding: '14px',
                    color: COLORS.gray900,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}>
                    <Pill size={18} />
                    {language === 'en' ? 'Prescribe' : 'Andika Dawa'}
                  </button>
                  
                  <button style={{
                    background: COLORS.white,
                    border: `2px solid ${COLORS.gray100}`,
                    borderRadius: '14px',
                    padding: '14px',
                    color: COLORS.gray900,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}>
                    <FileText size={18} />
                    {language === 'en' ? 'Order Lab' : 'Agiza Lab'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: COLORS.gray900,
              margin: '0 0 16px 0',
            }}>
              {language === 'en' ? 'Visit History' : 'Historia ya Ziara'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentVisits.map((visit, i) => (
                <div
                  key={i}
                  style={{
                    background: COLORS.white,
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: `1px solid ${COLORS.gray100}`,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                  }}>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: COLORS.gray900,
                        marginBottom: '4px',
                      }}>
                        {visit.type}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: COLORS.gray400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <Calendar size={12} />
                        {visit.date}
                      </div>
                    </div>
                    
                    <ChevronRight size={18} color={COLORS.gray400} />
                  </div>
                  
                  <div style={{
                    fontSize: '13px',
                    color: COLORS.gray600,
                    lineHeight: '1.5',
                    marginBottom: '8px',
                  }}>
                    <strong>{language === 'en' ? 'Complaint:' : 'Malalamiko:'}</strong> {visit.complaint}
                  </div>
                  
                  <div style={{
                    fontSize: '13px',
                    color: COLORS.gray600,
                    lineHeight: '1.5',
                    marginBottom: '8px',
                  }}>
                    <strong>{language === 'en' ? 'Diagnosis:' : 'Utambuzi:'}</strong> {visit.diagnosis}
                  </div>
                  
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: COLORS.mintLight,
                    borderRadius: '12px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    color: COLORS.mint,
                    fontWeight: 600,
                  }}>
                    <User size={12} />
                    {visit.doctor}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'medications' && (
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: COLORS.gray900,
              margin: '0 0 16px 0',
            }}>
              {language === 'en' ? 'Active Medications' : 'Dawa Zinazotumika'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {medications.map((med, i) => (
                <div
                  key={i}
                  style={{
                    background: COLORS.white,
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: `1px solid ${COLORS.gray100}`,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: COLORS.coralLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Pill size={20} color={COLORS.coral} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: COLORS.gray900,
                        marginBottom: '6px',
                      }}>
                        {med.name}
                      </div>
                      
                      <div style={{
                        fontSize: '13px',
                        color: COLORS.gray600,
                        marginBottom: '4px',
                      }}>
                        {med.dosage} • {med.frequency}
                      </div>
                      
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: COLORS.mintLight,
                        borderRadius: '10px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        color: COLORS.mint,
                        fontWeight: 600,
                      }}>
                        {med.duration} remaining
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
