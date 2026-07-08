import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Circle,
  ChevronRight,
  FileText,
  Heart,
  Shield,
  User,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Progress } from '@/app/components/ui/progress';
import { useAppStore } from '@/app/store/useAppStore';
import { SecureStorage } from '@/app/utils/SecureStorage';
import { motion, AnimatePresence } from 'motion/react';

interface DigitalPatientOnboardingProps {
  onComplete: (data: PatientOnboardingData) => void;
  onClose: () => void;
}

export interface PatientOnboardingData {
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email?: string;
    address: string;
  };
  medicalHistory: {
    allergies: string;
    medications: string;
    conditions: string;
    emergencyContact: string;
  };
  consent: {
    dataSharing: boolean;
    treatment: boolean;
    privacy: boolean;
  };
  nhifStatus?: string;
}

const translations = {
  sw: {
    title: 'Usajili wa Mgonjwa',
    subtitle: 'Kamilisha taarifa zako za kimatibabu',
    step: 'Hatua',
    of: 'ya',
    continue: 'Endelea',
    back: 'Rudi',
    save: 'Hifadhi',
    complete: 'Maliza',
    personalInfo: 'Taarifa Binafsi',
    medicalHistory: 'Historia ya Kimatibabu',
    consentPrivacy: 'Idhini & Faragha',
    confirmation: 'Uthibitisho',
    
    // Personal Info
    fullName: 'Jina Kamili',
    dateOfBirth: 'Tarehe ya Kuzaliwa',
    gender: 'Jinsia',
    male: 'Mume',
    female: 'Mke',
    other: 'Nyingine',
    phone: 'Nambari ya Simu',
    email: 'Barua Pepe (si lazima)',
    address: 'Anwani',
    
    // Medical History
    allergies: 'Mzio (ikiwa kuna)',
    medications: 'Dawa unazotumia',
    conditions: 'Magonjwa ya zamani',
    emergencyContact: 'Mawasiliano ya Dharura',
    
    // Consent
    dataConsent: 'Nakubali kushiriki data yangu kwa ajili ya utunzaji bora',
    treatmentConsent: 'Nimesoma na kuelewa sera za matibabu',
    privacyConsent: 'Naelewa jinsi data yangu inavyolindwa',
    privacyInfo: 'Data yako inalindwa chini ya PDPA Tanzania. Tunatumia usimbaji fiche na tutashiriki tu na watoa huduma wanaoidhinishwa.',
    
    // Confirmation
    readyForCare: 'Uko tayari kwa huduma za afya!',
    confirmationMessage: 'Usajili wako umekamilika. Unaweza sasa kupata huduma zote za AfyaAI.',
    whatNext: 'Nini kifuatacho?',
    bookAppointment: 'Tenga miadi',
    exploreServices: 'Chunguza huduma',
    talkToDoctor: 'Zungumza na daktari',
    
    // Progress
    progressComplete: 'Imekamilika',
    inProgress: 'Inaendelea',
    pending: 'Inasubiri',
    
    // Wait times
    waitTimeInfo: 'Muda wa kusubiri wa wastani: 30-45 dakika',
    noShowPolicy: 'Tafadhali wasiliana angalau masaa 24 kabla ukighairi miadi',
    
    // Save reminder
    autoSaved: 'Imehifadhiwa kiotomatiki',
    saveAndExit: 'Hifadhi na utoke',
    
    // Validation
    required: 'Inahitajika',
  },
  en: {
    title: 'Patient Registration',
    subtitle: 'Complete your medical information',
    step: 'Step',
    of: 'of',
    continue: 'Continue',
    back: 'Back',
    save: 'Save',
    complete: 'Complete',
    personalInfo: 'Personal Information',
    medicalHistory: 'Medical History',
    consentPrivacy: 'Consent & Privacy',
    confirmation: 'Confirmation',
    
    // Personal Info
    fullName: 'Full Name',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    phone: 'Phone Number',
    email: 'Email (optional)',
    address: 'Address',
    
    // Medical History
    allergies: 'Allergies (if any)',
    medications: 'Current Medications',
    conditions: 'Pre-existing Conditions',
    emergencyContact: 'Emergency Contact',
    
    // Consent
    dataConsent: 'I consent to share my data for better healthcare',
    treatmentConsent: 'I have read and understand the treatment policies',
    privacyConsent: 'I understand how my data is protected',
    privacyInfo: 'Your data is protected under Tanzania PDPA. We use encryption and only share with authorized providers.',
    
    // Confirmation
    readyForCare: "You're ready for care!",
    confirmationMessage: 'Your registration is complete. You can now access all AfyaAI services.',
    whatNext: 'What next?',
    bookAppointment: 'Book appointment',
    exploreServices: 'Explore services',
    talkToDoctor: 'Talk to doctor',
    
    // Progress
    progressComplete: 'Complete',
    inProgress: 'In Progress',
    pending: 'Pending',
    
    // Wait times
    waitTimeInfo: 'Average wait time: 30-45 minutes',
    noShowPolicy: 'Please contact us at least 24 hours before canceling',
    
    // Save reminder
    autoSaved: 'Auto-saved',
    saveAndExit: 'Save and exit',
    
    // Validation
    required: 'Required',
  },
};

export function DigitalPatientOnboarding({ onComplete, onClose }: DigitalPatientOnboardingProps) {
  const { language } = useAppStore();
  const t = translations[language];
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState<PatientOnboardingData>({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
    },
    medicalHistory: {
      allergies: '',
      medications: '',
      conditions: '',
      emergencyContact: '',
    },
    consent: {
      dataSharing: false,
      treatment: false,
      privacy: false,
    },
    nhifStatus: '',
  });

  // Auto-save securely
  useEffect(() => {
    const timer = setTimeout(() => {
      SecureStorage.setItem('patient_onboarding_draft', formData);
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Load saved draft securely
  useEffect(() => {
    const saved = SecureStorage.getItem<PatientOnboardingData>('patient_onboarding_draft');
    if (saved) {
      try {
        setFormData(saved);
      } catch (e) {
      }
    }
  }, []);

  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleContinue = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Clear secure draft and complete
      SecureStorage.removeItem('patient_onboarding_draft');
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepIcon = (step: number) => {
    if (step < currentStep) return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (step === currentStep) return <Circle className="h-6 w-6 text-blue-600 fill-blue-100" />;
    return <Circle className="h-6 w-6 text-gray-300" />;
  };

  const stepStatus = (step: number) => {
    if (step < currentStep) return t.complete;
    if (step === currentStep) return t.inProgress;
    return t.pending;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-[#1E88E5] to-[#43A047] text-white p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              {t.saveAndExit}
            </Button>
          </div>
          <p className="text-white/90 mb-4">{t.subtitle}</p>
          
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-2">
              <span>
                {t.step} {currentStep} {t.of} {totalSteps}
              </span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="bg-white/30" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                {stepIcon(step)}
                <span className="text-xs mt-1">{stepStatus(step)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto p-6 pb-32">
        <AnimatePresence mode="wait">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-6 w-6 mr-2 text-[#1E88E5]" />
                    {t.personalInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">{t.fullName}</Label>
                    <Input
                      id="fullName"
                      value={formData.personalInfo.fullName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, fullName: e.target.value },
                        })
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dob">{t.dateOfBirth}</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.personalInfo.dateOfBirth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, dateOfBirth: e.target.value },
                        })
                      }
                    />
                  </div>
                  
                  <div>
                    <Label>{t.gender}</Label>
                    <div className="flex gap-2 mt-2">
                      {['male', 'female', 'other'].map((gender) => (
                        <Button
                          key={gender}
                          variant={formData.personalInfo.gender === gender ? 'default' : 'outline'}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              personalInfo: { ...formData.personalInfo, gender },
                            })
                          }
                        >
                          {t[gender as keyof typeof t] as string}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">{t.phone}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.personalInfo.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, phone: e.target.value },
                        })
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">{t.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, email: e.target.value },
                        })
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">{t.address}</Label>
                    <Textarea
                      id="address"
                      value={formData.personalInfo.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, address: e.target.value },
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Medical History */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-6 w-6 mr-2 text-[#43A047]" />
                    {t.medicalHistory}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="allergies">{t.allergies}</Label>
                    <Textarea
                      id="allergies"
                      placeholder="e.g., Penicillin, Peanuts"
                      value={formData.medicalHistory.allergies}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicalHistory: { ...formData.medicalHistory, allergies: e.target.value },
                        })
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="medications">{t.medications}</Label>
                    <Textarea
                      id="medications"
                      value={formData.medicalHistory.medications}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicalHistory: { ...formData.medicalHistory, medications: e.target.value },
                        })
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="conditions">{t.conditions}</Label>
                    <Textarea
                      id="conditions"
                      value={formData.medicalHistory.conditions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicalHistory: { ...formData.medicalHistory, conditions: e.target.value },
                        })
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="emergency">{t.emergencyContact}</Label>
                    <Input
                      id="emergency"
                      type="tel"
                      value={formData.medicalHistory.emergencyContact}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicalHistory: {
                            ...formData.medicalHistory,
                            emergencyContact: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Consent & Privacy */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-6 w-6 mr-2 text-[#1E88E5]" />
                    {t.consentPrivacy}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <AlertCircle className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-sm text-blue-900">{t.privacyInfo}</p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent.dataSharing}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            consent: { ...formData.consent, dataSharing: e.target.checked },
                          })
                        }
                        className="mt-1"
                      />
                      <span className="text-sm">{t.dataConsent}</span>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent.treatment}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            consent: { ...formData.consent, treatment: e.target.checked },
                          })
                        }
                        className="mt-1"
                      />
                      <span className="text-sm">{t.treatmentConsent}</span>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent.privacy}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            consent: { ...formData.consent, privacy: e.target.checked },
                          })
                        }
                        className="mt-1"
                      />
                      <span className="text-sm">{t.privacyConsent}</span>
                    </label>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm font-semibold text-amber-900 mb-2">
                      {t.waitTimeInfo}
                    </p>
                    <p className="text-sm text-amber-800">{t.noShowPolicy}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
                  </motion.div>
                  
                  <h2 className="text-3xl font-bold text-green-900 mb-2">{t.readyForCare}</h2>
                  <p className="text-green-800 mb-6">{t.confirmationMessage}</p>
                  
                  <div className="bg-white p-4 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold mb-3">{t.whatNext}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <ChevronRight className="h-5 w-5 text-green-600 mr-2" />
                        <span>{t.bookAppointment}</span>
                      </div>
                      <div className="flex items-center">
                        <ChevronRight className="h-5 w-5 text-green-600 mr-2" />
                        <span>{t.exploreServices}</span>
                      </div>
                      <div className="flex items-center">
                        <ChevronRight className="h-5 w-5 text-green-600 mr-2" />
                        <span>{t.talkToDoctor}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-save indicator */}
        {currentStep < 4 && (
          <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
            <CheckCircle className="h-4 w-4 mr-1" />
            {t.autoSaved}
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-between">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              {t.back}
            </Button>
          ) : (
            <div />
          )}
          
          <Button
            onClick={handleContinue}
            className="bg-[#1E88E5] hover:bg-[#1976D2]"
          >
            {currentStep === totalSteps ? t.complete : t.continue}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
