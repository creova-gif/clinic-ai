/**
 * CREOVA Health OS - E-Prescribing Interface
 * 
 * Embedded prescribing UI for clinicians
 * 
 * Features:
 * - Drug search with autocomplete
 * - Generic/brand options
 * - Dose/frequency/duration presets
 * - Allergy & interaction warnings
 * - Treatment bundles (malaria, pneumonia, etc.)
 * - One-page layout (no context loss)
 * - Swahili/English
 */

import { useState } from 'react';
import { Search, AlertTriangle, X, Plus, Package } from 'lucide-react';

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
  neutral300: '#D1D5DB',
  neutral400: '#9CA3AF',
  neutral600: '#4B5563',
  neutral700: '#374151',
  neutral900: '#111827',
  white: '#FFFFFF',
};

interface Drug {
  id: string;
  genericName: string;
  brandNames: string[];
  forms: string[];
  strength: string[];
}

interface Prescription {
  id: string;
  drug: Drug;
  form: string;
  strength: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
  warnings: string[];
}

const MOCK_DRUGS: Drug[] = [
  {
    id: '1',
    genericName: 'Amoxicillin',
    brandNames: ['Amoxil', 'Trimox'],
    forms: ['Capsule', 'Tablet', 'Suspension'],
    strength: ['250mg', '500mg', '125mg/5ml'],
  },
  {
    id: '2',
    genericName: 'Paracetamol',
    brandNames: ['Panadol', 'Tylenol'],
    forms: ['Tablet', 'Suspension', 'Suppository'],
    strength: ['500mg', '1000mg', '120mg/5ml'],
  },
  {
    id: '3',
    genericName: 'Metformin',
    brandNames: ['Glucophage'],
    forms: ['Tablet'],
    strength: ['500mg', '850mg', '1000mg'],
  },
];

const FREQUENCIES = {
  en: ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 6 hours', 'Every 8 hours', 'As needed'],
  sw: ['Mara moja kwa siku', 'Mara mbili kwa siku', 'Mara tatu kwa siku', 'Mara nne kwa siku', 'Kila saa 6', 'Kila saa 8', 'Pale unapohitaji'],
};

const DURATIONS = {
  en: ['3 days', '5 days', '7 days', '10 days', '14 days', '30 days', 'Ongoing'],
  sw: ['Siku 3', 'Siku 5', 'Siku 7', 'Siku 10', 'Siku 14', 'Siku 30', 'Inaendelea'],
};

const TREATMENT_BUNDLES = {
  malaria: {
    name: 'Malaria (Uncomplicated)',
    nameSw: 'Malaria (Rahisi)',
    drugs: [
      { drug: 'Artemether/Lumefantrine', dose: '4 tablets', frequency: 'Twice daily', duration: '3 days' },
    ],
  },
  pneumonia: {
    name: 'Pneumonia (Community-acquired)',
    nameSw: 'Pneumonia',
    drugs: [
      { drug: 'Amoxicillin', dose: '500mg', frequency: 'Three times daily', duration: '7 days' },
    ],
  },
  uti: {
    name: 'UTI (Uncomplicated)',
    nameSw: 'Maambukizi ya mkojo',
    drugs: [
      { drug: 'Nitrofurantoin', dose: '100mg', frequency: 'Twice daily', duration: '5 days' },
    ],
  },
};

export default function PrescribingInterface() {
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showBundles, setShowBundles] = useState(false);

  // Patient allergies (mock data)
  const patientAllergies = ['Penicillin', 'Sulfa drugs'];

  const handleAddPrescription = (prescription: Prescription) => {
    setPrescriptions([...prescriptions, prescription]);
    setSelectedDrug(null);
    setSearchQuery('');
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const checkAllergyWarning = (drugName: string): boolean => {
    return patientAllergies.some(allergy => 
      drugName.toLowerCase().includes(allergy.toLowerCase()) ||
      allergy.toLowerCase().includes('penicillin') && drugName.toLowerCase().includes('amoxicillin')
    );
  };

  const filteredDrugs = MOCK_DRUGS.filter(drug =>
    drug.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drug.brandNames.some(brand => brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: COLORS.neutral50,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        height: 64,
        background: COLORS.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <div>
          <h1 style={{ margin: 0, color: COLORS.white, fontSize: 20, fontWeight: 600 }}>
            {language === 'en' ? 'E-Prescribing' : 'Kuandika Dawa'}
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            {language === 'en' ? 'Patient: Amina Juma (P-0012)' : 'Mgonjwa: Amina Juma (P-0012)'}
          </p>
        </div>

        <button
          onClick={() => setLanguage(lang => lang === 'en' ? 'sw' : 'en')}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 8,
            color: COLORS.white,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {language === 'en' ? '🇬🇧 English' : '🇹🇿 Kiswahili'}
        </button>
      </div>

      {/* Allergy Warning Banner */}
      {patientAllergies.length > 0 && (
        <div style={{
          padding: '12px 24px',
          background: COLORS.redLight,
          border: `2px solid ${COLORS.red}`,
          borderBottom: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={20} color={COLORS.red} />
            <div>
              <strong style={{ color: COLORS.red, fontSize: 13 }}>
                {language === 'en' ? 'ALLERGIES:' : 'MZIO:'}
              </strong>
              <span style={{ marginLeft: 8, color: COLORS.neutral900, fontSize: 13 }}>
                {patientAllergies.join(', ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Current Prescriptions */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600, color: COLORS.neutral900 }}>
              {language === 'en' ? 'Current Prescriptions' : 'Dawa za Sasa'}
            </h2>

            {prescriptions.length === 0 ? (
              <div style={{
                padding: 40,
                background: COLORS.white,
                borderRadius: 12,
                border: `2px dashed ${COLORS.neutral200}`,
                textAlign: 'center',
              }}>
                <Package size={48} color={COLORS.neutral400} style={{ margin: '0 auto 16px' }} />
                <p style={{ margin: 0, color: COLORS.neutral600, fontSize: 14 }}>
                  {language === 'en' ? 'No medications prescribed yet' : 'Hakuna dawa bado'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {prescriptions.map(prescription => (
                  <div
                    key={prescription.id}
                    style={{
                      padding: 16,
                      background: COLORS.white,
                      borderRadius: 8,
                      border: `1px solid ${COLORS.neutral200}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: COLORS.neutral900 }}>
                          {prescription.drug.genericName}
                        </h3>
                        <p style={{ margin: 0, fontSize: 12, color: COLORS.neutral600 }}>
                          {prescription.form} • {prescription.strength}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemovePrescription(prescription.id)}
                        style={{
                          padding: 8,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: COLORS.neutral400,
                        }}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: 11, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                          {language === 'en' ? 'Dose' : 'Kipimo'}
                        </p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: COLORS.neutral900 }}>
                          {prescription.dose}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: 11, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                          {language === 'en' ? 'Frequency' : 'Mara'}
                        </p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: COLORS.neutral900 }}>
                          {prescription.frequency}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: 11, color: COLORS.neutral600, textTransform: 'uppercase' }}>
                          {language === 'en' ? 'Duration' : 'Muda'}
                        </p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: COLORS.neutral900 }}>
                          {prescription.duration}
                        </p>
                      </div>
                    </div>

                    {prescription.warnings.length > 0 && (
                      <div style={{
                        padding: 10,
                        background: COLORS.redLight,
                        border: `1px solid ${COLORS.red}`,
                        borderRadius: 6,
                      }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <AlertTriangle size={16} color={COLORS.red} />
                          <div>
                            {prescription.warnings.map((warning, i) => (
                              <p key={i} style={{ margin: 0, fontSize: 12, color: COLORS.red }}>
                                {warning}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              style={{
                flex: 1,
                padding: '14px 20px',
                background: COLORS.white,
                color: COLORS.neutral900,
                border: `2px solid ${COLORS.neutral200}`,
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {language === 'en' ? 'Save as Draft' : 'Hifadhi'}
            </button>
            <button
              style={{
                flex: 1,
                padding: '14px 20px',
                background: COLORS.teal,
                color: COLORS.white,
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {language === 'en' ? 'Send to Pharmacy' : 'Tuma kwa Pharmacy'}
            </button>
          </div>
        </div>

        {/* Right: Add Medication */}
        <div style={{
          width: 420,
          background: COLORS.white,
          borderLeft: `1px solid ${COLORS.neutral200}`,
          padding: 24,
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600, color: COLORS.neutral900 }}>
            {language === 'en' ? 'Add Medication' : 'Ongeza Dawa'}
          </h2>

          {/* Treatment Bundles */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setShowBundles(!showBundles)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: COLORS.blueLight,
                color: COLORS.blue,
                border: `1px solid ${COLORS.blue}`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Package size={16} />
              {language === 'en' ? 'Treatment Bundles' : 'Dawa za Kawaida'}
            </button>

            {showBundles && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(TREATMENT_BUNDLES).map(([key, bundle]) => (
                  <button
                    key={key}
                    style={{
                      padding: 12,
                      background: COLORS.neutral50,
                      border: `1px solid ${COLORS.neutral200}`,
                      borderRadius: 6,
                      fontSize: 12,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <strong>{language === 'en' ? bundle.name : bundle.nameSw}</strong>
                    <div style={{ marginTop: 4, fontSize: 11, color: COLORS.neutral600 }}>
                      {bundle.drugs.map(d => d.drug).join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Drug Search */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: COLORS.neutral900 }}>
              {language === 'en' ? 'Search medication' : 'Tafuta dawa'}
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={20} color={COLORS.neutral400} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Type drug name...' : 'Andika jina la dawa...'}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  fontSize: 14,
                  border: `1px solid ${COLORS.neutral200}`,
                  borderRadius: 8,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div style={{
                marginTop: 8,
                background: COLORS.white,
                border: `1px solid ${COLORS.neutral200}`,
                borderRadius: 8,
                maxHeight: 300,
                overflowY: 'auto',
              }}>
                {filteredDrugs.map(drug => {
                  const hasAllergy = checkAllergyWarning(drug.genericName);
                  return (
                    <button
                      key={drug.id}
                      onClick={() => setSelectedDrug(drug)}
                      style={{
                        width: '100%',
                        padding: 12,
                        background: hasAllergy ? COLORS.redLight : 'none',
                        border: 'none',
                        borderBottom: `1px solid ${COLORS.neutral200}`,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {hasAllergy && <AlertTriangle size={16} color={COLORS.red} />}
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: hasAllergy ? COLORS.red : COLORS.neutral900 }}>
                            {drug.genericName}
                          </div>
                          <div style={{ fontSize: 11, color: COLORS.neutral600 }}>
                            {drug.brandNames.join(', ')}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Drug Configuration */}
          {selectedDrug && (
            <div style={{
              padding: 16,
              background: COLORS.neutral50,
              borderRadius: 8,
              border: `1px solid ${COLORS.neutral200}`,
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: COLORS.neutral900 }}>
                {selectedDrug.genericName}
              </h3>

              {/* Form */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500, color: COLORS.neutral700 }}>
                  {language === 'en' ? 'Form' : 'Aina'}
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedDrug.forms.map(form => (
                    <button
                      key={form}
                      style={{
                        padding: '6px 12px',
                        background: COLORS.white,
                        border: `1px solid ${COLORS.neutral300}`,
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {form}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strength */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500, color: COLORS.neutral700 }}>
                  {language === 'en' ? 'Strength' : 'Nguvu'}
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedDrug.strength.map(str => (
                    <button
                      key={str}
                      style={{
                        padding: '6px 12px',
                        background: COLORS.white,
                        border: `1px solid ${COLORS.neutral300}`,
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {str}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500, color: COLORS.neutral700 }}>
                  {language === 'en' ? 'Frequency' : 'Mara'}
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 13,
                    border: `1px solid ${COLORS.neutral300}`,
                    borderRadius: 6,
                  }}
                >
                  {FREQUENCIES[language].map((freq, i) => (
                    <option key={i} value={freq}>{freq}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500, color: COLORS.neutral700 }}>
                  {language === 'en' ? 'Duration' : 'Muda'}
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 13,
                    border: `1px solid ${COLORS.neutral300}`,
                    borderRadius: 6,
                  }}
                >
                  {DURATIONS[language].map((dur, i) => (
                    <option key={i} value={dur}>{dur}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  handleAddPrescription({
                    id: Date.now().toString(),
                    drug: selectedDrug,
                    form: selectedDrug.forms[0],
                    strength: selectedDrug.strength[0],
                    dose: '1 tablet',
                    frequency: FREQUENCIES.en[0],
                    duration: DURATIONS.en[2],
                    instructions: '',
                    warnings: checkAllergyWarning(selectedDrug.genericName) ? ['ALLERGY WARNING: Patient allergic to this medication'] : [],
                  });
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: COLORS.teal,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Plus size={16} />
                {language === 'en' ? 'Add to Prescription' : 'Ongeza kwenye Dawa'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
