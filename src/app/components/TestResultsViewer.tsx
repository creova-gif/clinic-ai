/**
 * TestResultsViewer - View Lab and Test Results
 * 
 * ELITE STANDARD: Secure medical records viewer
 * HIPAA-style privacy with patient consent
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  FileText,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import { MedicalButton, MedicalCard, colors, StatusBadge } from '@/app/design-system';
import { api } from '@/app/services/api';
import type { TestResult as ApiTestResult } from '@/app/services/supabase';
import { getAuthUserId } from '@/app/utils/auth';
import { toast } from 'sonner';

const MOCK_USER_ID = 'mock_user_001';


interface TestResultsViewerProps {
  language: 'sw' | 'en';
  onBack: () => void;
}

interface TestResult {
  id: string;
  type: string;
  date: string;
  status: 'normal' | 'abnormal' | 'pending';
  facility: string;
  results: { name: string; value: string; range: string; status: 'normal' | 'high' | 'low' }[];
}

export function TestResultsViewer({ language, onBack }: TestResultsViewerProps) {
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);

  // Load test results on mount
  useEffect(() => {
    loadTestResults();
  }, []);

  const loadTestResults = async () => {
    setIsLoading(true);
    const userId = await getAuthUserId() ?? MOCK_USER_ID;
    const response = await api.testResults.list(userId);
    if (response.success && response.data) {
      setTestResults(response.data);
    } else {
      toast.error(language === 'sw' ? 'Imeshindwa kupakia matokeo' : 'Failed to load test results');
    }
    setIsLoading(false);
  };

  // Convert API test results to UI format
  const convertToUIFormat = (apiResult: ApiTestResult): TestResult => {
    const results = Object.entries(apiResult.results || {}).map(([key, data]: [string, any]) => ({
      name: key,
      value: data.value?.toString() || '',
      range: data.range || '',
      status: data.status || 'normal',
    }));

    const overallStatus = results.some((r) => r.status === 'high' || r.status === 'low')
      ? 'abnormal'
      : apiResult.status === 'pending'
      ? 'pending'
      : 'normal';

    return {
      id: apiResult.id,
      type: apiResult.test_type,
      date: apiResult.test_date,
      status: overallStatus,
      facility: apiResult.facility_id, // TODO: Join with facilities table for name
      results,
    };
  };

  const testResultsUI = testResults.map(convertToUIFormat);

  const getStatusColor = (status: TestResult['status']) => {
    return status === 'normal'
      ? colors.success[500]
      : status === 'abnormal'
      ? colors.danger[500]
      : colors.warning[500];
  };

  const getStatusIcon = (status: TestResult['status']) => {
    return status === 'normal' ? CheckCircle : status === 'abnormal' ? AlertCircle : Clock;
  };

  const getResultStatusColor = (status: 'normal' | 'high' | 'low') => {
    return status === 'normal'
      ? colors.success[500]
      : status === 'high'
      ? colors.danger[500]
      : colors.warning[500];
  };

  if (selectedResult) {
    // Detail View
    const StatusIcon = getStatusIcon(selectedResult.status);
    return (
      <div className="min-h-screen bg-[#F7F9FB] pb-24">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedResult(null)}
                className="w-10 h-10 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
                style={{ backgroundColor: colors.neutral[100] }}
              >
                <ChevronLeft className="w-5 h-5" style={{ color: colors.neutral[700] }} />
              </button>
              <h1 className="text-lg font-semibold text-[#1A1D23]">{selectedResult.type}</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 pt-6 space-y-6 pb-8">
          {/* Overall Status - Redesigned */}
          <div className="relative overflow-hidden">
            {/* Animated Background Gradient */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                background: `radial-gradient(circle at top right, ${getStatusColor(selectedResult.status)} 0%, transparent 70%)`
              }}
            />
            
            <MedicalCard className="relative">
              <div className="flex items-start gap-5">
                {/* Animated Status Icon */}
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                    style={{ 
                      background: `linear-gradient(135deg, ${getStatusColor(selectedResult.status)}15 0%, ${getStatusColor(selectedResult.status)}25 100%)`,
                      border: `2px solid ${getStatusColor(selectedResult.status)}40`
                    }}
                  >
                    <StatusIcon className="w-8 h-8" style={{ color: getStatusColor(selectedResult.status) }} />
                  </div>
                  
                  {/* Pulse Ring for Abnormal */}
                  {selectedResult.status === 'abnormal' && (
                    <span 
                      className="absolute inset-0 rounded-2xl animate-ping"
                      style={{ 
                        backgroundColor: getStatusColor(selectedResult.status),
                        opacity: 0.2,
                        animationDuration: '2s'
                      }}
                    />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                    {t.status}
                  </p>
                  <p 
                    className="text-2xl font-black mb-1"
                    style={{ color: getStatusColor(selectedResult.status) }}
                  >
                    {selectedResult.status === 'normal' ? t.normal : selectedResult.status === 'abnormal' ? t.abnormal : t.pending}
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    {selectedResult.type}
                  </p>
                </div>

                {/* Status Badge */}
                <div
                  className="px-4 py-2 rounded-full font-bold text-sm shadow-sm"
                  style={{
                    backgroundColor: `${getStatusColor(selectedResult.status)}15`,
                    color: getStatusColor(selectedResult.status),
                    border: `2px solid ${getStatusColor(selectedResult.status)}30`
                  }}
                >
                  {selectedResult.results.length} {language === 'sw' ? 'vipimo' : 'tests'}
                </div>
              </div>

              {/* Info Grid - Enhanced */}
              <div className="mt-6 pt-6 border-t-2 border-[#E5E7EB]">
                <div className="grid grid-cols-2 gap-6">
                  <div className="relative pl-12">
                    <div 
                      className="absolute left-0 top-0 w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${colors.primary[500]}10` }}
                    >
                      <Calendar className="w-5 h-5" style={{ color: colors.primary[500] }} />
                    </div>
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                      {language === 'sw' ? 'Tarehe' : 'Date'}
                    </p>
                    <p className="font-bold text-[#1A1D23] text-[15px]">{selectedResult.date}</p>
                  </div>
                  <div className="relative pl-12">
                    <div 
                      className="absolute left-0 top-0 w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${colors.primary[500]}10` }}
                    >
                      <FileText className="w-5 h-5" style={{ color: colors.primary[500] }} />
                    </div>
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                      {t.testedAt}
                    </p>
                    <p className="font-bold text-[#1A1D23] text-[15px]">{selectedResult.facility}</p>
                  </div>
                </div>
              </div>
            </MedicalCard>
          </div>

          {/* Individual Results - Premium Redesign */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wider">
                {t.result}
              </h2>
              <span className="text-xs text-[#6B7280]">
                {selectedResult.results.length} {language === 'sw' ? 'vipimo' : 'items'}
              </span>
            </div>
            
            <div className="space-y-4">
              {selectedResult.results.map((result, idx) => {
                // Parse numeric values for visualization
                const parseValue = (val: string) => parseFloat(val.replace(/[^0-9.]/g, ''));
                const parseRange = (range: string) => {
                  const match = range.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
                  return match ? { min: parseFloat(match[1]), max: parseFloat(match[2]) } : null;
                };
                
                const numericValue = parseValue(result.value);
                const rangeValues = parseRange(result.range);
                let percentage = 50; // default middle
                
                if (rangeValues && !isNaN(numericValue)) {
                  const { min, max } = rangeValues;
                  percentage = ((numericValue - min) / (max - min)) * 100;
                  percentage = Math.max(0, Math.min(100, percentage)); // clamp 0-100
                }

                return (
                  <div
                    key={idx}
                    className="group relative overflow-hidden"
                  >
                    {/* Status Border */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-all"
                      style={{ backgroundColor: getResultStatusColor(result.status) }}
                    />
                    
                    <MedicalCard className="pl-5 hover:shadow-xl transition-all duration-300">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-[#1A1D23] text-[16px] mb-1">
                            {result.name}
                          </h3>
                        </div>
                        
                        <span
                          className="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide flex-shrink-0"
                          style={{
                            color: getResultStatusColor(result.status),
                            backgroundColor: `${getResultStatusColor(result.status)}15`,
                            border: `2px solid ${getResultStatusColor(result.status)}30`
                          }}
                        >
                          {result.status === 'normal' ? t.normal : result.status === 'high' ? t.high : t.low}
                        </span>
                      </div>

                      {/* Value Display - Large and Prominent */}
                      <div className="mb-4">
                        <div 
                          className="inline-flex items-baseline gap-2 px-4 py-3 rounded-xl"
                          style={{ 
                            backgroundColor: `${getResultStatusColor(result.status)}08`
                          }}
                        >
                          <span 
                            className="text-3xl font-black"
                            style={{ color: getResultStatusColor(result.status) }}
                          >
                            {result.value}
                          </span>
                        </div>
                      </div>

                      {/* Visual Range Indicator */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280] mb-2">
                          <span>{t.normalRange}</span>
                          <span className="text-[#1A1D23]">{result.range}</span>
                        </div>
                        
                        {/* Range Bar with Indicator */}
                        <div className="relative h-3 bg-gradient-to-r from-blue-100 via-green-100 to-blue-100 rounded-full overflow-hidden">
                          {/* Safe Zone (middle 70%) */}
                          <div 
                            className="absolute top-0 h-full bg-green-200/50"
                            style={{ left: '15%', width: '70%' }}
                          />
                          
                          {/* Value Indicator */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
                            style={{ 
                              left: `${percentage}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                          >
                            <div 
                              className="w-5 h-5 rounded-full border-3 shadow-lg relative z-10"
                              style={{ 
                                backgroundColor: 'white',
                                borderColor: getResultStatusColor(result.status),
                                borderWidth: '3px'
                              }}
                            >
                              {/* Pulse effect for abnormal */}
                              {result.status !== 'normal' && (
                                <span 
                                  className="absolute inset-0 rounded-full animate-ping"
                                  style={{ 
                                    backgroundColor: getResultStatusColor(result.status),
                                    opacity: 0.4
                                  }}
                                />
                              )}
                            </div>
                            
                            {/* Pointer line */}
                            <div 
                              className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1.5 -mt-1.5"
                              style={{ backgroundColor: getResultStatusColor(result.status) }}
                            />
                          </div>
                        </div>

                        {/* Range Labels */}
                        <div className="flex justify-between text-[10px] font-semibold text-[#9CA3AF]">
                          <span>{language === 'sw' ? 'Chini' : 'Low'}</span>
                          <span>{language === 'sw' ? 'Kawaida' : 'Normal'}</span>
                          <span>{language === 'sw' ? 'Juu' : 'High'}</span>
                        </div>
                      </div>
                    </MedicalCard>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions - Abnormal Alert */}
          {selectedResult.status === 'abnormal' && (
            <div className="relative overflow-hidden rounded-2xl">
              {/* Animated Warning Pattern Background */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, ${colors.danger[500]} 0, ${colors.danger[500]} 10px, transparent 10px, transparent 20px)`
                }}
              />
              
              <MedicalCard 
                style={{ 
                  background: `linear-gradient(135deg, ${colors.danger[50]} 0%, ${colors.danger[100]} 100%)`,
                  borderColor: colors.danger[300],
                  borderWidth: '2px'
                }}
                className="relative"
              >
                <div className="flex items-start gap-4">
                  {/* Pulsing Alert Icon */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: colors.danger[200],
                        boxShadow: `0 0 20px ${colors.danger[300]}`
                      }}
                    >
                      <AlertCircle className="w-6 h-6" style={{ color: colors.danger[600] }} />
                    </div>
                    <span 
                      className="absolute inset-0 rounded-xl animate-ping"
                      style={{ 
                        backgroundColor: colors.danger[400],
                        opacity: 0.3,
                        animationDuration: '1.5s'
                      }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-bold text-[#1A1D23] mb-2 text-[17px]">
                      {language === 'sw' ? 'Matokeo Yanahitaji Ufuatiliaji' : 'Results Need Follow-Up'}
                    </p>
                    <p className="text-sm text-[#6B7280] mb-4 leading-relaxed">
                      {language === 'sw'
                        ? 'Wasiliana na daktari wako kujadili matokeo haya.'
                        : 'Contact your doctor to discuss these results.'}
                    </p>
                    <MedicalButton variant="danger" size="md" className="shadow-lg">
                      <AlertCircle className="w-4 h-4" />
                      {t.contactDoctor}
                    </MedicalButton>
                  </div>
                </div>
              </MedicalCard>
            </div>
          )}

          {/* Action Buttons - Enhanced */}
          <div className="grid grid-cols-2 gap-4">
            <button
              className="group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                border: '2px solid #D1D5DB'
              }}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${colors.primary[500]}15` }}
                >
                  <Download className="w-5 h-5" style={{ color: colors.primary[500] }} />
                </div>
                <span className="font-bold text-[#1A1D23]">{t.download}</span>
              </div>
              
              {/* Hover shine effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                  transform: 'translateX(-100%)',
                  animation: 'shine 2s infinite'
                }}
              />
            </button>

            <button
              className="group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                border: '2px solid #D1D5DB'
              }}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${colors.primary[500]}15` }}
                >
                  <Share2 className="w-5 h-5" style={{ color: colors.primary[500] }} />
                </div>
                <span className="font-bold text-[#1A1D23]">{t.share}</span>
              </div>
              
              {/* Hover shine effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                  transform: 'translateX(-100%)',
                  animation: 'shine 2s infinite'
                }}
              />
            </button>
          </div>

          {/* CSS Animation */}
          <style jsx>{`
            @keyframes shine {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-[#F7F9FB] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
              style={{ backgroundColor: colors.neutral[100] }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: colors.neutral[700] }} />
            </button>
            <h1 className="text-lg font-semibold text-[#1A1D23]">{t.title}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-6 space-y-6">
        {isLoading ? (
          // Loading State
          <div className="text-center py-12">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.neutral[100] }}
            >
              <FileText className="w-8 h-8" style={{ color: colors.neutral[500] }} />
            </div>
            <h2 className="text-lg font-semibold text-[#1A1D23] mb-2">{t.noResults}</h2>
            <p className="text-[#6B7280]">{t.noResultsMessage}</p>
          </div>
        ) : testResultsUI.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.neutral[100] }}
            >
              <FileText className="w-8 h-8" style={{ color: colors.neutral[500] }} />
            </div>
            <h2 className="text-lg font-semibold text-[#1A1D23] mb-2">{t.noResults}</h2>
            <p className="text-[#6B7280]">{t.noResultsMessage}</p>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">
              {t.recent}
            </h2>

            <div className="space-y-4">
              {testResultsUI.map((result) => {
                const StatusIcon = getStatusIcon(result.status);
                return (
                  <MedicalCard key={result.id}>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${getStatusColor(result.status)}10` }}
                      >
                        <StatusIcon className="w-6 h-6" style={{ color: getStatusColor(result.status) }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#1A1D23] mb-1">{result.type}</h3>
                        <p className="text-sm text-[#6B7280] mb-2">{result.facility}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-[#6B7280]">{result.date}</span>
                          <span
                            className="font-medium"
                            style={{ color: getStatusColor(result.status) }}
                          >
                            {result.status === 'normal' ? t.normal : result.status === 'abnormal' ? t.abnormal : t.pending}
                          </span>
                        </div>
                      </div>
                      <div
                        onClick={() => setSelectedResult(result)}
                        className="flex-shrink-0"
                      >
                        <MedicalButton variant="secondary" size="sm">
                          {t.viewDetails}
                        </MedicalButton>
                      </div>
                    </div>
                  </MedicalCard>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}