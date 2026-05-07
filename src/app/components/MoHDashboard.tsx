import React from 'react';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Activity,
  BarChart3,
  ArrowLeft,
  Pill,
  DollarSign,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '@/app/context/AppContext';

const translations = {
  sw: {
    title: 'Dashibodi ya Wizara ya Afya',
    overview: 'Muhtasari',
    regions: 'Mikoa',
    diseases: 'Magonjwa',
    facilities: 'Vituo vya Afya',
    alerts: 'Tahadhari',
    totalVisits: 'Ziara Jumla',
    activeCHWs: 'CHWs Hai',
    revenue: 'Mapato (TSh)',
    stockouts: 'Upungufu wa Dawa',
    rejectedClaims: 'Madai Yaliyokataliwa',
    maternalMortality: 'Vifo vya Wazazi',
    aiPredictions: 'Utabiri wa AI',
    outbreakRisk: 'Hatari ya Mlipuko',
    back: 'Rudi',
    week: 'Wiki',
    high: 'Juu',
    medium: 'Wastani',
    low: 'Chini',
    nearExpiry: 'Karibu Kuisha',
    drug: 'Dawa',
    expiry: 'Tarehe',
    stock: 'Stok',
    facilities_label: 'Vituo',
  },
  en: {
    title: 'Ministry of Health Dashboard',
    overview: 'Overview',
    regions: 'Regions',
    diseases: 'Diseases',
    facilities: 'Facilities',
    alerts: 'Alerts',
    totalVisits: 'Total Visits',
    activeCHWs: 'Active CHWs',
    revenue: 'Revenue (TSh)',
    stockouts: 'Drug Stockouts',
    rejectedClaims: 'Rejected Claims',
    maternalMortality: 'Maternal Mortality',
    aiPredictions: 'AI Predictions',
    outbreakRisk: 'Outbreak Risk',
    back: 'Back',
    week: 'Week',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    nearExpiry: 'Near Expiry',
    drug: 'Drug',
    expiry: 'Expiry',
    stock: 'Stock',
    facilities_label: 'Facilities',
  },
};

const weeklyData = [
  { week: 'W1', malaria: 420, tb: 85, ari: 340 },
  { week: 'W2', malaria: 385, tb: 92, ari: 380 },
  { week: 'W3', malaria: 450, tb: 78, ari: 325 },
  { week: 'W4', malaria: 395, tb: 88, ari: 410 },
];

const regionData = [
  { name: 'Dar es Salaam', patients: 12500, chws: 245, risk: 'high'   as const },
  { name: 'Mwanza',        patients: 8900,  chws: 189, risk: 'medium' as const },
  { name: 'Arusha',        patients: 6700,  chws: 156, risk: 'low'    as const },
  { name: 'Dodoma',        patients: 5400,  chws: 132, risk: 'medium' as const },
  { name: 'Mbeya',         patients: 7200,  chws: 167, risk: 'medium' as const },
];

const diseaseDistribution = [
  { name: 'Malaria',   value: 35, color: '#dc2626' },
  { name: 'ARIs',      value: 25, color: '#d97706' },
  { name: 'Diarrhea',  value: 18, color: '#16a34a' },
  { name: 'TB',        value: 12, color: '#0d9488' },
  { name: 'NCDs',      value: 10, color: '#0f172a' },
];

const revenueByPayer = [
  { payer: 'NHIF',      amount: 48500000 },
  { payer: 'Out-of-pocket', amount: 32100000 },
  { payer: 'Govt. grant', amount: 21000000 },
  { payer: 'NGO',       amount: 8400000 },
];

const nearExpiryDrugs = [
  { drug: 'Artemether-Lumefantrine (AL)', expiry: '2026-07-01', stock: 1240, facilities: 12 },
  { drug: 'ORS Sachets',                  expiry: '2026-06-15', stock: 4800, facilities: 8  },
  { drug: 'Cotrimoxazole 480mg',          expiry: '2026-05-30', stock: 620,  facilities: 5  },
];

interface MoHDashboardProps {
  onBack: () => void;
  onViewArchitecture?: () => void;
  onViewMonitoring?: () => void;
}

export function MoHDashboard({ onBack, onViewArchitecture, onViewMonitoring }: MoHDashboardProps) {
  const { language } = useApp();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.back}
          </Button>
          <div className="flex items-center gap-2">
            {onViewArchitecture && (
              <Button
                onClick={onViewArchitecture}
                className="gap-2 text-white"
                style={{ backgroundColor: '#0d9488' }}
              >
                <BarChart3 className="h-4 w-4" />
                {language === 'sw' ? 'Muundo wa AI' : 'AI Architecture'}
              </Button>
            )}
            {onViewMonitoring && (
              <Button
                onClick={onViewMonitoring}
                className="gap-2 text-white"
                style={{ backgroundColor: '#0d9488' }}
              >
                <Activity className="h-4 w-4" />
                {language === 'sw' ? 'Mfumo wa AI' : 'AI Monitoring'}
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-[#0f172a]">{t.title}</h1>
          <Badge className="text-sm px-3 py-1 bg-[#ccfbf1] text-[#0f766e] border-[#0d9488] border">
            {language === 'sw' ? 'Januari 2026' : 'January 2026'}
          </Badge>
        </div>

        {/* KPI Strip — visits / revenue / stockouts / rejected claims */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            {
              icon: Users,
              label: t.totalVisits,
              value: '245,670',
              trend: '+5.2%',
              up: true,
              color: '#0d9488',
              bg: '#ccfbf1',
            },
            {
              icon: DollarSign,
              label: t.revenue,
              value: '110.0M',
              trend: '+8.1%',
              up: true,
              color: '#16a34a',
              bg: '#dcfce7',
            },
            {
              icon: Pill,
              label: t.stockouts,
              value: '45',
              trend: '-3 from last week',
              up: false,
              color: '#d97706',
              bg: '#fef3c7',
            },
            {
              icon: XCircle,
              label: t.rejectedClaims,
              value: '312',
              trend: '+12%',
              up: false,
              color: '#dc2626',
              bg: '#fee2e2',
            },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="border-0 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-gray-500 flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: kpi.bg }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: kpi.color }} />
                    </div>
                    {kpi.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-[#0f172a]">{kpi.value}</div>
                  <div className={`flex items-center text-xs mt-1 ${kpi.up ? 'text-[#16a34a]' : 'text-[#d97706]'}`}>
                    {kpi.up ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {kpi.trend}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Predictions Banner */}
        <Card className="mb-5 border-[#ccfbf1] shadow-[0_2px_12px_rgba(0,0,0,0.06)]" style={{ background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0f172a]">
              <BarChart3 className="h-5 w-5 text-[#0d9488]" />
              {t.aiPredictions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#0f172a]">{t.outbreakRisk} — Malaria</span>
                  <Badge className="bg-[#fef3c7] text-[#92400e] border-0 text-xs">{t.high}</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {language === 'sw' ? 'Mwanza & Geita — Mvua zinazoendelea' : 'Mwanza & Geita — Ongoing rains'}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#0f172a]">{t.stockouts}</span>
                  <Badge className="bg-[#fee2e2] text-[#b91c1c] border-0 text-xs">45 {t.facilities_label}</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {language === 'sw' ? 'Dawa za Malaria zinaisha' : 'Malaria medications running low'}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#0f172a]">{t.maternalMortality}</span>
                  <Badge className="bg-[#dcfce7] text-[#15803d] border-0 text-xs flex items-center gap-0.5">
                    <TrendingDown className="h-3 w-3" />
                    −12%
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {language === 'sw' ? 'Robo ya mwaka' : 'Quarterly improvement'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-[#e2e8f0]">
            <TabsTrigger value="overview"  className="data-[state=active]:bg-[#0d9488] data-[state=active]:text-white">{t.overview}</TabsTrigger>
            <TabsTrigger value="regions"   className="data-[state=active]:bg-[#0d9488] data-[state=active]:text-white">{t.regions}</TabsTrigger>
            <TabsTrigger value="diseases"  className="data-[state=active]:bg-[#0d9488] data-[state=active]:text-white">{t.diseases}</TabsTrigger>
            <TabsTrigger value="facilities" className="data-[state=active]:bg-[#0d9488] data-[state=active]:text-white">{t.facilities}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Disease Trends */}
              <Card className="border-0 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-[#0f172a]">
                    {language === 'sw' ? 'Magonjwa kwa Wiki' : 'Disease Trends by Week'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="malaria" stroke="#dc2626" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="tb"      stroke="#0d9488" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="ari"     stroke="#d97706" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue by Payer */}
              <Card className="border-0 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-[#0f172a]">
                    {language === 'sw' ? 'Mapato kwa Mlipaji' : 'Revenue by Payer (TSh M)'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={revenueByPayer} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                      <YAxis dataKey="payer" type="category" tick={{ fontSize: 11 }} width={90} />
                      <Tooltip formatter={(v: number) => [`TSh ${(v / 1e6).toFixed(1)}M`]} />
                      <Bar dataKey="amount" fill="#0d9488" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="regions" className="space-y-4">
            <Card className="border-0 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-[#0f172a]">
                  {language === 'sw' ? 'Takwimu za Mikoa' : 'Regional Statistics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {regionData.map((region) => {
                    const riskStyle = {
                      high:   { bg: '#fee2e2', color: '#b91c1c', label: t.high   },
                      medium: { bg: '#fef3c7', color: '#92400e', label: t.medium },
                      low:    { bg: '#dcfce7', color: '#15803d', label: t.low    },
                    }[region.risk];
                    return (
                      <div
                        key={region.name}
                        className="flex items-center justify-between p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#0f172a] text-sm mb-0.5">{region.name}</h3>
                          <div className="flex gap-4 text-xs text-gray-400">
                            <span>{language === 'sw' ? 'Wagonjwa' : 'Patients'}: {region.patients.toLocaleString()}</span>
                            <span>CHWs: {region.chws}</span>
                          </div>
                        </div>
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: riskStyle.bg, color: riskStyle.color }}
                        >
                          {riskStyle.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diseases">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-[#0f172a]">
                    {language === 'sw' ? 'Mgawanyo wa Magonjwa' : 'Disease Distribution'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={diseaseDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name} ${entry.value}%`}
                        outerRadius={90}
                        dataKey="value"
                      >
                        {diseaseDistribution.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-[#0f172a]">
                    {language === 'sw' ? 'Magonjwa kwa Mkoa' : 'Cases by Region'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={regionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="patients" fill="#0d9488" radius={[4, 4, 0, 0]} name="Patients" />
                      <Bar dataKey="chws"     fill="#f59e0b" radius={[4, 4, 0, 0]} name="CHWs" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="facilities" className="space-y-4">
            {/* Facility Status Strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '1,232', label: language === 'sw' ? 'Hai' : 'Active',      bg: '#dcfce7', color: '#15803d', border: '#16a34a' },
                { value: '18',   label: language === 'sw' ? 'Tatizo la Dawa' : 'Drug Issues', bg: '#fef3c7', color: '#92400e', border: '#d97706' },
                { value: '6',    label: language === 'sw' ? 'Zimefungwa' : 'Offline', bg: '#fee2e2', color: '#b91c1c', border: '#dc2626' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-4 rounded-xl border-2"
                  style={{ background: s.bg, borderColor: s.border }}
                >
                  <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Near-Expiry Drug Table */}
            <Card className="border-0 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[#d97706]" />
                  {t.nearExpiry}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e2e8f0]">
                        {[t.drug, t.expiry, t.stock, t.facilities_label].map((h) => (
                          <th key={h} className="text-left py-2 px-2 text-xs text-gray-400 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {nearExpiryDrugs.map((row) => (
                        <tr key={row.drug} className="border-b border-[#f1f5f9] last:border-0">
                          <td className="py-2.5 px-2 font-medium text-[#0f172a] text-xs">{row.drug}</td>
                          <td className="py-2.5 px-2 text-[#dc2626] font-semibold text-xs">{row.expiry}</td>
                          <td className="py-2.5 px-2 text-gray-600 text-xs">{row.stock.toLocaleString()}</td>
                          <td className="py-2.5 px-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e]">
                              {row.facilities}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
