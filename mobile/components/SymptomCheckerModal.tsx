import { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, SafeAreaView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/i18n';
import { commonSymptoms } from '@/lib/mockData';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type Severity = 'mild' | 'moderate' | 'severe';

interface SelectedSymptom {
  id: string;
  name: string;
  nameSw: string;
  severity: Severity;
}

type Step = 'select' | 'severity' | 'result';

interface AssessmentResult {
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  action: string;
}

function assess(symptoms: SelectedSymptom[]): AssessmentResult {
  const hasSevere = symptoms.some(s => s.severity === 'severe');
  const criticalSymptoms = ['s7', 's8']; // chest pain, shortness of breath
  const hasCritical = symptoms.some(s => criticalSymptoms.includes(s.id) && s.severity !== 'mild');

  if (hasCritical || (hasSevere && symptoms.length >= 3)) {
    return { urgency: 'critical', recommendation: 'seekEmergency', action: 'Call 112' };
  }
  if (hasSevere || symptoms.length >= 4) {
    return { urgency: 'high', recommendation: 'seeDoctor', action: 'Visit a clinic today' };
  }
  if (symptoms.some(s => s.severity === 'moderate') || symptoms.length >= 2) {
    return { urgency: 'medium', recommendation: 'seeDoctor', action: 'See a doctor within 2-3 days' };
  }
  return { urgency: 'low', recommendation: 'selfCare', action: 'Rest and monitor symptoms' };
}

export default function SymptomCheckerModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const tr = (key: string) => t(language, 'symptomChecker', key);

  const [step, setStep] = useState<Step>('select');
  const [selected, setSelected] = useState<string[]>([]);
  const [currentSymptomId, setCurrentSymptomId] = useState<string | null>(null);
  const [assessedSymptoms, setAssessedSymptoms] = useState<SelectedSymptom[]>([]);

  const reset = () => {
    setStep('select');
    setSelected([]);
    setCurrentSymptomId(null);
    setAssessedSymptoms([]);
  };

  const handleClose = () => { reset(); onClose(); };

  const toggleSymptom = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const proceedToSeverity = () => {
    if (selected.length === 0) return;
    setCurrentSymptomId(selected[0]);
    setStep('severity');
  };

  const handleSeverity = (severity: Severity) => {
    const sym = commonSymptoms.find(s => s.id === currentSymptomId)!;
    const updated = [...assessedSymptoms.filter(s => s.id !== currentSymptomId), { ...sym, severity }];
    setAssessedSymptoms(updated);

    const remaining = selected.filter(id => !updated.some(a => a.id === id));
    if (remaining.length > 0) {
      setCurrentSymptomId(remaining[0]);
    } else {
      setStep('result');
    }
  };

  const result = step === 'result' ? assess(assessedSymptoms) : null;

  const urgencyColors: Record<string, string> = {
    low: colors.success,
    medium: colors.warning,
    high: colors.danger,
    critical: '#B71C1C',
  };

  const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      maxHeight: '92%',
      paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0),
    },
    handle: {
      width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border,
      alignSelf: 'center', marginTop: 12, marginBottom: 8,
    },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },
    content: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 16 },
    symptomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    symptomChip: {
      paddingHorizontal: 14, paddingVertical: 9, borderRadius: 24,
      borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: 6,
    },
    chipText: { fontSize: 14, fontWeight: '600' },
    severityCard: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border, padding: 20, marginBottom: 12,
      alignItems: 'center',
    },
    severityBtn: {
      width: '100%', padding: 16, borderRadius: 12, borderWidth: 1.5,
      alignItems: 'center', marginBottom: 10,
    },
    severityLabel: { fontSize: 17, fontWeight: '700' },
    checkBtn: {
      backgroundColor: colors.primary, borderRadius: colors.radius,
      padding: 16, alignItems: 'center', marginTop: 8,
    },
    checkBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    resultCard: {
      borderRadius: colors.radius, padding: 20, marginBottom: 16,
      alignItems: 'center',
    },
    urgencyLabel: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
    recommendationText: { fontSize: 16, color: colors.foreground, textAlign: 'center', lineHeight: 24 },
    actionBtn: {
      borderRadius: colors.radius, padding: 16, alignItems: 'center', width: '100%', marginTop: 12,
    },
    disclaimer: {
      backgroundColor: colors.warning + '15', borderRadius: 10, padding: 14,
      flexDirection: 'row', gap: 10, marginTop: 8,
    },
  });

  const currentSym = commonSymptoms.find(s => s.id === currentSymptomId);

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.header}>
            {step !== 'select' ? (
              <TouchableOpacity onPress={() => step === 'severity' ? setStep('select') : setStep('severity')}>
                <Ionicons name="chevron-back" size={24} color={colors.foreground} />
              </TouchableOpacity>
            ) : <View style={{ width: 24 }} />}
            <Text style={s.headerTitle}>{tr('title')}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={s.content} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            {step === 'select' && (
              <>
                <Text style={s.sectionTitle}>{tr('subtitle')}</Text>
                <Text style={{ color: colors.muted, marginBottom: 16, fontSize: 14 }}>
                  {language === 'sw' ? 'Chagua dalili unazopata' : 'Select all symptoms you are experiencing'}
                </Text>
                <View style={s.symptomGrid}>
                  {commonSymptoms.map(sym => {
                    const isSelected = selected.includes(sym.id);
                    return (
                      <TouchableOpacity
                        key={sym.id}
                        style={[s.symptomChip, {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primary + '15' : colors.card,
                        }]}
                        onPress={() => toggleSymptom(sym.id)}
                      >
                        {isSelected && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
                        <Text style={[s.chipText, { color: isSelected ? colors.primary : colors.foreground }]}>
                          {language === 'sw' ? sym.nameSw : sym.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selected.length > 0 && (
                  <TouchableOpacity style={s.checkBtn} onPress={proceedToSeverity}>
                    <Text style={s.checkBtnText}>{tr('checkNow')} ({selected.length})</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {step === 'severity' && currentSym && (
              <>
                <Text style={s.sectionTitle}>
                  {language === 'sw' ? `Ukali wa: ${currentSym.nameSw}` : `Severity of: ${currentSym.name}`}
                </Text>
                <Text style={{ color: colors.muted, marginBottom: 24, fontSize: 14 }}>
                  {language === 'sw' ? 'Je, dalili hii ni kali kiasi gani?' : 'How severe is this symptom?'}
                </Text>
                {([
                  { key: 'mild', color: colors.success, icon: 'checkmark-circle-outline' },
                  { key: 'moderate', color: colors.warning, icon: 'alert-circle-outline' },
                  { key: 'severe', color: colors.danger, icon: 'warning-outline' },
                ] as { key: Severity; color: string; icon: string }[]).map(sev => (
                  <TouchableOpacity
                    key={sev.key}
                    style={[s.severityBtn, { borderColor: sev.color, backgroundColor: sev.color + '10' }]}
                    onPress={() => handleSeverity(sev.key)}
                  >
                    <Ionicons name={sev.icon as any} size={24} color={sev.color} />
                    <Text style={[s.severityLabel, { color: sev.color, marginTop: 6 }]}>{tr(sev.key)}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {step === 'result' && result && (
              <>
                <View style={[s.resultCard, { backgroundColor: urgencyColors[result.urgency] + '15', borderWidth: 2, borderColor: urgencyColors[result.urgency] + '40' }]}>
                  <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: urgencyColors[result.urgency] + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Ionicons
                      name={result.urgency === 'critical' ? 'alert-circle' : result.urgency === 'high' ? 'warning' : result.urgency === 'medium' ? 'information-circle' : 'checkmark-circle'}
                      size={36}
                      color={urgencyColors[result.urgency]}
                    />
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 4 }}>{tr('urgency')}</Text>
                  <Text style={[s.urgencyLabel, { color: urgencyColors[result.urgency] }]}>
                    {tr(result.urgency)}
                  </Text>
                </View>

                <Text style={[s.sectionTitle, { marginBottom: 8 }]}>{tr('recommendations')}</Text>
                <Text style={s.recommendationText}>{tr(result.recommendation)}</Text>

                <View style={s.disclaimer}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
                  <Text style={{ flex: 1, color: colors.foreground, fontSize: 13, lineHeight: 20 }}>
                    {tr('disclaimer')}
                  </Text>
                </View>

                <TouchableOpacity style={[s.actionBtn, { backgroundColor: urgencyColors[result.urgency], marginTop: 16 }]} onPress={handleClose}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{tr('done')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginTop: 8 }]} onPress={reset}>
                  <Text style={{ color: colors.foreground, fontWeight: '600', fontSize: 15 }}>{tr('clear')}</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
