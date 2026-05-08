import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/i18n';
import { mockAppointments, mockMedications } from '@/lib/mockData';
import SymptomCheckerModal from '@/components/SymptomCheckerModal';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language, userData } = useApp();
  const router = useRouter();
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const tr = (key: string) => t(language, 'home', key);

  const upcoming = mockAppointments.filter(a => a.status === 'scheduled');
  const pendingMeds = mockMedications.filter(m => m.active && !m.takenToday);

  const actions = [
    { icon: 'fitness', label: language === 'sw' ? 'Nina Dalili' : 'Check Symptoms', color: colors.accent, onPress: () => setShowSymptomChecker(true) },
    { icon: 'heart', label: language === 'sw' ? 'Huduma' : 'My Care', color: '#E53935', onPress: () => router.push('/(tabs)/care') },
    { icon: 'calendar', label: language === 'sw' ? 'Miadi' : 'Appointments', color: '#7B1FA2', onPress: () => router.push('/(tabs)/care') },
    { icon: 'location', label: language === 'sw' ? 'Vituo' : 'Facilities', color: '#F57C00', onPress: () => router.push('/(tabs)/facilities') },
  ];

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      paddingHorizontal: 20,
      paddingBottom: 28,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    greeting: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
    name: { fontSize: 22, fontWeight: '700', color: '#fff' },
    afyaIdBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
      paddingHorizontal: 12, paddingVertical: 6,
    },
    afyaIdText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    emergencyBtn: {
      backgroundColor: '#E53935', borderRadius: 14,
      paddingHorizontal: 18, paddingVertical: 12,
      flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    emergencyText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.foreground, marginBottom: 16 },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: {
      width: '47%', borderRadius: colors.radius, padding: 16,
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      alignItems: 'flex-start', gap: 10,
    },
    actionIcon: {
      width: 44, height: 44, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
    },
    actionLabel: { fontSize: 14, fontWeight: '600', color: colors.foreground },
    card: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12,
    },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: colors.foreground },
    cardSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
    statusBadge: {
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    },
    alertCard: {
      backgroundColor: colors.danger + '12', borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.danger + '30', padding: 16,
      flexDirection: 'row', alignItems: 'center', gap: 12,
    },
  });

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom + (Platform.OS === 'web' ? 34 : 0) }}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.greeting}>{language === 'sw' ? 'Habari' : 'Good day'}</Text>
              <Text style={s.name}>{userData?.name || 'User'}</Text>
            </View>
            <View style={s.afyaIdBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={s.afyaIdText}>{userData?.afyaId || 'TZ-00000'}</Text>
            </View>
          </View>

          <TouchableOpacity style={s.emergencyBtn} onPress={() => Linking.openURL('tel:112')}>
            <Ionicons name="alert-circle" size={18} color="#fff" />
            <Text style={s.emergencyText}>{tr('emergency')} — 112</Text>
          </TouchableOpacity>
        </View>

        {/* Pending meds alert */}
        {pendingMeds.length > 0 && (
          <View style={[s.section, { marginTop: 16 }]}>
            <TouchableOpacity style={s.alertCard} onPress={() => router.push('/(tabs)/care')}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.danger + '20', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="medical" size={18} color={colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: colors.danger, fontSize: 14 }}>
                  {pendingMeds.length} {language === 'sw' ? 'dawa zinangojea' : 'medication(s) pending'}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                  {language === 'sw' ? 'Gusa hapa kuchukua' : 'Tap to mark as taken'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{language === 'sw' ? 'Vitendo vya Haraka' : 'Quick Actions'}</Text>
          <View style={s.actionsGrid}>
            {actions.map((a, i) => (
              <TouchableOpacity key={i} style={s.actionCard} onPress={a.onPress}>
                <View style={[s.actionIcon, { backgroundColor: a.color + '15' }]}>
                  <Ionicons name={a.icon as any} size={22} color={a.color} />
                </View>
                <Text style={s.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={s.sectionTitle}>{language === 'sw' ? 'Miadi Inayokuja' : 'Upcoming Appointments'}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/care')}>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>{language === 'sw' ? 'Zote' : 'All'}</Text>
            </TouchableOpacity>
          </View>

          {upcoming.length === 0 ? (
            <View style={[s.card, { alignItems: 'center', padding: 24 }]}>
              <Ionicons name="calendar-outline" size={32} color={colors.muted} />
              <Text style={{ color: colors.muted, marginTop: 8 }}>{tr('noUpcoming')}</Text>
            </View>
          ) : upcoming.slice(0, 2).map(apt => (
            <View key={apt.id} style={s.card}>
              <View style={s.cardRow}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="calendar" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{apt.type}</Text>
                  <Text style={s.cardSub}>{apt.doctor}</Text>
                  <Text style={[s.cardSub, { marginTop: 4 }]}>{apt.date} · {apt.time}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                    {language === 'sw' ? 'Imepangwa' : 'Scheduled'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <SymptomCheckerModal visible={showSymptomChecker} onClose={() => setShowSymptomChecker(false)} />
    </View>
  );
}
