import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/i18n';
import { mockMedications, mockAppointments, mockVitals, Medication } from '@/lib/mockData';

type Tab = 'medications' | 'appointments' | 'vitals';

export default function CareScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const tr = (key: string) => t(language, 'care', key);
  const [activeTab, setActiveTab] = useState<Tab>('medications');
  const [meds, setMeds] = useState(mockMedications);

  const markTaken = (id: string) => {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, takenToday: true } : m));
  };

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'medications', label: tr('medications'), icon: 'medical' },
    { key: 'appointments', label: tr('appointments'), icon: 'calendar' },
    { key: 'vitals', label: tr('vitals'), icon: 'pulse' },
  ];

  const upcoming = mockAppointments.filter(a => a.status === 'scheduled');
  const past = mockAppointments.filter(a => a.status === 'completed');

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      paddingHorizontal: 20,
      paddingBottom: 0,
    },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 16 },
    tabRow: { flexDirection: 'row', gap: 4 },
    tabBtn: {
      flex: 1, paddingVertical: 10, alignItems: 'center',
      borderBottomWidth: 3, borderBottomColor: 'transparent',
    },
    tabLabel: { fontSize: 13, fontWeight: '600' },
    content: { flex: 1 },
    section: { paddingHorizontal: 20, paddingTop: 20 },
    card: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12,
    },
    medRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    medName: { fontSize: 16, fontWeight: '600', color: colors.foreground },
    medDetail: { fontSize: 13, color: colors.muted, marginTop: 2 },
    takenBtn: {
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
      alignItems: 'center', justifyContent: 'center',
    },
    vitalCard: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border, padding: 20,
      marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 16,
    },
    vitalIcon: {
      width: 48, height: 48, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
    },
    vitalLabel: { fontSize: 13, color: colors.muted },
    vitalValue: { fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 2 },
    vitalUnit: { fontSize: 13, color: colors.muted },
    aptCard: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12,
    },
    aptRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    aptDateBox: {
      backgroundColor: colors.primary + '15', borderRadius: 10,
      padding: 10, alignItems: 'center', minWidth: 52,
    },
    aptDateDay: { fontSize: 20, fontWeight: '700', color: colors.primary },
    aptDateMonth: { fontSize: 11, color: colors.primary, fontWeight: '600', textTransform: 'uppercase' },
    emptyBox: { alignItems: 'center', padding: 32 },
    emptyText: { color: colors.muted, marginTop: 12, fontSize: 15 },
  });

  const renderMeds = () => (
    <ScrollView style={s.content} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.section}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.muted, marginBottom: 16 }}>
          {tr('today')}
        </Text>

        {meds.filter(m => m.active).length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="medical-outline" size={40} color={colors.muted} />
            <Text style={s.emptyText}>{tr('noMeds')}</Text>
          </View>
        ) : meds.filter(m => m.active).map(med => (
          <View key={med.id} style={s.card}>
            <View style={s.medRow}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: med.takenToday ? colors.success + '20' : colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="medical" size={22} color={med.takenToday ? colors.success : colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.medName}>{med.name}</Text>
                <Text style={s.medDetail}>{med.dosage} · {med.frequency}</Text>
                {med.notes ? <Text style={[s.medDetail, { marginTop: 2, fontStyle: 'italic' }]}>{med.notes}</Text> : null}
                <Text style={[s.medDetail, { marginTop: 4 }]}>
                  <Ionicons name="alarm-outline" size={12} color={colors.muted} /> {med.reminderTime}
                </Text>
              </View>
              <TouchableOpacity
                style={[s.takenBtn, { backgroundColor: med.takenToday ? colors.success + '20' : colors.primary }]}
                onPress={() => !med.takenToday && markTaken(med.id)}
                disabled={med.takenToday}
              >
                {med.takenToday ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{tr('markTaken')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAppointments = () => (
    <ScrollView style={s.content} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.section}>
        {upcoming.length === 0 && past.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="calendar-outline" size={40} color={colors.muted} />
            <Text style={s.emptyText}>{tr('noAppts')}</Text>
          </View>
        ) : null}

        {upcoming.length > 0 && (
          <>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.muted, marginBottom: 12 }}>
              {language === 'sw' ? 'Inayokuja' : 'Upcoming'}
            </Text>
            {upcoming.map(apt => {
              const [year, month, day] = apt.date.split('-');
              const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              return (
                <View key={apt.id} style={s.aptCard}>
                  <View style={s.aptRow}>
                    <View style={s.aptDateBox}>
                      <Text style={s.aptDateDay}>{day}</Text>
                      <Text style={s.aptDateMonth}>{monthNames[parseInt(month) - 1]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>{apt.type}</Text>
                      <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>{apt.doctor}</Text>
                      <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>{apt.facility}</Text>
                      <Text style={{ fontSize: 13, color: colors.primary, marginTop: 4, fontWeight: '600' }}>{apt.time}</Text>
                    </View>
                    <View style={{ backgroundColor: colors.primary + '15', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                        {language === 'sw' ? 'Imepangwa' : 'Scheduled'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {past.length > 0 && (
          <>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.muted, marginTop: 16, marginBottom: 12 }}>
              {language === 'sw' ? 'Iliyopita' : 'Past'}
            </Text>
            {past.map(apt => (
              <View key={apt.id} style={[s.aptCard, { opacity: 0.65 }]}>
                <View style={s.aptRow}>
                  <View style={[s.aptDateBox, { backgroundColor: colors.surface }]}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>{apt.type}</Text>
                    <Text style={{ fontSize: 13, color: colors.muted }}>{apt.doctor} · {apt.date}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );

  const renderVitals = () => {
    const vitals = [
      { label: tr('bloodPressure'), value: mockVitals.bloodPressure, unit: 'mmHg', icon: 'heart', color: '#E53935' },
      { label: tr('heartRate'), value: String(mockVitals.heartRate), unit: 'bpm', icon: 'pulse', color: '#7B1FA2' },
      { label: tr('temperature'), value: String(mockVitals.temperature), unit: '°C', icon: 'thermometer', color: '#F57C00' },
      { label: tr('weight'), value: String(mockVitals.weight), unit: 'kg', icon: 'fitness', color: '#00897B' },
    ];
    return (
      <ScrollView style={s.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.section}>
          <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>
            {language === 'sw' ? 'Ilirekodiwa' : 'Recorded'}: {mockVitals.recordedAt.split('T')[0]}
          </Text>
          {vitals.map((v, i) => (
            <View key={i} style={s.vitalCard}>
              <View style={[s.vitalIcon, { backgroundColor: v.color + '15' }]}>
                <Ionicons name={v.icon as any} size={26} color={v.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.vitalLabel}>{v.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={s.vitalValue}>{v.value}</Text>
                  <Text style={s.vitalUnit}>{v.unit}</Text>
                </View>
              </View>
              <View style={{ backgroundColor: colors.success + '20', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: colors.success, fontSize: 12, fontWeight: '600' }}>
                  {language === 'sw' ? 'Kawaida' : 'Normal'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>{tr('title')}</Text>
        <View style={s.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[s.tabBtn, { borderBottomColor: activeTab === tab.key ? '#fff' : 'transparent' }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[s.tabLabel, { color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.6)' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === 'medications' && renderMeds()}
      {activeTab === 'appointments' && renderAppointments()}
      {activeTab === 'vitals' && renderVitals()}
    </View>
  );
}
