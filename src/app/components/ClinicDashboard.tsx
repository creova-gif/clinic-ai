/**
 * Clinic Operations Dashboard - AfyaCare Tanzania
 * 
 * AI-First Operating System for:
 * - Small clinics
 * - Dispensaries
 * - Pharmacies
 * - Rural health centers
 * 
 * Features:
 * - Real-time metrics
 * - AI triage integration
 * - Prescription management
 * - Pharmacy stock tracking
 * - Revenue analytics
 */

import { useState, useEffect } from 'react';
import { aiTriageApi, type TriageAssessment } from '@/app/services/aiTriageApi';
import { pharmacyApi, type StockAlert } from '@/app/services/pharmacyApi';
import { prescriptionApi, type Prescription } from '@/app/services/prescriptionApi';
import { patientQueueApi } from '@/app/services/patientQueueApi';
import { toast } from 'sonner';

const COLORS = {
  primary: "#0F3D56",
  teal: "#1B998B",
  tealLight: "#E8F5F3",
  red: "#C84B31",
  redLight: "#FDF0ED",
  amber: "#E8A020",
  amberLight: "#FDF6E8",
  green: "#2E7D32",
  greenLight: "#EDF7EE",
  blue: "#1565C0",
  blueLight: "#E8F0FB",
  neutral50: "#F7F9FC",
  neutral100: "#EEF1F6",
  neutral200: "#D8DDE8",
  neutral400: "#8A93A8",
  neutral600: "#4A5568",
  neutral800: "#1E2433",
  white: "#FFFFFF",
};

interface DashboardStats {
  dailyPatients: number;
  revenue: number;
  prescriptionsToday: number;
  labOrders: number;
  lowStockItems: number;
  highRiskPatients: number;
}

interface MetricCardProps {
  label: string;
  value: number | string;
  delta?: string;
  color: string;
  icon: string;
}

function MetricCard({ label, value, delta, color, icon }: MetricCardProps) {
  return (
    <div style={{
      background: COLORS.white,
      padding: '20px 24px',
      borderRadius: 12,
      border: `1px solid ${COLORS.neutral200}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 12, color: COLORS.neutral400, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </p>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: color + '15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
        }}>
          {icon}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: COLORS.neutral800, lineHeight: 1 }}>
        {value}
      </p>
      {delta && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: COLORS.neutral400 }}>
          {delta}
        </p>
      )}
    </div>
  );
}

interface AlertItemProps {
  type: 'stock' | 'patient' | 'prescription';
  severity: 'Low' | 'Medium' | 'High';
  message: string;
  action?: string;
  onAction?: () => void;
}

function AlertItem({ type, severity, message, action, onAction }: AlertItemProps) {
  const colors = {
    High: { bg: COLORS.redLight, text: COLORS.red, border: COLORS.red },
    Medium: { bg: COLORS.amberLight, text: '#9A6200', border: COLORS.amber },
    Low: { bg: COLORS.blueLight, text: COLORS.blue, border: COLORS.blue },
  };

  const c = colors[severity];

  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: 8,
      background: c.bg,
      borderLeft: `4px solid ${c.border}`,
      marginBottom: 8,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            color: c.text,
            background: COLORS.white,
            padding: '2px 6px',
            borderRadius: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            {severity}
          </span>
          <span style={{ fontSize: 10, color: COLORS.neutral400, textTransform: 'uppercase' }}>
            {type}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: COLORS.neutral800 }}>{message}</p>
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            background: COLORS.white,
            border: `1px solid ${c.border}`,
            color: c.text,
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
            marginLeft: 12,
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

export default function ClinicDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    dailyPatients: 0,
    revenue: 0,
    prescriptionsToday: 0,
    labOrders: 0,
    lowStockItems: 0,
    highRiskPatients: 0,
  });

  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      const [queueStats, alerts, prescriptions] = await Promise.all([
        patientQueueApi.getQueueStats(),
        pharmacyApi.getStockAlerts(),
        prescriptionApi.getPendingPrescriptions(),
      ]);

      setStats({
        dailyPatients: queueStats.total,
        revenue: queueStats.total * 5000, // Mock revenue calc (5000 TZS per patient)
        prescriptionsToday: prescriptions.length,
        labOrders: 8, // Mock
        lowStockItems: alerts.filter(a => a.type === 'LOW_STOCK').length,
        highRiskPatients: queueStats.highRisk,
      });

      setStockAlerts(alerts);
      setPendingPrescriptions(prescriptions);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.neutral50,
      }}>
        <div style={{ textAlign: 'center', color: COLORS.neutral400 }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
          <p>Loading clinic dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'triage', label: 'AI Triage', icon: '🧠' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { id: 'pharmacy', label: 'Pharmacy', icon: '📦' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: COLORS.neutral50,
      fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
    }}>
      {/* Top Bar */}
      <header style={{
        height: 60,
        background: COLORS.primary,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: COLORS.teal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>AfyaCare</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginLeft: 6 }}>Clinic OS</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Online</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
            {new Date().toLocaleDateString('en-TZ', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div style={{
        background: COLORS.white,
        borderBottom: `1px solid ${COLORS.neutral200}`,
        padding: '0 24px',
        display: 'flex',
        gap: 8,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? `3px solid ${COLORS.teal}` : '3px solid transparent',
              color: activeTab === tab.id ? COLORS.teal : COLORS.neutral400,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {activeTab === 'overview' && (
          <div>
            {/* Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}>
              <MetricCard
                label="Patients Today"
                value={stats.dailyPatients}
                delta={`${stats.highRiskPatients} high risk`}
                color={COLORS.blue}
                icon="👥"
              />
              <MetricCard
                label="Revenue (TZS)"
                value={stats.revenue.toLocaleString()}
                delta="Today's earnings"
                color={COLORS.green}
                icon="💰"
              />
              <MetricCard
                label="Prescriptions"
                value={stats.prescriptionsToday}
                delta="Pending dispensing"
                color={COLORS.amber}
                icon="💊"
              />
              <MetricCard
                label="Low Stock Items"
                value={stats.lowStockItems}
                delta="Needs reorder"
                color={COLORS.red}
                icon="📦"
              />
            </div>

            {/* Alerts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Critical Alerts */}
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: COLORS.neutral800 }}>
                  🚨 Critical Alerts
                </h3>
                <div>
                  {stats.highRiskPatients > 0 && (
                    <AlertItem
                      type="patient"
                      severity="High"
                      message={`${stats.highRiskPatients} high-risk patients waiting`}
                      action="View Queue"
                      onAction={() => setActiveTab('triage')}
                    />
                  )}
                  {stockAlerts.filter(a => a.severity === 'High').map(alert => (
                    <AlertItem
                      key={alert.id}
                      type="stock"
                      severity="High"
                      message={
                        alert.type === 'EXPIRED'
                          ? `${alert.drug_name} has expired`
                          : alert.type === 'EXPIRING_SOON'
                          ? `${alert.drug_name} expires in ${alert.days_until_expiry} days`
                          : `${alert.drug_name} stock critically low (${alert.quantity} units)`
                      }
                      action="Reorder"
                      onAction={() => setActiveTab('pharmacy')}
                    />
                  ))}
                  {stockAlerts.filter(a => a.severity === 'High').length === 0 && stats.highRiskPatients === 0 && (
                    <div style={{
                      padding: 24,
                      textAlign: 'center',
                      color: COLORS.neutral400,
                      background: COLORS.white,
                      borderRadius: 8,
                      border: `1px solid ${COLORS.neutral200}`,
                    }}>
                      ✓ No critical alerts
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Actions */}
              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: COLORS.neutral800 }}>
                  📋 Pending Actions
                </h3>
                <div>
                  {pendingPrescriptions.length > 0 && (
                    <AlertItem
                      type="prescription"
                      severity="Medium"
                      message={`${pendingPrescriptions.length} prescriptions awaiting dispensing`}
                      action="View"
                      onAction={() => setActiveTab('prescriptions')}
                    />
                  )}
                  {stockAlerts.filter(a => a.type === 'LOW_STOCK' && a.severity === 'Medium').map(alert => (
                    <AlertItem
                      key={alert.id}
                      type="stock"
                      severity="Medium"
                      message={`${alert.drug_name} stock low (${alert.quantity}/${alert.reorder_level})`}
                      action="Order"
                    />
                  ))}
                  {pendingPrescriptions.length === 0 && stockAlerts.filter(a => a.severity === 'Medium').length === 0 && (
                    <div style={{
                      padding: 24,
                      textAlign: 'center',
                      color: COLORS.neutral400,
                      background: COLORS.white,
                      borderRadius: 8,
                      border: `1px solid ${COLORS.neutral200}`,
                    }}>
                      ✓ All caught up!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ marginTop: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: COLORS.neutral800 }}>
                📈 Quick Stats
              </h3>
              <div style={{
                background: COLORS.white,
                borderRadius: 12,
                border: `1px solid ${COLORS.neutral200}`,
                padding: 24,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
                  {[
                    { label: 'Avg. wait time', value: '28 min', icon: '⏱' },
                    { label: 'Consultations/day', value: stats.dailyPatients, icon: '👨‍⚕️' },
                    { label: 'Medication stock', value: '85%', icon: '📦' },
                    { label: 'Lab tests ordered', value: stats.labOrders, icon: '🧪' },
                  ].map((stat, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
                      <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: COLORS.neutral800 }}>{stat.value}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: COLORS.neutral400 }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <div style={{
            background: COLORS.white,
            borderRadius: 12,
            border: `1px solid ${COLORS.neutral200}`,
            padding: 40,
            textAlign: 'center',
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {activeTab === 'triage' && '🧠'}
              {activeTab === 'prescriptions' && '💊'}
              {activeTab === 'pharmacy' && '📦'}
              {activeTab === 'analytics' && '📈'}
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600, color: COLORS.neutral800 }}>
              {activeTab === 'triage' && 'AI Triage Engine'}
              {activeTab === 'prescriptions' && 'E-Prescription System'}
              {activeTab === 'pharmacy' && 'Pharmacy Stock Management'}
              {activeTab === 'analytics' && 'Analytics & Reports'}
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: COLORS.neutral400, maxWidth: 400 }}>
              {activeTab === 'triage' && 'AI-powered symptom assessment and risk scoring. Supports Swahili and English voice input.'}
              {activeTab === 'prescriptions' && 'Digital prescriptions with drug interaction checking. Seamless clinic-pharmacy integration.'}
              {activeTab === 'pharmacy' && 'Complete inventory management with expiry tracking, alerts, and purchase orders.'}
              {activeTab === 'analytics' && 'Revenue tracking, patient insights, and operational metrics for clinic owners.'}
            </p>
            <div style={{ marginTop: 24, padding: '12px 24px', background: COLORS.tealLight, borderRadius: 8, color: COLORS.teal, fontSize: 13, fontWeight: 500 }}>
              Coming soon - Full module implementation
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
