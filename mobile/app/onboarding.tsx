import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Dimensions, Platform, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp, Language, UserRole } from '@/context/AppContext';
import { t } from '@/lib/i18n';

const { width } = Dimensions.get('window');
const STEPS = 4;

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setUserData } = useApp();

  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<Language>('sw');
  const [role, setRole] = useState<UserRole>('patient');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const scrollX = useRef(new Animated.Value(0)).current;

  const tr = (ns: string, key: string) => t(language, ns, key);

  const next = () => {
    if (step < STEPS - 1) setStep(s => s + 1);
    else finish();
  };

  const back = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const finish = () => {
    setUserData({
      name: name || 'User',
      phone,
      afyaId: 'TZ-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      language,
      role,
    });
    router.replace('/(tabs)');
  };

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0),
      paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0),
    },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingVertical: 16,
    },
    progressRow: {
      flexDirection: 'row', gap: 6, paddingHorizontal: 20, marginBottom: 8,
    },
    progressDot: {
      flex: 1, height: 4, borderRadius: 2,
    },
    content: { flex: 1, paddingHorizontal: 24 },
    stepTitle: {
      fontSize: 28, fontWeight: '700', color: colors.foreground,
      marginTop: 32, marginBottom: 8,
    },
    stepSubtitle: {
      fontSize: 16, color: colors.muted, marginBottom: 32, lineHeight: 24,
    },
    optionCard: {
      borderRadius: colors.radius, padding: 20, marginBottom: 12,
      borderWidth: 2, flexDirection: 'row', alignItems: 'center', gap: 16,
    },
    optionIconBox: {
      width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    },
    optionTitle: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
    optionDesc: { fontSize: 13, lineHeight: 18 },
    input: {
      borderWidth: 1.5, borderRadius: colors.radius, paddingHorizontal: 16,
      paddingVertical: 14, fontSize: 16, marginBottom: 16,
    },
    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    footer: { paddingHorizontal: 24, paddingVertical: 16, gap: 12 },
    primaryBtn: {
      backgroundColor: colors.primary, borderRadius: colors.radius,
      paddingVertical: 16, alignItems: 'center',
    },
    primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    skipBtn: { alignItems: 'center', paddingVertical: 8 },
    skipText: { color: colors.muted, fontSize: 15 },
    consentBox: {
      backgroundColor: colors.surface, borderRadius: colors.radius,
      padding: 20, marginTop: 8,
    },
    consentText: { fontSize: 15, color: colors.foreground, lineHeight: 24 },
  });

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 32 }}>
              <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <Ionicons name="shield-checkmark" size={40} color="#fff" />
              </View>
              <Text style={[s.stepTitle, { textAlign: 'center', marginTop: 0 }]}>{tr('onboarding', 'welcomeTitle')}</Text>
              <Text style={[s.stepSubtitle, { textAlign: 'center' }]}>{tr('onboarding', 'welcomeSubtitle')}</Text>
            </View>

            <Text style={[s.stepTitle, { fontSize: 20, marginTop: 0, marginBottom: 16 }]}>{tr('onboarding', 'chooseLanguage')}</Text>
            {(['sw', 'en'] as Language[]).map(lang => (
              <TouchableOpacity
                key={lang}
                style={[s.optionCard, {
                  borderColor: language === lang ? colors.primary : colors.border,
                  backgroundColor: language === lang ? colors.primary + '10' : colors.card,
                }]}
                onPress={() => setLanguage(lang)}
              >
                <View style={[s.optionIconBox, { backgroundColor: language === lang ? colors.primary : colors.surface }]}>
                  <Text style={{ fontSize: 24 }}>{lang === 'sw' ? '🇹🇿' : '🇬🇧'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.optionTitle, { color: language === lang ? colors.primary : colors.foreground }]}>
                    {lang === 'sw' ? 'Kiswahili' : 'English'}
                  </Text>
                </View>
                {language === lang && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </>
        );

      case 1:
        return (
          <>
            <Text style={s.stepTitle}>{tr('onboarding', 'whoAreYou')}</Text>
            {(['patient', 'clinician', 'chw', 'admin'] as UserRole[]).map(r => {
              const icons: Record<string, string> = { patient: 'person', clinician: 'medical', chw: 'walk', admin: 'shield' };
              const labels: Record<string, string> = { patient: tr('onboarding', 'patient'), clinician: 'Clinician', chw: 'Community Health Worker', admin: 'Admin' };
              const descs: Record<string, string> = { patient: tr('onboarding', 'patientDesc'), clinician: 'I provide clinical care', chw: 'I support community health', admin: 'I manage the system' };
              return (
                <TouchableOpacity
                  key={r}
                  style={[s.optionCard, {
                    borderColor: role === r ? colors.primary : colors.border,
                    backgroundColor: role === r ? colors.primary + '10' : colors.card,
                  }]}
                  onPress={() => setRole(r)}
                >
                  <View style={[s.optionIconBox, { backgroundColor: role === r ? colors.primary : colors.surface }]}>
                    <Ionicons name={icons[r!] as any} size={24} color={role === r ? '#fff' : colors.muted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.optionTitle, { color: role === r ? colors.primary : colors.foreground }]}>{labels[r!]}</Text>
                    <Text style={[s.optionDesc, { color: colors.muted }]}>{descs[r!]}</Text>
                  </View>
                  {role === r && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </>
        );

      case 2:
        return (
          <>
            <Text style={s.stepTitle}>{tr('onboarding', 'yourName')}</Text>
            <Text style={s.stepSubtitle}>{language === 'sw' ? 'Taarifa zako zinasaidia kututumikia vizuri zaidi' : 'Your info helps us serve you better'}</Text>
            <Text style={[s.inputLabel, { color: colors.foreground }]}>{tr('onboarding', 'yourName')}</Text>
            <TextInput
              style={[s.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.inputBg }]}
              placeholder={tr('onboarding', 'namePlaceholder')}
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <Text style={[s.inputLabel, { color: colors.foreground }]}>{tr('onboarding', 'phoneNumber')}</Text>
            <TextInput
              style={[s.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.inputBg }]}
              placeholder={tr('onboarding', 'phonePlaceholder')}
              placeholderTextColor={colors.muted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </>
        );

      case 3:
        return (
          <>
            <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 24 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.success + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Ionicons name="lock-closed" size={36} color={colors.success} />
              </View>
              <Text style={[s.stepTitle, { textAlign: 'center', marginTop: 0 }]}>{tr('onboarding', 'consentTitle')}</Text>
            </View>
            <View style={s.consentBox}>
              <Text style={s.consentText}>{tr('onboarding', 'consentBody')}</Text>
            </View>
            <View style={{ marginTop: 20, gap: 12 }}>
              {[
                { icon: 'shield-checkmark', text: language === 'sw' ? 'Data imehifadhiwa kwenye kifaa chako' : 'Data stored securely on your device' },
                { icon: 'eye-off', text: language === 'sw' ? 'Haishiriwi bila ruhusa yako' : 'Never shared without your consent' },
                { icon: 'wifi-outline', text: language === 'sw' ? 'Inafanya kazi bila mtandao' : 'Works offline for rural areas' },
              ].map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name={item.icon as any} size={20} color={colors.success} />
                  <Text style={{ color: colors.foreground, fontSize: 15 }}>{item.text}</Text>
                </View>
              ))}
            </View>
          </>
        );
    }
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={back} style={{ opacity: step === 0 ? 0 : 1 }} disabled={step === 0}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={{ color: colors.muted, fontSize: 14 }}>{step + 1} / {STEPS}</Text>
        <TouchableOpacity onPress={finish}>
          <Text style={{ color: colors.muted, fontSize: 14 }}>{tr('onboarding', 'skip')}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.progressRow}>
        {Array.from({ length: STEPS }).map((_, i) => (
          <View key={i} style={[s.progressDot, { backgroundColor: i <= step ? colors.primary : colors.border }]} />
        ))}
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {renderStep()}
        <View style={{ height: 32 }} />
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.primaryBtn} onPress={next}>
          <Text style={s.primaryBtnText}>
            {step === STEPS - 1 ? tr('onboarding', 'agreeAndContinue') : tr('onboarding', 'continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
