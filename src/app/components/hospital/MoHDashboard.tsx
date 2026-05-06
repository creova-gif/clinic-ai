/**
 * Ministry of Health (MoH) Analytics Dashboard
 * 
 * National-level health surveillance and reporting
 * 
 * Features:
 * - Real-time national health statistics
 * - Disease surveillance (Malaria, TB, HIV, COVID-19)
 * - Geographic heatmaps
 * - Facility performance metrics
 * - AI oversight & model monitoring
 * - DHIS2 data export
 * - Maternal & child health indicators
 * - Stock-out alerts
 * - Emergency response tracking
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  Heart,
  Baby,
  Pill,
  FileText,
  Download,
  Map,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Filter,
  Calendar
} from 'lucide-react';

interface MoHDashboardProps {
  userRole: 'moh-admin' | 'moh-viewer';
}

export const MoHAnalyticsDashboard: React.FC<MoHDashboardProps> = ({ userRole }) => {
  const { t } = useTranslation(['clinical', 'common']);
  
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(false);

  /**
   * NATIONAL STATISTICS (Mock Data)
   */
  const nationalStats = {
    activeFacilities: 5234,
    totalPatients: 12450678,
    encountersToday: 45678,
    emergencyAlerts: 23,
    
    // Disease Surveillance
    malariaCases: {
      thisWeek: 3456,
      lastWeek: 3821,
      change: -9.5,
      confirmed: 2134,
      suspected: 1322
    },
    tbCases: {
      thisMonth: 456,
      lastMonth: 478,
      change: -4.6,
      newCases: 389,
      retreatment: 67
    },
    hivTests: {
      thisWeek: 8934,
      lastWeek: 8456,
      positive: 234,
      positivityRate: 2.6
    },
    covid19: {
      thisWeek: 89,
      lastWeek: 125,
      change: -28.8,
      hospitalized: 12,
      deaths: 2
    },
    
    // Maternal Health
    maternalHealth: {
      ancVisits: 12456,
      deliveries: 3421,
      csections: 567,
      csectionRate: 16.6,
      maternalDeaths: 3,
      maternalMortalityRate: 87.7 // per 100,000 live births
    },
    
    // Facility Performance
    facilityPerformance: {
      avgWaitTime: 42, // minutes
      patientSatisfaction: 87, // percentage
      stockOutRate: 3.2, // percentage
      dataCompletenessRate: 94.5 // percentage
    },
    
    // AI Oversight
    aiOversight: {
      totalTriageSessions: 45678,
      emergencyEscalations: 234,
      falsePositiveRate: 2.3,
      modelVersion: 'v2.1.0',
      lastUpdated: new Date('2026-02-20')
    }
  };

  /**
   * REGIONAL DATA
   */
  const regionalData = [
    { region: 'Dar es Salaam', facilities: 456, patients: 2345678, malaria: 234, tb: 45, maternalDeaths: 0, alertLevel: 'normal' },
    { region: 'Mwanza', facilities: 234, patients: 1234567, malaria: 567, tb: 78, maternalDeaths: 1, alertLevel: 'elevated' },
    { region: 'Arusha', facilities: 189, patients: 987654, malaria: 123, tb: 34, maternalDeaths: 0, alertLevel: 'normal' },
    { region: 'Dodoma', facilities: 234, patients: 1123456, malaria: 345, tb: 56, maternalDeaths: 0, alertLevel: 'normal' },
    { region: 'Mbeya', facilities: 198, patients: 876543, malaria: 456, tb: 89, maternalDeaths: 1, alertLevel: 'elevated' },
    { region: 'Kilimanjaro', facilities: 167, patients: 765432, malaria: 89, tb: 23, maternalDeaths: 0, alertLevel: 'normal' }
  ];

  const regions = [
    'All Regions',
    'Dar es Salaam',
    'Mwanza',
    'Arusha',
    'Dodoma',
    'Mbeya',
    'Kilimanjaro',
    'Morogoro',
    'Mtwara',
    'Pwani',
    'Tanga'
  ];

  /**
   * EXPORT REPORTS
   */
  const exportReport = async (format: 'csv' | 'dhis2' | 'pdf') => {
    setLoading(true);
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F3D56] mb-2">
            Ministry of Health - National Dashboard
          </h1>
          <p className="text-[#6B7280]">
            Tanzania Health Information System • Real-time surveillance and analytics
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReport('csv')}
            disabled={loading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReport('dhis2')}
            disabled={loading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            DHIS2
          </Button>
          <Button
            size="sm"
            onClick={() => exportReport('pdf')}
            disabled={loading}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Full Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            {regions.map(region => (
              <option key={region} value={region.toLowerCase().replace(' ', '-')}>
                {region}
              </option>
            ))}
          </select>

          <div className="flex gap-1 bg-[#F9FAFB] rounded-lg p-1">
            {(['today', 'week', 'month', 'year'] as const).map(range => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDateRange(range)}
                className="capitalize"
              >
                {range}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </Button>

          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Custom Date Range
          </Button>
        </div>
      </Card>

      {/* National Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Facilities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Building className="h-5 w-5 text-[#0F3D56]" />
            <Badge className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          <div className="text-3xl font-bold text-[#0F3D56] mb-1">
            {nationalStats.activeFacilities.toLocaleString()}
          </div>
          <div className="text-sm text-[#6B7280]">
            Health Facilities
          </div>
        </Card>

        {/* Total Patients */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-[#2A9D8F]" />
          </div>
          <div className="text-3xl font-bold text-[#0F3D56] mb-1">
            {(nationalStats.totalPatients / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-[#6B7280]">
            Registered Patients
          </div>
        </Card>

        {/* Encounters Today */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-[#E9C46A]" />
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-[#0F3D56] mb-1">
            {nationalStats.encountersToday.toLocaleString()}
          </div>
          <div className="text-sm text-[#6B7280]">
            Patients Served Today
          </div>
        </Card>

        {/* Emergency Alerts */}
        <Card className="p-6 bg-[#FEF3F2] border-[#C84B31]">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-[#C84B31]" />
            <Badge className="bg-[#C84B31]">
              Requires Attention
            </Badge>
          </div>
          <div className="text-3xl font-bold text-[#C84B31] mb-1">
            {nationalStats.emergencyAlerts}
          </div>
          <div className="text-sm text-[#6B7280]">
            Emergency Alerts
          </div>
        </Card>
      </div>

      {/* Disease Surveillance */}
      <Card className="p-6">
        <h2 className="text-xl font-medium text-[#1E1E1E] mb-6">
          Disease Surveillance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Malaria */}
          <div className="p-4 bg-[#FEF3E7] rounded-lg border border-[#F4A261]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-[#F4A261]">Malaria Cases</h3>
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-[#F4A261] mb-2">
              {nationalStats.malariaCases.thisWeek.toLocaleString()}
            </div>
            <div className="text-sm text-[#6B7280] mb-3">
              This week ({nationalStats.malariaCases.change}% vs last week)
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Confirmed:</span>
                <span className="font-medium">{nationalStats.malariaCases.confirmed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Suspected:</span>
                <span className="font-medium">{nationalStats.malariaCases.suspected}</span>
              </div>
            </div>
          </div>

          {/* TB */}
          <div className="p-4 bg-[#F0F9FF] rounded-lg border border-[#0F3D56]/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-[#0F3D56]">TB Cases</h3>
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-[#0F3D56] mb-2">
              {nationalStats.tbCases.thisMonth.toLocaleString()}
            </div>
            <div className="text-sm text-[#6B7280] mb-3">
              This month ({nationalStats.tbCases.change}% vs last month)
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">New cases:</span>
                <span className="font-medium">{nationalStats.tbCases.newCases}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Retreatment:</span>
                <span className="font-medium">{nationalStats.tbCases.retreatment}</span>
              </div>
            </div>
          </div>

          {/* HIV */}
          <div className="p-4 bg-[#FEF3F2] rounded-lg border border-[#C84B31]/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-[#C84B31]">HIV Testing</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-[#C84B31] mb-2">
              {nationalStats.hivTests.thisWeek.toLocaleString()}
            </div>
            <div className="text-sm text-[#6B7280] mb-3">
              Tests this week
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Positive:</span>
                <span className="font-medium">{nationalStats.hivTests.positive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Positivity rate:</span>
                <span className="font-medium">{nationalStats.hivTests.positivityRate}%</span>
              </div>
            </div>
          </div>

          {/* COVID-19 */}
          <div className="p-4 bg-[#F0FDF4] rounded-lg border border-[#2A9D8F]/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-[#2A9D8F]">COVID-19</h3>
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-[#2A9D8F] mb-2">
              {nationalStats.covid19.thisWeek.toLocaleString()}
            </div>
            <div className="text-sm text-[#6B7280] mb-3">
              Cases this week ({nationalStats.covid19.change}%)
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Hospitalized:</span>
                <span className="font-medium">{nationalStats.covid19.hospitalized}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Deaths:</span>
                <span className="font-medium">{nationalStats.covid19.deaths}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Maternal & Child Health */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#FFF0F3] rounded-lg">
            <Baby className="h-6 w-6 text-[#C84B31]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-[#1E1E1E]">
              Maternal & Child Health
            </h2>
            <p className="text-sm text-[#6B7280]">
              This month
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold text-[#0F3D56] mb-1">
              {nationalStats.maternalHealth.ancVisits.toLocaleString()}
            </div>
            <div className="text-sm text-[#6B7280]">ANC Visits</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-[#0F3D56] mb-1">
              {nationalStats.maternalHealth.deliveries.toLocaleString()}
            </div>
            <div className="text-sm text-[#6B7280]">Deliveries</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-[#0F3D56] mb-1">
              {nationalStats.maternalHealth.csectionRate}%
            </div>
            <div className="text-sm text-[#6B7280]">C-Section Rate</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-[#C84B31] mb-1">
              {nationalStats.maternalHealth.maternalDeaths}
            </div>
            <div className="text-sm text-[#6B7280]">Maternal Deaths</div>
            <div className="text-xs text-[#6B7280] mt-1">
              MMR: {nationalStats.maternalHealth.maternalMortalityRate}/100k
            </div>
          </div>
        </div>
      </Card>

      {/* Regional Performance */}
      <Card className="p-6">
        <h2 className="text-xl font-medium text-[#1E1E1E] mb-6">
          Regional Performance
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-[#6B7280]">Region</th>
                <th className="text-right p-3 text-sm font-medium text-[#6B7280]">Facilities</th>
                <th className="text-right p-3 text-sm font-medium text-[#6B7280]">Patients</th>
                <th className="text-right p-3 text-sm font-medium text-[#6B7280]">Malaria</th>
                <th className="text-right p-3 text-sm font-medium text-[#6B7280]">TB</th>
                <th className="text-right p-3 text-sm font-medium text-[#6B7280]">Mat. Deaths</th>
                <th className="text-center p-3 text-sm font-medium text-[#6B7280]">Alert Status</th>
              </tr>
            </thead>
            <tbody>
              {regionalData.map((region, index) => (
                <tr key={index} className="border-b hover:bg-[#F9FAFB]">
                  <td className="p-3 font-medium text-[#1E1E1E]">{region.region}</td>
                  <td className="p-3 text-right text-[#6B7280]">{region.facilities}</td>
                  <td className="p-3 text-right text-[#6B7280]">{(region.patients / 1000000).toFixed(1)}M</td>
                  <td className="p-3 text-right text-[#6B7280]">{region.malaria}</td>
                  <td className="p-3 text-right text-[#6B7280]">{region.tb}</td>
                  <td className="p-3 text-right text-[#6B7280]">{region.maternalDeaths}</td>
                  <td className="p-3 text-center">
                    {region.alertLevel === 'normal' && (
                      <Badge className="bg-green-600">Normal</Badge>
                    )}
                    {region.alertLevel === 'elevated' && (
                      <Badge className="bg-[#F4A261]">Elevated</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Oversight */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#EFF6FF] rounded-lg">
            <Activity className="h-6 w-6 text-[#0F3D56]" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-[#1E1E1E]">
              AI Clinical Decision Support Oversight
            </h2>
            <p className="text-sm text-[#6B7280]">
              Model monitoring and performance metrics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold text-[#0F3D56] mb-1">
              {nationalStats.aiOversight.totalTriageSessions.toLocaleString()}
            </div>
            <div className="text-sm text-[#6B7280]">Total AI Triage Sessions</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-[#C84B31] mb-1">
              {nationalStats.aiOversight.emergencyEscalations}
            </div>
            <div className="text-sm text-[#6B7280]">Emergency Escalations</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-[#2A9D8F] mb-1">
              {nationalStats.aiOversight.falsePositiveRate}%
            </div>
            <div className="text-sm text-[#6B7280]">False Positive Rate</div>
          </div>

          <div>
            <div className="text-sm text-[#6B7280] mb-1">Model Version</div>
            <Badge className="bg-[#0F3D56]">
              {nationalStats.aiOversight.modelVersion}
            </Badge>
            <div className="text-xs text-[#6B7280] mt-2">
              Updated: {nationalStats.aiOversight.lastUpdated.toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Geographic Heatmap Placeholder */}
      <Card className="p-6">
        <h2 className="text-xl font-medium text-[#1E1E1E] mb-6">
          Geographic Distribution
        </h2>
        
        <div className="aspect-video bg-[#F9FAFB] rounded-lg flex items-center justify-center border-2 border-dashed">
          <div className="text-center">
            <Map className="h-16 w-16 mx-auto mb-4 text-[#6B7280]" />
            <p className="text-[#6B7280]">
              Interactive geographic heatmap<br />
              (Malaria prevalence, facility coverage, emergency alerts)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
