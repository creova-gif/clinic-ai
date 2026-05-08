import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/i18n';
import { mockFacilities } from '@/lib/mockData';

export default function FacilitiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const tr = (key: string) => t(language, 'facilities', key);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'hospital' | 'clinic' | 'dispensary'>('all');

  const filtered = mockFacilities.filter(f => {
    const name = language === 'sw' ? f.nameSw : f.name;
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || f.type === filter;
    return matchSearch && matchFilter;
  });

  const typeColors: Record<string, string> = {
    hospital: colors.primary,
    clinic: colors.accent,
    dispensary: '#F57C00',
  };
  const typeIcons: Record<string, string> = {
    hospital: 'business',
    clinic: 'medkit',
    dispensary: 'bandage',
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 12 },
    searchBox: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12,
      paddingHorizontal: 14, paddingVertical: 10,
    },
    searchInput: { flex: 1, color: '#fff', fontSize: 15 },
    filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
    filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
    filterText: { fontSize: 13, fontWeight: '600' },
    content: { flex: 1, padding: 20 },
    card: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12,
    },
    cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    facilityIcon: {
      width: 48, height: 48, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
    },
    facilityName: { fontSize: 16, fontWeight: '700', color: colors.foreground },
    facilityMeta: { fontSize: 13, color: colors.muted, marginTop: 2 },
    actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
    actionBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, paddingVertical: 9, borderRadius: 10, backgroundColor: colors.surface,
    },
    actionText: { fontSize: 13, fontWeight: '600', color: colors.primary },
    openBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    serviceTag: {
      backgroundColor: colors.surface, borderRadius: 20,
      paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginTop: 6,
    },
  });

  const FILTERS = [
    { key: 'all', label: language === 'sw' ? 'Zote' : 'All' },
    { key: 'hospital', label: tr('hospital') },
    { key: 'clinic', label: tr('clinic') },
    { key: 'dispensary', label: tr('dispensary') },
  ] as const;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>{tr('title')}</Text>
        <View style={s.searchBox}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.75)" />
          <TextInput
            style={s.searchInput}
            placeholder={tr('search')}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterBtn, { borderColor: filter === f.key ? colors.primary : colors.border, backgroundColor: filter === f.key ? colors.primary + '15' : 'transparent' }]}
            onPress={() => setFilter(f.key as any)}
          >
            <Text style={[s.filterText, { color: filter === f.key ? colors.primary : colors.muted }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 16 }}>
          {filtered.length} {language === 'sw' ? 'vituo vimepatikana' : 'facilities found'}
        </Text>

        {filtered.map(fac => {
          const name = language === 'sw' ? fac.nameSw : fac.name;
          const ic = typeColors[fac.type] || colors.primary;
          return (
            <View key={fac.id} style={s.card}>
              <View style={s.cardRow}>
                <View style={[s.facilityIcon, { backgroundColor: ic + '15' }]}>
                  <Ionicons name={typeIcons[fac.type] as any} size={24} color={ic} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={[s.facilityName, { flex: 1, marginRight: 8 }]}>{name}</Text>
                    <View style={[s.openBadge, { backgroundColor: fac.open ? colors.success + '20' : colors.muted + '20' }]}>
                      <Text style={{ color: fac.open ? colors.success : colors.muted, fontSize: 11, fontWeight: '600' }}>
                        {fac.open ? tr('open') : (language === 'sw' ? 'Imefungwa' : 'Closed')}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.facilityMeta}>{fac.address}</Text>
                  <Text style={[s.facilityMeta, { color: colors.primary, fontWeight: '600', marginTop: 4 }]}>
                    {fac.distance} {tr('distance')}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                {fac.services.slice(0, 3).map((srv, i) => (
                  <View key={i} style={s.serviceTag}>
                    <Text style={{ fontSize: 11, color: colors.muted, fontWeight: '500' }}>{srv}</Text>
                  </View>
                ))}
                {fac.services.length > 3 && (
                  <View style={s.serviceTag}>
                    <Text style={{ fontSize: 11, color: colors.muted }}>+{fac.services.length - 3}</Text>
                  </View>
                )}
              </View>

              <View style={s.actionsRow}>
                <TouchableOpacity style={s.actionBtn} onPress={() => Linking.openURL(`tel:${fac.phone}`)}>
                  <Ionicons name="call-outline" size={16} color={colors.primary} />
                  <Text style={s.actionText}>{tr('call')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn} onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(fac.address)}`)}>
                  <Ionicons name="navigate-outline" size={16} color={colors.primary} />
                  <Text style={s.actionText}>{tr('directions')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={s.actionText}>{tr('book')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
