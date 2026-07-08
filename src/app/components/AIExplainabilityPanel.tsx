import React, { useState } from 'react';
import { Brain, CheckCircle, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';

interface AIExplanation {
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'emergency';
  modelVersion: string;
  reasoning: {
    factorsConsidered: string[];
    whoIMCIMatch: string[];
    similarCases: number;
    regionalPrevalence: number;
  };
  alternativeDiagnoses?: string[];
  language: 'sw' | 'en';
}

export function AIExplainabilityPanel({
  confidence,
  riskLevel,
  modelVersion = '2.1.3',
  reasoning,
  alternativeDiagnoses,
  language = 'sw',
}: AIExplanation) {
  const t = {
    sw: {
      title: 'Jinsi AI Inavyofanya Maamuzi',
      confidence: 'Uhakika',
      model: 'Mfano',
      considered: 'Vitu Vilivyozingatiwa',
      whoMatch: 'Kufanana na WHO IMCI',
      similar: 'Visa Sawa',
      prevalence: 'Kiwango cha Mkoa',
      alternatives: 'Uwezekano Mwingine',
      safetyNote: 'Onyo la Usalama',
      safetyText: 'Maamuzi haya ni mapendekezo tu ya AI. Madaktari watakagua kwa undani zaidi na kufanya maamuzi ya mwisho ya matibabu.',
    },
    en: {
      title: 'How AI Makes This Decision',
      confidence: 'Confidence',
      model: 'Model',
      considered: 'Factors Considered',
      whoMatch: 'WHO IMCI Pattern Match',
      similar: 'Similar Cases',
      prevalence: 'Regional Prevalence',
      alternatives: 'Alternative Possibilities',
      safetyNote: 'Safety Note',
      safetyText: 'This decision is AI suggestion only. Doctors will examine in depth and make final clinical decisions.',
    },
  };

  const text = t[language];

  const getConfidenceColor = () => {
    if (confidence >= 80) return '#0F9D58';
    if (confidence >= 60) return '#F59E0B';
    return '#DC2626';
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'emergency': return '#DC2626';
      case 'high': return '#F97316';
      case 'medium': return '#F59E0B';
      default: return '#0F9D58';
    }
  };

  return (
    <Card className="border-2" style={{ borderColor: getRiskColor() }}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          {text.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Confidence Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">{text.confidence}</span>
            <Badge style={{ backgroundColor: getConfidenceColor(), color: 'white' }}>
              {confidence}%
            </Badge>
          </div>
          <Progress value={confidence} className="h-2" />
          <p className="text-xs text-gray-600 mt-1">
            {text.model}: v{modelVersion}
          </p>
        </div>

        {/* Factors Considered */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" style={{ color: '#0F9D58' }} />
            {text.considered}
          </h4>
          <div className="space-y-2">
            {reasoning.factorsConsidered.map((factor, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#1C4ED8' }} />
                {factor}
              </div>
            ))}
          </div>
        </div>

        {/* WHO IMCI Pattern Match */}
        {reasoning.whoIMCIMatch && reasoning.whoIMCIMatch.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              {text.whoMatch}
            </h4>
            <div className="space-y-1">
              {reasoning.whoIMCIMatch.map((pattern, idx) => (
                <div key={idx} className="text-sm p-2 bg-blue-50 rounded border-l-4 border-blue-600">
                  {pattern}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700 mb-1">
              {reasoning.similarCases.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">{text.similar}</div>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'sw' ? 'Kutoka data ya Tanzania' : 'From Tanzania data'}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {reasoning.regionalPrevalence}%
            </div>
            <div className="text-xs text-gray-600">{text.prevalence}</div>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'sw' ? 'Mkoa wako' : 'Your region'}
            </p>
          </div>
        </div>

        {/* Alternative Diagnoses */}
        {alternativeDiagnoses && alternativeDiagnoses.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              {text.alternatives}
            </h4>
            <div className="space-y-2">
              {alternativeDiagnoses.map((diagnosis, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-orange-50 rounded text-sm">
                  <span>{diagnosis}</span>
                  <Badge variant="outline" className="text-xs">
                    {language === 'sw' ? 'Uwezekano' : 'Possible'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical disclaimer */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {language === 'sw'
              ? 'Huu ni ushauri tu. Daktari ana uamuzi wa mwisho wa kimatibabu.'
              : 'This is guidance only. A healthcare professional makes the final clinical decision.'}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Component for showing model performance metrics
export function ModelPerformanceCard({ language = 'sw' }: { language: 'sw' | 'en' }) {
  const metrics = [
    { name: language === 'sw' ? 'Usahihi' : 'Accuracy', value: 87.5, target: 80 },
    { name: language === 'sw' ? 'Nyeti' : 'Sensitivity', value: 89.2, target: 75 },
    { name: language === 'sw' ? 'Utakikaji' : 'Specificity', value: 85.8, target: 75 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {language === 'sw' ? 'Utendaji wa Mfano' : 'Model Performance'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((metric, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span>{metric.name}</span>
              <span>
                {metric.value}% / {metric.target}%
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute h-full rounded-full transition-all"
                style={{
                  width: `${(metric.value / 100) * 100}%`,
                  backgroundColor: metric.value >= metric.target ? '#0F9D58' : '#F59E0B',
                }}
              />
              <div
                className="absolute h-full border-r-2 border-gray-600"
                style={{ left: `${metric.target}%` }}
              />
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-600 mt-3">
          {language === 'sw'
            ? 'Vigezo vya kliniki'
            : 'Clinical thresholds'}
        </p>
      </CardContent>
    </Card>
  );
}