import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/i18n';
import { mockTestResults, TestResult } from '@/lib/mockData';

export default function RecordsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const tr = (key: string) => t(language, 'records', key);
  const [selected, setSelected] = useState<TestResult | null>(null);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 },
    content: { flex: 1, padding: 20 },
    card: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12,
    },
    cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    typeIcon: {
      width: 44, height: 44, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
    },
    testType: { fontSize: 16, fontWeight: '600', color: colors.foreground },
    testMeta: { fontSize: 13, color: colors.muted, marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    resultRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    resultLabel: { fontSize: 14, color: colors.foreground },
    resultValue: { fontSize: 14, fontWeight: '600' },
    detailPanel: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: colors.background,
    },
    detailHeader: {
      backgroundColor: colors.primary,
      paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
  });

  const statusColor = (s: string) => {
    if (s === 'normal') return colors.success;
    if (s === 'abnormal') return colors.danger;
    return colors.warning;
  };

  if (selected) {
    return (
      <View style={s.detailPanel}>
        <View style={s.detailHeader}>
          <TouchableOpacity onPress={() => setSelected(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16 }}>{tr('title')}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff' }}>{selected.type}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{selected.date} · {selected.facility}</Text>
        </View>
        <ScrollView style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.muted, marginBottom: 16 }}>
            {language === 'sw' ? 'Matokeo' : 'Results'} — {language === 'sw' ? 'Imekaguliwa na' : 'Reviewed by'} {selected.reviewedBy}
          </Text>
          {selected.results.map((r, i) => (
            <View key={i} style={[s.resultRow, i === selected.results.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={s.resultLabel}>{r.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[s.resultValue, { color: statusColor(r.status) }]}>{r.value} {r.unit}</Text>
                <View style={[s.badge, { backgroundColor: statusColor(r.status) + '20' }]}>
                  <Text style={{ color: statusColor(r.status), fontSize: 11, fontWeight: '600' }}>
                    {r.status === 'normal' ? (language === 'sw' ? 'Kawaida' : 'Normal') :
                     r.status === 'abnormal' ? (language === 'sw' ? 'Isiyo ya kawaida' : 'Abnormal') : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>{tr('title')}</Text>
        <Text style={s.headerSub}>{language === 'sw' ? 'Historia yako ya matibabu' : 'Your medical history'}</Text>
      </View>

      <ScrollView style={s.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.muted, marginBottom: 16 }}>
          {tr('labResults')}
        </Text>

        {mockTestResults.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Ionicons name="document-text-outline" size={48} color={colors.muted} />
            <Text style={{ color: colors.muted, marginTop: 12 }}>{tr('noRecords')}</Text>
          </View>
        ) : mockTestResults.map(result => (
          <TouchableOpacity key={result.id} style={s.card} onPress={() => setSelected(result)}>
            <View style={s.cardRow}>
              <View style={[s.typeIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="flask" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.testType}>{result.type}</Text>
                <Text style={s.testMeta}>{result.date} · {result.facility}</Text>
                <Text style={[s.testMeta, { marginTop: 2 }]}>
                  {language === 'sw' ? 'Daktari' : 'Reviewed by'}: {result.reviewedBy}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <View style={[s.badge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={{ color: colors.success, fontSize: 11, fontWeight: '600' }}>
                    {result.results.every(r => r.status === 'normal') ? (language === 'sw' ? 'Kawaida' : 'Normal') : (language === 'sw' ? 'Angalia' : 'Review')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
