/**
 * KLINIKI - Modern Home Dashboard
 * 
 * Redesigned with modern health app aesthetics
 * Inspired by: Fitbit Premium, health tracking apps
 * 
 * Features:
 * - Personalized greeting
 * - Card-based quick actions
 * - Mini charts for key metrics
 * - Soft pastel color palette
 * - Mobile-first design
 */

import { useState } from 'react';
import { 
  Plus, 
  Activity, 
  Pill, 
  Package, 
  Users, 
  TrendingUp,
  Calendar,
  MessageCircle,
  FileText,
  Heart,
  Clock,
  ChevronRight,
  Bell,
  Settings,
  User
} from 'lucide-react';

// Modern pastel color palette inspired by health apps
const COLORS = {
  // Primary colors
  mint: '#5ECFB1',
  mintLight: '#E8F8F4',
  mintDark: '#4AB89A',
  
  // Accent colors
  purple: '#8B7FC8',
  purpleLight: '#F3F0FF',
  coral: '#FF8E72',
  coralLight: '#FFE8E3',
  sky: '#61B5E8',
  skyLight: '#E3F2FD',
  
  // Neutrals
  cream: '#F5F8FA',
  white: '#FFFFFF',
  gray50: '#FAFBFC',
  gray100: '#F4F6F8',
  gray200: '#E8EBF0',
  gray700: '#334155',
  gray800: '#1E293B',
  gray300: '#D4D9E1',
  gray400: '#99A3B3',
  gray600: '#5C677D',

  gray900: '#1A202C',
  
  // Status colors
  success: '#5ECFB1',
  warning: '#FFB84D',
  error: '#FF6B6B',
  info: '#61B5E8',
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  color: string;
  bgColor: string;
  chart?: boolean;
}

function MetricCard({ title, value, subtitle, trend, color, bgColor, chart }: MetricCardProps) {
  return (
    <div style={{
      background: COLORS.white,
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      border: `1px solid ${COLORS.gray100}`,
    }}>
      <div style={{
        fontSize: '13px',
        color: COLORS.gray600,
        marginBottom: '8px',
        fontWeight: 500,
      }}>
        {title}
      </div>
      
      <div style={{
        fontSize: '32px',
        fontWeight: 700,
        color: COLORS.gray900,
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px',
      }}>
        {value}
        {trend && (
          <span style={{
            fontSize: '14px',
            color: trend > 0 ? COLORS.success : COLORS.error,
            fontWeight: 600,
          }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      
      {subtitle && (
        <div style={{
          fontSize: '12px',
          color: COLORS.gray400,
        }}>
          {subtitle}
        </div>
      )}
      
      {chart && (
        <div style={{ marginTop: '12px' }}>
          <MiniChart color={color} />
        </div>
      )}
    </div>
  );
}

function MiniChart({ color }: { color: string }) {
  // Simple bar chart visualization
  const data = [65, 78, 82, 90, 75, 88, 92];
  const max = Math.max(...data);
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: '4px',
      height: '40px',
    }}>
      {data.map((value, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(value / max) * 100}%`,
            background: i === data.length - 1 ? color : `${color}40`,
            borderRadius: '4px',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

interface QuickActionCardProps {
  icon: any;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
  badge?: number;
}

function QuickActionCard({ icon: Icon, title, subtitle, color, bgColor, onClick, badge }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.gray100}`,
        borderRadius: '20px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        textAlign: 'left',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      }}
    >
      {badge && badge > 0 && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: COLORS.error,
          color: COLORS.white,
          borderRadius: '12px',
          padding: '2px 8px',
          fontSize: '11px',
          fontWeight: 700,
        }}>
          {badge}
        </div>
      )}
      
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
      }}>
        <Icon size={24} color={color} strokeWidth={2.5} />
      </div>
      
      <div style={{
        fontSize: '16px',
        fontWeight: 700,
        color: COLORS.gray900,
        marginBottom: '4px',
      }}>
        {title}
      </div>
      
      <div style={{
        fontSize: '13px',
        color: COLORS.gray600,
        lineHeight: '1.4',
      }}>
        {subtitle}
      </div>
    </button>
  );
}

interface InsightCardProps {
  icon: any;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  actionLabel?: string;
}

function InsightCard({ icon: Icon, title, description, color, bgColor, actionLabel }: InsightCardProps) {
  return (
    <div style={{
      background: bgColor,
      borderRadius: '16px',
      padding: '16px',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: COLORS.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={color} strokeWidth={2.5} />
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 700,
          color: COLORS.gray900,
          marginBottom: '4px',
        }}>
          {title}
        </div>
        
        <div style={{
          fontSize: '13px',
          color: COLORS.gray600,
          lineHeight: '1.4',
          marginBottom: actionLabel ? '8px' : 0,
        }}>
          {description}
        </div>
        
        {actionLabel && (
          <button style={{
            background: 'transparent',
            border: 'none',
            color: color,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {actionLabel}
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function HomeDashboardModern() {
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  
  // Get current time for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const greetingSw = hour < 12 ? 'Habari za Asubuhi' : hour < 18 ? 'Habari za Mchana' : 'Habari za Jioni';
  
  const doctorName = 'Dr. Amina';

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.cream,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: '80px',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.mintLight} 0%, ${COLORS.skyLight} 100%)`,
        padding: '20px 24px 32px',
        borderBottomLeftRadius: '30px',
        borderBottomRightRadius: '30px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '11px', color: COLORS.gray600 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
              style={{
                background: COLORS.white,
                border: 'none',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: COLORS.gray700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
              }}
            >
              {language === 'en' ? 'SW' : 'EN'}
            </button>
            
            <button style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: COLORS.white,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
            }}>
              <Bell size={18} color={COLORS.gray700} />
              <div style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: COLORS.error,
                border: `2px solid ${COLORS.white}`,
              }} />
            </button>
            
            <button style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: COLORS.mint,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
            }}>
              <User size={18} color={COLORS.white} />
            </button>
          </div>
        </div>
        
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: COLORS.gray900,
            margin: 0,
            marginBottom: '8px',
          }}>
            {language === 'en' ? greeting : greetingSw}, {doctorName}!
          </h1>
          
          <div style={{
            background: COLORS.white,
            borderRadius: '16px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            cursor: 'pointer',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: COLORS.mintLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MessageCircle size={16} color={COLORS.mint} />
            </div>
            <span style={{
              fontSize: '14px',
              color: COLORS.gray600,
              flex: 1,
            }}>
              {language === 'en' ? 'How can I help you today?' : 'Naweza kukusaidia vipi leo?'}
            </span>
            <ChevronRight size={18} color={COLORS.gray400} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px' }}>
        {/* Quick Actions */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: COLORS.gray900,
            margin: '0 0 16px 0',
          }}>
            {language === 'en' ? 'Quick Actions' : 'Vitendo vya Haraka'}
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}>
            <QuickActionCard
              icon={Calendar}
              title={language === 'en' ? 'Schedule' : 'Ratiba'}
              subtitle={language === 'en' ? 'New Appointment' : 'Miadi Mipya'}
              color={COLORS.mint}
              bgColor={COLORS.mintLight}
              badge={3}
            />
            
            <QuickActionCard
              icon={Activity}
              title={language === 'en' ? 'Triage' : 'Triage'}
              subtitle={language === 'en' ? 'Start Assessment' : 'Anza Tathmini'}
              color={COLORS.sky}
              bgColor={COLORS.skyLight}
            />
            
            <QuickActionCard
              icon={FileText}
              title={language === 'en' ? 'Consult' : 'Shauri'}
              subtitle={language === 'en' ? 'Patient Consultation' : 'Shauri la Mgonjwa'}
              color={COLORS.purple}
              bgColor={COLORS.purpleLight}
            />
            
            <QuickActionCard
              icon={Pill}
              title={language === 'en' ? 'Prescribe' : 'Dawa'}
              subtitle={language === 'en' ? 'Write Prescription' : 'Andika Dawa'}
              color={COLORS.coral}
              bgColor={COLORS.coralLight}
              badge={1}
            />
          </div>
        </div>

        {/* Today's Activity */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: COLORS.gray900,
            margin: '0 0 16px 0',
          }}>
            {language === 'en' ? "Today's Activity" : 'Shughuli za Leo'}
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}>
            <MetricCard
              title={language === 'en' ? 'Patients Today' : 'Wagonjwa Leo'}
              value={28}
              subtitle={language === 'en' ? '6 waiting now' : 'Wanasubiri 6'}
              trend={12}
              color={COLORS.mint}
              bgColor={COLORS.mintLight}
              chart
            />
            
            <MetricCard
              title={language === 'en' ? 'Consultations' : 'Mashauriano'}
              value={18}
              subtitle={language === 'en' ? '4 in progress' : 'Zinaendelea 4'}
              trend={-5}
              color={COLORS.sky}
              bgColor={COLORS.skyLight}
              chart
            />
          </div>
        </div>

        {/* Clinic Stats - Full Width Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '12px',
          marginBottom: '32px',
        }}>
          <div style={{
            background: COLORS.white,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: `1px solid ${COLORS.gray100}`,
          }}>
            <div>
              <div style={{ fontSize: '13px', color: COLORS.gray600, marginBottom: '4px' }}>
                {language === 'en' ? 'Queue Status' : 'Hali ya Foleni'}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: COLORS.gray900 }}>
                6 {language === 'en' ? 'waiting' : 'wanasubiri'}
              </div>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: COLORS.mintLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={28} color={COLORS.mint} strokeWidth={2.5} />
            </div>
          </div>

          <div style={{
            background: COLORS.white,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: `1px solid ${COLORS.gray100}`,
          }}>
            <div>
              <div style={{ fontSize: '13px', color: COLORS.gray600, marginBottom: '4px' }}>
                {language === 'en' ? 'Revenue Today' : 'Mapato Leo'}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: COLORS.gray900 }}>
                TZS 420,000
              </div>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: COLORS.skyLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={28} color={COLORS.sky} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Clinical Insights */}
        <div style={{ marginBottom: '32px' }}>
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
              {language === 'en' ? 'Clinical Insights' : 'Taarifa za Kliniki'}
            </h2>
            
            <button style={{
              background: 'transparent',
              border: 'none',
              color: COLORS.mint,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              {language === 'en' ? 'View all' : 'Ona zote'}
              <ChevronRight size={14} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InsightCard
              icon={Heart}
              title={language === 'en' ? 'High Priority Patient' : 'Mgonjwa wa Kipaumbele'}
              description={language === 'en' 
                ? 'Patient P-0023 has high fever (39.5°C) and needs immediate attention'
                : 'Mgonjwa P-0023 ana homa kali (39.5°C) anahitaji huduma haraka'
              }
              color={COLORS.error}
              bgColor={`${COLORS.error}15`}
              actionLabel={language === 'en' ? 'View patient' : 'Angalia mgonjwa'}
            />
            
            <InsightCard
              icon={Pill}
              title={language === 'en' ? 'Drug Interaction Alert' : 'Tahadhari ya Dawa'}
              description={language === 'en'
                ? 'Warfarin + Aspirin interaction detected for P-0045'
                : 'Mwingiliano wa Warfarin + Aspirin umegunduliwa kwa P-0045'
              }
              color={COLORS.warning}
              bgColor={`${COLORS.warning}15`}
              actionLabel={language === 'en' ? 'Review prescription' : 'Kagua dawa'}
            />
            
            <InsightCard
              icon={Package}
              title={language === 'en' ? 'Low Stock Alert' : 'Tahadhari ya Dawa'}
              description={language === 'en'
                ? 'Amoxicillin 500mg is running low. Reorder recommended.'
                : 'Amoxicillin 500mg inaisha. Inahitaji kuagiza.'
              }
              color={COLORS.info}
              bgColor={`${COLORS.info}15`}
              actionLabel={language === 'en' ? 'Reorder now' : 'Agiza sasa'}
            />
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: COLORS.gray900,
            margin: '0 0 16px 0',
          }}>
            {language === 'en' ? 'Recent Activity' : 'Shughuli za Hivi Karibuni'}
          </h2>
          
          <div style={{
            background: COLORS.white,
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: `1px solid ${COLORS.gray100}`,
          }}>
            {[
              { time: '5 min ago', action: 'Consultation completed', patient: 'Jean Mwangi', color: COLORS.success },
              { time: '12 min ago', action: 'Prescription issued', patient: 'Amina Ali', color: COLORS.mint },
              { time: '18 min ago', action: 'Triage completed', patient: 'Joseph Ndayisenga', color: COLORS.sky },
              { time: '25 min ago', action: 'Patient registered', patient: 'Maria Niyonsaba', color: COLORS.purple },
            ].map((activity, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '16px',
                  paddingBottom: i < 3 ? '16px' : 0,
                  marginBottom: i < 3 ? '16px' : 0,
                  borderBottom: i < 3 ? `1px solid ${COLORS.gray100}` : 'none',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: `${activity.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Clock size={18} color={activity.color} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: COLORS.gray900,
                    marginBottom: '2px',
                  }}>
                    {activity.action}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: COLORS.gray600,
                  }}>
                    {activity.patient} • {activity.time}
                  </div>
                </div>
                
                <ChevronRight size={18} color={COLORS.gray300} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: COLORS.white,
        borderTop: `1px solid ${COLORS.gray100}`,
        padding: '12px 24px',
        paddingBottom: '24px',
        display: 'flex',
        justifyContent: 'space-around',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.04)',
      }}>
        {[
          { icon: Users, label: language === 'en' ? 'Home' : 'Nyumbani', active: true },
          { icon: Activity, label: language === 'en' ? 'Patients' : 'Wagonjwa', active: false },
          { icon: MessageCircle, label: language === 'en' ? 'AI' : 'AI', active: false },
          { icon: FileText, label: language === 'en' ? 'Records' : 'Rekodi', active: false },
          { icon: User, label: language === 'en' ? 'Profile' : 'Wasifu', active: false },
        ].map((item, i) => (
          <button
            key={i}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
            }}
          >
            <item.icon 
              size={24} 
              color={item.active ? COLORS.mint : COLORS.gray400}
              strokeWidth={item.active ? 2.5 : 2}
            />
            <span style={{
              fontSize: '11px',
              fontWeight: item.active ? 600 : 500,
              color: item.active ? COLORS.mint : COLORS.gray400,
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
