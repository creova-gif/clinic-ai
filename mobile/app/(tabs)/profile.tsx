import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp, Language } from '@/context/AppContext';
import { t } from '@/lib/i18n';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language, setLanguage, userData, logout } = useApp();
  const router = useRouter();
  const tr = (key: string) => t(language, 'profile', key);

  const handleLogout = () => {
    Alert.alert(
      language === 'sw' ? 'Toka' : 'Logout',
      language === 'sw' ? 'Una uhakika unataka kutoka?' : 'Are you sure you want to logout?',
      [
        { text: language === 'sw' ? 'Ghairi' : 'Cancel', style: 'cancel' },
        {
          text: language === 'sw' ? 'Toka' : 'Logout',
          style: 'destructive',
          onPress: () => { logout(); router.replace('/onboarding'); },
        },
      ]
    );
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
      paddingHorizontal: 20,
      paddingBottom: 32,
      alignItems: 'center',
    },
    avatar: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    userName: { fontSize: 22, fontWeight: '700', color: '#fff' },
    userRole: { color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 4 },
    afyaIdBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
      paddingHorizontal: 14, paddingVertical: 8, marginTop: 12,
    },
    afyaIdText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    content: { flex: 1, padding: 20 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    settingsCard: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    },
    settingRow: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    settingIcon: {
      width: 36, height: 36, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    settingLabel: { flex: 1, fontSize: 16, color: colors.foreground },
    settingValue: { fontSize: 14, color: colors.muted, marginRight: 8 },
    logoutBtn: {
      backgroundColor: colors.danger + '12', borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.danger + '30',
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 10, padding: 16, marginTop: 8,
    },
    langBtn: {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
      borderWidth: 1.5, marginRight: 8,
    },
  });

  const roleLabel = () => {
    const labels: Record<string, string> = {
      patient: language === 'sw' ? 'Mgonjwa' : 'Patient',
      clinician: language === 'sw' ? 'Daktari' : 'Clinician',
      chw: 'Community Health Worker',
      admin: 'Admin',
    };
    return labels[userData?.role || 'patient'] || 'Patient';
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={s.userName}>{userData?.name || 'User'}</Text>
        <Text style={s.userRole}>{roleLabel()}</Text>
        {userData?.afyaId && (
          <View style={s.afyaIdBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#fff" />
            <Text style={s.afyaIdText}>{userData.afyaId}</Text>
          </View>
        )}
      </View>

      <ScrollView style={s.content}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom + (Platform.OS === 'web' ? 34 : 0) }}>
        {/* Personal Info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{tr('personalInfo')}</Text>
          <View style={s.settingsCard}>
            {[
              { icon: 'person-outline', iconBg: colors.primary + '15', iconColor: colors.primary, label: language === 'sw' ? 'Jina' : 'Name', value: userData?.name },
              { icon: 'call-outline', iconBg: colors.accent + '15', iconColor: colors.accent, label: language === 'sw' ? 'Simu' : 'Phone', value: userData?.phone || '—' },
            ].map((item, i, arr) => (
              <View key={i} style={[s.settingRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[s.settingIcon, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
                </View>
                <Text style={s.settingLabel}>{item.label}</Text>
                <Text style={s.settingValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Language */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{tr('language')}</Text>
          <View style={[s.settingsCard, { padding: 16 }]}>
            <View style={{ flexDirection: 'row' }}>
              {(['sw', 'en'] as Language[]).map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[s.langBtn, { borderColor: language === lang ? colors.primary : colors.border, backgroundColor: language === lang ? colors.primary + '15' : 'transparent' }]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text style={{ color: language === lang ? colors.primary : colors.muted, fontWeight: '600' }}>
                    {lang === 'sw' ? 'Kiswahili' : 'English'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{tr('settings')}</Text>
          <View style={s.settingsCard}>
            {[
              { icon: 'notifications-outline', iconBg: '#7B1FA2' + '15', iconColor: '#7B1FA2', label: tr('notifications'), value: language === 'sw' ? 'Imewashwa' : 'Enabled' },
              { icon: 'lock-closed-outline', iconBg: '#F57C00' + '15', iconColor: '#F57C00', label: tr('privacy'), value: '' },
              { icon: 'shield-outline', iconBg: colors.success + '15', iconColor: colors.success, label: tr('security'), value: '' },
            ].map((item, i, arr) => (
              <TouchableOpacity key={i} style={[s.settingRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[s.settingIcon, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
                </View>
                <Text style={s.settingLabel}>{item.label}</Text>
                {item.value ? <Text style={s.settingValue}>{item.value}</Text> : null}
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{language === 'sw' ? 'Programu' : 'App'}</Text>
          <View style={[s.settingsCard, { padding: 16 }]}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>AfyaCare Tanzania v1.0.0</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
              {language === 'sw' ? '© 2026 CREOVA Health OS' : '© 2026 CREOVA Health OS'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 16 }}>{tr('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
