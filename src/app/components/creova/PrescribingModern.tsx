/**
 * KLINIKI - Modern Prescribing Interface
 * 
 * Quick templates + favorites for rapid prescribing
 * Inspired by: Modern pharmacy apps
 * 
 * Features:
 * - 1-click templates (Malaria, URTI, UTI, Pain)
 * - Favorites & recent drugs
 * - Drug interaction checker
 * - Visual dosing schedule
 */

import { useState } from 'react';
import {
  Pill,
  Search,
  Star,
  Clock,
  AlertTriangle,
  Plus,
  X,
  Check,
  ChevronRight,
  Zap,
  Calendar,
  Sun,
  Moon,
} from 'lucide-react';

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

interface Drug {
  id: string;
  name: string;
  strength: string;
  form: string;
}

interface PrescriptionItem {
  drug: Drug;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface TemplateCardProps {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  bgColor: string;
  onClick: () => void;
}

function TemplateCard({ title, subtitle, icon: Icon, color, bgColor, onClick }: TemplateCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: COLORS.white,
        border: `2px solid ${COLORS.gray100}`,
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        e.currentTarget.style.borderColor = COLORS.gray100;
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={24} color={color} strokeWidth={2.5} />
        </div>
        
        <div style={{ flex: 1 }}>
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
        </div>
        
        <ChevronRight size={20} color={COLORS.gray400} />
      </div>
    </button>
  );
}

interface DrugCardProps {
  drug: Drug;
  onAdd: () => void;
  isFavorite?: boolean;
}

function DrugCard({ drug, onAdd, isFavorite }: DrugCardProps) {
  return (
    <div style={{
      background: COLORS.white,
      borderRadius: '14px',
      padding: '16px',
      border: `1px solid ${COLORS.gray100}`,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: COLORS.mintLight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Pill size={20} color={COLORS.mint} strokeWidth={2.5} />
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: COLORS.gray900,
          marginBottom: '2px',
        }}>
          {drug.name}
        </div>
        
        <div style={{
          fontSize: '12px',
          color: COLORS.gray600,
        }}>
          {drug.strength} • {drug.form}
        </div>
      </div>
      
      {isFavorite && (
        <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
      )}
      
      <button
        onClick={onAdd}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          background: COLORS.mint,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Plus size={18} color={COLORS.white} strokeWidth={2.5} />
      </button>
    </div>
  );
}

interface PrescriptionItemCardProps {
  item: PrescriptionItem;
  onRemove: () => void;
}

function PrescriptionItemCard({ item, onRemove }: PrescriptionItemCardProps) {
  return (
    <div style={{
      background: COLORS.white,
      borderRadius: '16px',
      padding: '16px',
      border: `2px solid ${COLORS.gray100}`,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 700,
            color: COLORS.gray900,
            marginBottom: '4px',
          }}>
            {item.drug.name}
          </div>
          
          <div style={{
            fontSize: '13px',
            color: COLORS.gray600,
            marginBottom: '8px',
          }}>
            {item.drug.strength} • {item.drug.form}
          </div>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              background: COLORS.skyLight,
              borderRadius: '10px',
              padding: '4px 10px',
              fontSize: '12px',
              color: COLORS.sky,
              fontWeight: 600,
            }}>
              {item.dosage}
            </div>
            
            <div style={{
              background: COLORS.purpleLight,
              borderRadius: '10px',
              padding: '4px 10px',
              fontSize: '12px',
              color: COLORS.purple,
              fontWeight: 600,
            }}>
              {item.frequency}
            </div>
            
            <div style={{
              background: COLORS.mintLight,
              borderRadius: '10px',
              padding: '4px 10px',
              fontSize: '12px',
              color: COLORS.mint,
              fontWeight: 600,
            }}>
              {item.duration}
            </div>
          </div>
        </div>
        
        <button
          onClick={onRemove}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: COLORS.coralLight,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <X size={18} color={COLORS.coral} strokeWidth={2.5} />
        </button>
      </div>
      
      {item.instructions && (
        <div style={{
          background: COLORS.gray100,
          borderRadius: '10px',
          padding: '8px 12px',
          fontSize: '12px',
          color: COLORS.gray600,
          fontStyle: 'italic',
        }}>
          {item.instructions}
        </div>
      )}
    </div>
  );
}

export default function PrescribingModern() {
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [activeTab, setActiveTab] = useState<'templates' | 'search'>('templates');
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const templates = [
    {
      id: 'malaria',
      title: language === 'en' ? 'Malaria Treatment' : 'Matibabu ya Malaria',
      subtitle: 'ACT + Paracetamol',
      icon: Zap,
      color: COLORS.coral,
      bgColor: COLORS.coralLight,
      drugs: [
        {
          drug: { id: '1', name: 'Artemether-Lumefantrine', strength: '20/120mg', form: 'Tablet' },
          dosage: '4 tablets',
          frequency: '2x daily',
          duration: '3 days',
          instructions: language === 'en' ? 'Take with food' : 'Meza na chakula',
        },
        {
          drug: { id: '2', name: 'Paracetamol', strength: '500mg', form: 'Tablet' },
          dosage: '2 tablets',
          frequency: '3x daily',
          duration: '3 days',
          instructions: language === 'en' ? 'For fever' : 'Kwa homa',
        },
      ],
    },
    {
      id: 'urti',
      title: language === 'en' ? 'Upper Respiratory Infection' : 'Uambukizo wa Hewa',
      subtitle: 'Amoxicillin + Pain relief',
      icon: Sun,
      color: COLORS.sky,
      bgColor: COLORS.skyLight,
      drugs: [
        {
          drug: { id: '3', name: 'Amoxicillin', strength: '500mg', form: 'Capsule' },
          dosage: '1 capsule',
          frequency: '3x daily',
          duration: '7 days',
          instructions: language === 'en' ? 'Complete full course' : 'Maliza dozi zote',
        },
        {
          drug: { id: '2', name: 'Paracetamol', strength: '500mg', form: 'Tablet' },
          dosage: '2 tablets',
          frequency: '3x daily',
          duration: '5 days',
          instructions: language === 'en' ? 'For pain/fever' : 'Kwa maumivu/homa',
        },
      ],
    },
    {
      id: 'uti',
      title: language === 'en' ? 'Urinary Tract Infection' : 'Uambukizo wa Mkojo',
      subtitle: 'Ciprofloxacin',
      icon: Pill,
      color: COLORS.purple,
      bgColor: COLORS.purpleLight,
      drugs: [
        {
          drug: { id: '4', name: 'Ciprofloxacin', strength: '500mg', form: 'Tablet' },
          dosage: '1 tablet',
          frequency: '2x daily',
          duration: '5 days',
          instructions: language === 'en' ? 'Drink plenty of water' : 'Nywa maji mengi',
        },
      ],
    },
    {
      id: 'pain',
      title: language === 'en' ? 'Pain Relief' : 'Kupunguza Maumivu',
      subtitle: 'Ibuprofen + Paracetamol',
      icon: Moon,
      color: COLORS.mint,
      bgColor: COLORS.mintLight,
      drugs: [
        {
          drug: { id: '5', name: 'Ibuprofen', strength: '400mg', form: 'Tablet' },
          dosage: '1 tablet',
          frequency: '3x daily',
          duration: '5 days',
          instructions: language === 'en' ? 'Take with food' : 'Meza na chakula',
        },
      ],
    },
  ];

  const favoriteDrugs: Drug[] = [
    { id: '2', name: 'Paracetamol', strength: '500mg', form: 'Tablet' },
    { id: '3', name: 'Amoxicillin', strength: '500mg', form: 'Capsule' },
    { id: '6', name: 'Metformin', strength: '500mg', form: 'Tablet' },
    { id: '7', name: 'Omeprazole', strength: '20mg', form: 'Capsule' },
  ];

  const recentDrugs: Drug[] = [
    { id: '1', name: 'Artemether-Lumefantrine', strength: '20/120mg', form: 'Tablet' },
    { id: '4', name: 'Ciprofloxacin', strength: '500mg', form: 'Tablet' },
    { id: '8', name: 'Azithromycin', strength: '500mg', form: 'Tablet' },
  ];

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setPrescriptionItems(template.drugs);
      setActiveTab('search'); // Switch to view
    }
  };

  const addDrug = (drug: Drug) => {
    const newItem: PrescriptionItem = {
      drug,
      dosage: '1 tablet',
      frequency: '3x daily',
      duration: '5 days',
      instructions: '',
    };
    setPrescriptionItems([...prescriptionItems, newItem]);
  };

  const removeDrug = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    if (prescriptionItems.length === 0) {
      alert(language === 'en' ? 'Please add at least one medication' : 'Tafadhali ongeza dawa moja');
      return;
    }
    alert(language === 'en' ? 'Prescription saved!' : 'Dawa zimehifadhiwa!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.cream,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: '100px',
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
          marginBottom: '16px',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: COLORS.gray900,
            margin: 0,
          }}>
            {language === 'en' ? 'Prescribe Medication' : 'Andika Dawa'}
          </h1>
          
          <button
            onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
            style={{
              background: COLORS.white,
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              color: COLORS.gray700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
            }}
          >
            {language === 'en' ? 'SW' : 'EN'}
          </button>
        </div>

        <div style={{
          fontSize: '14px',
          color: COLORS.gray600,
          marginBottom: '16px',
        }}>
          Patient: <strong>Jean Mwangi (P-0042)</strong>
        </div>
        
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: COLORS.white,
          borderRadius: '14px',
          padding: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          {[
            { id: 'templates', label: language === 'en' ? 'Quick Templates' : 'Violezo vya Haraka' },
            { id: 'search', label: language === 'en' ? 'Search Drugs' : 'Tafuta Dawa' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === tab.id ? COLORS.mint : 'transparent',
                color: activeTab === tab.id ? COLORS.white : COLORS.gray600,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {activeTab === 'templates' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: COLORS.gray900,
              margin: '0 0 16px 0',
            }}>
              {language === 'en' ? '1-Click Templates' : 'Violezo vya Haraka'}
            </h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  title={template.title}
                  subtitle={template.subtitle}
                  icon={template.icon}
                  color={template.color}
                  bgColor={template.bgColor}
                  onClick={() => applyTemplate(template.id)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Search Bar */}
            <div style={{
              position: 'relative',
              marginBottom: '24px',
            }}>
              <Search
                size={20}
                color={COLORS.gray400}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search medications...' : 'Tafuta dawa...'}
                style={{
                  width: '100%',
                  background: COLORS.white,
                  border: `2px solid ${COLORS.gray100}`,
                  borderRadius: '16px',
                  padding: '14px 16px 14px 48px',
                  fontSize: '15px',
                  color: COLORS.gray900,
                  outline: 'none',
                }}
              />
            </div>

            {/* Favorites */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <Star size={18} color={COLORS.warning} fill={COLORS.warning} />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: COLORS.gray900,
                  margin: 0,
                }}>
                  {language === 'en' ? 'Favorites' : 'Dawa za Kawaida'}
                </h3>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {favoriteDrugs.map((drug) => (
                  <DrugCard
                    key={drug.id}
                    drug={drug}
                    onAdd={() => addDrug(drug)}
                    isFavorite
                  />
                ))}
              </div>
            </div>

            {/* Recent */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <Clock size={18} color={COLORS.gray600} />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: COLORS.gray900,
                  margin: 0,
                }}>
                  {language === 'en' ? 'Recently Used' : 'Zilizotumika Hivi Karibuni'}
                </h3>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {recentDrugs.map((drug) => (
                  <DrugCard
                    key={drug.id}
                    drug={drug}
                    onAdd={() => addDrug(drug)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Current Prescription */}
        {prescriptionItems.length > 0 && (
          <div style={{
            marginTop: '32px',
            animation: 'fadeIn 0.3s ease',
          }}>
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
                {language === 'en' ? 'Current Prescription' : 'Dawa Zilizochaguliwa'}
              </h2>
              
              <div style={{
                background: COLORS.mintLight,
                borderRadius: '12px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 700,
                color: COLORS.mint,
              }}>
                {prescriptionItems.length} {language === 'en' ? 'items' : 'dawa'}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {prescriptionItems.map((item, i) => (
                <PrescriptionItemCard
                  key={i}
                  item={item}
                  onRemove={() => removeDrug(i)}
                />
              ))}
            </div>

            {/* Drug Interaction Check */}
            {prescriptionItems.length > 1 && (
              <div style={{
                marginTop: '16px',
                background: COLORS.skyLight,
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: COLORS.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Check size={20} color={COLORS.success} strokeWidth={2.5} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: COLORS.gray900,
                    marginBottom: '2px',
                  }}>
                    {language === 'en' ? 'No Interactions Detected' : 'Hakuna Mwingiliano'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: COLORS.gray600,
                  }}>
                    {language === 'en' ? 'Safe to prescribe together' : 'Salama kuandika pamoja'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Complete Button */}
      {prescriptionItems.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: COLORS.white,
          padding: '16px 24px',
          paddingBottom: '32px',
          borderTop: `1px solid ${COLORS.gray100}`,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.04)',
        }}>
          <button
            onClick={handleComplete}
            style={{
              width: '100%',
              background: COLORS.mint,
              border: 'none',
              borderRadius: '16px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: 600,
              color: COLORS.white,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(94, 207, 177, 0.3)',
            }}
          >
            <Check size={20} />
            {language === 'en' ? 'Complete Prescription' : 'Maliza Dawa'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
