import React, { useState } from 'react';
import {
  Brain,
  Shield,
  Database,
  Smartphone,
  Cloud,
  CheckCircle,
  AlertTriangle,
  Activity,
  FileText,
  TrendingUp,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { useAppStore } from '@/app/store/useAppStore';

const translations = {
  sw: {
    title: 'Muundo wa AI - AfyaAI TZA',
    architecture: 'Muundo',
    models: 'Mifano ya AI',
    governance: 'Usimamizi',
    compliance: 'Kufuata Sheria',
    layers: 'Safu za Mfumo',
    safety: 'Usalama wa Kliniki',
    monitoring: 'Ufuatiliaji',
    explainability: 'Uelezaji',
    performance: 'Utendaji',
    back: 'Rudi',
  },
  en: {
    title: 'AI Architecture - AfyaAI TZA',
    architecture: 'Architecture',
    models: 'AI Models',
    governance: 'Governance',
    compliance: 'Compliance',
    layers: 'System Layers',
    safety: 'Clinical Safety',
    monitoring: 'Monitoring',
    explainability: 'Explainability',
    performance: 'Performance',
    back: 'Back',
  },
};

interface AIArchitectureProps {
  onBack: () => void;
}

export function AIArchitectureDashboard({ onBack }: AIArchitectureProps) {
  const { language } = useAppStore();
  const t = translations[language];

  const systemLayers = [
    {
      name: language === 'sw' ? 'Vifaa vya Watumiaji' : 'User Devices',
      icon: Smartphone,
      items: ['Android App', 'Feature Phone (USSD/SMS)', 'CHW Tablets'],
      color: '#1C4ED8',
    },
    {
      name: language === 'sw' ? 'AI ya Nje ya Mtandao' : 'Edge AI Layer',
      icon: Brain,
      items: [
        language === 'sw' ? 'Sheria za dalili offline' : 'Offline symptom rules',
        language === 'sw' ? 'Uchanganuzi wa picha (TFLite)' : 'On-device imaging (TFLite)',
      ],
      color: '#0F9D58',
    },
    {
      name: language === 'sw' ? 'Safu ya Usalama' : 'Secure Sync Layer',
      icon: Shield,
      items: [
        language === 'sw' ? 'Foleni zilizofichwa' : 'Encrypted queues',
        language === 'sw' ? 'Msongamano wa bandwidth chini' : 'Low-bandwidth compression',
      ],
      color: '#F59E0B',
    },
    {
      name: language === 'sw' ? 'Huduma za AI Kuu' : 'Core AI Services',
      icon: Cloud,
      items: ['NLP (Swahili)', 'Risk Scoring', 'Imaging Models', 'Prediction Models'],
      color: '#8B5CF6',
    },
    {
      name: language === 'sw' ? 'Safu ya Usalama wa Kliniki' : 'Clinical Safety Layer',
      icon: Shield,
      items: ['WHO IMCI Rules', 'Threshold Gates', 'Escalation Triggers'],
      color: '#DC2626',
    },
    {
      name: language === 'sw' ? 'Usimamizi wa Wanadamu' : 'Human Oversight',
      icon: Users,
      items: ['CHWs', 'Clinicians', 'District Officers'],
      color: '#0F9D58',
    },
    {
      name: language === 'sw' ? 'Mifumo ya Kitaifa' : 'National Systems',
      icon: Database,
      items: ['DHIS2', 'OpenHIM', 'NHIF'],
      color: '#1C4ED8',
    },
  ];

  const aiModels = [
    {
      name: language === 'sw' ? 'Uchanganuzi wa Dalili' : 'Symptom Triage AI',
      type: 'Classification',
      accuracy: 87.5,
      input: language === 'sw' ? 'Dalili, umri, mimba, mkoa' : 'Symptoms, age, pregnancy, region',
      output: language === 'sw' ? 'Kiwango cha hatari + uelezaji' : 'Risk level + explanation',
      status: 'active',
      tmdaClass: 'Class B',
    },
    {
      name: language === 'sw' ? 'Uchanganuzi wa Picha za Kifua' : 'Chest X-ray AI',
      type: 'Computer Vision',
      accuracy: 92.1,
      input: language === 'sw' ? 'Picha za X-ray' : 'X-ray images',
      output: language === 'sw' ? 'Heatmap + uhakika' : 'Heatmap + confidence',
      status: 'active',
      tmdaClass: 'Class C/D',
    },
    {
      name: language === 'sw' ? 'Utabiri wa Uzazi Salama' : 'Maternal Risk Prediction',
      type: 'Time-Series',
      accuracy: 84.3,
      input: language === 'sw' ? 'Historia ya ANC, dalili' : 'ANC history, symptoms',
      output: language === 'sw' ? 'Tahadhari za hatari' : 'Risk alerts',
      status: 'active',
      tmdaClass: 'Class C',
    },
    {
      name: language === 'sw' ? 'Utabiri wa Magonjwa Sugu' : 'NCD Adherence Prediction',
      type: 'ML Classification',
      accuracy: 81.7,
      input: language === 'sw' ? 'Matumizi ya dawa, vipimo' : 'Medication use, vitals',
      output: language === 'sw' ? 'Kumbusho za SMS' : 'SMS reminders',
      status: 'active',
      tmdaClass: 'Class B',
    },
  ];

  const governanceMetrics = [
    { label: language === 'sw' ? 'Ukaguzi wa Mfano' : 'Model Audits', value: '127', status: 'good' },
    { label: language === 'sw' ? 'Ufuatiliaji wa Upendeleo' : 'Bias Monitoring', value: '98%', status: 'good' },
    { label: language === 'sw' ? 'Ukaguzi wa Mkoa' : 'Regional Audits', value: '26/26', status: 'good' },
    { label: language === 'sw' ? 'Kufuata Kanuni' : 'Policy Compliance', value: '4/4', status: 'good' },
    { label: language === 'sw' ? 'PDPA Kufuata' : 'PDPA Compliance', value: '100%', status: 'good' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.back}
        </Button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl">{t.title}</h1>
        </div>

        <Tabs defaultValue="architecture" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="architecture">{t.architecture}</TabsTrigger>
            <TabsTrigger value="models">{t.models}</TabsTrigger>
            <TabsTrigger value="governance">{t.governance}</TabsTrigger>
            <TabsTrigger value="compliance">{t.compliance}</TabsTrigger>
          </TabsList>

          {/* System Architecture Tab */}
          <TabsContent value="architecture" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t.layers}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemLayers.map((layer, idx) => {
                    const Icon = layer.icon;
                    return (
                      <div key={idx}>
                        <Card
                          className="border-2"
                          style={{ borderColor: layer.color }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: `${layer.color}15` }}
                              >
                                <Icon className="h-6 w-6" style={{ color: layer.color }} />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2">{layer.name}</h3>
                                <ul className="space-y-1">
                                  {layer.items.map((item, i) => (
                                    <li key={i} className="text-sm flex items-center gap-2">
                                      <CheckCircle className="h-3 w-3" style={{ color: layer.color }} />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        {idx < systemLayers.length - 1 && (
                          <div className="flex justify-center py-2">
                            <div className="text-2xl" style={{ color: '#6B7280' }}>↓</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Human-in-the-Loop */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2" style={{ borderColor: '#0F9D58' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: '#0F9D58' }} />
                  {language === 'sw' ? 'Wanadamu-kwenye-Kitanzi' : 'Human-in-the-Loop'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-3">
                  {language === 'sw'
                    ? 'AI inasaidia tu. Maamuzi yote ya matibabu yanahitaji kuthibitishwa na wataalamu wa afya.'
                    : 'AI assists only. All clinical decisions require validation by healthcare professionals.'}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-lg text-center">
                    <div className="text-2xl mb-1">👨‍⚕️</div>
                    <div className="text-sm">CHWs</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg text-center">
                    <div className="text-2xl mb-1">⚕️</div>
                    <div className="text-sm">{language === 'sw' ? 'Madaktari' : 'Clinicians'}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg text-center">
                    <div className="text-2xl mb-1">📊</div>
                    <div className="text-sm">{language === 'sw' ? 'Wasimamizi' : 'Administrators'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {aiModels.map((model, idx) => (
                <Card key={idx} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{model.name}</CardTitle>
                        <p className="text-sm text-gray-600">{model.type}</p>
                      </div>
                      <Badge style={{ backgroundColor: '#1C4ED8' }}>{model.tmdaClass}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{language === 'sw' ? 'Usahihi' : 'Accuracy'}</span>
                          <span style={{ color: '#0F9D58' }}>{model.accuracy}%</span>
                        </div>
                        <Progress value={model.accuracy} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold mb-1">{language === 'sw' ? 'Pembejeo' : 'Input'}</p>
                          <p className="text-sm text-gray-600">{model.input}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-1">{language === 'sw' ? 'Matokeo' : 'Output'}</p>
                          <p className="text-sm text-gray-600">{model.output}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4" style={{ color: '#0F9D58' }} />
                        <span style={{ color: '#0F9D58' }}>
                          {language === 'sw' ? 'Inatumika' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Explainability */}
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  {t.explainability}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-3">
                  {language === 'sw'
                    ? 'Kila maamuzi ya AI ina ufafanuzi katika Kiswahili rahisi. Madaktari na wagonjwa wanaelewa jinsi AI inavyofanya maamuzi.'
                    : 'Every AI decision has explanation in plain Swahili. Doctors and patients understand how AI makes decisions.'}
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    {language === 'sw' ? 'Vipimo vya uhakika' : 'Confidence scores'}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    {language === 'sw' ? 'Ufafanuzi wa maamuzi' : 'Decision explanations'}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    {language === 'sw' ? 'Heatmaps kwa picha' : 'Heatmaps for imaging'}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {governanceMetrics.map((metric, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold mb-1" style={{ color: '#0F9D58' }}>
                      {metric.value}
                    </div>
                    <div className="text-sm text-gray-600">{metric.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Monitoring Loop */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {language === 'sw' ? 'Kitanzi cha Usimamizi' : 'Governance Loop'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  {[
                    language === 'sw' ? 'Peleka' : 'Deploy',
                    language === 'sw' ? 'Fuatilia' : 'Monitor',
                    language === 'sw' ? 'Kagua' : 'Audit',
                    language === 'sw' ? 'Mafunzo Upya' : 'Retrain',
                    language === 'sw' ? 'Idhini' : 'Approve',
                    language === 'sw' ? 'Peleka Upya' : 'Redeploy',
                  ].map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#0F9D5815', color: '#0F9D58' }}>
                        {step}
                      </div>
                      {idx < 5 && <span className="text-gray-400">→</span>}
                    </React.Fragment>
                  ))}
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4" style={{ color: '#0F9D58' }} />
                    {language === 'sw' ? 'Ukaguzi wa upendeleo kwa mkoa & jinsia' : 'Bias checks by region & gender'}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4" style={{ color: '#0F9D58' }} />
                    {language === 'sw' ? 'Viwango vya utendaji kwa TMDA' : 'Performance thresholds per TMDA'}
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4" style={{ color: '#0F9D58' }} />
                    {language === 'sw' ? 'Idhini ya MoH kabla ya maboresho' : 'MoH approval before model updates'}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Clinical Safety */}
            <Card className="border-2" style={{ borderColor: '#DC2626' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" style={{ color: '#DC2626' }} />
                  {t.safety}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">WHO IMCI Rules</p>
                      <p className="text-sm text-gray-600">
                        {language === 'sw'
                          ? 'Sheria za usalama zinahakikisha ishara za hatari zinaonekana mara moja'
                          : 'Safety rules ensure danger signs are flagged immediately'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">
                        {language === 'sw' ? 'Vizuizi vya Kiwango' : 'Threshold Gates'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'sw'
                          ? 'Uhakika chini ya 60% unapeleka kwa madaktari moja kwa moja'
                          : 'Confidence below 60% escalates to doctor immediately'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">
                        {language === 'sw' ? 'Kupandisha Lazima' : 'Mandatory Escalation'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === 'sw'
                          ? 'Mimba na homa, shida ya kupumua - kupandisha kiotomatiki'
                          : 'Pregnancy + fever, breathing difficulty - automatic escalation'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TMDA Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>TMDA SaMD Classification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Badge className="mb-2" style={{ backgroundColor: '#1C4ED8' }}>Class B</Badge>
                      <p className="text-sm font-semibold mb-1">Symptom Triage & NCD</p>
                      <p className="text-sm text-gray-600">Clinical decision support only</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <Badge className="mb-2" style={{ backgroundColor: '#8B5CF6' }}>Class C</Badge>
                      <p className="text-sm font-semibold mb-1">Maternal Risk Monitoring</p>
                      <p className="text-sm text-gray-600">Predictive risk alerts</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <Badge className="mb-2" style={{ backgroundColor: '#F59E0B' }}>Class C/D</Badge>
                      <p className="text-sm font-semibold mb-1">Medical Imaging AI</p>
                      <p className="text-sm text-gray-600">AI-assisted diagnostic imaging</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intended Use */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'sw' ? 'Kusudi la Matumizi' : 'Intended Use Statement'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed">
                  {language === 'sw'
                    ? 'AfyaAI TZA ni programu ya kusaidia maamuzi ya kliniki inayokusudiwa kusaidia wataalamu wa afya na wagonjwa kwa kutoa uchanganuzi wa AI, tathmini ya hatari, na uchanganuzi wa picha. Programu haibadilishi hukumu ya kliniki na inahitaji uthibitishaji wa wanadamu kabla ya maamuzi ya matibabu.'
                    : 'AfyaAI TZA is a clinical decision support software intended to assist healthcare workers and patients by providing AI-supported triage, risk assessment, and imaging analysis. The software does not replace clinical judgment and requires human validation before clinical decisions.'}
                </p>
              </CardContent>
            </Card>

            {/* Risk Management */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Management (ISO 14971)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      risk: language === 'sw' ? 'Utambuzi Mbaya' : 'Misdiagnosis',
                      mitigation: language === 'sw' ? 'Wanadamu-kwenye-kitanzi lazima' : 'Human-in-loop mandatory',
                    },
                    {
                      risk: language === 'sw' ? 'Upendeleo' : 'Bias',
                      mitigation: language === 'sw' ? 'Ukaguzi wa utendaji wa mikoa' : 'Regional performance audits',
                    },
                    {
                      risk: language === 'sw' ? 'Faragha ya Data' : 'Data Privacy',
                      mitigation: language === 'sw' ? 'Usimbaji fiche mwisho-hadi-mwisho' : 'End-to-end encryption',
                    },
                    {
                      risk: language === 'sw' ? 'Kutegemea Zaidi AI' : 'Over-reliance on AI',
                      mitigation: language === 'sw' ? 'Onyo wazi' : 'Explicit disclaimers',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <span className="font-semibold">{item.risk}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" style={{ color: '#0F9D58' }} />
                        <span className="text-sm text-gray-600">{item.mitigation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* PDPA Compliance */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" style={{ color: '#0F9D58' }} />
                  {language === 'sw' ? 'Kufuata PDPA' : 'PDPA Compliance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" style={{ color: '#0F9D58' }} />
                    <span>{language === 'sw' ? 'Ridhaa wazi iliyoelekezwa' : 'Explicit informed consent'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" style={{ color: '#0F9D58' }} />
                    <span>{language === 'sw' ? 'Kupunguza data' : 'Data minimization'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" style={{ color: '#0F9D58' }} />
                    <span>{language === 'sw' ? 'Ufikiaji kulingana na jukumu' : 'Role-based access'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" style={{ color: '#0F9D58' }} />
                    <span>{language === 'sw' ? 'Njia kamili za ukaguzi' : 'Full audit trails'}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}